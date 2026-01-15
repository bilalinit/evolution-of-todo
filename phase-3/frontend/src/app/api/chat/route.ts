/**
 * Chat API Route
 *
 * Frontend proxy for backend chat endpoint
 * Handles JWT token extraction and forwards requests to backend
 */

import { NextRequest, NextResponse } from "next/server";

// Backend URL from environment or default
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    // Extract JWT token from Authorization header
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required - missing or invalid Authorization header",
          type: "auth_error",
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Parse request body
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Message cannot be empty",
          type: "validation_error",
        },
        { status: 400 }
      );
    }

    if (message.length > 4000) {
      return NextResponse.json(
        {
          success: false,
          error: "Message too long (max 4000 characters)",
          type: "validation_error",
        },
        { status: 400 }
      );
    }

    // Forward request to backend
    const backendResponse = await fetch(`${BACKEND_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    });

    // Handle backend response
    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));

      return NextResponse.json(
        {
          success: false,
          error: errorData.error || `Backend error: ${backendResponse.status}`,
          type: errorData.type || "backend_error",
        },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();

    // Return backend response directly
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error("Chat API error:", error);

    if (error instanceof SyntaxError && error.message.includes("JSON")) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body",
          type: "validation_error",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        type: "server_error",
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET(request: NextRequest) {
  try {
    // Extract JWT token from Authorization header
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required - missing or invalid Authorization header",
          type: "auth_error",
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Check backend health
    const backendResponse = await fetch(`${BACKEND_URL}/api/chat/health`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: "Backend health check failed",
          type: "backend_error",
        },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();

    return NextResponse.json(
      {
        success: true,
        data: {
          frontend: "healthy",
          backend: data,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Health check error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Health check failed",
        type: "server_error",
      },
      { status: 500 }
    );
  }
}