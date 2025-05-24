
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ShieldAlert, Info, AlertTriangle, Check } from 'lucide-react';

interface PatternResultProps {
  patternName: string;
  isLegal: boolean;
  confidence: number;
  description: string;
  recommendation?: string;
}

const PatternResult: React.FC<PatternResultProps> = ({
  patternName,
  isLegal,
  confidence,
  description,
  recommendation
}) => {
  // Enhanced explanation based on pattern type
  const getDetailedExplanation = () => {
    if (isLegal) {
      return `This "${patternName}" is a recognized trading pattern that follows normal market dynamics. 
      Our AI has identified this pattern with ${confidence}% confidence based on historical price action, 
      volume analysis, and pattern recognition algorithms. The pattern is considered legal because it 
      represents organic market behavior rather than market manipulation. Traders commonly use this pattern 
      for technical analysis and making informed trading decisions.`;
    } else {
      return `This "${patternName}" has been flagged as a potentially illegal trading pattern with ${confidence}% 
      confidence by our AI detection system. This type of pattern often indicates possible market manipulation 
      or abnormal trading activity that may violate financial regulations. Such patterns typically involve 
      artificial price movements that don't reflect genuine supply and demand forces in the market. 
      It's important to exercise caution and consider regulatory implications if you observe this pattern.`;
    }
  };

  // Get key points based on the pattern for easier understanding
  const getKeyPoints = () => {
    // Generic key points based on pattern legality
    if (isLegal) {
      return [
        "Pattern follows natural market behavior",
        "Based on legitimate supply and demand dynamics",
        "Commonly used in technical analysis",
        "Historical accuracy higher than random chance",
      ];
    } else {
      return [
        "Potential indicator of market manipulation",
        "Does not follow natural market dynamics",
        "May violate trading regulations",
        "Often associated with artificial price movements",
      ];
    }
  };

  const keyPoints = getKeyPoints();

  return (
    <Card className={`border ${isLegal ? 'border-positive/30' : 'border-negative/30'} bg-card shadow-sm transition-all hover:shadow-md`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium flex items-center">
            {isLegal ? (
              <Shield className="h-5 w-5 mr-2 text-positive" />
            ) : (
              <ShieldAlert className="h-5 w-5 mr-2 text-negative" />
            )}
            {patternName}
          </CardTitle>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            isLegal ? 'bg-positive/10 text-positive' : 'bg-negative/10 text-negative'
          }`}>
            {isLegal ? 'Legal Pattern' : 'Illegal Pattern'}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="mb-3">
          <div className="flex justify-between mb-1">
            <span className="text-sm text-muted-foreground">Confidence</span>
            <span className="text-sm font-medium">{confidence}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${isLegal ? 'bg-positive' : 'bg-negative'}`}
              style={{ width: `${confidence}%` }}
            ></div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="bg-muted/30 rounded-md p-3">
            <h4 className="text-sm font-medium mb-2">Pattern Description</h4>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          
          <div className="bg-muted/20 rounded-md p-3">
            <h4 className="text-sm font-medium mb-2">Key Characteristics</h4>
            <ul className="space-y-1">
              {keyPoints.map((point, index) => (
                <li key={index} className="flex items-start">
                  <span className={`mr-2 mt-0.5 ${isLegal ? 'text-positive' : 'text-negative'}`}>
                    {isLegal ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                  </span>
                  <span className="text-sm text-muted-foreground">{point}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {recommendation && (
            <div className="bg-primary/5 rounded-md p-3 border-l-4 border-primary">
              <h4 className="text-sm font-medium mb-1">Recommendation</h4>
              <p className="text-sm text-muted-foreground">{recommendation}</p>
            </div>
          )}
          
          <div className="mt-4 p-3 bg-muted/30 rounded-md">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium mb-1">AI Analysis Explanation</h4>
                <p className="text-xs text-muted-foreground">{getDetailedExplanation()}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatternResult;
