import { NextResponse } from 'next/server';
import { calculateRoute } from '@/lib/routing';
import { TRANSPORT_MODES } from '@/lib/routing/transportModes';

export async function POST(request: Request) {
  try {
    const { start, end, transportMode } = await request.json();

    if (!start || !end || !transportMode) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const transportModeConfig = TRANSPORT_MODES[transportMode];
    if (!transportModeConfig) {
      return NextResponse.json(
        { error: 'Invalid transport mode' },
        { status: 400 }
      );
    }

    const routeData = await calculateRoute(start, end, transportMode);
    return NextResponse.json(routeData);
  } catch (error) {
    console.error('Error in directions API:', error);
    return NextResponse.json(
      { error: 'Failed to get directions' },
      { status: 500 }
    );
  }
}
