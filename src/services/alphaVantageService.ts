// Alpha Vantage API integration for real-time financial data
// Documentation: https://www.alphavantage.co/documentation/

// Alpha Vantage API key
const ALPHA_VANTAGE_API_KEY = 'L9QISA8M46PNJS5A';
const BASE_URL = 'https://www.alphavantage.co/query';

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

// Function to fetch real-time stock quote
export const fetchRealTimeQuote = async (symbol: string): Promise<StockQuote> => {
  try {
    const url = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check if we have valid data
    if (data['Error Message'] || !data['Global Quote'] || Object.keys(data['Global Quote']).length === 0) {
      throw new Error(data['Error Message'] || 'No data available for this symbol');
    }
    
    const quote = data['Global Quote'];
    
    return {
      symbol: quote['01. symbol'],
      name: await getCompanyName(quote['01. symbol']), // Get company name from another endpoint
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      volume: parseInt(quote['06. volume']),
      previousClose: parseFloat(quote['08. previous close']),
      open: parseFloat(quote['02. open']),
      dayHigh: parseFloat(quote['03. high']),
      dayLow: parseFloat(quote['04. low']),
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error("Error fetching quote from Alpha Vantage:", error);
    throw new Error(`Failed to fetch data for ${symbol}`);
  }
};

// Function to get company name from symbol
export const getCompanyName = async (symbol: string): Promise<string> => {
  try {
    const url = `${BASE_URL}?function=SYMBOL_SEARCH&keywords=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return symbol; // Fall back to symbol if API call fails
    }
    
    const data = await response.json();
    
    if (data.bestMatches && data.bestMatches.length > 0) {
      return data.bestMatches[0]['2. name'];
    }
    
    return symbol;
  } catch (error) {
    return symbol;
  }
};

// Function to fetch historical time series data with improved error handling
export const fetchTimeSeriesData = async (
  symbol: string, 
  interval: 'daily' | 'weekly' | 'monthly' = 'daily',
  outputSize: 'compact' | 'full' = 'compact'
): Promise<TimeSeriesData[]> => {
  try {
    let functionName: string;
    switch (interval) {
      case 'weekly':
        functionName = 'TIME_SERIES_WEEKLY';
        break;
      case 'monthly':
        functionName = 'TIME_SERIES_MONTHLY';
        break;
      case 'daily':
      default:
        functionName = 'TIME_SERIES_DAILY';
        break;
    }
    
    // Add a cache-busting parameter to ensure fresh data
    const timestamp = new Date().getTime();
    const url = `${BASE_URL}?function=${functionName}&symbol=${symbol}&outputsize=${outputSize}&apikey=${ALPHA_VANTAGE_API_KEY}&_=${timestamp}`;
    
    console.log(`Fetching time series data for ${symbol} at ${new Date().toISOString()}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check if we have valid data
    if (data['Error Message']) {
      throw new Error(data['Error Message']);
    }
    
    // Determine which time series key to use based on the interval
    const timeSeriesKey = 
      interval === 'daily' ? 'Time Series (Daily)' :
      interval === 'weekly' ? 'Weekly Time Series' :
      'Monthly Time Series';
    
    if (!data[timeSeriesKey]) {
      throw new Error('No time series data available');
    }
    
    // Convert the data to our format
    const timeSeriesData: TimeSeriesData[] = [];
    
    Object.entries(data[timeSeriesKey]).forEach(([date, values]: [string, any]) => {
      timeSeriesData.push({
        date,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseInt(values['5. volume']),
      });
    });
    
    // Sort by date (recent dates first)
    return timeSeriesData.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch (error) {
    console.error("Error fetching time series from Alpha Vantage:", error);
    throw new Error(`Failed to fetch historical data for ${symbol}`);
  }
};

// Function to get major market indices data with real-time updates
export const fetchMarketIndices = async (market: 'indian' | 'international' | 'crypto'): Promise<{
  stats: MarketStat[];
  indices: MarketIndex[];
}> => {
  try {
    let symbols: string[] = [];
    
    // Select indices based on market type
    switch (market) {
      case 'indian':
        symbols = ['^NSEI', '^BSESN', 'RELIANCE.BSE', 'TCS.BSE']; // Nifty 50, Sensex, plus major stocks
        break;
      case 'international':
        symbols = ['^GSPC', '^DJI', '^IXIC', '^FTSE', '^N225']; // S&P 500, Dow Jones, NASDAQ, FTSE 100, Nikkei
        break;
      case 'crypto':
        symbols = ['BTC-USD', 'ETH-USD', 'DOGE-USD', 'SOL-USD']; // Bitcoin, Ethereum, Dogecoin, Solana
        break;
    }
    
    // Add a timestamp parameter to force cache refresh
    const timestamp = new Date().getTime();
    
    // Fetch data for each index with concurrent requests
    const promises = symbols.map(async (symbol) => {
      try {
        // Add caching prevention
        const quoteUrl = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}&_=${timestamp}`;
        const quoteResponse = await fetch(quoteUrl);
        
        if (!quoteResponse.ok) {
          throw new Error(`API Error: ${quoteResponse.status}`);
        }
        
        const quoteData = await quoteResponse.json();
        
        if (quoteData['Error Message'] || !quoteData['Global Quote'] || Object.keys(quoteData['Global Quote']).length === 0) {
          throw new Error(quoteData['Error Message'] || 'No data available');
        }
        
        const quote = quoteData['Global Quote'];
        
        // Get company name
        let name = await getCompanyName(symbol);
        
        // Get historical data for charts
        const timeSeriesData = await fetchTimeSeriesData(symbol, 'daily', 'compact');
        const chartData = timeSeriesData.slice(0, 30).map(data => ({
          time: data.date,
          value: data.close
        })).reverse();
        
        // Format the value string based on market type
        let valueStr = '';
        if (market === 'crypto') {
          valueStr = `$${parseFloat(quote['05. price']).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
        } else if (market === 'indian') {
          valueStr = `₹${parseFloat(quote['05. price']).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
        } else {
          valueStr = `${parseFloat(quote['05. price']).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
        }
        
        const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));
        
        return {
          quote: {
            symbol: quote['01. symbol'],
            name,
            price: parseFloat(quote['05. price']),
            change: parseFloat(quote['09. change']),
            changePercent,
            volume: parseInt(quote['06. volume']),
            previousClose: parseFloat(quote['08. previous close']),
            open: parseFloat(quote['02. open']),
            dayHigh: parseFloat(quote['03. high']),
            dayLow: parseFloat(quote['04. low']),
            lastUpdated: new Date(),
          },
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
    const url = `${BASE_URL}?function=SYMBOL_SEARCH&keywords=${query}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.bestMatches) {
      return [];
    }
    
    // Filter results based on market
    const results = data.bestMatches.filter((match: any) => {
      const region = match['4. region'];
      const type = match['3. type'];
      
      if (market === 'indian') {
        return region === 'India';
      } else if (market === 'crypto') {
        return type === 'Cryptocurrency' || match['1. symbol'].includes('-USD');
      } else {
        return region !== 'India' && type !== 'Cryptocurrency';
      }
    });
    
    return results.map((match: any) => ({
      symbol: match['1. symbol'],
      name: match['2. name'],
      type: match['3. type'],
      region: match['4. region'],
    }));
  } catch (error) {
    console.error("Error searching securities:", error);
    return [];
  }
};
