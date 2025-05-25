'use client';

export function LeafletConfig() {
  // Configure Leaflet icons to use default icons
  const leaflet = require('leaflet');
  const icon = new leaflet.Icon.Default();
  delete (icon as any)._getIconUrl;

  return null;
}
