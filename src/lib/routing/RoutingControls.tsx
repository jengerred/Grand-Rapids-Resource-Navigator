'use client';

import { useState, useEffect } from 'react';
import { TRANSPORT_MODES } from '@/lib/routing/transportModes';
import { ClientOnly } from '@/components/map/ClientOnly';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  instructions?: Array<{
    instruction: string;
    distance: number;
    duration: number;
  }>;
}

// Helper function to format duration in seconds to a readable string
const formatDuration = (seconds: number): string => {
  const roundedSeconds = Math.round(seconds);
  const hours = Math.floor(roundedSeconds / 3600);
  const minutes = Math.floor((roundedSeconds % 3600) / 60);
  const remainingSeconds = roundedSeconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function RoutingControls({ resourceLocation, userLocation, onClose, onRouteCalculated }: RoutingControlsProps) {
  const [selectedMode, setSelectedMode] = useState<keyof typeof TRANSPORT_MODES>('car');
  const [routeData, setRouteData] = useState<RouteResponse | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    calculateRoute();
  }, [selectedMode, userLocation, resourceLocation]);

  const calculateRoute = async () => {
    // Skip route calculation for special modes without API endpoints
    if (['bus', 'scooter', 'uber', 'lyft', 'mdo'].includes(selectedMode)) {
      return;
    }
    
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
      
      if (!response.ok) {
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          error: data.error,
          details: data.details
        });
        throw new Error(data.error || data.details?.message || `HTTP error! status: ${response.status}`);
      }

      // Validate the response structure
      if (!data.features || !Array.isArray(data.features) || data.features.length === 0) {
        throw new Error('Invalid API response: missing features');
      }

      const firstFeature = data.features[0];
      if (!firstFeature || !firstFeature.geometry || !firstFeature.geometry.coordinates) {
        throw new Error('Invalid API response: missing coordinates');
      }

      const coordinates = firstFeature.geometry.coordinates;

      if (!coordinates || !Array.isArray(coordinates)) {
        throw new Error('Invalid API response: missing coordinates');
      }

      // Ensure coordinates are in [lng, lat] format
      const formattedCoordinates = coordinates.map((coord: [number, number] | [[number, number]]) => {
        if (!Array.isArray(coord) || coord.length !== 2) {
          console.warn('Invalid coordinate format:', coord);
          return null;
        }
        
        const lng = coord[0];
        const lat = coord[1];
        
        if (typeof lng !== 'number' || typeof lat !== 'number') {
          console.warn('Invalid coordinate values:', coord);
          return null;
        }
        
        return [lng, lat];
      }).filter(Boolean) as [number, number][];

      if (formattedCoordinates.length < 2) {
        throw new Error('Invalid route: need at least 2 coordinates');
      }

      console.log('Formatted coordinates:', formattedCoordinates);
      
      // Update route data state
      setRouteData({
        features: data.features,
        summary: data.summary,
        instructions: data.instructions || []
      });

      // Pass route data to map
      onRouteCalculated?.({
        coordinates: formattedCoordinates,
        color: data.color,
        mode: data.mode
      });

      setError(null);
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
                onClick={() => {
                  // Handle special modes
                  if (key === 'bus') {
                    setSelectedMode(key as keyof typeof TRANSPORT_MODES);
                    window.open('https://www.the-rapid.org', '_blank');
                    return;
                  }
                  if (key === 'scooter') {
                    setSelectedMode(key as keyof typeof TRANSPORT_MODES);
                    window.open('https://www.li.me', '_blank');
                    return;
                  }
                  if (key === 'uber') {
                    setSelectedMode(key as keyof typeof TRANSPORT_MODES);
                    window.open('https://www.uber.com', '_blank');
                    return;
                  }
                  if (key === 'lyft') {
                    setSelectedMode(key as keyof typeof TRANSPORT_MODES);
                    window.open('https://www.lyft.com', '_blank');
                    return;
                  }
                  if (key === 'mdo') {
                    setSelectedMode(key as keyof typeof TRANSPORT_MODES);
                    window.open('https://www.mdorides.com', '_blank');
                    return;
                  }

                  // For standard modes, just update the selected mode
                  setSelectedMode(key as keyof typeof TRANSPORT_MODES);
                }}
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

          </div>
          {error ? (
            <div className="mt-2 text-red-500">
              <p>Error: {error}</p>
            </div>
          ) : routeData?.instructions && routeData.instructions.length > 0 ? (
            <div className="mt-4 space-y-4">
              <div className="p-4 bg-white rounded-lg shadow">
                <div className="flex flex-col gap-4">
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Time</span>
                        <span className="font-medium text-gray-800">{routeData.summary?.duration ? formatDuration(routeData.summary.duration) : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Distance</span>
                        <span className="font-medium text-gray-800">{routeData.summary?.distance ? Math.round(routeData.summary.distance / 1609.34) + ' miles' : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Route Instructions</h3>
                  {routeData.instructions.map((step, index) => (
                    <div key={index} className="p-2 border rounded mb-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Step {index + 1}</span>
                        <span className="text-sm text-gray-600">{step.duration ? formatDuration(step.duration) : 'N/A'}</span>
                      </div>
                      <p className="mt-1">{step.instruction}</p>
                      <p className="text-sm text-gray-600">{step.distance ? Math.round(step.distance) + ' m' : 'N/A'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : routeData?.summary ? (
            <div className="mt-2">
              <p>Duration: {routeData.summary.duration ? formatDuration(routeData.summary.duration) : 'N/A'}</p>
              <p>Distance: {routeData.summary.distance ? Math.round(routeData.summary.distance / 1609.34) + ' miles' : 'N/A'}</p>
            </div>
          ) : null}
        </div>
      </div>
    </ClientOnly>
  );
}
