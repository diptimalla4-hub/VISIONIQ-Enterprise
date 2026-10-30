import React, { useEffect, useState } from 'react';
import { AnalyticsSummary, Inspection } from '../types/index.ts';
import { api } from '../services/api.ts';
import { StatsCard } from '../components/StatsCard.tsx';
import { SeverityBadge } from '../components/SeverityBadge.tsx';
import { Eye, AlertTriangle, Video, Activity, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface DashboardPageProps {
  navigate: (route: string) => void;
  onSelectInspection: (inspection: Inspection) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ navigate, onSelectInspection }) => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [recentInspections, setRecentInspections] = useState<Inspection[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [sumData, inspData] = await Promise.all([
          api.getAnalyticsSummary(),
          api.getInspections({ limit: 5 } as any)
        ]);
        setSummary(sumData);
        setRecentInspections(inspData.inspections.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Quick Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <span>OPERATIONAL METRICS CONSOLE</span>
            <span className="text-slate-600">·</span>
            <span>REAL-TIME AUDIT FEED</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Visual Intelligence Operations</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Current inspection throughput and automated anomaly detection telemetry
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/history')}
            className="px-3.5 py-2 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md transition-colors"
          >
            Audit Trail
          </button>
          <button
            onClick={() => navigate('/inspect')}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch Inspect Studio</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Inspections"
          value={summary?.totalInspections ?? 4}
          subtitle="Processed across all domains"
          trend={{ value: '+28% this week', isPositive: true }}
          icon={<Eye className="w-5 h-5 text-cyan-400" />}
        />

        <StatsCard
          title="Anomaly Detection Rate"
          value={`${summary?.anomalyRate ?? 75.0}%`}
          subtitle="Structural defects & deviations"
          trend={{ value: '-2.4% vs last period', isPositive: true }}
          icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}
        />

        <StatsCard
          title="Active Edge Feeds"
          value={summary?.activeCameras ?? 8}
          subtitle="Connected vision probers"
          trend={{ value: 'All synchronized', isNeutral: true }}
          icon={<Video className="w-5 h-5 text-emerald-400" />}
        />

        <StatsCard
          title="System Health"
          value={summary?.systemHealth ?? '99.98%'}
          subtitle="Gemini Vision inference SLA"
          trend={{ value: 'Zero failures', isPositive: true }}
          icon={<Activity className="w-5 h-5 text-cyan-400" />}
        />
      </div>

      {/* Domain Breakdown & Severity Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Domain Categorization */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-semibold text-white">Target Domain Breakdown</h2>
              <p className="text-xs text-slate-400">Inspections and anomaly frequency by sector</p>
            </div>
            <span className="text-xs font-mono text-slate-500">ISO 9001 / OSHA</span>
          </div>

          <div className="space-y-4 pt-1">
            {(summary?.domainBreakdown || [
              { domain: 'Industrial Manufacturing', count: 1, anomalyCount: 1 },
              { domain: 'Infrastructure & Safety', count: 2, anomalyCount: 1 },
              { domain: 'Retail & Inventory', count: 1, anomalyCount: 1 }
            ]).map((d) => {
              const anomalyPct = d.count > 0 ? Math.round((d.anomalyCount / d.count) * 100) : 0;
              return (
                <div key={d.domain} className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-200">{d.domain}</span>
                    <div className="font-mono tabular-nums text-slate-400 text-[11px] flex items-center gap-2">
                      <span>{d.count} inspections</span>
                      <span className="text-slate-600">·</span>
                      <span className={anomalyPct > 0 ? 'text-rose-400 font-semibold' : 'text-emerald-400'}>
                        {anomalyPct}% anomaly rate
                      </span>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${Math.min(100, (d.count / (summary?.totalInspections || 1)) * 100)}%` }}
                      className="bg-cyan-500 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-semibold text-white">Severity Classification</h2>
              <p className="text-xs text-slate-400">Distribution of detected anomaly impact</p>
            </div>
            <span className="text-xs font-mono text-slate-500">Risk Matrix</span>
          </div>

          <div className="space-y-2.5 pt-1">
            {(summary?.severityDistribution || [
              { severity: 'Critical', count: 1 },
              { severity: 'High', count: 1 },
              { severity: 'Medium', count: 1 },
              { severity: 'Low', count: 0 },
              { severity: 'None', count: 1 }
            ]).map((s) => (
              <div
                key={s.severity}
                className="flex items-center justify-between p-2 rounded bg-slate-950/40 border border-slate-800/80 text-xs"
              >
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={s.severity as any} />
                </div>
                <span className="font-mono tabular-nums text-slate-200 font-semibold">
                  {s.count} <span className="text-slate-500 font-normal">audits</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Inspection Feed */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-white">Recent Inspection Audits</h2>
            <p className="text-xs text-slate-400">Latest automated diagnostics performed</p>
          </div>
          <button
            onClick={() => navigate('/history')}
            className="text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>Full Audit Trail</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-800/80">
          {recentInspections.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectInspection(item)}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/30 px-2 rounded cursor-pointer transition-colors"
            >
              <div className="flex items-start gap-3">
                <img
                  src={item.mediaUrl}
                  alt={item.domain}
                  className="w-12 h-12 rounded object-cover border border-slate-800 shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-cyan-400">
                      VIQ-{String(item.id).padStart(5, '0')}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-xs text-slate-300 font-medium">{item.domain}</span>
                    <span className="text-slate-600">·</span>
                    <SeverityBadge severity={item.severity} />
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">{item.summary}</p>
                </div>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="font-mono tabular-nums text-xs font-semibold text-slate-200 block">
                  {item.confidenceScore}% Confidence
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
