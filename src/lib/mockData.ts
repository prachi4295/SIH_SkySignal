/* ═══════════════════════════════════════════════════════
   SkySignal — Mock Data Generator
   Realistic Indian weather events, reports, and clusters
   for development without a live backend
   ═══════════════════════════════════════════════════════ */

import type {
  WeatherEvent,
  Report,
  DuplicateCluster,
  WeatherCategory,
  Severity,
  LifecycleStatus,
  SourcePlatform,
} from '../types/weather';
import { getSynthesizedIncidentDescription } from '../services/incidentIntelligence';

// ═══════════════════════════════════════════════════════
// Helper — ISO timestamps relative to "now"
// ═══════════════════════════════════════════════════════

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600_000).toISOString();
}

function minutesAgo(m: number): string {
  return new Date(Date.now() - m * 60_000).toISOString();
}

// ═══════════════════════════════════════════════════════
// Indian City Coordinates
// ═══════════════════════════════════════════════════════

interface CityCoord {
  city: string;
  state: string;
  lat: number;
  lon: number;
}

const CITIES: Record<string, CityCoord> = {
  mumbai:      { city: 'Mumbai',       state: 'Maharashtra',      lat: 19.0760, lon: 72.8777 },
  delhi:       { city: 'Delhi',        state: 'Delhi NCR',        lat: 28.6139, lon: 77.2090 },
  dehradun:    { city: 'Dehradun',     state: 'Uttarakhand',      lat: 30.3165, lon: 78.0322 },
  ahmedabad:   { city: 'Ahmedabad',    state: 'Gujarat',          lat: 23.0225, lon: 72.5714 },
  surat:       { city: 'Surat',        state: 'Gujarat',          lat: 21.1702, lon: 72.8311 },
  chennai:     { city: 'Chennai',      state: 'Tamil Nadu',       lat: 13.0827, lon: 80.2707 },
  kolkata:     { city: 'Kolkata',      state: 'West Bengal',      lat: 22.5726, lon: 88.3639 },
  jaipur:      { city: 'Jaipur',       state: 'Rajasthan',        lat: 26.9124, lon: 75.7873 },
  nagpur:      { city: 'Nagpur',       state: 'Maharashtra',      lat: 21.1458, lon: 79.0882 },
  kochi:       { city: 'Kochi',        state: 'Kerala',           lat: 9.9312,  lon: 76.2673 },
  vizag:       { city: 'Visakhapatnam', state: 'Andhra Pradesh',  lat: 17.6868, lon: 83.2185 },
  bhopal:      { city: 'Bhopal',       state: 'Madhya Pradesh',   lat: 23.2599, lon: 77.4126 },
  lucknow:     { city: 'Lucknow',      state: 'Uttar Pradesh',    lat: 26.8467, lon: 80.9462 },
  jodhpur:     { city: 'Jodhpur',      state: 'Rajasthan',        lat: 26.2389, lon: 73.0243 },
  panaji:      { city: 'Panaji',       state: 'Goa',              lat: 15.4909, lon: 73.8278 },
  patna:       { city: 'Patna',        state: 'Bihar',            lat: 25.6093, lon: 85.1376 },
};

// ═══════════════════════════════════════════════════════
// Mock Weather Events (With Ground Truth Images)
// ═══════════════════════════════════════════════════════

