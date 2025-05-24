import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import SearchBar from '../components/SearchBar';
import MarketOverview from '../components/MarketOverview';
import TradingViewChart from '../components/TradingViewChart';
import PatternDetection from '../components/PatternDetection';
import PatternResult from '../components/PatternResult';
import PredictionModel from '../components/PredictionModel';
import { Button } from '@/components/ui/button';
import { fetchRealTimeQuote, fetchTimeSeriesData, fetchMarketIndices } from '../services/yahooFinanceService';
import { analyzePattern } from '../services/marketData';
import { toast } from "sonner";
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [patternResult, setPatternResult] = useState<any>(null);
  
  // Fetch market overview using React Query with the new Yahoo Finance service
  const { 
    data: marketData,
    isLoading: isLoadingMarket,
    error: marketError
  } = useQuery({
    queryKey: ['marketOverview', 'indian'],
    queryFn: () => fetchMarketIndices('indian'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
  
  // Fetch initial stock data
  useEffect(() => {
    const loadInitialStock = async () => {
      try {
        toast.info("Loading stock data...");
        // Fetch both quote and time series data
        const quoteData = await fetchRealTimeQuote('RELIANCE.NS');
        const timeSeriesData = await fetchTimeSeriesData('RELIANCE.NS');
        
        setSelectedStock({
          symbol: quoteData.symbol,
          name: quoteData.name,
          data: timeSeriesData, // Use this format for the chart
        });
        
        toast.success(`Loaded data for ${quoteData.name}`);
      } catch (error) {
        console.error("Failed to load initial stock data:", error);
        toast.error("Failed to load initial stock data. Using fallback data.");
        
        // Fall back to mock data
        const { getStockData } = await import('../services/marketData');
        try {
          const fallbackData = getStockData('RELIANCE');
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
    
    // Auto-append .NS for Indian stocks if not already present
    const formattedQuery = query.includes('.') ? query : `${query}.NS`;
    
    try {
      toast.info(`Searching for ${formattedQuery}...`);
      
      // Use the Yahoo Finance API to fetch stock data
      const quoteData = await fetchRealTimeQuote(formattedQuery);
      const timeSeriesData = await fetchTimeSeriesData(formattedQuery);
      
      setSelectedStock({
        symbol: quoteData.symbol,
        name: quoteData.name,
        data: timeSeriesData,
      });
      
      toast.success(`Loaded data for ${quoteData.name}`);
    } catch (error) {
      console.error("Search error:", error);
      
      // Try with .BO suffix for BSE stocks
      if (!query.includes('.BO')) {
        try {
          const bseQuery = query.includes('.') ? query : `${query}.BO`;
          const quoteData = await fetchRealTimeQuote(bseQuery);
          const timeSeriesData = await fetchTimeSeriesData(bseQuery);
          
          setSelectedStock({
            symbol: quoteData.symbol,
            name: quoteData.name,
            data: timeSeriesData,
          });
          
          toast.success(`Loaded data for ${quoteData.name}`);
          return;
        } catch (bseError) {
          // Continue to fallback
        }
      }
      
      toast.error("Could not find the requested stock. Try adding exchange suffix (.NS for NSE, .BO for BSE)");
      
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
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Indian Markets</h1>
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
          <TradingViewChart 
            data={selectedStock.data}
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
