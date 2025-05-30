import { TRANSPORT_MODES } from './transportModes';

// Route calculation
export async function calculateRoute(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
  mode: keyof typeof TRANSPORT_MODES
) {
  try {
    console.log('Calculating route:', { start, end, mode });
    
    const transportMode = TRANSPORT_MODES[mode];
    const endpoint = transportMode.apiEndpoint;
    
    if (!endpoint) {
      throw new Error(`No API endpoint configured for mode: ${mode}`);
    }

    console.log('Making API call to:', endpoint);
    
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    if (!apiKey) {
      throw new Error('API key not configured');
    }

    // Add API key and coordinates as query parameters
    const url = new URL(endpoint);
    url.searchParams.append('api_key', apiKey);
    url.searchParams.append('start', `${start.lng},${start.lat}`);
    url.searchParams.append('end', `${end.lng},${end.lat}`);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/geo+json;charset=UTF-8'
      }
    });

    console.log('API response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('API error details:', errorData);
      throw new Error(`API error: ${response.status} ${response.statusText}\nDetails: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log('API response data:', data);
    
    // Validate the response structure
    if (!data || !data.summary) {
      throw new Error('Invalid response format from API');
    }

    return data;
  } catch (error) {
    console.error('Routing error:', error);
    throw error;
  }
}

interface RouteResponse {
  features: Array<{
    geometry: {
      coordinates: [number, number][];
    };
  }>;
  summary: {
    duration: number;
    distance: number;
  };
}

// Get route duration in minutes
export function getRouteDuration(route: RouteResponse): number {
  if (!route || !route.summary) return 0;
  return route.summary.duration / 60; // Convert to minutes
}

// Get route distance in miles
export function getRouteDistance(route: RouteResponse): number {
  if (!route || !route.summary) return 0;
  return route.summary.distance / 1609.34; // Convert to miles
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