export const mockWeatherEvents: WeatherEvent[] = ([
  {
    id: 'EVT-2026-001',
    title: 'Extremely Heavy Monsoon Rainfall — Red Alert',
    category: 'rainfall',
    ...CITIES.mumbai,
    severity: 'severe',
    confidence: 94,
    lifecycle_status: 'active',
    has_contradiction: false,
    independent_source_count: 4,
    detected_at: hoursAgo(14),
    last_updated_at: minutesAgo(12),
    evidence_summary: { citizen_reports: 87, social_posts: 214, sensor_corroborated: true, news_articles: 9 },
    media_urls: ['/images/rain/1.jpg', '/images/rain/2.jpg', '/images/rain/3.jpg', '/images/rain/4.jpg'],
  },
  {
    id: 'EVT-2026-002',
    title: 'Severe Thunderstorm & Hail Risk',
    category: 'thunderstorm',
    ...CITIES.jaipur,
    severity: 'severe',
    confidence: 87,
    lifecycle_status: 'emerging',
    has_contradiction: false,
    independent_source_count: 3,
    detected_at: hoursAgo(6),
    last_updated_at: minutesAgo(45),
    evidence_summary: { citizen_reports: 32, social_posts: 78, sensor_corroborated: true, news_articles: 4 },
    media_urls: ['/images/thunderstorm/1.jpg', '/images/thunderstorm/2.jpg'],
  },
  {
    id: 'EVT-2026-003',
    title: 'Critical Urban Flooding — Surat & Tapi Basin Surge',
    category: 'flooding',
    ...CITIES.surat,
    severity: 'severe',
    confidence: 93,
    lifecycle_status: 'confirmed',
    has_contradiction: false,
    independent_source_count: 5,
    detected_at: hoursAgo(18),
    last_updated_at: minutesAgo(28),
    evidence_summary: { citizen_reports: 64, social_posts: 189, sensor_corroborated: true, news_articles: 12 },
    media_urls: ['/images/flooding/1.jpg', '/images/flooding/2.jpg', '/images/flooding/3.jpg', '/images/flooding/4.jpg'],
  },
  {
    id: 'EVT-2026-004',
    title: 'Heatwave Advisory — Vidarbha Region',
    category: 'heatwave',
    ...CITIES.nagpur,
    severity: 'moderate',
    confidence: 82,
    lifecycle_status: 'active',
    has_contradiction: true,     // Sensor reads 42°C but reports say 46°C
    independent_source_count: 2,
    detected_at: hoursAgo(30),
    last_updated_at: hoursAgo(2),
    evidence_summary: { citizen_reports: 23, social_posts: 45, sensor_corroborated: false, news_articles: 3 },
    media_urls: ['/images/duststorms/2.jpg', '/images/duststorms/4.jpg'],
  },
  {
    id: 'EVT-2026-005',
    title: 'CAT-III Dense Fog — Flights Diverted at IGI',
    category: 'fog',
    ...CITIES.delhi,
    severity: 'moderate',
    confidence: 76,
    lifecycle_status: 'declining',
    has_contradiction: false,
    independent_source_count: 3,
    detected_at: hoursAgo(10),
    last_updated_at: hoursAgo(1),
    evidence_summary: { citizen_reports: 41, social_posts: 112, sensor_corroborated: true, news_articles: 7 },
    media_urls: ['/images/fog/1.jpg', '/images/fog/2.jpg', '/images/fog/3.jpg', '/images/fog/4.jpg'],
  },
  {
    id: 'EVT-2026-006',
    title: 'Severe Dust Storm & Haboob — Thar Desert',
    category: 'dust storm',
    ...CITIES.jodhpur,
    severity: 'moderate',
    confidence: 88,
    lifecycle_status: 'active',
    has_contradiction: false,
    independent_source_count: 4,
    detected_at: hoursAgo(3),
    last_updated_at: minutesAgo(55),
    evidence_summary: { citizen_reports: 52, social_posts: 134, sensor_corroborated: true, news_articles: 6 },
    media_urls: ['/images/duststorms/1.jpg', '/images/duststorms/2.jpg', '/images/duststorms/3.jpg', '/images/duststorms/4.jpg', '/images/duststorms/5.jpg'],
  },
  {
    id: 'EVT-2026-007',
    title: 'Coastal Squall & High Velocity Gale Winds',
    category: 'strong wind',
    ...CITIES.vizag,
    severity: 'minor',
    confidence: 78,
    lifecycle_status: 'confirmed',
    has_contradiction: false,
    independent_source_count: 2,
    detected_at: hoursAgo(8),
    last_updated_at: hoursAgo(3),
    evidence_summary: { citizen_reports: 25, social_posts: 48, sensor_corroborated: true, news_articles: 3 },
    media_urls: ['/images/strong_wind/1.jpg'],
  },
  {
    id: 'EVT-2026-008',
    title: 'Continuous Torrential Rainfall — Kerala Coast',
    category: 'rainfall',
    ...CITIES.kochi,
    severity: 'minor',
    confidence: 85,
    lifecycle_status: 'active',
    has_contradiction: false,
    independent_source_count: 3,
    detected_at: hoursAgo(20),
    last_updated_at: minutesAgo(35),
    evidence_summary: { citizen_reports: 29, social_posts: 56, sensor_corroborated: true, news_articles: 3 },
    media_urls: ['/images/rain/2.jpg', '/images/rain/3.jpg'],
  },
  {
    id: 'EVT-2026-009',
    title: 'Flash Flood Risk — Doon Valley',
    category: 'flooding',
    ...CITIES.dehradun,
    severity: 'severe',
    confidence: 88,
    lifecycle_status: 'emerging',
    has_contradiction: false,
    independent_source_count: 4,
    detected_at: hoursAgo(4),
    last_updated_at: minutesAgo(18),
    evidence_summary: { citizen_reports: 38, social_posts: 92, sensor_corroborated: true, news_articles: 5 },
    media_urls: ['/images/flooding/3.jpg', '/images/flooding/4.jpg'],
  },
  {
    id: 'EVT-2026-010',
    title: 'Heatwave — Ahmedabad Urban Heat Island',
    category: 'heatwave',
    ...CITIES.ahmedabad,
    severity: 'moderate',
    confidence: 79,
    lifecycle_status: 'confirmed',
    has_contradiction: false,
    independent_source_count: 3,
    detected_at: hoursAgo(26),
    last_updated_at: hoursAgo(4),
    evidence_summary: { citizen_reports: 18, social_posts: 67, sensor_corroborated: true, news_articles: 4 },
    media_urls: ['/images/duststorms/3.jpg'],
  },
  {
    id: 'EVT-2026-011',
    title: 'Severe Kalbaishakhi Thunderstorm & Lightning — Kolkata',
    category: 'thunderstorm',
    ...CITIES.kolkata,
    severity: 'moderate',
    confidence: 86,
    lifecycle_status: 'active',
    has_contradiction: false,
    independent_source_count: 4,
    detected_at: hoursAgo(5),
    last_updated_at: minutesAgo(40),
    evidence_summary: { citizen_reports: 37, social_posts: 93, sensor_corroborated: true, news_articles: 5 },
    media_urls: ['/images/thunderstorm/1.jpg', '/images/thunderstorm/2.jpg'],
  },
  {
    id: 'EVT-2026-012',
    title: 'Heavy Rainfall — Goa Coastal Belt Resolved',
    category: 'rainfall',
    ...CITIES.panaji,
    severity: 'minor',
    confidence: 92,
    lifecycle_status: 'resolved',
    has_contradiction: false,
    independent_source_count: 4,
    detected_at: hoursAgo(48),
    last_updated_at: hoursAgo(6),
    evidence_summary: { citizen_reports: 45, social_posts: 120, sensor_corroborated: true, news_articles: 6 },
    media_urls: ['/images/rain/4.jpg'],
  },
  {
    id: 'EVT-2026-013',
    title: 'Gusty Cyclonic Winds — Bhopal Region',
    category: 'strong wind',
    ...CITIES.bhopal,
    severity: 'minor',
    confidence: 72,
    lifecycle_status: 'detected',
    has_contradiction: false,
    independent_source_count: 2,
    detected_at: hoursAgo(1),
    last_updated_at: minutesAgo(25),
    evidence_summary: { citizen_reports: 18, social_posts: 24, sensor_corroborated: true, news_articles: 1 },
    media_urls: ['/images/strong_wind/1.jpg'],
  },
  {
    id: 'EVT-2026-014',
    title: 'Urban Water Inundation — Chennai & Coastal TN',
    category: 'flooding',
    ...CITIES.chennai,
    severity: 'moderate',
    confidence: 89,
    lifecycle_status: 'emerging',
    has_contradiction: false,
    independent_source_count: 3,
    detected_at: hoursAgo(7),
    last_updated_at: minutesAgo(50),
    evidence_summary: { citizen_reports: 41, social_posts: 87, sensor_corroborated: true, news_articles: 4 },
    media_urls: ['/images/flooding/1.jpg', '/images/flooding/2.jpg'],
  },
] as WeatherEvent[]).map((evt) => ({
  ...evt,
  description: getSynthesizedIncidentDescription(evt),
}));

