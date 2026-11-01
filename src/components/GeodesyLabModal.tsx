import React from 'react';
import { Runner } from '../types';
import { wgs84ToUTM49S } from '../utils/geoUtils';
import { ugmHalfMarathonRoute } from '../data/marathonData';
import { Compass, MapPin, Mountain, CheckCircle2, Info, X } from 'lucide-react';

interface GeodesyLabModalProps {
  activeRunner: Runner;
  onClose: () => void;
}

export const GeodesyLabModal: React.FC<GeodesyLabModalProps> = ({ activeRunner, onClose }) => {
  const utm = wgs84ToUTM49S(activeRunner.currentLocation.lat, activeRunner.currentLocation.lng);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-2xl mx-auto space-y-5 max-h-[85vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Laboratorium Geodesi & Geomatika UGM
            </h3>
            <p className="text-xs text-slate-500">
              Transformasi Sistem Koordinat Geodetik Presisi (WGS 84 & UTM Zone 49S)
            </p>
          </div>
        </div>
      </div>

      {/* Live Geodetic Transformation Box */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-inner space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-blue-400 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            Koordinat Real-Time Pelari: {activeRunner.name} ({activeRunner.bibNumber})
          </span>
          <span className="font-mono text-[10px] bg-slate-800 px-2 py-0.5 rounded text-emerald-400">
            DGN95 / UTM Zone 49S
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block font-mono">LATITUDE (&phi;)</span>
            <span className="text-sm font-bold font-mono text-emerald-300">
              {activeRunner.currentLocation.lat.toFixed(6)}&deg; S
            </span>
          </div>

          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block font-mono">LONGITUDE (&lambda;)</span>
            <span className="text-sm font-bold font-mono text-emerald-300">
              {activeRunner.currentLocation.lng.toFixed(6)}&deg; E
            </span>
          </div>

          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block font-mono">UTM EASTING (X)</span>
            <span className="text-sm font-bold font-mono text-cyan-300">
              {utm.easting.toLocaleString('id-ID')} m
            </span>
          </div>

          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block font-mono">UTM NORTHING (Y)</span>
            <span className="text-sm font-bold font-mono text-cyan-300">
              {utm.northing.toLocaleString('id-ID')} m
            </span>
          </div>
        </div>

        {/* Secondary Geodetic Parameters */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] font-mono text-slate-300">
          <div>
            <span className="text-slate-400 block text-[9px]">KONVERGENSI MERIDIAN (&gamma;)</span>
            <span>{utm.convergenceAngle}&deg;</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px]">FAKTOR SKALA TITIK (k)</span>
            <span>{utm.pointScaleFactor}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px]">ELEVASI ORTHOMETRIK (MSL)</span>
            <span>{activeRunner.currentLocation.altitude || 145} m dpl</span>
          </div>
        </div>
      </div>

      {/* Elevation Profile along the 21K Route */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
          <span className="flex items-center gap-1.5">
            <Mountain className="w-4 h-4 text-emerald-600" />
            Profil Elevasi Rute Half Marathon UGM (21.0975 km)
          </span>
          <span className="text-[11px] text-slate-500 font-mono">139m s/d 160m dpl</span>
        </div>

        {/* Simple Elevation Curve SVG */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
          <svg className="w-full h-24" viewBox="0 0 400 90" fill="none">
            {/* Grid lines */}
            <line x1="0" y1="20" x2="400" y2="20" stroke="#94a3b8" strokeDasharray="3,3" opacity="0.3" />
            <line x1="0" y1="50" x2="400" y2="50" stroke="#94a3b8" strokeDasharray="3,3" opacity="0.3" />
            <line x1="0" y1="80" x2="400" y2="80" stroke="#94a3b8" strokeDasharray="3,3" opacity="0.3" />

            {/* Gradient Area under elevation curve */}
            <path
              d="M 0 55 Q 30 65 60 40 T 120 18 T 180 25 T 240 45 T 300 48 T 360 52 T 400 55 L 400 90 L 0 90 Z"
              fill="url(#elevation-grad)"
              opacity="0.4"
            />
            {/* Elevation line */}
            <path
              d="M 0 55 Q 30 65 60 40 T 120 18 T 180 25 T 240 45 T 300 48 T 360 52 T 400 55"
              stroke="#2563eb"
              strokeWidth="2.5"
            />

            {/* Runner current position on elevation profile */}
            {(() => {
              const xPos = Math.min(395, Math.max(5, (activeRunner.distanceKm / 21.1) * 400));
              return (
                <circle cx={xPos} cy="38" r="4.5" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
              );
            })()}

            <defs>
              <linearGradient id="elevation-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>

          <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-1">
            <span>KM 0 (GSP: 142m)</span>
            <span>KM 5 (MM UGM: 152m)</span>
            <span>KM 10 (Kentungan: 160m)</span>
            <span>KM 15 (Lembah: 144m)</span>
            <span>KM 21.1 (Finish: 142m)</span>
          </div>
        </div>
      </div>

      {/* Geodetic Education & Reference Parameters */}
      <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-900/60 text-xs text-slate-700 dark:text-slate-300 space-y-2">
        <div className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-blue-600" />
          Konfigurasi Proyeksi Geodesi Indonesia:
        </div>
        <ul className="space-y-1 text-[11px] list-disc list-inside text-slate-600 dark:text-slate-400">
          <li>
            <strong>Datum Geodesi Nasional 1995 (DGN95):</strong> Menggunakan elipsoid referensi
            WGS 1984 (Semi-major axis $a = 6.378.137,0$ m, $1/f = 298,257223563$).
          </li>
          <li>
            <strong>Sistem Proyeksi UTM Zone 49S:</strong> Wilayah D.I. Yogyakarta terletak pada
            Zona 49 Belahan Bumi Selatan dengan Meridian Sentral $111^\circ$ BT.
          </li>
          <li>
            <strong>Faktor Skala Sentral ($k_0$):</strong> $0,9996$ dengan False Easting $500.000$ m
            dan False Northing $10.000.000$ m.
          </li>
        </ul>
      </div>
    </div>
  );
};
