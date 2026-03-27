// ── Cart Page AJAX ──────────────────────────────────────────────────────────

function updateCartTotal(total, cartCount) {
  const totalEl = document.getElementById('cart-total');
  if (totalEl) totalEl.textContent = total;
  const badge = document.getElementById('cart-count');
  if (badge) {
    badge.textContent = cartCount;
    badge.style.display = cartCount > 0 ? 'flex' : 'none';
  }
}

// ── Quantity Controls ────────────────────────────────────────────────────────
document.addEventListener('click', function (e) {
  const btn = e.target.closest('[data-qty-btn]');
  if (!btn) return;

  const row = btn.closest('[data-item-id]');
  if (!row) return;

  const itemId = row.dataset.itemId;
  const input = row.querySelector('.qty-input');
  let qty = parseInt(input.value) || 1;

  if (btn.dataset.qtyBtn === 'up') qty++;
  else if (btn.dataset.qtyBtn === 'down') qty = Math.max(0, qty - 1);

  input.value = qty;
  updateCartItem(itemId, qty, row);
});

document.addEventListener('change', function (e) {
  if (!e.target.classList.contains('qty-input')) return;
  const row = e.target.closest('[data-item-id]');
  if (!row) return;
  const qty = Math.max(0, parseInt(e.target.value) || 0);
  e.target.value = qty;
  updateCartItem(row.dataset.itemId, qty, row);
});

function updateCartItem(itemId, quantity, row) {
  const fd = new FormData();
  fd.append('item_id', itemId);
  fd.append('quantity', quantity);

  fetch('/cart/update', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        if (quantity === 0) {
          row.remove();
          // Check if cart empty
          const tbody = document.querySelector('#cart-body');
          if (tbody && !tbody.querySelector('[data-item-id]')) {
            location.reload();
          }
        } else {
          const subtotalEl = row.querySelector('[data-subtotal]');
          if (subtotalEl) subtotalEl.textContent = data.subtotal;
        }
        updateCartTotal(data.total, data.cart_count);
      }
    });
}

// ── Remove Item ──────────────────────────────────────────────────────────────
document.addEventListener('click', function (e) {
  const btn = e.target.closest('[data-remove-item]');
  if (!btn) return;

  const row = btn.closest('[data-item-id]');
  const itemId = row ? row.dataset.itemId : btn.dataset.removeItem;
  if (!itemId) return;

  const fd = new FormData();
  fd.append('item_id', itemId);

  fetch('/cart/remove', { method: 'POST', body: fd })
    .then(r => r.json())
    .then(data => {
      if (data.success && row) {
        row.style.animation = 'fade-out 0.25s ease forwards';
        setTimeout(() => {
          row.remove();
          updateCartTotal(data.total, data.cart_count);
          const tbody = document.querySelector('#cart-body');
          if (tbody && !tbody.querySelector('[data-item-id]')) {
            location.reload();
          }
        }, 250);
      }
    });
});

// Fade-out animation for removals
const style = document.createElement('style');
style.textContent = `@keyframes fade-out { to { opacity: 0; transform: translateX(-20px); height: 0; padding: 0; } }`;
document.head.appendChild(style);
