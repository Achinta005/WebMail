import { NextResponse } from 'next/server';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';
const FICXUS_URL = `${SERVER_URL.replace(/\/$/, '')}/api/webmail`;

export async function POST() {
  try {
    const res = await fetch(`${FICXUS_URL}/sync`, {
      method: 'POST',
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error syncing emails';
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}

