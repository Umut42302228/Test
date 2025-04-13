import { 
  Token, InsertToken, 
  TokenTransaction, InsertTokenTransaction,
  PriceHistory, InsertPriceHistory,
  VolumeHistory, InsertVolumeHistory,
  SecurityMetrics, InsertSecurityMetrics,
  tokens, tokenTransactions, priceHistory, volumeHistory, securityMetrics
} from "@shared/schema";

// Storage interface for token data
export interface IStorage {
  // Token methods
  getAllTokens(): Promise<Token[]>;
  getTokenByAddress(address: string): Promise<Token | undefined>;
  createToken(token: InsertToken): Promise<Token>;
  updateToken(address: string, tokenData: Partial<Token>): Promise<Token | undefined>;
  
  // Token transaction methods
  getTokenTransactions(tokenAddress: string, limit?: number): Promise<TokenTransaction[]>;
  addTokenTransaction(transaction: InsertTokenTransaction): Promise<TokenTransaction>;
  
  // Price history methods
  getTokenPriceHistory(tokenAddress: string, limit?: number): Promise<PriceHistory[]>;
  addPriceHistoryEntry(entry: InsertPriceHistory): Promise<PriceHistory>;
  
  // Volume history methods
  getTokenVolumeHistory(tokenAddress: string, limit?: number): Promise<VolumeHistory[]>;
  addVolumeHistoryEntry(entry: InsertVolumeHistory): Promise<VolumeHistory>;
  
  // Security metrics methods
  getTokenSecurityMetrics(tokenAddress: string): Promise<SecurityMetrics | undefined>;
  updateSecurityMetrics(metrics: InsertSecurityMetrics): Promise<SecurityMetrics>;
  
  // Statistics methods
  getTokenStats(): Promise<{
    totalTokens: number;
    newTokens24h: number;
    volume24h: string;
  }>;
}

// In-memory implementation of the storage interface
export class MemStorage implements IStorage {
  private tokensMap: Map<string, Token>;
  private transactionsMap: Map<string, TokenTransaction[]>;
  private priceHistoryMap: Map<string, PriceHistory[]>;
  private volumeHistoryMap: Map<string, VolumeHistory[]>;
  private securityMetricsMap: Map<string, SecurityMetrics>;
  
  private tokenIdCounter: number;
  private transactionIdCounter: number;
  private priceHistoryIdCounter: number;
  private volumeHistoryIdCounter: number;
  private securityMetricsIdCounter: number;
  
  constructor() {
    this.tokensMap = new Map();
    this.transactionsMap = new Map();
    this.priceHistoryMap = new Map();
    this.volumeHistoryMap = new Map();
    this.securityMetricsMap = new Map();
    
    this.tokenIdCounter = 1;
    this.transactionIdCounter = 1;
    this.priceHistoryIdCounter = 1;
    this.volumeHistoryIdCounter = 1;
    this.securityMetricsIdCounter = 1;
  }
  
  // Token methods
  async getAllTokens(): Promise<Token[]> {
    return Array.from(this.tokensMap.values());
  }
  
  async getTokenByAddress(address: string): Promise<Token | undefined> {
    return this.tokensMap.get(address);
  }
  
  async createToken(tokenData: InsertToken): Promise<Token> {
    const id = this.tokenIdCounter++;
    const token: Token = {
      ...tokenData,
      id,
      updatedAt: new Date()
    } as Token;
    
    this.tokensMap.set(token.address, token);
    return token;
  }
  
  async updateToken(address: string, tokenData: Partial<Token>): Promise<Token | undefined> {
    const existingToken = this.tokensMap.get(address);
    if (!existingToken) return undefined;
    
    const updatedToken: Token = {
      ...existingToken,
      ...tokenData,
      updatedAt: new Date()
    };
    
    this.tokensMap.set(address, updatedToken);
    return updatedToken;
  }
  
