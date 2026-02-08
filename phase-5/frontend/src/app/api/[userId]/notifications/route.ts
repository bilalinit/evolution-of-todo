/**
 * Notifications API Route - Proxy to notification-service via Dapr
 *
 * This Next.js API route proxies notification requests to the notification-service
 * through Dapr's service invocation building block.
 *
 * GET /api/{userId}/notifications -> Dapr -> notification-service:8002/api/{userId}/notifications
 */

import { NextRequest, NextResponse } from 'next/server';

const DAPR_HOST = process.env.DAPR_HOST || 'localhost';
const DAPR_HTTP_PORT = process.env.DAPR_HTTP_PORT || '3500';
const NOTIFICATION_SERVICE = 'notification-service';

type RouteContext = {
  params: Promise<{ userId: string }>;
};

/**
 * GET /api/{userId}/notifications - List notifications for authenticated user
 *
 * Query params:
 * - unread_only: If true, only return unread notifications
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { userId } = await context.params;
    const searchParams = request.nextUrl.searchParams.toString();
    const path = `/v1.0/invoke/${NOTIFICATION_SERVICE}/method/api/${userId}/notifications${searchParams ? `?${searchParams}` : ''}`;

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
    console.error('Notifications GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
