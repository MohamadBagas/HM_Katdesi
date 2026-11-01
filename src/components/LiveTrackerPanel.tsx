import React, { useState } from 'react';
import { Runner, UTMCoordinate } from '../types';
import { formatDuration, formatPace, calculateETA, wgs84ToUTM49S } from '../utils/geoUtils';
import {
  Play,
  Pause,
  RotateCcw,
  Activity,
  Heart,
  Share2,
  AlertTriangle,
  Radio,
  Zap,
  Gauge,
  MapPin,
  ChevronUp,
  ChevronDown,
  Navigation,
  BarChart3,
} from 'lucide-react';

interface LiveTrackerPanelProps {
  runner: Runner;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  onResetSimulation: () => void;
  simulationSpeed: number;
  onChangeSimulationSpeed: (speed: number) => void;
  isRealGpsActive: boolean;
  onToggleRealGps: () => void;
  onOpenShareModal: () => void;
  onOpenSOSModal: () => void;
  onOpenPaceAnalytics: () => void;
  onNavigateToRunner: (runner: Runner) => void;
}

export const LiveTrackerPanel: React.FC<LiveTrackerPanelProps> = ({
  runner,
  isSimulating,
  onToggleSimulation,
  onResetSimulation,
  simulationSpeed,
  onChangeSimulationSpeed,
  isRealGpsActive,
  onToggleRealGps,
  onOpenShareModal,
  onOpenSOSModal,
  onOpenPaceAnalytics,
  onNavigateToRunner,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Compute ETA
  const targetKm = 21.0975;
  const { etaClock, remainingTimeSec } = calculateETA(
    runner.distanceKm,
    targetKm,
    runner.paceMinPerKm
  );

  // Compute UTM 49S coordinates
  const utm: UTMCoordinate = wgs84ToUTM49S(
    runner.currentLocation.lat,
    runner.currentLocation.lng
  );

  const progressPercent = Math.min(100, (runner.distanceKm / targetKm) * 100);

  return (
    <div className="bg-white dark:bg-slate-900 flex flex-col h-full overflow-hidden transition-colors">
      {/* Top Header & Collapse Toggle */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm"
            style={{ backgroundColor: runner.color }}
          >
            {runner.bibNumber.replace('BIB-', '')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                {runner.name}
              </h2>
              {runner.isUser && (
                <span className="text-[10px] bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-semibold px-1.5 py-0.5 rounded">
                  Anda
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {runner.category} · {runner.club}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle panel"
          >
            {isCollapsed ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Tracking Mode Tabs (Simulasi vs GPS Perangkat Nyata) */}
          <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center text-xs font-semibold">
            <button
              onClick={() => {
                if (isRealGpsActive) onToggleRealGps();
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                !isRealGpsActive
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Mode Simulasi Rute</span>
            </button>
            <button
              onClick={onToggleRealGps}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                isRealGpsActive
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Radio
                className={`w-3.5 h-3.5 ${isRealGpsActive ? 'text-emerald-500 animate-pulse' : ''}`}
              />
              <span>GPS Nyata Device</span>
            </button>
          </div>

          {/* Simulation Controls when simulation active */}
          {!isRealGpsActive ? (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Kontrol Simulasi Lari
                </span>
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                  Kecepatan: {simulationSpeed}x
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onToggleSimulation}
                  className={`flex-1 py-2 px-3 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-all ${
                    isSimulating
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isSimulating ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>Jeda Simulasi</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Mulai Lari</span>
                    </>
                  )}
                </button>

                <button
                  onClick={onResetSimulation}
                  title="Mulai Ulang dari Garis Start"
                  className="p-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Speed multiplier selection */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Akselerasi:</span>
                {[1, 5, 10, 20].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => onChangeSimulationSpeed(spd)}
                    className={`px-2 py-0.5 text-[11px] font-bold rounded-md transition-colors ${
                      simulationSpeed === spd
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
              <div>
                <span className="font-bold block">GPS Satelit Aktif</span>
                <span>Mengirim lokasi akurat perangkat secara langsung (Real-Time).</span>
              </div>
            </div>
          )}

          {/* Course Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-baseline text-xs">
              <span className="text-slate-500 dark:text-slate-400">Progress Rute 21.1K</span>
              <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                {runner.distanceKm.toFixed(2)} km{' '}
                <span className="text-slate-400 font-normal">/ 21.10 km</span>
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Telemetry KPI Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Pace Card */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                <Gauge className="w-3.5 h-3.5 text-blue-500" />
                <span>Pace Saat Ini</span>
              </div>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
                {formatPace(runner.paceMinPerKm)}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Kecepatan: {runner.speedKmh.toFixed(1)} km/h
              </div>
            </div>

            {/* Duration Card */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                <Activity className="w-3.5 h-3.5 text-emerald-500" />
                <span>Waktu Tempuh</span>
              </div>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
                {formatDuration(runner.elapsedSeconds)}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Estimasi Finish: <span className="font-semibold text-slate-700 dark:text-slate-300">{etaClock}</span>
              </div>
            </div>

            {/* Heart Rate & Cadence */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span>Detak Jantung</span>
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                {runner.heartRate} <span className="text-xs font-normal text-slate-500">bpm</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Zona 3: Aerobic Tempo</div>
            </div>

            {/* Sorak & Semangat */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span className="text-xs">❤️</span>
                <span>Dukungan Penonton</span>
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                {runner.cheersCount} <span className="text-xs font-normal text-slate-500">sorak</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Diberikan secara live</div>
            </div>
          </div>

          {/* Geodetic Coordinates (Teknik Geodesi Signature) */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
            <div className="flex items-center justify-between font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                Koordinat Geodesi (WGS 84 & UTM 49S)
              </span>
              <span className="text-[10px] text-slate-500 font-mono">EPSG:32749</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-slate-400 block text-[9px]">WGS84 LAT/LNG</span>
                <span>
                  {runner.currentLocation.lat.toFixed(5)}, {runner.currentLocation.lng.toFixed(5)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px]">ELEVASI MSL</span>
                <span>{runner.currentLocation.altitude || 145} m dpl</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px]">UTM EASTING (X)</span>
                <span>{utm.easting.toLocaleString('id-ID')} m E</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px]">UTM NORTHING (Y)</span>
                <span>{utm.northing.toLocaleString('id-ID')} m N</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={onOpenPaceAnalytics}
              className="w-full py-2.5 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-semibold text-xs border border-indigo-200 dark:border-indigo-800 flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Analisis & Grafik Pace (Recharts)</span>
            </button>

            <button
              onClick={() => onNavigateToRunner(runner)}
              className="w-full py-2.5 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-semibold text-xs border border-blue-200 dark:border-blue-800 flex items-center justify-center gap-2 transition-colors"
            >
              <Navigation className="w-4 h-4 text-blue-600" />
              <span>Rencanakan Rute untuk Mencegat Pelari Ini</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onOpenShareModal}
                className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-blue-500" />
                <span>Bagikan Lokasi</span>
              </button>

              <button
                onClick={onOpenSOSModal}
                className="py-2 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 font-semibold text-xs border border-rose-200 dark:border-rose-900/60 flex items-center justify-center gap-1.5 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                <span>Bantuan / Medis</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
