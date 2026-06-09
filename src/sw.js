import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';

precacheAndRoute(self.__WB_MANIFEST || []);
cleanupOutdatedCaches();

// SPA fallback: always serve precached index.html for navigations (avoids 304 empty-body issue)
registerRoute(
  new NavigationRoute(
    createHandlerBoundToURL('/index.html'),
    { denylist: [/^\/api\//, /^\/cable/] }
  )
);

// Push notification received
self.addEventListener('push', event => {
  if (!event.data) return;

  let data;
  try { data = event.data.json(); }
  catch { data = { title: 'Roster Pro', body: event.data.text(), path: '/member' }; }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Roster Pro', {
      body:    data.body || '',
      icon:    '/icon-192.png',
      badge:   '/icon-192.png',
      data:    { path: data.path || '/member' },
      vibrate: [100, 50, 100]
    })
  );
});

// Notification clicked → open/focus app at correct route
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const path = event.notification.data?.path || '/member';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if ('focus' in client) {
          client.navigate(path);
          return client.focus();
        }
      }
      return clients.openWindow(path);
    })
  );
});
