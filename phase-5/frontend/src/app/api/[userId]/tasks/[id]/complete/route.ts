/**
 * Task Complete API Route - Proxy to backend-api via Dapr
 *
 * This Next.js API route proxies task completion requests to the backend-api service
 * through Dapr's service invocation building block.
 *
 * PATCH /api/{userId}/tasks/[id]/complete -> Dapr -> backend-api:8000/api/{userId}/tasks/{id}/complete
 */

import { NextRequest, NextResponse } from 'next/server';

const DAPR_HOST = process.env.DAPR_HOST || 'localhost';
const DAPR_HTTP_PORT = process.env.DAPR_HTTP_PORT || '3500';
const BACKEND_APP = 'backend-api';

type RouteContext = {
  params: Promise<{ userId: string; id: string }>;
};

/**
 * PATCH /api/{userId}/tasks/[id]/complete - Mark a task as completed
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { userId, id } = await context.params;
    const path = `/v1.0/invoke/${BACKEND_APP}/method/api/${userId}/tasks/${id}/complete`;

    const response = await fetch(`http://${DAPR_HOST}:${DAPR_HTTP_PORT}${path}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Task Complete PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
