'use client';

import { MapContainer, TileLayer, CircleMarker, useMapEvents, Marker, Popup } from 'react-leaflet';
import { useState, useEffect } from 'react';
import * as Leaflet from 'leaflet';
import { LocationPermissionPrompt } from '@/components/map/LocationPermissionPrompt';
import axios from 'axios';

const PULSING_ANIMATION = `
@keyframes pulse {
  0% {
    opacity: 0.85;
  }
  50% {
    opacity: 0.9;
  }
  100% {
    opacity: 0.85;
  }
}

.leaflet-container {
  cursor: pointer;
}

.leaflet-marker-icon {
  cursor: pointer;
}

.pulsing-marker {
  position: relative;
  animation: pulse 2s infinite;
  animation-timing-function: ease-in-out;
  border-radius: 50%;
  background: #007AFF;
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}
`;

interface Coordinates {
  lat: number;
  lng: number;
}

import { Resource } from '@/types/resource';

interface GrandRapidsMapProps {
  className?: string;
  resources?: Resource[];
}

const defaultCenter: Coordinates = {
  lat: 42.9634,
  lng: -85.6681
};

function LocationHandler({ mapCenter, setMapCenter, setZoom }: { mapCenter: Coordinates; setMapCenter: (center: Coordinates) => void; setZoom: (zoom: number) => void }) {
  useMapEvents({
    locationfound: (e: Leaflet.LocationEvent) => {
      setMapCenter({
        lat: e.latlng.lat,
        lng: e.latlng.lng
      });
      setZoom(15);
    }
  });

  return null;
}

export default function GrandRapidsMap({ className = '', resources = [] }: GrandRapidsMapProps) {
  const [mapCenter, setMapCenter] = useState<Coordinates>(defaultCenter);
  const [zoom, setZoom] = useState(15);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);

  const handlePermissionDenied = () => {
    setHasLocationPermission(false);
  };



  useEffect(() => {
    if (hasLocationPermission) {
      try {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };
              setUserLocation(location);
              setMapCenter(location);
              setZoom(15);
            },
            (error) => {
              console.error('Location error:', error);
              setHasLocationPermission(false);
              setMapCenter(defaultCenter);
              setZoom(13);
            }
          );
        }
      } catch (error) {
        console.error('Error getting device location:', error);
        setHasLocationPermission(false);
        setMapCenter(defaultCenter);
        setZoom(13);
      }
    }
  }, [hasLocationPermission]);

  return (
    <div className={`h-full ${className}`}>
      <LocationPermissionPrompt
        onPermissionGranted={() => setHasLocationPermission(true)}
        onPermissionDenied={handlePermissionDenied}
      />
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%', position: 'relative' }}
        className="rounded-lg shadow-lg"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <LocationHandler
          mapCenter={mapCenter}
          setMapCenter={setMapCenter}
          setZoom={setZoom}
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
        {resources
          .filter((resource) => resource.geocodedCoordinates?.lat !== undefined && resource.geocodedCoordinates?.lng !== undefined)
          .map((resource) => (
            <Marker
              key={resource.id}
              position={[resource.geocodedCoordinates.lat, resource.geocodedCoordinates.lng]}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold">{resource.name}</h3>
                  <p className="text-sm">{resource.address}</p>
                  {resource.phone && <p className="text-sm">{resource.phone}</p>}
                  {resource.hours && <p className="text-sm">{resource.hours}</p>}
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
      <style>{PULSING_ANIMATION}</style>
    </div>
  );
}
