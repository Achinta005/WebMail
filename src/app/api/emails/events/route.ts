import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';
const FICXUS_EVENTS_URL = `${SERVER_URL.replace(/\/$/, '')}/api/webmail/events`;

export async function GET() {
  try {
    const response = await fetch(FICXUS_EVENTS_URL, {
      headers: {
        Accept: 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
      cache: 'no-store',
    });

    if (!response.ok || !response.body) {
      return new NextResponse('Error connecting to SSE upstream', {
        status: response.status || 502,
      });
    }

    // Stream directly through to browser client
    return new NextResponse(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'SSE stream error';
    return new NextResponse(msg, { status: 502 });
  }
}
