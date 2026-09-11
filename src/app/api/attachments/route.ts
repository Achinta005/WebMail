import { NextRequest, NextResponse } from 'next/server';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';
const FICXUS_URL = `${SERVER_URL.replace(/\/$/, '')}/api/webmail`;

/**
 * POST /api/attachments
 * Forwards multipart/form-data upload to the Ficxus backend.
 * Returns the AttachmentMeta JSON (id, filename, content_type, size, content_id).
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Re-build FormData to forward to the backend
    const forwardForm = new FormData();
    const file = formData.get('file');
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    forwardForm.append('file', file);

    const res = await fetch(`${FICXUS_URL}/attachments`, {
      method: 'POST',
      body: forwardForm,
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to upload attachment';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

/**
 * GET /api/attachments?id=<uuid>
 * Returns the Cloudinary redirect URL for an attachment.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }

    // Call Ficxus attachment endpoint (do not auto-follow redirects so we can preserve redirect or stream)
    const res = await fetch(`${FICXUS_URL}/attachments/${id}`, {
      cache: 'no-store',
      redirect: 'manual',
    });

    // If Ficxus returned a redirect (e.g. 302 to Cloudinary or signed URL)
    if (res.status === 301 || res.status === 302 || res.status === 307 || res.status === 308) {
      const location = res.headers.get('location');
      if (location) {
        return NextResponse.redirect(location, 302);
      }
    }

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      if (data.redirectUrl) {
        return NextResponse.redirect(data.redirectUrl, 302);
      }
      return NextResponse.json(data, { status: res.status });
    }

    // If it is binary stream / file content
    const headers = new Headers();
    const contentDisposition = res.headers.get('content-disposition');
    const contentLength = res.headers.get('content-length');
    if (contentType) headers.set('Content-Type', contentType);
    if (contentDisposition) headers.set('Content-Disposition', contentDisposition);
    if (contentLength) headers.set('Content-Length', contentLength);

    return new NextResponse(res.body, {
      status: res.status,
      headers,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch attachment';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
