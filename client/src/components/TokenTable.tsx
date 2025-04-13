import { Link } from "wouter";
import { Token, SortDirection, SortField } from "@/lib/types";
import { formatCurrency, formatNumber, formatShortAddress, formatTimeAgo, getTokenInitials } from "@/lib/utils";

interface TokenTableProps {
  tokens: Token[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  isLoading: boolean;
}

export function TokenTable({ tokens, sortField, sortDirection, onSort, isLoading }: TokenTableProps) {
  const renderSortIcon = (field: SortField) => {
    return (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-4 w-4 inline-block ml-1" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M19 9l-7 7-7-7" 
        />
      </svg>
    );
  };

  const getSortableHeaderClass = (field: SortField) => {
    return `px-4 py-3 text-left text-xs font-medium ${
      sortField === field ? "text-white" : "text-gray-400"
    } uppercase tracking-wider whitespace-nowrap cursor-pointer hover:text-white`;
  };

  const renderTokenRows = () => {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, index) => (
        <tr key={`loading-${index}`} className="hover:bg-solana-hover transition-colors animate-pulse">
          <td className="px-4 py-4 whitespace-nowrap">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-solana-border"></div>
              <div className="ml-4">
                <div className="h-4 w-24 bg-solana-border rounded"></div>
                <div className="h-3 w-16 mt-1 bg-solana-border rounded"></div>
              </div>
            </div>
          </td>
          <td className="px-4 py-4 whitespace-nowrap">
            <div className="h-4 w-20 bg-solana-border rounded"></div>
            <div className="h-3 w-12 mt-1 bg-solana-border rounded"></div>
          </td>
          <td className="px-4 py-4 whitespace-nowrap">
            <div className="h-4 w-20 bg-solana-border rounded"></div>
            <div className="h-3 w-16 mt-1 bg-solana-border rounded"></div>
          </td>
          <td className="px-4 py-4 whitespace-nowrap">
            <div className="h-4 w-16 bg-solana-border rounded"></div>
          </td>
          <td className="px-4 py-4 whitespace-nowrap">
            <div className="h-4 w-20 bg-solana-border rounded"></div>
            <div className="h-3 w-12 mt-1 bg-solana-border rounded"></div>
          </td>
          <td className="px-4 py-4 whitespace-nowrap">
            <div className="h-4 w-16 bg-solana-border rounded"></div>
            <div className="h-3 w-12 mt-1 bg-solana-border rounded"></div>
          </td>
          <td className="px-4 py-4 whitespace-nowrap">
            <div className="h-5 w-16 bg-solana-border rounded-full"></div>
          </td>
          <td className="px-4 py-4 whitespace-nowrap">
            <div className="h-5 w-16 bg-solana-border rounded"></div>
          </td>
        </tr>
      ));
    }

    if (tokens.length === 0) {
      return (
        <tr>
          <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
            Token bulunamadı
          </td>
        </tr>
      );
    }

    return tokens.map((token) => (
      <tr 
        key={token.address} 
        className="hover:bg-solana-hover cursor-pointer transition-colors"
      >
        <td className="px-4 py-4 whitespace-nowrap">
          <Link href={`/token/${token.address}`}>
            <a className="flex items-center">
              <div 
                className={`flex-shrink-0 h-8 w-8 rounded-full bg-${token.color || 'purple'}-500 flex items-center justify-center text-white font-bold`}
              >
                {getTokenInitials(token.name)}
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium">{token.name}</div>
                <div className="text-xs text-gray-400 truncate max-w-[100px]">
                  {formatShortAddress(token.address)}
                </div>
              </div>
            </a>
          </Link>
        </td>
        <td className="px-4 py-4 whitespace-nowrap">
          <div className="text-sm">{formatCurrency(token.marketCap)}</div>
          <div className={`text-xs ${token.marketCapChange24h >= 0 ? 'text-status-success' : 'text-status-danger'}`}>
            {token.marketCapChange24h >= 0 ? '+' : ''}{token.marketCapChange24h}%
          </div>
        </td>
        <td className="px-4 py-4 whitespace-nowrap">
          <div className="text-sm">{new Date(token.launchDate).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
          <div className="text-xs text-gray-400">{formatTimeAgo(token.launchDate)}</div>
        </td>
        <td className="px-4 py-4 whitespace-nowrap">
          <div className="text-sm">{formatNumber(token.holderCount)}</div>
        </td>
        <td className="px-4 py-4 whitespace-nowrap">
          <div className="text-sm">{formatCurrency(token.volume1h)}</div>
          <div className={`text-xs ${token.volumeChange1h >= 0 ? 'text-status-success' : 'text-status-danger'}`}>
            {token.volumeChange1h >= 0 ? '+' : ''}{token.volumeChange1h}%
          </div>
        </td>
        <td className="px-4 py-4 whitespace-nowrap">
          <div className="text-sm">{formatCurrency(token.volume5m)}</div>
          <div className={`text-xs ${token.volumeChange5m >= 0 ? 'text-status-success' : 'text-status-danger'}`}>
            {token.volumeChange5m >= 0 ? '+' : ''}{token.volumeChange5m}%
          </div>
        </td>
        <td className="px-4 py-4 whitespace-nowrap">
          <span 
            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              token.platform === 'Raydium' ? 'bg-purple-900 text-purple-200' : 
              token.platform === 'pump.fun' ? 'bg-blue-900 text-blue-200' : 
              'bg-teal-900 text-teal-200'
            }`}
          >
            {token.platform}
          </span>
        </td>
        <td className="px-4 py-4 whitespace-nowrap">
          <span className={`flex items-center ${
            token.riskLevel === 'Güvenli' ? 'text-status-success' :
            token.riskLevel === 'Dikkatli' ? 'text-status-warning' :
            'text-status-danger'
          } text-xs`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {token.riskLevel === 'Güvenli' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : token.riskLevel === 'Dikkatli' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              )}
            </svg>
            {token.riskLevel}
          </span>
        </td>
      </tr>
    ));
  };

  return (
    <div className="flex-1 overflow-auto">
      <table className="min-w-full divide-y divide-solana-border">
        <thead className="bg-solana-dark sticky top-0">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
              Token Adı
            </th>
            <th 
              scope="col" 
              className={getSortableHeaderClass("marketCap")}
              onClick={() => onSort("marketCap")}
            >
              Piyasa Değeri
              {renderSortIcon("marketCap")}
            </th>
            <th 
              scope="col" 
              className={getSortableHeaderClass("launchDate")}
              onClick={() => onSort("launchDate")}
            >
              Çıkış Tarihi
              {renderSortIcon("launchDate")}
            </th>
            <th 
              scope="col" 
              className={getSortableHeaderClass("holderCount")}
              onClick={() => onSort("holderCount")}
            >
              Holder Sayısı
              {renderSortIcon("holderCount")}
            </th>
            <th 
              scope="col" 
              className={getSortableHeaderClass("volume1h")}
              onClick={() => onSort("volume1h")}
            >
              Son 1 Saat Alım
              {renderSortIcon("volume1h")}
            </th>
            <th 
              scope="col" 
              className={getSortableHeaderClass("volume5m")}
              onClick={() => onSort("volume5m")}
            >
              Son 5 Dk Alım
              {renderSortIcon("volume5m")}
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
              Platform
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
              Durum
            </th>
          </tr>
        </thead>
        <tbody className="bg-solana-dark divide-y divide-solana-border">
          {renderTokenRows()}
        </tbody>
      </table>
    </div>
  );
}

export default TokenTable;
