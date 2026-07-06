/**
 * NaijaTriageHub Service Worker
 * -------------------------------------------------------------
 * Strategy: Cache-First, fallback to Network.
 *
 * - App shell (HTML/CSS/JS chunks, icons, manifest) is precached on
 *   install and then served straight from cache on every load.
 * - Any `/locales/*.json` language pack is cached the FIRST time a
 *   user selects it (while online). After that, it is available
 *   forever offline, even after the phone restarts or the app is
 *   reopened with zero signal.
 * - Bump CACHE_VERSION whenever you ship a new build so stale
 *   assets get cleared out.
 */

const CACHE_VERSION = 'v1';
const APP_CACHE = `naijatriagehub-app-${CACHE_VERSION}`;
const LOCALE_CACHE = `naijatriagehub-locales-${CACHE_VERSION}`;

// Minimal, safe-to-guess set of paths to precache on install.
// Next static export hashes its JS/CSS chunk filenames at build time,
// so we don't try to guess those here - they get cached opportunistically
// the first time they're requested (see the fetch handler below).
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-192.png',
  '/icons/icon-maskable-512.png',
  '/icons/apple-touch-icon.png',
  '/icons/apple-touch-icon-152.png',
  '/icons/apple-touch-icon-167.png',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(APP_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS).catch(() => {
        // Ignore individual failures (e.g. missing favicon in dev)
        // so install never hard-fails.
      }))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== APP_CACHE && key !== LOCALE_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

function isLocaleRequest(url) {
  return url.pathname.startsWith('/locales/') && url.pathname.endsWith('.json');
}

function isSameOrigin(url) {
  return url.origin === self.location.origin;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests; let everything else pass through untouched.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (!isSameOrigin(url)) return;

  // ---- Language packs: cache-first, and PERSIST once fetched online ----
  if (isLocaleRequest(url)) {
    event.respondWith(
      caches.open(LOCALE_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;

        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200) {
            // Save a copy forever - this is what makes the selected
            // language available with zero bandwidth from now on.
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (err) {
          // Truly offline and never cached this language before.
          return new Response(
            JSON.stringify({ error: 'offline', message: 'Language pack unavailable offline.' }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
          );
        }
      })
    );
    return;
  }

  // ---- Everything else (HTML shell, JS/CSS chunks, icons): cache-first ----
  event.respondWith(
    caches.open(APP_CACHE).then(async (cache) => {
      const cached = await cache.match(request, { ignoreSearch: true });
      if (cached) return cached;

      try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      } catch (err) {
        // Offline and never cached this asset. For page navigations,
        // fall back to the cached app shell so the UI still loads.
        if (request.mode === 'navigate') {
          const shell = await cache.match('/');
          if (shell) return shell;
        }
        return new Response('Offline - asset not cached yet.', {
          status: 503,
          statusText: 'Offline',
        });
      }
    })
  );
});