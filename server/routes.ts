import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { tokenService } from "./solana/tokenService";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Initialize WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // WebSocket connection handling
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    // Send initial data
    const sendInitialData = async () => {
      try {
        const tokens = await storage.getAllTokens();
        const stats = await storage.getTokenStats();
        
        ws.send(JSON.stringify({
          type: 'init',
          data: { 
            tokens, 
            stats 
          },
          timestamp: new Date().toISOString()
        }));
      } catch (error) {
        console.error('Error sending initial data:', error);
      }
    };
    
    sendInitialData();
    
    // Handle client messages
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle different message types
        if (data.type === 'subscribe_token') {
          console.log(`Client subscribed to token: ${data.address}`);
          // We could implement specific subscription logic here
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });
  
  // Broadcast token updates to all connected clients
  const broadcastTokenUpdates = (data: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'token_update',
          data,
          timestamp: new Date().toISOString()
        }));
      }
    });
  };
  
  // Start token data collection
  tokenService.startTokenCollection(broadcastTokenUpdates);
  
  // API Routes
  
  // Get all tokens with stats
  app.get('/api/tokens', async (req, res) => {
    try {
      const tokens = await storage.getAllTokens();
      const stats = await storage.getTokenStats();
      
      res.json({
        tokens,
        stats
      });
    } catch (error) {
      console.error('Error fetching tokens:', error);
      res.status(500).json({ message: 'Token verileri alınırken bir hata oluştu' });
    }
  });
  
  // Get single token by address
  app.get('/api/tokens/:address', async (req, res) => {
    try {
      const { address } = req.params;
      const token = await storage.getTokenByAddress(address);
      
      if (!token) {
        return res.status(404).json({ message: 'Token bulunamadı' });
      }
      
      res.json({ token });
    } catch (error) {
      console.error(`Error fetching token ${req.params.address}:`, error);
      res.status(500).json({ message: 'Token verisi alınırken bir hata oluştu' });
    }
  });
  
  // Get token transactions
  app.get('/api/tokens/:address/transactions', async (req, res) => {
    try {
      const { address } = req.params;
      const transactions = await storage.getTokenTransactions(address);
      
      res.json({ transactions });
    } catch (error) {
      console.error(`Error fetching transactions for ${req.params.address}:`, error);
      res.status(500).json({ message: 'Token işlemleri alınırken bir hata oluştu' });
    }
  });
  
  // Get token price history
  app.get('/api/tokens/:address/price-history', async (req, res) => {
    try {
      const { address } = req.params;
      const priceHistory = await storage.getTokenPriceHistory(address);
      
      res.json({ priceHistory });
    } catch (error) {
      console.error(`Error fetching price history for ${req.params.address}:`, error);
      res.status(500).json({ message: 'Token fiyat geçmişi alınırken bir hata oluştu' });
    }
  });
  
  // Get token volume history
  app.get('/api/tokens/:address/volume-history', async (req, res) => {
    try {
      const { address } = req.params;
      const volumeHistory = await storage.getTokenVolumeHistory(address);
      
      res.json({ volumeHistory });
    } catch (error) {
      console.error(`Error fetching volume history for ${req.params.address}:`, error);
      res.status(500).json({ message: 'Token hacim geçmişi alınırken bir hata oluştu' });
    }
  });

  return httpServer;
}
