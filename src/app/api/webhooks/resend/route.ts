import { NextRequest, NextResponse } from 'next/server';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';
const FICXUS_URL = `${SERVER_URL.replace(/\/$/, '')}/api/webmail`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(`${FICXUS_URL}/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Webhook proxy error';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

