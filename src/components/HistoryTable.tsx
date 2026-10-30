import React, { useState } from 'react';
import { Inspection, SeverityLevel } from '../types/index.ts';
import { SeverityBadge } from './SeverityBadge.tsx';
import { exportInspectionToPDF, exportInspectionsToCSV } from '../utils/pdfExport.ts';
import { Search, Download, FileText, Trash2, ExternalLink, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface HistoryTableProps {
  inspections: Inspection[];
  onSelectInspection?: (inspection: Inspection) => void;
  onDeleteInspection?: (id: number) => Promise<void>;
  isLoading?: boolean;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({
  inspections = [],
  onSelectInspection,
  onDeleteInspection,
  isLoading = false
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [selectedAnomaly, setSelectedAnomaly] = useState<'All' | 'Yes' | 'No'>('All');
  const [detailInspection, setDetailInspection] = useState<Inspection | null>(null);

  const filteredInspections = inspections.filter((item) => {
    if (selectedDomain !== 'All' && item.domain !== selectedDomain) return false;
    if (selectedSeverity !== 'All' && item.severity !== selectedSeverity) return false;
    if (selectedAnomaly === 'Yes' && !item.anomalyDetected) return false;
    if (selectedAnomaly === 'No' && item.anomalyDetected) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        item.summary.toLowerCase().includes(q) ||
        item.domain.toLowerCase().includes(q) ||
        (item.userName && item.userName.toLowerCase().includes(q)) ||
        `viq-${item.id}`.includes(q);
      if (!match) return false;
    }
    return true;
  });

  const domains = ['All', 'Industrial Manufacturing', 'Infrastructure & Safety', 'Retail & Inventory'];
  const severities = ['All', 'Critical', 'High', 'Medium', 'Low', 'None'];

  return (
    <div className="w-full space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3.5 rounded-lg">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audits by ID, domain, defect, or inspector..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-md text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Filter Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="text-xs bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            {domains.map((d) => (
              <option key={d} value={d}>
                Domain: {d}
              </option>
            ))}
          </select>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="text-xs bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            {severities.map((s) => (
              <option key={s} value={s}>
                Severity: {s}
              </option>
            ))}
          </select>

          <select
            value={selectedAnomaly}
            onChange={(e) => setSelectedAnomaly(e.target.value as any)}
            className="text-xs bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="All">Anomalies: All</option>
            <option value="Yes">Anomalies Only</option>
            <option value="No">Nominal Only</option>
          </select>

          {/* Export CSV Button */}
          <button
            onClick={() => exportInspectionsToCSV(filteredInspections)}
            disabled={filteredInspections.length === 0}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-mono uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Inspection ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Domain</th>
                <th className="py-3 px-4">Inspector</th>
                <th className="py-3 px-4">Status / Anomaly</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4 text-right">Confidence</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Loading inspection audit records...
                  </td>
                </tr>
              ) : filteredInspections.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No inspection audits found matching the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredInspections.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => {
                      if (onSelectInspection) {
                        onSelectInspection(item);
                      } else {
                        setDetailInspection(item);
                      }
                    }}
                  >
                    <td className="py-3 px-4 font-mono font-medium text-cyan-400 whitespace-nowrap">
                      VIQ-{String(item.id).padStart(5, '0')}
                    </td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap font-mono tabular-nums">
                      {new Date(item.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-4 text-slate-300 whitespace-nowrap">{item.domain}</td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {item.userName || `User #${item.userId}`}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {item.anomalyDetected ? (
                        <span className="inline-flex items-center gap-1.5 text-rose-400">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>Anomaly Detected</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Nominal</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <SeverityBadge severity={item.severity} />
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-300">
                      {item.confidenceScore.toFixed(1)}%
                    </td>
                    <td
                      className="py-3 px-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => exportInspectionToPDF(item)}
                          title="Download PDF Certificate"
                          className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDetailInspection(item)}
                          title="View Audit Details"
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        {(user?.role === 'Admin' || user?.id === item.userId) && onDeleteInspection && (
                          <button
                            onClick={() => onDeleteInspection(item.id)}
                            title="Delete Inspection"
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspection Detail Modal */}
      {detailInspection && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-cyan-400 font-semibold text-sm">
                    VIQ-{String(detailInspection.id).padStart(5, '0')}
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-300 text-sm font-medium">{detailInspection.domain}</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Conducted by {detailInspection.userName} on{' '}
                  {new Date(detailInspection.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setDetailInspection(null)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Media Preview & Diagnostic Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 rounded border border-slate-800 overflow-hidden flex items-center justify-center">
                <img
                  src={detailInspection.mediaUrl}
                  alt="Inspected media"
                  className="max-h-64 object-contain"
                />
              </div>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-950/60 rounded border border-slate-800/80">
                  <span className="text-slate-500 uppercase font-mono block text-[10px] mb-1">Status & Severity</span>
                  <div className="flex items-center gap-3">
                    <SeverityBadge severity={detailInspection.severity} />
                    <span className="font-mono text-slate-300 tabular-nums">
                      {detailInspection.confidenceScore}% Confidence
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 rounded border border-slate-800/80">
                  <span className="text-slate-500 uppercase font-mono block text-[10px] mb-1">Diagnostic Summary</span>
                  <p className="text-slate-300 leading-relaxed">{detailInspection.summary}</p>
                </div>

                {detailInspection.rawAiResponse?.categoryMetrics && (
                  <div className="p-3 bg-slate-950/60 rounded border border-slate-800/80">
                    <span className="text-slate-500 uppercase font-mono block text-[10px] mb-1">Category Metrics</span>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {Object.entries(detailInspection.rawAiResponse.categoryMetrics).map(([k, v]) => (
                        <div key={k}>
                          <span className="text-slate-500 text-[11px] block">{k}:</span>
                          <span className="text-slate-200 font-mono text-[11px] font-medium">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Detected Objects */}
            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wide font-mono mb-2">
                Detected Features & Bounding Coordinates
              </h4>
              <div className="space-y-2">
                {(detailInspection.rawAiResponse?.detectedObjects || []).map((obj, i) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-950/50 border border-slate-800 rounded flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200">{obj.label}</span>
                        <span className="text-slate-500">·</span>
                        <SeverityBadge severity={obj.severity || detailInspection.severity} />
                      </div>
                      {obj.details && <p className="text-slate-400 text-[11px] mt-0.5">{obj.details}</p>}
                    </div>
                    <div className="text-right shrink-0 font-mono tabular-nums text-slate-400 text-[11px]">
                      <div>{obj.confidence}% match</div>
                      <div className="text-slate-600">[{obj.box2d.join(', ')}]</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wide font-mono mb-2">
                Remediation Recommendations
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                {(detailInspection.rawAiResponse?.recommendations || []).map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => exportInspectionToPDF(detailInspection)}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs rounded transition-colors flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Export Official PDF Report</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
