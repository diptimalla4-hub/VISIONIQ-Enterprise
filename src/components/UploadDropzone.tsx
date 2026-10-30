import React, { useState, useRef, useEffect } from 'react';
import { Upload, Camera, Film, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { SampleMediaItem } from '../types/index.ts';

interface UploadDropzoneProps {
  onMediaSelected: (base64: string, mimeType: string, previewUrl: string, sampleInfo?: SampleMediaItem) => void;
  samples: SampleMediaItem[];
  selectedSampleId?: string | null;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  onMediaSelected,
  samples = [],
  selectedSampleId = null
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'samples' | 'camera'>('samples');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      // Clean up camera stream on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (file.type.startsWith('video/')) {
      // Process video file: grab frame
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = URL.createObjectURL(file);
      video.muted = true;
      video.playsInline = true;

      video.onloadeddata = () => {
        video.currentTime = Math.min(1.0, video.duration / 2);
      };

      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const base64 = canvas.toDataURL('image/jpeg', 0.92);
          onMediaSelected(base64, 'image/jpeg', base64);
        }
      };
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      onMediaSelected(result, file.type, result);
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access unavailable:', err);
      setCameraError('Webcam access was denied or is not supported in this frame. You can use the Preset Feeds or upload images.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const captureFrame = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL('image/jpeg', 0.95);
      onMediaSelected(base64, 'image/jpeg', base64);
      stopCamera();
    }
  };

  const selectSample = async (sample: SampleMediaItem) => {
    try {
      const response = await fetch(sample.imageUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        onMediaSelected(base64, blob.type || 'image/jpeg', sample.imageUrl, sample);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('Failed to load sample image:', err);
      // Fallback
      onMediaSelected(sample.imageUrl, 'image/jpeg', sample.imageUrl, sample);
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-5">
      {/* Tabs */}
      <div className="flex items-center gap-2 mb-4 p-1 bg-slate-950/70 border border-slate-800/80 rounded-lg">
        <button
          onClick={() => {
            stopCamera();
            setActiveTab('samples');
          }}
          className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'samples' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Preset Feeds</span>
        </button>

        <button
          onClick={() => {
            stopCamera();
            setActiveTab('upload');
          }}
          className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'upload' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Asset</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('camera');
            startCamera();
          }}
          className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'camera' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Live Camera</span>
        </button>
      </div>

      {/* Preset Feeds */}
      {activeTab === 'samples' && (
        <div className="space-y-2.5">
          <p className="text-xs text-slate-400">
            Select an operational inspection sample to evaluate Gemini Vision detection:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {samples.map((sample) => {
              const isSelected = selectedSampleId === sample.id;
              return (
                <div
                  key={sample.id}
                  onClick={() => selectSample(sample)}
                  className={`group relative p-3 rounded-lg border text-left cursor-pointer transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'border-cyan-500/80 bg-cyan-950/20'
                      : 'border-slate-800/90 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-900/50'
                  }`}
                >
                  <img
                    src={sample.imageUrl}
                    alt={sample.title}
                    className="w-14 h-14 rounded object-cover shrink-0 border border-slate-800"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-semibold text-slate-200 truncate group-hover:text-cyan-300 transition-colors">
                        {sample.title}
                      </h4>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                    </div>
                    <span className="text-[11px] text-slate-400 block truncate">{sample.domain}</span>
                    <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                      Target: {sample.expectedAnomaly}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* File Upload Dropzone */}
      {activeTab === 'upload' && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-cyan-400 bg-cyan-500/10'
              : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png,image/jpeg,image/webp,video/mp4,video/webm"
            className="hidden"
          />
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3 text-cyan-400">
            <Upload className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-semibold text-slate-200 mb-1">
            Drop inspection image or video here
          </h4>
          <p className="text-xs text-slate-400 mb-3">
            Supports JPEG, PNG, WebP or MP4 frames (up to 50MB)
          </p>
          <div className="inline-flex items-center gap-2 text-[11px] text-slate-500 font-mono">
            <span>Precision 0-1000 Scale</span>
            <span>·</span>
            <span>Sub-millimeter Coordinate Grid</span>
          </div>
        </div>
      )}

      {/* Live Camera Stream */}
      {activeTab === 'camera' && (
        <div className="space-y-3">
          {cameraError ? (
            <div className="p-4 rounded-lg bg-rose-950/20 border border-rose-900/50 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Camera Stream Inactive</p>
                <p>{cameraError}</p>
                <button
                  onClick={startCamera}
                  className="mt-2 text-cyan-400 underline hover:text-cyan-300"
                >
                  Retry Camera Initialization
                </button>
              </div>
            </div>
          ) : (
            <div className="relative rounded-lg overflow-hidden bg-black border border-slate-800 aspect-video flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur rounded text-[10px] font-mono text-cyan-400 flex items-center gap-1.5 border border-cyan-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                EDGE STREAM LIVE
              </div>
              <div className="absolute bottom-3 inset-x-0 flex justify-center">
                <button
                  onClick={captureFrame}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs rounded-full shadow-lg transition-all flex items-center gap-2"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Capture Inspection Frame</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
