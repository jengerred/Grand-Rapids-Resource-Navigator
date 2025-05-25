'use client';

import { useEffect } from 'react';

export function LeafletConfig() {
  // Wait for Leaflet to be loaded
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('leaflet').then((leaflet) => {
        // Configure Leaflet icons
        leaflet.default.Icon.Default.mergeOptions({
          iconRetinaUrl: '/leaflet/marker-icon-2x.png',
          iconUrl: '/leaflet/marker-icon.png',
          shadowUrl: '/leaflet/marker-shadow.png'
        });
      });
    }
  }, []);

  return null;
}
