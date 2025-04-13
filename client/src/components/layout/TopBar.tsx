import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface TopBarProps {
  onOpenSidebar: () => void;
  onSearch: (query: string) => void;
  onUpdateInterval: (interval: string) => void;
  isRealtime: boolean;
  stats: {
    totalTokens: number;
    newTokens24h: number;
    volume24h: string;
  };
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function TopBar({
  onOpenSidebar,
  onSearch,
  onUpdateInterval,
  isRealtime,
  stats,
  activeTab,
  onTabChange
}: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <>
      <div className="bg-solana-card border-b border-solana-border p-4 flex items-center justify-between">
        <button
          onClick={onOpenSidebar}
          className="md:hidden text-gray-500 hover:text-white mr-3"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div className="relative flex-1 max-w-2xl">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          <Input
            type="text"
            placeholder="Token adı veya adresi ile ara..."
            value={searchQuery}
            onChange={handleSearch}
            className="bg-solana-dark border border-solana-border rounded-md pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-1 focus:ring-solana-green"
          />
        </div>

        <div className="flex items-center ml-4 space-x-4">
          <div className="flex items-center">
            <div
              className={`h-2 w-2 ${
                isRealtime ? "bg-status-success" : "bg-status-danger"
              } rounded-full mr-2 animate-pulse`}
            ></div>
            <span className="text-sm hidden md:inline">
              {isRealtime ? "Gerçek Zamanlı" : "Bağlantı Kesik"}
            </span>
          </div>
          <Select
            defaultValue="10s"
            onValueChange={onUpdateInterval}
          >
            <SelectTrigger className="bg-solana-dark border border-solana-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-solana-green">
              <SelectValue placeholder="10s" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10s">10 sn</SelectItem>
              <SelectItem value="30s">30 sn</SelectItem>
              <SelectItem value="60s">60 sn</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-solana-card border-b border-solana-border p-4 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div className="flex items-center space-x-1">
          <button
            className={`px-4 py-2 ${
              activeTab === "all" 
                ? "text-solana-green border-b-2 border-solana-green font-medium" 
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => onTabChange("all")}
          >
            Tüm Tokenler
          </button>
          <button
            className={`px-4 py-2 ${
              activeTab === "new" 
                ? "text-solana-green border-b-2 border-solana-green font-medium" 
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => onTabChange("new")}
          >
            Yeni Çıkanlar
          </button>
          <button
            className={`px-4 py-2 ${
              activeTab === "popular" 
                ? "text-solana-green border-b-2 border-solana-green font-medium" 
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => onTabChange("popular")}
          >
            En Çok Alınanlar
          </button>
        </div>

        <div className="flex items-center space-x-4 text-sm">
          <div className="flex flex-col items-center md:items-start">
            <span className="text-gray-400">Taranan Token</span>
            <span className="font-semibold">{stats.totalTokens.toLocaleString()}</span>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <span className="text-gray-400">Son 24s Yeni</span>
            <span className="font-semibold text-status-success">+{stats.newTokens24h}</span>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <span className="text-gray-400">İşlem Hacmi (24s)</span>
            <span className="font-semibold">${stats.volume24h}</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default TopBar;
