
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const Models = () => {
  const [selectedModel, setSelectedModel] = useState("price_prediction");
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  
  const handleTrainModel = () => {
    setIsTraining(true);
    setTrainingProgress(0);
    
    toast.info("Starting model training");
    
    // Simulate training progress
    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsTraining(false);
          toast.success("Model training completed successfully");
          return 100;
        }
        return prev + 5;
      });
    }, 500);
  };
  
  // Explanation for model training
  const modelExplanations = {
    price_prediction: {
      name: "Price Prediction Model",
      description: "This model uses historical price data and technical indicators to predict future price movements.",
      features: ["Historical price data", "Moving averages", "Volume indicators", "Momentum oscillators"],
      architecture: "Long Short-Term Memory (LSTM) neural network with 4 hidden layers",
      performance: "Mean Absolute Error: 2.1%, Accuracy: 73% on test data",
      interpretation: "The Price Prediction model analyzes historical patterns to forecast future price levels. It's particularly effective for stocks with strong technical trends and consistent trading volumes. The LSTM architecture helps the model capture long-term dependencies in price sequences, enabling it to recognize complex patterns that develop over time."
    },
    sentiment_analysis: {
      name: "Market Sentiment Analysis",
      description: "Analyzes news articles, social media, and financial reports to gauge market sentiment.",
      features: ["News articles", "Social media feeds", "Financial reports", "Analyst ratings"],
      architecture: "BERT-based transformer model with custom financial text embedding",
      performance: "Sentiment Classification Accuracy: 82%, F1-Score: 0.79",
      interpretation: "The Sentiment Analysis model processes various text sources to understand market sentiment toward specific stocks or the broader market. It identifies positive, negative, and neutral sentiments, along with their intensity. This model helps capture market psychology factors that technical analysis might miss, providing additional context for price movements and potential turning points."
    },
    volatility_prediction: {
      name: "Volatility Prediction",
      description: "Forecasts expected price volatility and potential price ranges.",
      features: ["Historical volatility", "Options implied volatility", "Market indices correlation", "Trading volumes"],
      architecture: "Gradient Boosting Decision Trees with GARCH components",
      performance: "RMSE: 1.8%, Directional Accuracy: 68%",
      interpretation: "The Volatility Prediction model estimates the expected range of price movements, helping identify potential breakouts or consolidation periods. By combining traditional GARCH statistical methods with machine learning, the model adapts to changing market conditions. This model is particularly useful for options strategies, risk management, and identifying potential trading opportunities during market transitions."
    }
  };
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 px-2 sm:px-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Training Models</h1>
          <p className="text-muted-foreground">
            Configure, train and manage your AI prediction models using Google Vertex AI
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="bg-card border border-border h-full">
              <CardHeader>
                <CardTitle>Available Models</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div 
                    className={`p-3 rounded-md cursor-pointer transition-colors ${
                      selectedModel === "price_prediction" ? "bg-primary/10 border border-primary/50" : "bg-muted/30 hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedModel("price_prediction")}
                  >
                    <h3 className="font-medium mb-1">Price Prediction</h3>
                    <p className="text-xs text-muted-foreground">Predicts future price movements using historical data</p>
                  </div>
                  
                  <div 
                    className={`p-3 rounded-md cursor-pointer transition-colors ${
                      selectedModel === "sentiment_analysis" ? "bg-primary/10 border border-primary/50" : "bg-muted/30 hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedModel("sentiment_analysis")}
                  >
                    <h3 className="font-medium mb-1">Sentiment Analysis</h3>
                    <p className="text-xs text-muted-foreground">Analyzes news and social media to determine market sentiment</p>
                  </div>
                  
                  <div 
                    className={`p-3 rounded-md cursor-pointer transition-colors ${
                      selectedModel === "volatility_prediction" ? "bg-primary/10 border border-primary/50" : "bg-muted/30 hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedModel("volatility_prediction")}
                  >
                    <h3 className="font-medium mb-1">Volatility Prediction</h3>
                    <p className="text-xs text-muted-foreground">Forecasts expected price volatility and potential ranges</p>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button className="w-full" onClick={handleTrainModel} disabled={isTraining}>
                    {isTraining ? "Training..." : "Train Selected Model"}
                  </Button>
                </div>
                
                {isTraining && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Training Progress</span>
                      <span className="text-xs">{trainingProgress}%</span>
                    </div>
                    <Progress value={trainingProgress} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-2">
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle>{modelExplanations[selectedModel as keyof typeof modelExplanations].name}</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview">
                  <TabsList className="mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="configuration">Configuration</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Description</h3>
                      <p className="text-sm text-muted-foreground">
                        {modelExplanations[selectedModel as keyof typeof modelExplanations].description}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2">Features Used</h3>
                      <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                        {modelExplanations[selectedModel as keyof typeof modelExplanations].features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2">Explanation</h3>
                      <p className="text-sm text-muted-foreground">
                        {modelExplanations[selectedModel as keyof typeof modelExplanations].interpretation}
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="configuration" className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Model Architecture</label>
                        <p className="text-sm text-muted-foreground">
                          {modelExplanations[selectedModel as keyof typeof modelExplanations].architecture}
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Training Epoch</label>
                        <Select defaultValue="100">
                          <SelectTrigger>
                            <SelectValue placeholder="Select number of epochs" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="50">50 epochs</SelectItem>
                            <SelectItem value="100">100 epochs</SelectItem>
                            <SelectItem value="200">200 epochs</SelectItem>
                            <SelectItem value="500">500 epochs</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Batch Size</label>
                        <Select defaultValue="64">
                          <SelectTrigger>
                            <SelectValue placeholder="Select batch size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="16">16</SelectItem>
                            <SelectItem value="32">32</SelectItem>
                            <SelectItem value="64">64</SelectItem>
                            <SelectItem value="128">128</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Optimizer</label>
                        <Select defaultValue="adam">
                          <SelectTrigger>
                            <SelectValue placeholder="Select optimizer" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="adam">Adam</SelectItem>
                            <SelectItem value="sgd">SGD</SelectItem>
                            <SelectItem value="rmsprop">RMSProp</SelectItem>
                            <SelectItem value="adagrad">AdaGrad</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="performance" className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Model Performance</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {modelExplanations[selectedModel as keyof typeof modelExplanations].performance}
                      </p>
                      
                      <div className="h-[200px] bg-muted/30 rounded-md flex items-center justify-center">
                        <p className="text-muted-foreground">Performance visualization chart</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Models;
