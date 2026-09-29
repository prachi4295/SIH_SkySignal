/* ═══════════════════════════════════════════════════════
   SkySignal — Event Explorer Page
   National Weather Intelligence Platform (IMD / SIH26069)
   Multi-axis filter bar: Time range, Category multi-select pills,
   Region buttons (North, South, East, West, Central), Severity,
   Lifecycle state, Instant search with '/' shortcut.
   View mode toggle: "Split Map & Dense Grid" vs "Full Directory Table".
   ═══════════════════════════════════════════════════════ */

import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  SlidersHorizontal,
  Table as TableIcon,
  LayoutGrid,
  Download,
  MapPin,
  RotateCcw,
} from 'lucide-react';
import GeoRadarMap from '../components/map/GeoRadarMap';
import EventDetailDrawer from '../components/events/EventDetailDrawer';
import { mockWeatherEvents } from '../lib/mockData';
import { deduplicateWeatherEvents } from '../services/eventDeduplication';
import { CATEGORY_CONFIG, SEVERITY_CONFIG } from '../data/mock';
import { useAuth } from '../context/AuthContext';
import type { WeatherEvent, Severity, LifecycleStatus } from '../types/weather';

type RegionOption = 'all' | 'north' | 'south' | 'east' | 'west' | 'central';
type ViewModeOption = 'split' | 'table';

const REGION_MAP: Record<Exclude<RegionOption, 'all'>, string[]> = {
  north: ['delhi', 'haryana', 'punjab', 'himachal pradesh', 'uttarakhand', 'uttar pradesh', 'rajasthan', 'jammu & kashmir'],
  south: ['tamil nadu', 'kerala', 'karnataka', 'andhra pradesh', 'telangana', 'goa'],
  east: ['west bengal', 'odisha', 'bihar', 'jharkhand', 'assam', 'tripura', 'meghalaya'],
  west: ['maharashtra', 'gujarat'],
  central: ['madhya pradesh', 'chhattisgarh'],
};

const LIFECYCLE_OPTIONS: { id: LifecycleStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All Lifecycle' },
  { id: 'detected', label: 'Detected' },
  { id: 'emerging', label: 'Emerging' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'active', label: 'Active' },
  { id: 'declining', label: 'Declining' },
  { id: 'resolved', label: 'Resolved' },
];

