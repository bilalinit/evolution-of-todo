/**
 * Tasks API Route - Proxy to backend-api via Dapr
 *
 * This Next.js API route proxies task requests to the backend-api service
 * through Dapr's service invocation building block.
 *
 * GET/POST /api/{userId}/tasks -> Dapr -> backend-api:8000/api/{userId}/tasks
 */

import { NextRequest, NextResponse } from 'next/server';

const DAPR_HOST = process.env.DAPR_HOST || 'localhost';
const DAPR_HTTP_PORT = process.env.DAPR_HTTP_PORT || '3500';
const BACKEND_APP = 'backend-api';

type RouteContext = {
  params: Promise<{ userId: string }>;
};

/**
 * GET /api/{userId}/tasks - List tasks for authenticated user
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { userId } = await context.params;
    const searchParams = request.nextUrl.searchParams.toString();
    const path = `/v1.0/invoke/${BACKEND_APP}/method/api/${userId}/tasks${searchParams ? `?${searchParams}` : ''}`;

    const response = await fetch(`http://${DAPR_HOST}:${DAPR_HTTP_PORT}${path}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Tasks GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/{userId}/tasks - Create a new task
 */
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { userId } = await context.params;
    const body = await request.json();
    const path = `/v1.0/invoke/${BACKEND_APP}/method/api/${userId}/tasks`;

    const response = await fetch(`http://${DAPR_HOST}:${DAPR_HTTP_PORT}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    console.error('Tasks POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
