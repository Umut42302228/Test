import { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface PriceChartData {
  time: string;
  price: number;
}

interface PriceChartProps {
  data: PriceChartData[];
  timeframe: '1h' | '1d' | '1w' | 'all';
}

export function PriceChart({ data, timeframe }: PriceChartProps) {
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }

    const now = new Date().getTime();
    
    switch(timeframe) {
      case '1h':
        return data.filter(item => {
          const time = new Date(item.time).getTime();
          return now - time <= 60 * 60 * 1000; // 1 hour in milliseconds
        });
      case '1d':
        return data.filter(item => {
          const time = new Date(item.time).getTime();
          return now - time <= 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        });
      case '1w':
        return data.filter(item => {
          const time = new Date(item.time).getTime();
          return now - time <= 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
        });
      case 'all':
      default:
        return data;
    }
  }, [data, timeframe]);

  // Return a loading state if no data is available
  if (!filteredData.length) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p className="text-gray-400">Veri yükleniyor...</p>
      </div>
    );
  }

  const formatXAxis = (tickItem: string) => {
    const date = new Date(tickItem);
    
    switch(timeframe) {
      case '1h':
        return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      case '1d':
        return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      case '1w':
        return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
      case 'all':
        return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
      default:
        return tickItem;
    }
  };

  const formatTooltipValue = (value: number) => {
    return `$${value.toFixed(8)}`;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={filteredData}
        margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
        <XAxis 
          dataKey="time" 
          tickFormatter={formatXAxis} 
          stroke="rgba(255, 255, 255, 0.5)"
          tick={{ fill: 'rgba(255, 255, 255, 0.5)' }}
        />
        <YAxis 
          tickFormatter={(value) => `$${value.toFixed(8)}`} 
          stroke="rgba(255, 255, 255, 0.5)"
          tick={{ fill: 'rgba(255, 255, 255, 0.5)' }}
          width={80}
        />
        <Tooltip 
          formatter={formatTooltipValue}
          contentStyle={{ 
            backgroundColor: 'rgba(30, 30, 30, 0.9)', 
            border: '1px solid rgba(51, 51, 51, 0.9)',
            borderRadius: '4px',
            color: 'white'
          }}
          labelStyle={{
            color: 'rgba(255, 255, 255, 0.7)'
          }}
        />
        <Line 
          type="monotone" 
          dataKey="price" 
          stroke="#14F195" 
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default PriceChart;
