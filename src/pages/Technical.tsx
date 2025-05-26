
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import SearchBar from '../components/SearchBar';
import TradingViewChart from '../components/TradingViewChart';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchRealTimeQuote, fetchTimeSeriesData } from '../services/twelveDataService';
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const Technical = () => {
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch initial stock data
  useEffect(() => {
    const loadInitialStock = async () => {
      try {
        setIsLoading(true);
        const quoteData = await fetchRealTimeQuote('RELIANCE');
        const timeSeriesData = await fetchTimeSeriesData('RELIANCE');
        
        setSelectedStock({
          symbol: quoteData.symbol,
          name: quoteData.name,
          data: timeSeriesData,
        });
        
        toast.success(`Loaded data for ${quoteData.name}`);
      } catch (error) {
        console.error("Failed to load initial stock data:", error);
        toast.error("Failed to load initial stock data. Using fallback data.");
        
        // Fall back to mock data if needed
        try {
          const { getStockData } = await import('../services/marketData');
          const fallbackData = getStockData('RELIANCE');
          setSelectedStock(fallbackData);
        } catch (fallbackError) {
          toast.error("Could not load any stock data");
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialStock();
  }, []);
  
  const handleSearch = async (query: string) => {
    if (!query) return;
    
    try {
      setIsLoading(true);
      const quoteData = await fetchRealTimeQuote(query);
      const timeSeriesData = await fetchTimeSeriesData(query);
      
      setSelectedStock({
        symbol: quoteData.symbol,
        name: quoteData.name,
        data: timeSeriesData,
      });
      
      toast.success(`Loaded data for ${quoteData.name}`);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Could not find the requested stock. Try using standard symbols (e.g., AAPL, MSFT)");
      
      // Try to fall back to mock data
      try {
        const { getStockData } = await import('../services/marketData');
        const fallbackData = getStockData(query.toUpperCase());
        setSelectedStock(fallbackData);
        toast.info("Using demo data for this symbol");
      } catch (fallbackError) {
        toast.error("No data available for this symbol");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate technical summary
  const calculateTechnicalSummary = (data: any[]) => {
    if (!data || data.length < 20) return null;
    
    const sortedData = [...data].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    const sma20 = sortedData.slice(-20).reduce((sum, item) => sum + item.close, 0) / 20;
    const sma50 = sortedData.length >= 50 
      ? sortedData.slice(-50).reduce((sum, item) => sum + item.close, 0) / 50
      : null;
    
    // Calculate RSI
    const gains = [];
    const losses = [];
    for (let i = 1; i < Math.min(15, sortedData.length); i++) {
      const change = sortedData[sortedData.length - i].close - sortedData[sortedData.length - i - 1].close;
      if (change >= 0) {
        gains.push(change);
        losses.push(0);
      } else {
        gains.push(0);
        losses.push(Math.abs(change));
      }
    }
    
    const avgGain = gains.reduce((sum, val) => sum + val, 0) / gains.length;
    const avgLoss = losses.reduce((sum, val) => sum + val, 0) / losses.length;
    const rs = avgGain / (avgLoss === 0 ? 0.001 : avgLoss);
    const rsi = 100 - (100 / (1 + rs));
    
    const lastClose = sortedData[sortedData.length - 1].close;
    
    return {
      sma20,
      sma50,
      rsi,
      lastClose,
      trend: lastClose > sma20 ? "bullish" : "bearish"
    };
  };
  
  const technicalData = selectedStock?.data ? calculateTechnicalSummary(selectedStock.data) : null;
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 px-2 sm:px-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Technical Analysis</h1>
          <SearchBar onSearch={handleSearch} />
        </div>
        
        {isLoading ? (
          <Skeleton className="h-[600px] w-full rounded-lg" />
        ) : selectedStock ? (
          <TradingViewChart 
            data={selectedStock.data}
            title={selectedStock.name || selectedStock.symbol}
            symbol={selectedStock.symbol}
          />
        ) : (
          <Skeleton className="h-[600px] w-full rounded-lg" />
        )}
        
        {technicalData && (
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle>Technical Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-3 bg-muted/30 rounded-md">
                  <h4 className="text-sm font-medium mb-1">Last Close</h4>
                  <p className="text-lg font-semibold">{technicalData.lastClose.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-md">
                  <h4 className="text-sm font-medium mb-1">20-Day SMA</h4>
                  <p className="text-lg font-semibold">{technicalData.sma20.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-md">
                  <h4 className="text-sm font-medium mb-1">RSI (14)</h4>
                  <p className={`text-lg font-semibold ${
                    technicalData.rsi > 70 ? 'text-red-500' :
                    technicalData.rsi < 30 ? 'text-green-500' :
                    'text-yellow-500'
                  }`}>
                    {Math.round(technicalData.rsi)}
                  </p>
                </div>
                <div className="p-3 bg-muted/30 rounded-md">
                  <h4 className="text-sm font-medium mb-1">Trend Signal</h4>
                  <p className={`text-lg font-semibold ${technicalData.trend === 'bullish' ? 'text-green-500' : 'text-red-500'}`}>
                    {technicalData.trend.toUpperCase()}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-muted/30 rounded-md">
                <h4 className="font-medium mb-2">Market Analysis</h4>
                <p className="text-sm">
                  {`${selectedStock.name || selectedStock.symbol} is currently showing ${technicalData.trend} momentum. 
                  RSI at ${Math.round(technicalData.rsi)} indicates ${
                    technicalData.rsi > 70 ? "overbought conditions" :
                    technicalData.rsi < 30 ? "oversold conditions" :
                    "neutral momentum"
                  }. Price is ${technicalData.lastClose > technicalData.sma20 ? "above" : "below"} the 20-day moving average, 
                  suggesting ${technicalData.trend === 'bullish' ? "continued upward pressure" : "potential downside risk"}.`}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Technical;
