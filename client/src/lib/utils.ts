import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as a currency string.
 */
export function formatCurrency(value: number): string {
  if (!value && value !== 0) return '$0';
  
  if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(2)}B`;
  } else if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(2)}K`;
  }
  
  return `$${value.toFixed(2)}`;
}

/**
 * Formats a number with thousands separators.
 */
export function formatNumber(value: number): string {
  if (!value && value !== 0) return '0';
  
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(2)}B`;
  } else if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(2)}K`;
  }
  
  return value.toLocaleString('tr-TR');
}

/**
 * Shortens an address or other long string for display.
 */
export function formatShortAddress(address: string): string {
  if (!address) return '';
  if (address.length < 12) return address;
  
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

/**
 * Returns a human-readable relative time string (e.g. "2 hours ago").
 */
export function formatTimeAgo(timestamp: string | number | Date): string {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return diffInSeconds <= 5 ? 'Şimdi' : `${diffInSeconds} sn önce`;
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} dk önce`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} sa önce`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} gün önce`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} ay önce`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} yıl önce`;
}

/**
 * Creates a colored background for a token based on its name.
 */
export function getTokenColor(name: string): string {
  if (!name) return 'purple';
  
  const colors = ['purple', 'green', 'blue', 'red', 'yellow', 'indigo', 'pink'];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

/**
 * Gets initials from a token name for display in avatars.
 */
export function getTokenInitials(name: string): string {
  if (!name) return '';
  
  // Split by spaces or special characters
  const parts = name.split(/[\s-_+]+/);
  
  if (parts.length >= 2) {
    // Get first letter from first two parts
    return (parts[0][0] + parts[1][0]).toUpperCase();
  } else if (name.length >= 2) {
    // Get first two letters
    return name.substring(0, 2).toUpperCase();
  } else {
    return name.toUpperCase();
  }
}

/**
 * Returns a random value within a range, useful for demo data.
 */
export function getRandomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Determines if a token is "new" (less than 24 hours old).
 */
export function isNewToken(launchDate: string): boolean {
  if (!launchDate) return false;
  
  const launchTime = new Date(launchDate).getTime();
  const now = new Date().getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;
  
  return now - launchTime < oneDayMs;
}

/**
 * Formats a price with appropriate precision based on the value.
 */
export function formatPrice(price: number): string {
  if (!price && price !== 0) return '$0.00';
  
  // For very small numbers, show more decimals
  if (price < 0.000001) {
    return `$${price.toFixed(10)}`;
  } else if (price < 0.0001) {
    return `$${price.toFixed(8)}`;
  } else if (price < 0.01) {
    return `$${price.toFixed(6)}`;
  } else if (price < 1) {
    return `$${price.toFixed(4)}`;
  } else if (price < 1000) {
    return `$${price.toFixed(2)}`;
  }
  
  return formatCurrency(price);
}
