import { LatLng, UTMCoordinate } from '../types';

/**
 * Calculates great-circle distance between two coordinates using Haversine formula
 */
export function calculateDistanceKm(p1: LatLng, p2: LatLng): number {
  const R = 6371; // Earth radius in km
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates initial bearing from p1 to p2 in degrees (0 = North, 90 = East)
 */
export function calculateBearing(p1: LatLng, p2: LatLng): number {
  const lat1 = (p1.lat * Math.PI) / 180;
  const lat2 = (p2.lat * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

/**
 * Rigorous Geodetic Transformation:
 * Converts Geographic Latitude and Longitude (WGS84 datum)
 * to Universal Transverse Mercator (UTM Zone 49S for Yogyakarta, Indonesia).
 *
 * Parameters for WGS84:
 * Semi-major axis a = 6378137.0 m
 * Flattening f = 1 / 298.257223563
 * Central Meridian for Zone 49 = 111° E
 * False Easting = 500,000 m
 * False Northing (Southern hemisphere) = 10,000,000 m
 * Central scale factor k0 = 0.9996
 */
export function wgs84ToUTM49S(lat: number, lng: number): UTMCoordinate {
  const a = 6378137.0; // WGS84 semi-major axis
  const f = 1 / 298.257223563; // flattening
  const b = a * (1 - f);
  const eSq = (a * a - b * b) / (a * a);
  const ePrimeSq = (a * a - b * b) / (b * b);
  const k0 = 0.9996;

  // Yogyakarta is in Zone 49 (Central Meridian: 111° E)
  const zoneNumber = 49;
  const lonOrigin = (zoneNumber - 1) * 6 - 180 + 3; // 111 degrees

  const latRad = (lat * Math.PI) / 180.0;
  const lonRad = (lng * Math.PI) / 180.0;
  const lonOriginRad = (lonOrigin * Math.PI) / 180.0;

  const N = a / Math.sqrt(1 - eSq * Math.sin(latRad) * Math.sin(latRad));
  const T = Math.tan(latRad) * Math.tan(latRad);
  const C = ePrimeSq * Math.cos(latRad) * Math.cos(latRad);
  const A = Math.cos(latRad) * (lonRad - lonOriginRad);

  // Meridian distance M
  const M =
    a *
    ((1 - eSq / 4 - (3 * eSq * eSq) / 64 - (5 * eSq * eSq * eSq) / 256) * latRad -
      ((3 * eSq) / 8 + (3 * eSq * eSq) / 32 + (45 * eSq * eSq * eSq) / 1024) *
        Math.sin(2 * latRad) +
      ((15 * eSq * eSq) / 256 + (45 * eSq * eSq * eSq) / 1024) *
        Math.sin(4 * latRad) -
      ((35 * eSq * eSq * eSq) / 3072) * Math.sin(6 * latRad));

  // Easting
  const easting =
    k0 *
      N *
      (A +
        ((1 - T + C) * A * A * A) / 6 +
        ((5 - 18 * T + T * T + 72 * C - 58 * ePrimeSq) * A * A * A * A * A) / 120) +
    500000.0;

  // Northing
  let northing =
    k0 *
    (M +
      N *
        Math.tan(latRad) *
        ((A * A) / 2 +
          ((5 - T + 9 * C + 4 * C * C) * A * A * A * A) / 24 +
          ((61 - 58 * T + T * T + 600 * C - 330 * ePrimeSq) *
            A *
            A *
            A *
            A *
            A *
            A) /
            720));

  // Southern Hemisphere adjustment
  if (lat < 0) {
    northing += 10000000.0;
  }

  // Grid convergence (gamma)
  const gamma = Math.sin(latRad) * (lonRad - lonOriginRad) * (180 / Math.PI);

  // Point scale factor (approximate)
  const q = ((easting - 500000.0) / (0.9996 * 6378137.0));
  const pointScale = 0.9996 * (1 + (q * q) / 2);

  return {
    zone: '49S',
    easting: Math.round(easting * 100) / 100,
    northing: Math.round(northing * 100) / 100,
    convergenceAngle: Math.round(gamma * 10000) / 10000,
    pointScaleFactor: Math.round(pointScale * 100000) / 100000,
  };
}

/**
 * Format decimal pace into standard running string (MM:SS /km)
 */
export function formatPace(paceDecimal: number): string {
  if (!paceDecimal || paceDecimal <= 0 || !isFinite(paceDecimal)) return '0:00 /km';
  const mins = Math.floor(paceDecimal);
  const secs = Math.round((paceDecimal - mins) * 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs} /km`;
}

/**
 * Format seconds into HH:MM:SS
 */
export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${
      seconds < 10 ? '0' : ''
    }${seconds}`;
  }
  return `${minutes < 10 ? '0' : ''}${minutes}:${
    seconds < 10 ? '0' : ''
  }${seconds}`;
}

/**
 * Calculate estimated finish time (HH:MM:SS or Clock Time)
 */
export function calculateETA(
  currentDistanceKm: number,
  targetDistanceKm: number,
  currentPaceMinPerKm: number
): { remainingTimeSec: number; etaClock: string } {
  const remainingDist = Math.max(0, targetDistanceKm - currentDistanceKm);
  const remainingMinutes = remainingDist * (currentPaceMinPerKm || 6.0);
  const remainingTimeSec = Math.round(remainingMinutes * 60);

  const now = new Date();
  const arrivalDate = new Date(now.getTime() + remainingTimeSec * 1000);
  const etaClock = arrivalDate.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return { remainingTimeSec, etaClock };
}
