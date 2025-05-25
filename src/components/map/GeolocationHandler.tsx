'use client';

import { useEffect } from 'react';

interface GeolocationHandlerProps {
  onLocationChange: (location: { lat: number; lng: number }) => void;
}

export default function GeolocationHandler({ onLocationChange }: GeolocationHandlerProps) {
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          onLocationChange({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback to Grand Rapids coordinates
          onLocationChange({ lat: 42.9634, lng: -85.6681 });
        }
      );
    }
  }, [onLocationChange]);

  return null;
}
