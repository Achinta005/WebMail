import { NextResponse } from 'next/server';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';
const FICXUS_URL = `${SERVER_URL.replace(/\/$/, '')}/api/webmail`;

export async function GET() {
  try {
    const res = await fetch(`${FICXUS_URL}/status`, {
      cache: 'no-store',
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error reading status';
    return NextResponse.json(
      {
        configured: false,
        domainVerified: false,
        domainName: 'achinta.me',
        defaultFrom: 'work@achinta.me',
        webhookUrl: 'http://localhost:3001/api/webmail/webhook',
        error: message,
      },
      { status: 502 }
    );
  }
}

export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'Configuration is managed centrally in Ficxus via Doppler.',
  });
}

