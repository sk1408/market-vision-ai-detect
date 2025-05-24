
// Mock Vertex AI integration service
// In a real app, this would integrate with Google's Vertex AI API

/**
 * Mock function to simulate Vertex AI prediction
 */
export const getPrediction = async (
  stockSymbol: string,
  timeframe: string = '7d'
) => {
  // Simulate API call to Vertex AI
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Generate mock prediction data
  const daysToPredict = parseInt(timeframe.replace('d', ''));
  const currentDate = new Date();
  const startDate = new Date();
  startDate.setDate(currentDate.getDate() - 7); // Historical data
  
  const endDate = new Date();
  endDate.setDate(currentDate.getDate() + daysToPredict); // Future prediction
  
  const dateRange = getDatesInRange(startDate, endDate);
  const basePrice = Math.random() * 400 + 100; // Random base price between 100 and 500
  const volatility = Math.random() * 0.05 + 0.02; // Random volatility between 2% and 7%
  
  const predictionData = dateRange.map((date, index) => {
    const isPast = index < 7; // First 7 days are "actual" historical data
    const dayFactor = (index - 7) / daysToPredict; // Factor to create a general trend
    const trend = Math.random() > 0.5 ? 1 : -1; // Random trend direction
    const trendStrength = Math.random() * 0.1 + 0.05; // Random trend strength between 5% and 15%
    
    const dailyChange = (Math.random() * 2 - 1) * volatility * basePrice;
    const trendEffect = isPast ? 0 : trend * trendStrength * basePrice * dayFactor;
    
    const price = basePrice + dailyChange + trendEffect;
    
    // Add some error to the predicted values for realism
    const predictedError = isPast ? 0 : (Math.random() * 2 - 1) * volatility * basePrice * 0.5;
    
    return {
      date: formatDate(date),
      actual: isPast ? price : null,
      predicted: isPast ? price + (Math.random() * 2 - 1) * 2 : price + predictedError
    };
  });
  
  // Add metrics
  const metrics = {
    mae: parseFloat((Math.random() * 2 + 1).toFixed(2)), // Mean Absolute Error
    rmse: parseFloat((Math.random() * 3 + 2).toFixed(2)), // Root Mean Square Error
    r2: parseFloat((Math.random() * 0.15 + 0.8).toFixed(2)) // R² score
  };
  
  return {
    data: predictionData,
    metrics
  };
};

/**
 * Mock function to simulate model training on Vertex AI
 */
export const trainModel = async (
  stockSymbol: string,
  features: string[],
  onProgress: (progress: number) => void
) => {
  // Simulate training progress
  const totalSteps = 10;
  for (let step = 1; step <= totalSteps; step++) {
    await new Promise(resolve => setTimeout(resolve, 800));
    onProgress((step / totalSteps) * 100);
  }
  
  // Return mock training results
  return {
    modelId: `model_${stockSymbol}_${Date.now()}`,
    accuracy: Math.random() * 0.15 + 0.8, // 80% to 95% accuracy
    trainingTime: Math.floor(Math.random() * 60) + 30, // 30 to 90 seconds
    features: features,
    metrics: {
      mae: parseFloat((Math.random() * 2 + 1).toFixed(2)),
      rmse: parseFloat((Math.random() * 3 + 2).toFixed(2)),
      r2: parseFloat((Math.random() * 0.15 + 0.8).toFixed(2))
    }
  };
};

/**
 * Mock function to simulate pattern detection using Vertex AI Vision
 */
export const detectPattern = async (
  imageOrId: File | string
) => {
  // Simulate API call to Vertex AI Vision
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Randomly return legal or illegal pattern
  const patterns = [
    {
      name: "Head and Shoulders",
      isLegal: true,
      confidence: 87,
      description: "A reversal pattern indicating a change from an uptrend to a downtrend. Characterized by three peaks, with the middle peak being the highest.",
      recommendation: "Consider taking profits or setting stop losses if you're in a long position."
    },
    {
      name: "Double Top",
      isLegal: true,
      confidence: 92,
      description: "A bearish reversal pattern that forms after an extended move up. The price attempts to test a resistance level twice but fails to break through.",
      recommendation: "Watch for confirmation of the pattern with increased volume on the breakdown."
    },
    {
      name: "Bull Flag",
      isLegal: true,
      confidence: 95,
      description: "A continuation pattern that signals a temporary pause in the uptrend before continuing higher.",
      recommendation: "Consider entering new long positions when the price breaks above the flag resistance."
    },
    {
      name: "Pump and Dump",
      isLegal: false,
      confidence: 88,
      description: "Shows signs of market manipulation with an artificial price inflation followed by selling off shares at inflated prices.",
      recommendation: "Report suspicious activity to regulatory authorities if you suspect market manipulation."
    },
    {
      name: "Wash Trading",
      isLegal: false,
      confidence: 84,
      description: "Shows evidence of artificial trading activity where the same parties are buying and selling to create a false impression of activity.",
      recommendation: "Exercise caution with securities showing unusual trading patterns and volumes that don't align with news or fundamentals."
    },
    {
      name: "Spoofing Pattern",
      isLegal: false,
      confidence: 91,
      description: "Pattern suggests the placement of orders with no intention of executing them, to manipulate the market price.",
      recommendation: "Be wary of sudden price movements with large orders that disappear quickly before execution."
    }
  ];
  
  // Return a random pattern
  return patterns[Math.floor(Math.random() * patterns.length)];
};

// Helper functions
function getDatesInRange(startDate: Date, endDate: Date) {
  const dates = [];
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
}

function formatDate(date: Date) {
  return date.toISOString().split('T')[0];
}
