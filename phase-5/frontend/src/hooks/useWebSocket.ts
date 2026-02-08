/**
 * useWebSocket Hook
 *
 * React hook for WebSocket connection management.
 * Based on Next.js and React WebSocket best practices from Context7.
 *
 * Features:
 * - Automatic connection on mount
 * - Clean disconnect on unmount
 * - Real-time message handling
 * - Connection state tracking
 * - Type-safe message handling
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { getWebSocketManager, WebSocketManager, WebSocketMessage, WebSocketReadyState } from '@/lib/websocket';

export interface UseWebSocketOptions {
  enabled?: boolean;
  onMessage?: (message: WebSocketMessage) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: () => void;
}

export interface UseWebSocketReturn {
  readyState: WebSocketReadyState;
  isConnected: boolean;
  sendMessage: (message: WebSocketMessage) => void;
  lastMessage: WebSocketMessage | null;
}

/**
 * Custom hook for WebSocket connection
 *
 * @param url - WebSocket server URL
 * @param options - Configuration options
 * @returns WebSocket connection interface
 *
 * @example
 * ```tsx
 * const { isConnected, lastMessage } = useWebSocket(
 *   'ws://localhost:8000/ws/user-123',
 *   {
 *     onMessage: (msg) => console.log('Received:', msg),
 *     enabled: true
 *   }
 * );
 * ```
 */
export function useWebSocket(
  url: string,
  options: UseWebSocketOptions = {}
): UseWebSocketReturn {
  const { enabled = true, onMessage, onOpen, onClose, onError } = options;

  const managerRef = useRef<WebSocketManager | null>(null);
  const [readyState, setReadyState] = useState<WebSocketReadyState>('UNINSTANTIATED');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const didUnmount = useRef(false);

  /**
   * Send a message through the WebSocket
   */
  const sendMessage = useCallback((message: WebSocketMessage) => {
    managerRef.current?.send(message);
  }, []);

  /**
   * Initialize WebSocket connection
   */
  useEffect(() => {
    if (!enabled || didUnmount.current) {
      return;
    }

    // Create WebSocket manager with event handlers
    const manager = getWebSocketManager({
      url,
      reconnectAttempts: 10,
      reconnectInterval: 1000,
      maxReconnectInterval: 10000,
      onOpen: () => {
        if (!didUnmount.current) {
          setReadyState('OPEN');
          onOpen?.();
        }
      },
      onClose: () => {
        if (!didUnmount.current) {
          setReadyState('CLOSED');
          onClose?.();
        }
      },
      onError: () => {
        if (!didUnmount.current) {
          onError?.();
        }
      },
      onMessage: (message: WebSocketMessage) => {
        if (!didUnmount.current) {
          setLastMessage(message);
          onMessage?.(message);
        }
      },
    });

    managerRef.current = manager;
    setReadyState('CONNECTING');

    // Connect to WebSocket server
    manager.connect();

    // Cleanup on unmount
    return () => {
      didUnmount.current = true;
      manager.disconnect();
    };
  }, [url, enabled, onMessage, onOpen, onClose, onError]);

  /**
   * Update ready state from manager
   */
  useEffect(() => {
    if (managerRef.current && enabled) {
      setReadyState(managerRef.current.getReadyState());
    }
  }, [enabled]);

  return {
    readyState,
    isConnected: readyState === 'OPEN',
    sendMessage,
    lastMessage,
  };
}

/**
 * Hook for real-time task updates with WebSocket → SSE fallback
 *
 * Tries WebSocket first, falls back to SSE after 2 connection failures.
 * SSE is more stable over proxies/tunnels like Minikube.
 *
 * Subscribes to all task-related events:
 * - task-created
 * - task-updated
 * - task-deleted
 * - task-completed
 *
 * @param userId - User ID for WebSocket/SSE connection
 * @param onTaskUpdate - Handler for task update events
 * @param enabled - Whether to enable real-time updates
 *
 * @example
 * ```tsx
 * useTaskRealtimeUpdates(userId, (event) => {
 *   // Refresh task list for any task change
 *   refetch();
 * });
 * ```
 */
