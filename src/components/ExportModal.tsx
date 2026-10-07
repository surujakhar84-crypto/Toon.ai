import React, { useState } from 'react';
import { X, Download, Film, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';
import { CartoonProject } from '../types/cartoon';
import { VideoExporter, ExportProgress } from '../services/videoRecorder';
import confetti from 'canvas-confetti';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: CartoonProject;
  language: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  project,
  language
}) => {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isHindi = language === 'hi-IN' || language === 'hinglish';

  const handleStartExport = async () => {
    setIsExporting(true);
    setError(null);
    setDownloadUrl(null);

    try {
      const videoBlob = await VideoExporter.exportCartoonVideo(project, (prog) => {
        setProgress(prog);
      });

      const url = URL.createObjectURL(videoBlob);
      setDownloadUrl(url);

      // Trigger celebration
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 }
      });
    } catch (err: any) {
      console.error('Export error:', err);
      setError(err?.message || 'Video export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadFile = () => {
    if (!downloadUrl) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    const sanitizedTitle = project.title.replace(/[^a-zA-Z0-9\u0900-\u097F]/g, '_') || 'Cartoon_Video';
    a.download = `${sanitizedTitle}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1c1b1f]/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#fdf8ff] border-2 border-[#e8def8] rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl flex flex-col gap-5 text-[#1c1b1f] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e8def8] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#eaddff] text-[#6750a4] flex items-center justify-center text-xl shadow-sm border border-[#d0bcff]">
              📥
            </div>
            <div>
              <h2 className="font-black text-xl italic text-[#6750a4]">
                {isHindi ? 'कार्टून वीडियो एक्सपोर्ट करें' : 'Export Cartoon Video'}
              </h2>
              <p className="text-xs text-[#79747e]">
                {isHindi ? 'HD क्वालिटी में वीडियो और ऑडियो रेंडर करके डाउनलोड करें' : 'Render high-definition animated video with synchronized voices & audio'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isExporting}
            className="p-2 rounded-2xl text-[#79747e] hover:text-[#1c1b1f] hover:bg-[#eaddff] disabled:opacity-50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Project Summary Card */}
        <div className="bg-white p-4 rounded-2xl border border-[#e8def8] flex flex-col gap-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-[#1c1b1f] truncate">{project.title}</span>
            <span className="text-xs font-mono font-bold text-[#21005d] bg-[#eaddff] px-2.5 py-0.5 rounded-full border border-[#d0bcff]">
              {project.aspectRatio}
            </span>
          </div>
          <p className="text-xs text-[#79747e]">
            🎬 {project.scenes.length} Scenes • 🎵 {project.bgMusic} • 🗣️ {project.language}
          </p>
        </div>

        {/* Progress Bar during export */}
        {isExporting && progress && (
          <div className="flex flex-col gap-2 bg-white p-4 rounded-2xl border border-[#e8def8] shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-[#6750a4] flex items-center gap-1.5">
                <div className="w-3 h-3 border-2 border-[#6750a4] border-t-transparent rounded-full animate-spin" />
                <span>{progress.statusText}</span>
              </span>
              <span className="text-[#21005d] font-mono font-bold">{progress.progressPercent}%</span>
            </div>

            <div className="w-full bg-[#e8def8] h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#6750a4] to-[#7f67be] h-full transition-all duration-300 rounded-full"
                style={{ width: `${progress.progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-2xl bg-[#ffdad6] border border-[#ffb4ab] text-[#ba1a1a] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Card with Download Button */}
        {downloadUrl && (
          <div className="p-4 rounded-2xl bg-[#eaddff] border border-[#d0bcff] text-[#21005d] flex flex-col gap-3 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-[#6750a4]" />
              <span>{isHindi ? 'वीडियो सफलतापूर्वक तैयार है!' : 'Your Cartoon Video is Ready!'}</span>
            </div>

            <button
              onClick={handleDownloadFile}
              className="w-full py-3 rounded-2xl bg-[#1c1b1f] hover:bg-[#313033] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-black/10 transition hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#eaddff]" />
              <span>{isHindi ? 'वीडियो फाइल डाउनलोड करें (.webm)' : 'Download Video (.webm)'}</span>
            </button>
          </div>
        )}

        {/* Action Button */}
        {!downloadUrl && !isExporting && (
          <button
            onClick={handleStartExport}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#6750a4] to-[#7f67be] hover:from-[#523e85] hover:to-[#6750a4] text-white font-extrabold text-sm shadow-xl shadow-[#6750a4]/25 flex items-center justify-center gap-2 transition hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Film className="w-5 h-5" />
            <span>{isHindi ? 'वीडियो रेंडर और डाउनलोड शुरू करें' : 'Start Video Rendering & Download'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
