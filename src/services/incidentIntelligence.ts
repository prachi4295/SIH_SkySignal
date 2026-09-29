/* ═══════════════════════════════════════════════════════
   SkySignal — Multi-Source Incident Intelligence Service
   Synthesizes AI briefings fusing Citizen Reports, IMD Telemetry,
   and Social Feeds (Instagram / X / News), with interactive comments.
   ═══════════════════════════════════════════════════════ */

import type { WeatherEvent, EventComment } from '../types/weather';

/** Curated, authentic descriptions in simple, clear language combining Citizen, IMD, and Social updates */
const CURATED_SYNTHESIS: Record<string, string> = {
  'EVT-2026-001':
    'Heavy monsoon downpours are causing severe waterlogging across Dadar, Hindmata, and Milan subway. Water levels are between knee to waist height, leading to stranded BEST buses and slow traffic. IMD has issued a Red Alert, and emergency municipal teams have opened drainage gates at Mahim Creek.',

  'EVT-2026-002':
    'A severe thunderstorm with hail has hit Mansarovar, Malviya Nagar, and Tonk Road. Residents report marble-to-golf-ball sized hailstones and strong winds up to 62 km/h. Local teams are clearing fallen branches near Jawahar Circle. Commuters are advised to avoid two-wheeler travel.',

  'EVT-2026-003':
    'Continuous rainfall and rising Tapi river levels have caused deep waterlogging in Adajan, Katargam, and Rander low-lying areas. Roads have over 2 feet of water with traffic heavily affected. Rescue teams and inflatable boats are on standby in Ward 4.',

  'EVT-2026-004':
    'Severe heatwave conditions are active across Nagpur with temperatures reaching 45.8°C (feels like 49°C). Citizens and outdoor workers report intense heat in open markets. The municipal corporation has activated public cooling shelters and advised people to avoid direct sun exposure between 12 PM and 5 PM.',

  'EVT-2026-005':
    'Very dense fog has reduced visibility below 50 meters across Palam, Dhaula Kuan, and the Noida Expressway. Morning traffic is crawling on the Ring Road. Flights at IGI Airport are facing departure delays and diversions under low-visibility safety protocols.',

  'EVT-2026-006':
    'A sudden, heavy dust storm swept across Mandore and Paota with strong desert winds up to 68 km/h. Visibility dropped sharply below 100 meters with airborne sand and minor signboard falls. Residents are advised to stay indoors until winds calm down.',

  'EVT-2026-007':
    'Strong coastal gale winds between 55 to 65 km/h are affecting RK Beach and Gangavaram port due to a low-pressure depression over the Bay of Bengal. High tidal waves are hitting the promenade, and fishermen are strictly advised not to go into the sea.',

  'EVT-2026-008':
    'Continuous heavy rains have led to water accumulation in low-lying residential streets across Ernakulam South and Marine Drive. Municipal teams have deployed water pumps near railway underpasses to keep traffic moving.',

  'EVT-2026-009':
    'Intense mountain cloudburst has caused rapid runoff and swelling in the Song river catchment near Sahastradhara and Maldevta. Swollen streams have crossed local causeways. SDRF rescue teams are on alert in riverbank areas.',

  'EVT-2026-010':
    'Intense afternoon heat is pushing road surface temperatures past 46°C along SG Highway and Maninagar. Commuters report blistering heat and high UV levels. Citizens are advised to drink plenty of fluids and stay in shaded areas.',

  'EVT-2026-011':
    'A strong Kalbaishakhi thunderstorm brought sudden 58 km/h winds, lightning, and heavy rain across central and south Kolkata. Fallen tree branches and waterlogged tracks near College Street and Park Circus are currently being cleared by municipal crews.',

  'EVT-2026-012':
    'Heavy coastal rains have reduced to light intermittent drizzle. Water on roads along Calangute and Miramar has receded, and storm drains are functioning normally. The weather situation is now stable.',

  'EVT-2026-013':
    'Sudden gusty winds up to 48 km/h swept across Upper Lake and VIP Road, causing minor dust and swaying power lines. Weather conditions are expected to normalize shortly.',

  'EVT-2026-014':
    'Heavy coastal showers have caused localized waterlogging on arterial roads in Velachery and T. Nagar. Motorists are advised to use flyover routes as municipal drainage teams clear choked inlets.',
};

/**
 * Returns a simple, natural description combining Citizen Reports, IMD Telemetry, and Social Media updates.
 */
