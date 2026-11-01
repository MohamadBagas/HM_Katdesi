import React, { useState, useEffect } from 'react';
import { LandmarkLocation, LatLng, PointOfInterest, Runner, JourneyPlan } from '../types';
import { calculateDistanceKm, formatDuration } from '../utils/geoUtils';
import {
  Navigation,
  MapPin,
  Footprints,
  Bike,
  Car,
  Clock,
  ArrowRight,
  Sparkles,
  MousePointerClick,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface JourneyPlannerProps {
  landmarks: LandmarkLocation[];
  pois: PointOfInterest[];
  runners: Runner[];
  activeRunner: Runner;
  currentPlan: JourneyPlan | null;
  onSetJourneyPlan: (plan: JourneyPlan | null) => void;
  onStartSelectingPoint: (pointType: 'origin' | 'destination') => void;
  isSelectingPoint: 'origin' | 'destination' | null;
  selectedMapPoint: { type: 'origin' | 'destination'; point: LatLng } | null;
  onClose: () => void;
}

export const JourneyPlanner: React.FC<JourneyPlannerProps> = ({
  landmarks,
  pois,
  runners,
  activeRunner,
  currentPlan,
  onSetJourneyPlan,
  onStartSelectingPoint,
  isSelectingPoint,
  selectedMapPoint,
  onClose,
}) => {
  // Origin setup
  const [originType, setOriginType] = useState<string>('lm-tentrem');
  const [customOrigin, setCustomOrigin] = useState<LatLng | null>(null);

  // Destination setup
  const [destType, setDestType] = useState<string>('poi-ws-1');
  const [customDest, setCustomDest] = useState<LatLng | null>(null);

  // Mode
  const [travelMode, setTravelMode] = useState<'walk' | 'bike' | 'drive'>('walk');

  // Sync point picked from map
  useEffect(() => {
    if (selectedMapPoint) {
      if (selectedMapPoint.type === 'origin') {
        setOriginType('custom-map');
        setCustomOrigin(selectedMapPoint.point);
      } else if (selectedMapPoint.type === 'destination') {
        setDestType('custom-map');
        setCustomDest(selectedMapPoint.point);
      }
    }
  }, [selectedMapPoint]);

  // Resolve coordinates
  const resolveLocation = (
    type: string,
    custom: LatLng | null
  ): { name: string; loc: LatLng } => {
    if (type === 'custom-map' && custom) {
      return {
        name: `Titik Pilihan Peta (${custom.lat.toFixed(4)}, ${custom.lng.toFixed(4)})`,
        loc: custom,
      };
    }
    if (type === 'runner-live') {
      return {
        name: `Lokasi Terkini ${activeRunner.name} (${activeRunner.bibNumber})`,
        loc: activeRunner.currentLocation,
      };
    }
    // Check POIs
    const foundPoi = pois.find((p) => p.id === type);
    if (foundPoi) {
      return {
        name: `${foundPoi.name} (KM ${foundPoi.kmMark})`,
        loc: foundPoi.location,
      };
    }
    // Check Landmarks
    const foundLm = landmarks.find((l) => l.id === type);
    if (foundLm) {
      return {
        name: foundLm.name,
        loc: foundLm.location,
      };
    }
    // Default GSP UGM
    return {
      name: 'Grha Sabha Pramana (GSP) UGM',
      loc: { lat: -7.7702, lng: 110.3776 },
    };
  };

  // Generate turn-by-turn guidance and intermediate waypoints
  const calculateRoute = () => {
    const origin = resolveLocation(originType, customOrigin);
    const dest = resolveLocation(destType, customDest);

    const distKm = calculateDistanceKm(origin.loc, dest.loc);

    // Speed in km/h: walk = 4.5, bike = 15, drive = 32
    const speed = travelMode === 'walk' ? 4.5 : travelMode === 'bike' ? 15 : 32;
    const estMinutes = Math.max(2, Math.round((distKm / speed) * 60));

    // Generate interpolated waypoints following roads
    const stepsCount = Math.max(5, Math.min(25, Math.round(distKm * 8)));
    const waypoints: LatLng[] = [];

    for (let i = 0; i <= stepsCount; i++) {
      const ratio = i / stepsCount;
      // Add slight organic curve to represent road grid in Yogyakarta
      const bend = Math.sin(ratio * Math.PI) * 0.002;
      waypoints.push({
        lat: origin.loc.lat + (dest.loc.lat - origin.loc.lat) * ratio + bend,
        lng: origin.loc.lng + (dest.loc.lng - origin.loc.lng) * ratio - bend * 0.5,
      });
    }

    // Step by step instructions
    const instructions: string[] = [
      `Mulai perjalanan dari ${origin.name}`,
      `Arahkan ke koridor utama menuju ${dest.name}`,
      distKm > 2
        ? `Lanjutkan sepanjang rute sekitar ${(distKm * 0.6).toFixed(1)} km melewati jalan lingkar kampus`
        : `Jalan lurus melintasi trotoar kampus UGM yang teduh`,
      `Tiba di lokasi tujuan: ${dest.name}`,
    ];

    // Calculate Intercept Information if Destination is on the course!
    let interceptInfo = undefined;
    const targetPoi = pois.find((p) => p.id === destType);

    if (targetPoi) {
      const runnerDist = activeRunner.distanceKm;
      const poiKm = targetPoi.kmMark;
      const remainingDistForRunner = poiKm - runnerDist;

      // When will runner reach this point?
      const runnerPace = activeRunner.paceMinPerKm || 5.5;
      const runnerMinutesToPoint = Math.round(remainingDistForRunner * runnerPace);

      const now = new Date();
      const runnerEta = new Date(now.getTime() + runnerMinutesToPoint * 60000);
      const userEta = new Date(now.getTime() + estMinutes * 60000);

      const runnerEtaStr = runnerEta.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const userEtaStr = userEta.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const minutesAhead = runnerMinutesToPoint - estMinutes;

      let advice = '';
      if (remainingDistForRunner < -0.5) {
        advice = `Pelari Anda sudah melewati titik ini sekitar ${Math.abs(
          Math.round(remainingDistForRunner * runnerPace)
        )} menit yang lalu. Disarankan menuju Water Station atau Cheer Point berikutnya!`;
      } else if (minutesAhead > 5) {
        advice = `Waktu sangat ideal! Anda akan tiba sekitar ${minutesAhead} menit sebelum pelari melintas. Anda punya cukup waktu untuk mencari sudut foto terbaik di ${targetPoi.name}!`;
      } else if (minutesAhead >= 0) {
        advice = `Cukup tepat waktu! Anda akan tiba sekitar ${minutesAhead} menit sebelum pelari. Segera berangkat sekarang agar tidak berpapasan mendadak.`;
      } else {
        advice = `Perhatian: Pelari diprediksi melintas ${Math.abs(
          minutesAhead
        )} menit sebelum Anda tiba jika ${
          travelMode === 'walk' ? 'berjalan kaki' : 'berkendara'
        }. Pertimbangkan menggunakan sepeda/motor atau pilih titik yang lebih jauh.`;
      }

      interceptInfo = {
        runnerBib: activeRunner.bibNumber,
        runnerName: activeRunner.name,
        runnerEtaAtPoint: runnerEtaStr,
        userEtaAtPoint: userEtaStr,
        advice,
        minutesAheadOrBehind: minutesAhead,
      };
    }

    const newPlan: JourneyPlan = {
      fromName: origin.name,
      fromLocation: origin.loc,
      toName: dest.name,
      toLocation: dest.loc,
      mode: travelMode,
      distanceKm: Math.round(distKm * 10) / 10,
      estimatedMinutes: estMinutes,
      waypoints,
      turnInstructions: instructions,
      interceptInfo,
    };

    onSetJourneyPlan(newPlan);
    onClose();
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 w-full max-w-lg mx-auto space-y-4 max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
            <Navigation className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Rute & Navigasi Perjalanan
            </h3>
            <p className="text-xs text-slate-500">
              Lacak rute menuju pelari atau titik acara Half Marathon UGM
            </p>
          </div>
        </div>
      </div>

      {/* Origin Selection */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          Titik Berangkat (Origin)
        </label>
        <div className="flex gap-2">
          <select
            value={originType}
            onChange={(e) => setOriginType(e.target.value)}
            className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <optgroup label="Landmark & Hotel Sekitar UGM">
              {landmarks.map((lm) => (
                <option key={lm.id} value={lm.id}>
                  {lm.name}
                </option>
              ))}
            </optgroup>
            {customOrigin && (
              <option value="custom-map">
                📍 Titik Klik Peta ({customOrigin.lat.toFixed(3)}, {customOrigin.lng.toFixed(3)})
              </option>
            )}
          </select>

          <button
            onClick={() => onStartSelectingPoint('origin')}
            title="Klik di Peta untuk menentukan Titik Berangkat"
            className={`px-3 py-2 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              isSelectingPoint === 'origin'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200'
            }`}
          >
            <MousePointerClick className="w-3.5 h-3.5" />
            <span>Pilih di Peta</span>
          </button>
        </div>
      </div>

      {/* Destination Selection */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
          Titik Tujuan / Titik Cegat (Destination)
        </label>
        <div className="flex gap-2">
          <select
            value={destType}
            onChange={(e) => setDestType(e.target.value)}
            className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <optgroup label="Pos Lomba & Water Station (Rekomendasi Penonton)">
              {pois.map((poi) => (
                <option key={poi.id} value={poi.id}>
                  {poi.name} (KM {poi.kmMark})
                </option>
              ))}
            </optgroup>
            <optgroup label="Pelari Aktif (Live Intercept)">
              <option value="runner-live">
                🏃 Lokasi Terkini {activeRunner.name} ({activeRunner.bibNumber})
              </option>
            </optgroup>
            <optgroup label="Landmark Yogyakarta Lainnya">
              {landmarks.map((lm) => (
                <option key={lm.id} value={lm.id}>
                  {lm.name}
                </option>
              ))}
            </optgroup>
            {customDest && (
              <option value="custom-map">
                📍 Titik Klik Peta ({customDest.lat.toFixed(3)}, {customDest.lng.toFixed(3)})
              </option>
            )}
          </select>

          <button
            onClick={() => onStartSelectingPoint('destination')}
            title="Klik di Peta untuk menentukan Titik Tujuan"
            className={`px-3 py-2 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              isSelectingPoint === 'destination'
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-200'
            }`}
          >
            <MousePointerClick className="w-3.5 h-3.5" />
            <span>Pilih di Peta</span>
          </button>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Moda Transportasi
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setTravelMode('walk')}
            className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              travelMode === 'walk'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Footprints className="w-4 h-4" />
            <span>Jalan Kaki</span>
          </button>

          <button
            type="button"
            onClick={() => setTravelMode('bike')}
            className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              travelMode === 'bike'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>Sepeda</span>
          </button>

          <button
            type="button"
            onClick={() => setTravelMode('drive')}
            className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              travelMode === 'drive'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Motor/Mobil</span>
          </button>
        </div>
      </div>

      {/* Calculate & Plot Button */}
      <div className="pt-2">
        <button
          onClick={calculateRoute}
          className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98"
        >
          <Sparkles className="w-4 h-4 text-blue-200" />
          <span>Kalkulasi Rute & Tampilkan di Peta</span>
        </button>
      </div>

      {/* Active Plan Summary if existing */}
      {currentPlan && (
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Rute Aktif Saat Ini
            </span>
            <span className="text-blue-600 dark:text-blue-400 font-mono">
              {currentPlan.distanceKm} km · ~{currentPlan.estimatedMinutes} menit
            </span>
          </div>

          <div className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
            {currentPlan.fromName} <ArrowRight className="w-3 h-3 inline text-slate-400" />{' '}
            {currentPlan.toName}
          </div>

          {/* Intercept calculation note */}
          {currentPlan.interceptInfo && (
            <div className="mt-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-900 dark:text-emerald-200 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <span>⏱️ Kalkulasi Temu Pelari:</span>
              </div>
              <p>{currentPlan.interceptInfo.advice}</p>
              <div className="flex gap-4 pt-1 font-mono text-[10px] text-emerald-700 dark:text-emerald-300">
                <span>Estimasi Pelari: {currentPlan.interceptInfo.runnerEtaAtPoint}</span>
                <span>Estimasi Anda: {currentPlan.interceptInfo.userEtaAtPoint}</span>
              </div>
            </div>
          )}

          <div className="pt-1 flex justify-end">
            <button
              onClick={() => onSetJourneyPlan(null)}
              className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline"
            >
              Hapus Rute dari Peta
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
