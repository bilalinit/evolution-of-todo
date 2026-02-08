/**
 * Notification Detail API Route - Proxy to notification-service via Dapr
 *
 * This Next.js API route proxies individual notification requests to the notification-service
 * through Dapr's service invocation building block.
 *
 * PATCH/DELETE /api/{userId}/notifications/[id] -> Dapr -> notification-service:8002/api/notifications/{id}
 */

import { NextRequest, NextResponse } from 'next/server';

const DAPR_HOST = process.env.DAPR_HOST || 'localhost';
const DAPR_HTTP_PORT = process.env.DAPR_HTTP_PORT || '3500';
const NOTIFICATION_SERVICE = 'notification-service';

type RouteContext = {
  params: Promise<{ userId: string; id: string }>;
};

/**
 * PATCH /api/{userId}/notifications/[id] - Mark notification as read
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { userId, id } = await context.params;
    const path = `/v1.0/invoke/${NOTIFICATION_SERVICE}/method/api/notifications/${id}`;

    const response = await fetch(`http://${DAPR_HOST}:${DAPR_HTTP_PORT}${path}`, {
      method: 'PATCH',
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
    console.error('Notification PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/{userId}/notifications/[id] - Delete a notification
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { userId, id } = await context.params;
    const path = `/v1.0/invoke/${NOTIFICATION_SERVICE}/method/api/notifications/${id}`;

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
    console.error('Notification DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