// ═══════════════════════════════════════════════════════
// Mock Reports (With Ground Truth Evidence Photos)
// ═══════════════════════════════════════════════════════

export const mockReports: Report[] = [
  // ── Mumbai Rainfall Cluster (EVT-001) ──
  { id: 'RPT-001', source_platform: 'citizen_app', source_handle: 'dev-abc123', raw_text: 'Water level has risen to knee height on main road near Dadar station. Vehicles stranded.', media_urls: ['/images/rain/1.jpg'], ...CITIES.mumbai, event_category: 'rainfall', category_confidence: 0.96, p_misleading: 0.05, duplicate_cluster_id: 'DUP-001', status: 'verified', reported_at: minutesAgo(45), ingested_at: minutesAgo(44), synced_late: false },
  { id: 'RPT-002', source_platform: 'twitter', source_handle: '@MumbaiRains', raw_text: 'Massive waterlogging near Dadar TT. Roads completely submerged. Stay home everyone! #MumbaiRains #Flooding', media_urls: ['/images/rain/2.jpg'], ...CITIES.mumbai, event_category: 'rainfall', category_confidence: 0.93, p_misleading: 0.08, duplicate_cluster_id: 'DUP-001', status: 'verified', reported_at: minutesAgo(42), ingested_at: minutesAgo(40), synced_late: false },
  { id: 'RPT-003', source_platform: 'news', source_handle: 'NDTV Mumbai Bureau', raw_text: 'IMD issues red alert for Mumbai as heavy rainfall continues. BMC deploys NDRF teams in low-lying areas of Dadar and Sion.', media_urls: ['/images/rain/3.jpg'], ...CITIES.mumbai, event_category: 'rainfall', category_confidence: 0.98, p_misleading: 0.03, duplicate_cluster_id: 'DUP-001', status: 'verified', reported_at: minutesAgo(38), ingested_at: minutesAgo(36), synced_late: false },
  { id: 'RPT-004', source_platform: 'citizen_app', source_handle: 'dev-lmn456', raw_text: 'Heavy rain in Andheri East. Metro station flooded. Trains running 30 min late.', media_urls: ['/images/rain/4.jpg'], ...CITIES.mumbai, event_category: 'rainfall', category_confidence: 0.91, p_misleading: 0.07, duplicate_cluster_id: null, status: 'pending', reported_at: minutesAgo(30), ingested_at: minutesAgo(28), synced_late: false },
  { id: 'RPT-005', source_platform: 'youtube', source_handle: 'MumbaiUpdatesLive', raw_text: 'LIVE: Mumbai streets turn into rivers! Shocking visuals from Hindmata junction showing complete submergence.', media_urls: ['/images/rain/1.jpg'], ...CITIES.mumbai, event_category: 'flooding', category_confidence: 0.88, p_misleading: 0.12, duplicate_cluster_id: null, status: 'pending', reported_at: minutesAgo(25), ingested_at: minutesAgo(22), synced_late: false },

  // ── Surat & Chennai Flooding Cluster (EVT-003) ──
  { id: 'RPT-006', source_platform: 'citizen_app', source_handle: 'dev-qrs789', raw_text: 'Ring Road & Rander in Surat completely inundated after heavy discharge. Water entering ground floor buildings.', media_urls: ['/images/flooding/1.jpg'], ...CITIES.surat, event_category: 'flooding', category_confidence: 0.95, p_misleading: 0.04, duplicate_cluster_id: 'DUP-002', status: 'verified', reported_at: minutesAgo(55), ingested_at: minutesAgo(53), synced_late: false },
  { id: 'RPT-007', source_platform: 'twitter', source_handle: '@SuratUpdates', raw_text: 'Tapi river water level near danger mark. Causeway submerged. Commuters take alternate flyover routes. #SuratFloods', media_urls: ['/images/flooding/2.jpg'], ...CITIES.surat, event_category: 'flooding', category_confidence: 0.92, p_misleading: 0.06, duplicate_cluster_id: 'DUP-002', status: 'verified', reported_at: minutesAgo(50), ingested_at: minutesAgo(48), synced_late: false },
  { id: 'RPT-008', source_platform: 'news', source_handle: 'Gujarat Samachar Surat', raw_text: 'SMC deploys heavy-duty dewatering pumps across Katargam and Varachha low-lying residential sectors.', media_urls: ['/images/flooding/3.jpg'], ...CITIES.surat, event_category: 'flooding', category_confidence: 0.97, p_misleading: 0.02, duplicate_cluster_id: 'DUP-002', status: 'verified', reported_at: minutesAgo(47), ingested_at: minutesAgo(45), synced_late: false },
  { id: 'RPT-009', source_platform: 'citizen_app', source_handle: 'dev-tuv101', raw_text: 'Adajan Gam area waterlogged. Water reaching car wheel hubs. Emergency evacuation requested for lower floor.', media_urls: ['/images/flooding/4.jpg'], ...CITIES.surat, event_category: 'flooding', category_confidence: 0.94, p_misleading: 0.05, duplicate_cluster_id: null, status: 'pending', reported_at: minutesAgo(35), ingested_at: minutesAgo(33), synced_late: false },

  // ── Jaipur & Kolkata Thunderstorm (EVT-002 / EVT-011) ──
  { id: 'RPT-010', source_platform: 'citizen_app', source_handle: 'dev-wxy202', raw_text: 'Lightning struck a tree near Central Park, Jaipur. Hailstones the size of marbles falling. Power cut.', media_urls: ['/images/thunderstorm/1.jpg'], ...CITIES.jaipur, event_category: 'thunderstorm', category_confidence: 0.90, p_misleading: 0.09, duplicate_cluster_id: 'DUP-003', status: 'verified', reported_at: minutesAgo(60), ingested_at: minutesAgo(58), synced_late: false },
  { id: 'RPT-011', source_platform: 'twitter', source_handle: '@JaipurAlert', raw_text: 'Massive hailstorm in Jaipur right now! Intense lightning strikes across the skyline. #JaipurThunderstorm', media_urls: ['/images/thunderstorm/2.jpg'], ...CITIES.jaipur, event_category: 'thunderstorm', category_confidence: 0.89, p_misleading: 0.11, duplicate_cluster_id: 'DUP-003', status: 'verified', reported_at: minutesAgo(57), ingested_at: minutesAgo(55), synced_late: false },
  { id: 'RPT-012', source_platform: 'imd_official', source_handle: 'IMD Jaipur AWS', raw_text: 'AWS Station JP-042: Convective activity detected. Wind gust 68 kmph. Hail size 15mm. CB tops at 14km.', media_urls: ['/images/thunderstorm/1.jpg'], ...CITIES.jaipur, event_category: 'thunderstorm', category_confidence: 0.99, p_misleading: 0.01, duplicate_cluster_id: 'DUP-003', status: 'verified', reported_at: minutesAgo(62), ingested_at: minutesAgo(61), synced_late: false },

  // ── Jodhpur / Rajasthan Dust Storm (EVT-006) ──
  { id: 'RPT-028', source_platform: 'citizen_app', source_handle: 'dev-nop808', raw_text: 'Intense dust storm (Andhi) rolling over Jodhpur bypass. Visibility dropped below 15 meters within 2 minutes. Heavy dust wall.', media_urls: ['/images/duststorms/1.jpg'], ...CITIES.jodhpur, event_category: 'dust storm', category_confidence: 0.95, p_misleading: 0.04, duplicate_cluster_id: null, status: 'pending', reported_at: hoursAgo(2), ingested_at: minutesAgo(105), synced_late: true },
  { id: 'RPT-041', source_platform: 'twitter', source_handle: '@MarwarWeather', raw_text: 'Huge dust wall approaching Thar desert highway. Severe sand blowing. Motorists advised to stop vehicle immediately! #DustStorm', media_urls: ['/images/duststorms/2.jpg'], ...CITIES.jodhpur, event_category: 'dust storm', category_confidence: 0.93, p_misleading: 0.06, duplicate_cluster_id: null, status: 'verified', reported_at: minutesAgo(80), ingested_at: minutesAgo(78), synced_late: false },
  { id: 'RPT-042', source_platform: 'citizen_app', source_handle: 'dev-jod404', raw_text: 'Dust storm engulfing residential quarters near Mandore. High winds carrying fine sand particles.', media_urls: ['/images/duststorms/3.jpg'], ...CITIES.jodhpur, event_category: 'dust storm', category_confidence: 0.91, p_misleading: 0.05, duplicate_cluster_id: null, status: 'verified', reported_at: minutesAgo(50), ingested_at: minutesAgo(48), synced_late: false },
  { id: 'RPT-043', source_platform: 'news', source_handle: 'Rajasthan Patrika', raw_text: 'जोधपुर और जैसलमेर में भीषण आंधी। आसमान में छाई धूल की चादर, दृश्यता शून्य के करीब।', media_urls: ['/images/duststorms/4.jpg'], ...CITIES.jodhpur, event_category: 'dust storm', category_confidence: 0.96, p_misleading: 0.02, duplicate_cluster_id: null, status: 'verified', reported_at: minutesAgo(40), ingested_at: minutesAgo(38), synced_late: false },
  { id: 'RPT-044', source_platform: 'citizen_app', source_handle: 'dev-desert99', raw_text: 'Massive dust haboob on highway connecting Bikaner and Jodhpur. Traffic at complete standstill.', media_urls: ['/images/duststorms/5.jpg'], ...CITIES.jodhpur, event_category: 'dust storm', category_confidence: 0.94, p_misleading: 0.07, duplicate_cluster_id: null, status: 'pending', reported_at: minutesAgo(20), ingested_at: minutesAgo(18), synced_late: false },

  // ── Delhi NCR Dense Fog (EVT-005) ──
  { id: 'RPT-016', source_platform: 'citizen_app', source_handle: 'dev-cde404', raw_text: 'Very dense radiation fog on NH-44 near Delhi-NCR border. Visibility under 20 meters. Severe hazard.', media_urls: ['/images/fog/1.jpg'], ...CITIES.delhi, event_category: 'fog', category_confidence: 0.95, p_misleading: 0.04, duplicate_cluster_id: null, status: 'verified', reported_at: hoursAgo(8), ingested_at: hoursAgo(8), synced_late: false },
  { id: 'RPT-017', source_platform: 'twitter', source_handle: '@DelhiAirport', raw_text: 'CAT-III Low visibility operations in progress at IGI Airport Runway 28. Fog blanket across terminals. #DelhiFog', media_urls: ['/images/fog/2.jpg'], ...CITIES.delhi, event_category: 'fog', category_confidence: 0.96, p_misleading: 0.03, duplicate_cluster_id: null, status: 'verified', reported_at: hoursAgo(7), ingested_at: hoursAgo(7), synced_late: false },
  { id: 'RPT-045', source_platform: 'citizen_app', source_handle: 'dev-noida12', raw_text: 'Zero visibility on Noida Greater Noida Expressway due to dense morning fog layer.', media_urls: ['/images/fog/3.jpg'], ...CITIES.delhi, event_category: 'fog', category_confidence: 0.92, p_misleading: 0.05, duplicate_cluster_id: null, status: 'pending', reported_at: hoursAgo(4), ingested_at: hoursAgo(4), synced_late: false },
  { id: 'RPT-046', source_platform: 'news', source_handle: 'Times of India Delhi', raw_text: 'Thick fog envelopes Delhi-NCR; vehicular movement slows on major arterial corridors.', media_urls: ['/images/fog/4.jpg'], ...CITIES.delhi, event_category: 'fog', category_confidence: 0.97, p_misleading: 0.02, duplicate_cluster_id: null, status: 'verified', reported_at: hoursAgo(3), ingested_at: hoursAgo(3), synced_late: false },

  // ── Visakhapatnam Strong Winds (EVT-007) ──
  { id: 'RPT-029', source_platform: 'citizen_app', source_handle: 'dev-qrs909', raw_text: 'Severe coastal squall and gale winds exceeding 75 km/h uprooting trees near RK Beach and Visakhapatnam port.', media_urls: ['/images/strong_wind/1.jpg'], ...CITIES.vizag, event_category: 'strong wind', category_confidence: 0.93, p_misleading: 0.05, duplicate_cluster_id: null, status: 'pending', reported_at: hoursAgo(5), ingested_at: hoursAgo(4), synced_late: true },
  { id: 'RPT-032', source_platform: 'citizen_app', source_handle: 'dev-vwx111', raw_text: 'Sudden gusty winds in Bhopal MP Nagar area. Signboards flying. One billboard fell on road.', media_urls: ['/images/strong_wind/1.jpg'], ...CITIES.bhopal, event_category: 'strong wind', category_confidence: 0.82, p_misleading: 0.16, duplicate_cluster_id: null, status: 'pending', reported_at: minutesAgo(40), ingested_at: minutesAgo(38), synced_late: false },

  // ── Kolkata Nor'wester Thunderstorm (EVT-011) ──
  { id: 'RPT-023', source_platform: 'citizen_app', source_handle: 'dev-klm707', raw_text: 'Nor\'wester hitting Kolkata now! Trees uprooted in Salt Lake. Severe lightning across the sky.', media_urls: ['/images/thunderstorm/1.jpg'], ...CITIES.kolkata, event_category: 'thunderstorm', category_confidence: 0.91, p_misleading: 0.08, duplicate_cluster_id: null, status: 'pending', reported_at: minutesAgo(70), ingested_at: minutesAgo(68), synced_late: false },
  { id: 'RPT-024', source_platform: 'news', source_handle: 'ABP Ananda', raw_text: 'কলকাতায় কালবৈশাখী ঝড় ও বজ্রপাত. বিদ্যুৎ বিভ্রাট. IMD রেড অ্যালার্ট जारी.', media_urls: ['/images/thunderstorm/2.jpg'], ...CITIES.kolkata, event_category: 'thunderstorm', category_confidence: 0.93, p_misleading: 0.04, duplicate_cluster_id: null, status: 'verified', reported_at: minutesAgo(65), ingested_at: minutesAgo(63), synced_late: false },

  // ── Suspicious / Misleading Reports ──
  { id: 'RPT-025', source_platform: 'twitter', source_handle: '@FakeWeatherBot', raw_text: 'BREAKING: Category 5 cyclone to hit Mumbai in 2 hours! Evacuate immediately!! Share this to save lives!! 🌀🌀🌀', media_urls: ['/images/strong_wind/1.jpg'], ...CITIES.mumbai, event_category: 'strong wind', category_confidence: 0.45, p_misleading: 0.92, duplicate_cluster_id: null, status: 'rejected', reported_at: minutesAgo(20), ingested_at: minutesAgo(18), synced_late: false },
  { id: 'RPT-026', source_platform: 'twitter', source_handle: '@panic_poster99', raw_text: 'Delhi completely under water!! Worst flood in history!! Government hiding truth!! #DelhiFloods #WakeUp', media_urls: ['/images/flooding/1.jpg'], ...CITIES.delhi, event_category: 'flooding', category_confidence: 0.52, p_misleading: 0.88, duplicate_cluster_id: null, status: 'rejected', reported_at: minutesAgo(15), ingested_at: minutesAgo(13), synced_late: false },
];

