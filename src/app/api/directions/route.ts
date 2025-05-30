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

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/geo+json;charset=UTF-8'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`API error: ${response.status} ${response.statusText}\nDetails: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      return NextResponse.json(data);
      return NextResponse.json(data);
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
        error: 'Failed to get directions',
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
