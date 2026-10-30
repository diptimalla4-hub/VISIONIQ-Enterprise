import React, { useEffect, useState } from 'react';
import { Inspection } from '../types/index.ts';
import { api } from '../services/api.ts';
import { HistoryTable } from '../components/HistoryTable.tsx';
import { RefreshCw, FileText, Download, ShieldCheck } from 'lucide-react';
import { exportInspectionsToCSV } from '../utils/pdfExport.ts';

interface HistoryPageProps {
  onSelectInspection: (inspection: Inspection) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onSelectInspection }) => {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInspections = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.getInspections();
      setInspections(response.inspections);
    } catch (err: any) {
      console.error('Failed to load history:', err);
      setError(err.message || 'Failed to load inspection history.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await api.deleteInspection(id);
      setInspections((prev) => prev.filter((i) => i.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete inspection record.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <span>IMMUTABLE AUDIT TRAIL</span>
            <span className="text-slate-600">·</span>
            <span>POSTGRESQL AUDIT_LOGS</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Past Inspection Logs</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Full compliance record of historical visual diagnostics, raw payloads, and inspector actions
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportInspectionsToCSV(inspections)}
            disabled={inspections.length === 0}
            className="px-3.5 py-2 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={fetchInspections}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-md transition-colors"
            title="Refresh logs"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/20 border border-rose-900/50 rounded text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* History Table */}
      <HistoryTable
        inspections={inspections}
        onSelectInspection={onSelectInspection}
        onDeleteInspection={handleDelete}
        isLoading={isLoading}
      />
    </div>
  );
};
