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
                      <div className="text-center">
                        <h3 className="font-bold">{resource.name}</h3>
                        <p className="text-sm">{resource.address}</p>
                        {resource.phone && <p className="text-sm">{resource.phone}</p>}
                      </div>
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
