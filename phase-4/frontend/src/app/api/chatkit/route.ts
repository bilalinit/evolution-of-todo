import { NextRequest, NextResponse } from 'next/server'
import { IS_DEVELOPMENT } from '@/lib/constants'

/**
 * ChatKit Proxy Route
 * 
 * Forwards all ChatKit requests to the backend with auth header injection.
 * This follows the chatkit-2 skill pattern for proper auth handling.
 */

// Server-side code uses internal Kubernetes service URL
// Client-side code (browser) uses NEXT_PUBLIC_BACKEND_URL
const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
    try {
        if (IS_DEVELOPMENT) {
            console.log('🔍 ChatKit proxy: Starting request...')
        }

        // Get the user session from Better Auth
        const authResponse = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
            method: 'GET',
            headers: {
                'Cookie': request.headers.get('cookie') || '',
            },
        })

        let userId = 'anonymous'

        if (authResponse.ok) {
            const authSession = await authResponse.json()
            if (authSession?.user?.id) {
                userId = authSession.user.id
                // Security: Don't log user IDs
            }
        }

        // Forward the request body to backend
        const body = await request.arrayBuffer()

        const backendResponse = await fetch(`${BACKEND_URL}/api/chatkit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id': userId,
                'Cookie': request.headers.get('cookie') || '',
            },
            body: body,
        })

        // Security: Don't log response headers

        // Handle streaming responses (SSE)
        const contentType = backendResponse.headers.get('content-type') || ''
        if (contentType.includes('text/event-stream')) {
            if (IS_DEVELOPMENT) {
                console.log('🔍 ChatKit proxy: Returning streaming response')
            }
            return new Response(backendResponse.body, {
                status: backendResponse.status,
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                    'X-Accel-Buffering': 'no',
                },
            })
        }

        // Handle JSON responses
        const data = await backendResponse.json()
        if (IS_DEVELOPMENT) {
            console.log('🔍 ChatKit proxy: Returning JSON response')
        }
        return NextResponse.json(data, { status: backendResponse.status })

    } catch (error) {
        console.error('❌ ChatKit proxy error:', error)
        return NextResponse.json(
            { error: { code: 'PROXY_ERROR', message: 'Failed to process ChatKit request' } },
            { status: 500 }
        )
    }
}
