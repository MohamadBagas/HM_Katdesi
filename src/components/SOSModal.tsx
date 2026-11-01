import React from 'react';
import { Runner } from '../types';
import { wgs84ToUTM49S } from '../utils/geoUtils';
import { AlertTriangle, Phone, MessageSquare, MapPin, X, ShieldAlert } from 'lucide-react';

interface SOSModalProps {
  runner: Runner;
  isOpen: boolean;
  onClose: () => void;
}

export const SOSModal: React.FC<SOSModalProps> = ({ runner, isOpen, onClose }) => {
  if (!isOpen) return null;

  const utm = wgs84ToUTM49S(runner.currentLocation.lat, runner.currentLocation.lng);

  const nearestPoint =
    runner.distanceKm <= 5
      ? 'Pos Medis Start/Finish GSP & WS 1 (KM 5)'
      : runner.distanceKm <= 12
      ? 'Pos Medis 1 - Simpang Kentungan (KM 10)'
      : 'Pos Medis 2 - Wisdom Park Lembah UGM (KM 15) & Cheer Zone KPTU FT';

  const handleWhatsAppEmergency = () => {
    const text = `🚨 DARURAT MEDIS - UGM HALF MARATHON\n\nNama Pelari: ${runner.name} (${runner.bibNumber})\nJarak Saat Ini: KM ${runner.distanceKm.toFixed(2)}\nPos Terdekat: ${nearestPoint}\nKoordinat WGS84: ${runner.currentLocation.lat.toFixed(6)}, ${runner.currentLocation.lng.toFixed(6)}\nKoordinat UTM 49S: ${utm.easting} m E, ${utm.northing} m N\n\nMohon tim medis/ambulans terdekat segera menuju lokasi!`;
    window.open(`https://api.whatsapp.com/send?phone=6281234567890&text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-rose-200 dark:border-rose-900/60 p-6 w-full max-w-md relative space-y-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Bantuan Darurat & Medis
            </h3>
            <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
              UGM Geodesy HM Emergency Dispatch
            </p>
          </div>
        </div>

        {/* Current Location Dispatch Info */}
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 rounded-2xl border border-rose-200 dark:border-rose-900/40 text-xs space-y-2">
          <div className="font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-rose-600" />
            Titik Koordinat Evakuasi Anda:
          </div>
          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-rose-100 dark:border-rose-900 font-mono text-[11px] text-slate-800 dark:text-slate-200 space-y-1">
            <div>
              <strong>Pelari:</strong> {runner.name} ({runner.bibNumber})
            </div>
            <div>
              <strong>Pos Terdekat:</strong> {nearestPoint}
            </div>
            <div>
              <strong>WGS84:</strong> {runner.currentLocation.lat.toFixed(5)}, {runner.currentLocation.lng.toFixed(5)}
            </div>
            <div>
              <strong>UTM 49S:</strong> {utm.easting} m E, {utm.northing} m N
            </div>
          </div>
        </div>

        {/* Emergency Call Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleWhatsAppEmergency}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Kirim Koordinat ke WhatsApp Medis UGM</span>
          </button>

          <a
            href="tel:112"
            className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Phone className="w-4 h-4" />
            <span>Panggil Hotline Medis & Ambulans (112)</span>
          </a>
        </div>

        <div className="text-[11px] text-slate-500 text-center leading-relaxed">
          Jika mengalami kram otot akut, dehidrasi, atau pusing, segera berhenti di sisi jalan, cari
          tempat teduh, dan petugas marshals terdekat dengan rompi oranye akan segera menghampiri
          Anda.
        </div>
      </div>
    </div>
  );
};
