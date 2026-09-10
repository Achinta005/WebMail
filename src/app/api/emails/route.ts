import { NextRequest, NextResponse } from 'next/server';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';
const FICXUS_URL = `${SERVER_URL.replace(/\/$/, '')}/api/webmail`;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'aliases') {
      const res = await fetch(`${FICXUS_URL}/aliases`, { cache: 'no-store' });
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }

    const res = await fetch(`${FICXUS_URL}/emails?${searchParams.toString()}`, {
      cache: 'no-store',
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to connect to Ficxus backend';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.action === 'create_alias') {
      const res = await fetch(`${FICXUS_URL}/aliases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alias: body.alias, name: body.name }),
      });
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }

    const res = await fetch(`${FICXUS_URL}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to process request through Ficxus';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

