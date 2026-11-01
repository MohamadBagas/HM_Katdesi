import { LandmarkLocation, PointOfInterest, RoutePoint, Runner } from '../types';

/**
 * 21.0975 KM Official Route for UGM Geodesy Half Marathon.
 * Starts and finishes at Grha Sabha Pramana (GSP) UGM, traverses through
 * Balairung UGM, Departemen Teknik Geodesi FT UGM, Jl. Kaliurang,
 * Ring Road Utara, Condongcatur, Kali Code corridor, and Lembah UGM.
 */
export const ugmHalfMarathonRoute: RoutePoint[] = [
  // KM 0.0 - Start at Grha Sabha Pramana (GSP) Lapangan Pancasila
  { lat: -7.7702, lng: 110.3776, ele: 142, distanceKm: 0.0 },
  { lat: -7.7712, lng: 110.3779, ele: 142, distanceKm: 0.2 },
  // KM 0.6 - Balairung Gedung Pusat UGM
  { lat: -7.7725, lng: 110.3780, ele: 141, distanceKm: 0.6 },
  // KM 1.2 - Bunderan UGM (Persimpangan Terban / Colombo)
  { lat: -7.7758, lng: 110.3778, ele: 139, distanceKm: 1.2 },
  // KM 1.8 - Belok ke Jl. C. Simanjuntak & Grafika
  { lat: -7.7738, lng: 110.3735, ele: 140, distanceKm: 1.8 },
  // KM 2.5 - DEPARTEMEN TEKNIK GEODESI FT UGM (KMTG Cheer Base 1)
  { lat: -7.7661, lng: 110.3725, ele: 144, distanceKm: 2.5 },
  // KM 3.2 - RSUP Dr. Sardjito & Jl. Kesehatan
  { lat: -7.7675, lng: 110.3705, ele: 143, distanceKm: 3.2 },
  // KM 4.0 - Pogung Baru / Selokan Mataram
  { lat: -7.7610, lng: 110.3720, ele: 148, distanceKm: 4.0 },
  // KM 4.8 - WS 1 & Timing Mat 5K (Persimpangan MM UGM & Jl. Kaliurang KM 5)
  { lat: -7.7570, lng: 110.3808, ele: 152, distanceKm: 5.0 },
  // KM 6.2 - Menuju utara ke Jl. Kaliurang KM 6.5
  { lat: -7.7495, lng: 110.3815, ele: 158, distanceKm: 6.2 },
  // KM 7.5 - Ring Road Utara (Monjali scenic loop)
  { lat: -7.7523, lng: 110.3690, ele: 155, distanceKm: 7.5 },
  // KM 8.8 - Jombor / Monumen Jogja Kembali connector
  { lat: -7.7535, lng: 110.3650, ele: 154, distanceKm: 8.8 },
  // KM 10.0 - WS 2 & Timing Mat 10K (Simpang Kentungan & Flyover)
  { lat: -7.7538, lng: 110.3892, ele: 160, distanceKm: 10.0 },
  // KM 11.5 - Jl. Gejayan / Affandi corridor
  { lat: -7.7615, lng: 110.3905, ele: 154, distanceKm: 11.5 },
  // KM 12.8 - Selokan Mataram Timur & Condongcatur
  { lat: -7.7645, lng: 110.3940, ele: 150, distanceKm: 12.8 },
  // KM 14.0 - Embung Tambakboyo / Kali Code green trail
  { lat: -7.7620, lng: 110.4010, ele: 149, distanceKm: 14.0 },
  // KM 15.0 - WS 3 & Timing Mat 15K (Wisdom Park Danau Lembah UGM)
  { lat: -7.7710, lng: 110.3855, ele: 144, distanceKm: 15.0 },
  // KM 16.5 - Stadion Pancasila UGM & Gelanggang Mahasiswa
  { lat: -7.7680, lng: 110.3850, ele: 145, distanceKm: 16.5 },
  // KM 17.8 - Klaster Agro / Kehutanan UGM
  { lat: -7.7675, lng: 110.3785, ele: 144, distanceKm: 17.8 },
  // KM 18.5 - WS 4 & Cheer Zone Utama KMTG FT UGM
  { lat: -7.7665, lng: 110.3730, ele: 144, distanceKm: 18.5 },
  // KM 19.5 - Jl. Kaliurang Selatan & Masjid Kampus UGM
  { lat: -7.7735, lng: 110.3780, ele: 141, distanceKm: 19.5 },
  // KM 20.0 - Timing Mat 20K (Pintu Gerbang Utama UGM)
  { lat: -7.7745, lng: 110.3776, ele: 140, distanceKm: 20.0 },
  // KM 20.7 - Lapangan Pancasila Final Stretch (Red Carpet Corridor)
  { lat: -7.7715, lng: 110.3774, ele: 141, distanceKm: 20.7 },
  // KM 21.0975 - FINISH GATE GRHA SABHA PRAMANA (GSP) UGM
  { lat: -7.7702, lng: 110.3776, ele: 142, distanceKm: 21.0975 },
];

