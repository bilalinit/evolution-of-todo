/**
 * WebSocket Connection Manager
 *
 * Low-level WebSocket connection management with:
 * - Automatic reconnection with exponential backoff
 * - Connection state tracking
 * - Event-driven message handling
 * - Clean connection lifecycle
 *
 * Based on best practices from react-use-websocket and Next.js patterns
 */

export type WebSocketReadyState = 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED' | 'UNINSTANTIATED';

export interface WebSocketMessage {
  type: string;
  data: unknown;
  user_id?: string;
  timestamp?: string;
}

export interface WebSocketConfig {
  url: string;
  reconnectAttempts?: number;
  reconnectInterval?: number; // Base interval in ms
  maxReconnectInterval?: number; // Max interval in ms (for exponential backoff)
  onOpen?: () => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  onMessage?: (message: WebSocketMessage) => void;
}

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectCount = 0;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private manualClose = false;
  private messageQueue: WebSocketMessage[] = [];
  private isProcessingQueue = false;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private readonly HEARTBEAT_INTERVAL = 15000; // Send ping every 15s to keep connection alive

  constructor(config: WebSocketConfig) {
    this.config = {
      reconnectAttempts: 10,
      reconnectInterval: 1000,
      maxReconnectInterval: 10000,
      ...config,
    };
  }

  /**
   * Get the current ready state of the WebSocket connection
   */
  getReadyState(): WebSocketReadyState {
    if (!this.ws) return 'UNINSTANTIATED';

    const states: WebSocketReadyState[] = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'];
    return states[this.ws.readyState] || 'UNINSTANTIATED';
  }

  /**
   * Check if the connection is open and ready to send messages
   */
  isOpen(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Connect to the WebSocket server
   */
  connect(): void {
    if (this.ws) {
      this.ws.close();
    }

    try {
      this.ws = new WebSocket(this.config.url);
      this.setupEventHandlers();
    } catch (error) {
      console.error('[WebSocket] Failed to create connection:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Set up WebSocket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('[WebSocket] Connected');
      this.reconnectCount = 0;
      this.manualClose = false;
      this.config.onOpen?.();

      // Start heartbeat to keep connection alive
      this.startHeartbeat();

      // Process any queued messages
      this.processMessageQueue();
    };

    this.ws.onclose = (event: CloseEvent) => {
      console.log('[WebSocket] Disconnected:', event.code, event.reason);
      console.log('[WebSocket] onClose handler exists?', !!this.config.onClose);
      this.config.onClose?.(event);

      // Only reconnect if it wasn't a manual close
      if (!this.manualClose) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (event: Event) => {
      console.error('[WebSocket] Error:', event);
      this.config.onError?.(event);
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        this.config.onMessage?.(message);
      } catch (error) {
        console.error('[WebSocket] Failed to parse message:', error);
      }
    };
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  private scheduleReconnect(): void {
    if (this.reconnectCount >= (this.config.reconnectAttempts || 10)) {
      console.error('[WebSocket] Max reconnection attempts reached');
      return;
    }

    // Calculate exponential backoff interval
    const baseInterval = this.config.reconnectInterval || 1000;
    const maxInterval = this.config.maxReconnectInterval || 10000;
    const interval = Math.min(
      Math.pow(2, this.reconnectCount) * baseInterval,
      maxInterval
    );

    this.reconnectCount++;
    console.log(`[WebSocket] Reconnecting in ${interval}ms (attempt ${this.reconnectCount})`);

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, interval);
  }

  /**
   * Send a message through the WebSocket
   * If not connected, queue the message for later
   */
  send(message: WebSocketMessage): void {
    if (this.isOpen()) {
      try {
        this.ws?.send(JSON.stringify(message));
      } catch (error) {
        console.error('[WebSocket] Failed to send message:', error);
      }
    } else {
      // Queue message for when connection is established
      this.messageQueue.push(message);
      console.log('[WebSocket] Message queued (not connected)');
    }
  }

  /**
   * Process queued messages
   */
  private processMessageQueue(): void {
    if (this.isProcessingQueue || this.messageQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;
    const queue = [...this.messageQueue];
    this.messageQueue = [];

    for (const message of queue) {
      this.send(message);
    }

    this.isProcessingQueue = false;
  }

  /**
   * Disconnect the WebSocket
   */
  disconnect(): void {
    this.manualClose = true;

    // Stop heartbeat
    this.stopHeartbeat();

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }

    this.messageQueue = [];
  }

  /**
   * Start heartbeat to keep WebSocket connection alive
   * Sends a ping message every 15 seconds
   */
  private startHeartbeat(): void {
    // Clear any existing interval
    this.stopHeartbeat();

    this.heartbeatInterval = setInterval(() => {
      if (this.isOpen()) {
        try {
          // Send ping message to server
          this.ws?.send('ping');
        } catch (error) {
          console.error('[WebSocket] Failed to send heartbeat ping:', error);
        }
      }
    }, this.HEARTBEAT_INTERVAL);

    console.log(`[WebSocket] Heartbeat started (ping every ${this.HEARTBEAT_INTERVAL}ms)`);
  }

  /**
   * Stop the heartbeat interval
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
      console.log('[WebSocket] Heartbeat stopped');
    }
  }

  /**
   * Update configuration callbacks (for use with ref-based callbacks)
   * This allows updating handlers without recreating the manager
   */
  updateConfig(config: Partial<WebSocketConfig>): void {
    // Update callback handlers to use latest refs
    if (config.onOpen !== undefined) this.config.onOpen = config.onOpen;
    if (config.onClose !== undefined) this.config.onClose = config.onClose;
    if (config.onError !== undefined) this.config.onError = config.onError;
    if (config.onMessage !== undefined) this.config.onMessage = config.onMessage;
  }
}

/**
 * Create a singleton WebSocket manager for a given URL
 */
const managers = new Map<string, WebSocketManager>();

export function getWebSocketManager(config: WebSocketConfig): WebSocketManager {
  let manager = managers.get(config.url);

  if (!manager) {
    manager = new WebSocketManager(config);
    managers.set(config.url, manager);
  } else {
    // UPDATE: Apply new callbacks to existing manager
    // This ensures refs are up-to-date when component re-renders
    manager.updateConfig(config);
  }

  return manager;
}
