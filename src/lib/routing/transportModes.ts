/**
 * Transport modes configuration for routing
 */

export interface TransportMode {
  name: string;
  icon: string;
  profile: string;
  color: string;
  router: string;
  provider?: string;
  apiEndpoint?: string;
  supportsLanguage?: boolean; // Whether this mode supports language parameter
}

export const TRANSPORT_MODES: Record<string, TransportMode> = {
  car: {
    name: 'Car',
    icon: '🚗',
    profile: 'driving-traffic',
    color: '#FF0000',
    router: 'mapbox',
    apiEndpoint: 'https://api.mapbox.com/directions/v5/mapbox'
  },
  bike: {
    name: 'Bike',
    icon: '🚲',
    profile: 'cycling',
    color: '#2196F3',
    router: 'mapbox',
    apiEndpoint: 'https://api.mapbox.com/directions/v5/mapbox'
  },
  walk: {
    name: 'Walk',
    icon: '🚶',
    profile: 'walking',
    color: '#4CAF50',
    router: 'mapbox',
    apiEndpoint: 'https://api.mapbox.com/directions/v5/mapbox'
  },
  bus: {
    name: 'Bus',
    icon: '🚌',
    color: '#FFC107',
    router: 'transit',
    profile: 'public_transport'
  },
  scooter: {
    name: 'Lime Scooter',
    icon: '🛴',
    profile: 'cycling-regular',
    color: '#00C9A7',
    router: 'external',
    provider: 'lime',
    apiEndpoint: 'https://www.li.me'
  },
  uber: {
    name: 'Uber',
    icon: '🚕',
    profile: 'driving-car',
    color: '#000000',
    router: 'uber'
  },
  lyft: {
    name: 'Lyft',
    icon: '🚕',
    profile: 'driving-car',
    color: '#0079BF',
    router: 'lyft'
  },
  mdo: {
    name: 'MDO Carshare',
    icon: '🚗',
    profile: 'driving-car',
    color: '#2E7D32',
    router: 'mdo'
  }
};
