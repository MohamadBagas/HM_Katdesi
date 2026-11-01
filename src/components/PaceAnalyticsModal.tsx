import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell,
} from 'recharts';
import { Runner, RunnerSplit } from '../types';
import { formatDuration, formatPace } from '../utils/geoUtils';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Flame,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Download,
  Award,
  ChevronRight,
  X,
} from 'lucide-react';

interface PaceAnalyticsModalProps {
  runners: Runner[];
  activeRunnerId: string;
  onSelectRunner: (runnerId: string) => void;
  onClose: () => void;
}

export const PaceAnalyticsModal: React.FC<PaceAnalyticsModalProps> = ({
  runners,
  activeRunnerId,
  onSelectRunner,
  onClose,
}) => {
  const [selectedRunnerId, setSelectedRunnerId] = useState<string>(activeRunnerId);
  const [chartView, setChartView] = useState<'splits' | 'correlation'>('splits');

  const currentRunner = runners.find((r) => r.id === selectedRunnerId) || runners[0];
  const splits = currentRunner.splits || [];

  // Generate complete splits if runner has moved further than existing split array
  const currentKmCount = Math.floor(currentRunner.distanceKm);
  const displaySplits: RunnerSplit[] = [...splits];

  if (displaySplits.length < currentKmCount) {
    for (let k = displaySplits.length + 1; k <= currentKmCount; k++) {
      const paceVal = currentRunner.paceMinPerKm + (Math.sin(k) * 0.15);
      const splitSec = Math.round(paceVal * 60);
      const cumSec = (displaySplits[displaySplits.length - 1]?.splitSeconds || 0) + splitSec;
      displaySplits.push({
        km: k,
        paceMinutes: Math.round(paceVal * 100) / 100,
        paceFormatted: formatPace(paceVal),
        splitSeconds: splitSec,
        cumulativeTime: formatDuration(cumSec),
        speedKmh: Math.round((60 / paceVal) * 10) / 10,
        heartRate: Math.min(185, Math.round(currentRunner.heartRate + (k * 1.2))),
        elevation: 140 + Math.round(Math.sin(k * 0.8) * 12),
      });
    }
  }

  // Calculate Performance Analytics
  const avgPaceMinutes =
    displaySplits.length > 0
      ? displaySplits.reduce((acc, s) => acc + s.paceMinutes, 0) / displaySplits.length
      : currentRunner.paceMinPerKm;

  const fastestSplit =
    displaySplits.length > 0
      ? displaySplits.reduce((prev, curr) => (curr.paceMinutes < prev.paceMinutes ? curr : prev))
      : null;

  const slowestSplit =
    displaySplits.length > 0
      ? displaySplits.reduce((prev, curr) => (curr.paceMinutes > prev.paceMinutes ? curr : prev))
      : null;

  // Pace Consistency Variance (Standard Deviation in seconds)
  const paceVarianceSec =
    displaySplits.length > 1
      ? Math.round(
          Math.sqrt(
            displaySplits.reduce(
              (acc, s) => acc + Math.pow((s.paceMinutes - avgPaceMinutes) * 60, 2),
              0
            ) / displaySplits.length
          )
        )
      : 8;

  // Target Pace for Half Marathon (Sub-2 target = 5:41 /km = 5.68 decimal minutes)
  const targetSub2Pace = 5.68;

  // Format decimal minutes for Recharts Y-Axis (e.g. 5.5 -> 5:30)
  const formatYAxisPace = (val: number) => {
    const mins = Math.floor(val);
    const secs = Math.round((val - mins) * 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as RunnerSplit;
      const diffFromAvg = Math.round((data.paceMinutes - avgPaceMinutes) * 60);
      const isFaster = diffFromAvg < 0;

      return (
        <div className="bg-slate-950/95 text-white p-3 rounded-xl shadow-xl border border-slate-700/80 text-xs space-y-1.5 backdrop-blur-sm">
          <div className="font-bold text-sm text-blue-400 border-b border-slate-800 pb-1 flex justify-between items-center gap-4">
            <span>Kilometer {label}</span>
            <span className="text-[10px] text-slate-400 font-mono">Waktu Kumulatif: {data.cumulativeTime}</span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-0.5">
            <div>
              <span className="text-slate-400 block text-[10px]">Pace:</span>
              <span className="font-bold font-mono text-emerald-400 text-sm">
                {data.paceFormatted}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Kecepatan:</span>
              <span className="font-bold font-mono text-white">
                {data.speedKmh} km/h
              </span>
            </div>
            {data.heartRate && (
              <div>
                <span className="text-slate-400 block text-[10px]">Detak Jantung:</span>
                <span className="font-bold font-mono text-rose-400">
                  {data.heartRate} bpm
                </span>
              </div>
            )}
            {data.elevation && (
              <div>
                <span className="text-slate-400 block text-[10px]">Elevasi:</span>
                <span className="font-bold font-mono text-cyan-300">
                  {data.elevation} m dpl
                </span>
              </div>
            )}
          </div>

          <div className="pt-1 text-[10px] text-slate-400 border-t border-slate-800">
            {isFaster ? (
              <span className="text-emerald-400 font-semibold">
                ▲ {Math.abs(diffFromAvg)} detik lebih cepat dari rata-rata lari
              </span>
            ) : diffFromAvg > 0 ? (
              <span className="text-amber-400 font-semibold">
                ▼ {diffFromAvg} detik lebih lambat dari rata-rata lari
              </span>
            ) : (
              <span className="text-slate-300">Tepat di rata-rata lari</span>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Export CSV summary
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,KM,Pace,SplitSeconds,CumulativeTime,SpeedKmh,HeartRate,Elevation\n';
    displaySplits.forEach((s) => {
      csvContent += `${s.km},${s.paceFormatted},${s.splitSeconds},${s.cumulativeTime},${s.speedKmh},${s.heartRate || 0},${s.elevation || 0}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Pace_Analysis_${currentRunner.bibNumber}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 md:p-6 w-full max-w-4xl max-h-[92vh] flex flex-col space-y-4 relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 shrink-0 pr-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                Analisis Kecepatan & Grafik Pace (Recharts)
              </h3>
              <p className="text-xs text-slate-500">
                Visualisasi split kilometer, ritme lari, dan konsistensi kecepatan Half Marathon
              </p>
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>
        </div>

        {/* Runner Selector Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl overflow-x-auto shrink-0">
          {runners.map((r) => {
            const isSelected = r.id === selectedRunnerId;
            return (
              <button
                key={r.id}
                onClick={() => {
                  setSelectedRunnerId(r.id);
                  onSelectRunner(r.id);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-300 dark:ring-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: r.color }}
                />
                <span>{r.name}</span>
                <span className="text-[10px] opacity-75 font-mono">({r.bibNumber})</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* KPI Analytics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Avg Pace */}
            <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60">
              <div className="flex items-center justify-between text-xs text-blue-700 dark:text-blue-300 mb-1">
                <span>Rata-rata Pace</span>
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div className="text-xl font-extrabold text-blue-950 dark:text-blue-100 font-mono tabular-nums">
                {formatPace(avgPaceMinutes)}
              </div>
              <div className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">
                {(60 / avgPaceMinutes).toFixed(1)} km/jam
              </div>
            </div>

            {/* Fastest Split */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60">
              <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300 mb-1">
                <span>KM Tercepat</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
              <div className="text-xl font-extrabold text-emerald-950 dark:text-emerald-100 font-mono tabular-nums">
                {fastestSplit ? fastestSplit.paceFormatted : '-'}
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                {fastestSplit ? `Tercapai di KM ${fastestSplit.km}` : 'Memulai lari'}
              </div>
            </div>

            {/* Slowest Split */}
            <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60">
              <div className="flex items-center justify-between text-xs text-amber-700 dark:text-amber-300 mb-1">
                <span>KM Terberat</span>
                <ArrowDownRight className="w-3.5 h-3.5" />
              </div>
              <div className="text-xl font-extrabold text-amber-950 dark:text-amber-100 font-mono tabular-nums">
                {slowestSplit ? slowestSplit.paceFormatted : '-'}
              </div>
              <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">
                {slowestSplit ? `Di KM ${slowestSplit.km} (Tanjakan)` : '-'}
              </div>
            </div>

            {/* Pace Consistency Variance */}
            <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60">
              <div className="flex items-center justify-between text-xs text-purple-700 dark:text-purple-300 mb-1">
                <span>Konsistensi Pacing</span>
                <Activity className="w-3.5 h-3.5" />
              </div>
              <div className="text-xl font-extrabold text-purple-950 dark:text-purple-100 font-mono tabular-nums">
                &plusmn;{paceVarianceSec} dtk
              </div>
              <div className="text-[10px] text-purple-600 dark:text-purple-400 mt-0.5">
                {paceVarianceSec <= 10 ? 'Pacing Sangat Konsisten' : 'Fluktuasi Terkontrol'}
              </div>
            </div>
          </div>

          {/* Chart Controls & View Selector */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setChartView('splits')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  chartView === 'splits'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Grafik Batang Pace per KM
              </button>
              <button
                onClick={() => setChartView('correlation')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  chartView === 'correlation'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Korelasi Pace & Detak Jantung
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
                <span>Lebih Cepat dari Rata-rata</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-amber-500 inline-block" />
                <span>Lebih Lambat</span>
              </span>
            </div>
          </div>

          {/* Recharts Visualization Container */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 h-72 md:h-80 w-full">
            {displaySplits.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <Activity className="w-8 h-8 mb-2 opacity-50" />
                <span>Pelari belum menyelesaikan KM pertama untuk menghasilkan grafik split.</span>
              </div>
            ) : chartView === 'splits' ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={displaySplits}
                  margin={{ top: 20, right: 20, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} vertical={false} />
                  <XAxis
                    dataKey="km"
                    tickFormatter={(km) => `KM ${km}`}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    stroke="#94a3b8"
                  />
                  <YAxis
                    domain={['dataMin - 0.5', 'dataMax + 0.5']}
                    tickFormatter={formatYAxisPace}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    stroke="#94a3b8"
                  />
                  <Tooltip content={<CustomTooltip />} />

                  {/* Reference Line for Runner's Average Pace */}
                  <ReferenceLine
                    y={avgPaceMinutes}
                    stroke="#2563eb"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                    label={{
                      value: `Rata-rata: ${formatPace(avgPaceMinutes)}`,
                      fill: '#2563eb',
                      fontSize: 10,
                      position: 'top',
                    }}
                  />

                  {/* Reference Line for Sub-2 Half Marathon Target Pace (5:41 /km) */}
                  <ReferenceLine
                    y={targetSub2Pace}
                    stroke="#dc2626"
                    strokeDasharray="2 2"
                    strokeWidth={1.5}
                    label={{
                      value: 'Target Sub-2 (5:41)',
                      fill: '#dc2626',
                      fontSize: 10,
                      position: 'bottom',
                    }}
                  />

                  {/* Bar for Each Kilometer with Dynamic Color based on comparison with average */}
                  <Bar dataKey="paceMinutes" radius={[6, 6, 0, 0]} maxBarSize={45}>
                    {displaySplits.map((entry, index) => {
                      const isFasterThanAvg = entry.paceMinutes <= avgPaceMinutes;
                      const isFasterThanTarget = entry.paceMinutes <= targetSub2Pace;
                      const fillColor = isFasterThanTarget
                        ? '#059669' // Strong Emerald
                        : isFasterThanAvg
                        ? '#3b82f6' // Steady Blue
                        : '#f59e0b'; // Amber
                      return <Cell key={`cell-${index}`} fill={fillColor} />;
                    })}
                  </Bar>
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={displaySplits}
                  margin={{ top: 20, right: 20, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                  <XAxis
                    dataKey="km"
                    tickFormatter={(km) => `KM ${km}`}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  {/* Left YAxis: Speed (km/h) */}
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    tick={{ fontSize: 11, fill: '#3b82f6' }}
                    domain={[8, 16]}
                    tickFormatter={(v) => `${v} km/h`}
                  />
                  {/* Right YAxis: Heart Rate (bpm) */}
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 11, fill: '#f43f5e' }}
                    domain={[120, 195]}
                    tickFormatter={(v) => `${v} bpm`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="top"
                    wrapperStyle={{ fontSize: 11, paddingBottom: 10 }}
                  />

                  {/* Area for Elevation */}
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="elevation"
                    fill="#e2e8f0"
                    stroke="#94a3b8"
                    name="Elevasi (m dpl)"
                    opacity={0.3}
                  />

                  {/* Line for Speed */}
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="speedKmh"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    name="Kecepatan (km/h)"
                    dot={{ r: 3, fill: '#3b82f6' }}
                  />

                  {/* Line for Heart Rate */}
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="heartRate"
                    stroke="#f43f5e"
                    strokeWidth={2.5}
                    name="Detak Jantung (bpm)"
                    dot={{ r: 3, fill: '#f43f5e' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Splits Breakdown Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
              <span>Tabel Rincian Split Per Kilometer</span>
              <span className="text-[11px] text-slate-500 font-normal">
                {displaySplits.length} KM Selesai Dicatat
              </span>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">KM</th>
                      <th className="py-2.5 px-3">Pace Rata-rata</th>
                      <th className="py-2.5 px-3">Kecepatan</th>
                      <th className="py-2.5 px-3">Waktu Split</th>
                      <th className="py-2.5 px-3">Waktu Kumulatif</th>
                      <th className="py-2.5 px-3">Detak Jantung</th>
                      <th className="py-2.5 px-3">Elevasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                    {displaySplits.map((s) => {
                      const isFastest = fastestSplit?.km === s.km;
                      const isSlowerThanTarget = s.paceMinutes > targetSub2Pace;

                      return (
                        <tr
                          key={s.km}
                          className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                            isFastest ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>KM {s.km}</span>
                            {isFastest && (
                              <span className="text-[9px] bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-1 py-0.2 rounded font-sans font-semibold">
                                Best
                              </span>
                            )}
                          </td>
                          <td
                            className={`py-2.5 px-3 font-bold ${
                              s.paceMinutes <= avgPaceMinutes
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            {s.paceFormatted}
                          </td>
                          <td className="py-2.5 px-3">{s.speedKmh} km/h</td>
                          <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                            {formatDuration(s.splitSeconds)}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                            {s.cumulativeTime}
                          </td>
                          <td className="py-2.5 px-3 text-rose-600 dark:text-rose-400">
                            {s.heartRate ? `${s.heartRate} bpm` : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">
                            {s.elevation ? `${s.elevation} m` : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
