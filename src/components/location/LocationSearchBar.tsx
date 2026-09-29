/* ═══════════════════════════════════════════════════════
   SkySignal — Location Search Bar with Instant Dropdown
   Replaces Live Telemetry with instant area & locality search.
   ═══════════════════════════════════════════════════════ */

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X, Loader2 } from 'lucide-react';
import { useUserLocation } from '../../context/LocationContext';
import { searchLocations, type LocationSearchResult } from '../../services/locationSearch';

export default function LocationSearchBar() {
  const { setCityLocation } = useUserLocation();
  const { i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Search effect
  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    const timer = setTimeout(async () => {
      const res = await searchLocations(query);
      setResults(res);
      setIsLoading(false);
    }, 80);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFocus = async () => {
    setIsOpen(true);
    if (results.length === 0) {
      setIsLoading(true);
      const res = await searchLocations(query);
      setResults(res);
      setIsLoading(false);
    }
  };

  const handleSelect = (loc: LocationSearchResult) => {
    setCityLocation({
      lat: loc.lat,
      lng: loc.lng,
      cityName: loc.cityName,
      stateName: loc.stateName,
      tempC: loc.tempC,
      weatherIcon: loc.weatherIcon,
      condition: loc.condition,
      isCustom: true,
    });

    // Notify map to fly to this exact coordinate with deep zoom
    window.dispatchEvent(
      new CustomEvent('skysignal:recenter-map', {
        detail: { lat: loc.lat, lng: loc.lng, zoom: 16, name: loc.name },
      })
    );

    setQuery('');
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    searchLocations('').then((res) => setResults(res));
  };

  return (
    <div ref={containerRef} className="relative w-48 sm:w-56 md:w-64 lg:w-72 z-30">
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={handleFocus}
          onClick={handleFocus}
          placeholder={isHindi ? 'सभी भारतीय शहर एवं क्षेत्र खोजें...' : 'Search all Indian cities & areas...'}
          className="w-full pl-3.5 pr-9 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-100/90 focus:bg-white border border-slate-200 focus:border-amber-500 text-[13px] font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all shadow-xs"
        />

        <div className="absolute right-2.5 flex items-center gap-1 text-slate-400">
          {isLoading && <Loader2 size={14} className="animate-spin text-amber-600" />}
          {query && !isLoading && (
            <button
              onClick={handleClear}
              className="p-0.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
              title="Clear search"
            >
              <X size={13} />
            </button>
          )}
          <Search size={15} className="text-slate-500 pointer-events-none" />
        </div>
      </div>

      {/* Dropdown Results — Showing all cities of India */}
      {isOpen && (
        <div className="absolute top-full left-0 w-80 sm:w-96 mt-1.5 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-96 overflow-y-auto animate-fade-in z-50 divide-y divide-slate-100">
          {/* Header Bar with Count */}
          <div className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-md px-3.5 py-1.5 border-b border-slate-200 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span>
              {query
                ? isHindi
                  ? `मेल खाते स्थान (${results.length})`
                  : `Matching Locations (${results.length})`
                : isHindi
                ? `सभी भारतीय शहर (${results.length})`
                : `All Indian Cities (${results.length})`}
            </span>
            <span className="text-amber-600 font-semibold normal-case">
              {isHindi ? 'लाइव रडार तैयार' : 'Live Radar Ready'}
            </span>
          </div>

          {results.length > 0 ? (
            results.map((loc) => (
              <button
                key={loc.id}
                onClick={() => handleSelect(loc)}
                className="w-full px-3.5 py-2.5 text-left hover:bg-amber-50/70 active:bg-amber-100/60 transition-colors cursor-pointer flex items-center justify-between group"
              >
                <div className="space-y-0.5 pr-2 text-left">
                  <div className="text-[13.5px] font-bold text-slate-900 group-hover:text-amber-700 leading-snug text-left">
                    {loc.name}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 text-left">
                    <span>{loc.subtitle}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-right shrink-0 bg-slate-50 group-hover:bg-amber-100/50 px-2 py-1 rounded-lg border border-slate-100 transition-colors">
                  <span className="text-[12px] font-bold text-slate-700">{loc.tempC}°c</span>
                  <span className="text-[15px]">{loc.weatherIcon}</span>
                </div>
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-[12px] text-slate-500">
              {isHindi ? 'कोई मेल खाता भारतीय शहर नहीं मिला।' : 'No matching city found in India. Try another keyword.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
