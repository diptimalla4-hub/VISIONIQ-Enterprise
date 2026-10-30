import React, { useState, useEffect } from 'react';
import { Inspection, InspectionProfile, SampleMediaItem, DetectedObject } from '../types/index.ts';
import { api } from '../services/api.ts';
import { InspectionCanvas } from '../components/InspectionCanvas.tsx';
import { UploadDropzone } from '../components/UploadDropzone.tsx';
import { SeverityBadge } from '../components/SeverityBadge.tsx';
import { exportInspectionToPDF } from '../utils/pdfExport.ts';
import { Sparkles, Sliders, FileText, CheckCircle2, AlertTriangle, RefreshCw, Download, Layers, ShieldCheck, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface InspectPageProps {
  samples: SampleMediaItem[];
  preloadedInspection?: Inspection | null;
  onClearPreloaded?: () => void;
}

const PROFILES: InspectionProfile[] = [
  {
    id: 'industrial-defect',
    name: 'Industrial Surface & Weld Integrity',
    domain: 'Industrial Manufacturing',
    sensitivity: 'High',
    focusAreas: ['Weld seam micro-cracks', 'Porosity clusters', 'Thermal discoloration', 'Bead misalignment'],
    description: 'Calibrated for aerospace, automotive, and heavy fabrication quality assurance.'
  },
  {
    id: 'infrastructure-crack',
    name: 'Civil Structural Crack & Spalling',
    domain: 'Infrastructure & Safety',
    sensitivity: 'High',
    focusAreas: ['Tensile shear cracks', 'Concrete spalling', 'Rebar corrosion leaching', 'Aperture > 1.0mm'],
    description: 'Designed for bridge piers, roadways, tunnels, and reinforced load-bearing concrete.'
  },
  {
    id: 'ppe-safety',
    name: 'Workplace Safety & PPE Compliance',
    domain: 'Infrastructure & Safety',
    sensitivity: 'Medium',
    focusAreas: ['Hardhat detection', 'High-vis safety vest', 'Eye protection', 'Perimeter barrier interlocks'],
    description: 'Verifies OSHA / ISO 45001 personal protective equipment adherence in active plant cells.'
  },
  {
    id: 'retail-package',
    name: 'Retail Planogram & Package Quality',
    domain: 'Retail & Inventory',
    sensitivity: 'Medium',
    focusAreas: ['Crushed package corners', 'Torn seal integrity', 'Facing misalignment', 'Barcode obscuration'],
    description: 'Audits supermarket shelf facing and flags unsellable inventory packaging.'
  }
];

export const InspectPage: React.FC<InspectPageProps> = ({ samples, preloadedInspection, onClearPreloaded }) => {
  const { user } = useAuth();
  const [selectedProfile, setSelectedProfile] = useState<InspectionProfile>(PROFILES[0]);
  const [mediaBase64, setMediaBase64] = useState<string>('');
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);

  const [sensitivity, setSensitivity] = useState<'Low' | 'Medium' | 'High'>('High');
  const [model, setModel] = useState<string>('gemini-2.5-flash');
  const [customNotes, setCustomNotes] = useState<string>('');

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentInspection, setCurrentInspection] = useState<Inspection | null>(null);
  const [highlightedObjectIndex, setHighlightedObjectIndex] = useState<number | null>(null);

  // If a preloaded inspection was passed (e.g. from Dashboard or History)
  useEffect(() => {
    if (preloadedInspection) {
      setCurrentInspection(preloadedInspection);
      setPreviewUrl(preloadedInspection.mediaUrl);
      const matchProfile = PROFILES.find((p) => p.domain === preloadedInspection.domain) || PROFILES[0];
      setSelectedProfile(matchProfile);
    }
  }, [preloadedInspection]);

  // Handle media selection from dropzone
  const handleMediaSelected = (
    base64: string,
    mime: string,
    preview: string,
    sampleInfo?: SampleMediaItem
  ) => {
    setMediaBase64(base64);
    setMimeType(mime);
    setPreviewUrl(preview);
    setError(null);
    setCurrentInspection(null);

    if (sampleInfo) {
      setSelectedSampleId(sampleInfo.id);
      const matched = PROFILES.find((p) => p.domain === sampleInfo.domain);
      if (matched) setSelectedProfile(matched);
    } else {
      setSelectedSampleId(null);
    }
  };

  // Run the AI inspection analysis
  const handleAnalyze = async () => {
    if (!mediaBase64 && !previewUrl) {
      setError('Please select or upload an inspection asset before executing analysis.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Check if we need to fetch the sample base64 if it's a URL
      let payloadBase64 = mediaBase64;
      if (!payloadBase64 && previewUrl) {
        const res = await fetch(previewUrl);
        const blob = await res.blob();
        const reader = new FileReader();
        payloadBase64 = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }

      const response = await api.analyzeVisualAsset({
        domain: selectedProfile.domain,
        mediaBase64: payloadBase64,
        mimeType: mimeType || 'image/jpeg',
        sensitivity,
        model,
        focusAreas: selectedProfile.focusAreas,
        customNotes
      });

      setCurrentInspection(response.inspection);
    } catch (err: any) {
      console.error('Inspection analysis error:', err);
      setError(err.message || 'Inspection failed. Please check backend service connectivity.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetStudio = () => {
    setMediaBase64('');
    setPreviewUrl('');
    setCurrentInspection(null);
    setSelectedSampleId(null);
    setError(null);
    if (onClearPreloaded) onClearPreloaded();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <span>GEMINI VISION ENGINE</span>
            <span className="text-slate-600">·</span>
            <span>MODEL: {model}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Live AI Inspection Studio</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated defect localization, sub-millimeter bounding annotation, and compliance audit
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentInspection && (
            <button
              onClick={() => exportInspectionToPDF(currentInspection)}
              className="px-3.5 py-2 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md transition-colors flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export PDF Report</span>
            </button>
          )}

          <button
            onClick={resetStudio}
            className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-md transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Studio</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Split: Ingestion & Configuration Left, Canvas & Report Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Visual Ingestion & Calibration */}
        <div className="lg:col-span-5 space-y-6">
          {/* Step 1: Visual Ingestion Hub */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
                1. Visual Ingestion Source
              </label>
              {previewUrl && (
                <span className="text-[11px] text-cyan-400 font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Asset Loaded
                </span>
              )}
            </div>

            <UploadDropzone
              onMediaSelected={handleMediaSelected}
              samples={samples}
              selectedSampleId={selectedSampleId}
            />
          </div>

          {/* Step 2: Inspection Profile Selector */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
                2. Inspection Profile
              </label>
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
            </div>

            <div className="space-y-2">
              {PROFILES.map((profile) => {
                const isSelected = selectedProfile.id === profile.id;
                return (
                  <div
                    key={profile.id}
                    onClick={() => setSelectedProfile(profile)}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-cyan-500/80 bg-cyan-950/20'
                        : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200">{profile.name}</span>
                      <span className="text-[10px] font-mono text-cyan-400">{profile.domain}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{profile.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2 text-[10px] text-slate-500">
                      {profile.focusAreas.map((f) => (
                        <span key={f} className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 3: Parameters & Trigger */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-5 space-y-4 text-xs">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold block">
              3. Detection Parameters
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Sensitivity Threshold</label>
                <select
                  value={sensitivity}
                  onChange={(e) => setSensitivity(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="High">High (Sub-millimeter Recall)</option>
                  <option value="Medium">Medium (Balanced)</option>
                  <option value="Low">Low (Major Structural Only)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Vision AI Model</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                >
                  <option value="gemini-2.5-flash">gemini-2.5-flash (Standard)</option>
                  <option value="gemini-3.8-flash">gemini-3.8-flash (Ultra Precision)</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-950/30 border border-rose-900/60 rounded text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || (!mediaBase64 && !previewUrl)}
              className="w-full py-3 px-4 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-slate-950 font-bold rounded-lg shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Gemini Vision Telemetry...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Execute Visual AI Inspection</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Visual Canvas & Diagnostic Report */}
        <div className="lg:col-span-7 space-y-6">
          {/* Visual Canvas Display */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
                Visual Inspection Viewport
              </label>
              {currentInspection && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono text-cyan-400 font-semibold">
                    VIQ-{String(currentInspection.id).padStart(5, '0')}
                  </span>
                  <span className="text-slate-600">·</span>
                  <SeverityBadge severity={currentInspection.severity} />
                </div>
              )}
            </div>

            {previewUrl ? (
              <InspectionCanvas
                mediaUrl={previewUrl}
                detectedObjects={currentInspection?.rawAiResponse?.detectedObjects || []}
                anomalyDetected={currentInspection?.anomalyDetected}
                severity={currentInspection?.severity}
                highlightedIndex={highlightedObjectIndex}
                onSelectObject={(idx) => setHighlightedObjectIndex(idx)}
              />
            ) : (
              <div className="w-full h-[420px] bg-slate-900/40 border-2 border-dashed border-slate-800 rounded-lg flex flex-col items-center justify-center p-6 text-center text-slate-500">
                <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 mb-3">
                  <Sparkles className="w-6 h-6 text-cyan-500" />
                </div>
                <h3 className="text-sm font-semibold text-slate-300 mb-1">Awaiting Inspection Media</h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  Select a preset inspection feed on the left or drop an image to initialize the high-precision detection viewport.
                </p>
              </div>
            )}
          </div>

          {/* AI Diagnostic Output Report */}
          {currentInspection && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-6 space-y-6 text-xs animate-in fade-in duration-300">
              {/* Summary Header Band */}
              <div
                className={`p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  currentInspection.anomalyDetected
                    ? 'bg-rose-950/20 border-rose-900/50 text-rose-200'
                    : 'bg-emerald-950/20 border-emerald-900/50 text-emerald-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {currentInspection.anomalyDetected ? (
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h3 className="text-sm font-bold tracking-tight">
                      {currentInspection.anomalyDetected
                        ? `Defect Detected · Severity: ${currentInspection.severity}`
                        : 'Inspection Passed · All Parameters Nominal'}
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                      {currentInspection.summary}
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0 font-mono">
                  <span className="text-xl font-bold text-white tabular-nums">
                    {currentInspection.confidenceScore}%
                  </span>
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider">
                    Model Confidence
                  </span>
                </div>
              </div>

              {/* Detected Features List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-mono uppercase tracking-wider text-slate-300 font-semibold text-[11px]">
                    Detected Objects & Normalized Coordinates
                  </h4>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {currentInspection.rawAiResponse?.detectedObjects?.length || 0} Targets Found
                  </span>
                </div>

                <div className="space-y-2">
                  {(currentInspection.rawAiResponse?.detectedObjects || []).map((obj, i) => {
                    const isHighlighted = highlightedObjectIndex === i;
                    return (
                      <div
                        key={i}
                        onMouseEnter={() => setHighlightedObjectIndex(i)}
                        onMouseLeave={() => setHighlightedObjectIndex(null)}
                        className={`p-3 rounded border transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                          isHighlighted
                            ? 'bg-cyan-950/30 border-cyan-500/80'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-200">{obj.label}</span>
                            <span className="text-slate-600">·</span>
                            <SeverityBadge severity={obj.severity || currentInspection.severity} />
                          </div>
                          {obj.details && <p className="text-slate-400 text-[11px] mt-0.5">{obj.details}</p>}
                        </div>

                        <div className="text-right shrink-0 font-mono tabular-nums text-slate-400 text-[11px]">
                          <span className="text-slate-200 font-semibold">{obj.confidence}% match</span>
                          <span className="block text-slate-600 font-mono text-[10px]">
                            [{obj.box2d.join(', ')}]
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Category Metrics */}
              {currentInspection.rawAiResponse?.categoryMetrics && (
                <div className="space-y-2">
                  <h4 className="font-mono uppercase tracking-wider text-slate-300 font-semibold text-[11px]">
                    Technical Dimensions & Verification Metrics
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Object.entries(currentInspection.rawAiResponse.categoryMetrics).map(([k, v]) => (
                      <div key={k} className="p-2.5 rounded bg-slate-950/40 border border-slate-800">
                        <span className="text-slate-500 text-[11px] block truncate">{k}</span>
                        <span className="font-mono text-slate-200 font-medium text-xs mt-0.5 block truncate">
                          {String(v)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Remediation Action Plan */}
              <div className="space-y-2">
                <h4 className="font-mono uppercase tracking-wider text-slate-300 font-semibold text-[11px]">
                  Remediation Action Plan & Compliance Next Steps
                </h4>
                <ul className="space-y-1.5 p-3 rounded bg-slate-950/40 border border-slate-800">
                  {(currentInspection.rawAiResponse?.recommendations || []).map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-300">
                      <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Report Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
                <div className="text-[11px] text-slate-500 font-mono">
                  Audit Log VIQ-{String(currentInspection.id).padStart(5, '0')} permanently archived in PostgreSQL
                </div>
                <button
                  onClick={() => exportInspectionToPDF(currentInspection)}
                  className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download PDF Audit Certificate</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
