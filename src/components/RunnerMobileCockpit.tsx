import React, { useState, useEffect } from 'react';
import { Runner, PointOfInterest } from '../types';
import { formatDuration, formatPace, calculateDistanceKm, wgs84ToUTM49S } from '../utils/geoUtils';
import {
  Play,
  Pause,
  RotateCcw,
  Radio,
  Share2,
  AlertTriangle,
  Monitor,
  Heart,
  Zap,
  MapPin,
  Compass,
  Volume2,
  VolumeX,
  Droplets,
  ShieldAlert,
  ChevronDown,
  Navigation,
  Download,
} from 'lucide-react';

interface RunnerMobileCockpitProps {
  runner: Runner;
  onUpdateRunner: (updater: (prev: Runner) => Runner) => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  onResetSimulation: () => void;
  simulationSpeed: number;
  onChangeSimulationSpeed: (speed: number) => void;
  isRealGpsActive: boolean;
  onToggleRealGps: () => void;
  onOpenShareModal: () => void;
  onOpenSOSModal: () => void;
  onOpenPWAModal?: () => void;
  onSwitchToSpectatorMode: () => void;
  pois: PointOfInterest[];
}

export const RunnerMobileCockpit: React.FC<RunnerMobileCockpitProps> = ({
  runner,
  onUpdateRunner,
  isSimulating,
  onToggleSimulation,
  onResetSimulation,
  simulationSpeed,
  onChangeSimulationSpeed,
  isRealGpsActive,
  onToggleRealGps,
  onOpenShareModal,
  onOpenSOSModal,
  onOpenPWAModal,
  onSwitchToSpectatorMode,
  pois,
}) => {
  const [screenWakeLock, setScreenWakeLock] = useState<boolean>(false);
  const [wakeLockSentinel, setWakeLockSentinel] = useState<any>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showMiniMap, setShowMiniMap] = useState<boolean>(false);

  // Screen Wake Lock API to prevent phone screen from dimming while running
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator && !wakeLockSentinel) {
          const sentinel = await (navigator as any).wakeLock.request('screen');
          setWakeLockSentinel(sentinel);
          setScreenWakeLock(true);

          sentinel.addEventListener('release', () => {
            setScreenWakeLock(false);
            setWakeLockSentinel(null);
          });
        }
      } catch (err) {
        // WakeLock request failed (e.g. low battery)
      }
    };

    requestWakeLock();

    return () => {
      if (wakeLockSentinel) {
        wakeLockSentinel.release();
      }
    };
  }, []);

  // Find next upcoming Point of Interest
  const upcomingPois = pois
    .filter((p) => p.kmMark >= runner.distanceKm)
    .sort((a, b) => a.kmMark - b.kmMark);
  const nextPoi = upcomingPois[0] || pois[pois.length - 1];
  const distanceToNextPoi = Math.max(0, nextPoi.kmMark - runner.distanceKm);

  // UTM coordinate
  const utm = wgs84ToUTM49S(runner.currentLocation.lat, runner.currentLocation.lng);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-white font-sans select-none overflow-hidden">
      {/* Top Mobile Runner Bar */}
      <header className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800 shrink-0 backdrop-blur-md z-20">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-sm"
            style={{ backgroundColor: runner.color }}
          >
            {runner.bibNumber.replace('BIB-', '')}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white leading-tight">
                {runner.name}
              </span>
              <span className="text-[9px] bg-blue-900/80 text-blue-300 font-bold px-1.5 py-0.2 rounded font-mono">
                21.1K
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block">
              Cockpit Pelari Geodesi UGM
            </span>
          </div>
        </div>

        {/* Switch to Web Spectator Mode */}
        <div className="flex items-center gap-2">
          <button
            onClick={onSwitchToSpectatorMode}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
            title="Beralih ke Tampilan Peta Pemantau Web"
          >
            <Monitor className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Peta Pemantau</span>
            <span className="sm:hidden">Web</span>
          </button>

          {onOpenPWAModal && (
            <button
              onClick={onOpenPWAModal}
              className="p-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30 transition-colors"
              title="Panduan Install PWA & GPS Layar Mati"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onOpenShareModal}
            className="p-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            title="Bagikan Lokasi"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* GPS Status & Next Checkpoint Banner */}
      <div className="px-4 py-2 bg-slate-900 border-b border-slate-800/80 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isRealGpsActive || isSimulating ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span className="text-slate-300 text-[11px] font-medium font-mono">
            {isRealGpsActive
              ? `GPS LIVE · ±${runner.currentLocation.accuracy || 3}m`
              : isSimulating
              ? `SIMULASI AKTIF (${simulationSpeed}x)`
              : 'GPS STANDBY'}
          </span>
        </div>

        {/* Next Water Station Alert */}
        {nextPoi && (
          <div className="flex items-center gap-1 text-[11px] text-sky-400 font-semibold truncate max-w-[210px]">
            <Droplets className="w-3.5 h-3.5 shrink-0 text-sky-400" />
            <span className="truncate">
              {nextPoi.name.split('-')[0]} ({(distanceToNextPoi * 1000).toFixed(0)}m)
            </span>
          </div>
        )}
      </div>

      {/* Primary Running Cockpit Display (High Contrast Sunlight Legibility) */}
      <div className="flex-1 flex flex-col justify-around p-4 space-y-3 overflow-y-auto">
        {/* Giant Distance Metric */}
        <div className="text-center py-2 bg-slate-900/40 rounded-3xl border border-slate-800/60 relative overflow-hidden">
          <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold block mb-1">
            Jarak Ditempuh
          </span>
          <div className="text-6xl md:text-7xl font-black font-mono tracking-tighter text-emerald-400 tabular-nums">
            {runner.distanceKm.toFixed(2)}
          </div>
          <span className="text-sm font-bold text-slate-400 tracking-wider">
            KILOMETER <span className="text-slate-600 font-normal">/ 21.0975 KM</span>
          </span>

          {/* Micro Progress Bar */}
          <div className="w-full bg-slate-800 h-1.5 absolute bottom-0 left-0">
            <div
              className="bg-emerald-400 h-full transition-all duration-300"
              style={{ width: `${Math.min(100, (runner.distanceKm / 21.1) * 100)}%` }}
            />
          </div>
        </div>

        {/* Dual Quadrants: PACE & ELAPSED TIME */}
        <div className="grid grid-cols-2 gap-3">
          {/* Current Pace */}
          <div className="p-4 rounded-3xl bg-slate-900/60 border border-slate-800 text-center">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
              Pace Saat Ini
            </span>
            <div className="text-4xl md:text-5xl font-black font-mono text-cyan-400 tabular-nums">
              {formatPace(runner.paceMinPerKm).replace(' /km', '')}
            </div>
            <span className="text-[11px] text-slate-400 font-mono block mt-1">
              / KILOMETER
            </span>
          </div>

          {/* Elapsed Time */}
          <div className="p-4 rounded-3xl bg-slate-900/60 border border-slate-800 text-center">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
              Waktu Lari
            </span>
            <div className="text-4xl md:text-5xl font-black font-mono text-white tabular-nums">
              {formatDuration(runner.elapsedSeconds)}
            </div>
            <span className="text-[11px] text-slate-400 font-mono block mt-1">
              JAM : MNT : DTK
            </span>
          </div>
        </div>

        {/* Secondary Metrics: Heart Rate & Cadence & Speed */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-2xl bg-slate-900/50 border border-slate-800/60">
            <span className="text-[10px] text-slate-400 block font-medium">DETAK JANTUNG</span>
            <div className="text-xl font-bold font-mono text-rose-400 flex items-center justify-center gap-1">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 animate-pulse" />
              <span>{runner.heartRate}</span>
            </div>
            <span className="text-[9px] text-slate-500 font-mono">BPM</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-900/50 border border-slate-800/60">
            <span className="text-[10px] text-slate-400 block font-medium">KECEPATAN</span>
            <div className="text-xl font-bold font-mono text-blue-400">
              {runner.speedKmh.toFixed(1)}
            </div>
            <span className="text-[9px] text-slate-500 font-mono">KM/JAM</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-900/50 border border-slate-800/60">
            <span className="text-[10px] text-slate-400 block font-medium">SORAK DUKUNGAN</span>
            <div className="text-xl font-bold font-mono text-amber-400">
              ❤️ {runner.cheersCount}
            </div>
            <span className="text-[9px] text-slate-500">LIVE DARI WEB</span>
          </div>
        </div>

        {/* Geodetic Precision Coordinates Card */}
        <div className="p-2.5 rounded-2xl bg-slate-900/30 border border-slate-800/40 text-[11px] font-mono text-slate-400 flex items-center justify-between px-3">
          <span className="flex items-center gap-1.5 text-blue-400">
            <Compass className="w-3.5 h-3.5" />
            UTM 49S: {utm.easting.toLocaleString('id-ID')} m E, {utm.northing.toLocaleString('id-ID')} m N
          </span>
          <span className="text-slate-500">{runner.currentLocation.altitude || 145}m dpl</span>
        </div>
      </div>

      {/* Bottom Large Tactile Action Bar for Runners (Thumb Zone) */}
      <footer className="p-4 bg-slate-900 border-t border-slate-800 shrink-0 space-y-2.5">
        <div className="grid grid-cols-4 gap-2">
          {/* Main Big Play/Pause Toggle */}
          <button
            onClick={() => {
              if (isRealGpsActive) {
                onToggleRealGps();
              } else {
                onToggleSimulation();
              }
            }}
            className={`col-span-2 h-14 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform ${
              isSimulating || isRealGpsActive
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
            }`}
          >
            {isSimulating || isRealGpsActive ? (
              <>
                <Pause className="w-5 h-5 fill-slate-950" />
                <span>JEDA LARI</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-slate-950" />
                <span>MULAI LARI</span>
              </>
            )}
          </button>

          {/* GPS Mode Toggle Button */}
          <button
            onClick={onToggleRealGps}
            className={`h-14 rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-1 border active:scale-95 transition-all ${
              isRealGpsActive
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Radio className={`w-4 h-4 ${isRealGpsActive ? 'text-emerald-400 animate-pulse' : ''}`} />
            <span className="text-[10px]">
              {isRealGpsActive ? 'GPS AKTIF' : 'GPS HP'}
            </span>
          </button>

          {/* Emergency SOS Button */}
          <button
            onClick={onOpenSOSModal}
            className="h-14 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 border border-rose-500 active:scale-95 transition-all"
            title="Bantuan Medis Darurat"
          >
            <ShieldAlert className="w-4 h-4 text-white" />
            <span className="text-[10px]">SOS MEDIS</span>
          </button>
        </div>

        {/* Simulation Speed Control if using virtual run mode */}
        {!isRealGpsActive && (
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-1">
            <span className="text-[11px]">Kecepatan Simulasi:</span>
            <div className="flex gap-1.5">
              {[1, 5, 10, 20].map((spd) => (
                <button
                  key={spd}
                  onClick={() => onChangeSimulationSpeed(spd)}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-md font-mono ${
                    simulationSpeed === spd
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
            <button
              onClick={onResetSimulation}
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        )}
      </footer>
    </div>
  );
};