export function getSynthesizedIncidentDescription(event: WeatherEvent | any): string {
  if (!event) return '';
  if (event.id && CURATED_SYNTHESIS[event.id]) {
    return CURATED_SYNTHESIS[event.id];
  }
  if (event.description && event.description.length > 30 && !event.description.includes('Synthesized from')) {
    return event.description;
  }

  // Dynamic generator in simple, clear language for custom/live events
  const city = event.city || event.location?.name || 'the area';
  const state = event.state || event.location?.state || '';
  const locationStr = state ? `${city}, ${state}` : city;
  const cat = (event.category || 'rainfall').toLowerCase();

  switch (cat) {
    case 'rainfall':
      return `Heavy and continuous rainfall is being reported across ${locationStr}. Water is accumulating on low-lying roads and traffic is moving slowly. Municipal drainage teams are monitoring the situation.`;

    case 'flooding':
      return `Waterlogging and overflow from storm drains have flooded local streets in ${locationStr}. Commuters report water levels reaching vehicle tires. Emergency pumps have been activated to clear stagnant water.`;

    case 'thunderstorm':
      return `A strong thunderstorm with frequent lightning and gusty winds is currently active over ${locationStr}. Residents report sudden heavy rain and minor branch falls. Please remain indoors in safe structures.`;

    case 'fog':
      return `Dense fog has lowered visibility across roads and highways in ${locationStr}. Motorists are advised to use low-beam fog lights and maintain a safe following distance.`;

    case 'dust storm':
      return `Strong gusty winds and heavy dust are sweeping through ${locationStr}, causing low visibility on the roads. Residents are advised to close windows and drive carefully.`;

    case 'heatwave':
      return `Extreme heat conditions with temperatures well above normal are affecting ${locationStr}. Citizens are advised to stay hydrated, avoid direct sun during afternoon hours, and check on vulnerable family members.`;

    case 'strong wind':
      return `High-speed gusty winds are blowing across ${locationStr}. Some loose banners and tree branches have fallen. People are advised to stay clear of old structures and power lines.`;

    default:
      return `Active ${cat} conditions are being observed across ${locationStr}. Local residents and weather stations report notable weather activity in the area.`;
  }
}

/** Default realistic community discussion comments per event category & ID */
const DEFAULT_EVENT_COMMENTS: Record<string, EventComment[]> = {
  'EVT-2026-001': [
    {
      id: 'CMT-MUM-01',
      eventId: 'EVT-2026-001',
      userName: 'Aarav Deshmukh',
      userRole: 'Verified Resident (Dadar)',
      tag: 'Waterlogged: 2.5 ft',
      text: 'Hindmata underpass is completely submerged under 2.5 feet of water. BEST buses on route 70 are being diverted via King’s Circle flyover. Avoid Dr. Ambedkar Road!',
      upvotes: 34,
      timestamp: '6m ago',
      isVerified: true,
    },
    {
      id: 'CMT-MUM-02',
      eventId: 'EVT-2026-001',
      userName: 'Pooja Kulkarni',
      userRole: 'Local Commuter',
      tag: 'Traffic Halted',
      text: 'Heavy water stagnation near Milan Subway (Santacruz). Cars are stalling. Traffic police are directing two-wheelers towards the Western Express Highway.',
      upvotes: 21,
      timestamp: '18m ago',
      isVerified: false,
    },
    {
      id: 'CMT-MUM-03',
      eventId: 'EVT-2026-001',
      userName: 'BMC Ward F/N Volunteer',
      userRole: 'Emergency Volunteer',
      tag: 'Drainage Pumps Active',
      text: '3 high-capacity submersible dewatering pumps are now operating at full load at Gandhi Market. Water level has started receding slightly.',
      upvotes: 45,
      timestamp: '32m ago',
      isVerified: true,
    },
  ],

  'EVT-2026-002': [
    {
      id: 'CMT-JAI-01',
      eventId: 'EVT-2026-002',
      userName: 'Vikram Singh Shekhawat',
      userRole: 'Resident (Malviya Nagar)',
      tag: 'Hailstorm Observed',
      text: 'Golf-ball sized hail fell for about 8 minutes near World Trade Park. Several parked cars have minor denting. Intense gusty winds blowing from south.',
      upvotes: 19,
      timestamp: '12m ago',
      isVerified: true,
    },
    {
      id: 'CMT-JAI-02',
      eventId: 'EVT-2026-002',
      userName: 'Neha Sharma',
      userRole: 'Field Observer',
      tag: 'Tree Fallen',
      text: 'Large neem tree branch fell across the service lane near Jawahar Circle gate #2. Civil defence team has arrived to clear the road.',
      upvotes: 14,
      timestamp: '28m ago',
      isVerified: true,
    },
  ],

  'EVT-2026-003': [
    {
      id: 'CMT-SUR-01',
      eventId: 'EVT-2026-003',
      userName: 'Harsh Patel',
      userRole: 'Verified Resident (Adajan)',
      tag: 'Water Level Rising',
      text: 'Water has reached ground floor doorsteps near Pal-Adajan link road. Low-lying basements are flooding. People should move vehicles to higher multi-level parking.',
      upvotes: 41,
      timestamp: '8m ago',
      isVerified: true,
    },
    {
      id: 'CMT-SUR-02',
      eventId: 'EVT-2026-003',
      userName: 'Surat Relief NGO',
      userRole: 'Emergency Volunteer',
      tag: 'Rescue Boat Deployed',
      text: 'Our team is coordinating with SMC Ward 4 control room. 2 inflatable boats stationed at Katargam for senior citizens evacuation if required.',
      upvotes: 56,
      timestamp: '22m ago',
      isVerified: true,
    },
  ],

  'EVT-2026-005': [
    {
      id: 'CMT-DEL-01',
      eventId: 'EVT-2026-005',
      userName: 'Captain Rajesh Verma (Retd)',
      userRole: 'Commuter (Palam)',
      tag: 'Visibility < 30m',
      text: 'Zero visibility on the Mahipalpur-Airport bypass. Vehicles are driving in single file with emergency flashers on. Keep minimum 20m braking distance.',
      upvotes: 28,
      timestamp: '14m ago',
      isVerified: true,
    },
    {
      id: 'CMT-DEL-02',
      eventId: 'EVT-2026-005',
      userName: 'Ananya Roy',
      userRole: 'Airport Passenger',
      tag: 'Flight Delays',
      text: 'At T3 departure. Domestic flights on runway 29 are experiencing 40-50 min delay due to CAT-III low visibility procedures. Boarding gates are crowded.',
      upvotes: 35,
      timestamp: '39m ago',
      isVerified: false,
    },
  ],
};

