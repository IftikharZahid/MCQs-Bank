// Academic Question Bank & Examination Portal - Service Worker
const CACHE_NAME = 'mcqs-bank-cache-v2';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[PWA] Precache warning:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 1. Bypass Service Worker completely for API requests and non-GET requests
  if (req.method !== 'GET' || !url.protocol.startsWith('http') || url.pathname.startsWith('/api')) {
    return;
  }

  // 2. Safe Cache-First / Stale-While-Revalidate for static assets
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(req, copy).catch(() => {});
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          if (req.mode === 'navigate') {
            const fallback = await caches.match('/index.html');
            if (fallback) return fallback;
          }
          return new Response('Network unavailable', { status: 503, statusText: 'Offline' });
        });
    })
  );
});
