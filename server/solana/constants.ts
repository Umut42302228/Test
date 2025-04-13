// Solana Program IDs
export const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
export const RAYDIUM_PROGRAM_ID = '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8';
export const PUMP_FUN_PROGRAM_ID = '6EF8rrecthR5Dkzon8Nwu78hRwfCKubJ14M5uBEwF6P';
export const ORCA_PROGRAM_ID = '9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP';

// Platforms information
export const PLATFORMS = {
  RAYDIUM: {
    name: 'Raydium',
    programId: RAYDIUM_PROGRAM_ID,
    baseUrl: 'https://raydium.io/swap/?inputCurrency=SOL&outputCurrency=',
    color: 'purple'
  },
  PUMP_FUN: {
    name: 'pump.fun',
    programId: PUMP_FUN_PROGRAM_ID,
    baseUrl: 'https://pump.fun/token/',
    color: 'blue'
  },
  ORCA: {
    name: 'Orca',
    programId: ORCA_PROGRAM_ID,
    baseUrl: 'https://www.orca.so/liquidity?base=',
    color: 'teal'
  }
};

// RPC Endpoints
export const SOLANA_RPC_ENDPOINTS = ['https://api.mainnet-beta.solana.com',
];

// Refresh intervals
export const UPDATE_INTERVALS = {
  DEFAULT: 10000, // 10 seconds
  MEDIUM: 30000,  // 30 seconds
  SLOW: 60000     // 60 seconds
};

// Risk levels
export const RISK_LEVELS = {
  SAFE: 'Güvenli',
  CAUTION: 'Dikkatli',
  RISKY: 'Riskli'
};

// Token transaction types
export const TRANSACTION_TYPES = {
  BUY: 'buy',
  SELL: 'sell'
};

// Launch date filters
export const LAUNCH_DATE_FILTERS = {
  ALL: 'all',
  LAST_24H: '24h',
  LAST_7D: '7d',
  LAST_30D: '30d'
};
