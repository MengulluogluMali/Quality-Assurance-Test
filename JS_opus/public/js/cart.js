// ============================================
// Cart Page Interactions (AJAX)
// ============================================

async function updateCartQty(productId, newQuantity) {
  try {
    const res = await fetch('/api/cart/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity: newQuantity })
    });

    const data = await res.json();

    if (data.success) {
      updateCartBadge(data.count);

      if (newQuantity <= 0) {
        // Remove the row
        const row = document.getElementById(`cart-row-${productId}`);
        if (row) {
          row.style.transition = 'opacity 0.3s ease';
          row.style.opacity = '0';
          setTimeout(() => {
            row.remove();
            if (data.items.length === 0) {
              location.reload();
            }
          }, 300);
        }
      } else {
        // Reload to update quantities and subtotals
        location.reload();
      }

      // Update total
      const totalEl = document.getElementById('cart-total');
      if (totalEl) {
        totalEl.textContent = `$${data.total.toFixed(2)}`;
      }
    } else {
      showToast(data.message || 'Update failed', 'error');
    }
  } catch (err) {
    showToast('Something went wrong', 'error');
  }
}

async function removeCartItem(productId) {
  try {
    const res = await fetch('/api/cart/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId })
    });

    const data = await res.json();

    if (data.success) {
      updateCartBadge(data.count);

      const row = document.getElementById(`cart-row-${productId}`);
      if (row) {
        row.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        row.style.opacity = '0';
        row.style.transform = 'translateX(20px)';
        setTimeout(() => {
          row.remove();
          if (data.items.length === 0) {
            location.reload();
          }
        }, 300);
      }

      const totalEl = document.getElementById('cart-total');
      if (totalEl) {
        totalEl.textContent = `$${data.total.toFixed(2)}`;
      }

      showToast('Item removed', 'success');
    } else {
      showToast(data.message || 'Remove failed', 'error');
    }
  } catch (err) {
    showToast('Something went wrong', 'error');
  }
}
