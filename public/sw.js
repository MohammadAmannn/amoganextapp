// ── Offline-first Service Worker ──────────────────────────────────────
// Caches the app shell on install, then for every navigation request:
//   - if online  → network first (and update the cache)
//   - if offline → serve /offline.html (our custom doodle page)

const CACHE_NAME = 'amoga-shell-v1'

// Pages / assets to pre-cache so the offline page is always available
const PRE_CACHE = ['/offline.html']

// ── Install ────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRE_CACHE))
  )
  // Activate immediately, don't wait for old SW to be discarded
  self.skipWaiting()
})

// ── Activate ───────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

// ── Fetch ──────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Never intercept API routes, auth callbacks, or Next.js internals
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/auth/') ||
    url.pathname.startsWith('/_next/')
  ) {
    return
  }

  // Only intercept same-origin GET navigation requests (page loads)
  if (
    request.method !== 'GET' ||
    request.headers.get('accept')?.includes('text/html') === false
  ) {
    return
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful navigation responses
        if (response && response.status === 200) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        }
        return response
      })
      .catch(() => {
        // Network failed → return cached page or our offline fallback
        return caches.match(request).then(
          (cached) => cached || caches.match('/offline.html')
        )
      })
  )
})
