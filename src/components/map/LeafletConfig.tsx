'use client';

import { useEffect } from 'react';

let leafletInstance: typeof import('leaflet');

export function LeafletConfig() {
  // Wait for Leaflet to be loaded
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('leaflet').then((leaflet) => {
        leafletInstance = leaflet.default;
        // Configure Leaflet icons
        leafletInstance.Icon.Default.mergeOptions({
          iconRetinaUrl: '/leaflet/marker-icon-2x.png',
          iconUrl: '/leaflet/marker-icon.png',
          shadowUrl: '/leaflet/marker-shadow.png'
        });
      });
    }
  }, []);

  return null;
}

export { leafletInstance as L };