export function useTaskRealtimeUpdates(
  userId: string | undefined,
  onTaskUpdate: (event: { type: string; data: unknown }) => void,
  enabled: boolean = true
): void {
  const wsUrl = userId
    ? `${process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://127.0.0.1:8004'}/ws?user_id=${userId}`
    : '';

  const sseUrl = userId
    ? `${process.env.NEXT_PUBLIC_WEBSOCKET_URL?.replace('ws://', 'http://') || 'http://127.0.0.1:8004'}/api/sse/${userId}`
    : '';

  const managerRef = useRef<WebSocketManager | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const didUnmount = useRef(false);
  const wsFailCountRef = useRef(0);
  const useSseRef = useRef(false);
  const sseStartedRef = useRef(false); // Track if SSE has been started (prevent duplicates)

  // Store onTaskUpdate in a ref to avoid dependency on callback (prevents constant re-runs)
  // Pattern from: https://github.com/robtaussig/react-use-websocket
  const onTaskUpdateRef = useRef(onTaskUpdate);
  onTaskUpdateRef.current = onTaskUpdate;

  // All task-related event types from backend
  const taskEventTypes = ['task-created', 'task-updated', 'task-deleted', 'task-completed', 'task_update'];

  useEffect(() => {
    // Reset ALL state on mount (fix for Next.js client-side navigation)
    // In Next.js, refs persist across client-side navigation, causing the hook
    // to think it's already unmounted or in SSE mode when the component remounts
    didUnmount.current = false;
    wsFailCountRef.current = 0;
    useSseRef.current = false; // Also reset SSE mode to force fresh connection
    sseStartedRef.current = false; // Reset SSE started flag

    if (!enabled || !userId) {
      return;
    }

    // Always try WebSocket first on fresh mount
    console.log('[Realtime] Trying WebSocket...');
    startWebSocket();

    function startWebSocket() {
      const manager = getWebSocketManager({
        url: wsUrl,
        reconnectAttempts: 2, // Try 2 times before switching to SSE (faster fallback)
        reconnectInterval: 1000,
        maxReconnectInterval: 5000,
        onMessage: (message: WebSocketMessage) => {
          if (!didUnmount.current && taskEventTypes.includes(message.type)) {
            onTaskUpdateRef.current({ type: message.type, data: message.data });
          }
        },
        onOpen: () => {
          console.log('[Realtime] WebSocket connected');
        },
        onError: () => {
          wsFailCountRef.current += 1;
          console.log(`[Realtime] WebSocket error (${wsFailCountRef.current}/2)`);

          // After 2 failures, switch to SSE (only once)
          if (wsFailCountRef.current >= 2 && !sseStartedRef.current) {
            console.log('[Realtime] Switching to SSE after 2 WebSocket errors');
            useSseRef.current = true;
            managerRef.current?.disconnect(); // Fully disconnect WebSocket
            startSse();
          }
        },
        onClose: (event: CloseEvent) => {
          // Track abnormal closures (1006) as failures for SSE fallback
          if (event.code === 1006) {
            wsFailCountRef.current += 1;
            console.log(`[Realtime] WebSocket abnormal close 1006 (${wsFailCountRef.current}/2)`);

            // After 2 failures, switch to SSE (only once)
            if (wsFailCountRef.current >= 2 && !sseStartedRef.current) {
              console.log('[Realtime] Switching to SSE after 2 abnormal closures');
              useSseRef.current = true;
              managerRef.current?.disconnect(); // Fully disconnect WebSocket
              startSse();
            }
          }
        },
      });

      managerRef.current = manager;
      manager.connect();
    }

    function startSse() {
      // Prevent starting SSE multiple times
      if (sseStartedRef.current) {
        console.log('[Realtime] SSE already started, skipping duplicate');
        return;
      }

      // Close existing EventSource if any
      if (eventSourceRef.current) {
        console.log('[Realtime] Closing existing SSE connection before starting new one');
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      console.log('[Realtime] Starting SSE connection...');
      sseStartedRef.current = true; // Mark as started

      const eventSource = new EventSource(sseUrl);

      eventSource.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          if (!didUnmount.current && taskEventTypes.includes(message.type)) {
            console.log('[SSE] Event received:', message.type);
            onTaskUpdateRef.current({ type: message.type, data: message.data });
          }
        } catch (error) {
          console.error('[SSE] Failed to parse message:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('[SSE] Connection error, reconnecting...', error);
        // EventSource will automatically reconnect
      };

      eventSourceRef.current = eventSource;
    }

    // Cleanup function
    return () => {
      didUnmount.current = true;
      managerRef.current?.disconnect();
      eventSourceRef.current?.close();
    };
  }, [wsUrl, sseUrl, userId, enabled]);
}

/**
 * Hook for real-time notification updates via WebSocket
 *
 * @param userId - User ID for WebSocket connection
 * @param onNotification - Handler for notification events
 * @param enabled - Whether to enable real-time updates
 *
 * @example
 * ```tsx
 * useNotificationRealtimeUpdates(userId, (notification) => {
 *   // Show toast notification
 *   toast(notification.message);
 *   // Refresh notification count
 *   refetchNotifications();
 * });
 * ```
 */
export function useNotificationRealtimeUpdates<T = unknown>(
  userId: string | undefined,
  onNotification: (notification: T) => void,
  enabled: boolean = true
): void {
  const wsUrl = userId
    ? `${process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://127.0.0.1:8004'}/ws?user_id=${userId}`
    : '';

  const managerRef = useRef<WebSocketManager | null>(null);
  const didUnmount = useRef(false);
  const onNotificationRef = useRef(onNotification);
  onNotificationRef.current = onNotification;

  useEffect(() => {
    if (!enabled || !userId || didUnmount.current) {
      return;
    }

    // Create WebSocket manager
    const manager = getWebSocketManager({
      url: wsUrl,
      reconnectAttempts: 10,
      reconnectInterval: 1000,
      maxReconnectInterval: 10000,
      onMessage: (message: WebSocketMessage) => {
        if (message.type === 'reminder' && !didUnmount.current) {
          onNotificationRef.current(message.data as T);
        }
      },
    });

    managerRef.current = manager;
    manager.connect();

    return () => {
      didUnmount.current = true;
      manager.disconnect();
    };
  }, [wsUrl, userId, enabled]);
}