export default function EventExplorer() {
  const { isAdmin } = useAuth();
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<RegionOption>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<Severity | 'all'>('all');
  const [selectedLifecycle, setSelectedLifecycle] = useState<LifecycleStatus | 'all'>('all');

  // View Mode: 'split' (Split Map & Dense Grid) vs 'table' (Full Directory Table)
  const [viewMode, setViewMode] = useState<ViewModeOption>('split');
  const [selectedEvent, setSelectedEvent] = useState<WeatherEvent | null>(null);

  // Keyboard shortcut '/' to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    const deduplicated = deduplicateWeatherEvents(mockWeatherEvents);
    return deduplicated.filter((evt) => {
      // 1. Text Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = evt.title.toLowerCase().includes(q);
        const matchCity = evt.city.toLowerCase().includes(q);
        const matchState = evt.state.toLowerCase().includes(q);
        const matchId = evt.id.toLowerCase().includes(q);
        if (!matchTitle && !matchCity && !matchState && !matchId) return false;
      }

      // 2. Region Filter
      if (selectedRegion !== 'all') {
        const targetStates = REGION_MAP[selectedRegion];
        const stateLower = evt.state.toLowerCase();
        if (!targetStates.some((s) => stateLower.includes(s))) {
          return false;
        }
      }

      // 3. Severity Filter
      if (selectedSeverity !== 'all' && evt.severity !== selectedSeverity) {
        return false;
      }

      // 4. Lifecycle Filter
      if (selectedLifecycle !== 'all' && evt.lifecycle_status !== selectedLifecycle) {
        return false;
      }

      return true;
    });
  }, [
    search,
    selectedRegion,
    selectedSeverity,
    selectedLifecycle,
  ]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearch('');
    setSelectedRegion('all');
    setSelectedSeverity('all');
    setSelectedLifecycle('all');
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredEvents, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `SkySignal_Events_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const hasActiveFilters =
    search.trim() !== '' ||
    selectedRegion !== 'all' ||
    selectedSeverity !== 'all' ||
    selectedLifecycle !== 'all';

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <SlidersHorizontal size={22} className="text-sky-600" />
            <h1 className="text-[22px] font-black text-slate-900 tracking-tight">
              Historical Event Explorer & Spatial Directory
            </h1>
          </div>
          <p className="text-[13px] text-slate-500">
            Query across multi-sensor Doppler radar, ground observations, and NLP social intelligence archives.
          </p>
        </div>

        {/* View Mode Toggle & Export */}
        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80 text-[12px] font-bold">
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'split'
                  ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid size={14} />
              <span>Split Map & Grid</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon size={14} />
              <span>Full Directory Table</span>
            </button>
          </div>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200/90 hover:bg-slate-50 rounded-xl text-[12px] font-bold text-slate-700 shadow-2xs transition-colors cursor-pointer"
            title="Export filtered events as JSON"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* ── Table Mode Search & Filter Bar (Shown only in Table view) ── */}
      {viewMode === 'table' && (
        <div className="bg-white p-3.5 rounded-2xl border border-sky-100 shadow-xs flex flex-wrap items-center justify-between gap-3 animate-fade-in">
          <div className="relative flex-1 min-w-[240px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, city, state, or event ID..."
              className="w-full pl-9 pr-8 py-2 text-[12.5px] bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Region */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-xl border border-slate-200/70 text-[11px] font-bold">
              {(['all', 'north', 'south', 'east', 'west', 'central'] as RegionOption[]).map((reg) => (
                <button
                  key={reg}
                  onClick={() => setSelectedRegion(reg)}
                  className={`px-2 py-1 rounded-lg capitalize transition-colors cursor-pointer ${
                    selectedRegion === reg
                      ? 'bg-white text-sky-900 shadow-2xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {reg}
                </button>
              ))}
            </div>

            {/* Severity */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-xl border border-slate-200/70 text-[11px] font-bold">
              {(['all', 'minor', 'moderate', 'severe'] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSelectedSeverity(sev)}
                  className={`px-2 py-1 rounded-lg capitalize transition-colors cursor-pointer ${
                    selectedSeverity === sev
                      ? sev === 'severe'
                        ? 'bg-rose-600 text-white font-black shadow-2xs'
                        : sev === 'moderate'
                        ? 'bg-sky-600 text-white font-black shadow-2xs'
                        : sev === 'minor'
                        ? 'bg-emerald-600 text-white font-black shadow-2xs'
                        : 'bg-white text-slate-900 font-black shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                title="Reset filters"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── View Mode: "Split Map & Dense Grid" vs "Full Directory Table" ── */}
      {viewMode === 'split' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-fade-in items-start">
          {/* Left Column: Interactive Radar Map with Embedded Filter Toolbar (lg:col-span-7) */}
          <div className="lg:col-span-7 rounded-3xl overflow-hidden border-2 border-sky-200 shadow-md bg-white relative h-[600px] lg:h-[calc(100vh-175px)] min-h-[520px]">
            {/* Embedded Floating Filter Bar on Map */}
            <div className="absolute top-3 left-3 right-3 z-10 bg-white/95 backdrop-blur-md rounded-2xl border border-sky-200/80 shadow-md p-2.5 flex flex-wrap items-center justify-between gap-2">
              {/* Geographic Region Tabs */}
              <div className="flex items-center gap-1 p-0.5 bg-slate-100/90 rounded-xl border border-slate-200/70 text-[11px] font-bold overflow-x-auto max-w-full">
                <span className="text-[10px] font-black text-slate-400 uppercase px-1.5 hidden sm:inline">
                  Region:
                </span>
                {(['all', 'north', 'south', 'east', 'west', 'central'] as RegionOption[]).map((reg) => (
                  <button
                    key={reg}
                    onClick={() => setSelectedRegion(reg)}
                    className={`px-2 py-0.5 rounded-lg capitalize transition-colors cursor-pointer shrink-0 ${
                      selectedRegion === reg
                        ? 'bg-white text-sky-900 shadow-2xs font-black'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {reg}
                  </button>
                ))}
              </div>

              {/* Severity Filter Tabs */}
              <div className="flex items-center gap-1 p-0.5 bg-slate-100/90 rounded-xl border border-slate-200/70 text-[11px] font-bold">
                <span className="text-[10px] font-black text-slate-400 uppercase px-1.5 hidden sm:inline">
                  Severity:
                </span>
                {(['all', 'minor', 'moderate', 'severe'] as const).map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setSelectedSeverity(sev)}
                    className={`px-2 py-0.5 rounded-lg capitalize transition-colors cursor-pointer ${
                      selectedSeverity === sev
                        ? sev === 'severe'
                          ? 'bg-rose-600 text-white font-black shadow-2xs'
                          : sev === 'moderate'
                          ? 'bg-sky-600 text-white font-black shadow-2xs'
                          : sev === 'minor'
                          ? 'bg-emerald-600 text-white font-black shadow-2xs'
                          : 'bg-white text-slate-900 font-black shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>

              {/* Lifecycle Dropdown */}
              <div className="flex items-center gap-1.5">
                <select
                  value={selectedLifecycle}
                  onChange={(e) => setSelectedLifecycle(e.target.value as any)}
                  className="py-1 px-2 text-[11px] bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  aria-label="Filter by lifecycle"
                >
                  {LIFECYCLE_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Reset filters"
                  >
                    <RotateCcw size={13} />
                  </button>
                )}
              </div>
            </div>

            <GeoRadarMap
              events={filteredEvents}
              onSelectEvent={isAdmin ? (evt) => setSelectedEvent(evt) : undefined}
              height="h-full"
            />
          </div>

          {/* Right Column: Dense Grid List (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-3 max-h-[600px] lg:max-h-[calc(100vh-175px)] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-sky-200">
            {filteredEvents.length === 0 ? (
              <div className="glass-card py-16 text-center text-slate-400 rounded-2xl border border-slate-200">
                No events match this query combination.
              </div>
            ) : (
              filteredEvents.map((evt) => {
                const catMeta = CATEGORY_CONFIG[evt.category];
                const sevMeta = SEVERITY_CONFIG[evt.severity];

                return (
                  <div
                    key={evt.id}
                    onClick={() => {
                      setSelectedEvent(evt);
                      window.dispatchEvent(
                        new CustomEvent('skysignal:recenter-map', {
                          detail: { lat: evt.lat, lng: evt.lon, zoom: 15, name: evt.title },
                        })
                      );
                    }}
                    className={`p-4 rounded-2xl bg-white border-2 border-slate-100 hover:border-sky-300 hover:shadow-md transition-all space-y-2.5 cursor-pointer ${
                      selectedEvent?.id === evt.id ? 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/30' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {isAdmin && (
                          <span className="font-mono text-[10px] font-black text-slate-400 px-1.5 py-0.5 bg-slate-100 rounded">
                            {evt.id}
                          </span>
                        )}
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-extrabold capitalize"
                          style={{ backgroundColor: catMeta?.bgColor, color: catMeta?.color }}
                        >
                          {evt.category}
                        </span>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          evt.severity === 'severe'
                            ? 'bg-rose-100 text-rose-800'
                            : evt.severity === 'moderate'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {sevMeta?.icon} {evt.severity}
                      </span>
                    </div>

                    <h4 className="text-[15px] sm:text-[16px] font-black text-slate-900 leading-snug hover:text-sky-700 transition-colors">
                      {evt.title}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-1 text-slate-600 font-semibold">
                        <MapPin size={12} className="text-sky-600" />
                        <span>{evt.city}, {evt.state}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 font-bold">
                        <span className="text-emerald-700 font-extrabold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-[11px]">
                          {evt.confidence}% confidence
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Full Directory Table View */
        <div className="glass-card overflow-hidden rounded-3xl border border-slate-200/90 shadow-sm animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/70 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Incident / Hazard</th>
                  <th className="py-3.5 px-3">Location & Region</th>
                  <th className="py-3.5 px-3">Severity</th>
                  <th className="py-3.5 px-3">Lifecycle State</th>
                  <th className="py-3.5 px-4">AI Confidence</th>
                  <th className="py-3.5 px-3">Evidence Sources</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No events match the selected multi-axis filters.
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((evt) => {
                    const catMeta = CATEGORY_CONFIG[evt.category];
                    const sevMeta = SEVERITY_CONFIG[evt.severity];

                    return (
                      <tr
                        key={evt.id}
                        onClick={() => setSelectedEvent(evt)}
                        className="transition-colors hover:bg-sky-50/50 cursor-pointer"
                      >
                        {/* Hazard Icon & Larger Title */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold shrink-0 text-base shadow-2xs"
                              style={{ backgroundColor: catMeta?.bgColor, color: catMeta?.color }}
                            >
                              {catMeta?.icon === 'CloudRain' ? '🌧️' : catMeta?.icon === 'Waves' ? '🌊' : catMeta?.icon === 'Thermometer' ? '🌡️' : '⚡'}
                            </div>
                            <div>
                              <span className="font-mono text-[11px] text-slate-400 font-bold block">
                                {evt.id}
                              </span>
                              <span className="font-black text-slate-900 text-[15px] sm:text-[16px] hover:text-sky-600 transition-colors leading-snug">
                                {evt.title}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Location */}
                        <td className="py-4 px-3">
                          <div className="flex items-center gap-1.5 font-semibold text-slate-700 text-[13px]">
                            <MapPin size={14} className="text-sky-600 shrink-0" />
                            <span>{evt.city}, {evt.state}</span>
                          </div>
                        </td>

                        {/* Severity */}
                        <td className="py-4 px-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase flex items-center gap-1 w-fit ${
                              evt.severity === 'severe'
                                ? 'bg-rose-100 text-rose-800'
                                : evt.severity === 'moderate'
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            <span>{sevMeta?.icon}</span>
                            <span>{evt.severity}</span>
                          </span>
                        </td>

                        {/* Lifecycle */}
                        <td className="py-4 px-3">
                          <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-700 capitalize">
                            {evt.lifecycle_status}
                          </span>
                        </td>

                        {/* Confidence Progress Bar (Without "Model Fusion") */}
                        <td className="py-4 px-4 min-w-[130px]">
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[12px] font-mono font-extrabold">
                              <span className="text-slate-800">{evt.confidence}%</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  evt.confidence >= 90
                                    ? 'bg-emerald-500'
                                    : evt.confidence >= 75
                                    ? 'bg-sky-500'
                                    : 'bg-amber-500'
                                }`}
                                style={{ width: `${evt.confidence}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Evidence Sources */}
                        <td className="py-4 px-3">
                          <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-extrabold text-[12px]">
                            {evt.independent_source_count} Platforms
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Slide-Over Event Detail Drawer (Admin Only) ── */}
      {isAdmin && selectedEvent && (
        <EventDetailDrawer
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}
