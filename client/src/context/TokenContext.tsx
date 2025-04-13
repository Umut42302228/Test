import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Token, TokenTransaction } from '@/lib/types';

// TokenContext arayüzü
interface TokenContextValue {
  allTokens: Token[];
  selectedToken: Token | null;
  setSelectedToken: (token: Token | null) => void;
  isLoading: boolean;
  isError: boolean;
  lastUpdate: string;
}

// Başlangıç değerleri
const defaultContextValue: TokenContextValue = {
  allTokens: [],
  selectedToken: null,
  setSelectedToken: () => {},
  isLoading: false,
  isError: false,
  lastUpdate: 'Yükleniyor...'
};

// Context oluştur
const TokenContext = createContext<TokenContextValue>(defaultContextValue);

// Güvenli tip dönüşümü fonksiyonu
const ensureCorrectTypes = (data: any[]): Token[] => {
  try {
    return data.map(item => ({
      ...item,
      // String olarak gelen sayısal değerleri number'a çevir
      price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
      marketCap: typeof item.marketCap === 'string' ? parseFloat(item.marketCap) : item.marketCap,
      marketCapChange24h: typeof item.marketCapChange24h === 'string' ? parseFloat(item.marketCapChange24h) : item.marketCapChange24h,
      totalSupply: typeof item.totalSupply === 'string' ? parseFloat(item.totalSupply) : item.totalSupply,
      circulatingSupply: typeof item.circulatingSupply === 'string' ? parseFloat(item.circulatingSupply) : item.circulatingSupply,
      holderCount: typeof item.holderCount === 'string' ? parseInt(item.holderCount) : item.holderCount,
      holderChange24h: typeof item.holderChange24h === 'string' ? parseInt(item.holderChange24h) : item.holderChange24h,
      volume1h: typeof item.volume1h === 'string' ? parseFloat(item.volume1h) : item.volume1h,
      volumeChange1h: typeof item.volumeChange1h === 'string' ? parseFloat(item.volumeChange1h) : item.volumeChange1h,
      volume5m: typeof item.volume5m === 'string' ? parseFloat(item.volume5m) : item.volume5m,
      volumeChange5m: typeof item.volumeChange5m === 'string' ? parseFloat(item.volumeChange5m) : item.volumeChange5m,
      volume24h: typeof item.volume24h === 'string' ? parseFloat(item.volume24h) : item.volume24h,
      totalVolume: typeof item.totalVolume === 'string' ? parseFloat(item.totalVolume) : item.totalVolume,
    }));
  } catch (e) {
    console.error('Token verilerini dönüştürürken hata:', e);
    return [];
  }
};

// Provider bileşeni
export const TokenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allTokens, setAllTokens] = useState<Token[]>([]);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<string>('Yükleniyor...');

  // API'den token verilerini çek
  const fetchTokens = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Token verileri alınıyor...');
      
      const response = await fetch('/api/tokens');
      
      if (!response.ok) {
        throw new Error('Token verileri alınamadı: ' + response.status);
      }
      
      const text = await response.text();
      
      if (!text || text.trim() === '') {
        throw new Error('Boş cevap alındı');
      }
      
      try {
        const data = JSON.parse(text);
        console.log('Gelen veri:', data);
        
        if (data && Array.isArray(data.tokens)) {
          // Tip dönüşümlerini güvenli şekilde yap
          const typedTokens = ensureCorrectTypes(data.tokens);
          setAllTokens(typedTokens);
          setIsError(false);
        } else {
          console.error('Token verisi beklenen formatta değil:', data);
          setIsError(true);
        }
      } catch (parseError) {
        console.error('JSON parse hatası:', parseError, 'Raw response:', text);
        setIsError(true);
      }
      
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Token verileri yüklenirken hata oluştu:', error);
      setIsError(true);
      setLastUpdate('Hata! Son deneme: ' + new Date().toLocaleTimeString());
    } finally {
      setIsLoading(false);
    }
  }, []);

  // İlk yüklemede ve interval ile çalıştır
  useEffect(() => {
    fetchTokens();

    // 30 saniyede bir otomatik olarak yenile
    const interval = setInterval(fetchTokens, 30000);
    
    return () => clearInterval(interval);
  }, [fetchTokens]);

  // Context değeri
  const contextValue: TokenContextValue = {
    allTokens,
    selectedToken,
    setSelectedToken,
    isLoading,
    isError,
    lastUpdate
  };

  return (
    <TokenContext.Provider value={contextValue}>
      {children}
    </TokenContext.Provider>
  );
};

// Context hook
export const useTokenContext = () => {
  return useContext(TokenContext);
};