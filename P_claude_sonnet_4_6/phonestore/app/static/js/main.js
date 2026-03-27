// ── Toast Notifications ─────────────────────────────────────────────────────
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || '💬'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toast-out 0.35s ease forwards';
    setTimeout(() => toast.remove(), 350);
  }, 3500);
}

// ── Cart Badge Update ────────────────────────────────────────────────────────
function updateCartBadge(count) {
  const badge = document.getElementById('cart-count');
  if (!badge) return;
  badge.textContent = count;
  badge.style.display = count > 0 ? 'flex' : 'none';
  badge.classList.remove('bump');
  void badge.offsetWidth; // reflow
  badge.classList.add('bump');
}

// ── Add to Cart ──────────────────────────────────────────────────────────────
document.addEventListener('click', function (e) {
  const btn = e.target.closest('[data-add-to-cart]');
  if (!btn) return;

  const productId = btn.dataset.productId;
  const quantityInput = document.getElementById(`qty-${productId}`);
  const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;

  const originalContent = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>';

  const formData = new FormData();
  formData.append('product_id', productId);
  formData.append('quantity', quantity);

  fetch('/cart/add', {
    method: 'POST',
    body: formData,
    headers: { 'X-Requested-With': 'XMLHttpRequest' }
  })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        showToast(data.message, 'success');
        updateCartBadge(data.cart_count);
      } else {
        showToast(data.message || 'Failed to add item.', 'error');
      }
    })
    .catch(() => showToast('Something went wrong.', 'error'))
    .finally(() => {
      btn.disabled = false;
      btn.innerHTML = originalContent;
    });
});

// ── Navbar Mobile Toggle ─────────────────────────────────────────────────────
const mobileToggle = document.getElementById('mobile-toggle');
const navbarNav = document.getElementById('navbar-nav');
if (mobileToggle && navbarNav) {
  mobileToggle.addEventListener('click', () => {
    navbarNav.classList.toggle('open');
    mobileToggle.textContent = navbarNav.classList.contains('open') ? '✕' : '☰';
  });
}

// ── Flash message auto dismiss ───────────────────────────────────────────────
document.querySelectorAll('.alert[data-auto-dismiss]').forEach(el => {
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 400); }, 5000);
  el.style.transition = 'opacity 0.4s ease';
});
