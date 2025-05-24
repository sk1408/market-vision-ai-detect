
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, RefreshCw, HelpCircle, Info } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, ReferenceLine, Line
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface MarketStat {
  name: string;
  value: string;
  change: number;
  timeFrame: string;
}

interface MarketIndex {
  name: string;
  value: string;
  change: number;
  chartData: Array<{ time: string; value: number; open?: number; high?: number; low?: number; close?: number }>;
}

interface MarketOverviewProps {
  title: string;
  stats: MarketStat[];
  indices: MarketIndex[];
  onRefresh?: () => void;
}

const MarketOverview: React.FC<MarketOverviewProps> = ({ title, stats, indices, onRefresh }) => {
  const [chartType, setChartType] = useState<'area' | 'candle'>('area');
  const [selectedIndex, setSelectedIndex] = useState<MarketIndex | null>(null);
  
  // Format percentage values for better readability
  const formatPercentage = (value: number) => {
    return (value >= 0 ? "+" : "") + value.toFixed(2) + "%";
  };

  // Custom formatter for tooltips with proper type checking
  const customTooltipFormatter = (value: any, name: any) => {
    const numValue = typeof value === 'number' ? value : parseFloat(value);
    return [isNaN(numValue) ? value : numValue.toFixed(2), name || "Value"];
  };
  
  // Format date for better display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (e) {
      return dateString;
    }
  };
  
  // Get the current date and time for display
  const currentDateTime = new Date().toLocaleString();

  // Handle click on chart to open detailed view
  const handleChartClick = (index: MarketIndex) => {
    setSelectedIndex(index);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <h2 className="text-xl sm:text-2xl font-bold">{title}</h2>
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-1 h-6 w-6">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="max-w-xs">Market overview showing key statistics and major indices with real-time data</p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>
        {onRefresh && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            className="flex items-center space-x-1"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            <span>Refresh</span>
          </Button>
        )}
      </div>
      
      <div className="text-xs text-muted-foreground mb-2">
        Last updated: {currentDateTime}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {stats.map((stat, index) => (
          <Card 
            key={index} 
            className={`bg-card border ${stat.change >= 0 ? 'border-positive/20' : 'border-negative/20'} transition-all duration-300 hover:shadow-md`}
          >
            <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-4 py-2 sm:py-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">{stat.name}</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 py-2 sm:py-3">
              <div className="text-base sm:text-2xl font-bold truncate">{stat.value}</div>
              <div className="flex items-center mt-1 flex-wrap sm:flex-nowrap">
                <span className={`flex items-center text-xs sm:text-sm ${stat.change >= 0 ? "text-positive" : "text-negative"}`}>
                  {stat.change >= 0 ? <TrendingUp className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> : <TrendingDown className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />}
                  {formatPercentage(stat.change)}
                </span>
                <span className="text-[10px] sm:text-xs text-muted-foreground ml-1 sm:ml-2">{stat.timeFrame}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm text-muted-foreground">
          Click any chart for detailed view
        </div>
        <div className="flex space-x-2">
          <Button 
            variant={chartType === 'area' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setChartType('area')}
          >
            Area Chart
          </Button>
          <Button 
            variant={chartType === 'candle' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setChartType('candle')}
          >
            Candlestick
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {indices.map((index, idx) => (
          <Card 
            key={idx} 
            className={`bg-card border ${index.change >= 0 ? 'border-positive/20' : 'border-negative/20'} transition-all duration-300 hover:shadow-md cursor-pointer`}
            onClick={() => handleChartClick(index)}
          >
            <CardHeader className="pb-1 sm:pb-2 px-3 sm:px-4 py-2 sm:py-3">
              <div className="flex justify-between items-center flex-wrap sm:flex-nowrap">
                <CardTitle className="text-sm sm:text-lg font-medium">{index.name}</CardTitle>
                <div className="flex items-center mt-1 sm:mt-0">
                  <div className="text-sm sm:text-lg font-medium">{index.value}</div>
                  <span className={`flex items-center ml-2 ${index.change >= 0 ? "text-positive" : "text-negative"}`}>
                    {index.change >= 0 ? <TrendingUp className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> : <TrendingDown className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />}
                    {formatPercentage(index.change)}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-0 sm:px-2 py-2">
              <div className="h-[150px] sm:h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'area' ? (
                    <AreaChart
                      data={index.chartData}
                      margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id={`colorGradient${idx}`} x1="0" y1="0" x2="0" y2="1">
                          <stop 
                            offset="5%" 
                            stopColor={index.change >= 0 ? "#22c55e" : "#ef4444"} 
                            stopOpacity={0.8} 
                          />
                          <stop 
                            offset="95%" 
                            stopColor={index.change >= 0 ? "#22c55e" : "#ef4444"} 
                            stopOpacity={0} 
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                      <XAxis 
                        dataKey="time" 
                        stroke="#6b7280" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                        tick={{ fontSize: 10 }}
                        tickFormatter={formatDate}
                      />
                      <YAxis 
                        stroke="#6b7280" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                        width={30}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.8)', borderColor: '#374151', borderRadius: '0.375rem' }} 
                        labelStyle={{ color: '#f3f4f6' }}
                        itemStyle={{ color: '#f3f4f6' }}
                        formatter={customTooltipFormatter}
                        labelFormatter={formatDate}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke={index.change >= 0 ? "#22c55e" : "#ef4444"}
                        strokeWidth={2}
                        fill={`url(#colorGradient${idx})`} 
                        animationDuration={800}
                      />
                    </AreaChart>
                  ) : (
                    <AreaChart
                      data={index.chartData}
                      margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                      <XAxis 
                        dataKey="time" 
                        stroke="#6b7280" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                        tick={{ fontSize: 10 }}
                        tickFormatter={formatDate}
                      />
                      <YAxis 
                        stroke="#6b7280" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false}
                        width={30}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.8)', borderColor: '#374151', borderRadius: '0.375rem' }} 
                        labelStyle={{ color: '#f3f4f6' }}
                        itemStyle={{ color: '#f3f4f6' }}
                        formatter={(value, name, props) => {
                          const entry = props.payload;
                          if (!entry) return ['', ''];
                          
                          const numValue = typeof value === 'number' ? value : parseFloat(String(value));
                          if (isNaN(numValue)) return [value, name];
                          
                          if (name === 'high') return [`High: ${entry.high?.toFixed(2)}`, ''];
                          if (name === 'low') return [`Low: ${entry.low?.toFixed(2)}`, ''];
                          if (name === 'open') return [`Open: ${entry.open?.toFixed(2)}`, ''];
                          if (name === 'close') return [`Close: ${entry.close?.toFixed(2)}`, ''];
                          
                          return [numValue.toFixed(2), name];
                        }}
                        labelFormatter={formatDate}
                      />
                      
                      {/* Line for better visibility of data points */}
                      <Line 
                        type="monotone" 
                        dataKey="close" 
                        stroke={index.change >= 0 ? "#22c55e" : "#ef4444"}
                        strokeWidth={1.5}
                        dot={false}
                        activeDot={false}
                      />
                      
                      {/* Improved candle chart implementation */}
                      {index.chartData.map((entry, i) => {
                        if (!entry.open || !entry.high || !entry.low || !entry.close) {
                          return null;
                        }
                        
                        const isPositive = entry.close >= entry.open;
                        const color = isPositive ? "#22c55e" : "#ef4444";
                        const strokeWidth = 6; // Make candles more visible
                        
                        return [
                          // High-low line
                          <ReferenceLine
                            key={`hl-${i}`}
                            segment={[
                              { x: entry.time, y: entry.low },
                              { x: entry.time, y: entry.high }
                            ]}
                            stroke={color}
                            strokeWidth={1}
                          />,
                          // Candle body
                          <ReferenceLine
                            key={`body-${i}`}
                            segment={[
                              { x: entry.time, y: entry.open },
                              { x: entry.time, y: entry.close }
                            ]}
                            stroke={color}
                            strokeWidth={strokeWidth}
                          />
                        ];
                      })}
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center mt-2">
                <div className="text-xs text-muted-foreground flex items-center">
                  <Info className="h-3 w-3 mr-1" />
                  Click for detailed analysis
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Chart Dialog */}
      <Dialog open={!!selectedIndex} onOpenChange={(open) => !open && setSelectedIndex(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <span>{selectedIndex?.name}</span>
              <div className="flex space-x-2">
                <Button 
                  variant={chartType === 'area' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setChartType('area')}
                >
                  Area
                </Button>
                <Button 
                  variant={chartType === 'candle' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setChartType('candle')}
                >
                  Candle
                </Button>
              </div>
            </DialogTitle>
            <DialogDescription>
              Current value: {selectedIndex?.value} ({formatPercentage(selectedIndex?.change || 0)})
            </DialogDescription>
          </DialogHeader>
          
          <div className="h-[400px] w-full mt-4">
            {selectedIndex && (
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'area' ? (
                  <AreaChart
                    data={selectedIndex.chartData}
                    margin={{ top: 10, right: 30, left: 5, bottom: 20 }}
                  >
                    <defs>
                      <linearGradient id="detailedColorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop 
                          offset="5%" 
                          stopColor={selectedIndex.change >= 0 ? "#22c55e" : "#ef4444"} 
                          stopOpacity={0.8} 
                        />
                        <stop 
                          offset="95%" 
                          stopColor={selectedIndex.change >= 0 ? "#22c55e" : "#ef4444"} 
                          stopOpacity={0} 
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#6b7280" 
                      tickFormatter={formatDate}
                      height={40}
                    />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.8)', borderColor: '#374151', borderRadius: '0.375rem' }} 
                      labelStyle={{ color: '#f3f4f6' }}
                      itemStyle={{ color: '#f3f4f6' }}
                      formatter={customTooltipFormatter}
                      labelFormatter={formatDate}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke={selectedIndex.change >= 0 ? "#22c55e" : "#ef4444"}
                      strokeWidth={2}
                      fill="url(#detailedColorGradient)" 
                      animationDuration={800}
                    />
                  </AreaChart>
                ) : (
                  <AreaChart
                    data={selectedIndex.chartData}
                    margin={{ top: 10, right: 30, left: 5, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#6b7280"
                      tickFormatter={formatDate}
                      height={40}
                    />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.8)', borderColor: '#374151', borderRadius: '0.375rem' }}
                      labelStyle={{ color: '#f3f4f6' }}
                      itemStyle={{ color: '#f3f4f6' }}
                      formatter={(value, name, props) => {
                        const entry = props.payload;
                        if (!entry) return ['', ''];
                        
                        const numValue = typeof value === 'number' ? value : parseFloat(String(value));
                        if (isNaN(numValue)) return [value, name];
                        
                        if (name === 'high') return [`High: ${entry.high?.toFixed(2)}`, ''];
                        if (name === 'low') return [`Low: ${entry.low?.toFixed(2)}`, ''];
                        if (name === 'open') return [`Open: ${entry.open?.toFixed(2)}`, ''];
                        if (name === 'close') return [`Close: ${entry.close?.toFixed(2)}`, ''];
                        
                        return [numValue.toFixed(2), name];
                      }}
                      labelFormatter={formatDate}
                    />
                    
                    {/* Line for better visibility of data points */}
                    <Line 
                      type="monotone" 
                      dataKey="close" 
                      stroke={selectedIndex.change >= 0 ? "#22c55e" : "#ef4444"}
                      strokeWidth={1.5}
                      dot={false}
                      activeDot={false}
                    />
                    
                    {/* Enhanced candle chart representation */}
                    {selectedIndex.chartData.map((entry, i) => {
                      if (!entry.open || !entry.high || !entry.low || !entry.close) {
                        return null;
                      }
                      
                      const isPositive = entry.close >= entry.open;
                      const color = isPositive ? "#22c55e" : "#ef4444";
                      const strokeWidth = 8; // Make candles more visible in the detailed view
                      
                      return [
                        // High-low line
                        <ReferenceLine
                          key={`detail-hl-${i}`}
                          segment={[
                            { x: entry.time, y: entry.low },
                            { x: entry.time, y: entry.high }
                          ]}
                          stroke={color}
                          strokeWidth={1}
                        />,
                        // Candle body
                        <ReferenceLine
                          key={`detail-body-${i}`}
                          segment={[
                            { x: entry.time, y: entry.open },
                            { x: entry.time, y: entry.close }
                          ]}
                          stroke={color}
                          strokeWidth={strokeWidth}
                        />
                      ];
                    })}
                  </AreaChart>
                )}
              </ResponsiveContainer>
            )}
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm space-y-1">
              <div><span className="font-medium">Open:</span> {selectedIndex?.chartData[0]?.open?.toFixed(2) || 'N/A'}</div>
              <div><span className="font-medium">Close:</span> {selectedIndex?.chartData[selectedIndex?.chartData.length - 1]?.close?.toFixed(2) || 'N/A'}</div>
            </div>
            <div className="text-sm space-y-1">
              <div><span className="font-medium">High:</span> {Math.max(...(selectedIndex?.chartData.map(item => item.high || 0) || [0])).toFixed(2)}</div>
              <div><span className="font-medium">Low:</span> {Math.min(...(selectedIndex?.chartData.filter(item => (item.low || 0) > 0).map(item => item.low || Infinity) || [0])).toFixed(2)}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Chart Type</div>
              <div className="text-lg font-medium capitalize">{chartType}</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarketOverview;
