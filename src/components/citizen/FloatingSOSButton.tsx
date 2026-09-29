/* ═══════════════════════════════════════════════════════
   SkySignal — Floating Emergency SOS Button & Quick Dispatch Modal
   Fixed bottom-right corner for Citizen View with direct one-touch
   emergency calling (112, 1078, 108), GPS coordinate broadcast, and helplines.
   ═══════════════════════════════════════════════════════ */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AlertOctagon,
  PhoneCall,
  X,
  ShieldAlert,
  Navigation,
  ExternalLink,
  Flame,
  HeartPulse,
  Radio,
  Share2,
  Check,
} from 'lucide-react';
import { useUserLocation } from '../../context/LocationContext';

export default function FloatingSOSButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { location } = useUserLocation();
  const { i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';
  const navigate = useNavigate();

  const handleFetchGps = () => {
    setIsLocating(true);
    setGpsStatus(isHindi ? 'जीपीएस लॉक किया जा रहा है...' : 'Acquiring satellite GPS fix...');

    if (!navigator.geolocation) {
      setGpsCoords({ lat: location.lat, lng: location.lng });
      setGpsStatus(`${location.cityName}, ${location.stateName} (${location.lat.toFixed(4)}°N, ${location.lng.toFixed(4)}°E)`);
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(4));
        const lng = Number(pos.coords.longitude.toFixed(4));
        setGpsCoords({ lat, lng });
        setGpsStatus(`GPS: ${lat}°N, ${lng}°E (Accuracy ±${Math.round(pos.coords.accuracy)}m)`);
        setIsLocating(false);
      },
      (_err) => {
        setGpsCoords({ lat: location.lat, lng: location.lng });
        setGpsStatus(`${location.cityName}, ${location.stateName} (${location.lat.toFixed(4)}°N, ${location.lng.toFixed(4)}°E)`);
        setIsLocating(false);
      },
      { timeout: 6000, enableHighAccuracy: true }
    );
  };

  const handleShareLocation = () => {
    const lat = gpsCoords?.lat || location.lat;
    const lng = gpsCoords?.lng || location.lng;
    const message = `EMERGENCY SOS via SkySignal! My location: ${location.cityName}, ${location.stateName} (https://maps.google.com/?q=${lat},${lng}). Immediate assistance needed.`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <>
      {/* ── Floating SOS Button (Bottom Right) ── */}
      <aside
        aria-label="Emergency SOS Quick Action"
        className="fixed bottom-6 right-6 z-50 flex items-center group pointer-events-auto"
      >
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            if (!gpsCoords) handleFetchGps();
          }}
          className="
            relative flex items-center gap-2.5 px-4 py-3
            bg-gradient-to-r from-red-600 via-rose-600 to-red-700
            hover:from-red-500 hover:via-rose-500 hover:to-red-600
            text-white rounded-full font-black text-[13px] tracking-wide
            shadow-[0_8px_30px_rgb(225,29,72,0.4)]
            hover:shadow-[0_12px_36px_rgb(225,29,72,0.6)]
            hover:scale-105 active:scale-95
            transition-all duration-200 cursor-pointer border-2 border-white/30
          "
          title="Emergency SOS / त्वरित आपातकालीन सहायता"
        >
          <AlertOctagon size={18} />
          <span className="font-extrabold tracking-wider">SOS</span>
          <span className="hidden sm:inline text-[11px] font-bold opacity-90 border-l border-white/30 pl-2">
            {isHindi ? 'आपातकाल' : 'Emergency'}
          </span>
        </button>
      </aside>

      {/* ── Emergency SOS Quick Dispatch Modal ── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-red-200 overflow-hidden text-slate-900">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center border border-white/30">
                  <ShieldAlert size={22} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[17px] font-black tracking-tight">
                      {isHindi ? 'आपातकालीन संकट हेल्पलाइन (SOS)' : 'Emergency Crisis Response (SOS)'}
                    </h2>
                  </div>
                  <p className="text-[11px] text-red-100 font-medium">
                    {isHindi ? '24/7 टोल-फ्री प्रत्यक्ष सहायता नंबर' : '24/7 direct toll-free emergency dispatch lines'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Location Badge & Emergency GPS Broadcast */}
              <div className="p-3.5 bg-red-50/70 border border-red-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-1.5 font-bold text-red-900">
                    <Navigation size={14} className={`text-red-600 ${isLocating ? 'animate-spin' : ''}`} />
                    <span>{isHindi ? 'आपका वर्तमान स्थान:' : 'Your Location Fix:'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleFetchGps}
                    disabled={isLocating}
                    className="text-[11px] text-red-700 hover:text-red-900 font-bold underline cursor-pointer"
                  >
                    {isLocating ? (isHindi ? 'प्राप्त हो रहा है...' : 'Refreshing...') : (isHindi ? 'पुनः खोजें' : 'Refresh GPS')}
                  </button>
                </div>

                <div className="text-[12px] font-mono text-slate-800 bg-white/90 px-3 py-1.5 rounded-xl border border-red-200/60 font-semibold flex items-center justify-between">
                  <span className="truncate">
                    {gpsStatus || `${location.cityName}, ${location.stateName} (${location.lat.toFixed(4)}°N, ${location.lng.toFixed(4)}°E)`}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleShareLocation}
                    className="flex-1 py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copied ? <Check size={13} /> : <Share2 size={13} />}
                    <span>{copied ? (isHindi ? 'स्थान कॉपी हो गया!' : 'Copied to Clipboard!') : (isHindi ? 'आपातकालीन संदेश कॉपी करें' : 'Copy SOS Location Message')}</span>
                  </button>
                </div>
              </div>

              {/* Direct One-Touch Dialing Grid */}
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                  {isHindi ? 'तत्काल डायल करें (टोल-फ्री)' : 'One-Touch Instant Dial (Toll-Free)'}
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* 112 National Emergency */}
                  <a
                    href="tel:112"
                    className="flex items-center justify-between p-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl transition-all shadow-md group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-red-600/30 text-red-400 flex items-center justify-center border border-red-500/30">
                        <PhoneCall size={18} />
                      </div>
                      <div>
                        <div className="text-[14px] font-extrabold flex items-center gap-1.5">
                          <span>112</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 bg-red-500/30 text-red-300 rounded">
                            {isHindi ? 'सभी आपातकाल' : 'All Emergencies'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {isHindi ? 'पुलिस, अग्निशमन एवं एम्बुलेंस' : 'Police, Fire & Ambulance'}
                        </p>
                      </div>
                    </div>
                    <div className="text-[11px] font-bold text-red-400 group-hover:translate-x-0.5 transition-transform">
                      {isHindi ? 'कॉल करें ➔' : 'Call ➔'}
                    </div>
                  </a>

                  {/* 1078 NDRF / Disaster Helpline */}
                  <a
                    href="tel:1078"
                    className="flex items-center justify-between p-3.5 bg-amber-950/20 hover:bg-amber-950/30 border border-amber-500/30 rounded-2xl transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center border border-amber-400/40">
                        <Radio size={18} />
                      </div>
                      <div>
                        <div className="text-[14px] font-extrabold text-slate-900 flex items-center gap-1.5">
                          <span>1078</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded">
                            {isHindi ? 'आपदा एनडीआरएफ' : 'Disaster NDRF'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {isHindi ? 'राष्ट्रीय आपदा बचाव नियंत्रण' : 'National Disaster Rescue'}
                        </p>
                      </div>
                    </div>
                    <div className="text-[11px] font-bold text-amber-700 group-hover:translate-x-0.5 transition-transform">
                      {isHindi ? 'कॉल करें ➔' : 'Call ➔'}
                    </div>
                  </a>

                  {/* 108 Medical / Ambulance */}
                  <a
                    href="tel:108"
                    className="flex items-center justify-between p-3.5 bg-emerald-950/10 hover:bg-emerald-950/20 border border-emerald-500/30 rounded-2xl transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-700 flex items-center justify-center border border-emerald-400/40">
                        <HeartPulse size={18} />
                      </div>
                      <div>
                        <div className="text-[14px] font-extrabold text-slate-900 flex items-center gap-1.5">
                          <span>108</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
                            {isHindi ? 'एम्बुलेंस सेवा' : 'Ambulance'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {isHindi ? 'आपातकालीन चिकित्सा सहायता' : 'Emergency Medical Service'}
                        </p>
                      </div>
                    </div>
                    <div className="text-[11px] font-bold text-emerald-700 group-hover:translate-x-0.5 transition-transform">
                      {isHindi ? 'कॉल करें ➔' : 'Call ➔'}
                    </div>
                  </a>

                  {/* 101 Fire & Rescue */}
                  <a
                    href="tel:101"
                    className="flex items-center justify-between p-3.5 bg-orange-950/10 hover:bg-orange-950/20 border border-orange-500/30 rounded-2xl transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-700 flex items-center justify-center border border-orange-400/40">
                        <Flame size={18} />
                      </div>
                      <div>
                        <div className="text-[14px] font-extrabold text-slate-900 flex items-center gap-1.5">
                          <span>101</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.2 bg-orange-100 text-orange-800 rounded">
                            {isHindi ? 'अग्निशमन दल' : 'Fire Brigade'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {isHindi ? 'अग्निशमन एवं जल निकासी बचाव' : 'Fire & Flood Extrication'}
                        </p>
                      </div>
                    </div>
                    <div className="text-[11px] font-bold text-orange-700 group-hover:translate-x-0.5 transition-transform">
                      {isHindi ? 'कॉल करें ➔' : 'Call ➔'}
                    </div>
                  </a>
                </div>
              </div>

              {/* Quick Links to Directory & Relief Network */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/emergency');
                  }}
                  className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ExternalLink size={13} />
                  <span>{isHindi ? 'सभी आपातकालीन निर्देशिका' : 'Full Helpline Directory'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/relief-network');
                  }}
                  className="flex-1 py-2.5 px-3 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ShieldAlert size={13} />
                  <span>{isHindi ? 'राहत और संकट सहायता' : 'Crisis Relief Network'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
