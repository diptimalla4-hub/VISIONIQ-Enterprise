import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Shield, User as UserIcon, Cpu, Database, Key, CheckCircle2, Sliders, LogOut } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, quickDemoLogin, logout } = useAuth();
  const [modelChoice, setModelChoice] = useState('gemini-2.5-flash');
  const [autoArchive, setAutoArchive] = useState(true);
  const [confidenceFloor, setConfidenceFloor] = useState(85);

  const roles = [
    {
      role: 'Admin',
      description: 'Complete platform administration, global inspection deletion, user management, and API configuration.',
      permissions: ['Read all inspections', 'Trigger AI analysis', 'Delete any audit log', 'Manage organization profiles']
    },
    {
      role: 'Inspector',
      description: 'Conduct visual inspections, log automated anomaly detections, view team reports, and export PDF certificates.',
      permissions: ['Read team inspections', 'Trigger AI analysis', 'Export CSV & PDF reports', 'Delete own inspections']
    },
    {
      role: 'Viewer',
      description: 'Audit compliance access with read-only permissions on completed inspection trails.',
      permissions: ['Read completed inspections', 'Export CSV & PDF reports', 'Cannot trigger analysis', 'Cannot delete records']
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
          <span>SYSTEM CONFIGURATION</span>
          <span className="text-slate-600">·</span>
          <span>ENTERPRISE RBAC</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Profile & Platform Settings</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage identity, operational role access permissions, and Gemini Vision hyperparameters
        </p>
      </div>

      {/* User Identity & Active Role */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">{user?.name || 'Authorized User'}</h3>
              <p className="text-xs text-slate-400">{user?.email || 'admin@visioniq.io'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono rounded">
              Active Role: {user?.role || 'Inspector'}
            </span>
            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Persona Switcher for Evaluation */}
        <div>
          <span className="text-xs font-semibold text-slate-300 block mb-2 font-mono uppercase tracking-wider text-[11px]">
            Switch Operational Persona (Demo RBAC Testing)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              onClick={() => quickDemoLogin('admin@visioniq.io')}
              className={`p-3 rounded border text-left transition-colors ${
                user?.role === 'Admin'
                  ? 'border-cyan-500 bg-cyan-950/20'
                  : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
              }`}
            >
              <div className="text-xs font-bold text-white">Dr. Sarah Lin</div>
              <div className="text-[11px] text-cyan-400 font-mono">Role: Admin</div>
              <div className="text-[10px] text-slate-500 mt-1">Full system privilege</div>
            </button>

            <button
              onClick={() => quickDemoLogin('inspector@visioniq.io')}
              className={`p-3 rounded border text-left transition-colors ${
                user?.role === 'Inspector'
                  ? 'border-cyan-500 bg-cyan-950/20'
                  : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
              }`}
            >
              <div className="text-xs font-bold text-white">Marcus Vance</div>
              <div className="text-[11px] text-amber-400 font-mono">Role: Inspector</div>
              <div className="text-[10px] text-slate-500 mt-1">Execute inspections</div>
            </button>

            <button
              onClick={() => quickDemoLogin('viewer@visioniq.io')}
              className={`p-3 rounded border text-left transition-colors ${
                user?.role === 'Viewer'
                  ? 'border-cyan-500 bg-cyan-950/20'
                  : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
              }`}
            >
              <div className="text-xs font-bold text-white">Elena Rostova</div>
              <div className="text-[11px] text-emerald-400 font-mono">Role: Viewer</div>
              <div className="text-[10px] text-slate-500 mt-1">Audit compliance viewer</div>
            </button>
          </div>
        </div>
      </div>

      {/* Role-Based Access Control (RBAC) Matrix */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-white">Role-Based Access Matrix</h3>
            <p className="text-xs text-slate-400">Enforced strictly via JWT claims and PostgreSQL RLS queries</p>
          </div>
          <Shield className="w-4 h-4 text-slate-500" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {roles.map((r) => (
            <div key={r.role} className="p-4 bg-slate-950/40 border border-slate-800 rounded-lg space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">{r.role}</span>
                {user?.role === r.role && (
                  <span className="text-[10px] text-cyan-400 font-mono">CURRENT USER</span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{r.description}</p>
              <div className="pt-2 border-t border-slate-800/80 space-y-1">
                {r.permissions.map((p, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                    <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Vision Model & Hyperparameters */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-6 space-y-4 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-white">Vision Engine Parameters</h3>
            <p className="text-xs text-slate-400">Google Gemini Multimodal Vision SDK configuration</p>
          </div>
          <Cpu className="w-4 h-4 text-slate-500" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Default Inspection Model</label>
            <select
              value={modelChoice}
              onChange={(e) => setModelChoice(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-cyan-500"
            >
              <option value="gemini-2.5-flash">gemini-2.5-flash (Fast multimodal detection)</option>
              <option value="gemini-3.8-flash">gemini-3.8-flash (Ultra-fine reasoning & coordinate accuracy)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Confidence Floor Filter: {confidenceFloor}%</label>
            <input
              type="range"
              min="50"
              max="99"
              value={confidenceFloor}
              onChange={(e) => setConfidenceFloor(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-400 mt-2"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
              <span>50% (Loose)</span>
              <span>85% (Optimal)</span>
              <span>99% (Strict)</span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="font-semibold text-slate-200 block">Immutable Audit Archiving</span>
            <span className="text-slate-400 text-[11px]">
              Automatically commit each AI analysis and raw bounding payload to PostgreSQL
            </span>
          </div>
          <button
            onClick={() => setAutoArchive(!autoArchive)}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              autoArchive ? 'bg-cyan-500' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                autoArchive ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* System Infrastructure Telemetry */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-6 space-y-3 text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 className="text-sm font-semibold text-white">System Infrastructure Telemetry</h3>
          <Database className="w-4 h-4 text-slate-500" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-[11px] pt-1">
          <div className="p-2.5 bg-slate-950/40 rounded border border-slate-800">
            <span className="text-slate-500 block">Database Engine</span>
            <span className="text-emerald-400 font-semibold">PostgreSQL Relational / RLS</span>
          </div>

          <div className="p-2.5 bg-slate-950/40 rounded border border-slate-800">
            <span className="text-slate-500 block">Authentication</span>
            <span className="text-cyan-400 font-semibold">JWT + Bcrypt (HS256)</span>
          </div>

          <div className="p-2.5 bg-slate-950/40 rounded border border-slate-800">
            <span className="text-slate-500 block">Inference Gateway</span>
            <span className="text-cyan-400 font-semibold">@google/genai (v2.32)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
