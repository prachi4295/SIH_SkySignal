/* ═══════════════════════════════════════════════════════
   SkySignal — GeoRadarMap Component
   Centered on user location by default with live radar beacon,
   interactive search flyTo (zoom 14), and marker clusters.
   ═══════════════════════════════════════════════════════ */

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { useTranslation } from 'react-i18next';
import {
  Maximize2,
  Minimize2,
  RotateCcw,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { WeatherEvent } from '../../types/weather';
import { SEVERITY_CONFIG } from '../../data/mock';
import { useAuth } from '../../context/AuthContext';
import { useUserLocation } from '../../context/LocationContext';

interface GeoRadarMapProps {
  events: WeatherEvent[];
  onSelectEvent?: (event: WeatherEvent) => void;
  className?: string;
  height?: string;
}

const DEFAULT_ZOOM = 16;

// Tile Providers (Standard OpenStreetMap with high-res Retina support)
const TILE_LAYERS = {
  dark: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  light: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
};

// SVG category icons for inside the pin
const SVG_ICONS: Record<string, string> = {
  rainfall: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg>`,
  thunderstorm: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973"/><path d="m13 12-3 5h4l-3 5"/></svg>`,
  flooding: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>`,
  heatwave: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/></svg>`,
  fog: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M4 18h16"/><path d="M6 21h12"/></svg>`,
  'dust storm': `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>`,
  'strong wind': `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>`,
};

export default function GeoRadarMap({
  events,
  onSelectEvent,
  className = '',
  height = 'h-[500px]',
}: GeoRadarMapProps) {
  const { isAdmin } = useAuth();
  const { location: userLoc } = useUserLocation();
  const { i18n } = useTranslation();
  const isHindi = i18n?.language === 'hi';

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const markersMapRef = useRef<Record<string, L.Marker>>({});

  const [activeTheme] = useState<'dark' | 'light'>('dark');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLegendOpen, setIsLegendOpen] = useState(true);

  // Severity counts
  const severeCount = events.filter((e) => e.severity === 'severe').length;
  const moderateCount = events.filter((e) => e.severity === 'moderate').length;
  const minorCount = events.filter((e) => e.severity === 'minor').length;

  // Map Initialization pointing by default to exact user location
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const initialCenter: [number, number] = [userLoc.lat, userLoc.lng];

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
      attributionControl: false,
      minZoom: 4,
      maxZoom: 19,
    });

    const tile = L.tileLayer(TILE_LAYERS[activeTheme].url, {
      maxZoom: 19,
      maxNativeZoom: 19,
      detectRetina: true,
      attribution: TILE_LAYERS[activeTheme].attribution,
    }).addTo(map);

    tileLayerRef.current = tile;

    // User Location Beacon Marker
    const userBeaconIcon = L.divIcon({
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
          <div style="position: absolute; width: 44px; height: 44px; border-radius: 9999px; background: rgba(14, 165, 233, 0.45); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 32px; height: 32px; border-radius: 9999px; background: #0284c7; border: 2.5px solid #ffffff; box-shadow: 0 4px 14px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; font-size: 15px; color: white;">
            📍
          </div>
        </div>
      `,
      className: 'user-location-beacon',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18],
    });

    const userMarker = L.marker(initialCenter, {
      icon: userBeaconIcon,
      zIndexOffset: 1000,
    }).addTo(map);

    userMarker.bindPopup(`
      <div style="font-family: inherit; padding: 4px; text-align: center; min-width: 160px;">
        <div style="font-size: 11px; font-weight: 800; color: #0284c7; text-transform: uppercase; letter-spacing: 0.5px;">📍 Your Location</div>
        <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 2px;">${userLoc.cityName}</div>
        <div style="font-size: 12px; color: #475569; font-weight: 600; margin-top: 2px;">${userLoc.tempC}°c ${userLoc.weatherIcon} · ${userLoc.condition}</div>
      </div>
    `);

    userMarkerRef.current = userMarker;

    // Cluster Group for Weather Events
    const clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 40,
      spiderfyOnMaxZoom: true,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        const hasSevere = cluster.getAllChildMarkers().some((m: any) => m.options.isSevere);

        const bgColor = hasSevere
          ? 'rgba(239, 68, 68, 0.95)'
          : 'rgba(2, 132, 199, 0.92)';

        return L.divIcon({
          html: `<div class="w-10 h-10 rounded-full flex items-center justify-center font-black text-[12px] text-white shadow-xl backdrop-blur-md ${hasSevere ? 'animate-pulse' : ''}" style="background: ${bgColor}; border: 2.5px solid #ffffff;">${count}</div>`,
          className: 'custom-cluster-pin',
          iconSize: L.point(40, 40),
        });
      },
    });

    clusterGroup.addTo(map);
    clusterGroupRef.current = clusterGroup;
    mapInstanceRef.current = map;

    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Listen for search / event recenter events (spread view 12-13)
  useEffect(() => {
    const handleRecenter = (e: Event) => {
      const custom = e as CustomEvent<{
        lat: number;
        lng: number;
        zoom?: number;
        name?: string;
        isReset?: boolean;
        eventId?: string;
      }>;
      if (custom.detail && mapInstanceRef.current) {
        const map = mapInstanceRef.current;
        map.invalidateSize();

        const targetZoom = custom.detail.zoom || (custom.detail.isReset ? 13 : 16);
        map.flyTo(
          [custom.detail.lat, custom.detail.lng],
          targetZoom,
          { duration: 1.1 }
        );

        if (custom.detail.isReset && userMarkerRef.current) {
          userMarkerRef.current.openPopup();
        } else if (custom.detail.eventId) {
          const attemptOpenPopup = (retries = 5) => {
            const targetMarker = markersMapRef.current[custom.detail.eventId!];
            if (targetMarker) {
              if (clusterGroupRef.current) {
                try {
                  clusterGroupRef.current.zoomToShowLayer(targetMarker, () => {
                    targetMarker.openPopup();
                  });
                } catch {
                  targetMarker.openPopup();
                }
              } else {
                targetMarker.openPopup();
              }
            } else if (retries > 0) {
              setTimeout(() => attemptOpenPopup(retries - 1), 200);
            }
          };
          setTimeout(() => attemptOpenPopup(), 300);
        }
      }
    };

    window.addEventListener('skysignal:recenter-map', handleRecenter);
    return () => window.removeEventListener('skysignal:recenter-map', handleRecenter);
  }, []);

  // Update user marker & fly to exact location if location state changes
  useEffect(() => {
    if (userLoc && mapInstanceRef.current && userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLoc.lat, userLoc.lng]);
      userMarkerRef.current.setPopupContent(`
        <div style="font-family: inherit; padding: 4px; text-align: center; min-width: 160px;">
          <div style="font-size: 11px; font-weight: 800; color: #0284c7; text-transform: uppercase; letter-spacing: 0.5px;">📍 Your Location</div>
          <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 2px;">${userLoc.cityName}</div>
          <div style="font-size: 12px; color: #475569; font-weight: 600; margin-top: 2px;">${userLoc.tempC}°c ${userLoc.weatherIcon} · ${userLoc.condition}</div>
        </div>
      `);
      mapInstanceRef.current.flyTo(
        [userLoc.lat, userLoc.lng],
        13,
        { duration: 1.2 }
      );
    }
  }, [userLoc.lat, userLoc.lng, userLoc.cityName, userLoc.tempC, userLoc.weatherIcon, userLoc.condition]);

  // Handle Theme Change
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    const newTile = L.tileLayer(TILE_LAYERS[activeTheme].url, {
      maxZoom: 19,
      attribution: TILE_LAYERS[activeTheme].attribution,
    }).addTo(mapInstanceRef.current);
    tileLayerRef.current = newTile;
  }, [activeTheme]);

  // Populate Markers
  useEffect(() => {
    const cluster = clusterGroupRef.current;
    if (!cluster) return;

    cluster.clearLayers();
    markersMapRef.current = {};

    events.forEach((evt) => {
      const isSevere = evt.severity === 'severe';
      const isModerate = evt.severity === 'moderate';
      const sevConfig = SEVERITY_CONFIG[evt.severity];

      const pinColor = isSevere ? '#ef4444' : isModerate ? '#0284c7' : '#10b981';
      const glowColor = isSevere ? 'rgba(239, 68, 68, 0.4)' : 'rgba(2, 132, 199, 0.3)';

      const svgIcon = SVG_ICONS[evt.category] || SVG_ICONS.rainfall;

      const customIcon = L.divIcon({
        html: `
          <div
            id="marker-${evt.id}"
            tabindex="0"
            role="button"
            aria-label="${evt.title}, ${evt.city}, ${evt.state}, Severity: ${evt.severity}"
            class="group cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-125 focus:scale-125 focus:outline-none"
            style="width: 32px; height: 32px;"
          >
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg ${isSevere ? 'animate-pulse' : ''}"
              style="background-color: ${pinColor}; box-shadow: 0 0 12px ${glowColor}; border: 2px solid #ffffff;"
            >
              ${svgIcon}
            </div>
          </div>
        `,
        className: 'custom-weather-pin',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18],
      });

      const marker = L.marker([evt.lat, evt.lon], {
        icon: customIcon,
      });
      (marker.options as any).isSevere = isSevere;

      const popupContent = `
        <div style="font-family: inherit; min-width: 230px; padding: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 2px 8px; border-radius: 9999px; ${
              isSevere
                ? 'background: #fee2e2; color: #b91c1c;'
                : isModerate
                ? 'background: #e0f2fe; color: #0369a1;'
                : 'background: #d1fae5; color: #047857;'
            }">
              ${sevConfig?.icon} ${sevConfig?.label}
            </span>
            <span style="font-size: 11px; font-weight: 700; color: #0284c7;">
              ${evt.confidence}% AI Match
            </span>
          </div>
          <h4 style="font-size: 13px; font-weight: 700; color: #0f172a; margin: 0 0 3px 0; line-height: 1.3;">
            ${evt.title}
          </h4>
          <p style="font-size: 11px; color: #475569; margin: 0 0 6px 0;">
            📍 ${evt.city}, ${evt.state}
          </p>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 280 });

      marker.on('click', () => {
        onSelectEvent?.(evt);
      });

      markersMapRef.current[evt.id] = marker;
      cluster.addLayer(marker);
    });
  }, [events, onSelectEvent, isAdmin]);

  // Controls
  const handleResetToUser = () => {
    mapInstanceRef.current?.flyTo([userLoc.lat, userLoc.lng], 13, { duration: 1.2 });
  };

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
    setTimeout(() => mapInstanceRef.current?.invalidateSize(), 200);
  };

  return (
    <div
      className={`relative w-full ${isFullscreen ? 'fixed inset-0 z-50 h-screen bg-slate-900' : height} ${className}`}
    >
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Map Controls — z-[1000] strictly above all Leaflet panes and tile layers */}
      <div className="absolute top-3.5 right-3.5 z-[1000] flex flex-col gap-1.5 shadow-xl rounded-2xl bg-white/95 backdrop-blur-md p-1 border-2 border-slate-200">
        <button
          onClick={handleResetToUser}
          className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-600 transition-all cursor-pointer shadow-xs active:scale-95"
          title="Recenter on Your Location"
          aria-label="Recenter on your location"
        >
          <RotateCcw size={16} />
        </button>

        <button
          onClick={handleZoomIn}
          className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center bg-white hover:bg-sky-50 text-slate-800 hover:text-sky-600 font-extrabold text-[16px] transition-all cursor-pointer shadow-xs active:scale-95"
          title="Zoom In"
          aria-label="Zoom in"
        >
          +
        </button>

        <button
          onClick={handleZoomOut}
          className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center bg-white hover:bg-sky-50 text-slate-800 hover:text-sky-600 font-extrabold text-[16px] transition-all cursor-pointer shadow-xs active:scale-95"
          title="Zoom Out"
          aria-label="Zoom out"
        >
          −
        </button>

        <button
          onClick={toggleFullscreen}
          className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-600 transition-all cursor-pointer shadow-xs active:scale-95"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>

      {/* ── Interactive Map Legend (Bottom-Left) ── */}
      <div className="absolute bottom-4 left-4 z-[1000] transition-all duration-200">
        {isLegendOpen ? (
          <div className="bg-white/95 backdrop-blur-md border-2 border-slate-200 shadow-xl rounded-2xl p-3.5 w-64 max-w-[calc(100vw-2.5rem)] text-slate-800 animate-fade-in">
            {/* Legend Header */}
            <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-sky-100 text-sky-700">
                  <Layers size={14} />
                </div>
                <span className="font-extrabold text-[12.5px] text-slate-900 tracking-tight">
                  {isHindi ? 'मानचित्र संकेत' : 'Map Legend'}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {events.length}
                </span>
              </div>
              <button
                onClick={() => setIsLegendOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title={isHindi ? 'संकेत छिपाएँ' : 'Collapse legend'}
                aria-label="Collapse legend"
              >
                <ChevronDown size={14} />
              </button>
            </div>

            {/* Severity Levels */}
            <div className="space-y-1.5 text-[11.5px]">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 pb-0.5">
                {isHindi ? 'गंभीरता स्तर' : 'Hazard Severity'}
              </div>

              {/* Severe */}
              <div className="flex items-center justify-between py-0.5">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 border border-white shadow-xs"></span>
                  </span>
                  <span className="font-semibold text-slate-700">
                    {isHindi ? 'गंभीर (रेड अलर्ट)' : 'Severe (Red Alert)'}
                  </span>
                </div>
                <span className="font-bold text-[11px] px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200">
                  {severeCount}
                </span>
              </div>

              {/* Moderate */}
              <div className="flex items-center justify-between py-0.5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex rounded-full h-3 w-3 bg-sky-500 border border-white shadow-xs"></span>
                  <span className="font-semibold text-slate-700">
                    {isHindi ? 'मध्यम (ऑरेंज अलर्ट)' : 'Moderate (Orange)'}
                  </span>
                </div>
                <span className="font-bold text-[11px] px-1.5 py-0.2 rounded bg-sky-50 text-sky-700 border border-sky-200">
                  {moderateCount}
                </span>
              </div>

              {/* Minor */}
              <div className="flex items-center justify-between py-0.5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-white shadow-xs"></span>
                  <span className="font-semibold text-slate-700">
                    {isHindi ? 'मामूली (येलो अलर्ट)' : 'Minor (Yellow)'}
                  </span>
                </div>
                <span className="font-bold text-[11px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {minorCount}
                </span>
              </div>
            </div>

            {/* Map Markers Section */}
            <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1.5 text-[11px]">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 pb-0.5">
                {isHindi ? 'मानचित्र मार्कर' : 'Map Indicators'}
              </div>

              <div className="flex items-center gap-2 text-slate-600 font-medium">
                <div className="w-4 h-4 rounded-full bg-blue-600/20 border-2 border-blue-600 flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping"></div>
                </div>
                <span>{isHindi ? 'आपका स्थान (जीपीएस / रडार)' : 'Your Location (GPS Beacon)'}</span>
              </div>

              <div className="flex items-center gap-2 text-slate-600 font-medium">
                <div className="w-4 h-4 rounded-full bg-sky-500 text-white text-[9px] font-black flex items-center justify-center border border-white shadow-xs shrink-0">
                  3+
                </div>
                <span>{isHindi ? 'इवेंट क्लस्टर (समूह)' : 'Event Cluster (Multi-source)'}</span>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsLegendOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/95 backdrop-blur-md border-2 border-slate-200 shadow-lg text-slate-700 hover:text-sky-700 hover:bg-sky-50 font-bold text-[12px] transition-all cursor-pointer active:scale-95"
            title={isHindi ? 'मानचित्र संकेत दिखाएँ' : 'Show map legend'}
            aria-label="Show map legend"
          >
            <Layers size={15} className="text-sky-600" />
            <span>{isHindi ? 'मानचित्र संकेत' : 'Map Legend'}</span>
            <ChevronUp size={14} className="text-slate-400" />
          </button>
        )}
      </div>

    </div>
  );
}
