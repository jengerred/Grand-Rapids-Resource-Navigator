export interface Resource {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  category: string;
  services: string[];
  hours?: string;
  phone?: string;
  website?: string;
  geocodedCoordinates: {
    lat: number;
    lng: number;
  };
  location?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateResourceDTO {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  category: string;
  services: string[];
  hours: string;
  phone: string;
  website: string;
  geocodedCoordinates: {
    lat: number;
    lng: number;
  };
  location?: string;
}

export interface UpdateResourceDTO {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  category?: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  hours?: string;
  services?: string[];
  requirements?: string[];
  notes?: string;
  geocodedCoordinates?: {
    lat: number;
    lng: number;
  };
  availability?: {
    cars?: number;
    scooters?: number;
    bikes?: number;
    lastUpdated?: string;
  };
  hourly?: number;
  daily?: number;
  perRide?: number;
}
