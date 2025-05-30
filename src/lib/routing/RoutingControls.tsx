'use client';

import { useState } from 'react';
import { TRANSPORT_MODES } from '@/lib/routing/transportModes';
import { ClientOnly } from '@/components/map/ClientOnly';

interface RoutingControlsProps {
  resourceLocation: { lat: number; lng: number };
  userLocation: { lat: number; lng: number };
  onClose: () => void;
  onRouteCalculated?: (route: { coordinates: [number, number][], color: string, mode: string }) => void;
}

interface RouteResponse {
  features: Array<{
    geometry: {
      coordinates: Array<[number, number] | [[number, number]]>;
    };
  }>;
  summary: {
    duration: number;
    distance: number;
  };
}

export default function RoutingControls({ resourceLocation, userLocation, onClose, onRouteCalculated }: RoutingControlsProps) {
  const [selectedMode, setSelectedMode] = useState<keyof typeof TRANSPORT_MODES>('walk');
  const [routeData, setRouteData] = useState<RouteResponse | null>(null);

  const [error, setError] = useState<string | null>(null);

  const calculateRoute = async () => {
    if (!userLocation?.lat || !userLocation?.lng || !resourceLocation.lat || !resourceLocation.lng) return;

    try {
      const response = await fetch('/api/directions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          start: { lng: userLocation.lng, lat: userLocation.lat },
          end: { lng: resourceLocation.lng, lat: resourceLocation.lat },
          transportMode: selectedMode
        })
      });

      const data = await response.json();
      console.log('API Response:', data);
      console.log('Features:', data.features);
      console.log('First feature:', data.features[0]);
      console.log('Geometry:', data.features[0].geometry);
      console.log('Coordinates:', data.features[0].geometry.coordinates);
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      setRouteData(data);
      setError(null);
      
      // Pass route data to map
      if (onRouteCalculated && data.features && data.features[0]) {
        const coordinates = data.features[0].geometry.coordinates;
        // Ensure coordinates are in [lng, lat] format
        const formattedCoordinates = coordinates.map((coord: [number, number] | [[number, number]]) => {
          console.log('Processing coordinate:', coord);
          console.log('Type of first element:', typeof coord[0]);
          console.log('Value of first element:', coord[0]);
          
          if (Array.isArray(coord[0])) {
            console.log('Nested coordinate:', coord[0]);
            return [coord[0][0], coord[0][1]];
          }
          console.log('Simple coordinate:', coord);
          return [coord[0], coord[1]];
        });
        console.log('Formatted coordinates:', formattedCoordinates);
        onRouteCalculated({ 
          coordinates: formattedCoordinates, 
          color: data.color,
          mode: selectedMode
        });
      }
    } catch (error) {
      console.error('Error calculating route:', error);
      setError(error instanceof Error ? error.message : 'Failed to calculate route');
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
                if (selectedMode === 'bus') {
                  window.open('https://www.the-rapid.org', '_blank');
                  onClose();
                  return;
                }
                if (selectedMode === 'scooter') {
                  window.open('https://www.li.me', '_blank');
                  onClose();
                  return;
                }
                if (selectedMode === 'uber') {
                  window.open('https://www.uber.com', '_blank');
                  onClose();
                  return;
                }
                if (selectedMode === 'lyft') {
                  window.open('https://www.lyft.com', '_blank');
                  onClose();
                  return;
                }
                if (selectedMode === 'mdo') {
                  window.open('https://www.mdorides.com', '_blank');
                  onClose();
                  return;
                }
                calculateRoute();
              }}
              className="w-full px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              aria-label="Calculate route"
            >
              {selectedMode === 'bus' ? 'View Schedule' : 
               selectedMode === 'scooter' ? 'Find Scooters' : 
               selectedMode === 'uber' ? 'Open Uber' : 
               selectedMode === 'lyft' ? 'Open Lyft' : 
               selectedMode === 'mdo' ? 'Open MDO' : 
               'Get Directions'}
            </button>
          </div>
          {error ? (
             <div className="mt-2 text-red-500">
               <p>Error: {error}</p>
             </div>
           ) : routeData?.summary ? (
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
