import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { TRANSPORT_MODES } from '@/lib/routing/transportModes';

// Interface for request body
interface RouteRequest {
  start: { lat: number; lng: number };
  end: { lat: number; lng: number };
  transportMode: keyof typeof TRANSPORT_MODES;
  language?: string;
}

// Interfaces for Mapbox API response
export interface MapboxManeuver {
  instruction: string;
  // Add other properties from the maneuver object if needed
}

export interface MapboxStep {
  maneuver: MapboxManeuver;
  distance: number;
  duration: number;
  // Add other properties from the step object if needed
}

export interface MapboxLeg {
  steps?: MapboxStep[];
  distance?: number;
  duration?: number;
  // Add other properties from the leg object if needed
}

export interface MapboxRoute {
  legs?: MapboxLeg[];
  geometry: {
    coordinates: Array<[number, number]>;
  };
  distance?: number;
  duration?: number;
  // Add other properties from the route object if needed
}

export interface MapboxDirectionsResponse {
  routes: MapboxRoute[];
  // Add other properties from the response if needed
}

// Type for unknown errors
interface TypedError {
  message: string;
  stack?: string;
}

interface ErrorResponse {
  error: string;
  details: TypedError;
}

// Type guard for Error objects
function isError(e: unknown): e is Error {
  return e instanceof Error;
}

// Function to safely get error message
function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message;
  }
  return String(error);
}

