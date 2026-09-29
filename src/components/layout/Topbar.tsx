/* ═══════════════════════════════════════════════════════
   SkySignal — Topbar Header
   Sticky top bar with breadcrumbs, Live IST clock,
   pulsing telemetry chip, i18n switcher, notifications,
   and Analyst Auth integration.
   ═══════════════════════════════════════════════════════ */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useUserLocation } from '../../context/LocationContext';
import {
  Bell,
  ShieldCheck,
  ShieldAlert,
  X,
  LogOut,
  Navigation,
} from 'lucide-react';
import { mockWeatherEvents } from '../../lib/mockData';

import LocationSearchBar from '../location/LocationSearchBar';

interface TopbarProps {
  onToggleMenu?: () => void;
}

export default function Topbar({ onToggleMenu: _onToggleMenu }: TopbarProps = {}) {
  const { i18n } = useTranslation();
  const { isAdmin, user, openLoginModal, logout } = useAuth();
  const {
    location: userLoc,
    openModal: openLocationModal,
    detectGPSLocation,
    isDetecting,
  } = useUserLocation();

  const isHindi = i18n.language === 'hi';

  // Live IST Clock
  const [istTime, setIstTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format: "24 Sep 2026 · 14:32 IST"
      const datePart = now.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Kolkata',
      });
      const timePart = now.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'Asia/Kolkata',
      });
      setIstTime(`${datePart} · ${timePart} IST`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Notifications dropdown
  const [showNotifications, setShowNotifications] = useState(false);
  const severeAlerts = mockWeatherEvents.filter((e) => e.severity === 'severe');

  const handleLanguageChange = (lang: 'en' | 'hi') => {
    i18n.changeLanguage(lang);
  };

  return (
    <header
      className="
        sticky top-0 z-20
        h-[64px]
        bg-white/90 backdrop-blur-xl border-b border-slate-200/80
        flex items-center justify-between px-4 sm:px-6 gap-3 sm:gap-4
        transition-all duration-200 shadow-xs
      "
    >
      {/* ── Left: Brand Logo + SkySignal & Location Weather (e.g., Gota, Ahmedabad, Gujarat 30°c ☀️) ── */}
      <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
        {/* Brand Logo & Name */}
        <Link
          to="/"
          className="flex items-center gap-2 sm:gap-2.5 hover:opacity-90 transition-opacity cursor-pointer shrink-0 py-0.5"
          title="SkySignal Home"
        >
          <img
            src="/logo.png"
            alt="SkySignal Logo"
            className="w-9 h-9 sm:w-11 sm:h-11 object-contain bg-transparent border-none shadow-none select-none"
          />
          <span className="text-[20px] sm:text-[23px] font-black tracking-tight select-none flex items-center leading-none">
            <span style={{ color: '#2d2a27' }}>Sky</span>
            <span style={{ color: '#d97706' }}>Signal</span>
          </span>
        </Link>

        {/* Location & Weather Widget on Top Left */}
        <div className="flex items-center gap-1">
          <button
            onClick={openLocationModal}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition-all cursor-pointer group text-left max-w-[240px] sm:max-w-md"
            title="Click to change your location or search areas"
          >
            <span className="text-[14px] sm:text-[15px] font-black text-slate-800 tracking-tight whitespace-nowrap truncate">
              {userLoc.cityName}
              {userLoc.stateName && !userLoc.cityName.toLowerCase().includes(userLoc.stateName.toLowerCase()) ? `, ${userLoc.stateName}` : ''}
            </span>
            <span className="flex items-center gap-1 shrink-0 font-extrabold text-slate-800 text-[13px] sm:text-[14px] bg-slate-100/90 px-2 py-0.5 rounded-lg border border-slate-200/70">
              <span>{userLoc.tempC}°c</span>
              <span className="text-[16px] leading-none">{userLoc.weatherIcon}</span>
            </span>
          </button>

          {/* Instant GPS Fetch Button */}
          <button
            onClick={() => detectGPSLocation()}
            disabled={isDetecting}
            className="p-1.5 rounded-lg text-sky-600 hover:text-sky-800 hover:bg-sky-50 transition-all cursor-pointer shrink-0 border border-sky-200/60 shadow-2xs"
            title={isHindi ? 'मेरा सटीक जीपीएस स्थान प्राप्त करें' : 'Fetch my exact GPS location'}
          >
            <Navigation size={15} className={isDetecting ? 'animate-spin text-amber-600' : ''} />
          </button>
        </div>
      </div>

      {/* ── Center / Right: Location Search Bar, Clock, i18n, Alerts & Auth ── */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Compact Location Search Bar (Citizen View Only) */}
        {!isAdmin && (
          <div className="block">
            <LocationSearchBar />
          </div>
        )}

        {/* Live IST Digital Clock */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-600 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span>{istTime || '27 Sep 2026 · 12:47:14 IST'}</span>
        </div>

        {/* Language Switch Dropdown (EN / हिन्दी) */}
        <div className="relative flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-[11px] font-bold shrink-0">
          <button
            onClick={() => handleLanguageChange('en')}
            className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
              !isHindi
                ? 'bg-white text-amber-700 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => handleLanguageChange('hi')}
            className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
              isHindi
                ? 'bg-white text-amber-700 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            हिन्दी
          </button>
        </div>

        {/* Notification Bell (Unread Severe Alerts — Admin Only) */}
        {isAdmin && (
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Severe weather alerts"
            >
              <Bell size={18} />
              {severeAlerts.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white font-black text-[9px] flex items-center justify-center border-2 border-white shadow-xs">
                  {severeAlerts.length}
                </span>
              )}
            </button>

            {/* Severe Alerts Popover */}
            {showNotifications && (
              <div
                className="
                  absolute right-0 mt-2 w-80 sm:w-96
                  bg-white/95 backdrop-blur-xl rounded-2xl
                  border border-slate-200/90 shadow-2xl p-4 space-y-3 z-50
                  animate-fade-in
                "
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-800">
                    <ShieldAlert size={15} className="text-red-600" />
                    <span>{isHindi ? `गंभीर मौसम चेतावनियाँ (${severeAlerts.length})` : `Severe Weather Alerts (${severeAlerts.length})`}</span>
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {severeAlerts.slice(0, 4).map((evt) => (
                    <div
                      key={evt.id}
                      className="p-2.5 rounded-xl bg-red-50/70 border border-red-100 text-[11px] space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-red-900 truncate">
                          {evt.title}
                        </span>
                        <span className="text-[10px] font-black text-red-700 uppercase">
                          {isHindi ? 'गंभीर' : 'Severe'}
                        </span>
                      </div>
                      <div className="text-slate-600">
                        📍 {evt.city}, {evt.state} · {evt.confidence}% {isHindi ? 'सटीकता' : 'conf.'}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center pt-1 border-t border-slate-100">
                  <Link
                    to="/"
                    onClick={() => setShowNotifications(false)}
                    className="text-[11px] font-bold text-amber-600 hover:text-amber-800"
                  >
                    {isHindi ? 'सभी मौसम खतरे देखें →' : 'View All Weather Hazards →'}
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Admin Profile & Logout / Analyst Login Trigger ── */}
        {isAdmin && user ? (
          <div className="flex items-center gap-2">
            <button
              onClick={openLoginModal}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/80 hover:bg-amber-100/80 transition-all cursor-pointer shadow-xs"
              title={isHindi ? 'विश्लेषक प्रोफ़ाइल और सेटिंग्स' : 'Analyst Profile & Settings'}
              aria-label="Analyst Profile Settings"
            >
              <div className="w-6 h-6 rounded-lg bg-amber-600 text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
                {user.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-[11px] font-bold text-slate-800 leading-tight">
                  {user.name.split(' ')[0]}
                </div>
                <div className="text-[9px] text-amber-700 font-semibold uppercase tracking-wider">
                  {isHindi ? 'सक्रिय विश्लेषक' : 'Analyst Active'}
                </div>
              </div>
            </button>

            {/* Quick Logout Button */}
            <button
              onClick={logout}
              className="px-2.5 py-1.5 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer flex items-center gap-1.5 text-[11px] font-bold"
              title={isHindi ? 'विश्लेषक सत्र समाप्त करें' : 'Logout Analyst Session'}
              aria-label="Logout Analyst Session"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">{isHindi ? 'लॉगआउट' : 'Logout'}</span>
            </button>
          </div>
        ) : (
          <button
            onClick={openLoginModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#2d2a27] hover:bg-[#3d3935] text-white text-[12px] font-bold transition-all shadow-sm cursor-pointer"
          >
            <ShieldCheck size={14} className="text-amber-400" />
            <span className="hidden sm:inline">{isHindi ? 'विश्लेषक लॉगिन' : 'Analyst Login'}</span>
            <span className="sm:hidden">{isHindi ? 'लॉगिन' : 'Login'}</span>
          </button>
        )}
      </div>
    </header>
  );
}
