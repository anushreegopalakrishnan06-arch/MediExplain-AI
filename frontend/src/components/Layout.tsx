import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, FileText, Heart, Home, LogOut } from 'lucide-react';
import ToeChatWidget from './ToeChatWidget';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <Home className="w-5 h-5" /> },
    { name: 'Reports', path: '/reports', icon: <FileText className="w-5 h-5" /> },
    { name: 'My Wellness', path: '/wellness', icon: <Heart className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="p-6 flex items-center gap-3">
          <Activity className="text-blue-600 w-8 h-8" />
          <span className="text-xl font-bold text-slate-800">HealthLens AI</span>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 font-medium' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-200">
          {user && (
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-800">{user.name}</span>
                <span className="text-xs text-slate-500 truncate w-32">{user.email}</span>
              </div>
              <button onClick={logout} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="text-blue-600 w-6 h-6" />
            <span className="font-bold text-slate-800">HealthLens AI</span>
          </div>
          {user && (
            <button onClick={logout} className="p-2 text-slate-500 hover:text-red-600 rounded-lg transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
      
      {/* Toe Chat Widget */}
      <ToeChatWidget />
    </div>
  );
}
