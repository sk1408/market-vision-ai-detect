
import React, { useState } from 'react';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Bar, Area, AreaChart } from 'recharts';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Maximize2, TrendingUp, BarChart3, Activity, Volume2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ChartDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface StockChartProps {
  data: ChartDataPoint[];
  title: string;
  symbol: string;
}

const StockChart: React.FC<StockChartProps> = ({ data, title, symbol }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>(['volume']);
  const [timeframe, setTimeframe] = useState<string>('1D');
  const [chartType, setChartType] = useState<'line' | 'area' | 'candlestick'>('line');

  // Early return if no data
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            No chart data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data
  const chartData = data
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(item => ({
      ...item,
      date: new Date(item.date).toLocaleDateString(),
      volumeMB: Math.round(item.volume / 1000000), // Convert to millions
    }));

  // Calculate technical indicators
  const calculateRSI = (prices: number[], period = 14) => {
    if (prices.length < period + 1) return [];
    
    const gains: number[] = [];
    const losses: number[] = [];
    
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }

    const rsiData: number[] = [];
    
    for (let i = period; i < gains.length; i++) {
      const avgGain = gains.slice(i - period, i).reduce((sum, val) => sum + val, 0) / period;
      const avgLoss = losses.slice(i - period, i).reduce((sum, val) => sum + val, 0) / period;
      
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      const rsi = 100 - (100 / (1 + rs));
      rsiData.push(rsi);
    }
    
    return rsiData;
  };

  const closePrices = chartData.map(d => d.close);
  const rsiValues = calculateRSI(closePrices);
  const currentRSI = rsiValues[rsiValues.length - 1] || 50;

  const handleIndicatorToggle = (indicator: string) => {
    setSelectedIndicators(prev => 
      prev.includes(indicator) 
        ? prev.filter(i => i !== indicator)
        : [...prev, indicator]
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded p-2 shadow-lg">
          <p className="font-medium">{`Date: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = (height = 400) => {
    if (chartType === 'area') {
      return (
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d2d2d" />
            <XAxis dataKey="date" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="close"
              stroke="#26a69a"
              fill="#26a69a"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d2d2d" />
          <XAxis dataKey="date" stroke="#9ca3af" />
          <YAxis yAxisId="price" stroke="#9ca3af" />
          {selectedIndicators.includes('volume') && (
            <YAxis yAxisId="volume" orientation="right" stroke="#9ca3af" />
          )}
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="close"
            stroke="#26a69a"
            strokeWidth={2}
            dot={false}
            name="Close Price"
          />
          
          {selectedIndicators.includes('volume') && (
            <Bar
              yAxisId="volume"
              dataKey="volumeMB"
              fill="#26a69a"
              fillOpacity={0.3}
              name="Volume (M)"
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-4">
      {/* Main Chart */}
      <Card className="bg-card border border-border">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <p className="text-sm text-muted-foreground">{symbol}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={chartType} onValueChange={(value: 'line' | 'area' | 'candlestick') => setChartType(value)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Line</SelectItem>
                  <SelectItem value="area">Area</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1D">1D</SelectItem>
                  <SelectItem value="1W">1W</SelectItem>
                  <SelectItem value="1M">1M</SelectItem>
                  <SelectItem value="3M">3M</SelectItem>
                  <SelectItem value="1Y">1Y</SelectItem>
                </SelectContent>
              </Select>
              
              <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] max-h-[95vh] p-4">
                  <div className="w-full h-full min-h-[80vh]">
                    {renderChart(600)}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderChart()}
        </CardContent>
      </Card>

      {/* Technical Indicators Panel */}
      <Card className="bg-card border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Technical Indicators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <Button
              variant={selectedIndicators.includes('volume') ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleIndicatorToggle('volume')}
              className="flex items-center gap-2"
            >
              <Volume2 className="h-4 w-4" />
              Volume
            </Button>
            <Button
              variant={selectedIndicators.includes('rsi') ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleIndicatorToggle('rsi')}
              className="flex items-center gap-2"
            >
              <Activity className="h-4 w-4" />
              RSI
            </Button>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="rsi">RSI</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/30 rounded border">
                  <div className="text-sm text-muted-foreground">Current Price</div>
                  <div className="text-lg font-mono">
                    {chartData[chartData.length - 1]?.close.toFixed(2) || 'N/A'}
                  </div>
                </div>
                <div className="p-3 bg-muted/30 rounded border">
                  <div className="text-sm text-muted-foreground">Volume (M)</div>
                  <div className="text-lg font-mono">
                    {chartData[chartData.length - 1]?.volumeMB || 'N/A'}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="rsi" className="space-y-2">
              <div className="h-32 bg-muted/30 rounded border p-2">
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Current RSI:</span>
                    <span className={`font-mono ${
                      currentRSI > 70 ? 'text-red-500' :
                      currentRSI < 30 ? 'text-green-500' :
                      'text-yellow-500'
                    }`}>
                      {currentRSI.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {currentRSI > 70 ? 'Overbought territory' :
                     currentRSI < 30 ? 'Oversold territory' :
                     'Neutral zone'}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockChart;
