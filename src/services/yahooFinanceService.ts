
export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  previousClose: number;
  open: number;
  dayHigh: number;
  dayLow: number;
  lastUpdated: Date;
}

export interface TimeSeriesData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketStat {
  name: string;
  value: string;
  change: number;
  timeFrame: string;
}

export interface MarketIndex {
  name: string;
  value: string;
  change: number;
  chartData: Array<{ time: string; value: number }>;
}

// Use a CORS proxy for demonstration (in production, you'd use your own backend)
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
const YAHOO_CHART_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';

// Helper function to make API requests with CORS handling
const makeYahooRequest = async (url: string) => {
  try {
    console.log(`Making request to: ${url}`);
    
    // Try direct request first
    let response;
    try {
      response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
    } catch (corsError) {
      console.log('Direct request failed, trying CORS proxy...');
      // If direct request fails due to CORS, try with proxy
      const proxyUrl = `${CORS_PROXY}${encodeURIComponent(url)}`;
      response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
    }
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Yahoo Finance API request failed:', error);
    throw error;
  }
};

// Function to fetch real-time stock quote
export const fetchRealTimeQuote = async (symbol: string): Promise<StockQuote> => {
  try {
    console.log(`Fetching quote for ${symbol} from Yahoo Finance`);
    
    const url = `${YAHOO_CHART_BASE}/${symbol}?interval=1d&range=1d`;
    const data = await makeYahooRequest(url);
    
    if (!data?.chart?.result?.[0]) {
      throw new Error(`No data available for symbol: ${symbol}`);
    }
    
    const result = data.chart.result[0];
    const meta = result.meta;
    const quotes = result.indicators?.quote?.[0];
    
    if (!meta || !quotes) {
      throw new Error(`Invalid data structure for symbol: ${symbol}`);
    }
    
    const currentPrice = meta.regularMarketPrice || 0;
    const previousClose = meta.previousClose || 0;
    const change = currentPrice - previousClose;
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;
    
    return {
      symbol: meta.symbol || symbol,
      name: meta.longName || meta.shortName || symbol,
      price: currentPrice,
      change: change,
      changePercent: changePercent,
      volume: meta.regularMarketVolume || 0,
      previousClose: previousClose,
      open: meta.regularMarketOpen || currentPrice,
      dayHigh: meta.regularMarketDayHigh || currentPrice,
      dayLow: meta.regularMarketDayLow || currentPrice,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error("Error fetching quote from Yahoo Finance:", error);
    
    // Immediately fall back to mock data instead of retrying
    console.log("Falling back to mock data immediately...");
    const { getStockData } = await import('./marketData');
    try {
      const mockData = getStockData(symbol.replace('.NS', '').replace('.BO', ''));
      
      // Convert mock data to StockQuote format - fix the data property access
      if (mockData && mockData.chartData && Array.isArray(mockData.chartData) && mockData.chartData.length > 0) {
        const latestData = mockData.chartData[0];
        return {
          symbol: symbol,
          name: mockData.name || symbol,
          price: latestData.close,
          change: latestData.close - latestData.open,
          changePercent: ((latestData.close - latestData.open) / latestData.open) * 100,
          volume: latestData.volume,
          previousClose: latestData.open,
          open: latestData.open,
          dayHigh: latestData.high,
          dayLow: latestData.low,
          lastUpdated: new Date(),
        };
      }
    } catch (mockError) {
      console.error("Mock data fallback failed:", mockError);
    }
    
    throw new Error(`Failed to fetch data for ${symbol}: ${error}`);
  }
};

// Function to fetch historical time series data
export const fetchTimeSeriesData = async (
  symbol: string, 
  period: '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' | '10y' | 'ytd' | 'max' = '3mo'
): Promise<TimeSeriesData[]> => {
  try {
    console.log(`Fetching historical data for ${symbol} from Yahoo Finance`);
    
    const url = `${YAHOO_CHART_BASE}/${symbol}?interval=1d&range=${period}`;
    const data = await makeYahooRequest(url);
    
    if (!data?.chart?.result?.[0]) {
      throw new Error(`No historical data available for ${symbol}`);
    }
    
    const result = data.chart.result[0];
    const timestamps = result.timestamp;
    const quotes = result.indicators?.quote?.[0];
    
    if (!timestamps || !quotes) {
      throw new Error(`Invalid historical data structure for ${symbol}`);
    }
    
    // Convert Yahoo Finance format to our format
    const timeSeriesData: TimeSeriesData[] = timestamps.map((timestamp: number, index: number) => ({
      date: new Date(timestamp * 1000).toISOString().split('T')[0],
      open: quotes.open?.[index] || 0,
      high: quotes.high?.[index] || 0,
      low: quotes.low?.[index] || 0,
      close: quotes.close?.[index] || 0,
      volume: quotes.volume?.[index] || 0,
    })).filter((item: TimeSeriesData) => item.close > 0); // Filter out invalid entries
    
    // Sort by date (most recent first)
    return timeSeriesData.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch (error) {
    console.error("Error fetching historical data from Yahoo Finance:", error);
    
    // Immediately fall back to mock data
    console.log("Falling back to mock time series data...");
    const { getStockData } = await import('./marketData');
    try {
      const mockData = getStockData(symbol.replace('.NS', '').replace('.BO', ''));
      // Fix the data property access - mockData already has the chartData array
      if (mockData && Array.isArray(mockData.chartData)) {
        return mockData.chartData;
      }
    } catch (mockError) {
      console.error("Mock time series data fallback failed:", mockError);
    }
    
    throw new Error(`Failed to fetch historical data for ${symbol}: ${error}`);
  }
};

// Function to get major market indices data
export const fetchMarketIndices = async (market: 'indian' | 'international' | 'crypto'): Promise<{
  stats: MarketStat[];
  indices: MarketIndex[];
}> => {
  try {
    let symbols: string[] = [];
    
    // Select indices based on market type
    switch (market) {
      case 'indian':
        symbols = ['^NSEI', '^BSESN', 'RELIANCE.NS', 'TCS.NS']; // Nifty 50, Sensex, plus major stocks
        break;
      case 'international':
        symbols = ['^GSPC', '^DJI', '^IXIC', '^FTSE']; // S&P 500, Dow Jones, NASDAQ, FTSE 100
        break;
      case 'crypto':
        symbols = ['BTC-USD', 'ETH-USD', 'BNB-USD', 'ADA-USD']; // Bitcoin, Ethereum, Binance Coin, Cardano
        break;
    }
    
    // Fetch data for each index with concurrent requests
    const promises = symbols.map(async (symbol) => {
      try {
        const quoteData = await fetchRealTimeQuote(symbol);
        const timeSeriesData = await fetchTimeSeriesData(symbol, '1mo');
        
        const chartData = timeSeriesData.slice(0, 30).map(data => ({
          time: data.date,
          value: data.close
        })).reverse();
        
        // Format the value string based on market type
        let valueStr = '';
        if (market === 'crypto') {
          valueStr = `$${quoteData.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
        } else if (market === 'indian') {
          valueStr = `₹${quoteData.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
        } else {
          valueStr = `${quoteData.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
        }
        
        return {
          quote: quoteData,
          chartData,
          valueStr
        };
      } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error);
        return null;
      }
    });
    
    const results = await Promise.all(promises);
    const validResults = results.filter(Boolean);
    
    // Format data for MarketOverview component
    const stats: MarketStat[] = validResults.map(result => ({
      name: result?.quote.name || 'Unknown',
      value: result?.valueStr || '0',
      change: result?.quote.changePercent || 0,
      timeFrame: 'Today'
    }));
    
    const indices: MarketIndex[] = validResults.map(result => ({
      name: result?.quote.name || 'Unknown',
      value: result?.valueStr || '0',
      change: result?.quote.changePercent || 0,
      chartData: result?.chartData || []
    }));
    
    // If we couldn't get any valid data, throw an error
    if (validResults.length === 0) {
      throw new Error('Could not fetch market indices');
    }
    
    return { stats, indices };
  } catch (error) {
    console.error("Error fetching market indices:", error);
    
    // Fall back to mock data
    const { 
      getIndianMarketData, 
      getInternationalMarketData, 
      getCryptoMarketData 
    } = await import('./marketData');
    
    let marketData;
    
    switch (market) {
      case 'indian':
        marketData = getIndianMarketData();
        break;
      case 'international':
        marketData = getInternationalMarketData();
        break;
      case 'crypto':
        marketData = getCryptoMarketData();
        break;
      default:
        marketData = getIndianMarketData();
    }
    
    return {
      stats: marketData.stats,
      indices: marketData.indices
    };
  }
};

// Function to search for stocks/cryptos
export const searchSecurities = async (
  query: string,
  market: 'indian' | 'international' | 'crypto'
): Promise<any[]> => {
  try {
    console.log(`Searching for ${query} via Yahoo Finance`);
    
    // For simplicity, we'll return some common symbols based on the query
    // In a production app, you'd use a proper search API
    const commonSymbols: { [key: string]: any[] } = {
      indian: [
        { symbol: 'RELIANCE.NS', name: 'Reliance Industries Limited', type: 'Equity', exchange: 'NSE' },
        { symbol: 'TCS.NS', name: 'Tata Consultancy Services Limited', type: 'Equity', exchange: 'NSE' },
        { symbol: 'HDFCBANK.NS', name: 'HDFC Bank Limited', type: 'Equity', exchange: 'NSE' },
        { symbol: 'INFY.NS', name: 'Infosys Limited', type: 'Equity', exchange: 'NSE' },
        { symbol: 'ICICIBANK.NS', name: 'ICICI Bank Limited', type: 'Equity', exchange: 'NSE' },
      ],
      international: [
        { symbol: 'AAPL', name: 'Apple Inc.', type: 'Equity', exchange: 'NASDAQ' },
        { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'Equity', exchange: 'NASDAQ' },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'Equity', exchange: 'NASDAQ' },
        { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'Equity', exchange: 'NASDAQ' },
        { symbol: 'TSLA', name: 'Tesla Inc.', type: 'Equity', exchange: 'NASDAQ' },
      ],
      crypto: [
        { symbol: 'BTC-USD', name: 'Bitcoin USD', type: 'Cryptocurrency', exchange: 'CCC' },
        { symbol: 'ETH-USD', name: 'Ethereum USD', type: 'Cryptocurrency', exchange: 'CCC' },
        { symbol: 'BNB-USD', name: 'Binance Coin USD', type: 'Cryptocurrency', exchange: 'CCC' },
        { symbol: 'ADA-USD', name: 'Cardano USD', type: 'Cryptocurrency', exchange: 'CCC' },
        { symbol: 'SOL-USD', name: 'Solana USD', type: 'Cryptocurrency', exchange: 'CCC' },
      ]
    };
    
    const symbols = commonSymbols[market] || [];
    
    // Filter symbols based on the query
    return symbols.filter(symbol => 
      symbol.name.toLowerCase().includes(query.toLowerCase()) ||
      symbol.symbol.toLowerCase().includes(query.toLowerCase())
    );
  } catch (error) {
    console.error("Error searching securities:", error);
    return [];
  }
};
