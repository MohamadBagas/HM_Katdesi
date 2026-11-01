export type RunnerStatus = 'running' | 'paused' | 'finished' | 'sos';

export interface LatLng {
  lat: number;
  lng: number;
  altitude?: number;
  accuracy?: number;
}

export interface RunnerSplit {
  km: number;
  paceMinutes: number; // decimal minutes for Recharts axis, e.g. 5.35 = 5:21 /km
  paceFormatted: string; // "05:21 /km"
  splitSeconds: number;
  cumulativeTime: string;
  speedKmh: number;
  heartRate?: number;
  elevation?: number;
}

export interface Runner {
  id: string;
  bibNumber: string;
  name: string;
  category: 'Half Marathon 21K' | '10K Race' | '5K Fun Run';
  gender: 'M' | 'F';
  club: string; // e.g., "Teknik Geodesi UGM '21", "UGM Runners", "Keluarga Mahasiswa Teknik Geodesi"
  currentLocation: LatLng;
  distanceKm: number;
  paceMinPerKm: number; // in decimal minutes, e.g. 5.5 = 5:30 min/km
  speedKmh: number;
  heartRate: number;
  cadence: number;
  elapsedSeconds: number;
  status: RunnerStatus;
  history: { lat: number; lng: number; timestamp: number }[];
  cheersCount: number;
  splits: RunnerSplit[];
  color: string;
  isUser?: boolean;
}

export type POICategory =
  | 'start_finish'
  | 'water_station'
  | 'medical'
  | 'cheer_zone'
  | 'timing_mat'
  | 'refreshment';

export interface PointOfInterest {
  id: string;
  name: string;
  category: POICategory;
  kmMark: number;
  location: LatLng;
  description: string;
  facilities: string[];
}

export interface RoutePoint {
  lat: number;
  lng: number;
  ele: number; // elevation in meters
  distanceKm: number;
}

export interface LandmarkLocation {
  id: string;
  name: string;
  category: 'ugm' | 'transport' | 'hotel' | 'hospital' | 'tourist';
  location: LatLng;
  address: string;
}

export interface JourneyPlan {
  fromName: string;
  fromLocation: LatLng;
  toName: string;
  toLocation: LatLng;
  mode: 'walk' | 'bike' | 'drive';
  distanceKm: number;
  estimatedMinutes: number;
  waypoints: LatLng[];
  turnInstructions: string[];
  interceptInfo?: {
    runnerBib: string;
    runnerName: string;
    runnerEtaAtPoint: string;
    userEtaAtPoint: string;
    advice: string;
    minutesAheadOrBehind: number;
  };
}

export interface UTMCoordinate {
  zone: string; // e.g. "49S"
  easting: number; // meters
  northing: number; // meters
  convergenceAngle: number;
  pointScaleFactor: number;
}

export interface CheerEvent {
  id: string;
  runnerBib: string;
  senderName: string;
  message: string;
  type: 'clap' | 'water' | 'energy' | 'cheer';
  timestamp: number;
}
