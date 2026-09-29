/* ═══════════════════════════════════════════════════════
   SkySignal — Citizen Rapid Report Form
   Under-30-second submission form with offline IndexedDB queue,
   GPS geolocation, drag-and-drop media upload & validation
   ═══════════════════════════════════════════════════════ */

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Send,
  MapPin,
  Camera,
  CloudRain,
  CloudLightning,
  Waves,
  Thermometer,
  Cloud,
  Wind,
  CheckCircle2,
  AlertTriangle,
  X,
  WifiOff,
  Navigation,
  ChevronDown,
} from 'lucide-react';
import { queueOfflineReport, getOrCreateDeviceId, type QueuedReport } from '../../lib/offlineQueue';
import { submitReport } from '../../services/mockApi';
import { CATEGORY_CONFIG, SEVERITY_CONFIG } from '../../data/mock';
import type { WeatherCategory, Severity, ReportSubmission } from '../../types/weather';
import {
  INDIAN_STATES_AND_UTS,
  ALL_INDIAN_CITIES,
  findCityData,
  type CityData,
} from '../../data/indiaLocations';
import { reverseGeocodeLocation } from '../../services/locationSearch';
import { useUserLocation } from '../../context/LocationContext';

interface ReportFormProps {
  onReportSubmitted?: (report: QueuedReport) => void;
}

const CATEGORIES: { id: WeatherCategory; labelEn: string; labelHi: string; icon: any }[] = [
  { id: 'rainfall', labelEn: 'Rainfall', labelHi: 'भारी बारिश', icon: CloudRain },
  { id: 'thunderstorm', labelEn: 'Thunderstorm', labelHi: 'गरज-तूफान', icon: CloudLightning },
  { id: 'flooding', labelEn: 'Flooding', labelHi: 'जलभराव / बाढ़', icon: Waves },
  { id: 'heatwave', labelEn: 'Heatwave', labelHi: 'भीषण गर्मी / लू', icon: Thermometer },
  { id: 'fog', labelEn: 'Fog', labelHi: 'घना कोहरा', icon: Cloud },
  { id: 'dust storm', labelEn: 'Dust Storm', labelHi: 'धूल भरी आंधी', icon: Wind },
  { id: 'strong wind', labelEn: 'Strong Wind', labelHi: 'तेज चक्रवाती हवा', icon: Wind },
];

const MAX_CHARS = 2000;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit

