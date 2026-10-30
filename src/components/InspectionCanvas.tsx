import React, { useState, useRef } from 'react';
import { DetectedObject, SeverityLevel } from '../types/index.ts';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Layers, Eye, EyeOff } from 'lucide-react';

interface InspectionCanvasProps {
  mediaUrl: string;
  detectedObjects: DetectedObject[];
  anomalyDetected?: boolean;
  severity?: SeverityLevel;
  highlightedIndex?: number | null;
  onSelectObject?: (index: number | null) => void;
}

export const InspectionCanvas: React.FC<InspectionCanvasProps> = ({
  mediaUrl,
  detectedObjects = [],
  anomalyDetected = false,
  severity = 'None',
  highlightedIndex = null,
  onSelectObject
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.75));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const getBorderColor = (objSeverity?: string, isHighlighted?: boolean) => {
    const sev = objSeverity || severity;
    if (sev === 'Critical') return isHighlighted ? 'border-rose-400 ring-4 ring-rose-500/40 bg-rose-500/20' : 'border-rose-500 bg-rose-500/10';
    if (sev === 'High') return isHighlighted ? 'border-amber-400 ring-4 ring-amber-500/40 bg-amber-500/20' : 'border-amber-500 bg-amber-500/10';
    if (sev === 'Medium') return isHighlighted ? 'border-yellow-400 ring-4 ring-yellow-500/40 bg-yellow-500/20' : 'border-yellow-500 bg-yellow-500/10';
    if (sev === 'Low') return isHighlighted ? 'border-cyan-400 ring-4 ring-cyan-500/40 bg-cyan-500/20' : 'border-cyan-500 bg-cyan-500/10';
    return isHighlighted ? 'border-emerald-400 ring-4 ring-emerald-500/40 bg-emerald-500/20' : 'border-emerald-500 bg-emerald-500/10';
  };

  const getTagColor = (objSeverity?: string) => {
    const sev = objSeverity || severity;
    if (sev === 'Critical') return 'bg-rose-600 text-white';
    if (sev === 'High') return 'bg-amber-600 text-white';
    if (sev === 'Medium') return 'bg-yellow-600 text-slate-950';
    if (sev === 'Low') return 'bg-cyan-600 text-slate-950';
    return 'bg-emerald-600 text-white';
  };

  return (
    <div className="relative flex flex-col w-full bg-slate-950 border border-slate-800 rounded-lg overflow-hidden select-none">
      {/* Top Controls Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="font-mono text-slate-400">CANVAS VIEW</span>
          <span className="text-slate-600">·</span>
          <span className="font-mono tabular-nums text-slate-400">{Math.round(zoom * 100)}%</span>
          {detectedObjects.length > 0 && (
            <>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">{detectedObjects.length} Targets</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
            className={`p-1.5 rounded transition-colors flex items-center gap-1 ${
              showBoundingBoxes ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:bg-slate-800'
            }`}
            title="Toggle Bounding Boxes"
          >
            {showBoundingBoxes ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Boxes</span>
          </button>

          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`p-1.5 rounded transition-colors flex items-center gap-1 ${
              showHeatmap ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:bg-slate-800'
            }`}
            title="Toggle Anomaly Heatmap Simulation"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Heatmap</span>
          </button>

          <div className="w-px h-4 bg-slate-800 mx-1" />

          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Media Canvas Viewport */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative w-full h-[420px] sm:h-[500px] lg:h-[560px] bg-slate-950 flex items-center justify-center overflow-hidden ${
          zoom > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
        }`}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transition: isDragging ? 'none' : 'transform 0.15s ease-out'
          }}
          className="relative max-w-full max-h-full aspect-auto flex items-center justify-center"
        >
          <img
            src={mediaUrl}
            alt="Inspected asset"
            referrerPolicy="no-referrer"
            className="max-h-[520px] w-auto object-contain rounded pointer-events-none"
          />

          {/* Anomaly Heatmap Simulation Filter Overlay */}
          {showHeatmap && (
            <div className="absolute inset-0 pointer-events-none mix-blend-color-dodge opacity-70">
              {detectedObjects.map((obj, i) => {
                const [ymin, xmin, ymax, xmax] = obj.box2d;
                const top = (ymin / 10).toFixed(2);
                const left = (xmin / 10).toFixed(2);
                const height = ((ymax - ymin) / 10).toFixed(2);
                const width = ((xmax - xmin) / 10).toFixed(2);

                return (
                  <div
                    key={`heat-${i}`}
                    style={{
                      top: `${top}%`,
                      left: `${left}%`,
                      width: `${width}%`,
                      height: `${height}%`,
                      background: 'radial-gradient(circle, rgba(244,63,94,0.85) 0%, rgba(245,158,11,0.5) 45%, rgba(6,182,212,0.2) 75%, transparent 100%)'
                    }}
                    className="absolute blur-md rounded-full transform -translate-x-1 -translate-y-1 scale-125"
                  />
                );
              })}
            </div>
          )}

          {/* Normalized Bounding Boxes Overlays */}
          {showBoundingBoxes &&
            detectedObjects.map((obj, index) => {
              const [ymin, xmin, ymax, xmax] = obj.box2d;
              const top = (ymin / 10).toFixed(2);
              const left = (xmin / 10).toFixed(2);
              const height = Math.max(2, (ymax - ymin) / 10).toFixed(2);
              const width = Math.max(2, (xmax - xmin) / 10).toFixed(2);
              const isSelected = highlightedIndex === index;

              return (
                <div
                  key={`box-${index}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectObject) {
                      onSelectObject(isSelected ? null : index);
                    }
                  }}
                  style={{
                    top: `${top}%`,
                    left: `${left}%`,
                    width: `${width}%`,
                    height: `${height}%`
                  }}
                  className={`absolute border-2 transition-all cursor-pointer ${getBorderColor(
                    obj.severity,
                    isSelected
                  )}`}
                >
                  {/* Floating Tag */}
                  <div
                    className={`absolute -top-6 left-0 px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase whitespace-nowrap shadow-md flex items-center gap-1 ${getTagColor(
                      obj.severity
                    )}`}
                  >
                    <span>{obj.label}</span>
                    <span className="font-mono opacity-90 tabular-nums">{Math.round(obj.confidence)}%</span>
                  </div>

                  {/* Corner Crosshairs for High Precision Inspection */}
                  <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-white" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-white" />
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-white" />
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-white" />
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
