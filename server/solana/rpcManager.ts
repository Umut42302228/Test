import { Connection, ConnectionConfig } from "@solana/web3.js";
import { SOLANA_RPC_ENDPOINTS } from "./constants";

class RpcManager {
  private connections: Connection[] = [];
  private currentConnectionIndex: number = 0;
  private lastConnectionAttempts: Map<string, number> = new Map();
  private failCounts: Map<string, number> = new Map();
  
  constructor() {
    // Initialize connections
    this.initializeConnections();
  }
  
  private initializeConnections() {
    // Create a connection for each endpoint
    SOLANA_RPC_ENDPOINTS.forEach(endpoint => {
      try {
        const connectionConfig: ConnectionConfig = {
          commitment: 'confirmed',
          confirmTransactionInitialTimeout: 60000,
          disableRetryOnRateLimit: false,
        };
        
        const connection = new Connection(endpoint, connectionConfig);
        this.connections.push(connection);
        this.lastConnectionAttempts.set(endpoint, Date.now());
        this.failCounts.set(endpoint, 0);
        
        console.log(`Initialized Solana RPC connection to ${endpoint}`);
      } catch (error) {
        console.error(`Failed to initialize Solana RPC connection to ${endpoint}:`, error);
      }
    });
    
    if (this.connections.length === 0) {
      console.error("Failed to initialize any Solana RPC connections");
    }
  }
  
  // Get a connection, optionally forcing a new connection
  public async getConnection(forceNew: boolean = false): Promise<Connection> {
    if (this.connections.length === 0) {
      throw new Error("No available RPC connections");
    }
    
    // If forcing a new connection or the current connection might be bad, get a new one
    if (forceNew || await this.shouldRotateConnection()) {
      await this.rotateConnection();
    }
    
    return this.connections[this.currentConnectionIndex];
  }
  
  // Check if we should rotate to a new connection
  private async shouldRotateConnection(): Promise<boolean> {
    if (this.connections.length <= 1) {
      return false;
    }
    
    try {
      // Check if current connection is responsive
      const currentConnection = this.connections[this.currentConnectionIndex];
      await currentConnection.getRecentBlockhash('finalized');
      return false; // Connection is working fine
    } catch (error) {
      console.warn("Current RPC connection seems unresponsive, rotating...");
      return true;
    }
  }
  
  // Rotate to the next available connection
  private async rotateConnection(): Promise<void> {
    if (this.connections.length <= 1) {
      return;
    }
    
    const startingIndex = this.currentConnectionIndex;
    let foundWorkingConnection = false;
    
    // Try each connection until we find a working one
    for (let i = 0; i < this.connections.length; i++) {
      this.currentConnectionIndex = (this.currentConnectionIndex + 1) % this.connections.length;
      
      // Skip if this connection has failed too many times recently
      const endpoint = SOLANA_RPC_ENDPOINTS[this.currentConnectionIndex];
      const failCount = this.failCounts.get(endpoint) || 0;
      const lastAttempt = this.lastConnectionAttempts.get(endpoint) || 0;
      const timeSinceLastAttempt = Date.now() - lastAttempt;
      
      // If the connection has failed too many times and it's been less than 5 minutes, skip it
      if (failCount > 3 && timeSinceLastAttempt < 5 * 60 * 1000) {
        continue;
      }
      
      try {
        // Test the connection
        const connection = this.connections[this.currentConnectionIndex];
        await connection.getRecentBlockhash('finalized');
        
        // Reset fail count if successful
        this.failCounts.set(endpoint, 0);
        this.lastConnectionAttempts.set(endpoint, Date.now());
        
        foundWorkingConnection = true;
        console.log(`Rotated to RPC endpoint: ${endpoint}`);
        break;
      } catch (error) {
        // Increment fail count
        this.failCounts.set(endpoint, (this.failCounts.get(endpoint) || 0) + 1);
        this.lastConnectionAttempts.set(endpoint, Date.now());
        
        console.warn(`Failed to connect to RPC endpoint ${endpoint}, trying next...`);
      }
    }
    
    if (!foundWorkingConnection) {
      // If we couldn't find a working connection, reset to the starting one
      this.currentConnectionIndex = startingIndex;
      console.error("Could not find a working RPC connection, using previous one");
    }
  }
  
  // Get the current endpoint URL for diagnostics
  public getCurrentEndpoint(): string {
    return SOLANA_RPC_ENDPOINTS[this.currentConnectionIndex];
  }
  
  // Get the health status of all connections
  public async getConnectionsHealth(): Promise<{
    endpoint: string;
    healthy: boolean;
    latency: number;
    failCount: number;
  }[]> {
    const results = [];
    
    for (let i = 0; i < this.connections.length; i++) {
      const endpoint = SOLANA_RPC_ENDPOINTS[i];
      const connection = this.connections[i];
      let healthy = false;
      let latency = 0;
      
      try {
        const startTime = Date.now();
        await connection.getRecentBlockhash('finalized');
        latency = Date.now() - startTime;
        healthy = true;
      } catch (error) {
        healthy = false;
      }
      
      results.push({
        endpoint,
        healthy,
        latency,
        failCount: this.failCounts.get(endpoint) || 0
      });
    }
    
    return results;
  }
}

export const rpcManager = new RpcManager();
