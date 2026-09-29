/* ═══════════════════════════════════════════════════════
   SkySignal — Data Sources & Ingestion Connectors
   Multi-stream status, latency telemetry, connector control &
   Live Interactive ML Pipeline & Cheap Pre-Filter Simulator
   ═══════════════════════════════════════════════════════ */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Radio,
  Smartphone,
  MessageCircle,
  FileText,
  Video,
  CheckCircle2,
  RefreshCw,
  Power,
  Zap,
  AlertTriangle,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  Database,
  Filter,
} from 'lucide-react';
import { translateCategory, translateSeverity } from '../lib/hindiTranslations';

interface Connector {
  id: string;
  name: string;
  nameHi?: string;
  type: string;
  typeHi?: string;
  status: 'online' | 'degraded' | 'syncing';
  latencyMs: number;
  uptimePercent: number;
  throughput: string;
  quotaUsed: number;
  lastSync: string;
  icon: any;
  color: string;
  enabled: boolean;
}

const INITIAL_CONNECTORS: Connector[] = [
  {
    id: 'conn-imd-sensors',
    name: 'IMD Doppler Radar & AWS Network',
    nameHi: 'आईएमडी डॉप्लर रडार और एडब्ल्यूएस नेटवर्क',
    type: 'Binary Telemetry Stream (Doppler Radar)',
    typeHi: 'बाइनरी टेलीमेट्री स्ट्रीम (डॉप्लर रडार)',
    status: 'online',
    latencyMs: 58,
    uptimePercent: 99.98,
    throughput: '3,200 telemetry pkts/min',
    quotaUsed: 42,
    lastSync: '3s ago',
    icon: Radio,
    color: '#10b981',
    enabled: true,
  },
  {
    id: 'conn-citizen-app',
    name: 'Citizen Mobile PWA Ingestion',
    nameHi: 'नागरिक मोबाइल पीडब्ल्यूए अंतर्ग्रहण',
    type: 'WebSocket / REST Direct Payload',
    typeHi: 'वेबसॉकेट / रेस्ट डायरेक्ट पेलोड',
    status: 'online',
    latencyMs: 142,
    uptimePercent: 99.95,
    throughput: '180 observations/min',
    quotaUsed: 28,
    lastSync: '12s ago',
    icon: Smartphone,
    color: '#0284c7',
    enabled: true,
  },
  {
    id: 'conn-twitter-firehose',
    name: 'Twitter / X Meteorological Firehose',
    nameHi: 'ट्विटर / एक्स मौसम संबंधी फायरहोज़',
    type: 'Filtered Streaming API v2 (Hindi/English)',
    typeHi: 'फ़िल्टर की गई स्ट्रीमिंग एपीआई v2 (हिंदी/अंग्रेजी)',
    status: 'online',
    latencyMs: 412,
    uptimePercent: 99.4,
    throughput: '640 tweets/min',
    quotaUsed: 78,
    lastSync: '5s ago',
    icon: MessageCircle,
    color: '#8b5cf6',
    enabled: true,
  },
  {
    id: 'conn-news-rss',
    name: 'National News & Disaster RSS Aggregator',
    nameHi: 'राष्ट्रीय समाचार और आपदा आरएसएस एग्रीगेटर',
    type: 'Automated Crawl & NLP Entity Extraction',
    typeHi: 'स्वचालित क्रॉल और एनएलपी इकाई निष्कर्षण',
    status: 'online',
    latencyMs: 1200,
    uptimePercent: 99.8,
    throughput: '45 bulletins/hr',
    quotaUsed: 35,
    lastSync: '1m ago',
    icon: FileText,
    color: '#0891b2',
    enabled: true,
  },
  {
    id: 'conn-youtube-livestream',
    name: 'YouTube Emergency Live Feed Scraper',
    nameHi: 'यूट्यूब आपातकालीन लाइव फीड स्क्रैपर',
    type: 'Automated Speech-to-Text & Vision Stream',
    typeHi: 'स्वचालित स्पीच-टू-टेक्स्ट और विज़न स्ट्रीम',
    status: 'degraded',
    latencyMs: 3100,
    uptimePercent: 98.2,
    throughput: '12 video channels monitored',
    quotaUsed: 89,
    lastSync: '4m ago',
    icon: Video,
    color: '#ef4444',
    enabled: true,
  },
];

interface DemoPreset {
  title: string;
  titleHi?: string;
  badge: string;
  badgeHi?: string;
  badgeColor: string;
  text: string;
  lat: number;
  lon: number;
  temp: number | '';
  rain: number | '';
}

