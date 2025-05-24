import axios from 'axios';
import { Coordinates, Route, TransportOption, TransportResponse } from '@/models/transport';

// OpenStreetMap API configuration
const OSRM_API_URL = 'https://router.project-osrm.org';
const TRANSIT_API_URL = 'https://transit.land/api/v1';

export async function getRoute(
  origin: Coordinates,
  destination: Coordinates,
  mode: 'car' | 'bike' | 'walk' | 'scooter' | 'rideshare' | 'taxi' = 'car'
): Promise<Route> {
  try {
    const profile = getProfileForMode(mode);
    const response = await axios.get(`${OSRM_API_URL}/route`, {
      params: {
        coordinates: `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`,
        overview: 'full',
        steps: true,
        alternatives: false,
        annotations: 'duration,distance',
        profile: profile
      }
    });

    const route = response.data.routes[0];
    return {
      totalDistance: route.distance,
      totalDuration: route.duration,
      steps: route.legs[0].steps.map((step: any) => ({
        instruction: step.maneuver.instruction,
        distance: step.distance,
        duration: step.duration
      }))
    };
  } catch (error: any) {
    console.error('Error getting route:', error);
    throw new Error(`Failed to get route: ${error.message}`);
  }
}

function getProfileForMode(mode: 'car' | 'bike' | 'walk' | 'scooter' | 'rideshare' | 'taxi'): string {
  const profiles: Record<'car' | 'bike' | 'walk' | 'scooter' | 'rideshare' | 'taxi', string> = {
    car: 'car',
    bike: 'bicycle',
    walk: 'foot',
    scooter: 'bicycle',
    rideshare: 'car',
    taxi: 'car'
  };
  return profiles[mode];
}

export async function getNearbyTransportOptions(
  coordinates: Coordinates,
  radius: number = 500
): Promise<TransportOption[]> {
  try {
    // Get nearby bike stations
    const bikeStations = await axios.get(`${TRANSIT_API_URL}/stops`, {
      params: {
        lat: coordinates.lat,
        lon: coordinates.lng,
        radius: radius,
        mode: 'bike'
      }
    });

    // Get nearby bus stations
    const busStations = await axios.get(`${TRANSIT_API_URL}/stops`, {
      params: {
        lat: coordinates.lat,
        lon: coordinates.lng,
        radius: radius,
        mode: 'bus'
      }
    });

    // Get nearby scooter stations
    const scooterStations = await axios.get(`${TRANSIT_API_URL}/stops`, {
      params: {
        lat: coordinates.lat,
        lon: coordinates.lng,
        radius: radius,
        mode: 'scooter'
      }
    });

    // Get nearby rideshare options
    const rideshareOptions = await getRideshareOptions(coordinates);

    return [
      // Bike stations
      ...bikeStations.data.stops.map((stop: any) => ({
        type: 'bike',
        name: stop.name,
        distance: stop.distance,
        duration: stop.duration,
        availability: stop.bikes_available,
        coordinates: {
          lat: stop.lat,
          lng: stop.lon
        },
        lastUpdated: new Date()
      })),

      // Scooter stations
      ...scooterStations.data.stops.map((stop: any) => ({
        type: 'scooter',
        name: stop.name,
        distance: stop.distance,
        duration: stop.duration,
        availability: stop.scooters_available,
        coordinates: {
          lat: stop.lat,
          lng: stop.lon
        },
        lastUpdated: new Date()
      })),

      // Bus stations
      ...busStations.data.stops.map((stop: any) => ({
        type: 'bus',
        name: stop.name,
        distance: stop.distance,
        duration: stop.duration,
        coordinates: {
          lat: stop.lat,
          lng: stop.lon
        },
        lastUpdated: new Date()
      })),

      // Rideshare options
      ...rideshareOptions
    ];
  } catch (error: any) {
    console.error('Error getting transport options:', error);
    return [];
  }
}

async function getRideshareOptions(coordinates: Coordinates): Promise<TransportOption[]> {
  try {
    const response = await axios.get('https://api.uber.com/v1.2/estimates/price', {
      params: {
        start_latitude: coordinates.lat,
        start_longitude: coordinates.lng,
        end_latitude: coordinates.lat + 0.01, // Temporary destination
        end_longitude: coordinates.lng + 0.01
      },
      headers: {
        'Authorization': `Bearer ${process.env.UBER_API_KEY}`
      }
    });

    return response.data.prices.map((price: any) => ({
      type: 'rideshare',
      name: price.display_name,
      distance: price.distance,
      duration: price.duration,
      cost: price.estimate,
      provider: 'Uber',
      coordinates,
      lastUpdated: new Date()
    }));
  } catch (error: any) {
    console.error('Error getting rideshare options:', error);
    return [];
  }
}

export async function getDirections(
  origin: Coordinates,
  destination: Coordinates,
  mode: 'car' | 'bike' | 'walk' | 'scooter' | 'rideshare' | 'taxi'
): Promise<TransportResponse> {
  try {
    const route = await getRoute(origin, destination, mode);
    const options = await getNearbyTransportOptions(origin);

    return {
      route,
      options
    };
  } catch (error: any) {
    console.error('Error getting directions:', error);
    throw new Error(`Failed to get directions: ${error.message}`);
  }
}
