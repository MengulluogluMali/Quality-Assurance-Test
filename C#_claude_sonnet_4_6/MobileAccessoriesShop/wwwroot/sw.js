// Service Worker for MobileShop push notifications
self.addEventListener('push', event => {
    let data = {};
    try { data = event.data?.json() ?? {}; } catch {}

    const title = data.title ?? 'MobileShop';
    const options = {
        body: data.body ?? data.message ?? '',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        data: { url: data.url ?? '/' }
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    const url = event.notification.data?.url ?? '/';
    event.waitUntil(clients.openWindow(url));
});
