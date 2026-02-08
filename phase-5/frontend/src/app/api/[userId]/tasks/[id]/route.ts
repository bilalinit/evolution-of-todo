/**
 * Task Detail API Route - Proxy to backend-api via Dapr
 *
 * GET/PATCH/DELETE /api/{userId}/tasks/[id] -> Dapr -> backend-api:8000/api/{userId}/tasks/{id}
 */

import { NextRequest, NextResponse } from 'next/server';

const DAPR_HOST = process.env.DAPR_HOST || 'localhost';
const DAPR_HTTP_PORT = process.env.DAPR_HTTP_PORT || '3500';
const BACKEND_APP = 'backend-api';

type RouteContext = {
  params: Promise<{ userId: string; id: string }>;
};

/**
 * GET /api/{userId}/tasks/[id] - Get a specific task
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { userId, id } = await context.params;
    const path = `/v1.0/invoke/${BACKEND_APP}/method/api/${userId}/tasks/${id}`;

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
    console.error('Task GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/{userId}/tasks/[id] - Update a task
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { userId, id } = await context.params;
    const body = await request.json();
    const path = `/v1.0/invoke/${BACKEND_APP}/method/api/${userId}/tasks/${id}`;

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
    console.error('Task PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/{userId}/tasks/[id] - Delete a task
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { userId, id } = await context.params;
    const path = `/v1.0/invoke/${BACKEND_APP}/method/api/${userId}/tasks/${id}`;

    const response = await fetch(`http://${DAPR_HOST}:${DAPR_HTTP_PORT}${path}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    if (!response.ok && response.status !== 204) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      return NextResponse.json(error, { status: response.status });
    }

    return new NextResponse(null, { status: 204 });

  } catch (error) {
    console.error('Task DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
