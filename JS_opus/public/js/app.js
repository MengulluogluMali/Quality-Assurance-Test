// ============================================
// MobileGear — Client-Side JavaScript
// ============================================

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('mobile-toggle');
  const nav = document.getElementById('navbar-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
      toggle.textContent = nav.classList.contains('open') ? '✕' : '☰';
    });
  }

  // Update cart count on load
  updateCartCount();

  // Fade-in animation on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.product-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(card);
  });
});

// Add to cart (AJAX)
async function addToCart(productId, quantity = 1) {
  try {
    const res = await fetch('/api/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity })
    });

    const data = await res.json();

    if (res.status === 401 || res.redirected) {
      window.location.href = '/auth/login';
      return;
    }

    if (data.success) {
      updateCartBadge(data.count);
      showToast('Added to cart!', 'success');

      // Animate button
      const btn = document.querySelector(`#add-cart-${productId}, #add-cart-detail`);
      if (btn) {
        btn.classList.add('added');
        const span = btn.querySelector('span');
        if (span) span.textContent = '✓ Added!';
        setTimeout(() => {
          btn.classList.remove('added');
          if (span) span.textContent = 'Add to Cart';
        }, 1500);
      }
    } else {
      if (data.message && data.message.includes('not available')) {
        window.location.href = '/auth/login';
      } else {
        showToast(data.message || 'Failed to add', 'error');
      }
    }
  } catch (err) {
    // Likely a redirect to login
    window.location.href = '/auth/login';
  }
}

// Update cart count badge
async function updateCartCount() {
  try {
    const res = await fetch('/api/cart/count');
    const data = await res.json();
    updateCartBadge(data.count);
  } catch (err) {
    // silent fail
  }
}

function updateCartBadge(count) {
  const badge = document.getElementById('cart-count');
  if (badge) {
    badge.textContent = count;
    badge.classList.toggle('empty', count === 0);
  }
}

// Toast notification
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `${type === 'success' ? '✅' : '❌'} ${message}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}
