/* ==========================================================================
   ACADEMIC ENGINE (GOOGLE SCHOLAR INTEGRATION & TIMELINE RENDERING)
   ========================================================================== */

let citationsChartInstance = null;
let publicationsData = null;

document.addEventListener('DOMContentLoaded', () => {
  // Listen for navigation events to init elements when these sections are visible
  window.addEventListener('navigated', (e) => {
    if (e.detail.page === 'journey' || e.detail.page === 'research') {
      loadAcademicData();
    }
  });

  // Re-draw chart on theme change to match dark/light modes
  window.addEventListener('themechanged', (e) => {
    if (publicationsData && document.getElementById('research').classList.contains('active')) {
      renderCitationsChart(publicationsData.citation_history, e.detail.theme);
    }
  });

  // Load data immediately on load to prevent SPA race conditions
  loadAcademicData();
});

/* --------------------------------------------------------------------------
   1. Fetch and Dispatch Academic Data
   -------------------------------------------------------------------------- */
async function loadAcademicData() {
  const timelineContainer = document.getElementById('education-timeline');
  const publicationsContainer = document.getElementById('publications-container');
  const collaboratorsContainer = document.getElementById('collaborators-container');

  // Prevent duplicate fetches if already loaded, but make sure chart draws when navigated
  if (publicationsData) {
    if (document.getElementById('research').classList.contains('active')) {
      const activeTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      renderCitationsChart(publicationsData.citation_history, activeTheme);
    }
    return;
  }

  try {
    const response = await fetch('data/publications.json');
    if (!response.ok) throw new Error('Failed to load academic records');
    
    publicationsData = await response.json();
    
    // 1. Populate Metrics Badges
    populateMetrics(publicationsData.profile);

    // 2. Render Citations Graph (only if active & canvas is visible)
    if (document.getElementById('research').classList.contains('active')) {
      const activeTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      renderCitationsChart(publicationsData.citation_history, activeTheme);
    }

    // 3. Render Academic Education Timeline
    renderTimeline(publicationsData.degrees, timelineContainer);

    // 4. Render Papers list
    renderPublications(publicationsData.publications, publicationsContainer);

    // 5. Render Collaborators Cards
    renderCollaborators(publicationsData.collaborators, collaboratorsContainer);

  } catch (error) {
    console.error('Academic data fetch error:', error);
    if (timelineContainer) {
      timelineContainer.innerHTML = `<div class="card"><p style="color: #ef4444">Failed to load academic data. Please check connection.</p></div>`;
    }
  }
}

/* --------------------------------------------------------------------------
   2. Populate Dashboard Metrics
   -------------------------------------------------------------------------- */
function populateMetrics(profile) {
  const citElement = document.getElementById('scholar-citations');
  const hElement = document.getElementById('scholar-hindex');
  const iElement = document.getElementById('scholar-i10index');

  if (citElement && profile.citations) animateMetric(citElement, profile.citations);
  if (hElement && profile.h_index) animateMetric(hElement, profile.h_index);
  if (iElement && profile.i10_index) animateMetric(iElement, profile.i10_index);
}

function animateMetric(element, targetValue) {
  let start = 0;
  const duration = 1000;
  const increment = Math.ceil(targetValue / (duration / 20));
  
  const timer = setInterval(() => {
    start += increment;
    if (start >= targetValue) {
      element.textContent = targetValue;
      clearInterval(timer);
    } else {
      element.textContent = start;
    }
  }, 20);
}

/* --------------------------------------------------------------------------
   3. Render Timeline
   -------------------------------------------------------------------------- */
function renderTimeline(degrees, container) {
  if (!container) return;
  container.innerHTML = '';

  degrees.forEach(item => {
    const timelineItem = document.createElement('div');
    timelineItem.className = 'timeline-item';
    timelineItem.innerHTML = `
      <div class="timeline-date">${item.period}</div>
      <h4 class="timeline-degree">${item.degree}</h4>
      <div class="timeline-institution">${item.institution}</div>
      <p class="timeline-desc">${item.description}</p>
    `;
    container.appendChild(timelineItem);
  });
}

