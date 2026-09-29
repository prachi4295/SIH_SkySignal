import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  SlidersHorizontal,
  ChevronDown,
  RotateCcw,
  LayoutGrid,
  Table as TableIcon,
  Wind,
  Droplets,
  Gauge,
  Sun,
  Radio,
  Activity,
  AlertTriangle,
  Eye,
  ArrowRight,
  CloudLightning,
  Share2,
} from 'lucide-react';
import GeoRadarMap from '../components/map/GeoRadarMap';
import EventDetailDrawer from '../components/events/EventDetailDrawer';
import Analytics from './Analytics';
import CitizenPortal from './CitizenPortal';
import { mockWeatherEvents } from '../lib/mockData';
import { CATEGORY_CONFIG } from '../data/mock';
import { useUserLocation, calculateDistanceKm, PRESET_CITIES } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import { deduplicateWeatherEvents } from '../services/eventDeduplication';
import type { WeatherEvent } from '../types/weather';
import {
  translateCategory,
  translateSeverity,
  translateLifecycle,
  translateCondition,
  translateEventTitle,
} from '../lib/hindiTranslations';

type ViewModeOption = 'split' | 'table';

export default function Overview() {
  const { i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';
  const { location: userLoc, openModal: openLocationModal, setCityLocation } = useUserLocation();
  const { isAdmin } = useAuth();
  const [searchParams] = useSearchParams();

  const [events, setEvents] = useState<WeatherEvent[]>(() => deduplicateWeatherEvents(mockWeatherEvents));
  const [selectedEvent, setSelectedEvent] = useState<WeatherEvent | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewModeOption>('split');

  const filterRef = useRef<HTMLDivElement | null>(null);

  // Handle URL query section scroll (e.g. /?section=analytics or /?section=report)
  useEffect(() => {
    const section = searchParams.get('section');
    if (section) {
      setTimeout(() => {
        const elem = document.getElementById(section);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 200);
    }
  }, [searchParams]);

  // Scroll Spy: dynamically update active section in menu as user scrolls
  useEffect(() => {
    let ticking = false;

    const handleScrollSpy = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollPos = window.scrollY + 280;

          const citizenElem = document.getElementById('report');
          const analyticsElem = document.getElementById('analytics');
          const weatherElem = document.getElementById('weather-status');

          if (citizenElem && scrollPos >= citizenElem.offsetTop) {
            window.dispatchEvent(
              new CustomEvent('skysignal:active-section', { detail: { section: 'report' } })
            );
          } else if (analyticsElem && scrollPos >= analyticsElem.offsetTop) {
            window.dispatchEvent(
              new CustomEvent('skysignal:active-section', { detail: { section: 'analytics' } })
            );
          } else if (weatherElem) {
            window.dispatchEvent(
              new CustomEvent('skysignal:active-section', { detail: { section: 'weather-status' } })
            );
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScrollSpy, { passive: true });
    handleScrollSpy();
    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, []);

  // Close filter dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-update active map markers from live telemetry stream
  useEffect(() => {
    const handleTelemetry = (e: Event) => {
      const customEvent = e as CustomEvent<{ type: string; payload: WeatherEvent }>;
      const msg = customEvent.detail;
      if (!msg || !msg.payload) return;

      if (msg.type === 'event_created') {
        setEvents((prev) => deduplicateWeatherEvents([msg.payload, ...prev]));
      } else if (msg.type === 'event_updated') {
        setEvents((prev) =>
          deduplicateWeatherEvents(
            prev.map((item) => (item.id === msg.payload.id ? msg.payload : item))
          )
        );
      }
    };

    window.addEventListener('skysignal:telemetry', handleTelemetry);
    return () => window.removeEventListener('skysignal:telemetry', handleTelemetry);
  }, []);

  // Compute distances from user's current location with deduplicated canonical events
  const eventsWithDistance = useMemo(() => {
    const deduplicated = deduplicateWeatherEvents(events);
    return deduplicated
      .map((ev) => {
        const distanceKm = calculateDistanceKm(
          userLoc.lat,
          userLoc.lng,
          ev.lat,
          ev.lon
        );
        return { ...ev, distanceKm };
      })
      .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
  }, [events, userLoc.lat, userLoc.lng]);

  // Closest hazard to user
  const nearestHazard = useMemo(() => {
    return eventsWithDistance.length > 0 ? eventsWithDistance[0] : null;
  }, [eventsWithDistance]);

  // Filtered events
  const filteredEvents = useMemo(() => {
    if (selectedCategory === 'all') return eventsWithDistance;
    return eventsWithDistance.filter((e) => e.category === selectedCategory);
  }, [eventsWithDistance, selectedCategory]);

  const handleFlyToLocation = (ev: WeatherEvent, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    // Switch to split map view if in full table view
    if (viewMode !== 'split') {
      setViewMode('split');
    }

    // Pinpoint on map only (do not open right sidebar)
    const triggerRecenter = () => {
      window.dispatchEvent(
        new CustomEvent('skysignal:recenter-map', {
          detail: {
            lat: ev.lat,
            lng: ev.lon,
            zoom: 16,
            name: ev.title,
            eventId: ev.id,
          },
        })
      );
    };

    // Trigger immediate & secondary dispatch once container unhides
    triggerRecenter();
    setTimeout(triggerRecenter, 80);
    setTimeout(triggerRecenter, 200);

    // Smooth scroll up to weather status map
    setTimeout(() => {
      const weatherStatusElem = document.getElementById('weather-status');
      if (weatherStatusElem) {
        weatherStatusElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 40);
  };

  const handleSelectCard = (ev: WeatherEvent) => {
    setSelectedEvent(ev);
  };

  const handleResetLocation = () => {
    setSelectedCategory('all');
    setSelectedEvent(null);
    window.dispatchEvent(
      new CustomEvent('skysignal:recenter-map', {
        detail: { lat: userLoc.lat, lng: userLoc.lng, zoom: 16, isReset: true },
      })
    );
  };

  const handleQuickShareWhatsApp = (ev: WeatherEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    const city = ev.city || 'India';
    const state = ev.state || '';
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/#weather-status` : 'https://skysignal.gov.in';
    const text = `⚠️ *SkySignal Live Weather Alert: ${ev.title}*
📍 *Location:* ${city}${state ? `, ${state}` : ''}
🌧️ *Hazard:* ${(ev.category || 'Weather').toUpperCase()} [${(ev.severity || 'Moderate').toUpperCase()} SEVERITY]
⚡ *AI Confidence:* ${ev.confidence}%

🛰️ *Track Live Doppler Radar & Telemetry:*
${shareUrl}`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Helper for category badge colors
  const getCatBadge = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'rainfall':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'thunderstorm':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'flooding':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'heatwave':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'fog':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-sky-100 text-sky-700 border-sky-200';
    }
  };

  return (
    <div className="space-y-10 pb-20 animate-fade-in w-full max-w-[1700px] mx-auto">
      
      {/* ════════════════════════════════════════════════════════════
          HERO CAPSULE: HYPERLOCAL WEATHER & LIVE PROXIMITY HUB
         ════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2d2a27] via-[#24211f] to-[#1a1816] text-white shadow-2xl border border-[#443e39]/80 p-6 sm:p-8">
        {/* Atmospheric ambient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header Row: Location Title & Telemetry State */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#443e39] pb-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[12px] font-black uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  {isHindi ? 'लाइव डॉपलर रडार सिंक' : 'Live Doppler Radar Synced'}
                </span>
                <span className="text-stone-400 text-[13px] font-medium hidden sm:inline">
                  {isHindi ? 'अभी अपडेट किया गया' : 'Updated just now'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <h1 className="text-[26px] sm:text-[32px] font-black tracking-tight text-white flex items-center gap-2">
                  <MapPin className="text-amber-400 shrink-0" size={28} />
                  <span>{userLoc.cityName}</span>
                  {userLoc.stateName && (
                    <span className="text-stone-400 text-[18px] sm:text-[22px] font-semibold">
                      , {userLoc.stateName}
                    </span>
                  )}
                </h1>

                <button
                  onClick={openLocationModal}
                  className="px-3 py-1 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 border border-amber-400/40 text-amber-200 text-[12px] font-bold transition-all cursor-pointer hover:scale-105 active:scale-95"
                  title={isHindi ? 'वर्तमान स्थान बदलें' : 'Change your current location'}
                >
                  {isHindi ? 'स्थान बदलें' : 'Change Location'}
                </button>
              </div>
            </div>

            {/* Quick CTAs */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => {
                  const reportElem = document.getElementById('report');
                  if (reportElem) reportElem.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-extrabold text-[13px] shadow-lg shadow-amber-600/20 transition-all cursor-pointer active:scale-95"
              >
                <AlertTriangle size={15} />
                <span>{isHindi ? 'मौसम घटना की रिपोर्ट करें' : 'Report Weather Incident'}</span>
              </button>

              {isAdmin && (
                <button
                  onClick={() => {
                    const analyticsElem = document.getElementById('analytics');
                    if (analyticsElem) analyticsElem.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#383430] hover:bg-[#443e39] border border-[#57534e]/60 text-stone-200 font-extrabold text-[13px] transition-all cursor-pointer active:scale-95"
                >
                  <Activity size={15} className="text-amber-400" />
                  <span>{isHindi ? 'एनालिटिक्स डैशबोर्ड' : 'Analytics Dashboard'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Location Switcher Bar (Home Page Inline Selector) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <MapPin size={12} className="text-amber-400" />
              {isHindi ? 'त्वरित क्षेत्र:' : 'Quick Region:'}
            </span>
            {PRESET_CITIES.map((city) => {
              const isActive = userLoc.cityName.toLowerCase() === city.cityName.toLowerCase();
              return (
                <button
                  key={city.cityName}
                  onClick={() => setCityLocation(city)}
                  className={`px-3 py-1 rounded-xl text-[12px] font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/30 font-black scale-105'
                      : 'bg-[#332f2c] hover:bg-[#443e39] text-stone-300 border border-[#57534e]/50 hover:text-white'
                  }`}
                  title={`Switch active telemetry to ${city.cityName}, ${city.stateName}`}
                >
                  <span>{city.weatherIcon}</span>
                  <span>{city.cityName}</span>
                  <span className="text-[10px] opacity-80">{city.tempC}°C</span>
                </button>
              );
            })}
            <button
              onClick={openLocationModal}
              className="px-3 py-1 rounded-xl bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/40 text-[12px] font-bold transition-all shrink-0 cursor-pointer"
            >
              {isHindi ? '+ इलाका खोजें' : '+ Search Locality'}
            </button>
          </div>

          {/* Core Grid: Live Temperature, Proximity Alert Pill & Sensor Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left: Focal Temperature & Condition */}
            <div className="lg:col-span-4 flex items-center gap-5 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="text-[52px] sm:text-[60px] leading-none drop-shadow-md select-none">
                {userLoc.weatherIcon}
              </span>
              <div className="space-y-0.5">
                <div className="flex items-baseline gap-2">
                  <span className="text-[42px] sm:text-[48px] font-black tracking-tighter text-white leading-none">
                    {userLoc.tempC}°
                  </span>
                  <span className="text-[18px] font-bold text-stone-400">C</span>
                </div>
                <div className="text-[15px] font-extrabold text-amber-300">
                  {translateCondition(userLoc.condition, isHindi)}
                </div>
                <div className="text-[12px] text-stone-400 font-medium">
                  {isHindi
                    ? `${userLoc.tempC + 2}°C जैसा महसूस होता है · सामान्य बैरोमीटर सूचकांक`
                    : `Feels like ${userLoc.tempC + 2}°C · Fair Barometric Index`}
                </div>
              </div>
            </div>

            {/* Right: Atmospheric Telemetry Sensor Matrix */}
            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {/* Humidity */}
              <div className="p-3 rounded-2xl bg-[#24211f]/60 border border-[#443e39]/60 space-y-1">
                <div className="flex items-center gap-1.5 text-stone-400 text-[11px] font-bold uppercase tracking-wider">
                  <Droplets size={13} className="text-amber-400" />
                  <span>{isHindi ? 'आर्द्रता' : 'Humidity'}</span>
                </div>
                <div className="text-[16px] font-black text-white">68%</div>
                <div className="text-[10.5px] text-stone-400 font-medium">{isHindi ? 'अनुकूल' : 'Optimum'}</div>
              </div>

              {/* Wind Speed */}
              <div className="p-3 rounded-2xl bg-[#24211f]/60 border border-[#443e39]/60 space-y-1">
                <div className="flex items-center gap-1.5 text-stone-400 text-[11px] font-bold uppercase tracking-wider">
                  <Wind size={13} className="text-amber-400" />
                  <span>{isHindi ? 'हवा की गति' : 'Wind Speed'}</span>
                </div>
                <div className="text-[16px] font-black text-white">16 km/h</div>
                <div className="text-[10.5px] text-stone-400 font-medium">{isHindi ? 'उ-प हवा' : 'NW Breeze'}</div>
              </div>

              {/* Pressure */}
              <div className="p-3 rounded-2xl bg-[#24211f]/60 border border-[#443e39]/60 space-y-1">
                <div className="flex items-center gap-1.5 text-stone-400 text-[11px] font-bold uppercase tracking-wider">
                  <Gauge size={13} className="text-amber-400" />
                  <span>{isHindi ? 'वायुदाब' : 'Pressure'}</span>
                </div>
                <div className="text-[16px] font-black text-white">1013 hPa</div>
                <div className="text-[10.5px] text-stone-400 font-medium">{isHindi ? 'स्थिर' : 'Stable'}</div>
              </div>

              {/* Visibility */}
              <div className="p-3 rounded-2xl bg-[#24211f]/60 border border-[#443e39]/60 space-y-1">
                <div className="flex items-center gap-1.5 text-stone-400 text-[11px] font-bold uppercase tracking-wider">
                  <Eye size={13} className="text-amber-400" />
                  <span>{isHindi ? 'दृश्यता' : 'Visibility'}</span>
                </div>
                <div className="text-[16px] font-black text-white">10.0 km</div>
                <div className="text-[10.5px] text-stone-400 font-medium">{isHindi ? 'स्पष्ट दृष्टि' : 'Clear Sight'}</div>
              </div>

              {/* UV Index */}
              <div className="p-3 rounded-2xl bg-[#24211f]/60 border border-[#443e39]/60 space-y-1">
                <div className="flex items-center gap-1.5 text-stone-400 text-[11px] font-bold uppercase tracking-wider">
                  <Sun size={13} className="text-amber-400" />
                  <span>{isHindi ? 'यूवी इंडेक्स' : 'UV Index'}</span>
                </div>
                <div className="text-[16px] font-black text-white">6 · {isHindi ? 'उच्च' : 'High'}</div>
                <div className="text-[10.5px] text-stone-400 font-medium">{isHindi ? 'सुरक्षा आवश्यक' : 'Protection req.'}</div>
              </div>

              {/* AQI */}
              <div className="p-3 rounded-2xl bg-[#24211f]/60 border border-[#443e39]/60 space-y-1">
                <div className="flex items-center gap-1.5 text-stone-400 text-[11px] font-bold uppercase tracking-wider">
                  <Radio size={13} className="text-emerald-400" />
                  <span>{isHindi ? 'वायु गुणवत्ता' : 'Air Quality'}</span>
                </div>
                <div className="text-[16px] font-black text-emerald-400">AQI 72</div>
                <div className="text-[10.5px] text-stone-400 font-medium">{isHindi ? 'मध्यम' : 'Moderate'}</div>
              </div>
            </div>
          </div>

          {/* Bottom Proximity Alert Banner */}
          {nearestHazard && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#24211f]/80 border border-[#443e39]/80 text-[13px]">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-300">
                  <CloudLightning size={16} />
                </span>
                <div>
                  <span className="font-extrabold text-white">{isHindi ? 'निकटतम ट्रैक की गई घटना: ' : 'Nearest Tracked Incident: '}</span>
                  <span className="text-amber-200">{translateEventTitle(nearestHazard.title, isHindi)}</span>
                  <span className="text-stone-400 ml-1.5 font-semibold">
                    {isHindi
                      ? `(${nearestHazard.distanceKm} किमी दूर, ${nearestHazard.city} में)`
                      : `(${nearestHazard.distanceKm} km from you in ${nearestHazard.city})`}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleFlyToLocation(nearestHazard)}
                className="inline-flex items-center gap-1 font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer shrink-0"
              >
                <span>{isHindi ? 'जियो-रडार पर देखें' : 'View on GeoRadar'}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          METRIC CARDS STRIP (Admin / Analyst Only)
         ════════════════════════════════════════════════════════════ */}
      {isAdmin && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
          <div className="p-4.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
            <div className="text-[11.5px] font-black uppercase tracking-wider text-slate-500">
              {isHindi ? 'सक्रिय खतरे' : 'Active Hazards'}
            </div>
            <div className="text-[26px] font-black text-slate-900 flex items-center gap-2">
              <span>{events.length}</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                {events.filter((e) => e.severity === 'severe').length} {isHindi ? 'गंभीर' : 'Severe'}
              </span>
            </div>
            <div className="text-[12px] text-slate-500 font-medium">
              {isHindi ? 'वास्तविक समय में ट्रैक किए गए खतरे' : 'Real-time monitored threats'}
            </div>
          </div>

          <div className="p-4.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
            <div className="text-[11.5px] font-black uppercase tracking-wider text-slate-500">
              {isHindi ? 'डॉपलर रडार स्टेशन' : 'Doppler Radars'}
            </div>
            <div className="text-[26px] font-black text-slate-900 flex items-center gap-2">
              <span>38</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                100% {isHindi ? 'ऑनलाइन' : 'Online'}
              </span>
            </div>
            <div className="text-[12px] text-slate-500 font-medium">
              {isHindi ? 'एस-बैंड और सी-बैंड रडार नेटवर्क' : 'S-Band & C-Band stations'}
            </div>
          </div>

          <div className="p-4.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
            <div className="text-[11.5px] font-black uppercase tracking-wider text-slate-500">
              {isHindi ? 'जमीनी अवलोकन रिपोर्ट' : 'Ground-Truth Reports'}
            </div>
            <div className="text-[26px] font-black text-slate-900 flex items-center gap-2">
              <span>1,420+</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200">
                98.4% {isHindi ? 'एआई मिलान' : 'AI Match'}
              </span>
            </div>
            <div className="text-[12px] text-slate-500 font-medium">
              {isHindi ? 'सत्यापित नागरिक अवलोकन' : 'Validated citizen observations'}
            </div>
          </div>

          <div className="p-4.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
            <div className="text-[11.5px] font-black uppercase tracking-wider text-slate-500">
              {isHindi ? '24 घंटे में अधिकतम वर्षा' : '24h Peak Rainfall'}
            </div>
            <div className="text-[26px] font-black text-slate-900 flex items-center gap-2">
              <span>142 mm</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                {isHindi ? 'भारी बहाव' : 'High Runoff'}
              </span>
            </div>
            <div className="text-[12px] text-slate-500 font-medium">
              {isHindi ? 'तटीय बेल्ट में दर्ज' : 'Recorded in coastal belt'}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          SECTION 1: WEATHER STATUS (Live GeoRadar & Event Stream)
         ════════════════════════════════════════════════════════════ */}
      <section id="weather-status" className="scroll-mt-32 space-y-4">
        {/* ── Top Action Bar (Reset on Left, View Modes & Filter on Right) ── */}
        <div className="relative z-40 flex items-center justify-between gap-3 w-full flex-wrap">
          {/* Reset to My Location Button (Left) */}
          <button
            onClick={handleResetLocation}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white hover:bg-sky-50 border-2 border-sky-200 text-sky-700 font-extrabold text-[13.5px] shadow-sm transition-all cursor-pointer active:scale-95 shrink-0"
            title={isHindi ? 'मानचित्र को अपने स्थान पर पुनः केंद्रित करें' : 'Recenter map back to your detected location'}
          >
            <RotateCcw size={15} className="text-sky-600 shrink-0" />
            <span>{isHindi ? 'मेरे स्थान पर रीसेट करें' : 'Reset to My Location'}</span>
          </button>

          {/* Right Section: View Mode Toggle & Filter Dropdown */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* View Mode Segmented Buttons */}
            <div className="flex items-center gap-1 p-1 bg-white border-2 border-sky-200 rounded-xl shadow-sm h-10">
              <button
                onClick={() => setViewMode('split')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-extrabold transition-all cursor-pointer ${
                  viewMode === 'split'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-sky-700 hover:bg-sky-50'
                }`}
              >
                <LayoutGrid size={14} />
                <span>{isHindi ? 'मानचित्र और ग्रिड' : 'Split Map & Grid'}</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-extrabold transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-sky-700 hover:bg-sky-50'
                }`}
              >
                <TableIcon size={14} />
                <span>{isHindi ? 'निर्देशिका तालिका' : 'Full Directory Table'}</span>
              </button>
            </div>

            {/* Filter Dropdown Button */}
            <div ref={filterRef} className="relative z-50">
              <button
                onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white hover:bg-sky-50 border-2 border-sky-200 text-slate-800 font-extrabold text-[13.5px] shadow-sm transition-all cursor-pointer active:scale-95 shrink-0"
              >
                <SlidersHorizontal size={15} className="text-sky-600 shrink-0" />
                <span>
                  {isHindi ? 'फ़िल्टर: ' : 'Filter: '}
                  {selectedCategory === 'all'
                    ? (isHindi ? 'सभी खतरे' : 'All Hazards')
                    : translateCategory(selectedCategory, isHindi)}{' '}
                  ({selectedCategory === 'all' ? events.length : events.filter((e) => e.category === selectedCategory).length})
                </span>
                <ChevronDown
                  size={15}
                  className={`text-slate-400 transition-transform ${filterDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Filter Options Popover Dropdown */}
              {filterDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border-2 border-sky-300 p-2.5 space-y-1.5 animate-fade-in z-[9999] divide-y divide-slate-100">
                  <div className="p-1">
                    <button
                      onClick={() => {
                        setSelectedCategory('all');
                        setFilterDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13.5px] font-extrabold transition-colors cursor-pointer ${
                        selectedCategory === 'all'
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      <span>{isHindi ? 'सभी खतरे' : 'All Hazards'}</span>
                      <span className="text-[12px] opacity-75 font-normal">({events.length})</span>
                    </button>
                  </div>

                  <div className="pt-1.5 space-y-1">
                    {Object.entries(CATEGORY_CONFIG).map(([catKey, cfg]) => {
                      const count = events.filter((e) => e.category === catKey).length;
                      const isSelected = selectedCategory === catKey;
                      return (
                        <button
                          key={catKey}
                          onClick={() => {
                            setSelectedCategory(catKey);
                            setFilterDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-[13px] font-bold capitalize transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-sky-600 text-white shadow-sm'
                              : 'hover:bg-sky-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-3 h-3 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: cfg.color }} />
                            <span>{translateCategory(catKey, isHindi)}</span>
                          </div>
                          <span className="text-[12px] opacity-80 font-normal">({count})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Main View Content (Split Map & Grid AND Full Directory Table) ── */}
        <div className={viewMode === 'split' ? 'grid grid-cols-1 lg:grid-cols-12 gap-5 items-start animate-fade-in' : 'hidden'}>
          {/* Left: GeoRadar Map (approx 58%) — Sticky on desktop */}
          <div className="lg:col-span-7 xl:col-span-7 rounded-3xl overflow-hidden border-2 border-sky-200 shadow-md bg-white relative h-[520px] lg:h-[calc(100vh-170px)] min-h-[500px] lg:sticky lg:top-[124px]">
            <GeoRadarMap
              events={filteredEvents}
              onSelectEvent={setSelectedEvent}
              height="h-full"
            />
          </div>

          {/* Right: Full Continuous Weather Events List (approx 42%) — No Cutoff */}
          <div className="lg:col-span-5 xl:col-span-5 space-y-3.5">
            {filteredEvents.map((ev) => {
              const isSevere = ev.severity === 'severe';
              const isModerate = ev.severity === 'moderate';

              return (
                <div
                  key={ev.id}
                  onClick={() => handleSelectCard(ev)}
                  className={`p-4 sm:p-4.5 rounded-2xl bg-white border-2 transition-all cursor-pointer space-y-2.5 shadow-xs hover:shadow-md ${
                    selectedEvent?.id === ev.id
                      ? 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/40'
                      : 'border-slate-100 hover:border-sky-300'
                  }`}
                >
                  {/* Top Row: Category Pill, Severity Badge (and Ticket ID only if Admin) */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {isAdmin && (
                        <span className="font-mono text-[11px] font-bold text-slate-400 bg-slate-100/90 px-2 py-0.5 rounded-md border border-slate-200/80">
                          {ev.id}
                        </span>
                      )}
                      <span
                        className={`text-[12px] font-extrabold capitalize px-2.5 py-0.5 rounded-lg border ${getCatBadge(
                          ev.category
                        )}`}
                      >
                        {translateCategory(ev.category, isHindi)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {ev.distanceKm !== undefined && (
                        <span className="text-[11.5px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {isHindi ? `${ev.distanceKm} किमी दूर` : `${ev.distanceKm} km away`}
                        </span>
                      )}
                      <span
                        className={`font-black text-[10.5px] px-2.5 py-0.5 rounded-md uppercase tracking-wider flex items-center border ${
                          isSevere
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : isModerate
                            ? 'bg-sky-50 text-sky-700 border-sky-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {translateSeverity(ev.severity, isHindi)}
                      </span>
                    </div>
                  </div>

                  {/* Middle: Event Title */}
                  <h3 className="text-[15.5px] sm:text-[16.5px] font-black text-slate-900 leading-snug hover:text-sky-700 transition-colors">
                    {translateEventTitle(ev.title, isHindi)}
                  </h3>

                  {/* Bottom Row: Location & Green Confidence Badge */}
                  <div className="flex items-center justify-between text-[12.5px] pt-1 text-slate-600">
                    <button
                      type="button"
                      onClick={(e) => handleFlyToLocation(ev, e)}
                      className="flex items-center gap-1.5 font-bold text-slate-700 hover:text-sky-600 hover:bg-sky-50 px-2 py-1 rounded-lg transition-all truncate group/loc cursor-pointer"
                      title={isHindi ? 'मानचित्र पर इस स्थान को देखें' : 'Focus and view this location on the map'}
                    >
                      <MapPin size={14} className="text-sky-500 group-hover/loc:scale-110 transition-transform shrink-0" />
                      <span className="truncate">{ev.city}, {ev.state}</span>
                    </button>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-emerald-700 font-extrabold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg text-[12px]">
                        {ev.confidence}% {isHindi ? 'सटीकता' : ''}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleQuickShareWhatsApp(ev, e)}
                        className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                        title={isHindi ? 'व्हाट्सएप पर साझा करें' : 'Quick share on WhatsApp'}
                      >
                        <Share2 size={13} />
                        <span className="hidden sm:inline">{isHindi ? 'साझा करें' : 'Share'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Full Directory Table View */}
        <div className={viewMode === 'table' ? 'overflow-hidden rounded-3xl border-2 border-sky-200 shadow-md bg-white animate-fade-in' : 'hidden'}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b-2 border-sky-100 bg-sky-50/70 text-[11.5px] font-black text-slate-600 uppercase tracking-wider">
                    <th className="py-4 px-5">{isHindi ? 'घटना / खतरा' : 'Incident / Hazard'}</th>
                    <th className="py-4 px-3">{isHindi ? 'स्थान और क्षेत्र' : 'Location & Region'}</th>
                    <th className="py-4 px-3">{isHindi ? 'दूरी' : 'Proximity'}</th>
                    <th className="py-4 px-3">{isHindi ? 'गंभीरता' : 'Severity'}</th>
                    <th className="py-4 px-3">{isHindi ? 'स्थिति' : 'Lifecycle State'}</th>
                    <th className="py-4 px-4">{isHindi ? 'एआई विश्वास' : 'AI Confidence'}</th>
                    <th className="py-4 px-3">{isHindi ? 'साक्ष्य स्रोत' : 'Evidence Sources'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEvents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-14 text-center text-slate-400 font-medium">
                        {isHindi ? 'चयनित फ़िल्टर से कोई मौसम घटना मेल नहीं खाती।' : 'No weather events match the selected filter.'}
                      </td>
                    </tr>
                  ) : (
                    filteredEvents.map((evt) => {
                      const isSevere = evt.severity === 'severe';
                      const isModerate = evt.severity === 'moderate';

                      return (
                        <tr
                          key={evt.id}
                          onClick={() => handleSelectCard(evt)}
                          className="hover:bg-sky-50/50 transition-colors cursor-pointer group"
                        >
                          {/* Incident / Hazard */}
                          <td className="py-3.5 px-5">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                {isAdmin && (
                                  <span className="font-mono text-[10.5px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                    {evt.id}
                                  </span>
                                )}
                                <span
                                  className={`text-[11px] font-extrabold capitalize px-2 py-0.5 rounded-md border ${getCatBadge(
                                    evt.category
                                  )}`}
                                >
                                  {translateCategory(evt.category, isHindi)}
                                </span>
                              </div>
                              <div className="font-extrabold text-[15px] text-slate-900 group-hover:text-sky-700 transition-colors">
                                {translateEventTitle(evt.title, isHindi)}
                              </div>
                            </div>
                          </td>

                          {/* Location */}
                          <td className="py-3.5 px-3">
                            <button
                              type="button"
                              onClick={(e) => handleFlyToLocation(evt, e)}
                              className="flex items-center gap-1.5 font-bold text-slate-800 hover:text-sky-600 hover:bg-sky-50 px-2.5 py-1.5 rounded-lg border border-transparent hover:border-sky-200 transition-all text-left group/loctbl cursor-pointer"
                              title={isHindi ? 'मानचित्र पर देखें' : 'Direct to this location on the map'}
                            >
                              <MapPin size={14} className="text-sky-500 group-hover/loctbl:scale-110 transition-transform shrink-0" />
                              <span>{evt.city}, {evt.state}</span>
                            </button>
                          </td>

                          {/* Proximity */}
                          <td className="py-3.5 px-3 font-bold text-slate-600 text-[12px]">
                            {evt.distanceKm !== undefined ? (isHindi ? `${evt.distanceKm} किमी` : `${evt.distanceKm} km`) : '—'}
                          </td>

                          {/* Severity */}
                          <td className="py-3.5 px-3">
                            <span
                              className={`font-black text-[11px] px-2.5 py-0.5 rounded-md uppercase tracking-wider border ${
                                isSevere
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : isModerate
                                  ? 'bg-sky-50 text-sky-700 border-sky-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}
                            >
                              {translateSeverity(evt.severity, isHindi)}
                            </span>
                          </td>

                          {/* Lifecycle */}
                          <td className="py-3.5 px-3">
                            <span className="font-bold text-[12px] text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-lg capitalize">
                              {translateLifecycle(evt.lifecycle_status, isHindi)}
                            </span>
                          </td>

                          {/* AI Confidence */}
                          <td className="py-3.5 px-4">
                            <span className="text-emerald-700 font-extrabold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg text-[12px]">
                              {evt.confidence}% {isHindi ? 'विश्वास' : 'confidence'}
                            </span>
                          </td>

                          {/* Evidence Sources */}
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-1.5 font-semibold text-slate-600 text-[12px]">
                              <span className="w-2 h-2 rounded-full bg-sky-500" />
                              <span>{evt.independent_source_count || 3} {isHindi ? 'सत्यापित फ़ीड' : 'verified feeds'}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          SECTION 2: ANALYTICS DASHBOARD (Analyst / Admin Only)
         ════════════════════════════════════════════════════════════ */}
      {isAdmin && (
        <section id="analytics" className="scroll-mt-32 pt-4">
          <Analytics />
        </section>
      )}

      {/* ════════════════════════════════════════════════════════════
          SECTION 3: CITIZEN REPORTING PORTAL (Citizen View Only)
         ════════════════════════════════════════════════════════════ */}
      {!isAdmin && (
        <section id="report" className="scroll-mt-32 pt-4">
          <CitizenPortal />
        </section>
      )}

      {/* ── Event Detail Drawer ── */}
      {selectedEvent && (
        <EventDetailDrawer
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}
