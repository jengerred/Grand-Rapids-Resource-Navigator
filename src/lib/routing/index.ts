import { TRANSPORT_MODES } from './transportModes';

// Route calculation
export async function calculateRoute(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
  mode: keyof typeof TRANSPORT_MODES
) {
  try {
    const transportMode = TRANSPORT_MODES[mode];
    const endpoint = transportMode.apiEndpoint;
    
    if (!endpoint) {
      throw new Error(`No API endpoint configured for mode: ${mode}`);
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.ORS_API_KEY || ''
      },
      body: JSON.stringify({
        coordinates: [[start.lng, start.lat], [end.lng, end.lat]],
        options: {
          avoid_polygons: [],
          avoid_features: [],
          preferences: []
        },
        instructions: true
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Routing error:', error);
    throw error;
  }
}

interface RouteResponse {
  routes: Array<{
    summary: {
      duration: number;
      distance: number;
    };
  }>;
}

// Get route duration in minutes
export function getRouteDuration(route: RouteResponse): number {
  if (!route || !route.routes?.[0]?.summary) return 0;
  return route.routes[0].summary.duration / 60; // Convert to minutes
}

// Get route distance in miles
export function getRouteDistance(route: RouteResponse): number {
  if (!route || !route.routes?.[0]?.summary) return 0;
  return route.routes[0].summary.distance / 1609.34; // Convert meters to miles
}

// Generate ride-share URL
export function generateRideShareUrl(mode: keyof typeof TRANSPORT_MODES, start: { lat: number; lng: number }, end: { lat: number; lng: number }): string {
  if (mode === 'uber') {
    return `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[latitude]=${end.lat}&dropoff[longitude]=${end.lng}`;
  } else if (mode === 'lyft') {
    return `https://lyft.com/ride/${end.lat},${end.lng}`;
  }
  return '';
}

// Generate MDO carshare URL
export function generateMDOUrl(start: { lat: number; lng: number }, end: { lat: number; lng: number }): string {
  return `https://mdo-carshare.com/reserve?startLat=${start.lat}&startLng=${start.lng}&endLat=${end.lat}&endLng=${end.lng}`;
}
