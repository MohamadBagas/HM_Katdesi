import React from 'react';
import { Compass, Share2, Sun, Moon, Radio, Navigation, Users, MapPin, BarChart3, Smartphone, Monitor, Download } from 'lucide-react';

interface NavbarProps {
  activeTab: 'map' | 'runners' | 'journey' | 'geodesy' | 'analytics';
  setActiveTab: (tab: 'map' | 'runners' | 'journey' | 'geodesy' | 'analytics') => void;
  appMode: 'spectator' | 'runner';
  onToggleAppMode: () => void;
  onOpenShareModal: () => void;
  onOpenPWAModal: () => void;
  isLiveTracking: boolean;
  isDark: boolean;
  toggleDark: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  appMode,
  onToggleAppMode,
  onOpenShareModal,
  onOpenPWAModal,
  isLiveTracking,
  isDark,
  toggleDark,
}) => {
  return (
    <header className="flex items-center justify-between gap-4 md:gap-8 px-4 md:px-8 py-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 z-30 transition-colors">
      {/* Zone 1: Single text element wordmark / Brand */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
          <Compass className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-base md:text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap block leading-tight">
            UGM GEODESY HM &apos;26
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">
            Live Tracker & Rute Navigasi
          </span>
        </div>
      </div>

      {/* Zone 2: Clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
        <button
          onClick={() => setActiveTab('map')}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-blue-600 dark:hover:text-blue-400 ${
            activeTab === 'map'
              ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400 pb-1 -mb-1'
              : ''
          }`}
        >
          <Radio className={`w-4 h-4 ${isLiveTracking ? 'text-emerald-500 animate-pulse' : ''}`} />
          Peta Rute
        </button>

        <button
          onClick={() => setActiveTab('runners')}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-blue-600 dark:hover:text-blue-400 ${
            activeTab === 'runners'
              ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400 pb-1 -mb-1'
              : ''
          }`}
        >
          <Users className="w-4 h-4" />
          Lacak Pelari
        </button>

        <button
          onClick={() => setActiveTab('journey')}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-blue-600 dark:hover:text-blue-400 ${
            activeTab === 'journey'
              ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400 pb-1 -mb-1'
              : ''
          }`}
        >
          <Navigation className="w-4 h-4" />
          Rute Perjalanan
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-blue-600 dark:hover:text-blue-400 ${
            activeTab === 'analytics'
              ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400 pb-1 -mb-1'
              : ''
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Grafik Pace
        </button>

        <button
          onClick={() => setActiveTab('geodesy')}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-blue-600 dark:hover:text-blue-400 ${
            activeTab === 'geodesy'
              ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400 pb-1 -mb-1'
              : ''
          }`}
        >
          <MapPin className="w-4 h-4" />
          Geodesi Lab
        </button>
      </nav>

      {/* Zone 3: 1 Primary action + Mode Toggle + Dark Mode Toggle */}
      <div className="flex items-center gap-2 md:gap-2.5 shrink-0">
        <button
          onClick={onToggleAppMode}
          className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors shrink-0"
          title="Beralih ke Mode Mobile Pelari (GPS Cockpit)"
        >
          {appMode === 'spectator' ? (
            <>
              <Smartphone className="w-3.5 h-3.5 text-blue-500" />
              <span className="hidden sm:inline">Mode Pelari</span>
              <span className="sm:hidden">Lari</span>
            </>
          ) : (
            <>
              <Monitor className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden sm:inline">Mode Pemantau</span>
              <span className="sm:hidden">Pantau</span>
            </>
          )}
        </button>

        <button
          onClick={toggleDark}
          title={isDark ? 'Mode Terang' : 'Mode Gelap'}
          className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button
          onClick={onOpenPWAModal}
          className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 text-xs font-semibold rounded-lg border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-200 transition-colors shrink-0"
          title="Panduan Install PWA di Handphone & Lari Layar Mati"
        >
          <Download className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span className="hidden lg:inline">Install HP</span>
        </button>

        <button
          onClick={onOpenShareModal}
          className="flex items-center gap-2 px-3.5 py-2 text-xs md:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0"
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Bagikan Lokasi</span>
          <span className="sm:hidden">Share</span>
        </button>
      </div>
    </header>
  );
};
