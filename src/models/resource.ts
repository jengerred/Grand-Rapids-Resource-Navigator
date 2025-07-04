export interface Resource {
  _id?: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  plusCode?: string;
  geocodedCoordinates?: {
    lat: number;
    lng: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateResourceDTO {
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  plusCode?: string;
}
