const CACHE_NAME = 'EEEGPT-cache-v7';

const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './assets/eeegptcover.webp',
  './assets/profile.webp',
  './assets/icon.webp',
  './assets/android-icon.webp'
];

/* ================= INSTALL ================= */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

/* ================= ACTIVATE ================= */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

/* ================= FETCH ================= */
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || request.url.includes('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request, { cache: 'no-cache' })
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  event.respondWith(
    fetch(request, { cache: 'no-cache' })
      .then(response => {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

/* ================= PUSH NOTIFICATION & APP BADGE ================= */
self.addEventListener('push', event => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'EEEGPT Audit Alert', body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'EEEGPT Audit Alert';
  const options = {
    body: data.body || 'An audit report requires your attention.',
    icon: './assets/icon.webp',
    badge: './assets/android-icon.webp',
    tag: 'eeegpt-audit-alert',
    renotify: true,
    data: { url: data.url || './index.html#audit-reminder' }
  };

  const tasks = [self.registration.showNotification(title, options)];

  if (self.navigator && typeof self.navigator.setAppBadge === 'function') {
    const count = Number(data.count || 0);
    tasks.push(count > 0 ? self.navigator.setAppBadge(count) : self.navigator.clearAppBadge());
  }

  event.waitUntil(Promise.all(tasks));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || './index.html#audit-reminder';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if ('focus' in client) {
          if ('navigate' in client) client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});