/**
 * Key Points of Interest across the race
 */
export const pointsOfInterest: PointOfInterest[] = [
  {
    id: 'poi-start',
    name: 'Start & Finish Arena (GSP UGM)',
    category: 'start_finish',
    kmMark: 0,
    location: { lat: -7.7702, lng: 110.3776 },
    description: 'Panggung Utama, Gantry Start/Finish, Refreshment & Bag Drop',
    facilities: ['Panggung Hiburan', 'Medal Counter', 'Medical HQ', 'Bag Drop', 'Toilet Portabel'],
  },
  {
    id: 'poi-cheer-1',
    name: 'Cheer Point 1 - Dept. Teknik Geodesi FT UGM',
    category: 'cheer_zone',
    kmMark: 2.5,
    location: { lat: -7.7661, lng: 110.3725 },
    description: 'Basecamp Himpunan Mahasiswa Teknik Geodesi (KMTG) dengan yel-yel & alat ukur theodolite display!',
    facilities: ['Sound System & Drumband', 'Fotografer Komunitas', 'Semprotan Air Dingin'],
  },
  {
    id: 'poi-ws-1',
    name: 'Water Station 1 & Timing Mat 5K',
    category: 'water_station',
    kmMark: 5.0,
    location: { lat: -7.7570, lng: 110.3808 },
    description: 'Jl. Kaliurang KM 5 (Depan MM UGM). Hidrasi air mineral & isotonik.',
    facilities: ['Air Mineral', 'Isotonik', 'Spons Dingin', 'First Aid Station'],
  },
  {
    id: 'poi-med-1',
    name: 'Pos Medis 1 - Simpang Kentungan',
    category: 'medical',
    kmMark: 10.0,
    location: { lat: -7.7538, lng: 110.3892 },
    description: 'Pos Medis Halfway & Timing Mat 10K. Siaga ambulans dan fisioterapis.',
    facilities: ['Ambulans Siaga', 'Semprotan Ethyl Chloride', 'Tandu Medis', 'Elektrolit'],
  },
  {
    id: 'poi-ws-2',
    name: 'Water Station 2 & Pisang Station',
    category: 'water_station',
    kmMark: 10.0,
    location: { lat: -7.7538, lng: 110.3892 },
    description: 'Suplai energi buah pisang potong, kurma, dan minuman elektrolit.',
    facilities: ['Pisang Potong', 'Air Mineral', 'Isotonik'],
  },
  {
    id: 'poi-ws-3',
    name: 'Water Station 3 - Wisdom Park Lembah UGM',
    category: 'water_station',
    kmMark: 15.0,
    location: { lat: -7.7710, lng: 110.3855 },
    description: 'Taman Kearifan Lembah UGM yang asri dan sejuk. Timing Mat 15K.',
    facilities: ['Air Mineral', 'Water Mist Spray', 'Semprotan Kram Otot'],
  },
  {
    id: 'poi-cheer-2',
    name: 'Cheer Point 2 & WS 4 - KPTU Fakultas Teknik',
    category: 'cheer_zone',
    kmMark: 18.5,
    location: { lat: -7.7665, lng: 110.3730 },
    description: 'Booster terakhir sebelum garis finish! Suara drum & sorak mahasiswa Teknik UGM!',
    facilities: ['Booster Cheerers', 'Isotonik Dingin', 'Spanduk Motivasi'],
  },
  {
    id: 'poi-finish',
    name: 'Gerbang Finish & Refreshment',
    category: 'refreshment',
    kmMark: 21.1,
    location: { lat: -7.7702, lng: 110.3776 },
    description: 'Pengambilan Medali Finisher Logam Geodesi, Finisher Tee, Pisang, & Photo Booth.',
    facilities: ['Medali Finisher', 'Photo Booth', 'Fisioterapi Recovery', 'Food Festival'],
  },
];

