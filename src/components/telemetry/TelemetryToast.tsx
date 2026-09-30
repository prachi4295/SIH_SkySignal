/* ═══════════════════════════════════════════════════════
   SkySignal — Real-Time Telemetry Toast System
   Subscribes to mock SSE event stream & renders live alerts
   Floating glassmorphic toast with hazard icon, title,
   and "View on Map" action. Broadcasts skysignal:telemetry
   events to dynamically update map markers and counters.
   ═══════════════════════════════════════════════════════ */

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMockTelemetry } from '../../services/mockApi';
import { X, MapPin, ExternalLink, Radio, MoreHorizontal, BellOff, Clock } from 'lucide-react';
import type { TelemetryMessage, WeatherEvent } from '../../types/weather';
import { CATEGORY_CONFIG, SEVERITY_CONFIG } from '../../data/mock';
import { SEVERITY_HI, translateEventTitle } from '../../lib/hindiTranslations';

interface TelemetryToastProps {
  onSelectEvent?: (event: WeatherEvent) => void;
}

export default function TelemetryToast({ onSelectEvent: _onSelectEvent }: TelemetryToastProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';
  const [activeToast, setActiveToast] = useState<TelemetryMessage | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem('skysignal_alerts_muted') === 'true';
    } catch {
      return false;
    }
  });
  const [snoozeUntil, setSnoozeUntil] = useState<number>(() => {
    try {
      const val = localStorage.getItem('skysignal_alerts_snooze_until');
      return val ? parseInt(val, 10) : 0;
    } catch {
      return 0;
    }
  });

  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // Subscribe to real-time mock telemetry stream
  useMockTelemetry({
    enabled: true,
    intervalMs: 14_000,
    onMessage: (message: TelemetryMessage) => {
      // Broadcast event to entire window for live map & counter auto-updates regardless of toast visibility
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('skysignal:telemetry', { detail: message })
        );
      }

      // Check if toasts are silenced/muted or snoozed
      const now = Date.now();
      if (isMuted || (snoozeUntil && snoozeUntil > now)) {
        return;
      }

      setActiveToast(message);
      setShowMenu(false);

      // Auto-dismiss after 6 seconds
      const timer = setTimeout(() => {
        setActiveToast((curr) => (curr?.timestamp === message.timestamp ? null : curr));
      }, 6000);
      return () => clearTimeout(timer);
    },
  });

  const handleCloseAllAndMute = () => {
    setIsMuted(true);
    try {
      localStorage.setItem('skysignal_alerts_muted', 'true');
    } catch {
      // ignore storage errors
    }
    setActiveToast(null);
    setShowMenu(false);
  };

  const handleSnooze = (minutes: number) => {
    const until = Date.now() + minutes * 60 * 1000;
    setSnoozeUntil(until);
    try {
      localStorage.setItem('skysignal_alerts_snooze_until', until.toString());
    } catch {
      // ignore storage errors
    }
    setActiveToast(null);
    setShowMenu(false);
  };

  if (!activeToast) return null;

  const event = activeToast.payload;
  const sevConfig = SEVERITY_CONFIG[event.severity];
  const catConfig = CATEGORY_CONFIG[event.category];

  const handleViewOnMap = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const targetLat = event.lat ?? (event as any)?.location?.lat ?? 19.076;
    const targetLng = event.lon ?? (event as any)?.lng ?? (event as any)?.location?.lng ?? 72.8777;

    // 1. If not on overview dashboard, navigate to root
    if (location.pathname !== '/' && location.pathname !== '') {
      navigate('/');
    }

    // 2. Dispatch recenter & flyTo event to map
    const dispatchFlyTo = () => {
      window.dispatchEvent(
        new CustomEvent('skysignal:recenter-map', {
          detail: {
            lat: targetLat,
            lng: targetLng,
            zoom: 15,
            name: event.title,
            eventId: event.id,
          },
        })
      );
    };

    // 3. Smooth scroll down to map element
    const scrollToMap = () => {
      const mapElement = document.getElementById('weather-status');
      if (mapElement) {
        mapElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    // Immediate attempt
    dispatchFlyTo();
    scrollToMap();

    // Cascading retries after layout paint / route transition
    setTimeout(() => {
      scrollToMap();
      dispatchFlyTo();
    }, 80);

    setTimeout(() => {
      dispatchFlyTo();
    }, 250);

    setTimeout(() => {
      dispatchFlyTo();
    }, 600);

    // Dismiss toast
    setActiveToast(null);
    setShowMenu(false);
  };

  return (
    <aside
      aria-label="Real-time telemetry alert"
      className="fixed bottom-28 sm:bottom-32 right-6 z-50 max-w-sm w-full animate-slide-in-right"
    >
      <div
        className="glass-card p-4 rounded-3xl border border-amber-300/90 shadow-2xl bg-white/95 backdrop-blur-2xl ring-1 ring-amber-500/30 space-y-3 relative"
      >
        {/* Toast Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider flex items-center gap-1 font-mono">
              <Radio size={11} className="text-amber-600 animate-pulse" />
              {activeToast.type === 'event_created'
                ? (isHindi ? 'नई लाइव घटना' : 'New Live Incident')
                : (isHindi ? 'डॉपलर रडार अपडेट' : 'Doppler Radar Update')}
            </span>
          </div>

          {/* Action buttons: Three Dots + Cross */}
          <div className="flex items-center gap-1 relative">
            {/* Three horizontal dots button */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu((prev) => !prev);
                }}
                className={`p-1 rounded-lg transition-colors cursor-pointer ${
                  showMenu
                    ? 'bg-slate-200 text-slate-800'
                    : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
                }`}
                title={isHindi ? 'अलर्ट विकल्प' : 'Alert notification options'}
                aria-label={isHindi ? 'अलर्ट विकल्प' : 'Alert options'}
              >
                <MoreHorizontal size={15} />
              </button>

              {/* Three dots dropdown menu */}
              {showMenu && (
                <div
                  className="
                    absolute right-0 top-full mt-1.5 w-60
                    bg-white/98 backdrop-blur-2xl rounded-2xl
                    border border-slate-200/90 shadow-2xl p-1.5 z-60
                    animate-in fade-in zoom-in-95 space-y-1
                  "
                >
                  <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {isHindi ? 'अलर्ट सेटिंग्स' : 'Alert Settings'}
                  </div>

                  {/* Close all notifications / mute */}
                  <button
                    onClick={handleCloseAllAndMute}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 text-left rounded-xl hover:bg-rose-50 text-rose-600 font-bold text-[12px] transition-colors cursor-pointer group"
                  >
                    <BellOff size={15} className="text-rose-500 group-hover:scale-110 transition-transform shrink-0" />
                    <div>
                      <div className="leading-tight">{isHindi ? 'सभी अलर्ट म्यूट करें' : 'Close & Mute All Alerts'}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{isHindi ? 'अलर्ट पॉपअप बैनर बंद करें' : 'Turn off alert popup banners'}</div>
                    </div>
                  </button>

                  {/* Snooze option */}
                  <button
                    onClick={() => handleSnooze(15)}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 text-left rounded-xl hover:bg-slate-100 text-slate-700 font-semibold text-[12px] transition-colors cursor-pointer"
                  >
                    <Clock size={15} className="text-slate-500 shrink-0" />
                    <div>
                      <div className="leading-tight">{isHindi ? '15 मिनट के लिए स्नूज़ करें' : 'Snooze for 15 Minutes'}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{isHindi ? 'अस्थायी पॉपअप रोकें' : 'Temporary silence popups'}</div>
                    </div>
                  </button>

                  <div className="h-px bg-slate-100 my-1" />

                  {/* Close single alert */}
                  <button
                    onClick={() => {
                      setActiveToast(null);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-left rounded-xl hover:bg-slate-100 text-slate-600 font-medium text-[11px] transition-colors cursor-pointer"
                  >
                    <X size={13} className="text-slate-400 shrink-0" />
                    <span>{isHindi ? 'केवल यह अलर्ट बंद करें' : 'Close this alert only'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Close cross button */}
            <button
              onClick={() => {
                setActiveToast(null);
                setShowMenu(false);
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label={isHindi ? 'खारिज करें' : 'Dismiss toast'}
              title={isHindi ? 'खारिज करें' : 'Dismiss'}
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Hazard & Title */}
        <div className="flex items-start gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs mt-0.5"
            style={{ backgroundColor: catConfig?.bgColor, color: catConfig?.color }}
          >
            {catConfig?.icon === 'CloudRain' ? '🌧️' : catConfig?.icon === 'Waves' ? '🌊' : catConfig?.icon === 'Thermometer' ? '🌡️' : '⚡'}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-[13px] font-black text-slate-900 truncate leading-tight">
              {translateEventTitle(event.title, isHindi)}
            </h4>

            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
              <div className="flex items-center gap-0.5">
                <MapPin size={11} className="text-amber-600" />
                <span>{event.city}, {event.state}</span>
              </div>
              <span>•</span>
              <span
                className={`font-black uppercase text-[10px] ${
                  event.severity === 'severe'
                    ? 'text-rose-600'
                    : event.severity === 'moderate'
                    ? 'text-amber-600'
                    : 'text-emerald-600'
                }`}
              >
                {sevConfig?.icon} {isHindi ? (SEVERITY_HI[event.severity] || event.severity) : event.severity}
              </span>
            </div>
          </div>
        </div>

        {/* Toast Actions */}
        <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100">
          <span className="text-[10px] text-slate-400 font-mono">
            {new Date(activeToast.timestamp).toLocaleTimeString(isHindi ? 'hi-IN' : 'en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} IST
          </span>

          <button
            onClick={handleViewOnMap}
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>{isHindi ? 'मानचित्र पर देखें' : 'View on Map'}</span>
            <ExternalLink size={12} />
          </button>
        </div>
      </div>
    </aside>
  );
}
