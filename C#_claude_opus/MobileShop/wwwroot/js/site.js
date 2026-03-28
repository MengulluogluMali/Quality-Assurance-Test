// ===================================================
// MOBILESHOP — Site JavaScript
// ===================================================

// --- Toast Notification System ---
function showToast(title, message, type = 'success', duration = 5000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = {
        success: 'bi-check-circle-fill',
        order: 'bi-cart-check-fill',
        error: 'bi-exclamation-triangle-fill',
        info: 'bi-info-circle-fill'
    };

    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
        <i class="bi ${icons[type] || icons.info} toast-icon"></i>
        <div class="toast-body">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="dismissToast(this)">
            <i class="bi bi-x-lg"></i>
        </button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        dismissToast(toast.querySelector('.toast-close'));
    }, duration);
}

function dismissToast(btn) {
    const toast = btn.closest ? btn.closest('.toast-notification') : btn.parentElement;
    if (!toast) return;
    toast.style.animation = 'slideOutRight 0.3s ease-in forwards';
    setTimeout(() => toast.remove(), 300);
}

// --- Cart Operations (AJAX) ---
async function addToCart(productId, quantity = 1) {
    try {
        const response = await fetch('/Cart/AddToCart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'RequestVerificationToken': getAntiForgeryToken()
            },
            body: JSON.stringify({ productId, quantity })
        });

        const data = await response.json();

        if (data.success) {
            showToast('Added to Cart', data.message, 'success');
            updateCartBadge(data.cartCount);
        } else {
            showToast('Error', data.message, 'error');
        }

        return data;
    } catch (error) {
        showToast('Error', 'Failed to add to cart. Please try again.', 'error');
        console.error('Add to cart error:', error);
    }
}

async function removeFromCart(cartItemId) {
    try {
        const response = await fetch('/Cart/RemoveFromCart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'RequestVerificationToken': getAntiForgeryToken()
            },
            body: JSON.stringify({ cartItemId })
        });

        const data = await response.json();

        if (data.success) {
            showToast('Removed', 'Item removed from cart', 'info');
            refreshCartUI(data.cart);
        }

        return data;
    } catch (error) {
        showToast('Error', 'Failed to remove item.', 'error');
        console.error('Remove from cart error:', error);
    }
}

async function updateQuantity(cartItemId, quantity) {
    try {
        const response = await fetch('/Cart/UpdateQuantity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'RequestVerificationToken': getAntiForgeryToken()
            },
            body: JSON.stringify({ cartItemId, quantity })
        });

        const data = await response.json();

        if (data.success) {
            refreshCartUI(data.cart);
        } else {
            showToast('Error', data.message, 'error');
        }

        return data;
    } catch (error) {
        showToast('Error', 'Failed to update quantity.', 'error');
        console.error('Update quantity error:', error);
    }
}

function refreshCartUI(cart) {
    if (!cart) return;

    // Update badge
    updateCartBadge(cart.itemCount);

    // Update subtotal, tax, total
    const subtotalEl = document.getElementById('cart-subtotal');
    const taxEl = document.getElementById('cart-tax');
    const totalEl = document.getElementById('cart-total');

    if (subtotalEl) subtotalEl.textContent = '$' + cart.subtotal.toFixed(2);
    if (taxEl) taxEl.textContent = '$' + cart.tax.toFixed(2);
    if (totalEl) totalEl.textContent = '$' + cart.total.toFixed(2);

    // Remove cart items that no longer exist
    const cartItemRows = document.querySelectorAll('.cart-item-row');
    cartItemRows.forEach(row => {
        const itemId = parseInt(row.dataset.cartItemId);
        const cartItem = cart.items.find(i => i.cartItemId === itemId);
        if (!cartItem) {
            row.style.animation = 'fadeOut 0.3s ease-out forwards';
            setTimeout(() => row.remove(), 300);
        } else {
            // Update line total
            const lineTotalEl = row.querySelector('.cart-item-line-total');
            if (lineTotalEl) lineTotalEl.textContent = '$' + cartItem.lineTotal.toFixed(2);

            // Update quantity input
            const qtyInput = row.querySelector('.qty-input');
            if (qtyInput) qtyInput.value = cartItem.quantity;
        }
    });

    // Show empty state if no items
    if (cart.items.length === 0) {
        const cartContent = document.getElementById('cart-content');
        if (cartContent) {
            cartContent.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon"><i class="bi bi-cart-x"></i></div>
                    <h3 class="empty-state-title">Your cart is empty</h3>
                    <p class="empty-state-desc">Start adding some amazing accessories to your cart!</p>
                    <a href="/Products" class="btn btn-glow">Browse Products</a>
                </div>
            `;
        }
    }
}

// --- Cart Badge ---
async function updateCartBadge(count) {
    const badge = document.getElementById('cart-badge');
    if (!badge) return;

    if (count !== undefined) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
        return;
    }

    try {
        const response = await fetch('/Cart/GetCartCount');
        const data = await response.json();
        badge.textContent = data.count;
        badge.style.display = data.count > 0 ? 'flex' : 'none';
    } catch (error) {
        console.error('Failed to get cart count:', error);
    }
}

// --- Anti-forgery Token ---
function getAntiForgeryToken() {
    const tokenInput = document.querySelector('input[name="__RequestVerificationToken"]');
    return tokenInput ? tokenInput.value : '';
}

// --- SignalR Notifications ---
let notificationCount = 0;

function initSignalR() {
    const connection = new signalR.HubConnectionBuilder()
        .withUrl('/notificationHub')
        .withAutomaticReconnect()
        .build();

    connection.on('ReceiveOrderNotification', (data) => {
        notificationCount++;
        const badge = document.getElementById('notification-badge');
        if (badge) {
            badge.textContent = notificationCount;
            badge.style.display = 'flex';
        }

        showToast(
            '🛒 New Order!',
            `Order #${data.orderId} — $${data.amount} from ${data.customerName}`,
            'order',
            8000
        );

        // Play notification sound (optional)
        try {
            const audio = new Audio('data:audio/wav;base64,UklGRl9vT19teleVmF0YQAAAAEAQQAXAAAAEAQQAAAAAAAAEA');
        } catch (e) { }
    });

    connection.start()
        .then(() => console.log('SignalR connected'))
        .catch(err => console.error('SignalR connection error:', err));
}

// --- Navbar Scroll Effect ---
window.addEventListener('scroll', () => {
    const nav = document.getElementById('mainNav');
    if (nav) {
        nav.classList.toggle('scrolled', window.scrollY > 50);
    }
});

// --- Stagger Animation for Grid Items ---
document.addEventListener('DOMContentLoaded', () => {
    const items = document.querySelectorAll('.stagger-item');
    items.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.08}s`;
    });
});

// --- Auto-dismiss alerts after 5s ---
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.alert-custom').forEach(alert => {
        setTimeout(() => {
            alert.style.animation = 'fadeOut 0.3s ease-out forwards';
            setTimeout(() => alert.remove(), 300);
        }, 5000);
    });
});

// Add fadeOut keyframe dynamically
const style = document.createElement('style');
style.textContent = `@keyframes fadeOut { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-10px); } }`;
document.head.appendChild(style);
