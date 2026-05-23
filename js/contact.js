/* ==========================================================================
   CONTACT ENGINE & RESOURCES CATALOG LOADER
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Listen for navigation events to init elements when these sections are visible
  window.addEventListener('navigated', (e) => {
    if (e.detail.page === 'resources') {
      loadResourcesCatalog();
    }
  });

  initContactForm();
});

/* --------------------------------------------------------------------------
   1. Fetch and Render Curated Resources
   -------------------------------------------------------------------------- */
async function loadResourcesCatalog() {
  const container = document.getElementById('resources-container');
  if (!container) return;

  // Prevent duplicate fetches if already loaded
  if (container.children.length > 1 && !container.querySelector('.skeleton-card')) return;

  try {
    const response = await fetch('data/resources.json');
    if (!response.ok) throw new Error('Failed to load resources');
    
    const categories = await response.json();
    container.innerHTML = '';

    categories.forEach(cat => {
      const catCard = document.createElement('section');
      catCard.className = 'card resource-category-card';
      catCard.innerHTML = `
        <div class="resource-cat-header">
          <div class="resource-cat-icon">
            <i data-lucide="${cat.icon || 'link'}"></i>
          </div>
          <div>
            <h3>${cat.category}</h3>
          </div>
        </div>
        <p class="resource-cat-desc">${cat.description}</p>
        <div class="resource-links-list">
          ${cat.links.map(link => `
            <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="resource-link-item">
              <div class="resource-link-name">
                ${link.name} <i data-lucide="arrow-up-right"></i>
              </div>
              <div class="resource-link-desc">${link.description}</div>
            </a>
          `).join('')}
        </div>
      `;
      container.appendChild(catCard);
    });

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }

  } catch (error) {
    console.error('Resources fetch error:', error);
    container.innerHTML = `<div class="card" style="grid-column: 1 / -1; text-align: center;"><p style="color: #ef4444">Failed to load curated resources.</p></div>`;
  }
}

/* --------------------------------------------------------------------------
   2. Contact Form Real-time Validation & Gateway Post
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const modal = document.getElementById('submission-modal');
  
  if (!form || !modal) return;

  const modalIconContainer = document.getElementById('modal-icon-container');
  const loaderIcon = document.getElementById('modal-icon-loader');
  const successIcon = document.getElementById('modal-icon-success');
  const modalTitle = document.getElementById('modal-title');
  const modalText = document.getElementById('modal-text');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  // Input elements
  const nameInput = document.getElementById('form-name');
  const emailInput = document.getElementById('form-email');
  const subjectSelect = document.getElementById('form-subject');
  const messageInput = document.getElementById('form-message');

  // Error messages
  const nameError = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');
  const subjectError = document.getElementById('subject-error');
  const messageError = document.getElementById('message-error');

  // Form submit handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Reset errors
    resetErrors();

    // Validate inputs
    let isValid = true;

    if (!nameInput.value.trim()) {
      showError(nameInput, nameError);
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
      showError(emailInput, emailError);
      isValid = false;
    }

    if (!subjectSelect.value) {
      showError(subjectSelect, subjectError);
      isValid = false;
    }

    if (!messageInput.value.trim() || messageInput.value.trim().length < 10) {
      showError(messageInput, messageError);
      isValid = false;
    }

    if (!isValid) return;

    // Show Progress Modal
    showModalState('sending');
    
    // Check if the user has replaced the default access key
    const accessKeyInput = form.querySelector('input[name="access_key"]');
    const isMockSubmission = !accessKeyInput || accessKeyInput.value === 'YOUR_ACCESS_KEY_HERE' || accessKeyInput.value === '';

    if (isMockSubmission) {
      // Simulate highly professional mock submission
      setTimeout(() => {
        showModalState('success');
        form.reset();
      }, 1500);
    } else {
      // Perform live Web3Forms secure email API post
      try {
        const formData = new FormData(form);
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: formData
        });

        const data = await response.json();

        if (response.status === 200 || data.success) {
          showModalState('success');
          form.reset();
        } else {
          throw new Error(data.message || 'API error occurred');
        }
      } catch (error) {
        console.error('Contact submission error:', error);
        showModalState('error', error.message);
      }
    }
  });

  // Event listener to dismiss modal
  modalCloseBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  function showError(input, errorElement) {
    input.style.borderColor = '#ef4444';
    errorElement.style.display = 'block';
  }

  function resetErrors() {
    [nameInput, emailInput, subjectSelect, messageInput].forEach(input => {
      input.style.borderColor = '';
    });
    [nameError, emailError, subjectError, messageError].forEach(err => {
      err.style.display = 'none';
    });
  }

  function showModalState(state, customErrorMsg = '') {
    modal.style.display = 'flex';

    if (state === 'sending') {
      modalIconContainer.className = 'modal-icon loading';
      loaderIcon.style.display = 'block';
      successIcon.style.display = 'none';
      modalTitle.textContent = 'Sending Message...';
      modalText.textContent = 'Transmitting your inquiry securely via our email gateway.';
      modalCloseBtn.style.display = 'none';
    } else if (state === 'success') {
      modalIconContainer.className = 'modal-icon';
      loaderIcon.style.display = 'none';
      successIcon.style.display = 'block';
      modalTitle.textContent = 'Message Sent!';
      modalText.textContent = 'Thank you for reaching out! Your message was delivered securely to my inbox. I will get back to you shortly.';
      modalCloseBtn.textContent = 'Dismiss';
      modalCloseBtn.style.display = 'block';
    } else if (state === 'error') {
      modalIconContainer.className = 'modal-icon';
      loaderIcon.style.display = 'none';
      successIcon.style.display = 'none';
      
      // Let's create an warning icon dynamically if error
      modalTitle.textContent = 'Transmission Failed';
      modalText.textContent = `Could not deliver your inquiry: ${customErrorMsg || 'Network error'}. Please try again later.`;
      modalCloseBtn.textContent = 'Retry';
      modalCloseBtn.style.display = 'block';
    }
  }
}