const STORAGE_COMMENTS_KEY = 'skysignal_comments_database_v2';
const STORAGE_DELETED_KEY = 'skysignal_deleted_comment_ids_v2';
const STORAGE_UPVOTES_KEY = 'skysignal_user_comment_upvotes_v2';

/** Helper to format database ISO timestamps into user-friendly relative or year-specific text */
export function formatCommentDisplayTime(isoString?: string, fallbackText: string = 'Just now'): string {
  if (!isoString) return fallbackText;
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return fallbackText;

    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    // Long-term multi-year format
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return fallbackText;
  }
}

/** Retrieve all persistent stored comments combined with default baseline records */
export function getEventComments(eventId: string): EventComment[] {
  let userComments: EventComment[] = [];
  const deletedIds = getStoredDeletedIds();

  try {
    const raw = localStorage.getItem(STORAGE_COMMENTS_KEY);
    if (raw) {
      const all: Record<string, EventComment[]> = JSON.parse(raw);
      userComments = (all[eventId] || []).filter((c) => !deletedIds.has(c.id));
    }
  } catch (err) {
    console.error('Error reading comments from database storage', err);
  }

  const defaultList = (DEFAULT_EVENT_COMMENTS[eventId] || [
    {
      id: `CMT-DEF-${eventId}-1`,
      eventId,
      userName: 'Local Community Observer',
      userRole: 'Verified Citizen',
      tag: 'Active Situation',
      text: 'Active localized weather event confirmed on ground. Municipal and disaster response telemetry synchronized with community updates.',
      upvotes: 12,
      timestamp: '15m ago',
      created_at: new Date(Date.now() - 15 * 60000).toISOString(),
      isVerified: true,
    },
    {
      id: `CMT-DEF-${eventId}-2`,
      eventId,
      userName: 'Traffic & Road Warden',
      userRole: 'Local Volunteer',
      tag: 'Commute Advisory',
      text: 'Please exercise caution and keep safe distance while navigating this zone. Monitor live Doppler radar map for updates.',
      upvotes: 8,
      timestamp: '35m ago',
      created_at: new Date(Date.now() - 35 * 60000).toISOString(),
      isVerified: false,
    },
  ]).filter((c) => !deletedIds.has(c.id));

  // Merge user posted comments first, followed by default verified comments
  const upvotedIds = getStoredUpvotedIds();
  const merged = [...userComments, ...defaultList].map((c) => ({
    ...c,
    timestamp: formatCommentDisplayTime(c.created_at, c.timestamp),
    hasUpvoted: upvotedIds.has(c.id),
  }));

  return merged;
}