export default function ReportForm({ onReportSubmitted }: ReportFormProps) {
  const { i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';
  const { location: userLoc } = useUserLocation();

  // Form State
  const [category, setCategory] = useState<WeatherCategory>('rainfall');
  const [severity, setSeverity] = useState<Severity>('moderate');
  const [city, setCity] = useState(userLoc?.cityName || '');
  const [state, setState] = useState(userLoc?.stateName || '');
  const [lat, setLat] = useState<number>(userLoc?.lat ?? 19.076);
  const [lon, setLon] = useState<number>(userLoc?.lng ?? 72.8777);
  const [description, setDescription] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; isOffline?: boolean } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Dropdown states
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  // Sync with userLoc if fields are empty
  useEffect(() => {
    if (userLoc && !city) {
      setCity(userLoc.cityName);
      setState(userLoc.stateName);
      setLat(userLoc.lat);
      setLon(userLoc.lng);
    }
  }, [userLoc, city]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
        setIsCityDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter cities based on selected state and typed city
  const filteredCities = ALL_INDIAN_CITIES.filter((c) => {
    const matchesState = !state || c.state.toLowerCase() === state.toLowerCase();
    const matchesQuery = !city || c.city.toLowerCase().includes(city.trim().toLowerCase());
    return matchesState && matchesQuery;
  });

  // Select city handler (Auto-fills state and coordinates)
  const handleSelectCity = (c: CityData) => {
    setCity(c.city);
    setState(c.state);
    setLat(c.lat);
    setLon(c.lon);
    setIsCityDropdownOpen(false);
  };

  // City text input handler with auto-detection of State
  const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCity(val);
    setIsCityDropdownOpen(true);

    const matched = findCityData(val);
    if (matched && matched.city.toLowerCase() === val.trim().toLowerCase()) {
      setState(matched.state);
      setLat(matched.lat);
      setLon(matched.lon);
    }
  };

  // State selection handler
  const handleStateChange = (selectedState: string) => {
    setState(selectedState);
    if (selectedState && city) {
      const matched = findCityData(city);
      if (matched && matched.state.toLowerCase() !== selectedState.toLowerCase()) {
        setCity('');
      }
    }
  };

  // Instant GPS Geolocation
  const handleGetLocation = () => {
    setIsLocating(true);

    const applyCoords = async (latitude: number, longitude: number) => {
      setLat(latitude);
      setLon(longitude);
      try {
        const geoInfo = await reverseGeocodeLocation(latitude, longitude);
        if (geoInfo.cityName && geoInfo.cityName !== 'Current Location') {
          setCity(geoInfo.cityName);
        }
        if (geoInfo.stateName) {
          setState(geoInfo.stateName);
        }
      } catch {
        // keep current or nearest
      }
      setIsLocating(false);
    };

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      if (userLoc) {
        applyCoords(userLoc.lat, userLoc.lng);
      } else {
        setIsLocating(false);
      }
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latitude = Number(pos.coords.latitude.toFixed(4));
        const longitude = Number(pos.coords.longitude.toFixed(4));
        applyCoords(latitude, longitude);
      },
      (_err) => {
        // Fallback to low-accuracy Wi-Fi position or userLoc
        navigator.geolocation.getCurrentPosition(
          (fallbackPos) => {
            const latitude = Number(fallbackPos.coords.latitude.toFixed(4));
            const longitude = Number(fallbackPos.coords.longitude.toFixed(4));
            applyCoords(latitude, longitude);
          },
          () => {
            if (userLoc) {
              setLat(userLoc.lat);
              setLon(userLoc.lng);
              setCity(userLoc.cityName);
              setState(userLoc.stateName);
            }
            setIsLocating(false);
          },
          { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
        );
      },
      { timeout: 5000, enableHighAccuracy: true }
    );
  };

  // Media File Handling (with 10MB check & FileReader)
  const processFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setValidationError(null);

    Array.from(files).forEach((file) => {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setValidationError(
          isHindi
            ? `फ़ाइल "${file.name}" 10MB की सीमा से बड़ी है!`
            : `File "${file.name}" exceeds the 10MB upload limit!`
        );
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setMediaUrls((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    processFiles(e.dataTransfer.files);
  };

  // Form Validation & Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Rule: Requires category + location + (either description OR media)
    if (!category) {
      setValidationError(isHindi ? 'कृपया आपदा श्रेणी चुनें।' : 'Please select a hazard category.');
      return;
    }
    if (!city.trim() && !state.trim()) {
      setValidationError(isHindi ? 'कृपया स्थान दर्ज करें या जीपीएस का उपयोग करें।' : 'Please provide location details or use GPS.');
      return;
    }
    if (!description.trim() && mediaUrls.length === 0) {
      setValidationError(
        isHindi
          ? 'कृपया घटना का विवरण लिखें या प्रमाण के रूप में फोटो/वीडियो संलग्न करें।'
          : 'Please enter a description or upload photo/video proof.'
      );
      return;
    }

    setIsSubmitting(true);
    const deviceId = getOrCreateDeviceId();
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

    try {
      if (!isOnline) {
        // Offline: Persist directly into IndexedDB
        const queued = await queueOfflineReport({
          event_category: category,
          severity,
          lat,
          lon,
          city: city.trim() || 'Offline Location',
          state: state.trim() || 'Offline State',
          raw_text: description.trim(),
          media_urls: mediaUrls,
          device_id: deviceId,
        });

        setFeedbackToast({
          message: isHindi
            ? 'ऑफ़लाइन सहेजा गया: रिपोर्ट डिवाइस में सुरक्षित है। इंटरनेट आने पर स्वचालित रूप से भेजी जाएगी।'
            : 'Stored offline: Report queued safely on device. Will auto-sync when internet reconnects.',
          isOffline: true,
        });

        onReportSubmitted?.(queued);
      } else {
        // Online: Submit to API and also store locally in history
        const submissionPayload: ReportSubmission = {
          event_category: category,
          severity,
          lat,
          lon,
          city: city.trim() || 'Mumbai',
          state: state.trim() || 'Maharashtra',
          raw_text: description.trim(),
          media_urls: mediaUrls,
          device_id: deviceId,
          language: isHindi ? 'hi' : 'en',
        };

        const apiReport = await submitReport(submissionPayload);

        // Also save to indexedDB as synced
        const queued = await queueOfflineReport({
          event_category: category,
          severity,
          lat,
          lon,
          city: city.trim() || 'Mumbai',
          state: state.trim() || 'Maharashtra',
          raw_text: description.trim(),
          media_urls: mediaUrls,
          device_id: deviceId,
        });

        setFeedbackToast({
          message: isHindi
            ? 'धन्यवाद! आपकी रिपोर्ट आईएमडी वेदर इंटेलिजेंस सेंटर को प्राप्त हो गई है।'
            : `Success! Observation transmitted to IMD Command Center (Report ID: ${apiReport.id}).`,
          isOffline: false,
        });

        onReportSubmitted?.({
          ...queued,
          synced: true,
          status: 'verified',
        });
      }

      // Reset Form for next fast report
      setDescription('');
      setMediaUrls([]);
      setTimeout(() => setFeedbackToast(null), 6000);
    } catch (err) {
      console.error('Submission failed:', err);
      setValidationError('Failed to transmit report. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-card p-5 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xl space-y-6"
    >
      {/* Toast Feedback (Floating Bottom-Right Alert) */}
      {feedbackToast && (
        <div className="fixed bottom-22 right-6 z-50 max-w-md w-[calc(100vw-3rem)] sm:w-[420px] animate-slide-up pointer-events-auto">
          <div
            className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-md text-[13px] font-bold flex items-start justify-between gap-3 ${
              feedbackToast.isOffline
                ? 'bg-amber-50/95 border-amber-300 text-amber-950 shadow-amber-500/10'
                : 'bg-emerald-50/95 border-emerald-300 text-emerald-950 shadow-emerald-500/15 ring-1 ring-emerald-400/30'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {feedbackToast.isOffline ? (
                <WifiOff size={18} className="text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <span className="leading-snug block">{feedbackToast.message}</span>
                <span className="text-[10px] text-emerald-700/80 font-mono block">
                  Encrypted telemetry sync • IMD Disaster Desk
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackToast(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-black/5 transition-colors shrink-0 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Validation Error Banner */}
      {validationError && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-[12px] font-bold flex items-center gap-2 animate-fade-in">
          <AlertTriangle size={16} className="text-red-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* ── 1. Hazard Category Grid (7 Interactive Icon Tiles) ── */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-[13px] font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <span>1. {isHindi ? 'मौसम आपदा का प्रकार' : 'Hazard Category'}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 font-bold">
              {isHindi ? '७ श्रेणियां' : '7 Strict Types'}
            </span>
          </label>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = category === cat.id;
            const meta = CATEGORY_CONFIG[cat.id];

            return (
              <button
                type="button"
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`
                  p-3 rounded-2xl border text-center flex flex-col items-center justify-center gap-1.5
                  transition-all duration-200 cursor-pointer select-none
                  ${
                    isSelected
                      ? 'border-sky-500 bg-sky-500/10 shadow-md ring-2 ring-sky-500/30 font-extrabold scale-102'
                      : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/80 text-slate-700 font-semibold'
                  }
                `}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs"
                  style={{ backgroundColor: meta?.color || '#0284c7' }}
                >
                  <Icon size={18} />
                </div>
                <span className="text-[11px] leading-tight">
                  {isHindi ? cat.labelHi : cat.labelEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. Severity Level (Strict 3-Tier) ── */}
      <div>
        <label className="block text-[13px] font-black text-slate-900 uppercase tracking-wider mb-2">
          2. {isHindi ? 'तीव्रता का स्तर' : 'Estimated Impact Severity'}
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(['minor', 'moderate', 'severe'] as Severity[]).map((sev) => {
            const config = SEVERITY_CONFIG[sev];
            const isSelected = severity === sev;

            return (
              <button
                type="button"
                key={sev}
                onClick={() => setSeverity(sev)}
                className={`
                  py-2.5 px-3 rounded-2xl border text-center transition-all cursor-pointer font-bold text-[12px] flex items-center justify-center gap-2
                  ${
                    isSelected
                      ? sev === 'severe'
                        ? 'border-red-500 bg-red-500 text-white shadow-md ring-2 ring-red-400/40'
                        : sev === 'moderate'
                        ? 'border-sky-500 bg-sky-600 text-white shadow-md ring-2 ring-sky-400/40'
                        : 'border-emerald-500 bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400/40'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }
                `}
              >
                <span>{config.icon}</span>
                <span className="capitalize">
                  {isHindi
                    ? sev === 'minor'
                      ? 'सामान्य'
                      : sev === 'moderate'
                      ? 'मध्यम'
                      : 'गंभीर'
                    : config.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 3. Instant GPS Location & Manual Inputs ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[13px] font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <span>3. {isHindi ? 'घटना का स्थान' : 'Incident Location'}</span>
          </label>
          <button
            type="button"
            onClick={handleGetLocation}
            disabled={isLocating}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-xl text-[11px] font-bold transition-colors cursor-pointer shadow-2xs"
          >
            <Navigation size={13} className={isLocating ? 'animate-spin' : ''} />
            <span>
              {isLocating
                ? isHindi
                  ? 'जीपीएस खोज रहा है...'
                  : 'Acquiring GPS...'
                : isHindi
                ? 'मेरा जीपीएस स्थान उपयोग करें'
                : 'Use my GPS location'}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* City Combobox & Dropdown */}
          <div className="relative" ref={cityDropdownRef}>
            <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={city}
              onChange={handleCityInputChange}
              onFocus={() => setIsCityDropdownOpen(true)}
              placeholder={isHindi ? 'शहर चुनें या लिखें (उदा. सूरत)' : 'Select or type City (e.g. Surat)'}
              className="w-full pl-10 pr-9 py-2.5 text-[12px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 font-medium"
              required
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              title="Toggle City Dropdown"
            >
              <ChevronDown size={15} className={`transition-transform duration-200 ${isCityDropdownOpen ? 'rotate-180 text-sky-600' : ''}`} />
            </button>

            {/* Single Interactive Dropdown Menu with all Indian Cities */}
            {isCityDropdownOpen && (
              <div className="absolute z-50 left-0 right-0 top-full mt-1.5 max-h-64 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 divide-y divide-slate-100 animate-fade-in">
                <div className="sticky top-0 bg-slate-50/95 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 z-10">
                  <span>{state ? `Cities in ${state}` : (isHindi ? 'सभी भारतीय शहर' : 'All Indian Cities')}</span>
                  <span className="text-sky-600">{filteredCities.length} {isHindi ? 'उपलब्ध' : 'available'}</span>
                </div>
                {filteredCities.length > 0 ? (
                  filteredCities.map((c) => (
                    <button
                      key={`${c.city}-${c.state}`}
                      type="button"
                      onClick={() => handleSelectCity(c)}
                      className={`w-full text-left px-3.5 py-2 hover:bg-sky-50 flex items-center justify-between text-[12px] transition-colors cursor-pointer ${
                        city.toLowerCase() === c.city.toLowerCase() ? 'bg-sky-50/80 font-bold text-sky-700' : ''
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-slate-800 text-left">
                        <MapPin size={12} className="text-sky-600 shrink-0" />
                        <span>{c.city}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md shrink-0">
                        {c.state}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="px-3.5 py-2.5 text-[11px] text-slate-400 italic text-center">
                    {isHindi ? 'कोई मेल खाता शहर नहीं मिला — आप कोई भी स्थान लिख सकते हैं' : 'No exact match — you can type your custom locality'}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* State Selection Dropdown */}
          <div className="relative">
            <select
              value={state}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full pl-3.5 pr-10 py-2.5 text-[12px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 font-medium cursor-pointer appearance-none"
              required
            >
              <option value="">{isHindi ? 'राज्य / केंद्र शासित प्रदेश चुनें' : 'Select State / UT'}</option>
              {INDIAN_STATES_AND_UTS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ── 4. Media Upload Zone (Drag-and-Drop + 10MB limit) ── */}
      <div className="space-y-2">
        <label className="block text-[13px] font-black text-slate-900 uppercase tracking-wider">
          4. {isHindi ? 'प्रमाण फोटो / वीडियो (अधिकतम 10MB)' : 'Photo / Video Evidence (Max 10MB)'}
        </label>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`
            relative p-6 rounded-2xl border-2 border-dashed text-center transition-all duration-200 flex flex-col items-center justify-center gap-2 cursor-pointer
            ${
              isDragOver
                ? 'border-sky-500 bg-sky-50/70 scale-101'
                : 'border-slate-300 hover:border-sky-400 bg-slate-50/50 hover:bg-slate-50'
            }
          `}
        >
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            capture="environment"
            onChange={handleFileInputChange}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            aria-label="Upload weather photo or video"
          />
          <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shadow-xs">
            <Camera size={20} />
          </div>
          <div>
            <span className="text-[12px] font-bold text-slate-800">
              {isHindi ? 'फोटो खींचें या यहाँ खींचकर छोड़ें' : 'Take a photo or drag files here'}
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isHindi ? 'JPG, PNG, MP4 अधिकतम 10MB प्रति फाइल समर्थित' : 'Supports JPG, PNG, MP4 up to 10MB per file'}
            </p>
          </div>
        </div>

        {/* Thumbnail Previews */}
        {mediaUrls.length > 0 && (
          <div className="flex items-center gap-2.5 flex-wrap pt-1">
            {mediaUrls.map((url, idx) => (
              <div
                key={idx}
                className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shadow-xs group"
              >
                <img src={url} alt="Attached evidence" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setMediaUrls((prev) => prev.filter((_, i) => i !== idx))}
                  className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-black transition-colors"
                  aria-label="Remove image"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 5. Description Textarea with Character Counter (Max 2,000) ── */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[13px] font-black text-slate-900 uppercase tracking-wider">
            5. {isHindi ? 'घटना का विवरण' : 'Ground Observation Narrative'}
          </label>
          <span
            className={`text-[11px] font-mono font-bold ${
              description.length > 1800 ? 'text-amber-600' : 'text-slate-400'
            }`}
          >
            {description.length}/{MAX_CHARS}
          </span>
        </div>

        <textarea
          rows={3}
          maxLength={MAX_CHARS}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={
            isHindi
              ? 'पानी का स्तर (घुटने तक/कमर तक), गिरे हुए पेड़, रुकी हुई सड़कें या बिजली पोल की स्थिति लिखें...'
              : 'Details: water depth (knee-high, vehicle stall), blocked thoroughfares, fallen trees, zero visibility...'
          }
          className="w-full p-3.5 text-[12px] bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 leading-relaxed font-medium"
        />
      </div>

      {/* ── Submit Button ── */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="
          w-full py-4 px-6 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800
          text-white rounded-2xl text-[14px] font-extrabold shadow-lg hover:shadow-xl
          transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer
        "
      >
        {isSubmitting ? (
          <span>{isHindi ? 'रिपोर्ट भेजी जा रही है...' : 'Encrypting & Transmitting...'}</span>
        ) : (
          <>
            <Send size={16} />
            <span>
              {isHindi ? 'सबमिट करें' : 'Submit'}
            </span>
          </>
        )}
      </button>
    </form>
  );
}
