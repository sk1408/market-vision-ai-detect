
import React, { useState } from 'react';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Bar, Area, AreaChart, LineChart } from 'recharts';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Maximize2, Settings, TrendingUp, BarChart3, Activity, Volume2 } from 'lucide-react';
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

interface TradingViewChartProps {
  data: ChartDataPoint[];
  title: string;
  symbol: string;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({ data, title, symbol }) => {
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
  const calculateIndicators = (chartData: ChartDataPoint[]) => {
    if (!chartData || chartData.length === 0) return null;

    const sortedData = [...chartData].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // RSI Calculation
    const calculateRSI = (prices: number[], period = 14) => {
      const gains: number[] = [];
      const losses: number[] = [];
      
      for (let i = 1; i < prices.length; i++) {
        const change = prices[i] - prices[i - 1];
        gains.push(change > 0 ? change : 0);
        losses.push(change < 0 ? Math.abs(change) : 0);
      }

      const rsiData: Array<{ time: string; value: number }> = [];
      
      for (let i = period; i < gains.length; i++) {
        const avgGain = gains.slice(i - period, i).reduce((sum, val) => sum + val, 0) / period;
        const avgLoss = losses.slice(i - period, i).reduce((sum, val) => sum + val, 0) / period;
        
        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));
        
        rsiData.push({
          time: sortedData[i + 1].date,
          value: rsi
        });
      }
      
      return rsiData;
    };

    // MACD Calculation
    const calculateMACD = (prices: number[]) => {
      const ema12: number[] = [];
      const ema26: number[] = [];
      
      // Calculate EMAs
      let ema12Prev = prices[0];
      let ema26Prev = prices[0];
      
      ema12.push(ema12Prev);
      ema26.push(ema26Prev);
      
      for (let i = 1; i < prices.length; i++) {
        ema12Prev = (prices[i] * (2 / 13)) + (ema12Prev * (11 / 13));
        ema26Prev = (prices[i] * (2 / 27)) + (ema26Prev * (25 / 27));
        ema12.push(ema12Prev);
        ema26.push(ema26Prev);
      }
      
      const macdLine = ema12.map((val, i) => val - ema26[i]);
      
      // Signal line (9-period EMA of MACD)
      const signalLine: number[] = [];
      let signalPrev = macdLine[0];
      signalLine.push(signalPrev);
      
      for (let i = 1; i < macdLine.length; i++) {
        signalPrev = (macdLine[i] * (2 / 10)) + (signalPrev * (8 / 10));
        signalLine.push(signalPrev);
      }
      
      const histogram = macdLine.map((val, i) => val - signalLine[i]);
      
      return {
        macd: macdLine.map((val, i) => ({ time: sortedData[i].date, value: val })),
        signal: signalLine.map((val, i) => ({ time: sortedData[i].date, value: val })),
        histogram: histogram.map((val, i) => ({ 
          time: sortedData[i].date, 
          value: val,
          color: val >= 0 ? '#26a69a' : '#ef5350'
        }))
      };
    };

    // Bollinger Bands Calculation
    const calculateBollingerBands = (prices: number[], period = 20) => {
      const bands: Array<{
        time: string;
        upper: number;
        middle: number;
        lower: number;
      }> = [];
      
      for (let i = period - 1; i < prices.length; i++) {
        const slice = prices.slice(i - period + 1, i + 1);
        const mean = slice.reduce((sum, val) => sum + val, 0) / period;
        const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
        const stdDev = Math.sqrt(variance);
        
        bands.push({
          time: sortedData[i].date,
          upper: mean + (stdDev * 2),
          middle: mean,
          lower: mean - (stdDev * 2)
        });
      }
      
      return bands;
    };

    const closePrices = sortedData.map(d => d.close);
    
    return {
      rsi: calculateRSI(closePrices),
      macd: calculateMACD(closePrices),
      bollingerBands: calculateBollingerBands(closePrices)
    };
  };

  const indicators = calculateIndicators(data);

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
          
          {selectedIndicators.includes('bollinger') && indicators?.bollingerBands && (
            <>
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="bollingerUpper"
                stroke="#2196F3"
                strokeWidth={1}
                dot={false}
                name="Upper Band"
              />
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="bollingerMiddle"
                stroke="#FF9800"
                strokeWidth={1}
                dot={false}
                name="Middle Band"
              />
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="bollingerLower"
                stroke="#2196F3"
                strokeWidth={1}
                dot={false}
                name="Lower Band"
              />
            </>
          )}
          
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
            <Settings className="h-5 w-5" />
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
              variant={selectedIndicators.includes('bollinger') ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleIndicatorToggle('bollinger')}
              className="flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Bollinger
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
            <Button
              variant={selectedIndicators.includes('macd') ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleIndicatorToggle('macd')}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              MACD
            </Button>
          </div>

          <Tabs defaultValue="rsi" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="rsi">RSI</TabsTrigger>
              <TabsTrigger value="macd">MACD</TabsTrigger>
              <TabsTrigger value="bollinger">Bollinger</TabsTrigger>
            </TabsList>
            
            <TabsContent value="rsi" className="space-y-2">
              <div className="h-32 bg-muted/30 rounded border p-2">
                {indicators?.rsi && indicators.rsi.length > 0 ? (
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Current RSI:</span>
                      <span className={`font-mono ${
                        indicators.rsi[indicators.rsi.length - 1]?.value > 70 ? 'text-red-500' :
                        indicators.rsi[indicators.rsi.length - 1]?.value < 30 ? 'text-green-500' :
                        'text-yellow-500'
                      }`}>
                        {indicators.rsi[indicators.rsi.length - 1]?.value.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {indicators.rsi[indicators.rsi.length - 1]?.value > 70 ? 'Overbought territory' :
                       indicators.rsi[indicators.rsi.length - 1]?.value < 30 ? 'Oversold territory' :
                       'Neutral zone'}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    RSI data calculating...
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="macd" className="space-y-2">
              <div className="h-32 bg-muted/30 rounded border p-2">
                {indicators?.macd ? (
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>MACD:</span>
                      <span className="font-mono">
                        {indicators.macd.macd[indicators.macd.macd.length - 1]?.value.toFixed(4) || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Signal:</span>
                      <span className="font-mono">
                        {indicators.macd.signal[indicators.macd.signal.length - 1]?.value.toFixed(4) || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Histogram:</span>
                      <span className={`font-mono ${
                        (indicators.macd.histogram[indicators.macd.histogram.length - 1]?.value || 0) >= 0 
                          ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {indicators.macd.histogram[indicators.macd.histogram.length - 1]?.value.toFixed(4) || 'N/A'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    MACD data calculating...
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="bollinger" className="space-y-2">
              <div className="h-32 bg-muted/30 rounded border p-2">
                {indicators?.bollingerBands && indicators.bollingerBands.length > 0 ? (
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Upper Band:</span>
                      <span className="font-mono">
                        {indicators.bollingerBands[indicators.bollingerBands.length - 1]?.upper.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Middle Band:</span>
                      <span className="font-mono">
                        {indicators.bollingerBands[indicators.bollingerBands.length - 1]?.middle.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lower Band:</span>
                      <span className="font-mono">
                        {indicators.bollingerBands[indicators.bollingerBands.length - 1]?.lower.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Bollinger Bands calculating...
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradingViewChart;