/* --------------------------------------------------------------------------
   4. Render Publications
   -------------------------------------------------------------------------- */
function renderPublications(publications, container) {
  if (!container) return;
  container.innerHTML = '';

  publications.forEach(pub => {
    const pubCard = document.createElement('div');
    pubCard.className = 'card pub-card';
    pubCard.innerHTML = `
      <h4 class="pub-title">${pub.title}</h4>
      <div class="pub-authors">${pub.authors}</div>
      <div class="pub-venue">${pub.venue}, ${pub.year}</div>
      <div class="pub-meta">
        <span class="pub-citation-count">Cited by ${pub.citations}</span>
        <a href="${pub.link}" target="_blank" rel="noopener noreferrer" class="pub-link">
          Source DOI <i data-lucide="external-link"></i>
        </a>
      </div>
    `;
    container.appendChild(pubCard);
  });

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

/* --------------------------------------------------------------------------
   5. Render Collaborators
   -------------------------------------------------------------------------- */
function renderCollaborators(collaborators, container) {
  if (!container) return;
  container.innerHTML = '';

  collaborators.forEach(collab => {
    const collabCard = document.createElement('a');
    collabCard.className = 'card collab-card';
    collabCard.href = collab.link;
    collabCard.target = '_blank';
    collabCard.rel = 'noopener noreferrer';
    collabCard.innerHTML = `
      <div class="collab-name">${collab.name}</div>
      <div class="collab-role">${collab.role}</div>
      <div class="collab-aff">${collab.affiliation}</div>
    `;
    container.appendChild(collabCard);
  });
}

/* --------------------------------------------------------------------------
   6. Render Citation Chart (Chart.js)
   -------------------------------------------------------------------------- */
function renderCitationsChart(history, theme) {
  const canvas = document.getElementById('citations-chart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Destroy previous chart to avoid rendering overlap
  if (citationsChartInstance) {
    citationsChartInstance.destroy();
  }

  const years = Object.keys(history);
  const counts = Object.values(history);

  // Theme-sensitive aesthetic styles
  const isDark = theme === 'dark';
  const strokeColor = isDark ? '#00e5ff' : '#0284c7'; // cyan vs sea blue
  const fontColor = isDark ? '#cbd5e1' : '#334155'; // light vs slate text
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
  
  // Create beautiful gradient under the line
  const gradientFill = ctx.createLinearGradient(0, 0, 0, 200);
  if (isDark) {
    gradientFill.addColorStop(0, 'rgba(0, 229, 255, 0.25)');
    gradientFill.addColorStop(1, 'rgba(0, 229, 255, 0)');
  } else {
    gradientFill.addColorStop(0, 'rgba(2, 132, 199, 0.2)');
    gradientFill.addColorStop(1, 'rgba(2, 132, 199, 0)');
  }

  // Draw chart
  citationsChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: years,
      datasets: [{
        label: 'Citations',
        data: counts,
        borderColor: strokeColor,
        borderWidth: 3,
        pointBackgroundColor: strokeColor,
        pointBorderColor: isDark ? '#0f172a' : '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        fill: true,
        backgroundColor: gradientFill,
        tension: 0.35
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          titleColor: isDark ? '#f8fafc' : '#0f172a',
          bodyColor: isDark ? '#cbd5e1' : '#334155',
          borderColor: isDark ? '#334155' : '#e2e8f0',
          borderWidth: 1,
          padding: 10,
          displayColors: false,
          callbacks: {
            label: function(context) {
              return ` Citations: ${context.parsed.y}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: fontColor,
            font: {
              family: "'Inter', sans-serif",
              size: 11,
              weight: '500'
            }
          }
        },
        y: {
          grid: {
            color: gridColor,
            drawBorder: false
          },
          ticks: {
            color: fontColor,
            font: {
              family: "'Inter', sans-serif",
              size: 11
            },
            stepSize: 20
          }
        }
      }
    }
  });
}
