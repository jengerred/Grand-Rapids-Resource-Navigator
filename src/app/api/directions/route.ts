import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { TRANSPORT_MODES } from '@/lib/routing/transportModes';

// Interface for request body
interface RouteRequest {
  start: { lat: number; lng: number };
  end: { lat: number; lng: number };
  transportMode: keyof typeof TRANSPORT_MODES;
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
    console.log('API route hit');
    
    // Parse request body
    const { start, end, transportMode } = await request.json() as RouteRequest;
    
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

      const apiKey = process.env.NEXT_PUBLIC_API_KEY;
      if (!apiKey) {
        throw new Error('API key not configured');
      }

      const url = new URL(transportModeConfig.apiEndpoint);
      url.searchParams.append('api_key', apiKey);
      url.searchParams.append('start', `${start.lng},${start.lat}`);
      url.searchParams.append('end', `${end.lng},${end.lat}`);
      url.searchParams.append('instructions', 'true');

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
      console.log('Raw API Response:', data);
      
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
      if (!data || !data.features || !Array.isArray(data.features) || data.features.length === 0) {
        console.error('Validation Failed: Missing features');
        throw new Error('Invalid API response: missing features');
      }

      const firstFeature = data.features[0];
      if (!firstFeature || !firstFeature.geometry || !firstFeature.geometry.coordinates) {
        console.error('Validation Failed: Missing coordinates');
        throw new Error('Invalid API response: missing coordinates');
      }

      const coordinates = firstFeature.geometry.coordinates;
      if (!Array.isArray(coordinates) || coordinates.length === 0) {
        console.error('Validation Failed: Empty coordinates array');
        throw new Error('Invalid API response: empty coordinates array');
      }

      // Log the actual coordinates
      console.log('Final Coordinates:', coordinates);

      // Extract instructions from the response
      const instructions = data.features?.[0]?.properties?.segments?.[0]?.steps || [];
      console.log('Extracted Instructions:', instructions);
      console.log('First instruction:', instructions[0]);

      // Add our color configuration and instructions to the response
      const enhancedData = {
        ...data,
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
