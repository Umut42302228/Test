import { useState, useEffect, useRef, useCallback } from 'react';

interface WebSocketOptions {
  onOpen?: (event: Event) => void;
  onMessage?: (event: MessageEvent) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export function useWebSocket(path: string = '/ws', options: WebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [lastUpdate, setLastUpdate] = useState('Bağlanıyor...');
  
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const {
    onOpen,
    onMessage,
    onClose,
    onError,
    reconnectInterval = 5000,
    maxReconnectAttempts = 10
  } = options;

  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current !== null) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Create WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}${path}`;
    
    socketRef.current = new WebSocket(wsUrl);
    
    socketRef.current.onopen = (event) => {
      setIsConnected(true);
      setReconnectAttempts(0);
      setLastUpdate('Şimdi');
      if (onOpen) onOpen(event);
    };
    
    socketRef.current.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        setLastMessage(parsedData);
        setLastUpdate('Şimdi');
        if (onMessage) onMessage(event);
      } catch (error) {
        console.error('WebSocket message parsing error:', error);
      }
    };
    
    socketRef.current.onclose = (event) => {
      setIsConnected(false);
      
      if (event.code !== 1000) { // Normal closure
        // Attempt to reconnect
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectTimeoutRef.current = window.setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, reconnectInterval);
        } else {
          setLastUpdate('Bağlantı kesildi');
        }
      }
      
      if (onClose) onClose(event);
    };
    
    socketRef.current.onerror = (event) => {
      console.error('WebSocket error:', event);
      if (onError) onError(event);
    };
  }, [path, onOpen, onMessage, onClose, onError, reconnectInterval, maxReconnectAttempts, reconnectAttempts]);

  const disconnect = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.close(1000, 'Normal closure');
    }
    
    if (reconnectTimeoutRef.current !== null) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const sendMessage = useCallback((data: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
      return true;
    }
    return false;
  }, []);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Update the "last update" time string
  useEffect(() => {
    if (!isConnected || !lastMessage) return;
    
    const interval = setInterval(() => {
      if (lastMessage) {
        const now = new Date();
        const lastUpdateTime = lastMessage.timestamp 
          ? new Date(lastMessage.timestamp) 
          : now;
        
        const diffSeconds = Math.floor((now.getTime() - lastUpdateTime.getTime()) / 1000);
        
        if (diffSeconds < 5) {
          setLastUpdate('Şimdi');
        } else if (diffSeconds < 60) {
          setLastUpdate(`${diffSeconds} sn önce`);
        } else if (diffSeconds < 3600) {
          setLastUpdate(`${Math.floor(diffSeconds / 60)} dk önce`);
        } else {
          setLastUpdate(`${Math.floor(diffSeconds / 3600)} sa önce`);
        }
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isConnected, lastMessage]);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    connect,
    disconnect,
    reconnectAttempts,
    lastUpdate
  };
}

export default useWebSocket;
