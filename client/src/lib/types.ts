// Token Models
export interface Token {
  address: string;
  name: string;
  symbol: string;
  price: string | number;
  marketCap: string | number;
  marketCapChange24h: string | number;
  totalSupply: string | number;
  circulatingSupply: string | number;
  holderCount: string | number;
  holderChange24h: string | number;
  launchDate: string;
  volume1h: string | number;
  volumeChange1h: string | number;
  volume5m: string | number;
  volumeChange5m: string | number;
  volume24h: string | number;
  totalVolume: string | number;
  platform: 'Raydium' | 'pump.fun' | 'Orca';
  platformUrl?: string;
  color?: string;
  riskLevel: 'Güvenli' | 'Dikkatli' | 'Riskli';
  security: {
    liquidityLocked: boolean | string;
    mintDisabled: boolean;
    contractVerified: boolean;
    liquidityRatio: string | number;
    largestHolder: string;
  };
  id?: number;
  updatedAt?: string;
}

export interface TokenTransaction {
  id?: string;
  type: 'buy' | 'sell';
  amount: number;
  valueUsd: number;
  wallet: string;
  timestamp: string;
}

// Filter and Sort Models
export interface FilterParams {
  marketCapMin: string;
  marketCapMax: string;
  launchDate: 'all' | '24h' | '7d' | '30d';
  minHolders: string;
  minBuyVolume1h: string;
  platforms: {
    raydium: boolean;
    pumpfun: boolean;
    orca: boolean;
  };
}

export type SortField = 'marketCap' | 'launchDate' | 'holderCount' | 'volume1h' | 'volume5m';
export type SortDirection = 'asc' | 'desc';

// WebSocket Models
export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

// API Response Models
export interface TokensResponse {
  tokens: Token[];
  stats: {
    totalTokens: number;
    newTokens24h: number;
    volume24h: string;
  };
}

export interface TokenDetailsResponse {
  token: Token;
}

export interface TokenTransactionsResponse {
  transactions: TokenTransaction[];
}

export interface TokenPriceHistoryResponse {
  priceHistory: {
    time: string;
    price: number;
  }[];
}

export interface TokenVolumeHistoryResponse {
  volumeHistory: {
    time: string;
    volume: number;
  }[];
}
