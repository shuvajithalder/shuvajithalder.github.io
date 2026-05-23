/* ==========================================================================
   PHOTOGRAPHY ENGINE (DYNAMIC GALLERY GRID & KEYBOARD-BOUND LIGHTBOX)
   ========================================================================== */

let photos = [];
let filteredPhotos = [];
let currentPhotoIndex = 0;
let activeCategoryFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
  // Listen for navigation events to init elements when the photography section is visible
  window.addEventListener('navigated', (e) => {
    if (e.detail.page === 'photography') {
      loadPhotographyGallery();
    }
  });

  initPhotoFilters();
  initLightbox();
});

/* --------------------------------------------------------------------------
   1. Fetch and Parse Photography Database
   -------------------------------------------------------------------------- */
async function loadPhotographyGallery() {
  const container = document.getElementById('gallery-container');
  if (!container) return;

  // Prevent duplicate fetches if already loaded
  if (photos.length > 0) return;

  try {
    const response = await fetch('data/photos.json');
    if (!response.ok) throw new Error('Failed to load photos list');
    
    photos = await response.json();
    filteredPhotos = [...photos];
    renderGallery();
  } catch (error) {
    console.error('Gallery fetching error:', error);
    container.innerHTML = `<div class="card" style="grid-column: 1 / -1; text-align: center;"><p style="color: #ef4444">Failed to load photography assets. Please check connections.</p></div>`;
  }
}

/* --------------------------------------------------------------------------
   2. Render Photo Grid
   -------------------------------------------------------------------------- */
function renderGallery() {
  const container = document.getElementById('gallery-container');
  if (!container) return;

  filteredPhotos = photos.filter(p => {
    return activeCategoryFilter === 'all' || p.category.toLowerCase() === activeCategoryFilter.toLowerCase();
  });

  if (filteredPhotos.length === 0) {
    container.innerHTML = `<div class="card" style="grid-column: 1 / -1; text-align: center; padding: 3rem;"><p>No photographs found in this category.</p></div>`;
    return;
  }

  container.innerHTML = '';

  filteredPhotos.forEach((photo, index) => {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.setAttribute('data-index', index);
    item.innerHTML = `
      <img src="${photo.thumbnail}" onerror="this.onerror=null; this.src='${photo.fallback_thumb}';" alt="${photo.title}" class="gallery-img" loading="lazy">
      <div class="gallery-overlay">
        <h3 class="gallery-photo-title">${photo.title}</h3>
        <div class="gallery-photo-meta">
          <span>${photo.location}</span>
          <span>${photo.date}</span>
        </div>
      </div>
    `;

    // Click to launch dynamic Lightbox
    item.addEventListener('click', () => {
      openLightbox(index);
    });

    container.appendChild(item);
  });
}

/* --------------------------------------------------------------------------
   3. Gallery Filters
   -------------------------------------------------------------------------- */
function initPhotoFilters() {
  const filterContainer = document.getElementById('photo-filters');
  if (!filterContainer) return;

  filterContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;

    // Toggle active style
    filterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    activeCategoryFilter = btn.getAttribute('data-filter');
    renderGallery();
  });
}

/* --------------------------------------------------------------------------
   4. Custom Lightbox Engine with Keyboard Bindings
   -------------------------------------------------------------------------- */
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');

  if (!lightbox) return;

  // Close Lightbox Click Event
  closeBtn.addEventListener('click', closeLightbox);

  // Close Lightbox on Backdrop Click
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  // Next / Prev Click Events
  prevBtn.addEventListener('click', showPrevImage);
  nextBtn.addEventListener('click', showNextImage);

  // Keyboard navigation bindings
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;

    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowRight') {
      showNextImage();
    } else if (e.key === 'ArrowLeft') {
      showPrevImage();
    }
  });
}

function openLightbox(index) {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  currentPhotoIndex = index;
  updateLightboxContent();

  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden'; // Lock background scrolling
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  lightbox.classList.remove('active');
  document.body.style.overflow = ''; // Restore background scrolling
}

function showNextImage() {
  currentPhotoIndex = (currentPhotoIndex + 1) % filteredPhotos.length;
  updateLightboxContent();
}

function showPrevImage() {
  currentPhotoIndex = (currentPhotoIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
  updateLightboxContent();
}

function updateLightboxContent() {
  const img = document.getElementById('lightbox-img');
  const title = document.getElementById('lightbox-title');
  const desc = document.getElementById('lightbox-desc');

  if (!img || !title || !desc) return;

  const photo = filteredPhotos[currentPhotoIndex];
  
  // Set skeleton/loading state or load image directly
  img.src = photo.url;
  img.onerror = () => {
    img.onerror = null;
    img.src = photo.fallback_url;
  };
  img.alt = photo.title;
  title.textContent = photo.title;
  desc.textContent = `${photo.description} — Shot in ${photo.location} (${photo.date})`;
}