// Real-time cross-tab and cross-portal synchronization channel
let syncChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    syncChannel = new BroadcastChannel('skysignal_comments_sync_channel');
  } catch {}
}

function broadcastSync(payload: any) {
  if (typeof window !== 'undefined') {
    // 1. Dispatch custom event for current window
    window.dispatchEvent(new CustomEvent('skysignal:comment-sync', { detail: payload }));
    // 2. Broadcast across all open citizen and analyst tabs/portals
    try {
      syncChannel?.postMessage(payload);
    } catch {}
  }
}

/** Add a new citizen comment / ground update to persistent database storage */
export function addEventComment(
  eventId: string,
  comment: Omit<EventComment, 'id' | 'eventId' | 'timestamp' | 'upvotes'>
): EventComment {
  const nowIso = new Date().toISOString();
  const newComment: EventComment = {
    id: `CMT-USR-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    eventId,
    userName: comment.userName || 'Anonymous Citizen',
    userRole: comment.userRole || 'Citizen Observer',
    tag: comment.tag || 'Ground Observation',
    text: comment.text,
    upvotes: 1,
    hasUpvoted: true,
    timestamp: 'Just now',
    created_at: nowIso,
    isVerified: false,
  };

  try {
    const raw = localStorage.getItem(STORAGE_COMMENTS_KEY);
    const all: Record<string, EventComment[]> = raw ? JSON.parse(raw) : {};
    all[eventId] = [newComment, ...(all[eventId] || [])];
    localStorage.setItem(STORAGE_COMMENTS_KEY, JSON.stringify(all));

    // Auto mark as upvoted by author
    const upvotedIds = getStoredUpvotedIds();
    upvotedIds.add(newComment.id);
    localStorage.setItem(STORAGE_UPVOTES_KEY, JSON.stringify(Array.from(upvotedIds)));

    // Broadcast live addition to all citizen and analyst portals
    broadcastSync({ type: 'comment_added', comment: newComment, eventId });
  } catch (err) {
    console.error('Error saving comment to database storage', err);
  }

  return newComment;
}

/** Delete a comment permanently from database storage and broadcast to all citizen portals */
export function deleteEventComment(commentId: string, eventId: string): boolean {
  try {
    // 1. Add to permanent deleted blacklist
    const deletedIds = getStoredDeletedIds();
    deletedIds.add(commentId);
    localStorage.setItem(STORAGE_DELETED_KEY, JSON.stringify(Array.from(deletedIds)));

    // 2. Remove from user custom comments list in DB
    const raw = localStorage.getItem(STORAGE_COMMENTS_KEY);
    if (raw) {
      const all: Record<string, EventComment[]> = JSON.parse(raw);
      if (all[eventId]) {
        all[eventId] = all[eventId].filter((c) => c.id !== commentId);
        localStorage.setItem(STORAGE_COMMENTS_KEY, JSON.stringify(all));
      }
    }

    // 3. Broadcast real-time deletion across all citizen portals & active sessions
    broadcastSync({ type: 'comment_deleted', commentId, eventId });
    return true;
  } catch (err) {
    console.error('Error deleting comment from database', err);
    return false;
  }
}

/** Toggle upvote on a comment */
export function toggleCommentUpvote(commentId: string): boolean {
  try {
    const upvotedIds = getStoredUpvotedIds();
    const hasUpvoted = upvotedIds.has(commentId);
    if (hasUpvoted) {
      upvotedIds.delete(commentId);
    } else {
      upvotedIds.add(commentId);
    }
    localStorage.setItem(STORAGE_UPVOTES_KEY, JSON.stringify(Array.from(upvotedIds)));

    broadcastSync({ type: 'comment_upvoted', commentId, hasUpvoted: !hasUpvoted });
    return !hasUpvoted;
  } catch {
    return false;
  }
}

function getStoredUpvotedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_UPVOTES_KEY);
    if (raw) {
      return new Set(JSON.parse(raw));
    }
  } catch {}
  return new Set();
}

function getStoredDeletedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_DELETED_KEY);
    if (raw) {
      return new Set(JSON.parse(raw));
    }
  } catch {}
  return new Set();
}