// ═══════════════════════════════════════════════════════
// Duplicate Clusters (NLP similarity matches)
// ═══════════════════════════════════════════════════════

export const mockDuplicateClusters: DuplicateCluster[] = [
  {
    id: 'DUP-001',
    location_name: 'Dadar, Mumbai',
    similarity_score: 0.94,
    reports: mockReports.filter((r) => r.duplicate_cluster_id === 'DUP-001'),
  },
  {
    id: 'DUP-002',
    location_name: 'T. Nagar / Adyar, Chennai',
    similarity_score: 0.91,
    reports: mockReports.filter((r) => r.duplicate_cluster_id === 'DUP-002'),
  },
  {
    id: 'DUP-003',
    location_name: 'Central Jaipur',
    similarity_score: 0.88,
    reports: mockReports.filter((r) => r.duplicate_cluster_id === 'DUP-003'),
  },
];

// ═══════════════════════════════════════════════════════
// Category & Severity Display Metadata
// (Reusable config for UI rendering)
// ═══════════════════════════════════════════════════════

export const CATEGORY_META: Record<WeatherCategory, { icon: string; color: string; bgColor: string; label_en: string; label_hi: string }> = {
  rainfall:       { icon: 'CloudRain',       color: '#3b82f6', bgColor: '#eff6ff',  label_en: 'Rainfall',      label_hi: 'वर्षा' },
  thunderstorm:   { icon: 'CloudLightning',  color: '#8b5cf6', bgColor: '#f5f3ff',  label_en: 'Thunderstorm',  label_hi: 'तड़ित झंझा' },
  flooding:       { icon: 'Waves',           color: '#0891b2', bgColor: '#ecfeff',  label_en: 'Flooding',      label_hi: 'बाढ़' },
  heatwave:       { icon: 'Thermometer',     color: '#f97316', bgColor: '#fff7ed',  label_en: 'Heatwave',      label_hi: 'लू' },
  fog:            { icon: 'CloudFog',        color: '#6b7280', bgColor: '#f9fafb',  label_en: 'Fog',           label_hi: 'कोहरा' },
  'dust storm':   { icon: 'Wind',            color: '#d97706', bgColor: '#fffbeb',  label_en: 'Dust Storm',    label_hi: 'धूल भरी आंधी' },
  'strong wind':  { icon: 'Wind',            color: '#0d9488', bgColor: '#f0fdfa',  label_en: 'Strong Wind',   label_hi: 'तेज़ हवा' },
};

