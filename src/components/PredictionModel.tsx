
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getPrediction, trainModel } from '../services/vertexAIService';
import { Info } from 'lucide-react';

interface PredictionModelProps {
  stockName?: string;
  stockSymbol?: string;
}

const PredictionModel: React.FC<PredictionModelProps> = ({ stockName = "Select a stock", stockSymbol = "N/A" }) => {
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [predictionTimeframe, setPredictionTimeframe] = useState("7d");
  const [predictionData, setPredictionData] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({ mae: 0, rmse: 0, r2: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState({
    price: true,
    volume: true,
    ma: true,
    sentiment: false
  });

  // Fetch predictions when stock symbol or timeframe changes
  useEffect(() => {
    if (stockSymbol && stockSymbol !== 'N/A') {
      fetchPredictions();
    }
  }, [stockSymbol, predictionTimeframe]);

  const fetchPredictions = async () => {
    if (!stockSymbol || stockSymbol === 'N/A') return;
    
    setIsLoading(true);
    try {
      const result = await getPrediction(stockSymbol, predictionTimeframe);
      setPredictionData(result.data);
      setMetrics(result.metrics);
      toast.success("Prediction updated");
    } catch (error) {
      toast.error("Failed to fetch prediction");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrainModel = async () => {
    setIsTraining(true);
    setTrainingProgress(0);
    
    toast.info("Training model started");
    
    try {
      // Convert selected features to array
      const features = Object.entries(selectedFeatures)
        .filter(([_, selected]) => selected)
        .map(([feature]) => feature);
      
      const result = await trainModel(
        stockSymbol || 'N/A',
        features,
        (progress) => setTrainingProgress(progress)
      );
      
      toast.success("Model training completed");
      
      // Update metrics if provided in training results
      if (result.metrics) {
        setMetrics(result.metrics);
      }
      
      // Fetch fresh predictions
      fetchPredictions();
      
    } catch (error) {
      toast.error("Model training failed");
      console.error(error);
    } finally {
      setIsTraining(false);
      setTrainingProgress(100);
    }
  };

  const handleFeatureToggle = (feature: string) => {
    setSelectedFeatures(prev => ({
      ...prev,
      [feature]: !prev[feature]
    }));
  };

  // Generate human-friendly explanation of the prediction
  const getPredictionExplanation = () => {
    if (!predictionData || predictionData.length === 0) return "";
    
    const lastActual = predictionData[predictionData.length - 1]?.actual || 0;
    const lastPredicted = predictionData[predictionData.length - 1]?.predicted || 0;
    const direction = lastPredicted > lastActual ? "upward" : "downward";
    const percentChange = Math.abs(((lastPredicted - lastActual) / lastActual) * 100).toFixed(2);
    const accuracy = (100 - (metrics.mae * 100)).toFixed(2);
    const timeframe = predictionTimeframe === "7d" ? "7 days" : 
                      predictionTimeframe === "14d" ? "14 days" : 
                      predictionTimeframe === "30d" ? "30 days" : "90 days";
    
    return `Our AI prediction model forecasts a ${direction} trend for ${stockSymbol || "this stock"} 
    over the next ${timeframe}, with approximately ${percentChange}% movement expected. 
    This prediction is based on historical price patterns, volume analysis, and technical indicators.
    
    The model has been trained with ${selectedFeatures.price ? "price history, " : ""}
    ${selectedFeatures.volume ? "trading volumes, " : ""}
    ${selectedFeatures.ma ? "moving averages, " : ""}
    ${selectedFeatures.sentiment ? "and market sentiment data" : ""}.
    
    With a prediction accuracy of approximately ${accuracy}%, this forecast should be considered alongside
    fundamental analysis and current market conditions before making any investment decisions. The metrics
    shown below provide insight into the model's reliability - lower MAE and RMSE values and higher R² scores
    indicate more accurate predictions.`;
  };
  
  // Explain metrics in user-friendly terms
  const getMetricExplanation = (metricName: string) => {
    switch(metricName) {
      case 'mae':
        return "Mean Absolute Error measures the average prediction error. Lower values indicate better predictions.";
      case 'rmse':
        return "Root Mean Square Error emphasizes larger errors. Lower values indicate better predictions.";
      case 'r2':
        return "R² Score indicates how well the model fits the data. Values closer to 1.0 indicate better predictions.";
      default:
        return "";
    }
  };

  return (
    <Card className="bg-card border border-border">
      <CardHeader>
        <div className="flex justify-between">
          <div>
            <CardTitle>AI Prediction Model</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {stockName} ({stockSymbol})
            </p>
          </div>
          <Select value={predictionTimeframe} onValueChange={setPredictionTimeframe}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="14d">14 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chart">
          <TabsList className="mb-4">
            <TabsTrigger value="chart">Prediction Chart</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
          </TabsList>
          <TabsContent value="chart">
            <div className="h-[300px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Loading predictions...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={predictionData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.8)', borderColor: '#374151', borderRadius: '0.375rem' }}
                      labelStyle={{ color: '#f3f4f6' }}
                      itemStyle={{ color: '#f3f4f6' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="actual" name="Actual Price" stroke="#22c55e" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="predicted" name="Predicted Price" stroke="#3b82f6" strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="mt-4 p-3 bg-muted/30 rounded-md">
              <h4 className="font-medium mb-2">Prediction Accuracy</h4>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-muted-foreground">Mean Absolute Error (MAE)</span>
                <span className="text-sm font-medium">{metrics.mae.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-muted-foreground">Root Mean Square Error (RMSE)</span>
                <span className="text-sm font-medium">{metrics.rmse.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">R² Score</span>
                <span className="text-sm font-medium">{metrics.r2.toFixed(2)}</span>
              </div>
              
              {/* Prediction explanation */}
              {predictionData && predictionData.length > 0 && (
                <div className="mt-4 pt-3 border-t border-border">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium mb-1">Prediction Explanation</h4>
                      <p className="text-xs text-muted-foreground whitespace-pre-line">{getPredictionExplanation()}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="training">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">AI Model Configuration</label>
                  <span className="text-xs text-muted-foreground">Using Google Vertex AI</span>
                </div>
                <Select defaultValue="vertex">
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vertex">Google Vertex AI</SelectItem>
                    <SelectItem value="local">Local Files</SelectItem>
                    <SelectItem value="api">External API</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Training Features</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="price" 
                      className="rounded text-primary border-border bg-background" 
                      checked={selectedFeatures.price}
                      onChange={() => handleFeatureToggle('price')}
                    />
                    <label htmlFor="price" className="text-sm">Price History</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="volume" 
                      className="rounded text-primary border-border bg-background" 
                      checked={selectedFeatures.volume}
                      onChange={() => handleFeatureToggle('volume')}
                    />
                    <label htmlFor="volume" className="text-sm">Trading Volume</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="ma" 
                      className="rounded text-primary border-border bg-background" 
                      checked={selectedFeatures.ma}
                      onChange={() => handleFeatureToggle('ma')}
                    />
                    <label htmlFor="ma" className="text-sm">Moving Averages</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="sentiment" 
                      className="rounded text-primary border-border bg-background" 
                      checked={selectedFeatures.sentiment}
                      onChange={() => handleFeatureToggle('sentiment')}
                    />
                    <label htmlFor="sentiment" className="text-sm">Market Sentiment</label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Training Progress</label>
                  <span className="text-xs text-muted-foreground">{trainingProgress}%</span>
                </div>
                <Progress value={trainingProgress} className="h-2" />
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={handleTrainModel} 
                  disabled={isTraining || !stockSymbol || stockSymbol === 'N/A'} 
                  className="flex-1"
                >
                  {isTraining ? 'Training...' : 'Train Model'}
                </Button>
                <Button 
                  variant="outline" 
                  disabled={isTraining || trainingProgress < 100} 
                  className="flex-1"
                >
                  Save Model
                </Button>
              </div>
              
              {/* Training explanation */}
              <div className="mt-4 p-3 bg-muted/30 rounded-md">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium mb-1">About Model Training</h4>
                    <p className="text-xs text-muted-foreground">
                      Training a custom AI model using Google Vertex AI allows you to create predictions
                      tailored to specific stocks and market conditions. The model uses historical data to
                      learn patterns and correlations, then applies this knowledge to predict future price
                      movements. Including more features generally improves model accuracy, but may require
                      longer training times. For best results, train the model regularly as market conditions
                      change.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PredictionModel;
