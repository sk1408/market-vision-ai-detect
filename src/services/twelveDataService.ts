
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

// Updated Twelve Data API configuration with new API key
const TWELVE_DATA_API_KEY = '836a06a3643e42dc85492d92be4e5660';
const TWELVE_DATA_BASE_URL = 'https://api.twelvedata.com';

// Helper function to make API requests with improved error handling
const makeTwelveDataRequest = async (endpoint: string, params: Record<string, string> = {}) => {
  try {
    // Add timestamp to prevent caching
    const queryParams = new URLSearchParams({
      apikey: TWELVE_DATA_API_KEY,
      format: 'JSON',
      dp: '2', // decimal places
      ...params,
      _t: Date.now().toString() // cache buster
    });
    
    const url = `${TWELVE_DATA_BASE_URL}/${endpoint}?${queryParams}`;
    console.log(`Fetching fresh data from: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      cache: 'no-store' // Force fresh data
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'error' || data.code) {
      throw new Error(data.message || data.code || 'API returned error');
    }
    
    console.log('Fresh data received:', data);
    return data;
  } catch (error) {
    console.error('Twelve Data API request failed:', error);
    throw error;
  }
};

// Enhanced function to fetch real-time stock quote with fresh data
export const fetchRealTimeQuote = async (symbol: string): Promise<StockQuote> => {
  try {
    console.log(`Fetching fresh quote for ${symbol}`);
    
    // Clean symbol for API
    const cleanSymbol = symbol.replace('.NS', '').replace('.BO', '').toUpperCase();
    
    // Try real-time quote endpoint first
    let data;
    try {
      data = await makeTwelveDataRequest('quote', {
        symbol: cleanSymbol,
        country: 'US' // Default to US market for better data availability
      });
    } catch (error) {
      // If quote fails, try price endpoint
      console.log('Quote endpoint failed, trying price endpoint...');
      data = await makeTwelveDataRequest('price', {
        symbol: cleanSymbol
      });
      
      // If price endpoint returns just a price, fetch additional data
      if (typeof data.price === 'string' || typeof data.price === 'number') {
        const priceValue = parseFloat(data.price);
        return {
          symbol: cleanSymbol,
          name: cleanSymbol,
          price: priceValue,
          change: 0,
          changePercent: 0,
          volume: 0,
          previousClose: priceValue,
          open: priceValue,
          dayHigh: priceValue,
          dayLow: priceValue,
          lastUpdated: new Date(),
        };
      }
    }
    
    if (!data || typeof data !== 'object') {
      throw new Error(`Invalid data received for ${symbol}`);
    }
    
    // Parse the response data
    const currentPrice = parseFloat(data.close || data.price || 0);
    const previousClose = parseFloat(data.previous_close || data.prev_close || currentPrice);
    const change = currentPrice - previousClose;
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;
    
    const quote: StockQuote = {
      symbol: data.symbol || cleanSymbol,
      name: data.name || cleanSymbol,
      price: currentPrice,
      change: change,
      changePercent: changePercent,
      volume: parseInt(data.volume || '0') || 0,
      previousClose: previousClose,
      open: parseFloat(data.open || currentPrice),
      dayHigh: parseFloat(data.high || currentPrice),
      dayLow: parseFloat(data.low || currentPrice),
      lastUpdated: new Date(),
    };
    
    console.log(`Fresh quote data for ${symbol}:`, quote);
    return quote;
  } catch (error) {
    console.error(`Error fetching fresh data for ${symbol}:`, error);
    
    // Only fall back to mock data if absolutely necessary
    throw new Error(`Failed to fetch current data for ${symbol}. Please try a different symbol or check your internet connection.`);
  }
};

// Enhanced function to fetch fresh historical time series data
export const fetchTimeSeriesData = async (
  symbol: string, 
  period: '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' | '10y' | 'ytd' | 'max' = '3mo'
): Promise<TimeSeriesData[]> => {
  try {
    console.log(`Fetching fresh historical data for ${symbol}`);
    
    const cleanSymbol = symbol.replace('.NS', '').replace('.BO', '').toUpperCase();
    
    // Enhanced period mapping for better data coverage
    const intervalMap: Record<string, string> = {
      '1d': '5min',
      '5d': '1h',
      '1mo': '1day',
      '3mo': '1day',
      '6mo': '1day',
      '1y': '1day',
      '2y': '1week',
      '5y': '1week',
      '10y': '1month',
      'ytd': '1day',
      'max': '1month'
    };
    
    const outputSizeMap: Record<string, string> = {
      '1d': '78', // 1 day of 5min intervals
      '5d': '120', // 5 days of hourly
      '1mo': '30',
      '3mo': '90',
      '6mo': '180',
      '1y': '365',
      '2y': '104',
      '5y': '260',
      '10y': '120',
      'ytd': '365',
      'max': '5000'
    };
    
    const data = await makeTwelveDataRequest('time_series', {
      symbol: cleanSymbol,
      interval: intervalMap[period] || '1day',
      outputsize: outputSizeMap[period] || '90',
      order: 'DESC' // Get most recent data first
    });
    
    if (!data?.values || !Array.isArray(data.values) || data.values.length === 0) {
      throw new Error(`No fresh historical data available for ${symbol}`);
    }
    
    // Convert and validate data
    const timeSeriesData: TimeSeriesData[] = data.values
      .map((item: any) => {
        const open = parseFloat(item.open) || 0;
        const high = parseFloat(item.high) || 0;
        const low = parseFloat(item.low) || 0;
        const close = parseFloat(item.close) || 0;
        const volume = parseInt(item.volume) || 0;
        
        // Only include valid data points
        if (close > 0 && open > 0) {
          return {
            date: item.datetime,
            open,
            high: high || close,
            low: low || close,
            close,
            volume,
          };
        }
        return null;
      })
      .filter(Boolean) as TimeSeriesData[];
    
    if (timeSeriesData.length === 0) {
      throw new Error(`No valid historical data points for ${symbol}`);
    }
    
    console.log(`Fresh historical data for ${symbol}: ${timeSeriesData.length} points`);
    return timeSeriesData;
  } catch (error) {
    console.error(`Error fetching fresh historical data for ${symbol}:`, error);
    throw new Error(`Failed to fetch current historical data for ${symbol}. Please try again.`);
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
        symbols = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY'];
        break;
      case 'international':
        symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN'];
        break;
      case 'crypto':
        symbols = ['BTC/USD', 'ETH/USD', 'BNB/USD', 'ADA/USD'];
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
          valueStr = `$${quoteData.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
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
    const validResults = results.filter(Boolean) as Array<{
      quote: StockQuote;
      chartData: Array<{ time: string; value: number }>;
      valueStr: string;
    }>;
    
    // Format data for MarketOverview component
    const stats: MarketStat[] = validResults.map(result => ({
      name: result.quote.name || 'Unknown',
      value: result.valueStr || '0',
      change: result.quote.changePercent || 0,
      timeFrame: 'Today'
    }));
    
    const indices: MarketIndex[] = validResults.map(result => ({
      name: result.quote.name || 'Unknown',
      value: result.valueStr || '0',
      change: result.quote.changePercent || 0,
      chartData: result.chartData || []
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
    console.log(`Searching for ${query} via Twelve Data`);
    
    const data = await makeTwelveDataRequest('symbol_search', {
      symbol: query
    });
    
    if (data?.data && Array.isArray(data.data)) {
      return data.data.map((item: any) => ({
        symbol: item.symbol,
        name: item.instrument_name,
        type: item.instrument_type,
        exchange: item.exchange
      }));
    }
    
    // Fallback to common symbols if search fails
    const commonSymbols: { [key: string]: any[] } = {
      indian: [
        { symbol: 'RELIANCE', name: 'Reliance Industries Limited', type: 'Equity', exchange: 'NSE' },
        { symbol: 'TCS', name: 'Tata Consultancy Services Limited', type: 'Equity', exchange: 'NSE' },
        { symbol: 'HDFCBANK', name: 'HDFC Bank Limited', type: 'Equity', exchange: 'NSE' },
        { symbol: 'INFY', name: 'Infosys Limited', type: 'Equity', exchange: 'NSE' },
        { symbol: 'ICICIBANK', name: 'ICICI Bank Limited', type: 'Equity', exchange: 'NSE' },
      ],
      international: [
        { symbol: 'AAPL', name: 'Apple Inc.', type: 'Equity', exchange: 'NASDAQ' },
        { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'Equity', exchange: 'NASDAQ' },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'Equity', exchange: 'NASDAQ' },
        { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'Equity', exchange: 'NASDAQ' },
        { symbol: 'TSLA', name: 'Tesla Inc.', type: 'Equity', exchange: 'NASDAQ' },
      ],
      crypto: [
        { symbol: 'BTC/USD', name: 'Bitcoin USD', type: 'Cryptocurrency', exchange: 'Crypto' },
        { symbol: 'ETH/USD', name: 'Ethereum USD', type: 'Cryptocurrency', exchange: 'Crypto' },
        { symbol: 'BNB/USD', name: 'Binance Coin USD', type: 'Cryptocurrency', exchange: 'Crypto' },
        { symbol: 'ADA/USD', name: 'Cardano USD', type: 'Cryptocurrency', exchange: 'Crypto' },
        { symbol: 'SOL/USD', name: 'Solana USD', type: 'Cryptocurrency', exchange: 'Crypto' },
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
