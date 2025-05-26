import React, { useState } from 'react';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Settings as SettingsIcon, Save } from 'lucide-react';

const Settings = () => {
  const [theme, setTheme] = useState("dark");
  const [chartType, setChartType] = useState("candlestick");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [predictionAlerts, setPredictionAlerts] = useState(true);
  const [patternAlerts, setPatternAlerts] = useState(true);
  const [dataSource, setDataSource] = useState("kaggle");
  
  const handleSaveSettings = () => {
    toast.success("Settings saved successfully");
  };
  
  const handleClearCache = () => {
    toast.info("Cache cleared successfully");
  };
  
  const handleResetSettings = () => {
    setTheme("dark");
    setChartType("candlestick");
    setAutoRefresh(true);
    setNotifications(true);
    setPredictionAlerts(true);
    setPatternAlerts(true);
    setDataSource("kaggle");
    toast.info("Settings reset to defaults");
  };
  
  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6 md:space-y-8 px-2 sm:px-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Settings</h1>
          <p className="text-muted-foreground mb-4">
            Configure application preferences and account settings
          </p>
        </div>
        
        <Tabs defaultValue="appearance">
          <TabsList className="mb-4">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="data">Data & Analysis</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>
          
          <TabsContent value="appearance">
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <SettingsIcon className="h-5 w-5 mr-2" />
                  Appearance Settings
                </CardTitle>
                <CardDescription>
                  Customize how the application looks and feels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <label className="font-medium">Theme</label>
                  <div className="flex items-center space-x-4">
                    <div 
                      className={`w-16 h-16 rounded-md bg-white border ${theme === 'light' ? 'border-primary ring-2 ring-primary' : 'border-border'} cursor-pointer`}
                      onClick={() => setTheme('light')}
                    >
                      <div className="h-3 w-full bg-[#e0e0e0]"></div>
                      <div className="p-2">
                        <div className="h-2 w-8 bg-[#333333] rounded-sm mb-1"></div>
                        <div className="h-2 w-10 bg-[#666666] rounded-sm"></div>
                      </div>
                    </div>
                    
                    <div 
                      className={`w-16 h-16 rounded-md bg-[#121212] border ${theme === 'dark' ? 'border-primary ring-2 ring-primary' : 'border-border'} cursor-pointer`}
                      onClick={() => setTheme('dark')}
                    >
                      <div className="h-3 w-full bg-[#1e1e1e]"></div>
                      <div className="p-2">
                        <div className="h-2 w-8 bg-[#e0e0e0] rounded-sm mb-1"></div>
                        <div className="h-2 w-10 bg-[#a0a0a0] rounded-sm"></div>
                      </div>
                    </div>
                    
                    <div 
                      className={`w-16 h-16 rounded-md bg-[#000000] border ${theme === 'black' ? 'border-primary ring-2 ring-primary' : 'border-border'} cursor-pointer`}
                      onClick={() => setTheme('black')}
                    >
                      <div className="h-3 w-full bg-[#0a0a0a]"></div>
                      <div className="p-2">
                        <div className="h-2 w-8 bg-[#ffffff] rounded-sm mb-1"></div>
                        <div className="h-2 w-10 bg-[#cccccc] rounded-sm"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="font-medium">Chart Type</label>
                  <Select value={chartType} onValueChange={setChartType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select chart type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="candlestick">Candlestick</SelectItem>
                      <SelectItem value="line">Line Chart</SelectItem>
                      <SelectItem value="area">Area Chart</SelectItem>
                      <SelectItem value="bar">Bar Chart</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">Auto Refresh Charts</label>
                    <p className="text-sm text-muted-foreground">
                      Automatically refresh chart data every 5 minutes
                    </p>
                  </div>
                  <Switch 
                    checked={autoRefresh}
                    onCheckedChange={setAutoRefresh}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="data">
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle>Data & Analysis Settings</CardTitle>
                <CardDescription>
                  Configure data sources and analysis parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <label className="font-medium">Primary Data Source</label>
                  <Select value={dataSource} onValueChange={setDataSource}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select data source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kaggle">Kaggle API (Current)</SelectItem>
                      <SelectItem value="yahoo">Yahoo Finance</SelectItem>
                      <SelectItem value="alpha">Alpha Vantage</SelectItem>
                      <SelectItem value="custom">Custom API</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Current source: Kaggle API with credentials (configured)
                  </p>
                </div>
                
                <div className="space-y-3">
                  <label className="font-medium">AI Model Preferences</label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Default Prediction Timeframe</span>
                      <Select defaultValue="7d">
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Select timeframe" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7d">7 Days</SelectItem>
                          <SelectItem value="14d">14 Days</SelectItem>
                          <SelectItem value="30d">30 Days</SelectItem>
                          <SelectItem value="90d">90 Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Training Epochs</span>
                      <Select defaultValue="100">
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Select epochs" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                          <SelectItem value="200">200</SelectItem>
                          <SelectItem value="500">500</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <label className="font-medium">Data Management</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" onClick={handleClearCache}>Clear Local Cache</Button>
                    <Button variant="outline">Export Settings</Button>
                    <Button variant="outline">Import Settings</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure how and when you receive alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">Enable Notifications</label>
                    <p className="text-sm text-muted-foreground">
                      Show in-app notifications for events and alerts
                    </p>
                  </div>
                  <Switch 
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">AI Prediction Alerts</label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when AI prediction models are updated
                    </p>
                  </div>
                  <Switch 
                    checked={predictionAlerts}
                    onCheckedChange={setPredictionAlerts}
                    disabled={!notifications}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">Pattern Detection Alerts</label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when patterns are detected in stocks you follow
                    </p>
                  </div>
                  <Switch 
                    checked={patternAlerts}
                    onCheckedChange={setPatternAlerts}
                    disabled={!notifications}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <label className="font-medium">Email Notifications</label>
                  <div className="flex items-center space-x-3">
                    <input 
                      type="email" 
                      placeholder="Enter your email" 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    />
                    <Button>Save</Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Note: Email notifications require a verified email address
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="account">
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account and credentials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <label className="font-medium">API Keys</label>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-muted-foreground">Kaggle API Key</label>
                      <div className="flex items-center mt-1">
                        <input 
                          type="password" 
                          value="••••••••••••••••••••••" 
                          readOnly
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background mr-2"
                        />
                        <Button variant="outline" size="sm">Update</Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Status: Connected</p>
                    </div>
                    
                    <div>
                      <label className="text-sm text-muted-foreground">Google Vertex AI Credentials</label>
                      <div className="flex items-center mt-1">
                        <input 
                          type="password" 
                          value="••••••••••••••••••••••" 
                          readOnly
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background mr-2"
                        />
                        <Button variant="outline" size="sm">Update</Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Status: Connected</p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="pt-2 flex items-center justify-between">
                  <Button variant="destructive">Delete All User Data</Button>
                  <Button variant="default" className="flex items-center" onClick={handleResetSettings}>
                    Reset to Defaults
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end">
          <Button className="flex items-center" onClick={handleSaveSettings}>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
        
        {/* Settings explanation */}
        <div className="p-3 bg-muted/30 rounded-md">
          <h4 className="text-sm font-medium mb-2">About Settings</h4>
          <p className="text-xs text-muted-foreground">
            The settings panel allows you to customize your experience with MarketAI. 
            Appearance settings control the visual aspects of the application, including theme and chart preferences. 
            Data & Analysis settings manage how the app connects to data sources and configures AI models. 
            Notification settings let you control alerts for important events like prediction updates and pattern detections.
            Account settings manage your API credentials and user data. All settings are stored locally on your device.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
