export interface Coordinates {
  lat: number;
  lng: number;
}

export interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
}

export interface Route {
  totalDistance: number;
  totalDuration: number;
  steps: RouteStep[];
}

export interface TransportOption {
  type: 'bike' | 'scooter' | 'car' | 'bus' | 'walk' | 'rideshare' | 'taxi';
  name: string;
  distance: number;
  duration: number;
  cost?: number;
  availability?: number;
  coordinates: Coordinates;
  routeCoordinates?: Coordinates[];
  routeDistance?: number;
  routeDuration?: number;
  provider?: string;
  rating?: number;
  reviews?: number;
  pickupTime?: number;
  lastUpdated?: Date;
}

export interface TransportResponse {
  route?: Route;
  options: TransportOption[];
}
