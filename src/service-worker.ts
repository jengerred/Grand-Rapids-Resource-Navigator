/// <reference lib="webworker" />

const CACHE_NAME = 'grand-rapids-map-cache-v1';
const CACHE_URLS: string[] = [
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

self.addEventListener('fetch', (event: any) => {
  const fetchEvent = event as FetchEvent;
  const url = new URL(fetchEvent.request.url);

  if (url.hostname === 'tile.openstreetmap.org') {
    event.respondWith((async (): Promise<Response> => {
      const cached = await caches.match(event.request.url);
      
      // Type-safe cache check
      if (cached instanceof Response) {
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
          fetchEvent.request.url,
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
    event.respondWith((async (): Promise<Response> => {
      const cached = await caches.match(event.request.url);
      return cached || fetch(fetchEvent.request);
    })());
  }
});
