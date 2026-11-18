// Service Worker for PWA Note
// Versioned cache name; increment on updates to invalidate old caches
const CACHE_NAME = 'pwa-note-v3';
// List of assets to pre-cache. Adjust paths as needed.
const ASSETS = [
  './index.html',
  './manifest.json',
  './icon.png',
  './test.wasm',
];

// Install event: cache essential assets
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching assets');
        return cache.addAll(ASSETS);
      })
      .then(() => {
        // Activate this SW immediately without waiting for old pages to close
        return self.skipWaiting();
      })
  );
});

// Activate event: clean up old caches and take control of pages
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME)
          .map((key) => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch event: cache‑first strategy
self.addEventListener('fetch', (event) => {
  // Only handle GET requests (ignore others like POST)
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log('[SW] Serving from cache:', event.request.url);
          return cachedResponse;
        }
        // Fallback to network and optionally cache the result
        return fetch(event.request)
          .then((networkResponse) => {
            // Optionally cache dynamic content here
            return networkResponse;
          });
      })
  );
});
