
import React, { useState } from 'react';
import Layout from '../components/Layout';
import PatternDetection from '../components/PatternDetection';
import PatternResult from '../components/PatternResult';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { detectPattern } from '../services/vertexAIService';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Check, ShieldAlert } from 'lucide-react';

const Patterns = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [patternResult, setPatternResult] = useState<any>(null);
  
  const handleAnalyzePattern = async (file: File | null, chartId?: string) => {
    setIsAnalyzing(true);
    try {
      // Call Vertex AI Vision API
      const result = await detectPattern(file || chartId || "default");
      setPatternResult(result);
      
      const resultType = result.isLegal ? "legal" : "illegal";
      toast.success(`Pattern detected: ${result.name} (${resultType}) with ${result.confidence}% confidence`);
    } catch (error) {
      toast.error("Failed to analyze pattern");
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Common pattern examples
  const legalPatterns = [
    {
      name: "Head and Shoulders",
      description: "A reversal chart pattern that signals a trend change from bullish to bearish.",
      characteristics: [
        "Three peaks with the middle peak higher than the other two",
        "Left and right shoulders roughly equal in height",
        "Neckline connecting the lows between the peaks",
        "Volume typically higher on left shoulder than right"
      ]
    },
    {
      name: "Double Top/Bottom",
      description: "A reversal pattern showing two distinct peaks or valleys at approximately the same price level.",
      characteristics: [
        "Two peaks/troughs at nearly the same price level",
        "Volume typically decreases on the second peak/trough",
        "Confirmation occurs when price breaks through the support/resistance level",
        "Often indicates a strong reversal of the existing trend"
      ]
    },
    {
      name: "Cup and Handle",
      description: "A bullish continuation pattern resembling a cup with a handle, signaling an upward trend continuation.",
      characteristics: [
        "U-shaped cup formation over 1-6 months",
        "Shallower handle formation with lower trading volume",
        "Breakout above the handle typically signals entry point",
        "Generally considered bullish when properly formed"
      ]
    }
  ];
  
  const illegalPatterns = [
    {
      name: "Pump and Dump",
      description: "A form of securities fraud where stock prices are artificially inflated through false statements.",
      characteristics: [
        "Sharp price increase on high volume with no fundamental basis",
        "Often accompanied by promotional campaigns or misleading news",
        "Followed by significant price drop when promoters sell their shares",
        "Most common in micro-cap and cryptocurrency markets"
      ]
    },
    {
      name: "Wash Trading",
      description: "Creating artificial trading activity by simultaneously buying and selling the same securities.",
      characteristics: [
        "Unusual trading volumes with price remaining relatively stable",
        "Trades occur between related parties or the same entity",
        "Often shows perfectly matched buy and sell orders",
        "Used to create false impression of liquidity or interest"
      ]
    },
    {
      name: "Spoofing",
      description: "Placing orders with no intention of executing them to manipulate prices.",
      characteristics: [
        "Large orders placed and quickly canceled before execution",
        "Creates false impression of supply or demand",
        "Often followed by actual trades at favorable prices",
        "Can create sawtooth patterns in high-frequency price charts"
      ]
    }
  ];
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Trading Pattern Detection</h1>
          <p className="text-muted-foreground mb-6">
            Upload chart images or analyze current charts to detect legal and illegal trading patterns using Google Vertex AI
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PatternDetection 
            onAnalyze={handleAnalyzePattern}
            isLoading={isAnalyzing}
          />
          
          {patternResult ? (
            <PatternResult
              patternName={patternResult.name}
              isLegal={patternResult.isLegal}
              confidence={patternResult.confidence}
              description={patternResult.description}
              recommendation={patternResult.recommendation}
            />
          ) : (
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle>Detection Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-[180px] border border-dashed border-border rounded-lg">
                  <div className="text-center">
                    <ShieldAlert className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">Upload an image or analyze current chart to see pattern detection results</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle>Common Trading Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="legal">
              <TabsList className="mb-4">
                <TabsTrigger value="legal" className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-positive" /> Legal Patterns
                </TabsTrigger>
                <TabsTrigger value="illegal" className="flex items-center">
                  <X className="mr-2 h-4 w-4 text-negative" /> Illegal Patterns
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="legal">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {legalPatterns.map((pattern, index) => (
                    <Card key={index} className="bg-muted/30 border border-border">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{pattern.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground">{pattern.description}</p>
                        <div>
                          <h4 className="text-xs font-medium mb-1">Characteristics:</h4>
                          <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                            {pattern.characteristics.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="illegal">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {illegalPatterns.map((pattern, index) => (
                    <Card key={index} className="bg-muted/30 border border-negative/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{pattern.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground">{pattern.description}</p>
                        <div>
                          <h4 className="text-xs font-medium mb-1">Warning Signs:</h4>
                          <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                            {pattern.characteristics.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Patterns;
