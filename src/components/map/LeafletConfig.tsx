'use client';

export function LeafletConfig() {
  // Configure Leaflet icons
  const leaflet = require('leaflet');
  const icon = new leaflet.Icon.Default();
  delete (icon as any)._getIconUrl;
  leaflet.Icon.Default.mergeOptions({
    iconRetinaUrl: '/marker-icon-2x.png',
    iconUrl: '/marker-icon.png',
    shadowUrl: '/marker-shadow.png',
  });

  return null;
}
