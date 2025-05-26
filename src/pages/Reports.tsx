
import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Download, Info, ChartBar } from 'lucide-react';
import { toast } from 'sonner';

const Reports = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleGenerateReport = (reportType: string) => {
    setIsLoading(true);
    
    toast.info(`Generating ${reportType} report...`);
    
    // Simulate report generation
    setTimeout(() => {
      setIsLoading(false);
      toast.success(`${reportType} report generated successfully`);
    }, 2000);
  };
  
  const handleDownload = (reportName: string) => {
    toast.success(`Downloading ${reportName}`);
  };
  
  // Sample reports data
  const marketReports = [
    {
      title: "Indian Market Weekly Summary",
      date: "May 20, 2025",
      description: "A comprehensive analysis of the Indian stock market's performance over the past week, including key movers, sector analysis, and market breadth indicators.",
      type: "Market Analysis"
    },
    {
      title: "Sector Rotation Analysis",
      date: "May 18, 2025",
      description: "Detailed report on sector performance, fund flows, and rotation patterns in the Indian equity markets, highlighting emerging trends and potential opportunities.",
      type: "Sector Analysis"
    },
    {
      title: "International Markets Comparison",
      date: "May 15, 2025",
      description: "Comparative analysis of Indian market performance against major global indices, with correlation studies and divergence patterns.",
      type: "Global Analysis"
    }
  ];
  
  const stockReports = [
    {
      title: "RELIANCE Industries Deep Dive",
      date: "May 19, 2025",
      description: "Comprehensive analysis of RELIANCE Industries, including financial performance, technical analysis, and future projections based on AI models.",
      type: "Company Analysis"
    },
    {
      title: "INFY Technical Analysis",
      date: "May 17, 2025",
      description: "Detailed technical analysis of Infosys Ltd (INFY) stock, covering multiple timeframes and identifying key support/resistance levels.",
      type: "Technical Analysis"
    },
    {
      title: "HDFC Bank Fundamental Valuation",
      date: "May 14, 2025",
      description: "Fundamental analysis and valuation metrics for HDFC Bank, including peer comparison, growth projections, and fair value estimates.",
      type: "Fundamental Analysis"
    }
  ];
  
  const aiReports = [
    {
      title: "AI Market Sentiment Analysis",
      date: "May 20, 2025",
      description: "Analysis of market sentiment derived from news, social media, and other sources using our AI sentiment analysis model.",
      type: "AI Analysis"
    },
    {
      title: "Q2 2025 Market Forecast",
      date: "May 16, 2025",
      description: "AI-generated market forecast for Q2 2025 based on macroeconomic indicators, technical patterns, and market sentiment.",
      type: "Forecast"
    },
    {
      title: "Pattern Detection Summary",
      date: "May 13, 2025",
      description: "Summary of trading patterns detected across major Indian stocks over the past month, with statistical significance and historical performance.",
      type: "Pattern Recognition"
    }
  ];
  
  // Report explanation
  const reportExplanation = 
    "Our reports combine traditional financial analysis with cutting-edge AI technologies. " +
    "Market reports provide a comprehensive view of overall market conditions and trends. " +
    "Stock-specific reports dive deep into individual securities with technical and fundamental analysis. " +
    "AI-powered reports leverage our machine learning models to provide unique insights that might be missed by conventional analysis. " +
    "Each report is generated using multiple data sources including real-time market data, historical patterns, news sentiment, and proprietary AI predictions.";
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 px-2 sm:px-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Reports</h1>
          <p className="text-muted-foreground mb-4">
            Generate and access comprehensive market and stock analysis reports
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ChartBar className="h-5 w-5 mr-2" />
                Generate New Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Report Type</label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                  <option value="market">Market Analysis</option>
                  <option value="stock">Stock Analysis</option>
                  <option value="technical">Technical Analysis</option>
                  <option value="fundamental">Fundamental Analysis</option>
                  <option value="sentiment">AI Sentiment Analysis</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Time Period</label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Include in Report</label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="technical" checked className="rounded text-primary border-input" />
                    <label htmlFor="technical" className="text-sm">Technical Analysis</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="fundamental" checked className="rounded text-primary border-input" />
                    <label htmlFor="fundamental" className="text-sm">Fundamental Data</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="ai" checked className="rounded text-primary border-input" />
                    <label htmlFor="ai" className="text-sm">AI Predictions</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="patterns" className="rounded text-primary border-input" />
                    <label htmlFor="patterns" className="text-sm">Pattern Detection</label>
                  </div>
                </div>
              </div>
              
              <Button 
                className="w-full" 
                onClick={() => handleGenerateReport('Market Analysis')}
                disabled={isLoading}
              >
                {isLoading ? "Generating..." : "Generate Report"}
              </Button>
            </CardContent>
          </Card>
          
          <div className="lg:col-span-2">
            <Card className="bg-card border border-border h-full">
              <CardHeader>
                <CardTitle>Available Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="market">
                  <TabsList className="mb-4">
                    <TabsTrigger value="market">Market Reports</TabsTrigger>
                    <TabsTrigger value="stock">Stock Reports</TabsTrigger>
                    <TabsTrigger value="ai">AI Reports</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="market">
                    <div className="space-y-4">
                      {marketReports.map((report, index) => (
                        <ReportItem 
                          key={index}
                          title={report.title}
                          date={report.date}
                          description={report.description}
                          type={report.type}
                          onDownload={() => handleDownload(report.title)}
                        />
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="stock">
                    <div className="space-y-4">
                      {stockReports.map((report, index) => (
                        <ReportItem 
                          key={index}
                          title={report.title}
                          date={report.date}
                          description={report.description}
                          type={report.type}
                          onDownload={() => handleDownload(report.title)}
                        />
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="ai">
                    <div className="space-y-4">
                      {aiReports.map((report, index) => (
                        <ReportItem 
                          key={index}
                          title={report.title}
                          date={report.date}
                          description={report.description}
                          type={report.type}
                          onDownload={() => handleDownload(report.title)}
                        />
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
                
                {/* Report explanation */}
                <div className="mt-6 p-3 bg-muted/30 rounded-md">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium mb-1">About Our Reports</h4>
                      <p className="text-xs text-muted-foreground">{reportExplanation}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

interface ReportItemProps {
  title: string;
  date: string;
  description: string;
  type: string;
  onDownload: () => void;
}

const ReportItem: React.FC<ReportItemProps> = ({ 
  title, 
  date, 
  description, 
  type,
  onDownload
}) => {
  return (
    <div className="p-4 border border-border rounded-md bg-muted/10">
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-3">
          <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-medium">{title}</h3>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
              <span>{date}</span>
              <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full">{type}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{description}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="flex-shrink-0" onClick={onDownload}>
          <Download className="h-4 w-4 mr-1" />
          Download
        </Button>
      </div>
    </div>
  );
};

export default Reports;
