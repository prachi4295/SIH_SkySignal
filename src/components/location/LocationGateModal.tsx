import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  Navigation,
  Search,
  X,
  Loader2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useUserLocation, PRESET_CITIES } from '../../context/LocationContext';
import { searchLocations, type LocationSearchResult } from '../../services/locationSearch';

export default function LocationGateModal() {
  const {
    location,
    isModalOpen,
    isDetecting,
    detectionError,
    detectGPSLocation,
    setCityLocation,
    closeModal,
  } = useUserLocation();

  const { i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  // Debounced search query
  useEffect(() => {
    if (!isDropdownOpen && !searchQuery.trim()) return;

    setIsSearching(true);
    const timer = setTimeout(async () => {
      const results = await searchLocations(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, 60);

    return () => clearTimeout(timer);
  }, [searchQuery, isDropdownOpen]);

  // Click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isModalOpen) return null;

  const popularCities = PRESET_CITIES.slice(0, 8);

  const handleSelectResult = (item: LocationSearchResult) => {
    setCityLocation({
      lat: item.lat,
      lng: item.lng,
      cityName: item.cityName,
      stateName: item.stateName,
      tempC: item.tempC,
      weatherIcon: item.weatherIcon,
      condition: item.condition,
      isCustom: true,
    });
    setIsDropdownOpen(false);
  };

  const handleInputFocus = async () => {
    setIsDropdownOpen(true);
    if (searchResults.length === 0) {
      setIsSearching(true);
      const results = await searchLocations(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
      {/* Background glowing atmospheric ambient blur circles */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-sky-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-teal-500/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Glass Card */}
      <div className="relative w-full max-w-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/60 dark:border-slate-800 p-6 sm:p-8 space-y-6 text-center my-auto transition-all">
        
        {/* Top Close Button */}
        <div className="flex items-center justify-end">
          <button
            onClick={closeModal}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close location modal"
            title="Close"
          >
            <X size={19} />
          </button>
        </div>

        {/* Hero Icon */}
        <div className="pt-1">
          <div className="relative inline-flex items-center justify-center">
            {/* Animated Radar Pulse Rings */}
            <span className="absolute -inset-2.5 rounded-full bg-sky-400/30 animate-ping opacity-75 pointer-events-none" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white shadow-lg shadow-sky-500/25 flex items-center justify-center">
              <MapPin size={32} className="drop-shadow-sm" />
            </div>
          </div>
        </div>

        {/* Primary GPS Action Button */}
        <div className="space-y-2">
          <button
            onClick={() => detectGPSLocation()}
            disabled={isDetecting}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-gradient-to-r from-sky-600 via-sky-500 to-teal-500 hover:from-sky-700 hover:to-teal-600 active:scale-[0.99] text-white font-black text-[16px] sm:text-[17px] shadow-lg shadow-sky-500/25 transition-all cursor-pointer group"
          >
            {isDetecting ? (
              <>
                <Loader2 size={22} className="animate-spin text-white" />
                <span>{isHindi ? 'उच्च-सटीक GPS उपग्रह स्थान प्राप्त हो रहा है...' : 'Acquiring High-Accuracy GPS Satellite Fix...'}</span>
              </>
            ) : (
              <>
                <Navigation size={21} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                <span>{isHindi ? 'मेरा सटीक GPS स्थान उपयोग करें' : 'Use My Exact GPS Location'}</span>
              </>
            )}
          </button>

          {detectionError && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[13px] font-semibold text-left">
              ⚠️ {detectionError}
            </div>
          )}
        </div>

        {/* Divider with 'OR' and 'SEARCH BY CITY / DISTRICT' below */}
        <div className="relative flex flex-col items-center justify-center my-1.5">
          <div className="relative flex items-center justify-center w-full">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-slate-900 px-3 text-[12px] font-black uppercase tracking-wider text-slate-400 shrink-0">
              {isHindi ? 'अथवा' : 'OR'}
            </span>
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
          </div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mt-1">
            {isHindi ? 'शहर या जिला अनुसार खोजें' : 'SEARCH BY CITY / DISTRICT'}
          </span>
        </div>

        {/* Search Input Bar */}
        <div ref={searchContainerRef} className="relative text-left">
          <div className="relative flex items-center">
            <Search size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={handleInputFocus}
              onClick={handleInputFocus}
              placeholder={
                isHindi
                  ? 'सभी भारतीय शहर एवं जिले खोजें (उदा. सूरत, मुंबई, जयपुर)...'
                  : 'Search all Indian cities & districts (e.g., Damnagar, Surat, Mumbai)...'
              }
              className="w-full pl-11 pr-10 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 text-[14.5px] font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-slate-800 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  searchLocations('').then((res) => setSearchResults(res));
                }}
                className="absolute right-3.5 p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Clear input"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Instant Autocomplete Results — Showing all cities of India */}
          {isDropdownOpen && (
            <div className="mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/60 text-left animate-fade-in z-30">
              {/* Header Bar with Count */}
              <div className="sticky top-0 z-10 bg-slate-50/95 dark:bg-slate-800/95 backdrop-blur-md px-3.5 py-1.5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <span>
                  {searchQuery
                    ? isHindi
                      ? `मेल खाते स्थान (${searchResults.length})`
                      : `Matching Locations (${searchResults.length})`
                    : isHindi
                    ? `सभी भारतीय शहर (${searchResults.length})`
                    : `All Indian Cities (${searchResults.length})`}
                </span>
                <span className="text-sky-600 dark:text-sky-400 font-semibold normal-case">
                  {isHindi ? 'लाइव रडार उपलब्ध' : 'Live Radar Ready'}
                </span>
              </div>

              {isSearching ? (
                <div className="p-4 flex items-center justify-center gap-2 text-[13px] font-medium text-slate-500">
                  <Loader2 size={16} className="animate-spin text-sky-600" />
                  <span>{isHindi ? 'स्थान खोजे जा रहे हैं...' : 'Searching telemetry locations...'}</span>
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectResult(item)}
                    className="w-full px-4 py-2.5 text-left hover:bg-sky-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div className="text-left space-y-0.5 pr-2">
                      <div className="text-[14px] font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 text-left">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 text-left">
                        {item.subtitle}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-right font-bold text-[13px] text-slate-700 dark:text-slate-300 shrink-0 bg-slate-50 dark:bg-slate-700/60 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-600">
                      <span>{item.tempC}°C</span>
                      <span className="text-[15px]">{item.weatherIcon}</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-[13px] text-slate-500 text-center">
                  {isHindi ? 'कोई मेल खाता भारतीय शहर नहीं मिला।' : 'No matching city found in India. Try another keyword.'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Popular Meteorological Hubs Grid */}
        <div className="space-y-2 text-left pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[11.5px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isHindi ? 'प्रमुख मौसम विज्ञान केंद्र' : 'Popular Meteorological Hubs'}
            </span>
            <span className="text-[11px] font-semibold text-sky-600 flex items-center gap-1">
              <Sparkles size={12} /> {isHindi ? 'लाइव टेलीमेट्री' : 'Live Telemetry'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {popularCities.map((city) => {
              const isSelected = location.cityName.toLowerCase() === city.cityName.toLowerCase();
              const shortCondition = city.condition.split('/')[0].split('&')[0].trim();

              return (
                <button
                  key={city.cityName}
                  onClick={() => setCityLocation(city)}
                  className={`p-2.5 rounded-2xl text-left border-2 transition-all cursor-pointer flex flex-col justify-between min-h-[66px] overflow-hidden ${
                    isSelected
                      ? 'bg-sky-600 border-sky-600 text-white shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-sky-50/70 hover:border-sky-300 border-slate-200/90 dark:border-slate-700 text-slate-800 dark:text-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between w-full gap-1">
                    <span className="text-[12.5px] font-extrabold truncate leading-tight">
                      {city.cityName}
                    </span>
                    <span className="text-[14px] shrink-0 leading-none">{city.weatherIcon}</span>
                  </div>
                  <div
                    className={`text-[11px] font-bold leading-tight truncate mt-1 ${
                      isSelected ? 'text-sky-100' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <span>{city.tempC}°C</span>
                    <span className="mx-1 opacity-60">·</span>
                    <span className="font-normal">{shortCondition}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Footer Actions */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-[13px]">
          <div className="flex items-center gap-1.5 text-slate-500 text-[12px] font-semibold">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>{isHindi ? 'गोपनीयता सुरक्षित एवं अनाम' : 'Privacy protected & anonymous'}</span>
          </div>

          <button
            onClick={closeModal}
            className="text-sky-600 hover:text-sky-700 font-extrabold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>{isHindi ? 'लाइव रडार पर जारी रखें' : 'Continue to Live Radar'}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
