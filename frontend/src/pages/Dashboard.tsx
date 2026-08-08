import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!file) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/reports/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      if (data.status === 'success' && data.report_id) {
        navigate(`/reports/${data.report_id}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload and analyze the report. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Welcome back, Lakshmi</h1>
        <p className="text-slate-500 mt-1">Upload a medical report to get AI-powered insights.</p>
      </header>

      {/* Upload Section */}
      <div 
        className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center transition-all ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.jpg,.jpeg,.png"
        />
        
        {file ? (
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">{file.name}</p>
              <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button 
              onClick={handleAnalyze}
              disabled={isUploading}
              className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <span>Analyze Report</span>
              )}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center space-y-4 cursor-pointer">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-2">
              <UploadCloud className="w-10 h-10" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-lg">Click or drag your report here</p>
              <p className="text-slate-500 text-sm mt-1">Supports PDF, JPG, PNG up to 10MB</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
