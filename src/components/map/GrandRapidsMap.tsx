'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { LocateIcon } from 'lucide-react';
import { LocationPermissionPrompt } from '@/components/map/LocationPermissionPrompt';
import { useLanguageStore } from '@/lib/store';
import { getTranslation } from '@/lib/appTranslations';
import { ClientOnly } from './ClientOnly';
import 'leaflet/dist/leaflet.css';
import './styles.css';
import { Resource } from '@/types/resource';
import RoutingControls from '@/lib/routing/RoutingControls';
import { LeafletConfig } from './LeafletConfig';
import { TRANSPORT_MODES } from '@/lib/routing/transportModes';
import { L } from './LeafletConfig';

// Dynamically import Leaflet components to prevent SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then(mod => mod.Polyline), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then(mod => mod.CircleMarker), { ssr: false });

interface Coordinates {
  lat: number;
  lng: number;
}

// Type for coordinates that can be used with Leaflet

// Type for the component props
interface GrandRapidsMapProps {
  className?: string;
  resources?: Resource[];
  showRouting: boolean;
  setShowRouting: (show: boolean) => void;
}

interface Route {
  coordinates: [number, number][] | null;
  color: string;
  mode: keyof typeof TRANSPORT_MODES;
}

export default function GrandRapidsMap({ 
  className = '', 
  resources = [],
  showRouting,
  setShowRouting
}: GrandRapidsMapProps) {
  const { isSpanish } = useLanguageStore();
  // Initialize resources state (must be called unconditionally)
  const [resourcesState, setResourcesState] = useState<Resource[]>(resources);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [route, setRoute] = useState<Route | null>(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [showFloatingIcon, setShowFloatingIcon] = useState(true);


  useEffect(() => {
    if (route && route.coordinates && route.coordinates.length > 0) {
      console.log('Route changed:', route);
    } else {
      console.log('Invalid route:', route);
    }
  }, [route]);

  useEffect(() => {
    setResourcesState(resources);
  }, [resources]);

  useEffect(() => {
    console.log('showRouting changed:', showRouting);
    if (!showRouting) {
      setRoute(null);
      setSelectedResource(null);
    }
  }, [showRouting]);

  useEffect(() => {
    console.log('selectedResource changed:', selectedResource?.name);
  }, [selectedResource]);

  useEffect(() => {
    console.log('userLocation changed:', userLocation);
  }, [userLocation]);

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
    } else {
      setUserLocation(null);
    }
  }, [hasLocationPermission]);

  const handlePermissionDenied = () => {
    setHasLocationPermission(false);
    setShowLocationPrompt(false);
  };

  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mapContainer = mapRef.current;
    return () => {
      // Cleanup any existing map instances
      const L = (window as Window & typeof globalThis & { L?: typeof import('leaflet') }).L;
      if (L && mapContainer) {
        // Clear any existing map from the container
        const mapElement = mapContainer.querySelector('.leaflet-container');
        if (mapElement) {
          mapElement.remove();
        }
        // Clear the container
        mapContainer.innerHTML = '';
      }
    };
  }, []);

  return (
    <ClientOnly>
      <div className={`relative w-full ${className}`}>
        {/* Floating location icon */}
        {showFloatingIcon && (
          <button 
            onClick={() => setShowLocationPrompt(true)}
            className="fixed top-4 left-4 z-[1000] w-10 h-10 bg-blue-500 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
            aria-label="Show location prompt"
          >
            <LocateIcon className="w-5 h-5 text-white" />
          </button>
        )}

        <LocationPermissionPrompt
          isOpen={showLocationPrompt}
          isSharing={hasLocationPermission}
          onPermissionGranted={() => {
            setHasLocationPermission(true);
            setShowFloatingIcon(false);
          }}
          onPermissionRevoked={() => {
            setHasLocationPermission(false);
            setShowFloatingIcon(true);
          }}
          onClose={() => {
            setShowLocationPrompt(false);
            setShowFloatingIcon(true);
          }}
        />
        <div className="flex flex-col gap-4">
          <div id="map-container" className="map-container" ref={mapRef}>
            <LeafletConfig />
            <MapContainer
              center={[42.9634, -85.6681]}
              zoom={13}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%', borderRadius: '8px' }}
              className="rounded-lg shadow-lg"
              key={`map-container-${showRouting}-${selectedResource?.id || 'none'}`}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {route && route.coordinates && route.coordinates.length > 0 && (
                <>
                  <Polyline
                    pathOptions={{
                      color: route.color,
                      weight: 8,
                      opacity: 0.9,
                      dashArray: '10, 5'
                    }}
                    positions={route?.mode === 'walk' || route?.mode === 'bike' || route?.mode === 'car' ? route.coordinates.map(coord => [coord[1], coord[0]]) : route.coordinates.map(coord => [coord[0], coord[1]])}
                  />
                  <ClientOnly>
                    <Marker 
                      position={userLocation ? [userLocation.lat, userLocation.lng] : [0, 0]}
                      { ...(showRouting && {
                        icon: new L.Icon({
                          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                          iconSize: [25, 41],
                          iconAnchor: [12, 41],
                          popupAnchor: [1, -34],
                          shadowSize: [41, 41]
                        })
                      }) }
                    >
                      <Popup>
                        <div className="text-center">
                          <h3 className="font-bold">{getTranslation('map.start', isSpanish ? 'es' : 'en')}</h3>
                          <p className="text-sm text-gray-600">{getTranslation('map.currentLocation', isSpanish ? 'es' : 'en')}</p>
                        </div>
                      </Popup>
                    </Marker>
                  </ClientOnly>
                </>
              )}
              {userLocation && (
                <CircleMarker
                  center={userLocation}
                  pathOptions={{
                    color: '#FFFFFF',
                    fillColor: '#007AFF',
                    fillOpacity: 0.8,
                    weight: 2,
                    className: 'pulsing-marker'
                  }}
                  radius={15}
                />
              )}
              {resourcesState
                .filter((resource) => {
                  const coords = resource.geocodedCoordinates;
                  return coords && coords.lat !== null && coords.lng !== null;
                })
                .map((resource) => {
                  const coords = resource.geocodedCoordinates;
                  return (
                    <Marker
                      key={resource.id}
                      position={Object.assign({}, coords)}
                      icon={
                        showRouting && selectedResource?.id === resource.id
                          ? new L.Icon({
                              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                              iconSize: [25, 41],
                              iconAnchor: [12, 41],
                              popupAnchor: [1, -34],
                              shadowSize: [41, 41]
                            })
                          : new L.Icon.Default()
                      }
                    >
                      <Popup>
                        <div className="max-w-sm bg-white rounded-lg p-3 text-center">
                          <h3 className="text-xl font-bold text-gray-900 mb-0">{resource.name}</h3>
                          <p className="mt-0.5 text-base text-gray-600">
                            <span className="font-medium">{resource.address}</span><br />
                            {`${resource.city}, ${resource.state} ${resource.zip}`}
                          </p>
                        </div>
                        
                        <div className="space-y-3">
                          {resource.services && (
                            <div className="pb-4">
                              <h4 className="text-sm text-gray-600 mb-1">{getTranslation('popup.services', isSpanish ? 'es' : 'en')}</h4>
                              <div className="flex flex-wrap gap-1">
                                {resource.services.map((service, index) => (
                                  <span 
                                    key={index} 
                                    className="px-2 py-1 bg-gray-100 rounded-full text-sm text-gray-700 flex items-center gap-0.5"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" style={{ color: 'gray' }}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    {service}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {resource.hours && (
                            <div className="mt-4 flex items-start gap-2">
                              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <div className="flex flex-col">
                                <span className="text-gray-600">{getTranslation('popup.hours', isSpanish ? 'es' : 'en')}:</span>
                                <p className="text-gray-700 whitespace-pre-wrap">{resource.hours}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {resource.phone && (
                          <div className="mt-2 flex items-center gap-2">
                            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <button 
                              className="text-gray-700 hover:text-gray-600 p-1 bg-transparent border-none focus:outline-none"
                              onClick={() => {
                                // Create a temporary anchor element
                                const a = document.createElement('a');
                                a.href = `tel:${resource.phone}`;
                                // Trigger click event
                                a.click();
                              }}
                            >
                              {resource.phone}
                            </button>
                          </div>
                        )}

                        {resource.website && (
                          <div className="mt-2 flex items-center gap-2">
                            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            <a href={resource.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                              {resource.website}
                            </a>
                          </div>
                        )}
                        <div className="mt-2 flex items-center gap-2">
                          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <button 
                            onClick={(e) => {
                              if (!userLocation) {
                                setShowLocationPrompt(true);
                                return;
                              }
                              
                              // First set selected resource and close popup
                              setSelectedResource(resource);
                              const popup = e.currentTarget.closest('.leaflet-popup') as HTMLElement;
                              if (popup) {
                                popup.style.display = 'none';
                              }
                              
                              // After popup is closed, update routing state
                              setTimeout(() => {
                                setShowRouting(true);
                              }, 100);
                            }}
                            className="text-blue-500 hover:text-blue-700 p-1 bg-transparent border-none focus:outline-none"
                          >
                            {getTranslation('map.route', isSpanish ? 'es' : 'en')}
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
            </MapContainer>
          </div>

          {showRouting && selectedResource && userLocation && (
            <div id="directions-panel" className="directions-panel w-full bg-white rounded-t-lg shadow-lg flex flex-col" style={{
              zIndex: 1000,
              padding: '1.5rem'
            }}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{getTranslation('routing.route', isSpanish ? 'es' : 'en')}</h2>
                <button
                  onClick={() => {
                    setShowRouting(false);
                    setSelectedResource(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="max-h-[400px] overflow-y-auto mb-4">
                <ClientOnly>
                  <RoutingControls
                    resourceLocation={selectedResource?.geocodedCoordinates || { lat: 0, lng: 0 }}
                    userLocation={userLocation || { lat: 0, lng: 0 }}
                    onClose={() => {
                      // First hide the panel
                      setShowRouting(false);
                      // After panel is hidden, reset the selected resource with a delay
                      setTimeout(() => {
                        setSelectedResource(null);
                      }, 100);
                    }}
                    onRouteCalculated={(route) => {
                      console.log('Route received by map:', route);
                      setRoute({
                        coordinates: route.coordinates,
                        color: route.color,
                        mode: route.mode
                      });
                    }}
                  />
                </ClientOnly>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    setShowRouting(false);
                    setSelectedResource(null);
                  }}
                  className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700"
                >
                  {getTranslation('notNow', isSpanish ? 'es' : 'en')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ClientOnly>
  );
}