/**
 * Pre-configured popular Yogyakarta / UGM landmarks for journey planning
 */
export const landmarkLocations: LandmarkLocation[] = [
  {
    id: 'lm-gsp',
    name: 'Grha Sabha Pramana (GSP) UGM',
    category: 'ugm',
    location: { lat: -7.7702, lng: 110.3776 },
    address: 'Jl. Lingkar Luar No.1 Bulaksumur, UGM',
  },
  {
    id: 'lm-geodesi',
    name: 'Departemen Teknik Geodesi FT UGM',
    category: 'ugm',
    location: { lat: -7.7661, lng: 110.3725 },
    address: 'Jl. Grafika No.2, Kampus UGM',
  },
  {
    id: 'lm-stasiun-tugu',
    name: 'Stasiun Yogyakarta (Stasiun Tugu)',
    category: 'transport',
    location: { lat: -7.7892, lng: 110.3635 },
    address: 'Jl. Margo Utomo 1, Sosromenduran, Gedong Tengen',
  },
  {
    id: 'lm-malioboro',
    name: 'Kawasan Malioboro / Tugu Pal Putih',
    category: 'tourist',
    location: { lat: -7.7828, lng: 110.3670 },
    address: 'Jl. Jend. Sudirman / Tugu Jogja',
  },
  {
    id: 'lm-tentrem',
    name: 'Hotel Tentrem Yogyakarta',
    category: 'hotel',
    location: { lat: -7.7725, lng: 110.3685 },
    address: 'Jl. P. Mangkubumi No.72A, Cokrodiningratan',
  },
  {
    id: 'lm-pogung',
    name: 'Kawasan Kos Pogung Baru (Utara UGM)',
    category: 'ugm',
    location: { lat: -7.7600, lng: 110.3735 },
    address: 'Pogung Dalangan, Sinduadi, Mlati, Sleman',
  },
  {
    id: 'lm-sardjito',
    name: 'RSUP Dr. Sardjito',
    category: 'hospital',
    location: { lat: -7.7680, lng: 110.3700 },
    address: 'Jl. Kesehatan No.1, Sekip, Sinduadi',
  },
  {
    id: 'lm-wisma-mm',
    name: 'Wisma MM UGM Hotel',
    category: 'hotel',
    location: { lat: -7.7675, lng: 110.3790 },
    address: 'Jl. Colombo Yogyakarta No.1',
  },
  {
    id: 'lm-condongcatur',
    name: 'Terminal Condongcatur / Hartono Mall',
    category: 'transport',
    location: { lat: -7.7595, lng: 110.3995 },
    address: 'Jl. Ring Road Utara, Condongcatur, Depok, Sleman',
  },
];

/**
 * Pre-populated runners in the event for live tracking demonstration
 */
