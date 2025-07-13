import { WebSocketServer, WebSocket } from 'ws';
import { WindTunnelData } from '../../shared/types/WindTunnelData';

export interface WebSocketMessage {
  type: 'data' | 'status' | 'config' | 'command' | 'error';
  payload: any;
  timestamp: number;
}

export class WebSocketService {
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();
  private port: number;
  private isRunning: boolean = false;

  constructor(port: number = 8081) {
    this.port = port;
  }

  // Start WebSocket server
  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.wss = new WebSocketServer({ port: this.port });
        
        this.wss.on('connection', (ws: WebSocket) => {
          console.log('WebSocket client connected');
          this.clients.add(ws);

          // Send initial status
          this.sendToClient(ws, {
            type: 'status',
            payload: { connected: true, timestamp: Date.now() },
            timestamp: Date.now()
          });

          ws.on('message', (message: string) => {
            try {
              const parsedMessage: WebSocketMessage = JSON.parse(message);
              this.handleMessage(ws, parsedMessage);
            } catch (error) {
              console.error('Error parsing WebSocket message:', error);
              this.sendToClient(ws, {
                type: 'error',
                payload: { message: 'Invalid message format' },
                timestamp: Date.now()
              });
            }
          });

          ws.on('close', () => {
            console.log('WebSocket client disconnected');
            this.clients.delete(ws);
          });

          ws.on('error', (error) => {
            console.error('WebSocket error:', error);
            this.clients.delete(ws);
          });
        });

        this.wss.on('error', (error) => {
          console.error('WebSocket server error:', error);
          reject(error);
        });

        this.wss.on('listening', () => {
          console.log(`WebSocket server listening on port ${this.port}`);
          this.isRunning = true;
          resolve();
        });

      } catch (error) {
        console.error('Failed to start WebSocket server:', error);
        reject(error);
      }
    });
  }

  // Stop WebSocket server
  stop(): void {
    if (this.wss) {
      this.wss.close();
      this.wss = null;
      this.clients.clear();
      this.isRunning = false;
      console.log('WebSocket server stopped');
    }
  }

  // Send message to all connected clients
  broadcast(message: WebSocketMessage): void {
    if (!this.isRunning) return;

    const messageStr = JSON.stringify(message);
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  // Send message to specific client
  sendToClient(client: WebSocket, message: WebSocketMessage): void {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }

  // Send wind tunnel data to all clients
  sendData(data: WindTunnelData): void {
    this.broadcast({
      type: 'data',
      payload: data,
      timestamp: Date.now()
    });
  }

  // Send status update to all clients
  sendStatus(status: any): void {
    this.broadcast({
      type: 'status',
      payload: status,
      timestamp: Date.now()
    });
  }

  // Send configuration update to all clients
  sendConfig(config: any): void {
    this.broadcast({
      type: 'config',
      payload: config,
      timestamp: Date.now()
    });
  }

  // Send error message to all clients
  sendError(error: string): void {
    this.broadcast({
      type: 'error',
      payload: { message: error },
      timestamp: Date.now()
    });
  }

  // Handle incoming messages from clients
  private handleMessage(client: WebSocket, message: WebSocketMessage): void {
    console.log('Received message:', message);

    switch (message.type) {
      case 'command':
        this.handleCommand(client, message.payload);
        break;
      case 'config':
        this.handleConfig(client, message.payload);
        break;
      default:
        console.warn('Unknown message type:', message.type);
    }
  }

  // Handle commands from clients
  private handleCommand(client: WebSocket, command: any): void {
    console.log('Handling command:', command);
    
    // Echo command back to confirm receipt
    this.sendToClient(client, {
      type: 'status',
      payload: { commandReceived: true, command },
      timestamp: Date.now()
    });
  }

  // Handle configuration updates from clients
  private handleConfig(client: WebSocket, config: any): void {
    console.log('Handling config update:', config);
    
    // Echo config back to confirm receipt
    this.sendToClient(client, {
      type: 'config',
      payload: { configReceived: true, config },
      timestamp: Date.now()
    });
  }

  // Get connection status
  getStatus(): { isRunning: boolean; clientCount: number; port: number } {
    return {
      isRunning: this.isRunning,
      clientCount: this.clients.size,
      port: this.port
    };
  }

  // Check if server is running
  isServerRunning(): boolean {
    return this.isRunning;
  }

  // Get number of connected clients
  getClientCount(): number {
    return this.clients.size;
  }
}

// Default WebSocket service instance
export const defaultWebSocketService = new WebSocketService(8081); 