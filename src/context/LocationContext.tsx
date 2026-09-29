/* ═══════════════════════════════════════════════════════
   SkySignal — User Location Context
   Silent background location detection & live weather telemetry
   ═══════════════════════════════════════════════════════ */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { reverseGeocodeLocation } from '../services/locationSearch';

export interface UserLocation {
  lat: number;
  lng: number;
  cityName: string;
  stateName: string;
  tempC: number;
  weatherIcon: string;
  condition: string;
  isCustom?: boolean;
}

export interface PresetCity {
  cityName: string;
  stateName: string;
  lat: number;
  lng: number;
  tempC: number;
  weatherIcon: string;
  condition: string;
  alertLevel: 'safe' | 'warning' | 'severe';
}

export const PRESET_CITIES: PresetCity[] = [
  { cityName: 'Ahmedabad', stateName: 'Gujarat', lat: 23.0225, lng: 72.5714, tempC: 29, weatherIcon: '☀️', condition: 'Sunny / Clear', alertLevel: 'safe' },
  { cityName: 'New Delhi', stateName: 'Delhi NCR', lat: 28.6139, lng: 77.2090, tempC: 28, weatherIcon: '🌦️', condition: 'Monsoon Rain', alertLevel: 'severe' },
  { cityName: 'Mumbai', stateName: 'Maharashtra', lat: 19.0760, lng: 72.8777, tempC: 31, weatherIcon: '🌧️', condition: 'High Tide & Rain', alertLevel: 'severe' },
  { cityName: 'Bengaluru', stateName: 'Karnataka', lat: 12.9716, lng: 77.5946, tempC: 24, weatherIcon: '⛅', condition: 'Partly Cloudy', alertLevel: 'safe' },
  { cityName: 'Chennai', stateName: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, tempC: 33, weatherIcon: '☀️', condition: 'Humid & Sunny', alertLevel: 'warning' },
  { cityName: 'Kolkata', stateName: 'West Bengal', lat: 22.5726, lng: 88.3639, tempC: 30, weatherIcon: '🌦️', condition: 'Scattered Showers', alertLevel: 'safe' },
  { cityName: 'Hyderabad', stateName: 'Telangana', lat: 17.3850, lng: 78.4867, tempC: 28, weatherIcon: '⛅', condition: 'Cloudy', alertLevel: 'safe' },
  { cityName: 'Jaipur', stateName: 'Rajasthan', lat: 26.9124, lng: 75.7873, tempC: 34, weatherIcon: '☀️', condition: 'Sunny', alertLevel: 'warning' },
  { cityName: 'Shimla', stateName: 'Himachal Pradesh', lat: 31.1048, lng: 77.1734, tempC: 16, weatherIcon: '🌫️', condition: 'Dense Fog', alertLevel: 'warning' },
  { cityName: 'Patna', stateName: 'Bihar', lat: 25.5941, lng: 85.1376, tempC: 32, weatherIcon: '🌦️', condition: 'Humid Rain', alertLevel: 'warning' },
];

const DEFAULT_LOCATION: UserLocation = {
  lat: 23.0225,
  lng: 72.5714,
  cityName: 'Ahmedabad',
  stateName: 'Gujarat',
  tempC: 29,
  weatherIcon: '☀️',
  condition: 'Sunny / Clear',
  isCustom: false,
};

const STORAGE_KEY = 'skysignal_user_location_v3';