export const SEVERITY_META: Record<Severity, { label: string; className: string; icon: string; color: string }> = {
  minor:    { label: 'Minor',    className: 'badge-severity-minor',    icon: '●', color: '#10b981' },
  moderate: { label: 'Moderate', className: 'badge-severity-moderate', icon: '▲', color: '#0284c7' },
  severe:   { label: 'Severe',   className: 'badge-severity-severe',   icon: '◆', color: '#ef4444' },
};

export const LIFECYCLE_META: Record<LifecycleStatus, { color: string; bgColor: string }> = {
  detected:  { color: '#8b5cf6', bgColor: '#f5f3ff' },
  emerging:  { color: '#f59e0b', bgColor: '#fffbeb' },
  confirmed: { color: '#3b82f6', bgColor: '#eff6ff' },
  active:    { color: '#ef4444', bgColor: '#fef2f2' },
  declining: { color: '#f97316', bgColor: '#fff7ed' },
  resolved:  { color: '#10b981', bgColor: '#ecfdf5' },
};

export const SOURCE_META: Record<SourcePlatform, { label: string; reliability: number; color: string }> = {
  imd_official: { label: 'IMD Sensor Network', reliability: 99, color: '#10b981' },
  citizen_app:  { label: 'Citizen Reports',    reliability: 92, color: '#3b82f6' },
  news:         { label: 'News RSS Feeds',     reliability: 88, color: '#f59e0b' },
  twitter:      { label: 'Social Media (X)',   reliability: 74, color: '#8b5cf6' },
  youtube:      { label: 'YouTube',            reliability: 62, color: '#ef4444' },
};
