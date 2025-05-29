'use client';

import { useState } from 'react';
import { TRANSPORT_MODES } from '@/lib/routing/transportModes';
import { ClientOnly } from '@/components/map/ClientOnly';

interface RoutingControlsProps {
  resourceLocation: { lat: number; lng: number };
  userLocation: { lat: number; lng: number };
  onClose: () => void;
}

interface RouteResponse {
  features: Array<{
    geometry: {
      coordinates: [number, number][];
    };
  }>;
  summary: {
    duration: number;
    distance: number;
  };
}

export default function RoutingControls({ resourceLocation, userLocation, onClose }: RoutingControlsProps) {
  const [selectedMode, setSelectedMode] = useState<keyof typeof TRANSPORT_MODES>('walk');
  const [routeData, setRouteData] = useState<RouteResponse | null>(null);
  const [showCloseButton, setShowCloseButton] = useState(false);

  const calculateRoute = async () => {
    if (!userLocation?.lat || !userLocation?.lng || !resourceLocation.lat || !resourceLocation.lng) return;

    try {
      const response = await fetch('/api/directions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start: { lat: userLocation.lat, lng: userLocation.lng },
          end: resourceLocation,
          transportMode: selectedMode
        })
      });

      const routeData = await response.json();
      setRouteData(routeData);
    } catch (error) {
      console.error('Error calculating route:', error);
    }
  };

  return (
    <ClientOnly>
      <div className="flex flex-col gap-2 relative">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold mb-2">Choose your Route method</h3>
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {Object.entries(TRANSPORT_MODES).map(([key, mode]) => (
              <button
                key={key}
                onClick={() => setSelectedMode(key as keyof typeof TRANSPORT_MODES)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors min-w-[100px] ${
                  selectedMode === key ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
              >
                <span className="text-sm font-medium">{mode.name}</span>
                {mode.icon}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <button
              onClick={() => {
                calculateRoute();
                setShowCloseButton(true);
              }}
              className="w-full px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              aria-label="Calculate route"
            >
              Calculate Route
            </button>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="w-full px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              >
                Close
              </button>
            )}
          </div>
          {routeData ? (
            <div className="mt-2">
              <p>Duration: {Math.round(routeData.summary.duration / 60)} minutes</p>
              <p>Distance: {Math.round(routeData.summary.distance / 1609.34)} miles</p>
            </div>
          ) : null}
        </div>
      </div>
    </ClientOnly>
  );
}
