import React, { useState } from 'react';
import { Runner } from '../types';
import { formatPace } from '../utils/geoUtils';
import { Users, Search, Crosshair, Heart, Navigation, X } from 'lucide-react';

interface RunnerListModalProps {
  runners: Runner[];
  activeRunnerId: string;
  onSelectRunner: (runnerId: string) => void;
  onSendCheer: (runnerId: string, type: 'clap' | 'water' | 'energy' | 'cheer') => void;
  onNavigateToRunner: (runner: Runner) => void;
  onClose: () => void;
}

export const RunnerListModal: React.FC<RunnerListModalProps> = ({
  runners,
  activeRunnerId,
  onSelectRunner,
  onSendCheer,
  onNavigateToRunner,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredRunners = runners.filter((runner) => {
    const matchesSearch =
      runner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      runner.bibNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      runner.club.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all' || runner.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 w-full max-w-xl mx-auto space-y-4 max-h-[85vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Daftar Pelari Live Half Marathon UGM
            </h3>
            <p className="text-xs text-slate-500">
              Pilih pelari untuk melacak lokasi terkini di peta
            </p>
          </div>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="space-y-2 shrink-0">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari Nomor BIB, Nama Pelari, atau Angkatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category Pills (Functional Filter Tabs) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto">
          {['all', 'Half Marathon 21K', '10K Race', '5K Fun Run'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
                categoryFilter === cat
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {cat === 'all' ? 'Semua Kategori' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Runners List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {filteredRunners.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            Tidak ada pelari yang cocok dengan pencarian &quot;{searchQuery}&quot;
          </div>
        ) : (
          filteredRunners.map((runner) => {
            const isSelected = runner.id === activeRunnerId;
            return (
              <div
                key={runner.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 shadow-sm'
                    : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-sm shrink-0"
                      style={{ backgroundColor: runner.color }}
                    >
                      {runner.bibNumber.replace('BIB-', '')}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {runner.name}
                        </h4>
                        {runner.isUser && (
                          <span className="text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold px-1 rounded">
                            Anda
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        {runner.category} · {runner.club}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                      {runner.distanceKm.toFixed(2)} km
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {formatPace(runner.paceMinPerKm)}
                    </div>
                  </div>
                </div>

                {/* Runner Card Footer Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                    <span>❤️ {runner.cheersCount} sorak</span>
                    <span>·</span>
                    <span>{runner.speedKmh.toFixed(1)} km/h</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onSendCheer(runner.id, 'clap')}
                      title="Kirim Tepuk Tangan"
                      className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs flex items-center gap-1 transition-colors"
                    >
                      <span>👏</span>
                    </button>

                    <button
                      onClick={() => onNavigateToRunner(runner)}
                      title="Rencanakan rute mencegat pelari ini"
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Navigation className="w-3 h-3 text-emerald-600" />
                      <span>Cegat</span>
                    </button>

                    <button
                      onClick={() => {
                        onSelectRunner(runner.id);
                        onClose();
                      }}
                      className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Crosshair className="w-3 h-3" />
                      <span>Lacak</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
