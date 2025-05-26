'use client';

import dynamic from 'next/dynamic';

// Import Leaflet components dynamically
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then(mod => mod.CircleMarker), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

import { useState, useEffect } from 'react';
import { LocationPermissionPrompt } from '@/components/map/LocationPermissionPrompt';
import { ClientOnly } from './ClientOnly';
import 'leaflet/dist/leaflet.css';
import './styles.css';
import { Resource } from '@/types/resource';
import { LeafletConfig } from './LeafletConfig';

interface Coordinates {
  lat: number;
  lng: number;
}

// Type for coordinates that can be used with Leaflet


// Type for the component props
interface GrandRapidsMapProps {
  className?: string;
  resources?: Resource[];
}



export default function GrandRapidsMap({ className = '', resources = [] }: GrandRapidsMapProps) {
  // Initialize resources state (must be called unconditionally)
  const [resourcesState, setResourcesState] = useState<Resource[]>(resources);
  const [mapCenter, setMapCenter] = useState<Coordinates>({
    lat: 42.9634,
    lng: -85.6681
  });
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);

  // Update resources state when props change
  useEffect(() => {
    setResourcesState(resources);
  }, [resources]);

  useEffect(() => {
    if (hasLocationPermission) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter({ lat: latitude, lng: longitude });
          setUserLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error('Error getting location:', error);
          setMapCenter({ lat: 42.9634, lng: -85.6681 }); // Default to Grand Rapids
        }
      );
    } else {
      setMapCenter({ lat: 42.9634, lng: -85.6681 }); // Default to Grand Rapids
    }
  }, [hasLocationPermission]);

  const handlePermissionDenied = () => {
    setHasLocationPermission(false);
  };

  return (
    <ClientOnly>
      <div className={`relative w-full h-full ${className}`}>
        <LocationPermissionPrompt
          onPermissionGranted={() => setHasLocationPermission(true)}
          onPermissionDenied={handlePermissionDenied}
        />
        <div className="map-container" style={{ height: '500px' }}>
          <LeafletConfig />
          <MapContainer
            center={mapCenter ? [mapCenter.lat, mapCenter.lng] : [42.9634, -85.6681]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            className="w-full h-full rounded-lg shadow-lg"
            whenReady={() => {
              console.log('Map is ready');
            }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
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
                    position={[coords.lat as number, coords.lng as number]}
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
                            <h4 className="text-sm text-gray-600 mb-1">Services:</h4>
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
                              <span className="text-gray-600">Hours:</span>
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
                          <p className="text-gray-700">{resource.phone}</p>
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
                    </Popup>
                  </Marker>
                );
              })}
          </MapContainer>
        </div>
      </div>
    </ClientOnly>
  );
}
