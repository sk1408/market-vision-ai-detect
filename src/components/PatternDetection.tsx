
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { detectPattern } from '../services/vertexAIService';

interface PatternDetectionProps {
  onAnalyze: (file: File | null, chartId?: string) => Promise<void>;
  isLoading?: boolean;
}

const PatternDetection: React.FC<PatternDetectionProps> = ({ onAnalyze, isLoading = false }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.includes('image')) {
        setSelectedFile(file);
      } else {
        toast.error('Please upload an image file');
      }
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
    }
  };
  
  const handleAnalyze = async () => {
    try {
      await onAnalyze(selectedFile);
      toast.success('Analysis complete');
    } catch (error) {
      toast.error('Failed to analyze pattern');
      console.error(error);
    }
  };
  
  return (
    <Card className="bg-card border border-border">
      <CardHeader>
        <CardTitle>Pattern Detection</CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className={`border-2 border-dashed rounded-lg p-6 mb-4 text-center cursor-pointer transition-colors ${
            dragActive ? 'border-primary bg-secondary/30' : 'border-border hover:border-primary/50'
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
          <p className="mb-2 text-sm text-muted-foreground">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-muted-foreground">PNG, JPG or JPEG (MAX. 5MB)</p>
          
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          
          {selectedFile && (
            <div className="mt-4 text-left">
              <div className="flex items-center justify-between py-2 px-3 bg-muted rounded-md">
                <span className="text-sm truncate max-w-[80%]">{selectedFile.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex space-x-4">
          <Button 
            onClick={handleAnalyze} 
            disabled={!selectedFile || isLoading} 
            className="flex-1"
          >
            {isLoading ? 'Analyzing...' : 'Analyze Pattern'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              onAnalyze(null, 'current');
            }}
            disabled={isLoading}
            className="flex-1"
          >
            Analyze Current Chart
          </Button>
        </div>
        
        <div className="mt-6">
          <h3 className="font-medium mb-2">Pattern Detection Results</h3>
          <div className="pattern-placeholder h-[100px] flex items-center justify-center bg-muted/30 rounded-md">
            {isLoading ? (
              <p className="text-muted-foreground">Analyzing pattern with Google Vertex AI...</p>
            ) : (
              <p className="text-muted-foreground">Upload an image or analyze current chart to see results</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatternDetection;
