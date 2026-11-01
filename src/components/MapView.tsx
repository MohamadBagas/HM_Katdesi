import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { JourneyPlan, LatLng, PointOfInterest, Runner } from '../types';
import { ugmHalfMarathonRoute } from '../data/marathonData';
import { Layers, Crosshair, MapPin, Eye, Volume2 } from 'lucide-react';

interface MapViewProps {
  runners: Runner[];
  activeRunnerId: string;
  onSelectRunner: (runnerId: string) => void;
  pois: PointOfInterest[];
  journeyPlan: JourneyPlan | null;
  onMapClick?: (latLng: LatLng) => void;
  isSelectingPoint: 'origin' | 'destination' | null;
  onSendCheer: (runnerId: string, type: 'clap' | 'water' | 'energy' | 'cheer') => void;
}

export const MapView: React.FC<MapViewProps> = ({
  runners,
  activeRunnerId,
  onSelectRunner,
  pois,
  journeyPlan,
  onMapClick,
  isSelectingPoint,
  onSendCheer,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Layer groups refs to easily update markers without full re-render
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const poiLayerRef = useRef<L.LayerGroup | null>(null);
  const runnerMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const journeyLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [activeBaseLayer, setActiveBaseLayer] = useState<'voyager' | 'satellite' | 'osm'>('voyager');
  const [showPOIs, setShowPOIs] = useState<boolean>(true);
  const [followActiveRunner, setFollowActiveRunner] = useState<boolean>(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Center on UGM (Grha Sabha Pramana)
    const map = L.map(mapContainerRef.current, {
      center: [-7.765, 110.378],
      zoom: 14,
      zoomControl: false,
    });

    // Custom zoom control in bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Initial tile layer (Carto Voyager)
    const voyagerTiles = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19,
        subdomains: 'abcd',
      }
    ).addTo(map);

    tileLayerRef.current = voyagerTiles;

    // Layer group for POIs
    poiLayerRef.current = L.layerGroup().addTo(map);

    // Layer group for Journey / Intercept navigation
    journeyLayerRef.current = L.layerGroup().addTo(map);

    // Click handler on map
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (onMapClick) {
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Handle Base Layer Switch
  useEffect(() => {
    if (!mapRef.current) return;

    if (tileLayerRef.current) {
      mapRef.current.removeLayer(tileLayerRef.current);
    }

    let url = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    let attribution = '&copy; OpenStreetMap &copy; CARTO';

    if (activeBaseLayer === 'satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
    } else if (activeBaseLayer === 'osm') {
      url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; OpenStreetMap contributors';
    }

    const newTiles = L.tileLayer(url, {
      attribution,
      maxZoom: 19,
    }).addTo(mapRef.current);

    tileLayerRef.current = newTiles;
  }, [activeBaseLayer]);

  // Render Marathon Route Polyline
  useEffect(() => {
    if (!mapRef.current) return;

    if (routeLayerRef.current) {
      mapRef.current.removeLayer(routeLayerRef.current);
    }

    const latLngs = ugmHalfMarathonRoute.map((p) => [p.lat, p.lng] as [number, number]);

    // Outer glow casing
    const casing = L.polyline(latLngs, {
      color: '#1e3a8a',
      weight: 8,
      opacity: 0.5,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(mapRef.current);

    // Core vivid line
    const coreLine = L.polyline(latLngs, {
      color: '#3b82f6',
      weight: 4,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(mapRef.current);

    const group = L.featureGroup([casing, coreLine]);
    routeLayerRef.current = coreLine;

    // Mile/KM Badge markers at key points (5K, 10K, 15K, 20K, Finish)
    const kmMilestones = [
      { km: 5, lat: -7.7570, lng: 110.3808, label: '5K' },
      { km: 10, lat: -7.7538, lng: 110.3892, label: '10K' },
      { km: 15, lat: -7.7710, lng: 110.3855, label: '15K' },
      { km: 20, lat: -7.7745, lng: 110.3776, label: '20K' },
    ];

    kmMilestones.forEach((m) => {
      const badgeIcon = L.divIcon({
        className: 'km-milestone-marker',
        html: `
          <div style="background-color: #1e40af; color: white; font-weight: bold; font-size: 10px; border-radius: 9999px; padding: 2px 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); border: 2px solid white; display: inline-flex; align-items: center; justify-content: center;">
            ${m.label}
          </div>
        `,
        iconSize: [28, 20],
        iconAnchor: [14, 10],
      });

      L.marker([m.lat, m.lng], { icon: badgeIcon }).addTo(mapRef.current!);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.removeLayer(casing);
        mapRef.current.removeLayer(coreLine);
      }
    };
  }, []);

  // Render Points of Interest (POIs)
  useEffect(() => {
    if (!mapRef.current || !poiLayerRef.current) return;
    poiLayerRef.current.clearLayers();

    if (!showPOIs) return;

    pois.forEach((poi) => {
      let bgColor = '#2563eb';
      let iconEmoji = '📍';

      if (poi.category === 'start_finish') {
        bgColor = '#dc2626';
        iconEmoji = '🏁';
      } else if (poi.category === 'water_station') {
        bgColor = '#0284c7';
        iconEmoji = '💧';
      } else if (poi.category === 'medical') {
        bgColor = '#e11d48';
        iconEmoji = '🚑';
      } else if (poi.category === 'cheer_zone') {
        bgColor = '#d97706';
        iconEmoji = '🎺';
      } else if (poi.category === 'refreshment') {
        bgColor = '#16a34a';
        iconEmoji = '🍌';
      }

      const poiIcon = L.divIcon({
        className: 'custom-poi-marker',
        html: `
          <div style="background-color: ${bgColor}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 2px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.25); cursor: pointer; transition: transform 0.2s;" class="hover:scale-110">
            <span style="font-size: 15px;">${iconEmoji}</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([poi.location.lat, poi.location.lng], { icon: poiIcon });

      const popupContent = `
        <div style="padding: 12px; min-width: 220px; font-family: inherit;">
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: ${bgColor}; margin-bottom: 2px;">
            ${poi.category.replace('_', ' ')} · KM ${poi.kmMark}
          </div>
          <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">
            ${poi.name}
          </div>
          <p style="font-size: 12px; color: #475569; margin: 0 0 8px 0; line-height: 1.4;">
            ${poi.description}
          </p>
          <div style="font-size: 11px; color: #64748b; font-weight: 600; border-top: 1px solid #e2e8f0; padding-top: 6px;">
            Fasilitas: ${poi.facilities.join(', ')}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      poiLayerRef.current?.addLayer(marker);
    });
  }, [pois, showPOIs]);

  // Render & Update Runners Markers
  useEffect(() => {
    if (!mapRef.current) return;

    runners.forEach((runner) => {
      const isSelected = runner.id === activeRunnerId;
      const isUser = runner.isUser;
      const pos: [number, number] = [runner.currentLocation.lat, runner.currentLocation.lng];

      const html = `
        <div class="${isUser ? 'pulse-marker' : ''}" style="position: relative; display: flex; flex-direction: column; align-items: center;">
          <div style="background-color: ${runner.color}; border: 2.5px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border-radius: 9999px; padding: 3px 8px; color: white; font-weight: 700; font-size: 11px; white-space: nowrap; display: flex; align-items: center; gap: 4px;">
            <span>${runner.bibNumber}</span>
            <span style="font-size: 9px; opacity: 0.85;">${runner.distanceKm.toFixed(1)}k</span>
          </div>
          <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid ${runner.color};"></div>
        </div>
      `;

      const runnerIcon = L.divIcon({
        className: 'runner-marker-icon',
        html,
        iconSize: [70, 35],
        iconAnchor: [35, 30],
      });

      let marker = runnerMarkersRef.current.get(runner.id);
      if (marker) {
        marker.setLatLng(pos);
        marker.setIcon(runnerIcon);
      } else {
        marker = L.marker(pos, { icon: runnerIcon });
        marker.on('click', () => {
          onSelectRunner(runner.id);
        });
        marker.addTo(mapRef.current!);
        runnerMarkersRef.current.set(runner.id, marker);
      }

      // Popup with runner telemetry & live cheer action
      const popupDiv = document.createElement('div');
      popupDiv.style.padding = '12px';
      popupDiv.style.minWidth = '240px';
      popupDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
          <span style="font-size: 11px; font-weight: 700; color: ${runner.color};">${runner.bibNumber} · ${runner.category}</span>
          <span style="font-size: 10px; color: #64748b;">${runner.club}</span>
        </div>
        <div style="font-size: 15px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">
          ${runner.name}
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; background: #f8fafc; padding: 8px; border-radius: 8px; margin-bottom: 8px; font-size: 11px;">
          <div>
            <div style="color: #64748b;">Jarak:</div>
            <div style="font-weight: 700; color: #0f172a; font-family: monospace;">${runner.distanceKm.toFixed(2)} km</div>
          </div>
          <div>
            <div style="color: #64748b;">Pace:</div>
            <div style="font-weight: 700; color: #0f172a; font-family: monospace;">${Math.floor(runner.paceMinPerKm)}:${Math.round((runner.paceMinPerKm % 1) * 60).toString().padStart(2, '0')} /km</div>
          </div>
          <div>
            <div style="color: #64748b;">Kecepatan:</div>
            <div style="font-weight: 700; color: #0f172a; font-family: monospace;">${runner.speedKmh.toFixed(1)} km/h</div>
          </div>
          <div>
            <div style="color: #64748b;">Total Sorak:</div>
            <div style="font-weight: 700; color: #0f172a;">❤️ ${runner.cheersCount}</div>
          </div>
        </div>
        <div style="display: flex; gap: 4px;">
          <button id="cheer-clap-${runner.id}" style="flex: 1; padding: 6px 0; background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; font-size: 11px; font-weight: 600; border-radius: 6px; cursor: pointer;">
            👏 Tepuk
          </button>
          <button id="cheer-water-${runner.id}" style="flex: 1; padding: 6px 0; background: #ecfeff; border: 1px solid #a5f3fc; color: #0e7490; font-size: 11px; font-weight: 600; border-radius: 6px; cursor: pointer;">
            💧 Air
          </button>
          <button id="cheer-energy-${runner.id}" style="flex: 1; padding: 6px 0; background: #fffbeb; border: 1px solid #fde68a; color: #b45309; font-size: 11px; font-weight: 600; border-radius: 6px; cursor: pointer;">
            ⚡ Gel
          </button>
        </div>
      `;

      // Attach button clicks inside popup
      setTimeout(() => {
        const clapBtn = document.getElementById(`cheer-clap-${runner.id}`);
        const waterBtn = document.getElementById(`cheer-water-${runner.id}`);
        const energyBtn = document.getElementById(`cheer-energy-${runner.id}`);
        if (clapBtn) clapBtn.onclick = () => onSendCheer(runner.id, 'clap');
        if (waterBtn) waterBtn.onclick = () => onSendCheer(runner.id, 'water');
        if (energyBtn) energyBtn.onclick = () => onSendCheer(runner.id, 'energy');
      }, 50);

      marker.bindPopup(popupDiv);

      if (isSelected && followActiveRunner && mapRef.current) {
        mapRef.current.panTo(pos, { animate: true, duration: 0.5 });
      }
    });
  }, [runners, activeRunnerId, followActiveRunner, onSelectRunner, onSendCheer]);

  // Render Spectator Journey Route (Origin to Destination / Intercept point)
  useEffect(() => {
    if (!mapRef.current || !journeyLayerRef.current) return;
    journeyLayerRef.current.clearLayers();

    if (!journeyPlan) return;

    // Origin Marker (Green Pin)
    const originIcon = L.divIcon({
      className: 'journey-origin-marker',
      html: `
        <div style="background-color: #10b981; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 2.5px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.25);">
          <span style="font-size: 12px; font-weight: 800;">A</span>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const origMarker = L.marker([journeyPlan.fromLocation.lat, journeyPlan.fromLocation.lng], {
      icon: originIcon,
    }).bindPopup(`<b>Titik Berangkat:</b><br/>${journeyPlan.fromName}`);
    journeyLayerRef.current.addLayer(origMarker);

    // Destination Marker (Red Pin)
    const destIcon = L.divIcon({
      className: 'journey-dest-marker',
      html: `
        <div style="background-color: #ef4444; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 2.5px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.25);">
          <span style="font-size: 12px; font-weight: 800;">B</span>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const destMarker = L.marker([journeyPlan.toLocation.lat, journeyPlan.toLocation.lng], {
      icon: destIcon,
    }).bindPopup(`<b>Titik Tujuan / Cegat:</b><br/>${journeyPlan.toName}`);
    journeyLayerRef.current.addLayer(destMarker);

    // Dashed Navigation Path
    const waypointsLatLngs = journeyPlan.waypoints.map((p) => [p.lat, p.lng] as [number, number]);
    const journeyPolyline = L.polyline(waypointsLatLngs, {
      color: '#059669',
      weight: 5,
      dashArray: '8, 8',
      opacity: 0.9,
    });

    journeyLayerRef.current.addLayer(journeyPolyline);

    // Fit map bounds to show journey
    const bounds = L.latLngBounds([
      [journeyPlan.fromLocation.lat, journeyPlan.fromLocation.lng],
      [journeyPlan.toLocation.lat, journeyPlan.toLocation.lng],
    ]);
    mapRef.current.fitBounds(bounds, { padding: [50, 50], animate: true });
  }, [journeyPlan]);

  // Center on Active Runner
  const handleCenterRunner = () => {
    const active = runners.find((r) => r.id === activeRunnerId);
    if (active && mapRef.current) {
      mapRef.current.setView([active.currentLocation.lat, active.currentLocation.lng], 16, {
        animate: true,
      });
      setFollowActiveRunner(true);
    }
  };

  // Fit Full Course
  const handleFitCourse = () => {
    if (!mapRef.current) return;
    const latLngs = ugmHalfMarathonRoute.map((p) => [p.lat, p.lng] as [number, number]);
    const bounds = L.latLngBounds(latLngs);
    mapRef.current.fitBounds(bounds, { padding: [40, 40], animate: true });
    setFollowActiveRunner(false);
  };

  return (
    <div className="relative w-full h-full min-h-[400px] overflow-hidden">
      {/* Map container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Point selection indicator banner */}
      {isSelectingPoint && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-slate-900/95 text-white px-4 py-2 rounded-xl text-xs md:text-sm font-medium shadow-xl backdrop-blur-sm border border-slate-700 flex items-center gap-2 animate-bounce">
          <MapPin className="w-4 h-4 text-emerald-400" />
          <span>
            Klik pada peta untuk menentukan{' '}
            <strong className="text-emerald-400">
              {isSelectingPoint === 'origin' ? 'Titik Berangkat' : 'Titik Tujuan / Cegat'}
            </strong>
          </span>
        </div>
      )}

      {/* Floating Control Bar: Top-Left */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        {/* Layer Switcher */}
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl shadow-md border border-slate-200 dark:border-slate-800 p-1 flex items-center gap-1">
          <button
            onClick={() => setActiveBaseLayer('voyager')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
              activeBaseLayer === 'voyager'
                ? 'bg-blue-600 text-white'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Peta Rute
          </button>
          <button
            onClick={() => setActiveBaseLayer('satellite')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
              activeBaseLayer === 'satellite'
                ? 'bg-blue-600 text-white'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Satelit
          </button>
          <button
            onClick={() => setActiveBaseLayer('osm')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
              activeBaseLayer === 'osm'
                ? 'bg-blue-600 text-white'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            OSM
          </button>
        </div>

        {/* POI Toggle */}
        <button
          onClick={() => setShowPOIs(!showPOIs)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl shadow-md backdrop-blur-md border transition-all ${
            showPOIs
              ? 'bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800'
              : 'bg-slate-200/90 dark:bg-slate-800/90 text-slate-500 border-transparent'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-blue-500" />
          <span>Pos Medis & Hidrasi</span>
        </button>
      </div>

      {/* Floating Action Buttons: Bottom-Right Above Leaflet Zoom */}
      <div className="absolute bottom-20 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={handleCenterRunner}
          title="Pusatkan ke Pelari Aktif"
          className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 transition-colors"
          aria-label="Center on runner"
        >
          <Crosshair className="w-5 h-5" />
        </button>

        <button
          onClick={handleFitCourse}
          title="Tampilkan Seluruh Rute 21K"
          className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 transition-colors"
          aria-label="View entire course"
        >
          <Eye className="w-5 h-5" />
        </button>
      </div>

      {/* Legend Badge at Bottom-Left */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl p-2.5 shadow-md border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 hidden sm:flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-1 bg-blue-600 rounded-full inline-block"></span>
          <span>Rute 21.1K HM</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-blue-500 rounded-full inline-block"></span>
          <span>Pelari Aktif</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-sky-500 rounded-full inline-block"></span>
          <span>Water Station</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-rose-500 rounded-full inline-block"></span>
          <span>Pos Medis</span>
        </div>
      </div>
    </div>
  );
};
