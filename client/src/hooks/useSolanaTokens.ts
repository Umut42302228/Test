import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Token, FilterParams, SortField, SortDirection } from '@/lib/types';

// Default filter values
const defaultFilters: FilterParams = {
  marketCapMin: '',
  marketCapMax: '',
  launchDate: 'all',
  minHolders: '',
  minBuyVolume1h: '',
  platforms: {
    raydium: true,
    pumpfun: true,
    orca: true
  }
};

export function useSolanaTokens() {
  const [filters, setFilters] = useState<FilterParams>(defaultFilters);
  const [sortField, setSortField] = useState<SortField>('marketCap');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'popular'>('all');

  // Fetch tokens from the API
  const { data: tokensData, isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/tokens'],
    staleTime: 10000, // 10 seconds
  });

  // Apply filters, sorting, and search
  const processedTokens = () => {
    if (!tokensData || !tokensData.tokens) {
      return [];
    }

    let filteredTokens = tokensData.tokens as Token[];

    // Apply tab filtering
    if (activeTab === 'new') {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      filteredTokens = filteredTokens.filter(token => new Date(token.launchDate) >= oneDayAgo);
    } else if (activeTab === 'popular') {
      filteredTokens = [...filteredTokens].sort((a, b) => b.volume1h - a.volume1h).slice(0, 50);
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredTokens = filteredTokens.filter(token => 
        token.name.toLowerCase().includes(query) || 
        token.symbol.toLowerCase().includes(query) || 
        token.address.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (filters.marketCapMin) {
      const min = parseFloat(filters.marketCapMin);
      filteredTokens = filteredTokens.filter(token => token.marketCap >= min);
    }

    if (filters.marketCapMax) {
      const max = parseFloat(filters.marketCapMax);
      filteredTokens = filteredTokens.filter(token => token.marketCap <= max);
    }

    if (filters.launchDate !== 'all') {
      const now = new Date();
      let compareDate = new Date();
      
      switch (filters.launchDate) {
        case '24h':
          compareDate.setHours(now.getHours() - 24);
          break;
        case '7d':
          compareDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          compareDate.setDate(now.getDate() - 30);
          break;
      }
      
      filteredTokens = filteredTokens.filter(token => new Date(token.launchDate) >= compareDate);
    }

    if (filters.minHolders) {
      const min = parseInt(filters.minHolders);
      filteredTokens = filteredTokens.filter(token => token.holderCount >= min);
    }

    if (filters.minBuyVolume1h) {
      const min = parseFloat(filters.minBuyVolume1h);
      filteredTokens = filteredTokens.filter(token => token.volume1h >= min);
    }

    // Apply platform filters
    filteredTokens = filteredTokens.filter(token => {
      if (token.platform === 'Raydium' && !filters.platforms.raydium) return false;
      if (token.platform === 'pump.fun' && !filters.platforms.pumpfun) return false;
      if (token.platform === 'Orca' && !filters.platforms.orca) return false;
      return true;
    });

    // Apply sorting
    return [...filteredTokens].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'marketCap':
          comparison = a.marketCap - b.marketCap;
          break;
        case 'launchDate':
          comparison = new Date(a.launchDate).getTime() - new Date(b.launchDate).getTime();
          break;
        case 'holderCount':
          comparison = a.holderCount - b.holderCount;
          break;
        case 'volume1h':
          comparison = a.volume1h - b.volume1h;
          break;
        case 'volume5m':
          comparison = a.volume5m - b.volume5m;
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  // Handle sort changes
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to descending
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Reset filters to default
  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  // Stats derived from the token data
  const stats = {
    totalTokens: tokensData?.stats?.totalTokens || 0,
    newTokens24h: tokensData?.stats?.newTokens24h || 0,
    volume24h: tokensData?.stats?.volume24h || '0'
  };

  return {
    tokens: processedTokens(),
    isLoading,
    isError,
    refetch,
    filters,
    setFilters,
    sortField,
    sortDirection,
    handleSort,
    searchQuery,
    setSearchQuery,
    resetFilters,
    stats,
    activeTab,
    setActiveTab
  };
}

export default useSolanaTokens;
