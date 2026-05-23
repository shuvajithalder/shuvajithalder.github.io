/* ==========================================================================
   GLOBAL CONTROLLER (ROUTING, THEME, VISITOR COUNTER, MOBILE NAV)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  } else {
    // Robust fallback: if Lucide JS isn't fully defined yet, execute when window finishes loading
    window.addEventListener('load', () => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    });
  }

  // Modules Initializers
  initTheme();
  initRouter();
  initMobileMenu();
  initVisitorCounter();
});

/* --------------------------------------------------------------------------
   1. Theme Management (Light / Dark Mode Toggle)
   -------------------------------------------------------------------------- */
function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (!themeToggleBtn) return;

  const sunIcon = themeToggleBtn.querySelector('.sun-icon');
  const moonIcon = themeToggleBtn.querySelector('.moon-icon');

  // Check Local Storage or System Settings
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Set default theme
  let currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
  setTheme(currentTheme);

  themeToggleBtn.addEventListener('click', () => {
    const targetTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(targetTheme);
  });

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    // Toggle icons
    if (theme === 'dark') {
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
    } else {
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
    }

    // Dispatch global theme-change event so dynamic graphs (Chart.js) can re-render
    window.dispatchEvent(new CustomEvent('themechanged', { detail: { theme } }));
  }
}

/* --------------------------------------------------------------------------
   2. Hash-based Routing Engine
   -------------------------------------------------------------------------- */
function initRouter() {
  const sections = document.querySelectorAll('.section');
  const navLinks = document.querySelectorAll('.nav-link');
  const logoNav = document.getElementById('logo-nav');

  function handleRoute() {
    let hash = window.location.hash || '#home';
    const targetId = hash.replace('#', '');
    
    let targetSection = document.getElementById(targetId);
    
    // Fallback if target section is missing
    if (!targetSection) {
      hash = '#home';
      targetSection = document.getElementById('home');
    }

    // Hide all sections, show active section
    sections.forEach(sec => sec.classList.remove('active'));
    targetSection.classList.add('active');

    // Update active nav-link state
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === hash) {
        link.classList.add('active');
      }
    });

    // Scroll to top of window smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Dispatches navigation event (useful to load page-specific dynamic data)
    window.dispatchEvent(new CustomEvent('navigated', { detail: { page: targetId } }));
  }

  // Listen for hash changes
  window.addEventListener('hashchange', handleRoute);
  
  // Handle initial page load routing
  handleRoute();

  // Allow clicking logo to redirect to #home
  if (logoNav) {
    logoNav.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.hash = '#home';
    });
  }
}

/* --------------------------------------------------------------------------
   3. Mobile Drawer Navigation Menu
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!menuToggle || !navMenu) return;

  menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    
    // Toggle menu icon state (menu to x)
    const icon = menuToggle.querySelector('i');
    if (navMenu.classList.contains('active')) {
      icon.setAttribute('data-lucide', 'x');
    } else {
      icon.setAttribute('data-lucide', 'menu');
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
  });

  // Automatically close menu when clicking any nav link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        const icon = menuToggle.querySelector('i');
        icon.setAttribute('data-lucide', 'menu');
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
    });
  });
}

/* --------------------------------------------------------------------------
   4. Automatic Visitor Counter Component
   -------------------------------------------------------------------------- */
async function initVisitorCounter() {
  const counterElement = document.getElementById('visitor-counter');
  if (!counterElement) return;

  // Configuration for Live Free Visitor Counter API (scoped namespace + key)
  const namespace = 'shuvajithalder-github-io';
  const key = 'website-visitors';
  const apiEndpoint = `https://api.counterapi.dev/v1/${namespace}/${key}/up`;

  try {
    // Attempt to connect to the live counter api
    const response = await fetch(apiEndpoint);
    if (!response.ok) throw new Error('API request failed');
    
    const data = await response.json();
    if (data && data.value) {
      animateCount(counterElement, data.value);
      return;
    }
  } catch (error) {
    console.warn('Visitor counter API offline or blocked. Falling back to persistent localStorage counter.', error);
  }

  // --- Robust Local Storage Fallback ---
  // Sets a high professional initial base count, increments it once per browser session
  const baseCount = 0; 
  let localVisits = localStorage.getItem('local_visits_count');
  
  if (!localVisits) {
    localVisits = baseCount;
  } else {
    localVisits = parseInt(localVisits, 10);
  }

  // Increment only once per session using sessionStorage flag
  if (!sessionStorage.getItem('session_visited_flag')) {
    localVisits += 1;
    localStorage.setItem('local_visits_count', localVisits);
    sessionStorage.setItem('session_visited_flag', 'true');
  }

  animateCount(counterElement, localVisits);
}

// Micro-animation utility to count up numbers smoothly
function animateCount(element, targetValue) {
  let currentValue = 0;
  const duration = 1200; // Total ms
  const stepTime = Math.max(Math.floor(duration / targetValue), 15);
  const increment = Math.ceil(targetValue / (duration / stepTime));

  const timer = setInterval(() => {
    currentValue += increment;
    if (currentValue >= targetValue) {
      element.textContent = targetValue.toLocaleString();
      clearInterval(timer);
    } else {
      element.textContent = currentValue.toLocaleString();
    }
  }, stepTime);
}
