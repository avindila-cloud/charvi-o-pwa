/**
 * Charvi O PWA Service Worker
 * Cache static assets only (NOT iframe streamlit.app)
 */

const CACHE_NAME = 'charvi-o-pwa-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png',
];

// ===== INSTALL =====
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('[SW] Static assets cached');
                self.skipWaiting();
            })
            .catch((err) => {
                console.warn('[SW] Caching failed:', err);
            })
    );
});

// ===== ACTIVATE =====
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name !== CACHE_NAME)
                        .map((oldCache) => caches.delete(oldCache))
                );
            })
            .then(() => {
                console.log('[SW] Activated and old caches cleaned');
                self.clients.claim();
            })
    );
});

// ===== FETCH =====
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);

    // JANGAN cache iframe streamlit.app
    if (url.hostname === 'charvi-o.streamlit.app') {
        // Untuk iframe, lewati SW, pakai network-first
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Clone response untuk caching
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put('/__pwa_frame_cache__', responseClone);
                        })
                        .catch(() => {
                            // Caching gagal, tetap return network response
                        });
                    return response;
                })
                .catch(() => {
                    // Network gagal, fallback ke cache kecuali untuk streamlit
                    return caches.match(request)
                        .then((cached) => cached || Response.error());
                })
        );
        return;
    }

    // Untuk semua aset statis lainnya
    if (request.method !== 'GET') {
        return;
    }

    // Static assets (HTML, CSS, JS, images, manifest)
    if (request.url.includes('icon-') || request.url.endsWith('.html') || request.url.endsWith('.js') || request.url.endsWith('.css') || request.url.endsWith('.json') || request.url.endsWith('.png')) {
        event.respondWith(
            caches.match(request)
                .then((cached) => {
                    if (cached) {
                        return cached;
                    }
                    return fetch(request)
                        .then((response) => {
                            if (response.ok) {
                                const responseClone = response.clone();
                                caches.open(CACHE_NAME)
                                    .then((cache) => {
                                        cache.put(request, responseClone);
                                    })
                                    .catch(() => {
                                        // Caching gagal, tetap return response
                                    });
                            }
                            return response;
                        })
                        .catch(() => {
                            return caches.match('/index.html');
                        });
                })
        );
        return;
    }

    // Untuk URL lainnya yang bukan iframe/streamlit, fallback ke network
    event.respondWith(
        fetch(request)
            .then((response) => {
                return response;
            })
            .catch(() => {
                return Response.error();
            })
    );
});

// ===== SYNC (optional - background sync untuk form) =====
self.addEventListener('sync', (event) => {
    console.log(`[SW] Sync event: ${event.tag}`);
});

// ===== NOTIFICATION (optional) =====
self.addEventListener('push', (event) => {
    console.log('[SW] Push event');
    // Not implemented yet
});
