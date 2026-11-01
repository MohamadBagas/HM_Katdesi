import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { backgroundKeepAlive } from '../utils/backgroundAudioKeepAlive';
import {
  Smartphone,
  Download,
  Share,
  PlusSquare,
  CheckCircle2,
  Lock,
  BatteryCharging,
  Zap,
  Volume2,
  X,
  Radio,
  ExternalLink,
} from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'install' | 'background'>('install');
  const [isBackgroundKeepAliveActive, setIsBackgroundKeepAliveActive] = useState<boolean>(
    backgroundKeepAlive.getStatus()
  );

  if (!isOpen) return null;

  const handleToggleBackground = () => {
    if (isBackgroundKeepAliveActive) {
      backgroundKeepAlive.stop();
      setIsBackgroundKeepAliveActive(false);
    } else {
      const ok = backgroundKeepAlive.start();
      setIsBackgroundKeepAliveActive(ok);
    }
  };

  const handleInstallClick = async () => {
    await install();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-lg relative space-y-4 max-h-[90vh] overflow-y-auto">
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
          <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
              Panduan Mobile PWA & Background GPS
            </h3>
            <p className="text-xs text-slate-500">
              Instal di ponsel dan cara kerja pelacakan saat layar mati
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('install')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'install'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Cara Install di HP</span>
          </button>

          <button
            onClick={() => setActiveTab('background')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'background'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Layar Mati Tetap Jalan</span>
          </button>
        </div>

        {activeTab === 'install' ? (
          <div className="space-y-4 text-xs">
            {/* Install status banner */}
            {isInstalled ? (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold block">Aplikasi Sudah Terpasang!</span>
                  <span className="text-[11px]">
                    Anda sedang membuka versi PWA mandiri (Standalone App).
                  </span>
                </div>
              </div>
            ) : isInstallable ? (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-900/60 space-y-2.5">
                <span className="font-bold text-blue-950 dark:text-blue-100 block text-sm">
                  Ponsel Android / Browser Siap Install
                </span>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  Tekan tombol di bawah untuk memasang ikon aplikasi <strong>UGM HM &apos;26</strong> ke
                  layar beranda HP Anda layaknya aplikasi Play Store.
                </p>
                <button
                  onClick={handleInstallClick}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Pasang Aplikasi Sekarang</span>
                </button>
              </div>
            ) : null}

            {/* Android Instructions */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-emerald-600 text-white text-[11px] font-mono flex items-center justify-center font-bold">
                  A
                </span>
                <span>Untuk Pengguna Android (Google Chrome):</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                <li>Buka tautan aplikasi ini di Google Chrome ponsel.</li>
                <li>
                  Tekan tombol menu titik tiga (<strong>⋮</strong>) di pojok kanan atas Chrome.
                </li>
                <li>
                  Pilih menu <strong>&quot;Tambahkan ke Layar Utama&quot;</strong> (atau{' '}
                  <strong>&quot;Install App&quot;</strong>).
                </li>
                <li>
                  Ikon <strong>UGM HM &apos;26</strong> akan muncul di homescreen dan bisa dibuka layar penuh
                  tanpa bilah URL browser!
                </li>
              </ol>
            </div>

            {/* iOS Instructions */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-slate-800 text-white text-[11px] font-mono flex items-center justify-center font-bold">
                  i
                </span>
                <span>Untuk Pengguna iPhone / iPad (Apple Safari):</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                <li>Buka tautan aplikasi ini menggunakan peramban <strong>Safari</strong> bawaan iPhone.</li>
                <li>
                  Tekan tombol <strong>Share / Bagikan</strong> (<Share className="w-3.5 h-3.5 inline mx-0.5 text-blue-500" /> kotak panah atas) di bilah bawah Safari.
                </li>
                <li>
                  Gulir ke bawah dan pilih <strong>&quot;Add to Home Screen&quot;</strong> (<PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-slate-500" /> Tambahkan ke Layar Utama).
                </li>
                <li>Tekan tombol <strong>Add (Tambah)</strong> di pojok kanan atas. Selesai!</li>
              </ol>
            </div>
          </div>
        ) : (
          /* Background GPS & Lock Screen Tab */
          <div className="space-y-3.5 text-xs">
            {/* Background Keep-Alive Toggle Card */}
            <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-950 dark:text-emerald-100 block text-sm">
                    Background GPS Keep-Alive Service
                  </span>
                  <span className="text-[11px] text-emerald-800 dark:text-emerald-300">
                    Memastikan GPS tetap aktif saat ponsel dikunci / layar mati
                  </span>
                </div>
                <button
                  onClick={handleToggleBackground}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                    isBackgroundKeepAliveActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {isBackgroundKeepAliveActive ? 'AKTIF ✓' : 'AKTIFKAN'}
                </button>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Layanan ini mengaktifkan background audio silent thread dan MediaSession. OS ponsel
                akan memprioritaskan aplikasi ini layaknya pemutar musik Spotify, sehingga{' '}
                <strong>GPS satelit tetap merekam pergerakan pelari meski layar mati</strong>.
              </p>
            </div>

            {/* How it works breakdown */}
            <div className="space-y-2 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              <div className="font-bold text-slate-900 dark:text-white text-xs">
                3 Perlindungan Aplikasi Saat Anda Berlari:
              </div>

              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white block">
                    1. Screen Wake Lock Otomatis
                  </strong>
                  <span>
                    Di Mode Pelari, aplikasi secara otomatis mencegah layar HP mati sendiri. Layar
                    tetap menyala dengan antarmuka tema gelap hemat daya (*OLED battery friendly*).
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                <Volume2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white block">
                    2. Background Audio Keep-Alive
                  </strong>
                  <span>
                    Jika Anda sengaja menekan tombol power HP untuk memasukkannya ke saku/armband,
                    fitur ini menjaga proses worker GPS tetap berjalan di latar belakang.
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                <Radio className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-white block">
                    3. Auto Re-sync & Interpolasi
                  </strong>
                  <span>
                    Begitu layar dinyalakan kembali, aplikasi langsung membaca koordinat satelit
                    terbaru dan menghitung jarak kumulatif secara presisi tanpa kehilangan riwayat lari.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
