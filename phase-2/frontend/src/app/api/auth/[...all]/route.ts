/**
 * Better Auth API Route
 *
 * Handles all authentication-related API requests by proxying to the backend.
 * This route acts as a bridge between the frontend and the authentication backend.
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ all: string[] }> }
) {
  return handleRequest(request, params);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ all: string[] }> }
) {
  return handleRequest(request, params);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ all: string[] }> }
) {
  return handleRequest(request, params);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ all: string[] }> }
) {
  return handleRequest(request, params);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ all: string[] }> }
) {
  return handleRequest(request, params);
}

async function handleRequest(
  request: NextRequest,
  paramsPromise: Promise<{ all: string[] }>
) {
  const params = await paramsPromise;
  const { all } = params;
  const path = all.join("/");

  // Backend API URL
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const targetUrl = `${backendUrl}/api/auth/${path}`;

  try {
    // Forward the request to the backend
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        "Content-Type": "application/json",
        // Forward any auth headers if present
        ...(request.headers.get("authorization") && {
          authorization: request.headers.get("authorization")!,
        }),
        ...(request.headers.get("cookie") && {
          cookie: request.headers.get("cookie")!,
        }),
      },
      body: request.body ? await request.text() : undefined,
    });

    // Get the response data
    const data = await response.json().catch(() => ({}));

    // Return the response with appropriate status
    return NextResponse.json(data, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        // Forward cookies from backend if present
        ...(response.headers.get("set-cookie") && {
          "set-cookie": response.headers.get("set-cookie")!,
        }),
        "content-type": "application/json",
      },
    });
  } catch (error) {
    console.error("Auth API proxy error:", error);
    return NextResponse.json(
      {
        error: {
          message: "Authentication service unavailable",
          status: 503,
        },
      },
      { status: 503 }
    );
  }
}