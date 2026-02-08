/**
 * Profile API Route - Proxy to backend-api via Dapr
 *
 * This Next.js API route proxies profile requests to the backend-api service
 * through Dapr's service invocation building block.
 *
 * GET/PATCH /api/{userId}/profile -> Dapr -> backend-api:8000/api/{userId}/profile
 */

import { NextRequest, NextResponse } from 'next/server';

const DAPR_HOST = process.env.DAPR_HOST || 'localhost';
const DAPR_HTTP_PORT = process.env.DAPR_HTTP_PORT || '3500';
const BACKEND_APP = 'backend-api';

type RouteContext = {
  params: Promise<{ userId: string }>;
};

/**
 * GET /api/{userId}/profile - Get user profile
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { userId } = await context.params;
    const path = `/v1.0/invoke/${BACKEND_APP}/method/api/${userId}/profile`;

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
    console.error('Profile GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/{userId}/profile - Update user profile
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { userId } = await context.params;
    const body = await request.json();
    const path = `/v1.0/invoke/${BACKEND_APP}/method/api/${userId}/profile`;

    const response = await fetch(`http://${DAPR_HOST}:${DAPR_HTTP_PORT}${path}`, {
      method: 'PATCH',
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
    return NextResponse.json(data);

  } catch (error) {
    console.error('Profile PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
