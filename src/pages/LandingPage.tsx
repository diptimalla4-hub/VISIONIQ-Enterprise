import React from 'react';
import { ArrowRight, ShieldCheck, Cpu, Layers, CheckCircle2, AlertTriangle, Eye, Sparkles } from 'lucide-react';
import { SampleMediaItem } from '../types/index.ts';

interface LandingPageProps {
  navigate: (route: string) => void;
  samples: SampleMediaItem[];
}

export const LandingPage: React.FC<LandingPageProps> = ({ navigate, samples }) => {
  return (
    <div className="w-full space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 pb-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/50 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Computer Vision & Visual Intelligence</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
              Automate visual inspection with <span className="text-cyan-400">sub-millimeter</span> AI precision.
            </h1>

            <p className="text-base text-slate-300 max-w-2xl leading-relaxed">
              VisionIQ Enterprise replaces prone manual inspections with automated multimodal AI.
              Powered by Google Gemini Vision to detect structural fractures, weld imperfections, PPE violations,
              and retail packaging anomalies in real time.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => navigate('/inspect')}
                className="px-6 py-3 text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-lg transition-all flex items-center gap-2"
              >
                <span>Launch Inspect Studio</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate('/dashboard')}
                className="px-5 py-3 text-sm font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
              >
                View Live Operations
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-800/80">
              <div>
                <span className="text-2xl font-bold font-mono text-white tabular-nums">98.4%</span>
                <span className="block text-xs text-slate-400 mt-0.5">Defect Recall Rate</span>
              </div>
              <div>
                <span className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">&lt;1.4s</span>
                <span className="block text-xs text-slate-400 mt-0.5">Inference Latency</span>
              </div>
              <div>
                <span className="text-2xl font-bold font-mono text-white tabular-nums">0-1000</span>
                <span className="block text-xs text-slate-400 mt-0.5">Normalized Coordinate Grid</span>
              </div>
            </div>
          </div>

          {/* Interactive Inspection Hero Preview */}
          <div className="lg:col-span-5">
            <div className="relative rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                <span className="font-mono text-cyan-400">LIVE ENGINE FEED</span>
                <span className="text-slate-400 font-mono text-[11px]">ISO 5817 Level B</span>
              </div>

              <div className="relative mt-3 rounded-lg overflow-hidden border border-slate-800 bg-black aspect-[4/3]">
                <img
                  src="/src/assets/images/inspection_industrial_weld_1793339757303.jpg"
                  alt="Inspection preview"
                  className="w-full h-full object-cover"
                />
                {/* Simulated Bounding Box Overlay */}
                <div
                  style={{ top: '26%', left: '46%', width: '12%', height: '42%' }}
                  className="absolute border-2 border-rose-500 bg-rose-500/20 rounded animate-pulse"
                >
                  <div className="absolute -top-6 left-0 px-1.5 py-0.5 bg-rose-600 text-white font-semibold text-[9px] rounded uppercase tracking-wider whitespace-nowrap">
                    Weld Micro-Fissure · 98.4%
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-slate-950/80 rounded border border-slate-800/80 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Anomaly Identified: Critical
                  </span>
                  <span className="text-slate-400 font-mono">ASTM E1417</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Titanium laser seam shows axial root crack (14.2mm). Immediate quarantine recommended.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Domains Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-xs font-mono uppercase tracking-wider text-cyan-400 mb-2">Target Domains</h2>
          <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Engineered for high-stakes operational environments
          </h3>
          <p className="text-sm text-slate-400 mt-2">
            Pre-calibrated vision profiles designed for specialized computer vision inspection tasks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Domain 1 */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 space-y-4 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h4 className="text-base font-semibold text-white">Industrial Manufacturing</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Detect surface porosity, laser weld micro-fissures, assembly misalignment, and thermal stress discoloration.
            </p>
            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 space-y-1">
              <div>· ASTM E1417 & ISO 5817 standards</div>
              <div>· Sub-millimeter weld bead geometry</div>
            </div>
          </div>

          {/* Domain 2 */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 space-y-4 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-base font-semibold text-white">Infrastructure & Safety</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated civil bridge crack monitoring, road fissures, concrete spalling, and real-time OSHA PPE compliance.
            </p>
            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 space-y-1">
              <div>· Crack propagation measurement</div>
              <div>· 100% PPE vest, helmet & goggles check</div>
            </div>
          </div>

          {/* Domain 3 */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 space-y-4 hover:border-slate-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-base font-semibold text-white">Retail & Inventory</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Audit shelf planogram alignment, detect crushed or damaged packaging, and identify inventory voids.
            </p>
            <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 space-y-1">
              <div>· SKU packaging seal verification</div>
              <div>· Automated markdown alerts</div>
            </div>
          </div>
        </div>
      </section>

      {/* Preset Feeds Quick Test Carousel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Sample Inspection Feeds</h3>
            <p className="text-xs text-slate-400">Evaluate Gemini Vision on calibrated real-world assets</p>
          </div>
          <button
            onClick={() => navigate('/inspect')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            Open Inspect Studio <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {samples.map((s) => (
            <div
              key={s.id}
              onClick={() => navigate('/inspect')}
              className="bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden group cursor-pointer hover:border-slate-700 transition-all flex flex-col"
            >
              <div className="relative aspect-[4/3] bg-black overflow-hidden">
                <img
                  src={s.imageUrl}
                  alt={s.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 backdrop-blur rounded text-[10px] font-mono text-cyan-300">
                  {s.domain}
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">
                    {s.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{s.description}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono">
                  Target: {s.expectedAnomaly}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
