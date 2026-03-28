// ── Browser Push Notification Setup ───────────────────────────────
// Only runs for logged-in users (injected by _Layout.cshtml)

const VAPID_PUBLIC_KEY = '';  // Will be injected via meta tag if configured

async function registerPush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    try {
        const reg = await navigator.serviceWorker.register('/sw.js');

        const perm = await Notification.requestPermission();
        if (perm !== 'granted') return;

        // Get VAPID key from meta tag if present
        const metaKey = document.querySelector('meta[name="vapid-public-key"]')?.content;
        if (!metaKey) return;

        const sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(metaKey)
        });

        const keys = sub.toJSON().keys;
        await fetch('/Push/Subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                endpoint: sub.endpoint,
                p256dh: keys?.p256dh ?? '',
                auth: keys?.auth ?? ''
            })
        });

        console.log('Push subscription registered');
    } catch (err) {
        console.warn('Push registration failed:', err);
    }
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

// Auto-register
document.addEventListener('DOMContentLoaded', registerPush);
