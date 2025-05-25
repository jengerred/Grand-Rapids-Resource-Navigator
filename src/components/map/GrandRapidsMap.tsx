'use client';

import { MapContainer, TileLayer, CircleMarker, useMapEvents, Marker, Popup, useMap } from 'react-leaflet';
import { useState, useEffect } from 'react';
import { LocationPermissionPrompt } from '@/components/map/LocationPermissionPrompt';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import './styles.css';
import { Resource } from '@/types/resource';
import { LeafletConfig } from './LeafletConfig';
import * as leaflet from 'leaflet';

// Create a reusable blue marker icon
const blueMarkerIcon = new leaflet.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  shadowSize: [41, 41]
});


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
  position: relative;
  width: 100%;
  height: 100%;
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

/* Ensure map container has proper dimensions */
.map-container {
  width: 100%;
  height: 100%;
  position: relative;
  min-height: 500px;
}

/* Fix z-index issues */
.leaflet-container {
  z-index: 0 !important;
}
`;

interface Coordinates {
  lat: number;
  lng: number;
}

// Type for coordinates that can be used with Leaflet
interface LatLngExpression {
  lat: number;
  lng: number;
}

// Type for the component props
interface GrandRapidsMapProps {
  resources?: Resource[];
  className?: string;
}

interface GrandRapidsMapProps {
  className?: string;
  resources?: Resource[];
}

const defaultCenter: Coordinates = {
  lat: 42.9634,
  lng: -85.6681
};

interface LocationHandlerProps {
  mapCenter: Coordinates | null;
  setMapCenter: (center: Coordinates) => void;
  setZoom: (zoom: number) => void;
}

function LocationHandler({ mapCenter, setMapCenter, setZoom }: LocationHandlerProps) {
  const map = useMap();
  useEffect(() => {
    if (map && mapCenter) {
      map.on('locationfound', (e) => {
        setMapCenter({ lat: e.latlng.lat, lng: e.latlng.lng });
        setZoom(15);
      });
    }
  }, [map, mapCenter, setMapCenter, setZoom]);

  return null;
}

export default function GrandRapidsMap({ className = '', resources = [] }: GrandRapidsMapProps) {
  
  // Initialize resources state
  const [resourcesState, setResourcesState] = useState<Resource[]>(resources);
  
  const [mapCenter, setMapCenter] = useState<Coordinates | null>(null);
  const [zoom, setZoom] = useState(13);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);

  // Update resources state when props change
  useEffect(() => {
    setResourcesState(resources);
  }, [resources]);

  // Configure Leaflet icons to prevent SSR issues
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const icon = new leaflet.Icon.Default();
      delete (icon as any)._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: '/marker-icon-2x.png',
        iconUrl: '/marker-icon.png',
        shadowUrl: '/marker-shadow.png',
      });
    }
  }, []);

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

  // Only run location-related code on client side
  if (typeof window === 'undefined') {
    return null;
  }

  const handlePermissionDenied = () => {
    setHasLocationPermission(false);
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      <LeafletConfig />
      <LocationPermissionPrompt
        onPermissionGranted={() => setHasLocationPermission(true)}
        onPermissionDenied={handlePermissionDenied}
      />
      <div className="map-container" style={{ height: '500px' }}>
        <MapContainer
          center={mapCenter ? [mapCenter.lat, mapCenter.lng] : [42.9634, -85.6681]}
          zoom={zoom}
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
          {resourcesState
            .filter((resource) => {
              console.log('Processing resource:', resource.name, 'with coordinates:', resource.geocodedCoordinates);
              return resource.geocodedCoordinates && 
                resource.geocodedCoordinates.lat !== null && 
                resource.geocodedCoordinates.lng !== null;
            })
            .map((resource) => {
              console.log('Creating marker for:', resource.name, 'at:', resource.geocodedCoordinates);
              return (
                <Marker
                  key={resource.id}
                  position={[
                    resource.geocodedCoordinates.lat,
                    resource.geocodedCoordinates.lng
                  ] as [number, number]}
                  icon={blueMarkerIcon}
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
              )})}
        </MapContainer>
      </div>
      <style>{PULSING_ANIMATION}</style>
    </div>
  );
}
