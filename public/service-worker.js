/// <reference lib="webworker" />

const CACHE_NAME = 'grand-rapids-map-cache-v1';
const CACHE_URLS = [
  '/offline.html',
  // Valid Grand Rapids area tiles (z12)
  'https://tile.openstreetmap.org/12/1171/1515.png',
  'https://tile.openstreetmap.org/12/1172/1515.png',
  'https://tile.openstreetmap.org/12/1171/1516.png',
  'https://tile.openstreetmap.org/12/1172/1516.png',
  'https://tile.openstreetmap.org/12/1170/1515.png',
  'https://tile.openstreetmap.org/12/1170/1516.png',
  'https://tile.openstreetmap.org/12/1171/1517.png',
  'https://tile.openstreetmap.org/12/1172/1517.png',
  'https://tile.openstreetmap.org/12/1173/1515.png',
  'https://tile.openstreetmap.org/12/1173/1516.png'
];

const OSM_HEADERS = {
  headers: new Headers({
    'User-Agent': 'Grand Rapids Resource Navigator (contact@grandrapidsnavigator.com)',
    'Referer': 'https://grandrapidsnavigator.com/'
  })
};

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CACHE_URLS);
    })
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  if (url.hostname === 'tile.openstreetmap.org') {
    event.respondWith((async () => {
      const cached = await caches.match(event.request.url);
      
      if (cached) {
        const cacheDate = new Date(cached.headers.get('sw-cached-date') || 0);
        if (Date.now() - cacheDate.getTime() < 604800000) {
          return cached;
        }
      }

      try {
        const request = new Request(url, OSM_HEADERS);
        const networkResponse = await fetch(request);
        const cache = await caches.open(CACHE_NAME);
        const clone = networkResponse.clone();
        
        await cache.put(
          event.request.url,
          new Response(clone.body, {
            status: networkResponse.status,
            headers: Object.fromEntries(
              [...networkResponse.headers.entries()]
            )
          })
        );

        return networkResponse;
      } catch (error) {
        console.error('Error fetching tile:', error);
        return cached || new Response('Offline', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
    })());
  } else {
    event.respondWith((async () => {
      const cached = await caches.match(event.request.url);
      return cached || fetch(event.request);
    })());
  }
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName.startsWith('grand-rapids-map-cache') && 
                 cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
});
