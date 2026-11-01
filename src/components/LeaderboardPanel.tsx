import React, { useState } from 'react';
import { Runner } from '../types';
import { formatDuration, formatPace } from '../utils/geoUtils';
import {
  Trophy,
  Medal,
  Search,
  Crosshair,
  Flame,
  ArrowUpDown,
  Navigation,
  CheckCircle2,
  Users,
  ChevronRight,
} from 'lucide-react';

interface LeaderboardPanelProps {
  runners: Runner[];
  activeRunnerId: string;
  onSelectRunner: (runnerId: string) => void;
  onSendCheer: (runnerId: string, type: 'clap' | 'water' | 'energy' | 'cheer') => void;
  onNavigateToRunner: (runner: Runner) => void;
}

export const LeaderboardPanel: React.FC<LeaderboardPanelProps> = ({
  runners,
  activeRunnerId,
  onSelectRunner,
  onSendCheer,
  onNavigateToRunner,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rank' | 'pace' | 'cheers'>('rank');

  // Filter runners
  const filteredRunners = runners.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.bibNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.club.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || r.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Real-time Sorting Algorithm
  const sortedRunners = [...filteredRunners].sort((a, b) => {
    if (sortBy === 'pace') {
      return a.paceMinPerKm - b.paceMinPerKm;
    }
    if (sortBy === 'cheers') {
      return b.cheersCount - a.cheersCount;
    }

    // Default 'rank': Finished runners first sorted by elapsedSeconds asc,
    // then running runners sorted by distanceKm desc, then elapsedSeconds asc.
    if (a.status === 'finished' && b.status !== 'finished') return -1;
    if (b.status === 'finished' && a.status !== 'finished') return 1;

    if (a.status === 'finished' && b.status === 'finished') {
      return a.elapsedSeconds - b.elapsedSeconds;
    }

    // Both running: compare distance
    if (Math.abs(b.distanceKm - a.distanceKm) > 0.05) {
      return b.distanceKm - a.distanceKm;
    }

    // If practically same distance, whoever has lower elapsed time is ahead
    return a.elapsedSeconds - b.elapsedSeconds;
  });

  const totalRunners = runners.length;
  const raceLeader = sortedRunners[0];
  const totalAvgDistance =
    runners.reduce((acc, r) => acc + r.distanceKm, 0) / (totalRunners || 1);

  return (
    <div className="bg-white dark:bg-slate-900 flex flex-col h-full overflow-hidden transition-colors">
      {/* Top Header & Event Quick Stats */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                Live Leaderboard Half Marathon
              </h2>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                Peringkat posisi real-time berdasarkan jarak & waktu
              </span>
            </div>
          </div>

          <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-full font-mono">
            LIVE 21.1K
          </span>
        </div>

        {/* Mini stats cards */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 block font-medium">PEMIMPIN LOMBA</span>
            <div className="font-bold text-slate-900 dark:text-white truncate">
              {raceLeader ? raceLeader.name : '-'}
            </div>
            <div className="text-[10px] text-blue-600 dark:text-blue-400 font-mono mt-0.5">
              {raceLeader ? `${raceLeader.distanceKm.toFixed(1)} km · ${formatPace(raceLeader.paceMinPerKm)}` : ''}
            </div>
          </div>

          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 block font-medium">TOTAL DI LINTASAN</span>
            <div className="font-bold text-slate-900 dark:text-white font-mono">
              {totalRunners} Pelari
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              Rata-rata: {totalAvgDistance.toFixed(1)} km
            </div>
          </div>
        </div>

        {/* Search & Sort Controls */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nomor BIB atau nama pelari..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Sort Switcher */}
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3 text-slate-400" />
              Urutkan:
            </span>
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button
                onClick={() => setSortBy('rank')}
                className={`px-2 py-0.5 font-semibold rounded-md transition-colors ${
                  sortBy === 'rank'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Peringkat
              </button>
              <button
                onClick={() => setSortBy('pace')}
                className={`px-2 py-0.5 font-semibold rounded-md transition-colors ${
                  sortBy === 'pace'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Pace
              </button>
              <button
                onClick={() => setSortBy('cheers')}
                className={`px-2 py-0.5 font-semibold rounded-md transition-colors ${
                  sortBy === 'cheers'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Sorak
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Scrollable List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {sortedRunners.map((runner, index) => {
          const rank = index + 1;
          const isSelected = runner.id === activeRunnerId;
          const progressPercent = Math.min(100, (runner.distanceKm / 21.0975) * 100);

          // Medal / Rank styling
          let rankBadge = (
            <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold font-mono flex items-center justify-center shrink-0">
              #{rank}
            </span>
          );

          if (rank === 1) {
            rankBadge = (
              <span className="w-6 h-6 rounded-lg bg-amber-400 text-amber-950 text-xs font-black flex items-center justify-center shadow-xs shrink-0" title="Juara 1 Sementara">
                🥇
              </span>
            );
          } else if (rank === 2) {
            rankBadge = (
              <span className="w-6 h-6 rounded-lg bg-slate-300 text-slate-800 text-xs font-black flex items-center justify-center shadow-xs shrink-0" title="Juara 2 Sementara">
                🥈
              </span>
            );
          } else if (rank === 3) {
            rankBadge = (
              <span className="w-6 h-6 rounded-lg bg-amber-700 text-white text-xs font-black flex items-center justify-center shadow-xs shrink-0" title="Juara 3 Sementara">
                🥉
              </span>
            );
          }

          return (
            <div
              key={runner.id}
              onClick={() => onSelectRunner(runner.id)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 shadow-xs'
                  : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  {rankBadge}

                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-[10px] shrink-0"
                    style={{ backgroundColor: runner.color }}
                  >
                    {runner.bibNumber.replace('BIB-', '')}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {runner.name}
                      </span>
                      {runner.isUser && (
                        <span className="text-[9px] bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold px-1 rounded shrink-0">
                          Anda
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block">
                      {runner.club}
                    </span>
                  </div>
                </div>

                {/* Right Primary Metrics: Distance & Elapsed Time */}
                <div className="text-right shrink-0">
                  <div className="text-xs font-extrabold text-blue-600 dark:text-blue-400 font-mono tabular-nums">
                    {runner.distanceKm.toFixed(2)} km
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono tabular-nums">
                    {formatDuration(runner.elapsedSeconds)}
                  </div>
                </div>
              </div>

              {/* Progress Bar of 21.1K */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${progressPercent}%`,
                    backgroundColor: runner.color,
                  }}
                />
              </div>

              {/* Footer row with status & action shortcuts */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">
                    {formatPace(runner.paceMinPerKm)}
                  </span>
                  <span>·</span>
                  <span>❤️ {runner.cheersCount}</span>
                  {runner.status === 'finished' && (
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-1.5 py-0.2 rounded">
                      FINISHER 🏁
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSendCheer(runner.id, 'clap');
                    }}
                    title="Kirim Tepuk Tangan"
                    className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-xs transition-colors"
                  >
                    👏
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigateToRunner(runner);
                    }}
                    title="Rencanakan titik cegat pelari ini"
                    className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectRunner(runner.id);
                    }}
                    title="Pusatkan peta ke pelari ini"
                    className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
