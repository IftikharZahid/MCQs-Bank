// Academic Question Bank - Clean Service Worker Deactivation
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.registration.unregister().catch(() => {})
  );
});
