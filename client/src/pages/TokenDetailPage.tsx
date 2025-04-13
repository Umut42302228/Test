import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { useTokenContext } from "@/context/TokenContext";
import { TokenTransaction } from "@/lib/types";
import TokenDetail from "@/components/TokenDetail";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function TokenDetailPage() {
  const [, params] = useRoute("/token/:address");
  const tokenAddress = params?.address;
  
  const { 
    allTokens, 
    setSelectedToken, 
    isLoading,
    getTokenTransactions,
    getTokenPriceHistory,
    getTokenVolumeHistory
  } = useTokenContext();
  
  const [token, setToken] = useState(null);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [priceHistory, setPriceHistory] = useState([]);
  const [volumeHistory, setVolumeHistory] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadToken = async () => {
      if (!tokenAddress) return;
      
      try {
        // First check if the token is in the current token list
        const foundToken = allTokens.find(t => t.address === tokenAddress);
        
        if (foundToken) {
          setToken(foundToken);
          setSelectedToken(foundToken);
          
          // Fetch additional data
          const [txData, priceData, volumeData] = await Promise.all([
            getTokenTransactions(tokenAddress),
            getTokenPriceHistory(tokenAddress),
            getTokenVolumeHistory(tokenAddress)
          ]);
          
          setTransactions(txData);
          setPriceHistory(priceData);
          setVolumeHistory(volumeData);
        } else {
          // If not found in current list, try to fetch it directly
          try {
            const response = await fetch(`/api/tokens/${tokenAddress}`);
            if (!response.ok) {
              throw new Error("Token bulunamadı");
            }
            
            const data = await response.json();
            if (data.token) {
              setToken(data.token);
              setSelectedToken(data.token);
              
              // Fetch additional data
              const [txData, priceData, volumeData] = await Promise.all([
                getTokenTransactions(tokenAddress),
                getTokenPriceHistory(tokenAddress),
                getTokenVolumeHistory(tokenAddress)
              ]);
              
              setTransactions(txData);
              setPriceHistory(priceData);
              setVolumeHistory(volumeData);
            } else {
              throw new Error("Token bulunamadı");
            }
          } catch (error) {
            setError("Bu token bulunamadı veya artık mevcut değil.");
          }
        }
      } catch (error) {
        setError("Token verilerini yüklerken bir hata oluştu.");
      } finally {
        setIsLoaded(true);
      }
    };
    
    loadToken();
    
    return () => {
      setSelectedToken(null);
    };
  }, [tokenAddress, allTokens, setSelectedToken]);

  if (isLoading && !isLoaded) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#121212]">
        <div className="text-center p-8">
          <div className="animate-spin mb-4 h-12 w-12 border-4 border-t-[#14F195] border-r-transparent border-b-transparent border-l-transparent rounded-full inline-block"></div>
          <p className="text-lg text-gray-400">Token bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#121212]">
        <div className="bg-[#1E1E1E] border border-[#333333] rounded-lg p-8 max-w-md w-full mx-4">
          <div className="flex items-center mb-6 text-red-500">
            <AlertCircle className="h-8 w-8 mr-2" />
            <h2 className="text-xl font-semibold">Hata</h2>
          </div>
          <p className="text-gray-300 mb-6">{error}</p>
          <Link href="/">
            <Button className="w-full bg-[#14F195] hover:bg-opacity-90 text-black">
              Ana Sayfaya Dön
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#121212]">
      <header className="bg-[#1E1E1E] border-b border-[#333333] p-4">
        <div className="container mx-auto flex items-center">
          <Link href="/">
            <a className="flex items-center text-gray-400 hover:text-white mr-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Ana Sayfaya Dön
            </a>
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-[#14F195]">Token Detayları</h1>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto py-8 px-4">
        <TokenDetail
          token={token}
          isOpen={true}
          onClose={() => {}} // This is a full page view, so we don't need to close it
          transactions={transactions}
          priceHistory={priceHistory}
          volumeHistory={volumeHistory}
        />
      </main>
    </div>
  );
}
