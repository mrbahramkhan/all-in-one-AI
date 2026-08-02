import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const pathSegments = await Promise.resolve(params.path);
  const pathname = '/' + pathSegments.join('/');
  
  try {
    const body = await request.json().catch(() => null);
    const url = `${BACKEND_URL}${pathname}`;
    
    console.log('[v0 proxy] POST', url, 'body:', body);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Forward authorization header if present
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['authorization'] = authHeader;
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const responseBody = await response.json().catch(() => ({}));
    console.log('[v0 proxy] POST response:', response.status, responseBody);
    return NextResponse.json(responseBody, { status: response.status });
  } catch (error: any) {
    console.error('[v0 proxy] Error:', error.message);
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const pathSegments = await Promise.resolve(params.path);
  const pathname = '/' + pathSegments.join('/');
  
  try {
    const url = `${BACKEND_URL}${pathname}?${new URL(request.url).searchParams}`;
    
    console.log('[v0 proxy] GET', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...Object.fromEntries(
          Array.from(request.headers.entries()).filter(
            ([key]) => !['host', 'connection'].includes(key.toLowerCase())
          )
        ),
      },
    });

    const responseBody = await response.json().catch(() => ({}));
    return NextResponse.json(responseBody, { status: response.status });
  } catch (error: any) {
    console.error('[v0 proxy] Error:', error.message);
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const pathSegments = await Promise.resolve(params.path);
  const pathname = '/' + pathSegments.join('/');
  
  try {
    const body = await request.json().catch(() => null);
    const url = `${BACKEND_URL}${pathname}`;
    
    console.log('[v0 proxy] PATCH', url);
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...Object.fromEntries(
          Array.from(request.headers.entries()).filter(
            ([key]) => !['host', 'connection', 'content-length'].includes(key.toLowerCase())
          )
        ),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const responseBody = await response.json().catch(() => ({}));
    return NextResponse.json(responseBody, { status: response.status });
  } catch (error: any) {
    console.error('[v0 proxy] Error:', error.message);
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const pathSegments = await Promise.resolve(params.path);
  const pathname = '/' + pathSegments.join('/');
  
  try {
    const url = `${BACKEND_URL}${pathname}`;
    
    console.log('[v0 proxy] DELETE', url);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        ...Object.fromEntries(
          Array.from(request.headers.entries()).filter(
            ([key]) => !['host', 'connection'].includes(key.toLowerCase())
          )
        ),
      },
    });

    const responseBody = await response.json().catch(() => ({}));
    return NextResponse.json(responseBody, { status: response.status });
  } catch (error: any) {
    console.error('[v0 proxy] Error:', error.message);
    return NextResponse.json(
      { success: false, error: { message: error.message } },
      { status: 500 }
    );
  }
}
