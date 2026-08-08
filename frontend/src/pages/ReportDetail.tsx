import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Activity, User, Calendar, FileText, Play, Square } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ReportData {
  id: number;
  filename: string;
  upload_date: string;
  summary: string;
  voice_script?: string;
  structured_data: {
    patient?: {
      name?: string;
      age?: number;
      gender?: string;
    };
    report_date?: string;
    parameters?: Array<{
      name: string;
      value: number | string;
      unit: string;
      reference_range: string;
      status: string;
    }>;
  };
}

export default function ReportDetail() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handlePlayVoice = () => {
    if (!report?.voice_script) return;
    
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(report.voice_script);
    
    // Try to find an Indian English or Tamil voice for better Tanglish pronunciation
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes('ta') || v.lang.includes('en-IN')) || voices[0];
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/reports/${id}`);
        if (!res.ok) {
          throw new Error('Report not found');
        }
        const data = await res.json();
        setReport(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 font-medium mb-4">{error || 'Report not found'}</p>
        <Link to="/reports" className="text-blue-600 hover:underline">
          Back to Reports
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      <header className="flex items-center space-x-4">
        <Link to="/reports" className="p-2 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Report Analysis</h1>
          <p className="text-slate-500 mt-1">{report.filename} • Uploaded on {new Date(report.upload_date).toLocaleDateString()}</p>
        </div>
      </header>

      {/* Patient Info Card */}
      {report.structured_data?.patient && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center space-x-6">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{report.structured_data.patient.name || 'Unknown Patient'}</h3>
            <div className="flex space-x-4 mt-1 text-sm text-slate-500">
              {report.structured_data.patient.age && <span>Age: {report.structured_data.patient.age}</span>}
              {report.structured_data.patient.gender && <span>Gender: {report.structured_data.patient.gender}</span>}
              {report.structured_data.report_date && (
                <span className="flex items-center"><Calendar className="w-4 h-4 mr-1"/> {report.structured_data.report_date}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Summary */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <FileText className="w-32 h-32 text-blue-600" />
        </div>
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center">
            <Activity className="w-6 h-6 text-blue-600 mr-2" />
            AI Summary
          </h2>
          
          {report.voice_script && (
            <button 
              onClick={handlePlayVoice}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full font-medium transition-colors shadow-sm ${
                isPlaying ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isPlaying ? (
                <>
                  <Square className="w-4 h-4" fill="currentColor" />
                  <span>Stop Explanation</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" fill="currentColor" />
                  <span>Listen in Tamil & English</span>
                </>
              )}
            </button>
          )}
        </div>

        <div className="prose prose-slate max-w-none">
          <ReactMarkdown>{report.summary}</ReactMarkdown>
        </div>
      </div>

      {/* Detailed Parameters */}
      {report.structured_data?.parameters && report.structured_data.parameters.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <h2 className="text-lg font-bold text-slate-900">Test Parameters</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 font-medium text-slate-500 border-b border-slate-100">Test Name</th>
                  <th className="px-6 py-4 font-medium text-slate-500 border-b border-slate-100">Value</th>
                  <th className="px-6 py-4 font-medium text-slate-500 border-b border-slate-100">Reference Range</th>
                  <th className="px-6 py-4 font-medium text-slate-500 border-b border-slate-100">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report.structured_data.parameters.map((param, idx) => {
                  let statusColor = "bg-slate-100 text-slate-700";
                  let statusText = "Unknown";
                  
                  if (param.status === 'within_range') {
                    statusColor = "bg-green-100 text-green-700";
                    statusText = "Normal";
                  } else if (param.status === 'above_range' || param.status === 'below_range') {
                    statusColor = "bg-red-100 text-red-700";
                    statusText = "Out of Range";
                  }

                  return (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{param.name}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{param.value} {param.unit}</td>
                      <td className="px-6 py-4 text-slate-500">{param.reference_range}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                          {statusText}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
