import React, { useState } from 'react';
import { Runner } from '../types';
import { Share2, Copy, Check, MessageSquare, QrCode, X, Radio, Compass } from 'lucide-react';

interface ShareLocationModalProps {
  runner: Runner;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareLocationModal: React.FC<ShareLocationModalProps> = ({
  runner,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Build live tracking link for spectators
  const currentUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
  const shareUrl = `${currentUrl}?runner=${encodeURIComponent(runner.bibNumber)}&name=${encodeURIComponent(runner.name)}&mode=spectator`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleWhatsApp = () => {
    const text = `🏃‍♂️ Ikuti perjalanan lari saya di UGM Geodesy Half Marathon '26 secara real-time! Buka peta live di sini:\n${shareUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Live Tracker - ${runner.name} (${runner.bibNumber})`,
          text: `Ikuti perjalanan lari saya di UGM Geodesy Half Marathon '26 secara real-time!`,
          url: shareUrl,
        });
      } catch (err) {
        // User dismissed share dialog
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-md relative space-y-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Radio className="w-5 h-5 animate-pulse text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Bagikan Lokasi Real-Time
            </h3>
            <p className="text-xs text-slate-500">
              Live tracking untuk teman, keluarga, dan suporter
            </p>
          </div>
        </div>

        {/* Runner Card Preview */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-base shadow-sm shrink-0"
            style={{ backgroundColor: runner.color }}
          >
            {runner.bibNumber.replace('BIB-', '')}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {runner.name}
            </h4>
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <span>{runner.category}</span>
              <span>·</span>
              <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">
                KM {runner.distanceKm.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* QR Code generator visual for instant scanning by spectators */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60 text-center">
          <div className="bg-white p-3 rounded-xl shadow-md border border-slate-200 mb-2">
            {/* High visual fidelity QR representation SVG */}
            <svg
              className="w-36 h-36"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer corners */}
              <rect x="5" y="5" width="28" height="28" rx="4" stroke="#0f172a" strokeWidth="6" />
              <rect x="13" y="13" width="12" height="12" fill="#2563eb" rx="2" />

              <rect x="67" y="5" width="28" height="28" rx="4" stroke="#0f172a" strokeWidth="6" />
              <rect x="75" y="13" width="12" height="12" fill="#2563eb" rx="2" />

              <rect x="5" y="67" width="28" height="28" rx="4" stroke="#0f172a" strokeWidth="6" />
              <rect x="13" y="75" width="12" height="12" fill="#2563eb" rx="2" />

              {/* Data dots pattern */}
              <rect x="42" y="8" width="6" height="6" fill="#0f172a" />
              <rect x="52" y="16" width="6" height="6" fill="#0f172a" />
              <rect x="42" y="24" width="6" height="6" fill="#0f172a" />
              <rect x="8" y="42" width="6" height="6" fill="#0f172a" />
              <rect x="18" y="48" width="6" height="6" fill="#0f172a" />
              <rect x="28" y="42" width="6" height="6" fill="#0f172a" />
              <rect x="40" y="40" width="18" height="18" rx="3" fill="#2563eb" />
              <rect x="65" y="42" width="6" height="6" fill="#0f172a" />
              <rect x="75" y="50" width="6" height="6" fill="#0f172a" />
              <rect x="85" y="42" width="6" height="6" fill="#0f172a" />
              <rect x="42" y="68" width="6" height="6" fill="#0f172a" />
              <rect x="52" y="76" width="6" height="6" fill="#0f172a" />
              <rect x="42" y="84" width="6" height="6" fill="#0f172a" />
              <rect x="68" y="68" width="6" height="6" fill="#0f172a" />
              <rect x="78" y="78" width="8" height="8" fill="#0f172a" />
              <rect x="88" y="86" width="6" height="6" fill="#0f172a" />
            </svg>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Scan QR Code ini langsung dengan kamera HP penonton di pinggir rute
          </span>
        </div>

        {/* Share Link Input with Copy Button */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Tautan Peta Live
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-mono select-all focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-blue-600 dark:hover:bg-blue-700'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Tersalin!' : 'Salin'}</span>
            </button>
          </div>
        </div>

        {/* Share Action Buttons */}
        <div className="space-y-2">
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleNativeShare}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span>Bagikan ke Aplikasi Lain (Share Sheet)</span>
            </button>
          )}

          <button
            onClick={handleWhatsApp}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Bagikan Langsung via WhatsApp</span>
          </button>
        </div>

        <p className="text-[11px] text-center text-slate-400">
          Penonton yang membuka tautan ini dapat memantau pergerakan Anda secara live, melihat waktu
          estimasi tiba di setiap KM, dan mengirimkan sorak dukungan!
        </p>
      </div>
    </div>
  );
};
