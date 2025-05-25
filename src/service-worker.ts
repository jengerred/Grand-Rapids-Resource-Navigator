/// <reference lib="webworker" />

const CACHE_NAME = 'grand-rapids-map-cache-v1';

const OSM_HEADERS = {
  headers: new Headers({
    'User-Agent': 'Grand Rapids Resource Navigator (contact@grandrapidsnavigator.com)',
    'Referer': 'https://grandrapidsnavigator.com/'
  })
};

self.addEventListener('fetch', (event: Event) => {
  const fetchEvent = event as FetchEvent;
  const url = new URL(fetchEvent.request.url);

  fetchEvent.respondWith(
    (async () => {
      if (url.hostname !== 'tile.openstreetmap.org') {
        const cached = await caches.match(fetchEvent.request);
        return cached || fetch(fetchEvent.request);
      }

      const cached = await caches.match(fetchEvent.request.url);
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
      } catch (error: unknown) {
        console.error('Error fetching tile:', error);
        return cached || new Response('Offline', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
    })()
  );
});
