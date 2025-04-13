import { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from '@/components/ui/separator';
import { Token, TokenTransaction } from '@/lib/types';
import { formatCurrency, formatNumber, formatShortAddress, formatTimeAgo, getTokenInitials } from '@/lib/utils';
import PriceChart from './charts/PriceChart';
import VolumeChart from './charts/VolumeChart';

interface TokenDetailProps {
  token: Token | null;
  isOpen: boolean;
  onClose: () => void;
  transactions: TokenTransaction[];
  priceHistory: { time: string; price: number }[];
  volumeHistory: { time: string; volume: number }[];
}

const TimeframeButton = ({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) => (
  <button 
    className={`px-2 py-1 text-xs rounded ${active ? 'bg-solana-green text-black' : 'bg-solana-card text-gray-300'}`}
    onClick={onClick}
  >
    {label}
  </button>
);

export function TokenDetail({ token, isOpen, onClose, transactions, priceHistory, volumeHistory }: TokenDetailProps) {
  const [priceTimeframe, setPriceTimeframe] = useState<'1h' | '1d' | '1w' | 'all'>('1h');
  const [volumeTimeframe, setVolumeTimeframe] = useState<'1h' | '1d' | '1w' | 'all'>('1h');

  if (!token) return null;

  const securityStatus = (status: boolean | string, label: string) => (
    <div className="flex items-center justify-between">
      <span className="text-gray-400">{label}</span>
      {typeof status === 'boolean' ? (
        <span className={`flex items-center ${status ? 'text-status-success' : 'text-status-danger'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {status ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            )}
          </svg>
          {status ? 'Evet' : 'Hayır'}
        </span>
      ) : (
        <span className="flex items-center text-status-success">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {status}
        </span>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-solana-card rounded-lg w-full max-w-4xl max-h-[90vh] overflow-auto p-0">
        <div className="p-4 border-b border-solana-border flex items-center justify-between sticky top-0 bg-solana-card z-10">
          <div className="flex items-center">
            <div className={`h-10 w-10 rounded-full bg-${token.color || 'purple'}-500 flex items-center justify-center text-white font-bold mr-3`}>
              {getTokenInitials(token.name)}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{token.name} ({token.symbol})</h2>
              <p className="text-sm text-gray-400">{formatShortAddress(token.address)}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-solana-dark p-4 rounded-lg">
              <p className="text-gray-400 text-sm">Piyasa Değeri</p>
              <p className="text-xl font-semibold">{formatCurrency(token.marketCap)}</p>
              <p className={`text-sm ${token.marketCapChange24h >= 0 ? 'text-status-success' : 'text-status-danger'}`}>
                Son 24 saatte {token.marketCapChange24h >= 0 ? '+' : ''}{token.marketCapChange24h}%
              </p>
            </div>
            <div className="bg-solana-dark p-4 rounded-lg">
              <p className="text-gray-400 text-sm">Holder Sayısı</p>
              <p className="text-xl font-semibold">{formatNumber(token.holderCount)}</p>
              <p className="text-sm text-status-success">Son 24 saatte +{token.holderChange24h}</p>
            </div>
            <div className="bg-solana-dark p-4 rounded-lg">
              <p className="text-gray-400 text-sm">Toplam İşlem Hacmi</p>
              <p className="text-xl font-semibold">{formatCurrency(token.totalVolume)}</p>
              <p className="text-sm text-status-success">Son 24 saatte +{formatCurrency(token.volume24h)}</p>
            </div>
          </div>
          
          <div className="bg-solana-dark p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Fiyat Grafiği</h3>
              <div className="flex space-x-2">
                <TimeframeButton 
                  active={priceTimeframe === '1h'} 
                  label="1S" 
                  onClick={() => setPriceTimeframe('1h')} 
                />
                <TimeframeButton 
                  active={priceTimeframe === '1d'} 
                  label="1G" 
                  onClick={() => setPriceTimeframe('1d')} 
                />
                <TimeframeButton 
                  active={priceTimeframe === '1w'} 
                  label="1H" 
                  onClick={() => setPriceTimeframe('1w')} 
                />
                <TimeframeButton 
                  active={priceTimeframe === 'all'} 
                  label="Tümü" 
                  onClick={() => setPriceTimeframe('all')} 
                />
              </div>
            </div>
            <div className="h-64">
              <PriceChart data={priceHistory} timeframe={priceTimeframe} />
            </div>
          </div>
          
          <div className="bg-solana-dark p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">İşlem Hacmi</h3>
              <div className="flex space-x-2">
                <TimeframeButton 
                  active={volumeTimeframe === '1h'} 
                  label="1S" 
                  onClick={() => setVolumeTimeframe('1h')} 
                />
                <TimeframeButton 
                  active={volumeTimeframe === '1d'} 
                  label="1G" 
                  onClick={() => setVolumeTimeframe('1d')} 
                />
                <TimeframeButton 
                  active={volumeTimeframe === '1w'} 
                  label="1H" 
                  onClick={() => setVolumeTimeframe('1w')} 
                />
                <TimeframeButton 
                  active={volumeTimeframe === 'all'} 
                  label="Tümü" 
                  onClick={() => setVolumeTimeframe('all')} 
                />
              </div>
            </div>
            <div className="h-64">
              <VolumeChart data={volumeHistory} timeframe={volumeTimeframe} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-solana-dark p-4 rounded-lg">
              <h3 className="font-medium mb-4">Token Bilgileri</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Token Adresi</span>
                  <span className="text-sm font-mono bg-solana-card px-2 py-1 rounded">
                    {formatShortAddress(token.address)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Çıkış Tarihi</span>
                  <span>
                    {new Date(token.launchDate).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })} 
                    ({formatTimeAgo(token.launchDate)})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Toplam Arz</span>
                  <span>{formatNumber(token.totalSupply)} {token.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Dolaşımdaki Arz</span>
                  <span>{formatNumber(token.circulatingSupply)} {token.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Güncel Fiyat</span>
                  <span>${token.price.toFixed(8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Platform</span>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    token.platform === 'Raydium' ? 'bg-purple-900 text-purple-200' : 
                    token.platform === 'pump.fun' ? 'bg-blue-900 text-blue-200' : 
                    'bg-teal-900 text-teal-200'
                  }`}>
                    {token.platform}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-solana-dark p-4 rounded-lg">
              <h3 className="font-medium mb-4">Güvenlik Kontrolleri</h3>
              <div className="space-y-3">
                {securityStatus(token.security.liquidityLocked, "Likidite Kilidi")}
                {securityStatus(token.security.mintDisabled, "Mint Yetkisi")}
                {securityStatus(token.security.contractVerified, "Sözleşme Doğrulaması")}
                {securityStatus(token.riskLevel, "Genel Risk Seviyesi")}
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Likidite Oranı</span>
                  <span className="flex items-center text-status-success">{token.security.liquidityRatio}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">En Büyük Holder</span>
                  <span className="flex items-center text-status-success">{token.security.largestHolder}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-solana-dark p-4 rounded-lg mt-6">
            <h3 className="font-medium mb-4">Son İşlemler</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-solana-border">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">İşlem</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Miktar</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Değer (USD)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Cüzdan</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Zaman</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-solana-border">
                  {transactions.length > 0 ? (
                    transactions.map((tx, index) => (
                      <tr key={tx.id || index}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={tx.type === 'buy' ? 'text-status-success' : 'text-status-danger'}>
                            {tx.type === 'buy' ? 'Alım' : 'Satım'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">{formatNumber(tx.amount)} {token.symbol}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{formatCurrency(tx.valueUsd)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm font-mono">{formatShortAddress(tx.wallet)}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">{formatTimeAgo(tx.timestamp)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-4 text-center text-gray-400">İşlem bulunamadı</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <Button 
              asChild 
              className="bg-solana-green hover:bg-opacity-90 text-black font-medium py-2 px-4 rounded transition-colors duration-200 flex items-center justify-center"
            >
              <a href={`https://solscan.io/token/${token.address}`} target="_blank" rel="noopener noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Solscan'de Görüntüle
              </a>
            </Button>
            <Button 
              asChild 
              className={`${
                token.platform === 'Raydium' ? 'bg-purple-600' : 
                token.platform === 'pump.fun' ? 'bg-blue-600' : 
                'bg-teal-600'
              } hover:bg-opacity-90 text-white font-medium py-2 px-4 rounded transition-colors duration-200 flex items-center justify-center`}
            >
              <a 
                href={token.platformUrl || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                {token.platform}'da İşlem Yap
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default TokenDetail;