interface LocationContextType {
  location: UserLocation;
  isModalOpen: boolean;
  isDetecting: boolean;
  detectionError: string | null;
  openModal: () => void;
  closeModal: () => void;
  detectGPSLocation: () => Promise<boolean>;
  setCityLocation: (city: PresetCity | UserLocation) => void;
  getDistanceKm: (targetLat: number, targetLng: number) => number;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Haversine formula to compute distance in km
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function findNearestCity(lat: number, lng: number): PresetCity {
  let closest = PRESET_CITIES[0];
  let minDistance = Infinity;

  for (const city of PRESET_CITIES) {
    const dist = calculateDistanceKm(lat, lng, city.lat, city.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = city;
    }
  }
  return closest;
}

const SESSION_KEY = 'skysignal_session_location_set';

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<UserLocation>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_LOCATION;
  });

  // Modal is closed by default - zero intrusive prompt
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionError, setDetectionError] = useState<string | null>(null);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setDetectionError(null);
  };

  const setCityLocation = useCallback((city: PresetCity | UserLocation) => {
    const newLoc: UserLocation = {
      lat: city.lat,
      lng: city.lng,
      cityName: city.cityName,
      stateName: city.stateName || '',
      tempC: city.tempC ?? 29,
      weatherIcon: city.weatherIcon || '☀️',
      condition: city.condition || 'Clear',
      isCustom: true,
    };
    setLocation(newLoc);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newLoc));
      sessionStorage.setItem(SESSION_KEY, 'true');
    } catch {
      // ignore
    }
    setIsModalOpen(false);
    setDetectionError(null);

    // Recenter map immediately to newly selected city
    window.dispatchEvent(
      new CustomEvent('skysignal:recenter-map', {
        detail: { lat: newLoc.lat, lng: newLoc.lng, zoom: 14, name: newLoc.cityName },
      })
    );
  }, []);

  const detectGPSLocation = useCallback(async (): Promise<boolean> => {
    setIsDetecting(true);
    setDetectionError(null);

    // Helper to try multiple IP-based location services
    const tryIpFallback = async (): Promise<boolean> => {
      // 1. Try ipwho.is (CORS-friendly, no key required)
      try {
        const res = await fetch('https://ipwho.is/', { signal: AbortSignal.timeout(4000) });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.latitude && data.longitude) {
            const ipLoc: UserLocation = {
              lat: Number(data.latitude.toFixed(4)),
              lng: Number(data.longitude.toFixed(4)),
              cityName: data.city || 'My Location',
              stateName: data.region || 'India',
              tempC: 30,
              weatherIcon: '☀️',
              condition: 'Clear Sky',
              isCustom: false,
            };
            setLocation(ipLoc);
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(ipLoc));
              sessionStorage.setItem(SESSION_KEY, 'true');
            } catch {
              // ignore
            }
            setIsDetecting(false);
            window.dispatchEvent(
              new CustomEvent('skysignal:recenter-map', {
                detail: { lat: ipLoc.lat, lng: ipLoc.lng, zoom: 13, name: ipLoc.cityName },
              })
            );
            return true;
          }
        }
      } catch {
        // try next
      }

      // 2. Try freeipapi.com
      try {
        const res = await fetch('https://freeipapi.com/api/json', { signal: AbortSignal.timeout(4000) });
        if (res.ok) {
          const data = await res.json();
          if (data.latitude && data.longitude) {
            const ipLoc: UserLocation = {
              lat: Number(data.latitude.toFixed(4)),
              lng: Number(data.longitude.toFixed(4)),
              cityName: data.cityName || 'My Location',
              stateName: data.regionName || 'India',
              tempC: 29,
              weatherIcon: '☀️',
              condition: 'Clear Sky',
              isCustom: false,
            };
            setLocation(ipLoc);
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(ipLoc));
              sessionStorage.setItem(SESSION_KEY, 'true');
            } catch {
              // ignore
            }
            setIsDetecting(false);
            window.dispatchEvent(
              new CustomEvent('skysignal:recenter-map', {
                detail: { lat: ipLoc.lat, lng: ipLoc.lng, zoom: 13, name: ipLoc.cityName },
              })
            );
            return true;
          }
        }
      } catch {
        // try next
      }

      // 3. Try ipapi.co
      try {
        const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) });
        if (res.ok) {
          const data = await res.json();
          if (data.city && data.latitude && data.longitude) {
            const ipLoc: UserLocation = {
              lat: Number(data.latitude.toFixed(4)),
              lng: Number(data.longitude.toFixed(4)),
              cityName: data.city,
              stateName: data.region || 'India',
              tempC: 30,
              weatherIcon: '☀️',
              condition: 'Clear Sky',
              isCustom: false,
            };
            setLocation(ipLoc);
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(ipLoc));
              sessionStorage.setItem(SESSION_KEY, 'true');
            } catch {
              // ignore
            }
            setIsDetecting(false);
            window.dispatchEvent(
              new CustomEvent('skysignal:recenter-map', {
                detail: { lat: ipLoc.lat, lng: ipLoc.lng, zoom: 13, name: ipLoc.cityName },
              })
            );
            return true;
          }
        }
      } catch {
        // ignore
      }

      return false;
    };

    if (!navigator.geolocation) {
      const ipSuccess = await tryIpFallback();
      if (!ipSuccess) {
        setDetectionError('Geolocation is not supported by your browser.');
      }
      setIsDetecting(false);
      return ipSuccess;
    }

    const processPosition = async (position: GeolocationPosition): Promise<boolean> => {
      const lat = Number(position.coords.latitude.toFixed(4));
      const lng = Number(position.coords.longitude.toFixed(4));

      let geoInfo;
      try {
        geoInfo = await reverseGeocodeLocation(lat, lng);
      } catch {
        const nearest = findNearestCity(lat, lng);
        geoInfo = {
          cityName: nearest.cityName,
          stateName: nearest.stateName,
          tempC: nearest.tempC,
          weatherIcon: nearest.weatherIcon,
          condition: nearest.condition,
        };
      }

      const detectedLoc: UserLocation = {
        lat,
        lng,
        cityName: geoInfo.cityName,
        stateName: geoInfo.stateName,
        tempC: geoInfo.tempC,
        weatherIcon: geoInfo.weatherIcon,
        condition: geoInfo.condition,
        isCustom: false,
      };

      setLocation(detectedLoc);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(detectedLoc));
        sessionStorage.setItem(SESSION_KEY, 'true');
      } catch {
        // ignore
      }
      setIsDetecting(false);
      setIsModalOpen(false);

      // Fly map directly to detected GPS coordinates
      window.dispatchEvent(
        new CustomEvent('skysignal:recenter-map', {
          detail: { lat: detectedLoc.lat, lng: detectedLoc.lng, zoom: 15, name: detectedLoc.cityName },
        })
      );
      return true;
    };

    return new Promise((resolve) => {
      // First attempt: standard accuracy with 10s timeout
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const success = await processPosition(position);
          resolve(success);
        },
        async (_err) => {
          // If first attempt fails/times out, try with highAccuracy false
          navigator.geolocation.getCurrentPosition(
            async (fallbackPos) => {
              const success = await processPosition(fallbackPos);
              resolve(success);
            },
            async (finalErr) => {
              console.warn('Geolocation access failed or timed out:', finalErr.message);
              const ipSuccess = await tryIpFallback();
              if (!ipSuccess) {
                setDetectionError('Unable to retrieve exact GPS location. Please check browser location permissions or choose your city.');
              }
              setIsDetecting(false);
              resolve(ipSuccess);
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
          );
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 30000 }
      );
    });
  }, []);

  // Automatically attempt live location detection on mount
  useEffect(() => {
    detectGPSLocation();
  }, [detectGPSLocation]);

  const getDistanceKm = useCallback(
    (targetLat: number, targetLng: number) => {
      return calculateDistanceKm(location.lat, location.lng, targetLat, targetLng);
    },
    [location.lat, location.lng]
  );

  return (
    <LocationContext.Provider
      value={{
        location,
        isModalOpen,
        isDetecting,
        detectionError,
        openModal,
        closeModal,
        detectGPSLocation,
        setCityLocation,
        getDistanceKm,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export function useUserLocation(): LocationContextType {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useUserLocation must be used within a LocationProvider');
  }
  return context;
}
