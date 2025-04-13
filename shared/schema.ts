import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, numeric, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Token table schema
export const tokens = pgTable("tokens", {
  id: serial("id").primaryKey(),
  address: varchar("address", { length: 44 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  price: numeric("price", { precision: 16, scale: 8 }).notNull().default("0"),
  marketCap: numeric("market_cap").notNull().default("0"),
  marketCapChange24h: numeric("market_cap_change_24h").notNull().default("0"),
  totalSupply: numeric("total_supply").notNull().default("0"),
  circulatingSupply: numeric("circulating_supply").notNull().default("0"),
  holderCount: integer("holder_count").notNull().default(0),
  holderChange24h: integer("holder_change_24h").notNull().default(0),
  launchDate: timestamp("launch_date").notNull(),
  volume1h: numeric("volume_1h").notNull().default("0"),
  volumeChange1h: numeric("volume_change_1h").notNull().default("0"),
  volume5m: numeric("volume_5m").notNull().default("0"),
  volumeChange5m: numeric("volume_change_5m").notNull().default("0"),
  volume24h: numeric("volume_24h").notNull().default("0"),
  totalVolume: numeric("total_volume").notNull().default("0"),
  platform: varchar("platform", { length: 50 }).notNull(),
  platformUrl: varchar("platform_url", { length: 255 }),
  color: varchar("color", { length: 50 }),
  riskLevel: varchar("risk_level", { length: 50 }).notNull(),
  security: jsonb("security").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Token transactions table schema
export const tokenTransactions = pgTable("token_transactions", {
  id: serial("id").primaryKey(),
  tokenAddress: varchar("token_address", { length: 44 }).notNull(),
  type: varchar("type", { length: 10 }).notNull(), // 'buy' or 'sell'
  amount: numeric("amount").notNull(),
  valueUsd: numeric("value_usd").notNull(),
  wallet: varchar("wallet", { length: 44 }).notNull(),
  timestamp: timestamp("timestamp").notNull(),
});

// Price history table schema
export const priceHistory = pgTable("price_history", {
  id: serial("id").primaryKey(),
  tokenAddress: varchar("token_address", { length: 44 }).notNull(),
  time: timestamp("time").notNull(),
  price: numeric("price", { precision: 16, scale: 8 }).notNull(),
});

// Volume history table schema
export const volumeHistory = pgTable("volume_history", {
  id: serial("id").primaryKey(),
  tokenAddress: varchar("token_address", { length: 44 }).notNull(),
  time: timestamp("time").notNull(),
  volume: numeric("volume").notNull(),
});

// Security metrics table schema
export const securityMetrics = pgTable("security_metrics", {
  id: serial("id").primaryKey(),
  tokenAddress: varchar("token_address", { length: 44 }).notNull().unique(),
  liquidityLocked: boolean("liquidity_locked").notNull().default(false),
  liquidityLockDuration: varchar("liquidity_lock_duration", { length: 50 }),
  mintDisabled: boolean("mint_disabled").notNull().default(false),
  contractVerified: boolean("contract_verified").notNull().default(false),
  liquidityRatio: numeric("liquidity_ratio").notNull().default("0"),
  largestHolder: varchar("largest_holder", { length: 255 }),
  updateTimestamp: timestamp("update_timestamp").notNull().defaultNow(),
});

// Insert schemas
export const insertTokenSchema = createInsertSchema(tokens).omit({ id: true, updatedAt: true });
export const insertTokenTransactionSchema = createInsertSchema(tokenTransactions).omit({ id: true });
export const insertPriceHistorySchema = createInsertSchema(priceHistory).omit({ id: true });
export const insertVolumeHistorySchema = createInsertSchema(volumeHistory).omit({ id: true });
export const insertSecurityMetricsSchema = createInsertSchema(securityMetrics).omit({ id: true, updateTimestamp: true });

// Types
export type Token = typeof tokens.$inferSelect;
export type InsertToken = z.infer<typeof insertTokenSchema>;

export type TokenTransaction = typeof tokenTransactions.$inferSelect;
export type InsertTokenTransaction = z.infer<typeof insertTokenTransactionSchema>;

export type PriceHistory = typeof priceHistory.$inferSelect;
export type InsertPriceHistory = z.infer<typeof insertPriceHistorySchema>;

export type VolumeHistory = typeof volumeHistory.$inferSelect;
export type InsertVolumeHistory = z.infer<typeof insertVolumeHistorySchema>;

export type SecurityMetrics = typeof securityMetrics.$inferSelect;
export type InsertSecurityMetrics = z.infer<typeof insertSecurityMetricsSchema>;