export async function POST(request: NextRequest) {
  try {
    console.log('API route hit - Request Headers:', {
      headers: Object.fromEntries(request.headers.entries()),
      cookies: request.cookies.getAll().map(c => ({ name: c.name, value: c.value }))
    });
    
    // Parse request body
    const body = await request.json();
    console.log('Request body:', body);
    
    const { start, end, transportMode } = body as RouteRequest;
    
    // Validate required parameters
    if (!start || !end || !transportMode) {
      return NextResponse.json(
        { error: 'Missing required parameters', details: { start, end, transportMode } },
        { status: 400 }
      );
    }

    // Validate transport mode
    const transportModeConfig = TRANSPORT_MODES[transportMode];
    if (!transportModeConfig) {
      return NextResponse.json(
        { 
          error: 'Invalid transport mode', 
          details: { 
            requestedMode: transportMode, 
            availableModes: Object.keys(TRANSPORT_MODES) 
          } 
        },
        { status: 400 }
      );
    }

    console.log('Making route calculation with:', { start, end, transportMode });
    
    try {
      if (!transportModeConfig || !transportModeConfig.apiEndpoint) {
        throw new Error(`No API endpoint configured for mode: ${transportMode}`);
      }

      const apiKey = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
      if (!apiKey) {
        throw new Error('Mapbox access token not configured');
      }

      // Get language from request body first, then cookie, then default to English
      const language = (body.language || request.cookies.get('language')?.value || 'en').toLowerCase();
      const isSpanish = language === 'es';
      const languageCode = isSpanish ? 'es' : 'en';
      
      console.log('Language detection:', {
        fromBody: body.language,
        fromCookie: request.cookies.get('language')?.value,
        finalLanguage: languageCode
      });
      
      console.log('Language settings:', {
        cookieValue: request.cookies.get('language')?.value,
        isSpanish,
        languageCode,
        allCookies: request.cookies.getAll()
      });
      
      // Construct the base URL with coordinates
      const coordinates = `${start.lng},${start.lat};${end.lng},${end.lat}`;
      const baseUrl = `https://api.mapbox.com/directions/v5/mapbox/${transportModeConfig.profile}/${coordinates}`;
      const url = new URL(baseUrl);
      
      // Add all required parameters as query parameters
      url.searchParams.append('steps', 'true');
      url.searchParams.append('language', languageCode);
      url.searchParams.append('access_token', apiKey);
      url.searchParams.append('geometries', 'geojson');
      url.searchParams.append('overview', 'full');
      
      console.log('Final API URL:', url.toString());
      
      // Debug log language settings
      console.log('Language settings:', {
        cookieValue: request.cookies.get('language')?.value,
        isSpanish,
        languageParam: url.searchParams.get('language'),
        allCookies: request.cookies.getAll()
      });
      
      console.log('Mapbox API URL:', url.toString());

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/geo+json;charset=UTF-8'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error || `API error: ${response.status} ${response.statusText}`;
        console.error('API Response Error:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          errorMessage
        });
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Log the raw API response
      console.log('Raw API Response:', JSON.stringify(data, null, 2));
      
      // Debug log the route summary
      if (data.routes && data.routes[0]) {
        interface RouteLeg {
          duration?: number;
          distance?: number;
          steps?: Array<{ length: number }>;
        }
        
        console.log('Route summary:', {
          duration: data.routes[0].duration,
          distance: data.routes[0].distance,
          legs: data.routes[0].legs?.map((leg: RouteLeg) => ({
            duration: leg.duration,
            distance: leg.distance,
            steps: leg.steps?.length
          }))
        });
      }
      
      // Log the exact structure we're looking for
      console.log('Response Structure:', {
        hasRoutes: data?.routes !== undefined,
        routesLength: Array.isArray(data?.routes) ? data.routes.length : 'not an array',
        hasSegments: data?.routes?.[0]?.segments !== undefined,
        segmentsLength: Array.isArray(data?.routes?.[0]?.segments) ? data.routes[0].segments.length : 'not an array',
        hasSteps: data?.routes?.[0]?.segments?.[0]?.steps !== undefined,
        stepsLength: Array.isArray(data?.routes?.[0]?.segments?.[0]?.steps) ? data.routes[0].segments[0].steps.length : 'not an array',
        firstStep: data?.routes?.[0]?.segments?.[0]?.steps?.[0]
      });

      // Log the exact keys in the response
      console.log('Response Keys:', Object.keys(data));

      // Log the features if they exist
      if (data.features) {
        console.log('Features:', {
          count: data.features.length,
          firstFeature: data.features[0]
        });
      }

      // Log the routes if they exist
      if (data.routes) {
        console.log('Routes:', {
          count: data.routes.length,
          firstRoute: data.routes[0]
        });
      }

      // Log the exact structure we're looking for
      console.log('Response Structure:', {
        hasRoutes: data?.routes !== undefined,
        routesLength: Array.isArray(data?.routes) ? data.routes.length : 'not an array',
        hasSegments: data?.routes?.[0]?.segments !== undefined,
        segmentsLength: Array.isArray(data?.routes?.[0]?.segments) ? data.routes[0].segments.length : 'not an array',
        hasSteps: data?.routes?.[0]?.segments?.[0]?.steps !== undefined,
        stepsLength: Array.isArray(data?.routes?.[0]?.segments?.[0]?.steps) ? data.routes[0].segments[0].steps.length : 'not an array'
      });

      // Log the actual coordinates if they exist
      if (data.features && data.features[0] && data.features[0].geometry && data.features[0].geometry.coordinates) {
        console.log('API Coordinates:', {
          firstCoordinate: data.features[0].geometry.coordinates[0],
          coordinateCount: data.features[0].geometry.coordinates.length,
          coordinateType: typeof data.features[0].geometry.coordinates[0]
        });
      }

      // Log the structure of the response
      console.log('Response Structure:', {
        hasFeatures: data?.features !== undefined,
        featuresType: typeof data?.features,
        featuresLength: Array.isArray(data?.features) ? data.features.length : 'not an array',
        firstFeature: data?.features?.[0] || 'no first feature',
        coordinates: data?.features?.[0]?.geometry?.coordinates || 'no coordinates'
      });

      // Validate the API response
      if (!data || !data.routes || !Array.isArray(data.routes) || data.routes.length === 0) {
        console.error('Validation Failed: Missing routes in response');
        throw new Error('Invalid Mapbox response: missing routes');
      }

      const route = data.routes[0];
      if (!route || !route.legs || !route.geometry || !route.geometry.coordinates) {
        console.error('Validation Failed: Invalid route data');
        throw new Error('Invalid Mapbox response: missing route data');
      }

      const routeCoordinates = route.geometry.coordinates;
      if (!Array.isArray(routeCoordinates) || routeCoordinates.length === 0) {
        console.error('Validation Failed: Empty coordinates array');
        throw new Error('Invalid Mapbox response: empty coordinates');
      }

      // Extract instructions from the response
      interface RouteStep {
        maneuver: {
          instruction: string;
        };
        distance: number;
        duration: number;
      }
      
      const instructions = route.legs[0]?.steps?.map((step: RouteStep) => ({
        instruction: step.maneuver.instruction,
        distance: step.distance,
        duration: step.duration
      })) || [];

      // Calculate total distance and duration from the first leg
      const totalDistance = route.distance || (route.legs?.[0]?.distance ?? 0);
      const totalDuration = route.duration || (route.legs?.[0]?.duration ?? 0);
      
      console.log('Route summary values:', {
        routeDistance: route.distance,
        legDistance: route.legs?.[0]?.distance,
        routeDuration: route.duration,
        legDuration: route.legs?.[0]?.duration,
        finalDistance: totalDistance,
        finalDuration: totalDuration
      });

      // Add our color configuration and instructions to the response
      const enhancedData = {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: routeCoordinates
          }
        }],
        summary: {
          distance: totalDistance,
          duration: totalDuration
        },
        color: transportModeConfig.color,
        mode: transportMode,
        instructions: instructions
      };

      return NextResponse.json(enhancedData);
    } catch (error: unknown) {
      const errorLog = {
        message: getErrorMessage(error),
        stack: isError(error) ? (error as Error).stack : undefined
      } as const;

      console.error('Error in directions API:', {
        error: errorLog,
        requestDetails: {
          start,
          end,
          transportMode,
          endpoint: transportModeConfig.apiEndpoint
        }
      });

      const errorResponse: ErrorResponse = {
        error: errorLog.message,
        details: errorLog
      };

      console.error('Error in directions API:', {
        error: {
          message: errorLog.message,
        },
        response: errorResponse
      });

      return NextResponse.json(errorResponse, { status: 500 });
    }
  } catch (error: unknown) {
    const errorLog = {
      message: getErrorMessage(error),
      stack: isError(error) ? (error as Error).stack : undefined
    } as const;
      
    console.error('Error in route handler:', {
      error: errorLog,
      response: {
        error: 'Internal server error',
        details: errorLog
      }
    });

    return NextResponse.json({
      error: 'Internal server error',
      details: errorLog
    }, { status: 500 });
  }
}
