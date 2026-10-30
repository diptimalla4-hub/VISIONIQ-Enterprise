import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Eye, LogOut, User as UserIcon, Shield, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentRoute: string;
  navigate: (route: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, navigate }) => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 text-left text-slate-100 hover:text-white transition-colors whitespace-nowrap shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Eye className="w-4 h-4" />
          </div>
          <span className="text-base font-semibold tracking-tight">VisionIQ Enterprise</span>
        </button>

        {/* Zone 2: 4-5 Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-400">
          <button
            onClick={() => navigate('/')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              currentRoute === '/' ? 'text-white' : 'hover:text-slate-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              currentRoute === '/dashboard' ? 'text-white' : 'hover:text-slate-200'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate('/inspect')}
            className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              currentRoute === '/inspect' ? 'text-cyan-400 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Inspect Studio
          </button>
          <button
            onClick={() => navigate('/history')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              currentRoute === '/history' ? 'text-white' : 'hover:text-slate-200'
            }`}
          >
            Audit History
          </button>
          <button
            onClick={() => navigate('/settings')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              currentRoute === '/settings' ? 'text-white' : 'hover:text-slate-200'
            }`}
          >
            Settings
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action / User Profile */}
        <div className="flex items-center gap-3 shrink-0">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 border border-slate-800 bg-slate-900/60 px-2.5 py-1.5 rounded-md">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-medium text-slate-200">{user.name}</span>
                <span className="text-slate-600">·</span>
                <span className="text-cyan-400">{user.role}</span>
              </div>
              <button
                onClick={logout}
                title="Log out"
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
