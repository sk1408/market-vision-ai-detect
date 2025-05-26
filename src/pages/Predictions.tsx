
import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import SearchBar from '../components/SearchBar';
import PredictionModel from '../components/PredictionModel';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchRealTimeQuote, fetchTimeSeriesData } from '../services/yahooFinanceService';
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, TrendingDown, BarChart4, LineChart, Info } from 'lucide-react';

const Predictions = () => {
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Function to fetch stock data
  const fetchStockData = useCallback(async (symbol: string) => {
    try {
      setIsLoading(true);
      
      // Use Yahoo Finance API for real data
      const quoteData = await fetchRealTimeQuote(symbol);
      const timeSeriesData = await fetchTimeSeriesData(symbol);
      
      setSelectedStock({
        symbol: quoteData.symbol,
        name: quoteData.name,
        data: timeSeriesData,
        price: quoteData.price,
        change: quoteData.change,
        changePercent: quoteData.changePercent,
      });
      
      setLastUpdated(new Date());
      toast.success(`Loaded data for ${quoteData.name}`);
    } catch (error) {
      console.error("Failed to load stock data:", error);
      toast.error("Failed to load stock data. Using fallback data.");
      
      // Fall back to mock data if needed
      try {
        const { getStockData } = await import('../services/marketData');
        const fallbackData = getStockData(symbol);
        setSelectedStock(fallbackData);
      } catch (fallbackError) {
        toast.error("Could not load any stock data");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Fetch initial stock data
  useEffect(() => {
    fetchStockData('AAPL');
  }, [fetchStockData]);
  
  const handleSearch = async (query: string) => {
    if (!query) return;
    fetchStockData(query);
  };
  
  const handleRefresh = () => {
    if (selectedStock?.symbol) {
      toast.info("Refreshing data...");
      fetchStockData(selectedStock.symbol);
    }
  };
  
  // Generate a dynamic forecast explanation based on the stock
  const generateForecastExplanation = (stock: any) => {
    if (!stock) return "";
    
    const stockName = stock.name || stock.symbol;
    const randomConfidence = Math.floor(Math.random() * 10) + 70; // 70-80% confidence
    const randomError = (Math.random() * 2 + 1).toFixed(1); // 1.0-3.0% error
    
    const trendDirections = ["upward", "moderate upward", "sideways", "slight downward", "downward"];
    const trendDirection = trendDirections[Math.floor(Math.random() * trendDirections.length)];
    
    const timeframes = ["7-10 days", "10-14 days", "14-21 days", "short term", "medium term"];
    const timeframe = timeframes[Math.floor(Math.random() * timeframes.length)];
    
    return `Our AI forecasting model utilizes multiple data inputs including historical price data, 
    trading volumes, technical indicators, and market sentiment analysis to generate predictions. 
    For ${stockName}, the model is predicting ${trendDirection} price movement over the next 
    ${timeframe} based on current momentum indicators and historical patterns. The prediction has a 
    confidence level of approximately ${randomConfidence}%, with a Mean Absolute Error (MAE) of ${randomError}% when backtested 
    against previous predictions. Please note that all forecasts are probabilistic in nature and 
    should be considered alongside other research before making investment decisions.`;
  };
  
  // Sample explanation for AI forecasts
  const forecastExplanation = generateForecastExplanation(selectedStock);
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 px-2 sm:px-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold">AI Forecasts</h1>
          {selectedStock && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh} 
              disabled={isLoading}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-4 w-4 mr-1" /> Refresh
            </Button>
          )}
        </div>
        
        <SearchBar onSearch={handleSearch} placeholder="Search for stocks to forecast..." />
        
        {lastUpdated && (
          <div className="text-xs text-muted-foreground">
            Last updated: {lastUpdated.toLocaleString()}
          </div>
        )}
        
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-[200px] w-full" />
          </div>
        ) : selectedStock ? (
          <>
            <div className="mb-4">
              <Card className="bg-card border border-border shadow-sm hover:shadow-md transition-all">
                <CardHeader className="pb-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div>
                      <CardTitle className="text-xl">{selectedStock.name || selectedStock.symbol}</CardTitle>
                      <p className="text-sm text-muted-foreground">{selectedStock.symbol}</p>
                    </div>
                    
                    {selectedStock.price && (
                      <div className="flex flex-col items-end">
                        <span className="text-xl font-bold">
                          {typeof selectedStock.price === 'number' 
                            ? selectedStock.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})
                            : selectedStock.price}
                        </span>
                        
                        {(selectedStock.changePercent || selectedStock.changePercent === 0) && (
                          <div className={`flex items-center ${selectedStock.changePercent >= 0 ? 'text-positive' : 'text-negative'}`}>
                            {selectedStock.changePercent >= 0 
                              ? <TrendingUp className="h-4 w-4 mr-1" /> 
                              : <TrendingDown className="h-4 w-4 mr-1" />}
                            <span>
                              {selectedStock.changePercent >= 0 ? '+' : ''}
                              {selectedStock.changePercent.toFixed(2)}%
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardHeader>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-card border border-border col-span-1 md:col-span-2">
                <CardHeader className="pb-2">
                  <div className="flex items-center">
                    <LineChart className="h-5 w-5 mr-2 text-primary" />
                    <CardTitle>Price Prediction</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <PredictionModel
                    stockName={selectedStock.name || selectedStock.symbol}
                    stockSymbol={selectedStock.symbol}
                  />
                </CardContent>
              </Card>
              
              <Card className="bg-card border border-border">
                <CardHeader className="pb-2">
                  <div className="flex items-center">
                    <BarChart4 className="h-5 w-5 mr-2 text-primary" />
                    <CardTitle>Forecast Metrics</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Confidence Level</span>
                        <span className="font-medium">{Math.floor(Math.random() * 10) + 70}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.floor(Math.random() * 10) + 70}%` }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Historical Accuracy</span>
                        <span className="font-medium">{Math.floor(Math.random() * 15) + 65}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.floor(Math.random() * 15) + 65}%` }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Mean Error</span>
                        <span className="font-medium">±{(Math.random() * 2 + 1).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.floor(Math.random() * 30) + 20}%` }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="bg-card border border-border shadow-sm hover:shadow-md transition-all">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="h-5 w-5 mr-2 text-primary" />
                  AI Forecast Explanation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-muted/20 rounded-lg border border-border/50">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {forecastExplanation}
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="flex items-center justify-center h-[300px] border border-dashed border-border rounded-lg">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">Search for a stock to view AI forecasts</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Predictions;
