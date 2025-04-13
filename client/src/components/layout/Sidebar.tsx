import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckboxProps } from "@/components/ui/checkbox";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { FilterParams } from "@/lib/types";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterParams;
  onApplyFilters: (filters: FilterParams) => void;
  onResetFilters: () => void;
  connectionStatus: "online" | "offline";
  lastUpdate: string;
}

export function Sidebar({ 
  isOpen, 
  onClose, 
  filters, 
  onApplyFilters, 
  onResetFilters,
  connectionStatus,
  lastUpdate
}: SidebarProps) {
  const [localFilters, setLocalFilters] = useState<FilterParams>(filters);

  const handleUpdateFilter = (key: keyof FilterParams, value: any) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    onApplyFilters(localFilters);
  };

  const handleResetFilters = () => {
    const resetFilters: FilterParams = {
      marketCapMin: "",
      marketCapMax: "",
      launchDate: "all",
      minHolders: "",
      minBuyVolume1h: "",
      platforms: {
        raydium: true,
        pumpfun: true,
        orca: true
      }
    };
    setLocalFilters(resetFilters);
    onResetFilters();
  };

  const handlePlatformChange = (platform: keyof typeof filters.platforms, checked: boolean) => {
    setLocalFilters(prev => ({
      ...prev,
      platforms: {
        ...prev.platforms,
        [platform]: checked
      }
    }));
  };

  const sidebarClasses = `bg-solana-card border-r border-solana-border w-full md:w-72 flex-shrink-0 overflow-y-auto transition-all duration-300 transform ${
    isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
  } fixed md:static top-0 left-0 h-full z-40`;

  return (
    <div className={sidebarClasses}>
      <div className="p-4 border-b border-solana-border flex items-center justify-between">
        <div className="flex items-center">
          <img 
            src="https://cryptologos.cc/logos/solana-sol-logo.png" 
            alt="Solana Logo" 
            className="w-8 h-8 mr-3"
          />
          <h1 className="text-xl font-semibold text-solana-green">Solana İzleyici</h1>
        </div>
        <button 
          onClick={onClose} 
          className="md:hidden text-gray-500 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-4">
        <h2 className="text-lg font-medium mb-4">Filtreler</h2>
        
        <div className="mb-6">
          <Label className="block text-sm font-medium text-gray-400 mb-2">
            Piyasa Değeri (USD)
          </Label>
          <div className="flex space-x-2">
            <Input
              type="number"
              placeholder="Min"
              value={localFilters.marketCapMin}
              onChange={(e) => handleUpdateFilter("marketCapMin", e.target.value)}
              className="bg-solana-dark border border-solana-border rounded px-3 py-2 w-1/2 focus:outline-none focus:ring-1 focus:ring-solana-green text-sm"
            />
            <Input
              type="number"
              placeholder="Max"
              value={localFilters.marketCapMax}
              onChange={(e) => handleUpdateFilter("marketCapMax", e.target.value)}
              className="bg-solana-dark border border-solana-border rounded px-3 py-2 w-1/2 focus:outline-none focus:ring-1 focus:ring-solana-green text-sm"
            />
          </div>
        </div>

        <div className="mb-6">
          <Label className="block text-sm font-medium text-gray-400 mb-2">
            Çıkış Tarihi
          </Label>
          <Select 
            value={localFilters.launchDate}
            onValueChange={(value) => handleUpdateFilter("launchDate", value)}
          >
            <SelectTrigger className="bg-solana-dark border border-solana-border rounded px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-solana-green text-sm">
              <SelectValue placeholder="Tümü" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="24h">Son 24 Saat</SelectItem>
              <SelectItem value="7d">Son 7 Gün</SelectItem>
              <SelectItem value="30d">Son 30 Gün</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mb-6">
          <Label className="block text-sm font-medium text-gray-400 mb-2">
            Minimum Holder Sayısı
          </Label>
          <Input
            type="number"
            placeholder="Örn: 100"
            value={localFilters.minHolders}
            onChange={(e) => handleUpdateFilter("minHolders", e.target.value)}
            className="bg-solana-dark border border-solana-border rounded px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-solana-green text-sm"
          />
        </div>

        <div className="mb-6">
          <Label className="block text-sm font-medium text-gray-400 mb-2">
            Son 1 Saatteki Alım (USD)
          </Label>
          <Input
            type="number"
            placeholder="Örn: 5000"
            value={localFilters.minBuyVolume1h}
            onChange={(e) => handleUpdateFilter("minBuyVolume1h", e.target.value)}
            className="bg-solana-dark border border-solana-border rounded px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-solana-green text-sm"
          />
        </div>

        <div className="mb-6">
          <Label className="block text-sm font-medium text-gray-400 mb-2">
            Platform
          </Label>
          <div className="space-y-2">
            <div className="flex items-center">
              <Checkbox 
                id="raydium" 
                checked={localFilters.platforms.raydium}
                onCheckedChange={(checked) => handlePlatformChange("raydium", checked as boolean)}
                className="h-4 w-4 text-solana-green focus:ring-solana-green border-solana-border rounded bg-solana-dark"
              />
              <Label htmlFor="raydium" className="ml-2 text-sm">
                Raydium
              </Label>
            </div>
            <div className="flex items-center">
              <Checkbox 
                id="pumpfun" 
                checked={localFilters.platforms.pumpfun}
                onCheckedChange={(checked) => handlePlatformChange("pumpfun", checked as boolean)}
                className="h-4 w-4 text-solana-green focus:ring-solana-green border-solana-border rounded bg-solana-dark"
              />
              <Label htmlFor="pumpfun" className="ml-2 text-sm">
                pump.fun
              </Label>
            </div>
            <div className="flex items-center">
              <Checkbox 
                id="orca" 
                checked={localFilters.platforms.orca}
                onCheckedChange={(checked) => handlePlatformChange("orca", checked as boolean)}
                className="h-4 w-4 text-solana-green focus:ring-solana-green border-solana-border rounded bg-solana-dark"
              />
              <Label htmlFor="orca" className="ml-2 text-sm">
                Orca
              </Label>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleApplyFilters}
          className="bg-solana-green hover:bg-opacity-90 text-black font-medium py-2 px-4 rounded w-full transition-colors duration-200"
        >
          Filtreleri Uygula
        </Button>

        <Button 
          onClick={handleResetFilters}
          variant="ghost"
          className="mt-3 text-sm text-gray-400 hover:text-white w-full text-center"
        >
          Filtreleri Sıfırla
        </Button>
      </div>

      <div className="p-4 border-t border-solana-border mt-auto">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Bağlantı Durumu:</span>
          <span className={`flex items-center ${connectionStatus === 'online' ? 'text-status-success' : 'text-status-danger'}`}>
            <span className={`h-2 w-2 ${connectionStatus === 'online' ? 'bg-status-success' : 'bg-status-danger'} rounded-full mr-2 animate-pulse`}></span>
            {connectionStatus === 'online' ? 'Çevrimiçi' : 'Çevrimdışı'}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-gray-400">Son Güncelleme:</span>
          <span className="text-gray-200">{lastUpdate}</span>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
