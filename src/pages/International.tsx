
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import MarketOverview from '../components/MarketOverview';
import SearchBar from '../components/SearchBar';
import StockChart from '../components/StockChart';
import PatternDetection from '../components/PatternDetection';
import PatternResult from '../components/PatternResult';
import PredictionModel from '../components/PredictionModel';
import { fetchRealTimeQuote, fetchTimeSeriesData, fetchMarketIndices } from '../services/twelveDataService';
import { analyzePattern } from '../services/marketData';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from "@/components/ui/skeleton";

const International = () => {
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [patternResult, setPatternResult] = useState<any>(null);
  
  // Fetch market overview using React Query with the new Twelve Data service
  const { 
    data: marketData,
    isLoading: isLoadingMarket,
    error: marketError
  } = useQuery({
    queryKey: ['marketOverview', 'international'],
    queryFn: () => fetchMarketIndices('international'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
  
  // Fetch initial stock data
  useEffect(() => {
    const loadInitialStock = async () => {
      try {
        toast.info("Loading stock data...");
        // Fetch both quote and time series data
        const quoteData = await fetchRealTimeQuote('AAPL');
        const timeSeriesData = await fetchTimeSeriesData('AAPL');
        
        setSelectedStock({
          symbol: quoteData.symbol,
          name: quoteData.name,
          chartData: timeSeriesData, // Use chartData key for consistency
        });
        
        toast.success(`Loaded data for ${quoteData.name}`);
      } catch (error) {
        console.error("Failed to load initial stock data:", error);
        toast.error("Failed to load initial stock data. Using fallback data.");
        
        // Fall back to mock data
        const { getStockData } = await import('../services/marketData');
        try {
          const fallbackData = getStockData('AAPL');
          setSelectedStock(fallbackData);
        } catch (fallbackError) {
          toast.error("Could not load any stock data");
        }
      }
    };
    
    loadInitialStock();
  }, []);
  
  const handleSearch = async (query: string) => {
    if (!query) return;
    
    try {
      toast.info(`Searching for ${query}...`);
      
      // Use the Twelve Data API to fetch stock data
      const quoteData = await fetchRealTimeQuote(query);
      const timeSeriesData = await fetchTimeSeriesData(query);
      
      setSelectedStock({
        symbol: quoteData.symbol,
        name: quoteData.name,
        chartData: timeSeriesData,
      });
      
      toast.success(`Loaded data for ${quoteData.name}`);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Could not find the requested stock");
      
      // Try to fall back to mock data
      try {
        const { getStockData } = await import('../services/marketData');
        const fallbackData = getStockData(query.toUpperCase());
        setSelectedStock(fallbackData);
        toast.info("Using demo data for this symbol");
      } catch (fallbackError) {
        // If even mock data fails, show a more helpful message
        toast.error("No data available for this symbol");
      }
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
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">International Markets</h1>
          <SearchBar onSearch={handleSearch} placeholder="Search by ticker symbol (e.g., AAPL, MSFT)" />
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
            <p>Failed to load real-time market data. Please try again later.</p>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              Refresh Data
            </Button>
          </div>
        ) : marketData && (
          <MarketOverview 
            title="Market Overview"
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

export default International;
