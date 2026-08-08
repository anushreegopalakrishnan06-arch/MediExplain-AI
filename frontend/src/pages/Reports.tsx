import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ReportInfo {
  id: number;
  filename: string;
  upload_date: string;
}

export default function Reports() {
  const [reports, setReports] = useState<ReportInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch('/api/reports', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setReports(data);
        }
      } catch (error) {
        console.error('Failed to fetch reports', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Your Reports</h1>
        <p className="text-slate-500 mt-1">View your past medical reports and analyses.</p>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
          <p className="text-slate-500 text-center py-10">No reports uploaded yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <Link 
              key={report.id} 
              to={`/reports/${report.id}`}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {report.filename}
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">
                    Uploaded on {new Date(report.upload_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
