import { useEffect, useState } from 'react';
import { Activity, Moon, Utensils, Apple, Dumbbell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface LifestylePlan {
  sleep_cycle?: string;
  food_habits?: string;
  diet?: string;
  exercises?: string;
}

const API_URL = import.meta.env.VITE_API_URL || '';

export default function Wellness() {
  const [loading, setLoading] = useState(true);
  const [lifestylePlan, setLifestylePlan] = useState<LifestylePlan | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchLatestWellness = async () => {
      try {
        const listRes = await fetch(`${API_URL}/api/reports`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!listRes.ok) throw new Error('Failed to fetch reports list');
        const reportsList = await listRes.json();
        
        if (reportsList && reportsList.length > 0) {
          // Get the most recent report (assuming backend sorts by date descending)
          const latestId = reportsList[0].id;
          const detailRes = await fetch(`${API_URL}/api/reports/${latestId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (detailRes.ok) {
            const detailData = await detailRes.json();
            if (detailData.structured_data?.lifestyle_plan) {
              setLifestylePlan(detailData.structured_data.lifestyle_plan);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching wellness data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLatestWellness();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">My Wellness</h1>
        <p className="text-slate-500 mt-1">General health guidance based on your latest report.</p>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : !lifestylePlan ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-center">
          <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-700 mb-2">No Wellness Data Yet</h2>
          <p className="text-slate-500 mb-6">Upload a medical report to get your personalized lifestyle recommendations.</p>
          <Link to="/" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
            Upload Report
          </Link>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center mb-6">
            <Activity className="w-7 h-7 text-indigo-600 mr-2" />
            Personalized Lifestyle Plan
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {lifestylePlan.sleep_cycle && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-start space-x-4 hover:shadow-md transition-shadow">
                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl shrink-0">
                  <Moon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Sleep Cycle</h3>
                  <p className="text-slate-600 leading-relaxed">{lifestylePlan.sleep_cycle}</p>
                </div>
              </div>
            )}
            
            {lifestylePlan.food_habits && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-start space-x-4 hover:shadow-md transition-shadow">
                <div className="p-3 bg-orange-100 text-orange-600 rounded-xl shrink-0">
                  <Utensils className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Food Habits</h3>
                  <p className="text-slate-600 leading-relaxed">{lifestylePlan.food_habits}</p>
                </div>
              </div>
            )}
            
            {lifestylePlan.diet && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-start space-x-4 hover:shadow-md transition-shadow">
                <div className="p-3 bg-green-100 text-green-600 rounded-xl shrink-0">
                  <Apple className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Diet Recommendations</h3>
                  <p className="text-slate-600 leading-relaxed">{lifestylePlan.diet}</p>
                </div>
              </div>
            )}
            
            {lifestylePlan.exercises && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-start space-x-4 hover:shadow-md transition-shadow">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl shrink-0">
                  <Dumbbell className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Recommended Exercises</h3>
                  <p className="text-slate-600 leading-relaxed">{lifestylePlan.exercises}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
