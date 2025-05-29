'use client';

import { useState, useEffect } from 'react';

interface Coordinates {
  lat: number;
  lng: number;
}

export function useUserLocation(hasLocationPermission: boolean) {
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);

  useEffect(() => {
    if (hasLocationPermission) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error('Error getting location:', error);
          setUserLocation(null);
        }
      );
    }
  }, [hasLocationPermission]);

  return { userLocation };
}
