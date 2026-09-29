/* ═══════════════════════════════════════════════════════
   SkySignal — Weather Event Deduplication & Spatial Fusion Engine
   Automatically groups duplicate / redundant event alerts for the same
   hazard category and geographical locality into unified canonical events.
   ═══════════════════════════════════════════════════════ */

import type { WeatherEvent, Severity } from '../types/weather';

const SEVERITY_RANKS: Record<Severity, number> = {
  minor: 1,
  moderate: 2,
  severe: 3,
};

/**
 * Calculates Haversine distance in kilometers between two GPS coordinates
 */
function getGeoDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Deduplicates and fuses multiple weather events.
 * Two events are considered duplicates if:
 * 1. They belong to the same hazard category, AND
 * 2. They match the same city name OR are within a 40km spatial radius.
 */
export function deduplicateWeatherEvents(rawEvents: WeatherEvent[]): WeatherEvent[] {
  if (!rawEvents || rawEvents.length === 0) return [];

  const canonicalList: WeatherEvent[] = [];

  for (const incoming of rawEvents) {
    // Find if an existing canonical event matches this incoming event
    const existingIndex = canonicalList.findIndex((canon) => {
      // Must be same category
      if (canon.category.toLowerCase() !== incoming.category.toLowerCase()) {
        return false;
      }

      // Check same city
      const canonCity = (canon.city || '').toLowerCase().trim();
      const incomingCity = (incoming.city || '').toLowerCase().trim();
      if (canonCity && incomingCity && canonCity === incomingCity) {
        return true;
      }

      // Check geographical proximity (< 40 km)
      if (canon.lat && canon.lon && incoming.lat && incoming.lon) {
        const dist = getGeoDistanceKm(canon.lat, canon.lon, incoming.lat, incoming.lon);
        if (dist <= 40) {
          return true;
        }
      }

      return false;
    });

    if (existingIndex === -1) {
      // New distinct event
      canonicalList.push({ ...incoming });
    } else {
      // Fuse duplicate with existing canonical event
      const target = canonicalList[existingIndex];

      // 1. Choose highest severity
      const targetSevRank = SEVERITY_RANKS[target.severity] || 1;
      const incomingSevRank = SEVERITY_RANKS[incoming.severity] || 1;
      const fusedSeverity = incomingSevRank > targetSevRank ? incoming.severity : target.severity;

      // 2. Highest confidence
      const fusedConfidence = Math.max(target.confidence, incoming.confidence);

      // 3. Increment/aggregate corroborating source streams
      const targetSources = target.independent_source_count || 1;
      const incomingSources = incoming.independent_source_count || 1;
      const fusedSources = Math.min(8, Math.max(targetSources, incomingSources) + 1);

      // 4. Merge media evidence without duplicate URLs
      const targetMedia = target.media_urls || [];
      const incomingMedia = incoming.media_urls || [];
      const fusedMedia = Array.from(new Set([...targetMedia, ...incomingMedia]));

      // 5. Prefer richer / more descriptive title
      const isIncomingTitleBetter =
        !incoming.title.startsWith('New ') && target.title.startsWith('New ');
      const fusedTitle = isIncomingTitleBetter ? incoming.title : target.title;

      // 6. Aggregate evidence summary counts
      const targetSummary = target.evidence_summary || { citizen_reports: 1, social_posts: 1, sensor_corroborated: true, news_articles: 1 };
      const incomingSummary = incoming.evidence_summary || { citizen_reports: 1, social_posts: 1, sensor_corroborated: true, news_articles: 1 };
      const fusedSummary = {
        citizen_reports: (targetSummary.citizen_reports || 0) + (incomingSummary.citizen_reports || 0),
        social_posts: (targetSummary.social_posts || 0) + (incomingSummary.social_posts || 0),
        sensor_corroborated: targetSummary.sensor_corroborated || incomingSummary.sensor_corroborated,
        news_articles: (targetSummary.news_articles || 0) + (incomingSummary.news_articles || 0),
      };

      // 7. Update latest timestamp & description
      const latestTimestamp =
        new Date(incoming.last_updated_at || Date.now()).getTime() >
        new Date(target.last_updated_at || 0).getTime()
          ? incoming.last_updated_at
          : target.last_updated_at;

      const fusedDescription =
        (target.description && target.description.length > (incoming.description?.length || 0))
          ? target.description
          : incoming.description || target.description;

      canonicalList[existingIndex] = {
        ...target,
        title: fusedTitle,
        severity: fusedSeverity,
        confidence: fusedConfidence,
        independent_source_count: fusedSources,
        media_urls: fusedMedia,
        evidence_summary: fusedSummary,
        last_updated_at: latestTimestamp,
        description: fusedDescription,
      };
    }
  }

  return canonicalList;
}
