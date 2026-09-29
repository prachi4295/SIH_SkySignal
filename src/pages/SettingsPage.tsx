/* ═══════════════════════════════════════════════════════
   SkySignal — User & Platform Settings Page
   Alert Siren, Notification channels, Units, Telemetry sync & Accessibility
   ═══════════════════════════════════════════════════════ */

import { useState } from 'react';
import {
  Settings,
  Bell,
  Volume2,
  Save,
  CheckCircle2,
  RotateCcw,
  Zap,
  Gauge,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function SettingsPage() {
  const { i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';

  const [savedToast, setSavedToast] = useState(false);

  // Settings states
  const [severeAlertSiren, setSevereAlertSiren] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [alertDistanceThreshold, setAlertDistanceThreshold] = useState('25');
  
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [windUnit, setWindUnit] = useState<'kmh' | 'knots' | 'ms'>('kmh');
  const [offlineCaching, setOfflineCaching] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  const handleSave = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const handleReset = () => {
    setSevereAlertSiren(true);
    setPushNotifications(true);
    setWhatsappAlerts(true);
    setAlertDistanceThreshold('25');
    setTempUnit('C');
    setWindUnit('kmh');
    setOfflineCaching(true);
    setReducedMotion(false);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto animate-fade-in">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings className="text-amber-600" size={24} />
            <h1 className="text-[22px] sm:text-[26px] font-black text-slate-900 tracking-tight">
              {isHindi ? 'प्लेटफ़ॉर्म और मौसम चेतावनी सेटिंग्स' : 'Platform & Severe Weather Alert Settings'}
            </h1>
          </div>
          <p className="text-[13px] text-slate-500">
            {isHindi
              ? 'गंभीर मौसम अलार्म, रडार रिफ्रेश दर, इकाइयाँ और ऑफ़लाइन सिंक प्राथमिकताएँ प्रबंधित करें।'
              : 'Customize proximity sirens, multi-channel dispatch, measurement units, and offline caching telemetry.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[12.5px] font-bold transition-all cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>{isHindi ? 'डिफ़ॉल्ट रीसेट करें' : 'Reset Defaults'}</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[12.5px] font-black shadow-md shadow-amber-600/20 transition-all cursor-pointer"
          >
            <Save size={14} />
            <span>{isHindi ? 'प्राथमिकताएं सहेजें' : 'Save Preferences'}</span>
          </button>
        </div>
      </div>

      {savedToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[13px] font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={18} className="text-emerald-600" />
          <span>{isHindi ? 'प्राथमिकताएं सफलतापूर्वक डिवाइस कैश में सहेजी गईं!' : 'Preferences saved successfully to local device cache!'}</span>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          SECTION 1: CRITICAL WEATHER ALERT DISPATCH
         ════════════════════════════════════════════════════════════ */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <Bell className="text-rose-600" size={20} />
          <div>
            <h2 className="text-[16px] font-black text-slate-900">
              {isHindi ? 'गंभीर मौसम चेतावनी और प्रेषण चैनल' : 'Severe Weather Alerts & Dispatch Channels'}
            </h2>
            <p className="text-[11.5px] text-slate-500">
              {isHindi ? 'चक्रवात, अचानक बाढ़ और भीषण लू के लिए निकटता आधारित सूचनाएं' : 'Proximity-based notifications for cyclones, flash floods, and severe heatwaves'}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Audio Siren Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                <Volume2 size={18} />
              </div>
              <div>
                <span className="text-[13px] font-black text-slate-900 block">
                  {isHindi ? 'डॉपलर रडार सायरन ध्वनि' : 'Critical Doppler Siren Sound'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {isHindi ? 'स्थान के दायरे में गंभीर रेड अलर्ट आने पर ऑडियो अलार्म बजाएं' : 'Play distinctive audible alarm on imminent severe red alerts within radius'}
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={severeAlertSiren}
                onChange={(e) => setSevereAlertSiren(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>

          {/* WhatsApp & Push */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200">
              <div>
                <span className="text-[13px] font-bold text-slate-900 block">
                  {isHindi ? 'ब्राउज़र पुश सूचनाएँ' : 'Browser Push Notifications'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {isHindi ? 'तत्काल डेस्कटॉप और मोबाइल बैनर' : 'Instant desktop & mobile banners'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={pushNotifications}
                onChange={(e) => setPushNotifications(e.target.checked)}
                className="w-5 h-5 text-amber-600 rounded cursor-pointer accent-amber-600"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200">
              <div>
                <span className="text-[13px] font-bold text-slate-900 block">
                  {isHindi ? 'व्हाट्सएप आपातकालीन अलर्ट' : 'WhatsApp Emergency Flash'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {isHindi ? 'स्वचालित आपदा एवं निकासी बुलेटिन' : 'Automated evacuation bulletins'}
                </span>
              </div>
              <input
                type="checkbox"
                checked={whatsappAlerts}
                onChange={(e) => setWhatsappAlerts(e.target.checked)}
                className="w-5 h-5 text-amber-600 rounded cursor-pointer accent-amber-600"
              />
            </div>
          </div>

          {/* Proximity Radius Selector */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[13px] font-bold text-slate-900 block">
                {isHindi ? 'निकटता चेतावनी दायरा (Geofence)' : 'Proximity Alert Geofence'}
              </span>
              <span className="text-[11px] text-slate-500">
                {isHindi ? 'जब आपके स्थान से इस दूरी के भीतर चरम तूफान हो तो सूचित करें' : 'Notify when extreme storms occur within this radial distance of your location'}
              </span>
            </div>
            <select
              value={alertDistanceThreshold}
              onChange={(e) => setAlertDistanceThreshold(e.target.value)}
              className="p-2 rounded-xl bg-white border border-slate-300 text-[12.5px] font-bold text-slate-800"
            >
              <option value="10">{isHindi ? '10 किमी (अति-स्थानीय)' : '10 km (Hyperlocal)'}</option>
              <option value="25">{isHindi ? '25 किमी (अनुशंसित)' : '25 km (Recommended)'}</option>
              <option value="50">{isHindi ? '50 किमी (जिला स्तर)' : '50 km (District Level)'}</option>
              <option value="100">{isHindi ? '100 किमी (क्षेत्रीय)' : '100 km (Regional)'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          SECTION 2: UNITS & MEASUREMENT STANDARDS
         ════════════════════════════════════════════════════════════ */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <Gauge className="text-amber-600" size={20} />
          <div>
            <h2 className="text-[16px] font-black text-slate-900">
              {isHindi ? 'मौसम माप की इकाइयाँ' : 'Units of Meteorological Measurement'}
            </h2>
            <p className="text-[11.5px] text-slate-500">
              {isHindi ? 'राष्ट्रीय और वैश्विक मौसम विज्ञान प्रदर्शन मानक' : 'Global and national meteorological display standards'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-slate-700 uppercase">
              {isHindi ? 'तापमान पैमाना' : 'Temperature Scale'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTempUnit('C')}
                className={`py-2 rounded-xl text-[12.5px] font-black border transition-all cursor-pointer ${
                  tempUnit === 'C' ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                {isHindi ? 'सेल्सियस (°C) [आईएमडी मानक]' : 'Celsius (°C) [IMD Standard]'}
              </button>
              <button
                type="button"
                onClick={() => setTempUnit('F')}
                className={`py-2 rounded-xl text-[12.5px] font-black border transition-all cursor-pointer ${
                  tempUnit === 'F' ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                {isHindi ? 'फ़ारेनहाइट (°F)' : 'Fahrenheit (°F)'}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] font-bold text-slate-700 uppercase">
              {isHindi ? 'हवा की गति इकाई' : 'Wind Velocity Units'}
            </label>
            <select
              value={windUnit}
              onChange={(e) => setWindUnit(e.target.value as any)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-[12.5px] font-bold bg-white"
            >
              <option value="kmh">{isHindi ? 'किलोमीटर प्रति घंटा (km/h)' : 'Kilometers per hour (km/h)'}</option>
              <option value="knots">{isHindi ? 'नॉट्स (kt) [समुद्री/विमानन]' : 'Knots (kt) [Maritime / Aviation]'}</option>
              <option value="ms">{isHindi ? 'मीटर प्रति सेकंड (m/s)' : 'Meters per second (m/s)'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          SECTION 3: OFFLINE-FIRST & ACCESSIBILITY
         ════════════════════════════════════════════════════════════ */}
      <div className="glass-card p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <Zap className="text-emerald-600" size={20} />
          <div>
            <h2 className="text-[16px] font-black text-slate-900">
              {isHindi ? 'ऑफ़लाइन उपलब्धता और सुगमता' : 'Offline Resilience & Accessibility'}
            </h2>
            <p className="text-[11.5px] text-slate-500">
              {isHindi ? 'IndexedDB स्थानीय कैशिंग और दृश्य सुगमता मानक' : 'IndexedDB local caching and visual accessibility standards'}
            </p>
          </div>
        </div>

        <div className="space-y-3.5">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200">
            <div>
              <span className="text-[13px] font-bold text-slate-900 block">
                {isHindi ? 'ऑफ़लाइन मानचित्र और रिपोर्ट कतार कैशिंग' : 'Offline Map Tile & Report Queue Caching'}
              </span>
              <span className="text-[11px] text-slate-500">
                {isHindi ? 'नेटवर्क आउटेज के दौरान रिपोर्ट दर्ज करने और कैश किए गए रडार मानचित्र देखने की अनुमति दें' : 'Allow submitting reports and viewing cached radar maps during network outages'}
              </span>
            </div>
            <input
              type="checkbox"
              checked={offlineCaching}
              onChange={(e) => setOfflineCaching(e.target.checked)}
              className="w-5 h-5 text-amber-600 rounded cursor-pointer accent-amber-600"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200">
            <div>
              <span className="text-[13px] font-bold text-slate-900 block">
                {isHindi ? 'कम गति (Reduced Motion) मोड' : 'Reduced Motion Mode'}
              </span>
              <span className="text-[11px] text-slate-500">
                {isHindi ? 'कम क्षमता वाले उपकरणों के लिए पल्सिंग डॉपलर और रडार एनिमेशन अक्षम करें' : 'Disable pulsing Doppler rings and radar sweep animations for low-power devices'}
              </span>
            </div>
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(e) => setReducedMotion(e.target.checked)}
              className="w-5 h-5 text-amber-600 rounded cursor-pointer accent-amber-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
