// Test comment at the start of the file
'use client';

import { useState, useEffect, useCallback } from 'react';
import { TRANSPORT_MODES } from '@/lib/routing/transportModes';
import { generateRideShareUrl, generateLimeUrl, generateMDOUrl } from '@/lib/routing';
import { ClientOnly } from '@/components/map/ClientOnly';
import { useLanguageStore } from '@/lib/store';
import { appTranslations } from '@/lib/appTranslations';

interface RoutingControlsProps {
  resourceLocation: { 
    lat: number; 
    lng: number;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  userLocation: { lat: number; lng: number };
  onClose: () => void;
  onRouteCalculated?: (route: { coordinates: [number, number][]; color: string; mode: string }) => void;
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
  const isSpanish = useLanguageStore(state => state.isSpanish);
  const [selectedMode, setSelectedMode] = useState<keyof typeof TRANSPORT_MODES>('car');
  const [routeData, setRouteData] = useState<RouteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Recalculate route whenever mode or locations change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    calculateRoute();
  }, [selectedMode, userLocation, resourceLocation]);

  const calculateRoute = useCallback(async () => {
    // Skip route calculation for special modes without API endpoints
    if (['bus', 'scooter', 'uber', 'lyft', 'mdo'].includes(selectedMode)) {
      return;
    }
    
    if (!userLocation?.lat || !userLocation?.lng || !resourceLocation.lat || !resourceLocation.lng) return;

    try {
      const response = await fetch('/api/directions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Set the language cookie in the request
          'Cookie': `language=${isSpanish ? 'es' : 'en'}`
        },
        body: JSON.stringify({
          start: { lng: userLocation.lng, lat: userLocation.lat },
          end: { lng: resourceLocation.lng, lat: resourceLocation.lat },
          transportMode: selectedMode,
          language: isSpanish ? 'es' : 'en'  // Also pass as body parameter for good measure
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
        coordinates: data.features[0].geometry.coordinates as [number, number][],
        color: TRANSPORT_MODES[selectedMode].color,
        mode: selectedMode
      });
      setError(null);
    } catch (err) {
      console.error('Error calculating route:', err);
      setError(err instanceof Error ? err.message : 'Failed to calculate route');
    }
  }, [selectedMode, userLocation, resourceLocation, isSpanish, onRouteCalculated]);

  useEffect(() => {
    calculateRoute();
  }, [calculateRoute]);

  // Get translations based on current language
  const t = appTranslations[isSpanish ? 'es' : 'en'].routing;

  return (
    <ClientOnly>
      <div className="flex flex-col gap-2 relative">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold mb-2">{t.chooseRouteMethod}</h3>
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {Object.entries(TRANSPORT_MODES).map(([key, mode]) => (
              <button
                key={key}
                onClick={() => {
                  // Handle special modes
                  if (key === 'bus') {
                    setSelectedMode(key as keyof typeof TRANSPORT_MODES);
                    
                    // Show appropriate message based on device
                    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
                    const storeName = isIOS ? 'App Store' : 'Play Store';
                    const message = isSpanish
                      ? `Las direcciones de autobús con navegación en tiempo real están disponibles en la aplicación Transit. ¿Abrir ${storeName}?`
                      : `Bus directions with real-time navigation are available in the Transit app. Open in ${storeName}?`;
                    
                    if (window.confirm(message)) {
                      // Check if mobile
                      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                      
                      if (isMobile) {
                        // On mobile, try to open the app directly with fallback to app store
                        const appUrl = `transit://directions?from=${userLocation.lat},${userLocation.lng}&to=${resourceLocation.lat},${resourceLocation.lng}`;
                        const appStoreUrl = /iPhone|iPad|iPod/i.test(navigator.userAgent)
                          ? 'https://apps.apple.com/app/transit-bus-train-times/id498151501'
                          : 'https://play.google.com/store/apps/details?id=com.thetransitapp.droid';
                        
                        // Try to open the app, fall back to app store if it fails after 1 second
                        window.location.href = appUrl;
                        setTimeout(() => {
                          // Only redirect if still on the current page
                          if (!document.hidden) {
                            window.location.href = appStoreUrl;
                          }
                        }, 1000);
                      } else {
                        // On desktop, open the appropriate app store
                        const appStoreUrl = /iPhone|iPad|iPod/i.test(navigator.userAgent)
                          ? 'https://apps.apple.com/app/transit-bus-train-times/id498151501'
                          : 'https://play.google.com/store/apps/details?id=com.thetransitapp.droid';
                        window.location.href = appStoreUrl;
                      }
                    }
                    return;
                  }
                  
                  if (key === 'scooter') {
                    setSelectedMode(key as keyof typeof TRANSPORT_MODES);
                    const userAgent = navigator.userAgent;
                    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
                    const isAndroid = /Android/i.test(userAgent);
                    const isMobile = isIOS || isAndroid;
                    const limeUrls = generateLimeUrl();
                    
                    const storeName = isIOS ? 'App Store' : 'Play Store';
                    const message = isSpanish
                      ? `¿Abrir ${storeName} para acceder a Lime?`
                      : `Open the ${storeName} to access Lime?`;
                    
                    if (window.confirm(message)) {
                      if (isMobile) {
                        // Redirect directly to the appropriate app store
                        if (isIOS) {
                          window.location.href = limeUrls.appStoreUrl;
                        } else if (isAndroid) {
                          window.location.href = limeUrls.playStoreUrl;
                        } else {
                          window.location.href = limeUrls.webUrl;
                        }
                      } else {
                        // On desktop, open the website
                        window.open(limeUrls.webUrl, '_blank', 'noopener,noreferrer');
                      }
                    }
                    return;
                  }
                  
                  if (key === 'uber') {
                    setSelectedMode(key as keyof typeof TRANSPORT_MODES);
                    const uberUrl = generateRideShareUrl('uber', userLocation, resourceLocation);
                    
                    // Show confirmation message before opening Uber
                    const message = isSpanish
                      ? '¿Abrir en "Uber"?'
                      : 'Open in "Uber"?';
                    
                    if (window.confirm(message)) {
                      // Open in a new tab to prevent default browser dialogs
                      window.open(uberUrl, '_blank', 'noopener,noreferrer');
                    }
                    return;
                  }
                  if (key === 'lyft') {
                    setSelectedMode(key as keyof typeof TRANSPORT_MODES);
                    const lyftUrl = generateRideShareUrl('lyft', userLocation, resourceLocation);
                    
                    // Show confirmation message before opening Lyft
                    const message = isSpanish
                      ? '¿Abrir en "Lyft"?'
                      : 'Open in "Lyft"?';
                    
                    if (window.confirm(message)) {
                      // Open in a new tab to prevent default browser dialogs
                      window.open(lyftUrl, '_blank', 'noopener,noreferrer');
                    }
                    return;
                  }
                  if (key === 'mdo') {
                    setSelectedMode(key as keyof typeof TRANSPORT_MODES);
                    const userAgent = navigator.userAgent;
                    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
                    const isAndroid = /Android/i.test(userAgent);
                    const isMobile = isIOS || isAndroid;
                    const mdoUrls = generateMDOUrl();
                    
                    const storeName = isIOS ? 'App Store' : 'Play Store';
                    const message = isSpanish
                      ? `¿Abrir ${storeName} para acceder a MDO Carshare?`
                      : `Open the ${storeName} to access MDO Carshare?`;
                    
                    if (window.confirm(message)) {
                      if (isMobile) {
                        // Redirect directly to the appropriate app store
                        if (isIOS) {
                          window.location.href = mdoUrls.appStoreUrl;
                        } else if (isAndroid) {
                          window.location.href = mdoUrls.playStoreUrl;
                        } else {
                          window.location.href = mdoUrls.webUrl;
                        }
                      } else {
                        // On desktop, open the website
                        window.open(mdoUrls.webUrl, '_blank', 'noopener,noreferrer');
                      }
                    }
                    return;
                  }

                  // For standard modes, just update the selected mode
                  setSelectedMode(key as keyof typeof TRANSPORT_MODES);
                }}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors min-w-[100px] ${
                  selectedMode === key ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
              >
                <span className="text-sm font-medium">{t.transportModes[key as keyof typeof t.transportModes]}</span>
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
                        <span className="text-gray-600">{t.totalTime}</span>
                        <span className="font-medium text-gray-800">{routeData.summary?.duration ? formatDuration(routeData.summary.duration) : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">{t.totalDistance}</span>
                        <span className="font-medium text-gray-800">{routeData.summary?.distance ? `${Math.round(routeData.summary.distance / 1609.34)} ${t.distance.miles}` : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{t.routeInstructions}</h3>
                  {routeData.instructions.map((step, index) => (
                    <div key={index} className="p-2 border rounded mb-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{t.step} {index + 1}</span>
                        <span className="text-sm text-gray-600">{step.duration ? formatDuration(step.duration) : 'N/A'}</span>
                      </div>
                      <p className="mt-1">{step.instruction}</p>
                      <p className="text-sm text-gray-600">
                        {step.distance 
                          ? isSpanish 
                            ? `${Math.round(step.distance / 3.28084)} ${t.distance.meters}` // Convert feet to meters for Spanish
                            : `${Math.round(step.distance)} ${t.distance.feet}` // Use feet for English
                          : 'N/A'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : routeData?.summary ? (
            <div className="mt-2">
              <p>{t.duration}: {routeData.summary.duration ? formatDuration(routeData.summary.duration) : 'N/A'}</p>
              <p>{t.distanceLabel}: {routeData.summary.distance ? `${Math.round(routeData.summary.distance / 1609.34)} ${t.distance.miles}` : 'N/A'}</p>
            </div>
          ) : null}
        </div>
      </div>
    </ClientOnly>
  );
}// Test comment at the end of file