export const initialRunners: Runner[] = [
  {
    id: 'runner-me',
    bibNumber: 'BIB-2104',
    name: 'Bagas Pratama (Anda)',
    category: 'Half Marathon 21K',
    gender: 'M',
    club: "Teknik Geodesi FT UGM '21",
    currentLocation: { lat: -7.7610, lng: 110.3720, altitude: 148, accuracy: 4 },
    distanceKm: 4.2,
    paceMinPerKm: 5.35, // 5:21 min/km
    speedKmh: 11.2,
    heartRate: 156,
    cadence: 172,
    elapsedSeconds: 1350, // 22:30
    status: 'running',
    history: [
      { lat: -7.7702, lng: 110.3776, timestamp: Date.now() - 1350000 },
      { lat: -7.7725, lng: 110.3780, timestamp: Date.now() - 1100000 },
      { lat: -7.7758, lng: 110.3778, timestamp: Date.now() - 850000 },
      { lat: -7.7661, lng: 110.3725, timestamp: Date.now() - 500000 },
      { lat: -7.7610, lng: 110.3720, timestamp: Date.now() },
    ],
    cheersCount: 28,
    splits: [
      { km: 1, paceMinutes: 5.3, paceFormatted: '5:18 /km', splitSeconds: 318, cumulativeTime: '05:18', speedKmh: 11.32, heartRate: 142, elevation: 141 },
      { km: 2, paceMinutes: 5.2, paceFormatted: '5:12 /km', splitSeconds: 312, cumulativeTime: '10:30', speedKmh: 11.54, heartRate: 148, elevation: 140 },
      { km: 3, paceMinutes: 5.5, paceFormatted: '5:30 /km', splitSeconds: 330, cumulativeTime: '16:00', speedKmh: 10.91, heartRate: 154, elevation: 144 },
      { km: 4, paceMinutes: 5.42, paceFormatted: '5:25 /km', splitSeconds: 325, cumulativeTime: '21:25', speedKmh: 11.08, heartRate: 156, elevation: 148 },
    ],
    color: '#2563eb', // Royal Blue
    isUser: true,
  },
  {
    id: 'runner-alumni',
    bibNumber: 'BIB-2108',
    name: 'Dr. Ir. Sunaryo, M.T.',
    category: 'Half Marathon 21K',
    gender: 'M',
    club: 'Ikatan Alumni Geodesi UGM (IKAGEOD)',
    currentLocation: { lat: -7.7538, lng: 110.3892, altitude: 160, accuracy: 3 },
    distanceKm: 10.1,
    paceMinPerKm: 5.8, // 5:48 min/km
    speedKmh: 10.3,
    heartRate: 148,
    cadence: 168,
    elapsedSeconds: 3515,
    status: 'running',
    history: [],
    cheersCount: 45,
    splits: [
      { km: 1, paceMinutes: 5.75, paceFormatted: '5:45 /km', splitSeconds: 345, cumulativeTime: '05:45', speedKmh: 10.43, heartRate: 138, elevation: 141 },
      { km: 2, paceMinutes: 5.68, paceFormatted: '5:41 /km', splitSeconds: 341, cumulativeTime: '11:26', speedKmh: 10.56, heartRate: 142, elevation: 140 },
      { km: 3, paceMinutes: 5.72, paceFormatted: '5:43 /km', splitSeconds: 343, cumulativeTime: '17:09', speedKmh: 10.50, heartRate: 144, elevation: 144 },
      { km: 4, paceMinutes: 5.80, paceFormatted: '5:48 /km', splitSeconds: 348, cumulativeTime: '22:57', speedKmh: 10.34, heartRate: 146, elevation: 148 },
      { km: 5, paceMinutes: 5.85, paceFormatted: '5:51 /km', splitSeconds: 351, cumulativeTime: '28:48', speedKmh: 10.26, heartRate: 148, elevation: 152 },
      { km: 6, paceMinutes: 5.92, paceFormatted: '5:55 /km', splitSeconds: 355, cumulativeTime: '34:43', speedKmh: 10.14, heartRate: 150, elevation: 158 },
      { km: 7, paceMinutes: 5.78, paceFormatted: '5:47 /km', splitSeconds: 347, cumulativeTime: '40:30', speedKmh: 10.37, heartRate: 147, elevation: 155 },
      { km: 8, paceMinutes: 5.73, paceFormatted: '5:44 /km', splitSeconds: 344, cumulativeTime: '46:14', speedKmh: 10.47, heartRate: 146, elevation: 154 },
      { km: 9, paceMinutes: 5.82, paceFormatted: '5:49 /km', splitSeconds: 349, cumulativeTime: '52:03', speedKmh: 10.32, heartRate: 149, elevation: 157 },
      { km: 10, paceMinutes: 5.88, paceFormatted: '5:53 /km', splitSeconds: 353, cumulativeTime: '57:56', speedKmh: 10.20, heartRate: 152, elevation: 160 },
    ],
    color: '#059669', // Emerald
    isUser: false,
  },
  {
    id: 'runner-nadia',
    bibNumber: 'BIB-2125',
    name: 'Nadia Kusuma, S.T.',
    category: 'Half Marathon 21K',
    gender: 'F',
    club: 'UGM Running Club (GAMA Runners)',
    currentLocation: { lat: -7.7680, lng: 110.3850, altitude: 145, accuracy: 5 },
    distanceKm: 16.4,
    paceMinPerKm: 4.9, // 4:54 min/km
    speedKmh: 12.2,
    heartRate: 168,
    cadence: 180,
    elapsedSeconds: 4820,
    status: 'running',
    history: [],
    cheersCount: 62,
    splits: [
      { km: 1, paceMinutes: 5.05, paceFormatted: '5:03 /km', splitSeconds: 303, cumulativeTime: '05:03', speedKmh: 11.88, heartRate: 150, elevation: 141 },
      { km: 2, paceMinutes: 4.92, paceFormatted: '4:55 /km', splitSeconds: 295, cumulativeTime: '09:58', speedKmh: 12.20, heartRate: 156, elevation: 140 },
      { km: 3, paceMinutes: 4.88, paceFormatted: '4:53 /km', splitSeconds: 293, cumulativeTime: '14:51', speedKmh: 12.29, heartRate: 160, elevation: 144 },
      { km: 4, paceMinutes: 4.85, paceFormatted: '4:51 /km', splitSeconds: 291, cumulativeTime: '19:42', speedKmh: 12.37, heartRate: 162, elevation: 148 },
      { km: 5, paceMinutes: 4.95, paceFormatted: '4:57 /km', splitSeconds: 297, cumulativeTime: '24:39', speedKmh: 12.12, heartRate: 164, elevation: 152 },
      { km: 6, paceMinutes: 5.02, paceFormatted: '5:01 /km', splitSeconds: 301, cumulativeTime: '29:40', speedKmh: 11.96, heartRate: 166, elevation: 158 },
      { km: 7, paceMinutes: 4.82, paceFormatted: '4:49 /km', splitSeconds: 289, cumulativeTime: '34:29', speedKmh: 12.46, heartRate: 165, elevation: 155 },
      { km: 8, paceMinutes: 4.78, paceFormatted: '4:47 /km', splitSeconds: 287, cumulativeTime: '39:16', speedKmh: 12.54, heartRate: 167, elevation: 154 },
      { km: 9, paceMinutes: 4.85, paceFormatted: '4:51 /km', splitSeconds: 291, cumulativeTime: '44:07', speedKmh: 12.37, heartRate: 166, elevation: 157 },
      { km: 10, paceMinutes: 4.98, paceFormatted: '4:59 /km', splitSeconds: 299, cumulativeTime: '49:06', speedKmh: 12.04, heartRate: 170, elevation: 160 },
      { km: 11, paceMinutes: 4.90, paceFormatted: '4:54 /km', splitSeconds: 294, cumulativeTime: '54:00', speedKmh: 12.24, heartRate: 168, elevation: 154 },
      { km: 12, paceMinutes: 4.88, paceFormatted: '4:53 /km', splitSeconds: 293, cumulativeTime: '58:53', speedKmh: 12.29, heartRate: 168, elevation: 150 },
      { km: 13, paceMinutes: 4.80, paceFormatted: '4:48 /km', splitSeconds: 288, cumulativeTime: '1:03:41', speedKmh: 12.50, heartRate: 169, elevation: 149 },
      { km: 14, paceMinutes: 4.82, paceFormatted: '4:49 /km', splitSeconds: 289, cumulativeTime: '1:08:30', speedKmh: 12.46, heartRate: 169, elevation: 149 },
      { km: 15, paceMinutes: 4.92, paceFormatted: '4:55 /km', splitSeconds: 295, cumulativeTime: '1:13:25', speedKmh: 12.20, heartRate: 171, elevation: 144 },
      { km: 16, paceMinutes: 4.95, paceFormatted: '4:57 /km', splitSeconds: 297, cumulativeTime: '1:18:22', speedKmh: 12.12, heartRate: 172, elevation: 145 },
    ],
    color: '#d97706', // Amber
    isUser: false,
  },
  {
    id: 'runner-pacer',
    bibNumber: 'BIB-2199',
    name: 'Official Pacer 2:00:00 (Sub-2)',
    category: 'Half Marathon 21K',
    gender: 'M',
    club: 'Komite Lomba Geodesi UGM',
    currentLocation: { lat: -7.7710, lng: 110.3855, altitude: 144, accuracy: 2 },
    distanceKm: 15.0,
    paceMinPerKm: 5.68, // 5:41 min/km (Exact Sub-2 target)
    speedKmh: 10.55,
    heartRate: 142,
    cadence: 174,
    elapsedSeconds: 5100,
    status: 'running',
    history: [],
    cheersCount: 88,
    splits: [
      { km: 1, paceMinutes: 5.68, paceFormatted: '5:41 /km', splitSeconds: 341, cumulativeTime: '05:41', speedKmh: 10.56, heartRate: 138, elevation: 141 },
      { km: 2, paceMinutes: 5.67, paceFormatted: '5:40 /km', splitSeconds: 340, cumulativeTime: '11:21', speedKmh: 10.59, heartRate: 140, elevation: 140 },
      { km: 3, paceMinutes: 5.70, paceFormatted: '5:42 /km', splitSeconds: 342, cumulativeTime: '17:03', speedKmh: 10.53, heartRate: 141, elevation: 144 },
      { km: 4, paceMinutes: 5.68, paceFormatted: '5:41 /km', splitSeconds: 341, cumulativeTime: '22:44', speedKmh: 10.56, heartRate: 142, elevation: 148 },
      { km: 5, paceMinutes: 5.69, paceFormatted: '5:41 /km', splitSeconds: 341, cumulativeTime: '28:25', speedKmh: 10.56, heartRate: 142, elevation: 152 },
      { km: 6, paceMinutes: 5.71, paceFormatted: '5:43 /km', splitSeconds: 343, cumulativeTime: '34:08', speedKmh: 10.50, heartRate: 143, elevation: 158 },
      { km: 7, paceMinutes: 5.66, paceFormatted: '5:40 /km', splitSeconds: 340, cumulativeTime: '39:48', speedKmh: 10.59, heartRate: 142, elevation: 155 },
      { km: 8, paceMinutes: 5.65, paceFormatted: '5:39 /km', splitSeconds: 339, cumulativeTime: '45:27', speedKmh: 10.62, heartRate: 142, elevation: 154 },
      { km: 9, paceMinutes: 5.68, paceFormatted: '5:41 /km', splitSeconds: 341, cumulativeTime: '51:08', speedKmh: 10.56, heartRate: 143, elevation: 157 },
      { km: 10, paceMinutes: 5.72, paceFormatted: '5:43 /km', splitSeconds: 343, cumulativeTime: '56:51', speedKmh: 10.50, heartRate: 145, elevation: 160 },
      { km: 11, paceMinutes: 5.67, paceFormatted: '5:40 /km', splitSeconds: 340, cumulativeTime: '1:02:31', speedKmh: 10.59, heartRate: 143, elevation: 154 },
      { km: 12, paceMinutes: 5.66, paceFormatted: '5:40 /km', splitSeconds: 340, cumulativeTime: '1:08:11', speedKmh: 10.59, heartRate: 143, elevation: 150 },
      { km: 13, paceMinutes: 5.65, paceFormatted: '5:39 /km', splitSeconds: 339, cumulativeTime: '1:13:50', speedKmh: 10.62, heartRate: 142, elevation: 149 },
      { km: 14, paceMinutes: 5.67, paceFormatted: '5:40 /km', splitSeconds: 340, cumulativeTime: '1:19:30', speedKmh: 10.59, heartRate: 142, elevation: 149 },
      { km: 15, paceMinutes: 5.68, paceFormatted: '5:41 /km', splitSeconds: 341, cumulativeTime: '1:25:11', speedKmh: 10.56, heartRate: 144, elevation: 144 },
    ],
    color: '#7c3aed', // Purple
    isUser: false,
  },
  {
    id: 'runner-ilham',
    bibNumber: 'BIB-2101',
    name: 'Muhammad Ilham',
    category: 'Half Marathon 21K',
    gender: 'M',
    club: "Teknik Geodesi FT UGM '20",
    currentLocation: { lat: -7.7665, lng: 110.3730, altitude: 144, accuracy: 2 },
    distanceKm: 18.5,
    paceMinPerKm: 4.65, // 4:39 min/km
    speedKmh: 12.9,
    heartRate: 174,
    cadence: 182,
    elapsedSeconds: 5160,
    status: 'running',
    history: [],
    cheersCount: 112,
    splits: [
      { km: 1, paceMinutes: 4.70, paceFormatted: '4:42 /km', splitSeconds: 282, cumulativeTime: '04:42', speedKmh: 12.76, heartRate: 155, elevation: 141 },
      { km: 2, paceMinutes: 4.62, paceFormatted: '4:37 /km', splitSeconds: 277, cumulativeTime: '09:19', speedKmh: 12.99, heartRate: 162, elevation: 140 },
      { km: 3, paceMinutes: 4.60, paceFormatted: '4:36 /km', splitSeconds: 276, cumulativeTime: '13:55', speedKmh: 13.04, heartRate: 165, elevation: 144 },
      { km: 4, paceMinutes: 4.58, paceFormatted: '4:35 /km', splitSeconds: 275, cumulativeTime: '18:30', speedKmh: 13.09, heartRate: 167, elevation: 148 },
      { km: 5, paceMinutes: 4.65, paceFormatted: '4:39 /km', splitSeconds: 279, cumulativeTime: '23:09', speedKmh: 12.90, heartRate: 168, elevation: 152 },
    ],
    color: '#0891b2', // Cyan
    isUser: false,
  },
  {
    id: 'runner-maya',
    bibNumber: 'BIB-2144',
    name: 'Maya Salsabila',
    category: 'Half Marathon 21K',
    gender: 'F',
    club: "Teknik Geodesi FT UGM '23",
    currentLocation: { lat: -7.7523, lng: 110.3690, altitude: 155, accuracy: 4 },
    distanceKm: 7.5,
    paceMinPerKm: 6.25, // 6:15 min/km
    speedKmh: 9.6,
    heartRate: 152,
    cadence: 164,
    elapsedSeconds: 2810,
    status: 'running',
    history: [],
    cheersCount: 38,
    splits: [
      { km: 1, paceMinutes: 6.10, paceFormatted: '6:06 /km', splitSeconds: 366, cumulativeTime: '06:06', speedKmh: 9.83, heartRate: 140, elevation: 141 },
      { km: 2, paceMinutes: 6.20, paceFormatted: '6:12 /km', splitSeconds: 372, cumulativeTime: '12:18', speedKmh: 9.68, heartRate: 146, elevation: 140 },
      { km: 3, paceMinutes: 6.30, paceFormatted: '6:18 /km', splitSeconds: 378, cumulativeTime: '18:36', speedKmh: 9.52, heartRate: 150, elevation: 144 },
    ],
    color: '#db2777', // Pink
    isUser: false,
  },
];
