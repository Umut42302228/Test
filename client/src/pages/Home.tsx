import { useState, useEffect, useMemo } from "react";
import { useTokenContext } from "@/context/TokenContext";
import { SortField, SortDirection, Token, FilterParams } from "@/lib/types";
import { formatCurrency, formatShortAddress, formatTimeAgo, isNewToken } from "@/lib/utils";
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  SearchIcon, 
  FilterIcon,
  BarChart4Icon,
  UsersIcon,
  TagIcon,
  ClockIcon,
  TrendingUpIcon,
  AlertTriangleIcon,
  CheckCircleIcon
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const { 
    allTokens, 
    isLoading, 
    isError,
    lastUpdate,
    setSelectedToken
  } = useTokenContext();

  // Görüntülenecek tokenlar listesi
  const [displayTokens, setDisplayTokens] = useState<Token[]>([]);
  
  // Sıralama ayarları
  const [sortField, setSortField] = useState<SortField>("marketCap");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  
  // Arama ve filtreleme
  const [searchQuery, setSearchQuery] = useState("");
  const [filterParams, setFilterParams] = useState<FilterParams>({
    marketCapMin: "0",
    marketCapMax: "10000000000",
    launchDate: "all",
    minHolders: "0",
    minBuyVolume1h: "0",
    platforms: {
      raydium: true,
      pumpfun: true,
      orca: true
    }
  });
  
  // Görüntüleme modu
  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  // Filtreleri uygula
  const filteredTokens = useMemo(() => {
    try {
      if (!allTokens || allTokens.length === 0) return [];
      
      return allTokens.filter(token => {
        // Arama sorgusuna göre filtrele
        if (searchQuery && searchQuery.trim() !== "") {
          const query = searchQuery.toLowerCase();
          const matchesName = token.name.toLowerCase().includes(query);
          const matchesSymbol = token.symbol.toLowerCase().includes(query);
          const matchesAddress = token.address.toLowerCase().includes(query);
          
          if (!(matchesName || matchesSymbol || matchesAddress)) {
            return false;
          }
        }
        
        // Market Cap'e göre filtrele
        const marketCap = typeof token.marketCap === 'string' 
          ? parseFloat(token.marketCap) 
          : token.marketCap;
          
        if (
          marketCap < parseFloat(filterParams.marketCapMin) || 
          marketCap > parseFloat(filterParams.marketCapMax)
        ) {
          return false;
        }
        
        // Başlangıç tarihine göre filtrele
        if (filterParams.launchDate !== "all") {
          const launchDate = new Date(token.launchDate);
          const now = new Date();
          const diffDays = Math.floor((now.getTime() - launchDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (
            (filterParams.launchDate === "24h" && diffDays >= 1) ||
            (filterParams.launchDate === "7d" && diffDays >= 7) ||
            (filterParams.launchDate === "30d" && diffDays >= 30)
          ) {
            return false;
          }
        }
        
        // Sahip sayısına göre filtrele
        const holderCount = typeof token.holderCount === 'string' 
          ? parseInt(token.holderCount) 
          : token.holderCount;
          
        if (holderCount < parseInt(filterParams.minHolders)) {
          return false;
        }
        
        // 1 saatlik alım hacmine göre filtrele
        const volume1h = typeof token.volume1h === 'string' 
          ? parseFloat(token.volume1h) 
          : token.volume1h;
          
        if (volume1h < parseFloat(filterParams.minBuyVolume1h)) {
          return false;
        }
        
        // Platformlara göre filtrele
        if (
          (token.platform === "Raydium" && !filterParams.platforms.raydium) ||
          (token.platform === "pump.fun" && !filterParams.platforms.pumpfun) ||
          (token.platform === "Orca" && !filterParams.platforms.orca)
        ) {
          return false;
        }
        
        return true;
      });
    } catch (error) {
      console.error('Filtreleme hatası:', error);
      return [];
    }
  }, [allTokens, searchQuery, filterParams]);

  // Sıralama ve görüntüleme
  useEffect(() => {
    try {
      if (filteredTokens && filteredTokens.length > 0) {
        // Kopyasını al (orijinal diziyi değiştirmemek için)
        let sortedTokens = [...filteredTokens];
        
        // Seçilen alana göre sırala
        sortedTokens.sort((a, b) => {
          let aValue, bValue;
          
          switch (sortField) {
            case "marketCap":
              aValue = typeof a.marketCap === 'string' ? parseFloat(a.marketCap) : a.marketCap;
              bValue = typeof b.marketCap === 'string' ? parseFloat(b.marketCap) : b.marketCap;
              break;
            case "launchDate":
              aValue = new Date(a.launchDate).getTime();
              bValue = new Date(b.launchDate).getTime();
              break;
            case "holderCount":
              aValue = typeof a.holderCount === 'string' ? parseInt(a.holderCount) : a.holderCount;
              bValue = typeof b.holderCount === 'string' ? parseInt(b.holderCount) : b.holderCount;
              break;
            case "volume1h":
              aValue = typeof a.volume1h === 'string' ? parseFloat(a.volume1h) : a.volume1h;
              bValue = typeof b.volume1h === 'string' ? parseFloat(b.volume1h) : b.volume1h;
              break;
            case "volume5m":
              aValue = typeof a.volume5m === 'string' ? parseFloat(a.volume5m) : a.volume5m;
              bValue = typeof b.volume5m === 'string' ? parseFloat(b.volume5m) : b.volume5m;
              break;
            default:
              aValue = typeof a.marketCap === 'string' ? parseFloat(a.marketCap) : a.marketCap;
              bValue = typeof b.marketCap === 'string' ? parseFloat(b.marketCap) : b.marketCap;
          }
          
          if (sortDirection === "asc") {
            return aValue - bValue;
          } else {
            return bValue - aValue;
          }
        });
        
        setDisplayTokens(sortedTokens);
      } else {
        setDisplayTokens([]);
      }
    } catch (error) {
      console.error('Sıralama hatası:', error);
      setDisplayTokens([]);
    }
  }, [filteredTokens, sortField, sortDirection]);

  // Sıralama alanını değiştirme işleyicisi
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Aynı alan için sıralama yönünü değiştir
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Farklı alan için varsayılan azalan sıralama
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Token fiyatını güvenli şekilde göster
  const safeDisplayPrice = (token: Token) => {
    try {
      const price = typeof token.price === 'string' ? parseFloat(token.price) : token.price;
      return isNaN(price) ? "$0.0000" : `$${price.toFixed(6)}`;
    } catch (e) {
      return "$0.0000";
    }
  };

  // Market cap'i güvenli şekilde göster
  const safeDisplayMarketCap = (token: Token) => {
    try {
      const marketCap = typeof token.marketCap === 'string' 
        ? parseFloat(token.marketCap) 
        : token.marketCap;
      
      return isNaN(marketCap) ? "$0" : formatCurrency(marketCap);
    } catch (e) {
      return "$0";
    }
  };

  // Değişim yüzdesini güvenli şekilde göster ve renklendirme yap
  const safeDisplayChange = (change: string | number) => {
    try {
      const changeValue = typeof change === 'string' ? parseFloat(change) : change;
      
      if (isNaN(changeValue)) return (
        <span className="text-gray-500">0.00%</span>
      );
      
      const isPositive = changeValue > 0;
      const displayValue = `${isPositive ? '+' : ''}${changeValue.toFixed(2)}%`;
      
      return (
        <span className={`flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? <ArrowUpIcon className="w-3 h-3 mr-1" /> : <ArrowDownIcon className="w-3 h-3 mr-1" />}
          {displayValue}
        </span>
      );
    } catch (e) {
      return <span className="text-gray-500">0.00%</span>;
    }
  };

  // Sembolü güvenli şekilde göster
  const safeSymbol = (token: Token) => {
    try {
      return token.symbol ? token.symbol.substring(0, 2) : "??";
    } catch (e) {
      return "??";
    }
  };

  // Hacim değerini güvenli şekilde göster
  const safeDisplayVolume = (volume: string | number) => {
    try {
      const volumeValue = typeof volume === 'string' ? parseFloat(volume) : volume;
      return isNaN(volumeValue) ? "$0" : formatCurrency(volumeValue);
    } catch (e) {
      return "$0";
    }
  };

  // Token detayını görüntüle
  const handleTokenClick = (token: Token) => {
    setSelectedToken(token);
    // URL'yi token detay sayfasına yönlendir
    window.location.href = `/token/${token.address}`;
  };

  // Token risk seviyesine göre renk ve ikon belirle
  const getRiskLevelElement = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Güvenli':
        return (
          <div className="flex items-center text-green-500">
            <CheckCircleIcon className="w-4 h-4 mr-1" />
            <span>Güvenli</span>
          </div>
        );
      case 'Dikkatli':
        return (
          <div className="flex items-center text-amber-500">
            <AlertTriangleIcon className="w-4 h-4 mr-1" />
            <span>Dikkatli</span>
          </div>
        );
      case 'Riskli':
        return (
          <div className="flex items-center text-red-500">
            <AlertTriangleIcon className="w-4 h-4 mr-1" />
            <span>Riskli</span>
          </div>
        );
      default:
        return <span className="text-gray-500">Bilinmiyor</span>;
    }
  };

  // Tablo başlık sütununda sıralama yönünü belirten ikon göster
  const renderSortIcon = (field: SortField) => {
    if (field !== sortField) return null;
    
    return sortDirection === "asc" 
      ? <ArrowUpIcon className="w-4 h-4 ml-1" /> 
      : <ArrowDownIcon className="w-4 h-4 ml-1" />;
  };
  
  // Sıralanabilir başlıklar için sınıf adı
  const getSortableHeaderClass = (field: SortField) => {
    return `${field === sortField ? 'text-primary' : ''} cursor-pointer hover:text-primary flex items-center justify-end`;
  };

  // Card görünümünde kullanılan token kart bileşeni
  const TokenCard = ({ token }: { token: Token }) => (
    <Card 
      className="hover:border-primary/50 transition-all cursor-pointer" 
      onClick={() => handleTokenClick(token)}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: token.color || '#333' }}>
            {safeSymbol(token)}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{token.name}</CardTitle>
              {isNewToken(token.launchDate) && (
                <Badge variant="destructive" className="ml-2 text-xs">Yeni</Badge>
              )}
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground mt-1">{formatShortAddress(token.address)}</p>
              <div className="text-xs">
                {getRiskLevelElement(token.riskLevel)}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="border p-2 rounded-md">
            <p className="text-xs text-muted-foreground">Fiyat</p>
            <div className="text-sm font-medium">{safeDisplayPrice(token)}</div>
          </div>
          <div className="border p-2 rounded-md">
            <p className="text-xs text-muted-foreground">24s Değişim</p>
            <div className="text-sm">{safeDisplayChange(token.marketCapChange24h)}</div>
          </div>
          <div className="border p-2 rounded-md">
            <p className="text-xs text-muted-foreground">Market Cap</p>
            <div className="text-sm font-medium">{safeDisplayMarketCap(token)}</div>
          </div>
          <div className="border p-2 rounded-md">
            <p className="text-xs text-muted-foreground">24s Hacim</p>
            <div className="text-sm font-medium">{safeDisplayVolume(token.volume24h)}</div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <div className="flex items-center">
            <UsersIcon className="w-3 h-3 mr-1" />
            <span>{token.holderCount || 0} sahip</span>
          </div>
          <div className="flex items-center">
            <ClockIcon className="w-3 h-3 mr-1" />
            <span>{formatTimeAgo(token.launchDate)}</span>
          </div>
          <div className="flex items-center">
            <span>{token.platform}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-4 border-b sticky top-0 bg-background z-10 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold">Solana Token Takip</h1>
          <div className="flex items-center gap-4 mt-2 md:mt-0">
            <div className="flex items-center text-sm text-muted-foreground">
              <ClockIcon className="w-4 h-4 mr-1" />
              <span>Son güncelleme: {lastUpdate}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <TagIcon className="w-4 h-4 mr-1" />
              <span>Toplam: {filteredTokens?.length || 0} / {allTokens?.length || 0}</span>
            </div>
          </div>
        </div>
        
        {/* Arama, filtreleme ve görünüm kontrolü */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="relative md:col-span-4">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              className="pl-9" 
              placeholder="Token ara (isim, sembol, adres)" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="md:col-span-4 flex gap-2">
            <div className="w-full">
              <select 
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={sortField}
                onChange={(e) => setSortField(e.target.value as SortField)}
              >
                <option value="marketCap">Market Cap</option>
                <option value="launchDate">Başlangıç Tarihi</option>
                <option value="holderCount">Sahip Sayısı</option>
                <option value="volume1h">1s Hacim</option>
                <option value="volume5m">5dk Hacim</option>
              </select>
            </div>
            
            <div className="w-[120px]">
              <select 
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={sortDirection}
                onChange={(e) => setSortDirection(e.target.value as SortDirection)}
              >
                <option value="asc">Artan</option>
                <option value="desc">Azalan</option>
              </select>
            </div>
          </div>
          
          <div className="md:col-span-4 flex justify-between items-center">
            <div className="flex gap-2">
              <Button 
                variant={viewMode === "table" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setViewMode("table")}
              >
                <BarChart4Icon className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Tablo</span>
              </Button>
              <Button 
                variant={viewMode === "card" ? "default" : "outline"} 
                size="sm" 
                onClick={() => setViewMode("card")}
              >
                <TrendingUpIcon className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Kartlar</span>
              </Button>
            </div>
            
            <Button variant="outline" size="sm" onClick={() => {
              // Filtreleme panelini aç/kapat
              // İlerleyen geliştirmelerde eklenecek
            }}>
              <FilterIcon className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Filtrele</span>
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 p-4">
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Tokenlar yükleniyor...</p>
          </div>
        ) : isError ? (
          <div className="py-20 text-center">
            <p className="text-red-500">Veri yüklenirken bir hata oluştu.</p>
            <p className="mt-2 text-muted-foreground">Lütfen daha sonra tekrar deneyin.</p>
          </div>
        ) : displayTokens.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-muted-foreground">Hiç token bulunamadı.</p>
            <p className="text-sm text-muted-foreground mt-2">Filtreleri temizlemeyi veya farklı bir arama terimi denemeyi deneyin.</p>
          </div>
        ) : viewMode === "table" ? (
          <div className="bg-card rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-3 font-medium">#</th>
                    <th className="text-left p-3 font-medium">İsim</th>
                    <th className="p-3 font-medium">
                      <div 
                        className={getSortableHeaderClass("marketCap")} 
                        onClick={() => handleSort("marketCap")}
                      >
                        Fiyat {renderSortIcon("marketCap")}
                      </div>
                    </th>
                    <th className="p-3 font-medium">24s %</th>
                    <th className="p-3 font-medium">
                      <div 
                        className={getSortableHeaderClass("marketCap")} 
                        onClick={() => handleSort("marketCap")}
                      >
                        Market Cap {renderSortIcon("marketCap")}
                      </div>
                    </th>
                    <th className="p-3 font-medium">
                      <div 
                        className={getSortableHeaderClass("volume1h")} 
                        onClick={() => handleSort("volume1h")}
                      >
                        1s Hacim {renderSortIcon("volume1h")}
                      </div>
                    </th>
                    <th className="p-3 font-medium">
                      <div 
                        className={getSortableHeaderClass("holderCount")} 
                        onClick={() => handleSort("holderCount")}
                      >
                        Sahip Sayısı {renderSortIcon("holderCount")}
                      </div>
                    </th>
                    <th className="p-3 font-medium">
                      <div 
                        className={getSortableHeaderClass("launchDate")} 
                        onClick={() => handleSort("launchDate")}
                      >
                        Başlangıç {renderSortIcon("launchDate")}
                      </div>
                    </th>
                    <th className="p-3 font-medium">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {displayTokens.map((token: Token, index: number) => (
                    <tr 
                      key={token.address} 
                      className="border-b border-border hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleTokenClick(token)}
                    >
                      <td className="p-3 text-muted-foreground">{index + 1}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: token.color || '#333' }}>
                            {safeSymbol(token)}
                          </div>
                          <div>
                            <div className="font-medium flex items-center">
                              {token.name || "İsimsiz Token"}
                              {isNewToken(token.launchDate) && (
                                <Badge variant="destructive" className="ml-2 text-xs">Yeni</Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">{formatShortAddress(token.address)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-right font-medium">{safeDisplayPrice(token)}</td>
                      <td className="p-3 text-right">{safeDisplayChange(token.marketCapChange24h)}</td>
                      <td className="p-3 text-right">{safeDisplayMarketCap(token)}</td>
                      <td className="p-3 text-right">{safeDisplayVolume(token.volume1h)}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end">
                          <span>{token.holderCount || 0}</span>
                          <span className="ml-1 text-xs">{safeDisplayChange(token.holderChange24h)}</span>
                        </div>
                      </td>
                      <td className="p-3 text-right">{formatTimeAgo(token.launchDate)}</td>
                      <td className="p-3 text-right">{getRiskLevelElement(token.riskLevel)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayTokens.map((token) => (
              <TokenCard key={token.address} token={token} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
