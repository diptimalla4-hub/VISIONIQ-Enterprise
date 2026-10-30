import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Eye, Shield, Lock, Mail, User as UserIcon, ArrowRight, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  navigate: (route: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ navigate }) => {
  const { login, register, quickDemoLogin, isLoading } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Inspector' | 'Admin' | 'Viewer'>('Inspector');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password, role);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleDemo = async (demoEmail: string) => {
    setError(null);
    try {
      await quickDemoLogin(demoEmail);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto mb-3">
            <Eye className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {mode === 'login' ? 'Sign in to VisionIQ' : 'Create Enterprise Account'}
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            JWT-secured visual inspection and anomaly intelligence console
          </p>
        </div>

        {/* 1-Click Quick Demo Sign In Cards */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-cyan-400 font-semibold uppercase text-[11px]">
              Fast Access (Demo Credentials)
            </span>
            <span className="text-slate-500 text-[11px]">Click to auto-authenticate</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemo('admin@visioniq.io')}
              className="p-2 rounded border border-slate-800 bg-slate-950/60 hover:border-cyan-500/60 text-left transition-colors"
            >
              <div className="text-xs font-semibold text-white">Admin</div>
              <div className="text-[10px] text-slate-400 truncate">Dr. S. Lin</div>
            </button>

            <button
              type="button"
              onClick={() => handleDemo('inspector@visioniq.io')}
              className="p-2 rounded border border-slate-800 bg-slate-950/60 hover:border-cyan-500/60 text-left transition-colors"
            >
              <div className="text-xs font-semibold text-white">Inspector</div>
              <div className="text-[10px] text-slate-400 truncate">M. Vance</div>
            </button>

            <button
              type="button"
              onClick={() => handleDemo('viewer@visioniq.io')}
              className="p-2 rounded border border-slate-800 bg-slate-950/60 hover:border-cyan-500/60 text-left transition-colors"
            >
              <div className="text-xs font-semibold text-white">Viewer</div>
              <div className="text-[10px] text-slate-400 truncate">E. Rostova</div>
            </button>
          </div>
        </div>

        {/* Auth Form Card */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-6 space-y-6">
          {/* Mode Switch Tabs */}
          <div className="flex p-1 bg-slate-950 rounded border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex-1 py-1.5 font-medium rounded transition-colors ${
                mode === 'login' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`flex-1 py-1.5 font-medium rounded transition-colors ${
                mode === 'register' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/30 border border-rose-900/60 rounded text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {mode === 'register' && (
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Chen"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-slate-400 mb-1 font-medium">RBAC Operational Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Inspector">Inspector (Execute AI Inspections & Log Audits)</option>
                  <option value="Admin">Admin (Full System & Organization Control)</option>
                  <option value="Viewer">Viewer (Read-Only Audit Trail & Compliance Reports)</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold rounded transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              <span>{mode === 'login' ? 'Authenticate Session' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