const DEMO_PRESETS: DemoPreset[] = [
  {
    title: '🌧️ Cloudburst (Delhi)',
    titleHi: '🌧️ बादल फटना (दिल्ली)',
    badge: 'Valid Data',
    badgeHi: 'वैध डेटा',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    text: 'Severe cloudburst reported in North Delhi! Water level rising rapidly on roads, cars partially submerged.',
    lat: 28.7041,
    lon: 77.1025,
    temp: 24.5,
    rain: 85.0,
  },
  {
    title: '🌊 Mumbai Flood (Hindi)',
    titleHi: '🌊 मुंबई बाढ़ (हिंदी)',
    badge: 'Valid Hindi',
    badgeHi: 'वैध हिंदी',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    text: 'मुंबई के दादर और कुर्ला में भीषण जलभराव हो गया है। लोकल ट्रेन सेवा प्रभावित है।',
    lat: 19.0178,
    lon: 72.8478,
    temp: 28.0,
    rain: 45.0,
  },
  {
    title: '🚫 Crypto Bot (Spam)',
    titleHi: '🚫 क्रिप्टो बॉट (स्पैम)',
    badge: 'Spam Discard',
    badgeHi: 'स्पैम निरस्त',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    text: '⚡ EARN 500$ DAILY WITH BITCOIN TRADING! Join telegram https://t.me/cryptopumps2026 free airdrop',
    lat: 28.6139,
    lon: 77.2090,
    temp: '',
    rain: '',
  },
  {
    title: '🚫 Gossip Talk (Noise)',
    titleHi: '🚫 गपशप (शोर)',
    badge: 'Relevance Discard',
    badgeHi: 'अप्रासंगिक निरस्त',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    text: 'Anyone going to watch the cricket match live at Eden Gardens tonight?',
    lat: 22.5646,
    lon: 88.3433,
    temp: '',
    rain: '',
  },
  {
    title: '🚫 92.4°C Sensor Spike',
    titleHi: '🚫 92.4°C सेंसर स्पाइक',
    badge: 'Outlier Discard',
    badgeHi: 'असामान्य मान निरस्त',
    badgeColor: 'bg-red-100 text-red-800 border-red-200',
    text: 'High temperature alarm triggered at industrial substation.',
    lat: 26.9124,
    lon: 75.7873,
    temp: 92.4,
    rain: '',
  },
  {
    title: '🚫 Australia GPS (Out of Bounds)',
    titleHi: '🚫 ऑस्ट्रेलिया जीपीएस (सीमा से बाहर)',
    badge: 'Spatial Discard',
    badgeHi: 'क्षेत्र से बाहर निरस्त',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    text: 'Strong cyclonic wind gusts uprooting roadside trees near beach.',
    lat: -35.2809,
    lon: 149.1300,
    temp: 20.0,
    rain: '',
  },
];

