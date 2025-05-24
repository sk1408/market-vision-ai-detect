
// This file would typically make real API calls to fetch market data
// For now, we'll use mock data for demonstration

// Mock data for Indian market
export const getIndianMarketData = () => {
  const stats = [
    { name: "Sensex", value: "72,570.32", change: 0.42, timeFrame: "Today" },
    { name: "Nifty 50", value: "22,055.20", change: 0.38, timeFrame: "Today" },
    { name: "BSE Market Cap", value: "₹382.5T", change: 0.35, timeFrame: "Today" },
    { name: "India VIX", value: "13.82", change: -4.21, timeFrame: "Today" },
  ];
  
  const indices = [
    {
      name: "Sensex",
      value: "72,570.32",
      change: 0.42,
      chartData: generateChartData(30, 72000, 73000)
    },
    {
      name: "Nifty 50",
      value: "22,055.20",
      change: 0.38,
      chartData: generateChartData(30, 21800, 22200)
    }
  ];
  
  return { stats, indices };
};

// Mock data for International market
export const getInternationalMarketData = () => {
  const stats = [
    { name: "S&P 500", value: "5,021.84", change: 0.57, timeFrame: "Today" },
    { name: "Dow Jones", value: "38,239.66", change: 0.16, timeFrame: "Today" },
    { name: "NASDAQ", value: "15,927.90", change: 0.98, timeFrame: "Today" },
    { name: "FTSE 100", value: "8,205.10", change: -0.23, timeFrame: "Today" },
  ];
  
  const indices = [
    {
      name: "S&P 500",
      value: "5,021.84",
      change: 0.57,
      chartData: generateChartData(30, 4900, 5100)
    },
    {
      name: "NASDAQ",
      value: "15,927.90",
      change: 0.98,
      chartData: generateChartData(30, 15500, 16000)
    }
  ];
  
  return { stats, indices };
};

// Mock data for Crypto market
export const getCryptoMarketData = () => {
  const stats = [
    { name: "Bitcoin", value: "$63,257.82", change: 2.14, timeFrame: "24h" },
    { name: "Ethereum", value: "$3,082.47", change: 1.68, timeFrame: "24h" },
    { name: "Market Cap", value: "$2.32T", change: 1.97, timeFrame: "24h" },
    { name: "24h Volume", value: "$98.7B", change: 12.43, timeFrame: "24h" },
  ];
  
  const indices = [
    {
      name: "Bitcoin (BTC)",
      value: "$63,257.82",
      change: 2.14,
      chartData: generateChartData(30, 60000, 65000)
    },
    {
      name: "Ethereum (ETH)",
      value: "$3,082.47",
      change: 1.68,
      chartData: generateChartData(30, 2900, 3200)
    }
  ];
  
  return { stats, indices };
};

// Mock stock data for a particular stock
export const getStockData = (symbol: string) => {
  // This would be replaced with actual API calls
  return {
    symbol,
    name: getStockName(symbol),
    price: generateRandomNumber(100, 500, 2),
    change: generateRandomNumber(-5, 5, 2),
    changePercent: generateRandomNumber(-3, 3, 2),
    chartData: generateCandlestickData(100),
  };
};

// Mock pattern detection
export const analyzePattern = async (file: File | null, chartId?: string) => {
  // Simulate API call to Vertex AI for pattern detection
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Return randomly either legal or illegal pattern
  const isLegal = Math.random() > 0.5;
  
  if (isLegal) {
    return {
      patternName: "Bullish Flag Pattern",
      isLegal: true,
      confidence: Math.floor(Math.random() * 20) + 80, // 80-99%
      description: "A bullish flag pattern that indicates a continuation of the upward trend. This is a common and legal trading pattern.",
      recommendation: "Consider this a potential buying opportunity if other indicators confirm the trend."
    };
  } else {
    return {
      patternName: "Pump and Dump Pattern",
      isLegal: false,
      confidence: Math.floor(Math.random() * 20) + 80, // 80-99%
      description: "The chart shows signs of market manipulation with an abnormal spike in volume followed by a rapid price increase and subsequent drop.",
      recommendation: "Exercise extreme caution. This pattern is often associated with market manipulation and may be illegal in regulated markets."
    };
  }
};

// Helper functions
function generateChartData(count: number, min: number, max: number) {
  const data = [];
  let current = generateRandomNumber(min, max);
  
  for (let i = 0; i < count; i++) {
    const time = new Date();
    time.setDate(time.getDate() - (count - i));
    
    const change = generateRandomNumber(-0.5, 0.5) * (max - min) / 100;
    current = current + change;
    
    data.push({
      time: time.toISOString().split('T')[0],
      value: parseFloat(current.toFixed(2))
    });
  }
  
  return data;
}

function generateCandlestickData(count: number) {
  const data = [];
  let close = generateRandomNumber(100, 500);
  
  for (let i = 0; i < count; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (count - i));
    
    const change = generateRandomNumber(-2, 2);
    close = parseFloat((close + change).toFixed(2));
    
    const open = parseFloat((close - change * generateRandomNumber(0.5, 1.5)).toFixed(2));
    const high = parseFloat(Math.max(open, close + generateRandomNumber(0, 2)).toFixed(2));
    const low = parseFloat(Math.min(open, close - generateRandomNumber(0, 2)).toFixed(2));
    const volume = Math.floor(generateRandomNumber(1000, 10000));
    
    data.push({
      date: date.toISOString().split('T')[0],
      open,
      high,
      low,
      close,
      volume
    });
  }
  
  return data;
}

function generateRandomNumber(min: number, max: number, decimals = 0) {
  const random = Math.random() * (max - min) + min;
  return decimals ? parseFloat(random.toFixed(decimals)) : Math.floor(random);
}

function getStockName(symbol: string): string {
  const stockNames: Record<string, string> = {
    'RELIANCE': 'Reliance Industries Ltd.',
    'TCS': 'Tata Consultancy Services Ltd.',
    'INFY': 'Infosys Ltd.',
    'HDFC': 'HDFC Bank Ltd.',
    'ITC': 'ITC Ltd.',
    'AAPL': 'Apple Inc.',
    'MSFT': 'Microsoft Corporation',
    'GOOGL': 'Alphabet Inc.',
    'AMZN': 'Amazon.com, Inc.',
    'TSLA': 'Tesla, Inc.',
    'BTC': 'Bitcoin',
    'ETH': 'Ethereum',
    'BNB': 'Binance Coin',
    'XRP': 'Ripple',
    'SOL': 'Solana'
  };
  
  return stockNames[symbol] || symbol;
}
