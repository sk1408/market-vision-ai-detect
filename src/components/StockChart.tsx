import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  ComposedChart,
  ReferenceLine,
} from "recharts";

interface ChartDataPoint {
  date: string;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
  value?: number;
  // For backward compatibility with the old data format
  time?: string;
}

interface StockChartProps {
  data: ChartDataPoint[];
  title: string;
  symbol: string;
}

const StockChart: React.FC<StockChartProps> = ({ data, title, symbol }) => {
  const [chartType, setChartType] = useState<'line' | 'area' | 'candle' | 'bar'>('area');
  const [timeframe, setTimeframe] = useState<string>('1m');
  const [isMobileView, setIsMobileView] = useState(false);
  const [processedData, setProcessedData] = useState<ChartDataPoint[]>([]);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);

  // Detect mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 640);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto refresh data every 30 seconds if enabled
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (autoRefreshEnabled) {
      intervalId = setInterval(() => {
        // This will trigger a re-render when new data comes in from parent
        console.log('Auto-refreshing chart data...');
      }, 30000); // 30 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoRefreshEnabled]);

  // Process data to ensure consistent format
  useEffect(() => {
    if (!data || data.length === 0) return;

    // Normalize data to ensure it has all required fields
    const normalized = data.map(item => {
      return {
        // Use date field, fall back to time field if date doesn't exist
        date: item.date || item.time || '',
        open: item.open || 0,
        high: item.high || 0,
        low: item.low || 0,
        close: item.close || (item.value || 0),
        volume: item.volume || 0,
        value: item.value || item.close || 0
      };
    });

    // Filter data based on timeframe
    let filtered = [...normalized];
    const today = new Date();
    
    switch (timeframe) {
      case '1w':
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(today.getDate() - 7);
        filtered = filtered.filter(item => new Date(item.date) >= oneWeekAgo);
        break;
      case '1m':
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(today.getMonth() - 1);
        filtered = filtered.filter(item => new Date(item.date) >= oneMonthAgo);
        break;
      case '3m':
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(today.getMonth() - 3);
        filtered = filtered.filter(item => new Date(item.date) >= threeMonthsAgo);
        break;
      case '1y':
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(today.getFullYear() - 1);
        filtered = filtered.filter(item => new Date(item.date) >= oneYearAgo);
        break;
      // For '1d' and 'all', use all available data
      default:
        // For '1d', we might want to limit to most recent day's data if available
        if (timeframe === '1d') {
          // Take most recent day if we have intraday data
          if (normalized.length > 0 && normalized[0].date.includes('T')) {
            const mostRecentDay = normalized[0].date.split('T')[0];
            filtered = normalized.filter(item => item.date.startsWith(mostRecentDay));
          } else {
            // Otherwise just take the most recent few data points
            filtered = normalized.slice(0, 24);
          }
        }
        break;
    }

    // Sort by date (oldest to newest for charts)
    filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    setProcessedData(filtered);
  }, [data, timeframe]);

  // Custom tooltip formatter for better readability
  const customTooltipFormatter = (value: number, name: string) => {
    if (name === 'volume') {
      return [value.toLocaleString(), 'Volume'];
    } else {
      return [value.toFixed(2), name.charAt(0).toUpperCase() + name.slice(1)];
    }
  };

  // Custom date formatter for X-axis
  const formatXAxis = (value: string) => {
    // Format the date based on timeframe
    if (timeframe === '1d') {
      // For intraday, show time if available
      const parts = value.split('T');
      return parts.length > 1 ? parts[1].substring(0, 5) : value.slice(-5);
    } else {
      // For longer timeframes, format as MM-DD
      const date = new Date(value);
      return `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    }
  };

  // Custom tooltip label formatter for better readability
  const tooltipLabelFormatter = (label: string) => {
    try {
      const date = new Date(label);
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }) + (label.includes('T') ? ' ' + label.split('T')[1].substring(0, 5) : '');
    } catch (e) {
      return label;
    }
  };

  const renderChart = () => {
    if (!processedData || processedData.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">No data available for the selected timeframe</p>
        </div>
      );
    }

    // Get min and max values for better Y axis scale
    const prices = processedData.map(d => d.close);
    const minPrice = Math.min(...prices) * 0.99; // 1% lower than minimum
    const maxPrice = Math.max(...prices) * 1.01; // 1% higher than maximum

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={processedData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                tick={{ fontSize: isMobileView ? 10 : 12 }}
                tickFormatter={formatXAxis}
                minTickGap={5}
              />
              <YAxis 
                stroke="#6b7280" 
                tick={{ fontSize: isMobileView ? 10 : 12 }}
                width={isMobileView ? 35 : 40}
                domain={[minPrice, maxPrice]}
                tickCount={5}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.8)', borderColor: '#374151', borderRadius: '0.375rem' }} 
                labelStyle={{ color: '#f3f4f6' }}
                itemStyle={{ color: '#f3f4f6' }}
                formatter={customTooltipFormatter}
                labelFormatter={tooltipLabelFormatter}
              />
              <Legend wrapperStyle={{ fontSize: isMobileView ? 10 : 12 }} />
              <Line 
                type="monotone" 
                dataKey="close" 
                name="Price" 
                stroke="#3b82f6" 
                strokeWidth={2} 
                dot={false} 
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={processedData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                tick={{ fontSize: isMobileView ? 10 : 12 }}
                tickFormatter={formatXAxis}
                minTickGap={5}
              />
              <YAxis 
                stroke="#6b7280" 
                tick={{ fontSize: isMobileView ? 10 : 12 }}
                width={isMobileView ? 35 : 40}
                domain={[minPrice, maxPrice]}
                tickCount={5}
                tickFormatter={(value) => value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.8)', borderColor: '#374151', borderRadius: '0.375rem' }} 
                labelStyle={{ color: '#f3f4f6' }}
                itemStyle={{ color: '#f3f4f6' }}
                formatter={customTooltipFormatter}
                labelFormatter={tooltipLabelFormatter}
                animationDuration={300}
              />
              <Area 
                type="monotone" 
                dataKey="close" 
                name="Price" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorValue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'candle':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={processedData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                tick={{ fontSize: isMobileView ? 10 : 12 }}
                tickFormatter={formatXAxis}
                minTickGap={5}
              />
              <YAxis 
                stroke="#6b7280" 
                tick={{ fontSize: isMobileView ? 10 : 12 }}
                width={isMobileView ? 35 : 40}
                domain={[minPrice, maxPrice]}
                tickCount={5}
              />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.8)', borderColor: '#374151', borderRadius: '0.375rem' }}
                labelStyle={{ color: '#f3f4f6' }}
                itemStyle={{ color: '#f3f4f6' }}
                formatter={customTooltipFormatter}
                labelFormatter={tooltipLabelFormatter}
              />
              <Legend wrapperStyle={{ fontSize: isMobileView ? 10 : 12 }} />

              {/* Enhanced candle chart with better visibility */}
              {processedData.map((entry, index) => {
                const isPositive = entry.close >= entry.open;
                const candleColor = isPositive ? "#22c55e" : "#ef4444";
                
                return (
                  <React.Fragment key={`candle-${index}`}>
                    {/* High-Low line */}
                    <Line
                      dataKey={`high`}
                      data={[entry]}
                      stroke={candleColor}
                      dot={false}
                    />
                    <Line
                      dataKey={`low`}
                      data={[entry]}
                      stroke={candleColor}
                      dot={false}
                    />
                    <ReferenceLine
                      segment={[
                        { x: entry.date, y: entry.low },
                        { x: entry.date, y: entry.high }
                      ]}
                      stroke={candleColor}
                      strokeWidth={1}
                    />
                    {/* Candle body */}
                    <ReferenceLine
                      segment={[
                        { x: entry.date, y: entry.open },
                        { x: entry.date, y: entry.close }
                      ]}
                      stroke={candleColor}
                      strokeWidth={6}
                    />
                  </React.Fragment>
                );
              })}
              
              {/* Open and Close lines - Still useful for legend */}
              <Line
                dataKey="open"
                name="Open"
                stroke="#22c55e"
                dot={false}
                activeDot={false}
                hide={true}
              />
              <Line
                dataKey="close"
                name="Close"
                stroke="#ef4444"
                dot={false}
                activeDot={false}
                hide={true}
              />
            </ComposedChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={processedData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                tick={{ fontSize: isMobileView ? 10 : 12 }}
                tickFormatter={formatXAxis}
                minTickGap={10}
              />
              <YAxis 
                stroke="#6b7280" 
                tick={{ fontSize: isMobileView ? 10 : 12 }}
                width={isMobileView ? 40 : 50}
                tickFormatter={(value) => (value / 1000).toFixed(0) + 'K'}
              />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.8)', borderColor: '#374151', borderRadius: '0.375rem' }}
                labelStyle={{ color: '#f3f4f6' }}
                itemStyle={{ color: '#f3f4f6' }}
                formatter={(value: number) => [value.toLocaleString(), 'Volume']}
                labelFormatter={tooltipLabelFormatter}
              />
              <Legend wrapperStyle={{ fontSize: isMobileView ? 10 : 12 }} />
              <Bar 
                dataKey="volume" 
                fill="#9333ea" 
                name="Volume" 
                radius={[4, 4, 0, 0]}
                animationDuration={500}
              />
            </BarChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  // Calculate the last update time text
  const lastUpdatedText = () => {
    if (!data || data.length === 0) return "";
    
    const now = new Date();
    const lastDate = data[0]?.date ? new Date(data[0].date) : null;
    
    if (!lastDate) return "";
    
    // If today, show time
    if (lastDate.toDateString() === now.toDateString()) {
      return `Last updated: ${lastDate.toLocaleTimeString()}`;
    }
    
    // Otherwise show date and time
    return `Last updated: ${lastDate.toLocaleDateString()} ${lastDate.toLocaleTimeString()}`;
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="p-2 sm:p-4 flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center border-b border-border">
        <div>
          <h3 className="text-base sm:text-lg font-medium">{title}</h3>
          <div className="flex items-center">
            <p className="text-xs sm:text-sm text-muted-foreground mr-2">{symbol}</p>
            <span className="text-xs text-muted-foreground">{lastUpdatedText()}</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-full sm:w-[100px]">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">1D</SelectItem>
              <SelectItem value="1w">1W</SelectItem>
              <SelectItem value="1m">1M</SelectItem>
              <SelectItem value="3m">3M</SelectItem>
              <SelectItem value="1y">1Y</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
          <div className="grid grid-cols-4 sm:flex sm:space-x-1 gap-1">
            <Button 
              variant={chartType === 'line' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setChartType('line')}
              className="text-xs"
            >
              Line
            </Button>
            <Button 
              variant={chartType === 'area' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setChartType('area')}
              className="text-xs"
            >
              Area
            </Button>
            <Button 
              variant={chartType === 'candle' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setChartType('candle')}
              className="text-xs"
            >
              Candle
            </Button>
            <Button 
              variant={chartType === 'bar' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setChartType('bar')}
              className="text-xs"
            >
              Volume
            </Button>
          </div>
        </div>
      </div>
      <div className="p-2 sm:p-4 h-[300px] sm:h-[500px]">
        {renderChart()}
      </div>
      <div className="px-4 py-2 border-t border-border flex items-center justify-end">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
          className={`text-xs ${autoRefreshEnabled ? 'bg-primary/20' : ''}`}
        >
          {autoRefreshEnabled ? 'Auto-refresh On' : 'Auto-refresh Off'}
        </Button>
      </div>
    </div>
  );
};

export default StockChart;
