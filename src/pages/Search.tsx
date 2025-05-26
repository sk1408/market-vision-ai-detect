
import React, { useState } from 'react';
import Layout from '../components/Layout';
import SearchBar from '../components/SearchBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchRealTimeQuote } from '../services/twelveDataService';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartLine, DollarSign, Info } from 'lucide-react';

// Define allowed market types
type MarketType = 'indian' | 'international' | 'crypto';

const Search = () => {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  
  const handleSearch = async (query: string) => {
    if (!query || query.length < 2) {
      toast.error("Please enter at least 2 characters");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulating search results for different markets
      const mockResults = [
        { symbol: `${query.toUpperCase()}`, name: `${query} Corporation`, market: 'indian', lastPrice: '₹1,245.70', change: '+2.3%' },
        { symbol: `${query.toUpperCase()}.NS`, name: `${query} Industries Ltd`, market: 'indian', lastPrice: '₹876.25', change: '-0.7%' },
        { symbol: `${query.toUpperCase()}.IN`, name: `${query} Technologies`, market: 'indian', lastPrice: '₹2,340.55', change: '+1.2%' },
        { symbol: `${query.toUpperCase()}`, name: `${query} Inc.`, market: 'international', lastPrice: '$157.32', change: '+0.8%' },
        { symbol: `${query.toUpperCase()}.L`, name: `${query} Group PLC`, market: 'international', lastPrice: '£45.67', change: '-1.5%' },
        { symbol: `${query}BTC`, name: `${query} Bitcoin`, market: 'crypto', lastPrice: '$41,235.67', change: '+5.2%' },
      ];
      
      setTimeout(() => {
        setSearchResults(mockResults);
        setIsLoading(false);
        toast.success(`Found ${mockResults.length} results for "${query}"`);
      }, 1000);
      
    } catch (error) {
      toast.error("Failed to search. Please try again.");
      setIsLoading(false);
    }
  };
  
  const handleViewStock = async (symbol: string, market: string) => {
    try {
      // Type assertion to ensure market is valid type
      const validMarket = (market as MarketType);
      const stockData = await fetchRealTimeQuote(symbol);
      toast.success(`Loaded data for ${symbol}`);
      
      // Navigate to appropriate page based on market
      let targetPath = '/';
      if (market === 'international') targetPath = '/international';
      else if (market === 'crypto') targetPath = '/crypto';
      
      window.location.href = targetPath;
      
    } catch (error) {
      toast.error("Failed to load stock data");
    }
  };
  
  const filteredResults = activeTab === 'all' 
    ? searchResults 
    : searchResults.filter(result => result.market === activeTab);
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 px-2 sm:px-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Advanced Search</h1>
          <p className="text-muted-foreground mb-4">
            Search for stocks, indices, and cryptocurrencies across multiple markets
          </p>
          <SearchBar onSearch={handleSearch} placeholder="Search by name or symbol..." />
        </div>
        
        <Card className="bg-card border border-border">
          <CardHeader className="pb-2">
            <CardTitle>Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Markets</TabsTrigger>
                <TabsTrigger value="indian">Indian</TabsTrigger>
                <TabsTrigger value="international">International</TabsTrigger>
                <TabsTrigger value="crypto">Cryptocurrency</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab}>
                {isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map(i => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : filteredResults.length > 0 ? (
                  <div className="divide-y divide-border">
                    {filteredResults.map((result, index) => (
                      <div key={index} className="py-3 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            {result.market === 'indian' && <IndianRupee className="h-4 w-4 text-muted-foreground" />}
                            {result.market === 'international' && <DollarSign className="h-4 w-4 text-muted-foreground" />}
                            {result.market === 'crypto' && <Bitcoin className="h-4 w-4 text-muted-foreground" />}
                            <h3 className="font-medium">{result.symbol}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground">{result.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{result.lastPrice}</p>
                          <p className={`text-sm ${
                            result.change.startsWith('+') ? 'text-positive' : 'text-negative'
                          }`}>{result.change}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="ml-4"
                          onClick={() => handleViewStock(result.symbol, result.market)}
                        >
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <Info className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      {searchResults.length > 0 
                        ? "No results found in the selected market category" 
                        : "Search for stocks, indices or cryptocurrencies to see results"}
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            {/* Search explanation */}
            {searchResults.length > 0 && (
              <div className="mt-6 p-3 bg-muted/30 rounded-md">
                <h4 className="text-sm font-medium mb-2">Search Results Explanation</h4>
                <p className="text-xs text-muted-foreground">
                  Search results are shown from multiple markets including Indian stocks (BSE/NSE), 
                  international markets (NYSE, NASDAQ, etc.), and cryptocurrencies. Use the tabs above 
                  to filter results by market category. Click "View" to analyze the selected item with 
                  our advanced tools including technical analysis, fundamental data, and AI predictions.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

// Icon components to avoid imports
const IndianRupee = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 3h12"></path>
    <path d="M6 8h12"></path>
    <path d="m6 13 8.5 8"></path>
    <path d="M6 13h3"></path>
    <path d="M9 13c6.667 0 6.667-10 0-10"></path>
  </svg>
);

const Bitcoin = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M11.767 19.089c4.924.868 6.14-6.025 1.216-6.894m-1.216 6.894L5.86 18.047m5.908 1.042-.347 1.97m1.563-8.864c4.924.869 6.14-6.025 1.215-6.893m-1.215 6.893-3.94-.694m5.16-6.2L12.26 3.11"></path>
    <path d="m7.5 10.5 4.801.845"></path>
    <path d="m7.5 13.5 4.801.845"></path>
  </svg>
);

export default Search;
