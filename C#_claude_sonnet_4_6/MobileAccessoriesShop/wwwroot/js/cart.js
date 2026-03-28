// ── Cart AJAX helpers ──────────────────────────────────────────────

function getAntiForgeryToken() {
    return document.querySelector('input[name="__RequestVerificationToken"]')?.value ?? '';
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span style="font-size:20px;">${type === 'success' ? '✅' : '❌'}</span>
        <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

function animateCartAdd(button) {
    button.classList.add('adding');
    const original = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check"></i> Added!';
    setTimeout(() => {
        button.innerHTML = original;
        button.classList.remove('adding');
    }, 1200);
    refreshCartCount();
}

async function refreshCartCount() {
    try {
        const res = await fetch('/Cart/Count');
        if (res.ok) {
            const data = await res.json();
            const badge = document.getElementById('cart-count');
            if (badge) {
                badge.textContent = data.count;
                badge.style.animation = 'none';
                void badge.offsetWidth; // reflow
                badge.style.animation = 'pop 0.3s ease';
            }
        }
    } catch (e) { /* silent */ }
}

// Intercept all add-to-cart form submits for AJAX
document.addEventListener('DOMContentLoaded', () => {
    // Update cart count on load
    refreshCartCount();

    document.querySelectorAll('form[action*="/Cart/Add"]').forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const productId = form.querySelector('input[name="productId"]')?.value;
            const quantity = form.querySelector('input[name="quantity"]')?.value ?? 1;

            try {
                const fd = new FormData(form);
                const res = await fetch(form.action, {
                    method: 'POST',
                    headers: { 'X-Requested-With': 'XMLHttpRequest' },
                    body: fd
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        if (btn) animateCartAdd(btn);
                        const badge = document.getElementById('cart-count');
                        if (badge) {
                            badge.textContent = data.count;
                            badge.style.animation = 'none';
                            void badge.offsetWidth;
                            badge.style.animation = 'pop 0.3s ease';
                        }
                        showToast('Item added to cart!');
                    }
                }
            } catch (err) {
                // Fallback to normal form submit
                form.submit();
            }
        });
    });
});