  // Token transaction methods
  async getTokenTransactions(tokenAddress: string, limit: number = 20): Promise<TokenTransaction[]> {
    const transactions = this.transactionsMap.get(tokenAddress) || [];
    return transactions
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }
  
  async addTokenTransaction(transaction: InsertTokenTransaction): Promise<TokenTransaction> {
    const id = this.transactionIdCounter++;
    const newTransaction: TokenTransaction = {
      ...transaction,
      id
    } as TokenTransaction;
    
    const existingTransactions = this.transactionsMap.get(transaction.tokenAddress) || [];
    this.transactionsMap.set(transaction.tokenAddress, [...existingTransactions, newTransaction]);
    
    return newTransaction;
  }
  
  // Price history methods
  async getTokenPriceHistory(tokenAddress: string, limit: number = 100): Promise<PriceHistory[]> {
    const history = this.priceHistoryMap.get(tokenAddress) || [];
    return history
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
      .slice(-limit);
  }
  
  async addPriceHistoryEntry(entry: InsertPriceHistory): Promise<PriceHistory> {
    const id = this.priceHistoryIdCounter++;
    const newEntry: PriceHistory = {
      ...entry,
      id
    } as PriceHistory;
    
    const existingEntries = this.priceHistoryMap.get(entry.tokenAddress) || [];
    this.priceHistoryMap.set(entry.tokenAddress, [...existingEntries, newEntry]);
    
    return newEntry;
  }
  
  // Volume history methods
  async getTokenVolumeHistory(tokenAddress: string, limit: number = 100): Promise<VolumeHistory[]> {
    const history = this.volumeHistoryMap.get(tokenAddress) || [];
    return history
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
      .slice(-limit);
  }
  
  async addVolumeHistoryEntry(entry: InsertVolumeHistory): Promise<VolumeHistory> {
    const id = this.volumeHistoryIdCounter++;
    const newEntry: VolumeHistory = {
      ...entry,
      id
    } as VolumeHistory;
    
    const existingEntries = this.volumeHistoryMap.get(entry.tokenAddress) || [];
    this.volumeHistoryMap.set(entry.tokenAddress, [...existingEntries, newEntry]);
    
    return newEntry;
  }
  
  // Security metrics methods
  async getTokenSecurityMetrics(tokenAddress: string): Promise<SecurityMetrics | undefined> {
    return this.securityMetricsMap.get(tokenAddress);
  }
  
  async updateSecurityMetrics(metrics: InsertSecurityMetrics): Promise<SecurityMetrics> {
    const id = this.securityMetricsIdCounter++;
    const newMetrics: SecurityMetrics = {
      ...metrics,
      id,
      updateTimestamp: new Date()
    } as SecurityMetrics;
    
    this.securityMetricsMap.set(metrics.tokenAddress, newMetrics);
    return newMetrics;
  }
  
  // Statistics methods
  async getTokenStats(): Promise<{ totalTokens: number; newTokens24h: number; volume24h: string; }> {
    const tokens = Array.from(this.tokensMap.values());
    const totalTokens = tokens.length;
    
    // Calculate new tokens in the last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const newTokens24h = tokens.filter(token => new Date(token.launchDate) >= oneDayAgo).length;
    
    // Calculate total volume in the last 24 hours
    let totalVolume24h = 0;
    for (const token of tokens) {
      totalVolume24h += Number(token.volume24h);
    }
    
    // Format volume as "1.2M" or "450K"
    let volume24h = "";
    if (totalVolume24h >= 1000000) {
      volume24h = (totalVolume24h / 1000000).toFixed(1) + "M";
    } else if (totalVolume24h >= 1000) {
      volume24h = (totalVolume24h / 1000).toFixed(1) + "K";
    } else {
      volume24h = totalVolume24h.toString();
    }
    
    return {
      totalTokens,
      newTokens24h,
      volume24h
    };
  }
}

// Create and export a singleton instance of the storage
export const storage = new MemStorage();