export default function DataSourcesPage() {
  const { i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';

  const [connectors, setConnectors] = useState<Connector[]>(INITIAL_CONNECTORS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Simulator State
  const [simText, setSimText] = useState(DEMO_PRESETS[0].text);
  const [simLat, setSimLat] = useState<number | ''>(DEMO_PRESETS[0].lat);
  const [simLon, setSimLon] = useState<number | ''>(DEMO_PRESETS[0].lon);
  const [simTemp, setSimTemp] = useState<number | ''>(DEMO_PRESETS[0].temp);
  const [simRain, setSimRain] = useState<number | ''>(DEMO_PRESETS[0].rain);

  const [simResult, setSimResult] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const toggleConnector = (id: string) => {
    setConnectors((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c))
    );
    const target = connectors.find((c) => c.id === id);
    setToastMessage(
      `Connector "${target?.name}" ${target?.enabled ? 'paused' : 'activated'}.`
    );
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRefreshAll = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setToastMessage('All data ingestion pipelines synchronized with zero loss.');
      setTimeout(() => setToastMessage(null), 3500);
    }, 1200);
  };

  const handleApplyPreset = (preset: DemoPreset) => {
    setSimText(preset.text);
    setSimLat(preset.lat);
    setSimLon(preset.lon);
    setSimTemp(preset.temp);
    setSimRain(preset.rain);
    setSimResult(null);
  };

  const runSimulation = () => {
    setIsSimulating(true);

    setTimeout(() => {
      // Tier 0 Cheap Filters
      let passed = true;
      let gateFailed = '';
      let rejectionReason = '';

      // 1. Structural
      if (simText.trim().length < 5) {
        passed = false;
        gateFailed = 'STRUCTURAL_GATE';
        rejectionReason = 'Content too short (< 5 characters)';
      }
      // 2. Spatial
      else if (
        typeof simLat === 'number' &&
        typeof simLon === 'number' &&
        (simLat < 6.0 || simLat > 38.0 || simLon < 68.0 || simLon > 98.0)
      ) {
        passed = false;
        gateFailed = 'SPATIAL_GATE';
        rejectionReason = `Location (${simLat}, ${simLon}) outside national jurisdiction domain (India bounding box)`;
      }
      // 3. Spam Check
      else if (
        /crypto|bitcoin|forex|telegram|t\.me|airdrop|casino|lottery/i.test(simText)
      ) {
        passed = false;
        gateFailed = 'SPAM_GATE';
        rejectionReason = 'Spam/Promotional signature matched';
      }
      // 4. Weather Relevance
      else if (
        !/(rain|flood|waterlog|thunder|storm|heat|loo|fog|smog|wind|cyclone|cloudburst|celsius|बारिश|बाढ़|जलभराव|लू|तूफान|कोहरा|आंधी)/i.test(
          simText
        )
      ) {
        passed = false;
        gateFailed = 'RELEVANCE_GATE';
        rejectionReason = 'No meteorological keywords or weather indicators found in text';
      }
      // 5. Sensor Outlier
      else if (typeof simTemp === 'number' && (simTemp < -35 || simTemp > 58)) {
        passed = false;
        gateFailed = 'SENSOR_ANOMALY_GATE';
        rejectionReason = `Sensor 'temperature_c' reading ${simTemp}°C violates physical meteorological limits [-35°C, 58°C]`;
      }

      // If passed Tier 0 -> Tier 1 ML Classification
      let mlOutput = null;
      if (passed) {
        let cat = 'rainfall';
        let conf = 0.89;
        let sev = 'severe';

        if (/flood|जलभराव|waterlog|submerged/i.test(simText)) {
          cat = 'flooding';
          conf = 0.93;
          sev = 'severe';
        } else if (/fog|smog|धुंध|कोहरा|visibility/i.test(simText)) {
          cat = 'fog';
          conf = 0.95;
          sev = 'moderate';
        } else if (/heat|लू|temperature|गर्मी/i.test(simText)) {
          cat = 'heatwave';
          conf = 0.91;
          sev = 'severe';
        } else if (/wind|gust|cyclone|चक्रवात/i.test(simText)) {
          cat = 'strong_wind';
          conf = 0.94;
          sev = 'severe';
        } else if (/thunder|lightning|तूफान|बिजली/i.test(simText)) {
          cat = 'thunderstorm';
          conf = 0.92;
          sev = 'moderate';
        }

        mlOutput = {
          category: cat,
          confidence: conf,
          severity: sev,
          misleadingRisk: 0.004,
          routing: 'Spatial Event Fusion Engine (Active Live Leaflet Radar)',
        };
      }

      setSimResult({
        tier0: {
          passed,
          gateFailed,
          rejectionReason,
          latencyUs: passed ? 340.5 : 42.1,
          costSaved: !passed,
        },
        tier1: mlOutput,
      });

      setIsSimulating(false);
    }, 400);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Radio size={22} className="text-sky-600" />
            <h1 className="text-[22px] font-extrabold text-slate-900 tracking-tight">
              {isHindi ? 'डेटा अंतर्ग्रहण कनेक्टर्स और टेलीमेट्री पाइपलाइन' : 'Ingestion Connectors & Telemetry Pipeline'}
            </h1>
          </div>
          <p className="text-[13px] text-slate-500">
            {isHindi
              ? 'रीयल-टाइम पाइपलाइन निगरानी, मल्टी-स्ट्रीम अंतर्ग्रहण स्थिति, और टियर 0/टियर 1 एमएल प्रोसेसिंग।'
              : 'Real-time pipeline monitoring, multi-stream ingestion status, and Tier 0/Tier 1 ML processing.'}
          </p>
        </div>

        <button
          onClick={handleRefreshAll}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-[12px] font-bold shadow-xs transition-colors cursor-pointer"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          <span>{isHindi ? 'फ़ीड सिंक्रनाइज़ करें' : 'Synchronize Feeds'}</span>
        </button>
      </div>

      {/* ── Toast Alert ── */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[13px] font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── INTERACTIVE ML PIPELINE & CHEAP PRE-FILTER SIMULATOR ── */}
      <div className="glass-card rounded-2xl border border-sky-200/80 bg-gradient-to-b from-sky-50/40 via-white to-white p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-sky-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-sky-600 text-white shadow-xs">
                <Sparkles size={13} /> {isHindi ? 'लाइव पाइपलाइन सिम्युलेटर' : 'Live Pipeline Simulator'}
              </span>
              <span className="text-[12px] font-semibold text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded-md">
                {isHindi ? 'टियर 0 ह्यूरिस्टिक फ़िल्टर + टियर 1 कैलिब्रेटेड एमएल' : 'Tier 0 Heuristic Filter + Tier 1 Calibrated ML'}
              </span>
            </div>
            <h2 className="text-[18px] font-extrabold text-slate-900">
              {isHindi ? 'इंटरैक्टिव इनजेशन और एआई फ़िल्टर प्लेग्राउंड' : 'Interactive Ingestion & AI Filter Playground'}
            </h2>
            <p className="text-[12px] text-slate-500 max-w-2xl">
              {isHindi
                ? 'परीक्षण करें कि कैसे कच्चा डेटा मशीन लर्निंग मॉडल तक पहुंचने से पहले सब-मिलीसेकंड सैनिटी गेट से गुजरता है।'
                : 'Test how raw telemetry passes through cheap sub-millisecond sanity gates before hitting Machine Learning models.'}
            </p>
          </div>
        </div>

        {/* Presets Bar */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Layers size={13} /> {isHindi ? 'त्वरित परीक्षण प्रीसेट:' : 'Quick Test Presets:'}
          </span>
          <div className="flex flex-wrap gap-2">
            {DEMO_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleApplyPreset(preset)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[12px] font-semibold text-slate-700 shadow-2xs hover:border-sky-300 transition-all cursor-pointer"
              >
                <span>{isHindi && preset.titleHi ? preset.titleHi : preset.title}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${preset.badgeColor}`}>
                  {isHindi && preset.badgeHi ? preset.badgeHi : preset.badge}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 rounded-xl bg-slate-50/80 border border-slate-200/80">
          <div className="lg:col-span-6 space-y-1.5">
            <label className="text-[11px] font-bold uppercase text-slate-600">
              {isHindi ? 'कच्चा टेक्स्ट / नागरिक अवलोकन / सोशल पोस्ट' : 'Raw Text / Citizen Observation / Social Post'}
            </label>
            <textarea
              rows={3}
              value={simText}
              onChange={(e) => setSimText(e.target.value)}
              className="w-full text-[13px] p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-sky-500 font-sans"
              placeholder={isHindi ? 'हिंदी या अंग्रेजी में मौसम अवलोकन दर्ज करें...' : 'Enter weather observation in English or Hindi...'}
            />
          </div>

          <div className="lg:col-span-3 space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-slate-600">
                {isHindi ? 'अक्षांश (°N)' : 'Latitude (°N)'}
              </label>
              <input
                type="number"
                step="0.0001"
                value={simLat}
                onChange={(e) => setSimLat(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className="w-full text-[13px] px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                placeholder="28.7041"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-slate-600">
                {isHindi ? 'देशांतर (°E)' : 'Longitude (°E)'}
              </label>
              <input
                type="number"
                step="0.0001"
                value={simLon}
                onChange={(e) => setSimLon(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className="w-full text-[13px] px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                placeholder="77.1025"
              />
            </div>
          </div>

          <div className="lg:col-span-3 space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-slate-600">
                {isHindi ? 'तापमान (°C)' : 'Temperature (°C)'}
              </label>
              <input
                type="number"
                step="0.1"
                value={simTemp}
                onChange={(e) => setSimTemp(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className="w-full text-[13px] px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                placeholder="24.5"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-slate-600">
                {isHindi ? 'वर्षा दर (मिमी/घंटा)' : 'Rainfall Rate (mm/h)'}
              </label>
              <input
                type="number"
                step="1"
                value={simRain}
                onChange={(e) => setSimRain(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className="w-full text-[13px] px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                placeholder="85"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            onClick={runSimulation}
            disabled={isSimulating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-[13px] font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Zap size={16} className={isSimulating ? 'animate-bounce' : ''} />
            <span>{isSimulating ? (isHindi ? 'पाइपलाइन मूल्यांकन जारी...' : 'Processing Pipeline...') : (isHindi ? '2-स्तरीय पाइपलाइन मूल्यांकन चलाएं' : 'Run 2-Tier Pipeline Evaluation')}</span>
          </button>
        </div>

        {/* Results Panel */}
        {simResult && (
          <div className="space-y-4 pt-4 border-t border-slate-200 animate-fade-in">
            <h3 className="text-[14px] font-extrabold text-slate-900 flex items-center gap-2">
              <Cpu size={16} className="text-sky-600" />
              {isHindi ? 'पाइपलाइन निष्पादन ट्रेस और निर्णय मैट्रिक्स:' : 'Pipeline Execution Trace & Decision Matrix:'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tier 0 Box */}
              <div
                className={`p-4 rounded-xl border ${
                  simResult.tier0.passed
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50/70 border-rose-200 text-rose-950'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Filter size={14} /> {isHindi ? 'टियर 0: पूर्व-फ़िल्टर (ह्यूरिस्टिक)' : 'Tier 0: Cheap Pre-Filter'}
                  </span>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/80 border border-current">
                    {isHindi ? 'विलंबता' : 'Latency'}: {simResult.tier0.latencyUs.toFixed(1)} µs
                  </span>
                </div>

                <div className="flex items-center gap-2 my-2">
                  {simResult.tier0.passed ? (
                    <>
                      <CheckCircle2 size={20} className="text-emerald-600" />
                      <span className="font-extrabold text-[14px] text-emerald-800">
                        {isHindi ? 'सभी गेट पास किए → एमएल मॉडल को भेजा गया' : 'PASSED ALL GATES → Forward to ML'}
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={20} className="text-rose-600" />
                      <span className="font-extrabold text-[14px] text-rose-800">
                        {isHindi ? `अस्वीकृत: ${simResult.tier0.gateFailed}` : `REJECTED: ${simResult.tier0.gateFailed}`}
                      </span>
                    </>
                  )}
                </div>

                {simResult.tier0.passed ? (
                  <p className="text-[12px] text-emerald-700">
                    {isHindi
                      ? 'स्थानिक सीमा, समय वैधता, स्पैम सुरक्षा, प्रासंगिकता और सेंसर सीमा सभी सही पाई गईं।'
                      : 'Passed spatial bounds, temporal sanity, spam regex, lexical relevance, and sensor thresholding.'}
                  </p>
                ) : (
                  <div className="text-[12px] text-rose-700 bg-white/70 p-2.5 rounded-lg border border-rose-200 font-medium">
                    {isHindi ? 'कारण:' : 'Reason:'} <strong>{simResult.tier0.rejectionReason}</strong>
                    <div className="text-[11px] text-rose-600 mt-1">
                      💡 <strong>{isHindi ? 'लागत बचत:' : 'Cost Saved:'}</strong> {isHindi ? 'क्लाउड जीपीयू/एआई कोटा खर्च किए बिना तुरंत निरस्त ($0 व्यय)।' : 'Discarded immediately without consuming cloud GPU/AI quota ($0 spent).'}
                    </div>
                  </div>
                )}
              </div>

              {/* Tier 1 Box */}
              <div
                className={`p-4 rounded-xl border ${
                  simResult.tier1
                    ? 'bg-sky-50/70 border-sky-200 text-sky-950'
                    : 'bg-slate-100 border-slate-200 text-slate-500 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Cpu size={14} /> {isHindi ? 'टियर 1: एमएल अनुमान' : 'Tier 1: Calibrated ML Inference'}
                  </span>
                  {simResult.tier1 && (
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/80 border border-sky-300 text-sky-800">
                      {isHindi ? 'विलंबता' : 'Latency'}: ~1.2 ms
                    </span>
                  )}
                </div>

                {simResult.tier1 ? (
                  <div className="space-y-2 mt-2">
                    <div className="grid grid-cols-3 gap-2 text-[12px]">
                      <div className="p-2 rounded-lg bg-white border border-sky-200">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">{isHindi ? 'श्रेणी' : 'Category'}</span>
                        <strong className="text-sky-900 uppercase font-extrabold">
                          {translateCategory(simResult.tier1.category, isHindi)}
                        </strong>
                        <div className="text-[10px] text-emerald-600 font-semibold">
                          {(simResult.tier1.confidence * 100).toFixed(1)}% {isHindi ? 'विश्वसनीयता' : 'Conf'}
                        </div>
                      </div>

                      <div className="p-2 rounded-lg bg-white border border-sky-200">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">{isHindi ? 'तीव्रता' : 'Severity'}</span>
                        <strong className="text-amber-700 uppercase font-extrabold">
                          {translateSeverity(simResult.tier1.severity, isHindi)}
                        </strong>
                      </div>

                      <div className="p-2 rounded-lg bg-white border border-sky-200">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">{isHindi ? 'भ्रामक जोखिम' : 'Risk (P_mislead)'}</span>
                        <strong className="text-emerald-700 font-extrabold">
                          {(simResult.tier1.misleadingRisk * 100).toFixed(1)}%
                        </strong>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white/80 border border-sky-200 text-[11px] flex items-center gap-2">
                      <ArrowRight size={14} className="text-sky-600 shrink-0" />
                      <span>
                        {isHindi ? 'अगली कार्रवाई:' : 'Next Action:'} <strong>{simResult.tier1.routing}</strong>
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-24 text-[12px] font-medium text-slate-400">
                    {isHindi ? 'टियर 0 में निरस्त होने के कारण एमएल अनुमान छोड़ दिया गया।' : 'ML inference skipped because item was discarded in Tier 0.'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Connectors Grid ── */}
      <div className="space-y-3">
        <h2 className="text-[16px] font-extrabold text-slate-900 flex items-center gap-2">
          <Database size={18} className="text-sky-600" />
          {isHindi ? 'सक्रिय अंतर्ग्रहण कनेक्टर्स (5 विविध फ़ीड्स)' : 'Active Ingestion Connectors (5 Heterogeneous Feeds)'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {connectors.map((conn) => {
            const Icon = conn.icon;

            return (
              <div
                key={conn.id}
                className={`glass-card p-5 rounded-2xl border transition-all duration-200 space-y-4 ${
                  conn.enabled
                    ? 'border-slate-200 shadow-sm'
                    : 'border-slate-200/50 opacity-60 bg-slate-100/50'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-3 rounded-xl shadow-xs text-white"
                      style={{ backgroundColor: conn.color }}
                    >
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 className="text-[15px] font-bold text-slate-900">
                        {isHindi && conn.nameHi ? conn.nameHi : conn.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {isHindi && conn.typeHi ? conn.typeHi : conn.type}
                      </p>
                    </div>
                  </div>

                  {/* Enable / Disable Switch */}
                  <button
                    onClick={() => toggleConnector(conn.id)}
                    className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                      conn.enabled
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'border-slate-300 bg-slate-200 text-slate-600'
                    }`}
                    title={conn.enabled ? (isHindi ? 'स्ट्रीम रोकें' : 'Pause Ingestion Stream') : (isHindi ? 'स्ट्रीम चालू करें' : 'Enable Ingestion Stream')}
                  >
                    <Power size={16} />
                  </button>
                </div>

                {/* Status and Latency Indicators */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px]">
                  <div>
                    <span className="text-slate-400 font-semibold uppercase text-[10px]">{isHindi ? 'स्थिति' : 'Status'}</span>
                    <div className="font-bold flex items-center gap-1.5 mt-0.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          conn.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                        }`}
                      />
                      <span className="capitalize text-slate-800">
                        {conn.status === 'online' ? (isHindi ? 'ऑनलाइन' : 'online') : conn.status === 'degraded' ? (isHindi ? 'धीमा' : 'degraded') : (isHindi ? 'सिंकिंग' : 'syncing')}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold uppercase text-[10px]">{isHindi ? 'विलंबता' : 'Latency'}</span>
                    <div className="font-bold text-slate-800 mt-0.5">
                      {conn.latencyMs} ms
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold uppercase text-[10px]">{isHindi ? 'अपटाइम' : 'Uptime'}</span>
                    <div className="font-bold text-emerald-600 mt-0.5">
                      {conn.uptimePercent}%
                    </div>
                  </div>
                </div>

                {/* Quota / Rate Limit Progress Bar */}
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-500 font-medium">{isHindi ? 'एपीआई थ्रूपुट / कोटा उपयोग' : 'API Throughput / Quota Utilization'}</span>
                    <span className="font-bold text-slate-700">{conn.quotaUsed}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        conn.quotaUsed > 80 ? 'bg-red-500' : 'bg-sky-500'
                      }`}
                      style={{ width: `${conn.quotaUsed}%` }}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                  <span>{isHindi ? 'दर:' : 'Rate:'} <strong className="text-slate-700">{conn.throughput}</strong></span>
                  <span>{isHindi ? 'अंतिम संकेत:' : 'Last heartbeat:'} {conn.lastSync}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
