import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import SearchBar from '../components/SearchBar';
import MarketOverview from '../components/MarketOverview';
import StockChart from '../components/StockChart';
import PatternDetection from '../components/PatternDetection';
import PatternResult from '../components/PatternResult';
import PredictionModel from '../components/PredictionModel';
import { Button } from '@/components/ui/button';
import { fetchRealTimeQuote, fetchTimeSeriesData, fetchMarketIndices } from '../services/twelveDataService';
import { analyzePattern } from '../services/marketData';
import { toast } from "sonner";
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from 'lucide-react';

const Index = () => {
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [patternResult, setPatternResult] = useState<any>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  // Fetch market overview with shorter stale time for fresher data
  const { 
    data: marketData,
    isLoading: isLoadingMarket,
    error: marketError,
    refetch: refetchMarket
  } = useQuery({
    queryKey: ['marketOverview', 'indian', lastRefresh.getTime()],
    queryFn: () => fetchMarketIndices('indian'),
    staleTime: 2 * 60 * 1000, // 2 minutes for fresher data
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
    retry: 2,
  });
  
  // Auto-refresh functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date());
      console.log('Auto-refreshing market data...');
    }, 5 * 60 * 1000); // Refresh every 5 minutes
    
    return () => clearInterval(interval);
  }, []);
  
  // Fetch initial stock data
  useEffect(() => {
    const loadInitialStock = async () => {
      try {
        toast.info("Loading fresh stock data...");
        // Fetch both quote and time series data
        const quoteData = await fetchRealTimeQuote('RELIANCE');
        const timeSeriesData = await fetchTimeSeriesData('RELIANCE');
        
        setSelectedStock({
          symbol: quoteData.symbol,
          name: quoteData.name,
          chartData: timeSeriesData,
          lastUpdated: quoteData.lastUpdated,
        });
        
        toast.success(`Loaded fresh data for ${quoteData.name} - ₹${quoteData.price.toFixed(2)}`);
      } catch (error) {
        console.error("Failed to load initial stock data:", error);
        toast.error("Unable to fetch live data. Please check your connection and try refreshing.");
      }
    };
    
    loadInitialStock();
  }, []);
  
  const handleSearch = async (query: string) => {
    if (!query) return;
    
    // Auto-append .NS for Indian stocks if not already present
    const formattedQuery = query.includes('.') ? query : `${query}`;
    
    try {
      toast.info(`Fetching fresh data for ${formattedQuery}...`);
      
      // Use the Twelve Data API to fetch stock data
      const quoteData = await fetchRealTimeQuote(formattedQuery);
      const timeSeriesData = await fetchTimeSeriesData(formattedQuery);
      
      setSelectedStock({
        symbol: quoteData.symbol,
        name: quoteData.name,
        chartData: timeSeriesData,
        lastUpdated: quoteData.lastUpdated,
      });
      
      toast.success(`Fresh data loaded for ${quoteData.name} - ₹${quoteData.price.toFixed(2)}`);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Could not fetch live data for this stock. Please try a different symbol or check your connection.");
    }
  };
  
  const handleRefreshData = async () => {
    if (!selectedStock?.symbol) return;
    
    try {
      toast.info("Refreshing data...");
      const quoteData = await fetchRealTimeQuote(selectedStock.symbol);
      const timeSeriesData = await fetchTimeSeriesData(selectedStock.symbol);
      
      setSelectedStock({
        symbol: quoteData.symbol,
        name: quoteData.name,
        chartData: timeSeriesData,
        lastUpdated: quoteData.lastUpdated,
      });
      
      // Also refresh market data
      refetchMarket();
      setLastRefresh(new Date());
      
      toast.success(`Data refreshed - ₹${quoteData.price.toFixed(2)}`);
    } catch (error) {
      toast.error("Failed to refresh data");
    }
  };
  
  const handleAnalyzePattern = async (file: File | null, chartId?: string) => {
    setIsAnalyzing(true);
    try {
      // For now, still use the mock pattern detection
      // In a real app, this would call a ML service or process the chart data
      const result = await analyzePattern(file);
      setPatternResult(result);
      toast.success(`Pattern detected: ${result.patternName}`);
    } catch (error) {
      toast.error("Failed to analyze pattern");
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 px-2 sm:px-4">
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold">Indian Markets</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshData}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              {selectedStock?.lastUpdated && (
                <span className="text-sm text-muted-foreground">
                  Updated: {selectedStock.lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
          <SearchBar onSearch={handleSearch} placeholder="Search stocks (e.g., RELIANCE, TCS)" />
        </div>
        
        {isLoadingMarket ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        ) : marketError ? (
          <div className="p-4 border border-red-500 bg-red-500/10 rounded-md">
            <p>Unable to load live market data. Please check your internet connection.</p>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => refetchMarket()}
            >
              Try Again
            </Button>
          </div>
        ) : marketData && (
          <MarketOverview 
            title="Live Market Overview"
            stats={marketData.stats}
            indices={marketData.indices}
          />
        )}
        
        {selectedStock ? (
          <StockChart 
            data={selectedStock.chartData}
            title={selectedStock.name || selectedStock.symbol}
            symbol={selectedStock.symbol}
          />
        ) : (
          <Skeleton className="h-[600px] w-full rounded-lg" />
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PatternDetection 
            onAnalyze={handleAnalyzePattern}
            isLoading={isAnalyzing}
          />
          
          {patternResult ? (
            <PatternResult
              patternName={patternResult.patternName}
              isLegal={patternResult.isLegal}
              confidence={patternResult.confidence}
              description={patternResult.description}
              recommendation={patternResult.recommendation}
            />
          ) : (
            <div className="flex items-center justify-center h-full border border-dashed border-border rounded-lg p-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">No pattern analysis yet</p>
                <Button 
                  variant="outline" 
                  onClick={() => handleAnalyzePattern(null, 'current')}
                >
                  Analyze Current Chart
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <PredictionModel
          stockName={selectedStock?.name || selectedStock?.symbol}
          stockSymbol={selectedStock?.symbol}
        />
      </div>
    </Layout>
  );
};

export default Index;
