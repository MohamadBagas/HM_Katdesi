import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { initialRunners, landmarkLocations, pointsOfInterest, ugmHalfMarathonRoute } from './data/marathonData';
import { JourneyPlan, LatLng, Runner } from './types';
import { calculateDistanceKm } from './utils/geoUtils';
import { Navbar } from './components/Navbar';
import { MapView } from './components/MapView';
import { LiveTrackerPanel } from './components/LiveTrackerPanel';
import { JourneyPlanner } from './components/JourneyPlanner';
import { RunnerListModal } from './components/RunnerListModal';
import { GeodesyLabModal } from './components/GeodesyLabModal';
import { PaceAnalyticsModal } from './components/PaceAnalyticsModal';
import { LeaderboardPanel } from './components/LeaderboardPanel';
import { RunnerMobileCockpit } from './components/RunnerMobileCockpit';
import { ShareLocationModal } from './components/ShareLocationModal';
import { SOSModal } from './components/SOSModal';
import { PWAInstallModal } from './components/PWAInstallModal';
import { Radio, Users, Navigation, MapPin, BarChart3, Trophy, X } from 'lucide-react';

export default function App() {
  const [runners, setRunners] = useState<Runner[]>(initialRunners);
  const [activeRunnerId, setActiveRunnerId] = useState<string>('runner-me');
  const [appMode, setAppMode] = useState<'spectator' | 'runner'>('spectator');
  const [activeTab, setActiveTab] = useState<'map' | 'runners' | 'journey' | 'geodesy' | 'analytics'>('map');
  const [sidebarView, setSidebarView] = useState<'tracker' | 'leaderboard'>('tracker');

  // Simulation State
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(5);

  // Real GPS State
  const [isRealGpsActive, setIsRealGpsActive] = useState<boolean>(false);
  const watchIdRef = useRef<number | null>(null);

  // Modals & Navigation
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isSOSModalOpen, setIsSOSModalOpen] = useState<boolean>(false);
  const [isPWAModalOpen, setIsPWAModalOpen] = useState<boolean>(false);
  const [journeyPlan, setJourneyPlan] = useState<JourneyPlan | null>(null);
  const [isSelectingPoint, setIsSelectingPoint] = useState<'origin' | 'destination' | null>(null);
  const [selectedMapPoint, setSelectedMapPoint] = useState<{
    type: 'origin' | 'destination';
    point: LatLng;
  } | null>(null);

  // Dark Mode
  const [isDark, setIsDark] = useState<boolean>(false);

  // Live Floating Cheer Toasts
  const [recentCheers, setRecentCheers] = useState<
    { id: string; text: string; icon: string; runnerName: string }[]
  >([]);

  // Toggle Theme
  const toggleDark = () => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  // Check URL params on initial mount for shared runner link and app mode
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const runnerParam = params.get('runner');
    if (runnerParam) {
      const found = runners.find(
        (r) => r.bibNumber.toLowerCase() === runnerParam.toLowerCase()
      );
      if (found) {
        setActiveRunnerId(found.id);
      }
    }

    const modeParam = params.get('mode');
    if (modeParam === 'runner') {
      setAppMode('runner');
    } else if (modeParam === 'spectator') {
      setAppMode('spectator');
    }
  }, []);

  // Web BroadcastChannel for real-time location sharing across multiple tabs/windows
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('ugm_marathon_live_sync');
      channel.onmessage = (event) => {
        if (event.data?.type === 'RUNNER_UPDATE') {
          const updatedRunner = event.data.runner as Runner;
          setRunners((prev) =>
            prev.map((r) => (r.id === updatedRunner.id ? updatedRunner : r))
          );
        } else if (event.data?.type === 'CHEER_SENT') {
          handleIncomingCheer(event.data.runnerId, event.data.cheerType);
        }
      };
    } catch {
      // BroadcastChannel fallback for older environments
    }

    return () => {
      channel?.close();
    };
  }, []);

  // Real GPS Geolocation Watcher
  useEffect(() => {
    if (isRealGpsActive) {
      if ('geolocation' in navigator) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude, altitude, accuracy } = position.coords;
            setRunners((prev) =>
              prev.map((r) => {
                if (r.id === activeRunnerId) {
                  const newLoc: LatLng = {
                    lat: latitude,
                    lng: longitude,
                    altitude: altitude || 145,
                    accuracy: Math.round(accuracy),
                  };

                  const prevLoc = r.currentLocation;
                  const addedDist = calculateDistanceKm(prevLoc, newLoc);
                  const newDistance = r.distanceKm + addedDist;

                  const updated: Runner = {
                    ...r,
                    currentLocation: newLoc,
                    distanceKm: Math.round(newDistance * 100) / 100,
                    history: [...r.history, { lat: latitude, lng: longitude, timestamp: Date.now() }],
                  };

                  // Broadcast update to other tabs
                  try {
                    const bc = new BroadcastChannel('ugm_marathon_live_sync');
                    bc.postMessage({ type: 'RUNNER_UPDATE', runner: updated });
                    bc.close();
                  } catch {}

                  return updated;
                }
                return r;
              })
            );
          },
          (err) => {
            console.warn('Geolocation error:', err.message);
            setIsRealGpsActive(false);
          },
          { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 }
        );
      } else {
        alert('Geolocation tidak didukung di browser ini.');
        setIsRealGpsActive(false);
      }
    } else {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isRealGpsActive, activeRunnerId]);

  // Virtual Marathon Simulation Engine
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setRunners((prev) =>
        prev.map((runner) => {
          if (runner.id !== activeRunnerId || runner.status === 'finished') return runner;

          // Increment distance based on pace and speed multiplier
          // paceMinPerKm = minutes per km. speed multiplier multiplies elapsed simulation
          const kmPerSecond = 1 / (runner.paceMinPerKm * 60);
          const advanceKm = kmPerSecond * simulationSpeed;
          const nextDist = runner.distanceKm + advanceKm;

          if (nextDist >= 21.0975) {
            // Trigger Finish Celebration
            confetti({
              particleCount: 120,
              spread: 70,
              origin: { y: 0.6 },
            });

            return {
              ...runner,
              distanceKm: 21.0975,
              status: 'finished',
              currentLocation: ugmHalfMarathonRoute[ugmHalfMarathonRoute.length - 1],
            };
          }

          // Interpolate coordinate along course
          const totalPoints = ugmHalfMarathonRoute.length;
          const fraction = nextDist / 21.0975;
          const indexFloat = fraction * (totalPoints - 1);
          const idxLow = Math.floor(indexFloat);
          const idxHigh = Math.min(totalPoints - 1, idxLow + 1);
          const localRatio = indexFloat - idxLow;

          const pLow = ugmHalfMarathonRoute[idxLow];
          const pHigh = ugmHalfMarathonRoute[idxHigh];

          const newLat = pLow.lat + (pHigh.lat - pLow.lat) * localRatio;
          const newLng = pLow.lng + (pHigh.lng - pLow.lng) * localRatio;
          const newEle = Math.round(pLow.ele + (pHigh.ele - pLow.ele) * localRatio);

          // Dynamically record split if crossing a kilometer milestone
          const prevKm = Math.floor(runner.distanceKm);
          const nextKm = Math.floor(nextDist);
          let newSplits = runner.splits;

          if (nextKm > prevKm && nextKm <= 21) {
            const paceVal = runner.paceMinPerKm + (Math.sin(nextKm) * 0.12);
            const splitSec = Math.round(paceVal * 60);
            const prevCumSec = runner.splits.length > 0 ? runner.splits[runner.splits.length - 1].splitSeconds : 0;
            const newSplitRecord = {
              km: nextKm,
              paceMinutes: Math.round(paceVal * 100) / 100,
              paceFormatted: `${Math.floor(paceVal)}:${Math.round((paceVal % 1) * 60).toString().padStart(2, '0')} /km`,
              splitSeconds: splitSec,
              cumulativeTime: `${Math.floor(runner.elapsedSeconds / 60)}:${(runner.elapsedSeconds % 60).toString().padStart(2, '0')}`,
              speedKmh: Math.round((60 / paceVal) * 10) / 10,
              heartRate: Math.min(185, Math.round(runner.heartRate + (nextKm * 1.1))),
              elevation: newEle,
            };
            newSplits = [...runner.splits, newSplitRecord];
          }

          const updated: Runner = {
            ...runner,
            distanceKm: Math.round(nextDist * 100) / 100,
            elapsedSeconds: runner.elapsedSeconds + simulationSpeed,
            splits: newSplits,
            currentLocation: {
              lat: newLat,
              lng: newLng,
              altitude: newEle,
              accuracy: 3,
            },
            history: [
              ...runner.history,
              { lat: newLat, lng: newLng, timestamp: Date.now() },
            ],
          };

          // Broadcast update
          try {
            const bc = new BroadcastChannel('ugm_marathon_live_sync');
            bc.postMessage({ type: 'RUNNER_UPDATE', runner: updated });
            bc.close();
          } catch {}

          return updated;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isSimulating, simulationSpeed, activeRunnerId]);

  // Reset Simulation for active runner
  const handleResetSimulation = () => {
    setRunners((prev) =>
      prev.map((r) => {
        if (r.id === activeRunnerId) {
          const startPt = ugmHalfMarathonRoute[0];
          return {
            ...r,
            distanceKm: 0,
            elapsedSeconds: 0,
            status: 'running',
            currentLocation: { lat: startPt.lat, lng: startPt.lng, altitude: startPt.ele, accuracy: 2 },
            history: [{ lat: startPt.lat, lng: startPt.lng, timestamp: Date.now() }],
          };
        }
        return r;
      })
    );
    setIsSimulating(false);
  };

  // Send Cheer Handler
  const handleSendCheer = (runnerId: string, type: 'clap' | 'water' | 'energy' | 'cheer') => {
    setRunners((prev) =>
      prev.map((r) => (r.id === runnerId ? { ...r, cheersCount: r.cheersCount + 1 } : r))
    );

    const targetRunner = runners.find((r) => r.id === runnerId);
    const icons = {
      clap: '👏',
      water: '💧',
      energy: '⚡',
      cheer: '🎺',
    };

    const newCheer = {
      id: Math.random().toString(),
      text:
        type === 'clap'
          ? 'Tepuk Tangan Dikirim!'
          : type === 'water'
          ? 'Hidrasi Air Mineral Dikirim!'
          : type === 'energy'
          ? 'Energy Booster Dikirim!'
          : 'Sorak Semangat Geodesi!',
      icon: icons[type],
      runnerName: targetRunner?.name || 'Pelari',
    };

    setRecentCheers((prev) => [newCheer, ...prev.slice(0, 3)]);
    setTimeout(() => {
      setRecentCheers((prev) => prev.filter((c) => c.id !== newCheer.id));
    }, 3500);

    // Broadcast cheer to other tabs
    try {
      const bc = new BroadcastChannel('ugm_marathon_live_sync');
      bc.postMessage({ type: 'CHEER_SENT', runnerId, cheerType: type });
      bc.close();
    } catch {}
  };

  const handleIncomingCheer = (runnerId: string, type: 'clap' | 'water' | 'energy' | 'cheer') => {
    setRunners((prev) =>
      prev.map((r) => (r.id === runnerId ? { ...r, cheersCount: r.cheersCount + 1 } : r))
    );
  };

  // Map Click Handler for Point Selection (Origin or Destination)
  const handleMapClick = (latLng: LatLng) => {
    if (isSelectingPoint) {
      setSelectedMapPoint({ type: isSelectingPoint, point: latLng });
      setIsSelectingPoint(null);
      setActiveTab('journey'); // Return to Journey Planner
    }
  };

  // Navigate to Intercept specific runner
  const handleNavigateToRunner = (runner: Runner) => {
    setActiveRunnerId(runner.id);
    setActiveTab('journey');
  };

  const activeRunner = runners.find((r) => r.id === activeRunnerId) || runners[0];

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {appMode === 'runner' ? (
        <RunnerMobileCockpit
          runner={activeRunner}
          onUpdateRunner={(updater) =>
            setRunners((prev) =>
              prev.map((r) => (r.id === activeRunnerId ? updater(r) : r))
            )
          }
          isSimulating={isSimulating}
          onToggleSimulation={() => setIsSimulating(!isSimulating)}
          onResetSimulation={handleResetSimulation}
          simulationSpeed={simulationSpeed}
          onChangeSimulationSpeed={(s) => setSimulationSpeed(s)}
          isRealGpsActive={isRealGpsActive}
          onToggleRealGps={() => {
            if (isSimulating) setIsSimulating(false);
            setIsRealGpsActive(!isRealGpsActive);
          }}
          onOpenShareModal={() => setIsShareModalOpen(true)}
          onOpenSOSModal={() => setIsSOSModalOpen(true)}
          onOpenPWAModal={() => setIsPWAModalOpen(true)}
          onSwitchToSpectatorMode={() => setAppMode('spectator')}
          pois={pointsOfInterest}
        />
      ) : (
        <>
          {/* Top Navigation */}
          <Navbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            appMode={appMode}
            onToggleAppMode={() => setAppMode('runner')}
            onOpenShareModal={() => setIsShareModalOpen(true)}
            onOpenPWAModal={() => setIsPWAModalOpen(true)}
            isLiveTracking={isSimulating || isRealGpsActive}
            isDark={isDark}
            toggleDark={toggleDark}
          />

          {/* Main Responsive Split Layout */}
          <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden">
            {/* Left / Center Map View Canvas */}
            <main className="flex-1 relative h-[50vh] md:h-full w-full">
          <MapView
            runners={runners}
            activeRunnerId={activeRunnerId}
            onSelectRunner={(id) => setActiveRunnerId(id)}
            pois={pointsOfInterest}
            journeyPlan={journeyPlan}
            onMapClick={handleMapClick}
            isSelectingPoint={isSelectingPoint}
            onSendCheer={handleSendCheer}
          />

          {/* Floating Live Cheer Toasts */}
          <div className="absolute top-20 right-4 z-30 flex flex-col gap-2 pointer-events-none">
            {recentCheers.map((ch) => (
              <div
                key={ch.id}
                className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-right duration-300"
              >
                <span className="text-xl">{ch.icon}</span>
                <div>
                  <span className="text-slate-900 dark:text-white block">{ch.text}</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    Untuk {ch.runnerName}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Right Telemetry & Controls Sidebar on Desktop / Bottom Sheet on Mobile */}
        <aside className="w-full md:w-96 lg:w-[420px] shrink-0 h-[50vh] md:h-full overflow-hidden flex flex-col bg-white dark:bg-slate-900 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 z-20">
          {/* Segmented Control for Sidebar View */}
          <div className="p-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 shrink-0">
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-200/70 dark:bg-slate-800 rounded-xl text-xs font-bold">
              <button
                onClick={() => setSidebarView('tracker')}
                className={`py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  sidebarView === 'tracker'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Radio className={`w-3.5 h-3.5 ${isSimulating || isRealGpsActive ? 'text-emerald-500 animate-pulse' : ''}`} />
                <span>Telemetri Pelari</span>
              </button>

              <button
                onClick={() => setSidebarView('leaderboard')}
                className={`py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  sidebarView === 'leaderboard'
                    ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>Leaderboard</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            {sidebarView === 'tracker' ? (
              <LiveTrackerPanel
                runner={activeRunner}
                isSimulating={isSimulating}
                onToggleSimulation={() => setIsSimulating(!isSimulating)}
                onResetSimulation={handleResetSimulation}
                simulationSpeed={simulationSpeed}
                onChangeSimulationSpeed={(s) => setSimulationSpeed(s)}
                isRealGpsActive={isRealGpsActive}
                onToggleRealGps={() => {
                  if (isSimulating) setIsSimulating(false);
                  setIsRealGpsActive(!isRealGpsActive);
                }}
                onOpenShareModal={() => setIsShareModalOpen(true)}
                onOpenSOSModal={() => setIsSOSModalOpen(true)}
                onOpenPaceAnalytics={() => setActiveTab('analytics')}
                onNavigateToRunner={handleNavigateToRunner}
              />
            ) : (
              <LeaderboardPanel
                runners={runners}
                activeRunnerId={activeRunnerId}
                onSelectRunner={(id) => {
                  setActiveRunnerId(id);
                }}
                onSendCheer={handleSendCheer}
                onNavigateToRunner={handleNavigateToRunner}
              />
            )}
          </div>
        </aside>
      </div>

      {/* Floating Modals */}
      {/* 1. Journey / Intercept Planner Modal */}
      {activeTab === 'journey' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative w-full max-w-lg">
            <button
              onClick={() => setActiveTab('map')}
              className="absolute top-4 right-4 z-50 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
            <JourneyPlanner
              landmarks={landmarkLocations}
              pois={pointsOfInterest}
              runners={runners}
              activeRunner={activeRunner}
              currentPlan={journeyPlan}
              onSetJourneyPlan={setJourneyPlan}
              onStartSelectingPoint={(pt) => {
                setIsSelectingPoint(pt);
                setActiveTab('map');
              }}
              isSelectingPoint={isSelectingPoint}
              selectedMapPoint={selectedMapPoint}
              onClose={() => setActiveTab('map')}
            />
          </div>
        </div>
      )}

      {/* 2. Runners List Modal */}
      {activeTab === 'runners' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative w-full max-w-xl">
            <button
              onClick={() => setActiveTab('map')}
              className="absolute top-4 right-4 z-50 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
            <RunnerListModal
              runners={runners}
              activeRunnerId={activeRunnerId}
              onSelectRunner={(id) => {
                setActiveRunnerId(id);
                setActiveTab('map');
              }}
              onSendCheer={handleSendCheer}
              onNavigateToRunner={handleNavigateToRunner}
              onClose={() => setActiveTab('map')}
            />
          </div>
        </div>
      )}

      {/* 3. Pace Analytics Modal (Recharts) */}
      {activeTab === 'analytics' && (
        <PaceAnalyticsModal
          runners={runners}
          activeRunnerId={activeRunnerId}
          onSelectRunner={(id) => setActiveRunnerId(id)}
          onClose={() => setActiveTab('map')}
        />
      )}

      {/* 4. Geodesy Lab Modal */}
      {activeTab === 'geodesy' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl">
            <button
              onClick={() => setActiveTab('map')}
              className="absolute top-4 right-4 z-50 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
            <GeodesyLabModal activeRunner={activeRunner} onClose={() => setActiveTab('map')} />
          </div>
        </div>
      )}

      {/* Mobile Bottom Tab Navigation */}
      <nav className="md:hidden grid grid-cols-5 items-center h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shrink-0 z-30">
        <button
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] ${
            activeTab === 'map'
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span className="text-[10px] tracking-tight mt-1">Peta</span>
        </button>

        <button
          onClick={() => setActiveTab('runners')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] ${
            activeTab === 'runners'
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Users className="w-4 h-4" />
          <span className="text-[10px] tracking-tight mt-1">Pelari</span>
        </button>

        <button
          onClick={() => setActiveTab('journey')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] ${
            activeTab === 'journey'
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Navigation className="w-4 h-4" />
          <span className="text-[10px] tracking-tight mt-1">Rute</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] ${
            activeTab === 'analytics'
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span className="text-[10px] tracking-tight mt-1">Pace</span>
        </button>

        <button
          onClick={() => setActiveTab('geodesy')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] ${
            activeTab === 'geodesy'
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span className="text-[10px] tracking-tight mt-1">Geodesi</span>
        </button>
      </nav>
        </>
      )}

      {/* Global Modals for both Runner and Spectator Mode */}
      <ShareLocationModal
        runner={activeRunner}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      <SOSModal
        runner={activeRunner}
        isOpen={isSOSModalOpen}
        onClose={() => setIsSOSModalOpen(false)}
      />

      <PWAInstallModal
        isOpen={isPWAModalOpen}
        onClose={() => setIsPWAModalOpen(false)}
      />
    </div>
  );
}
