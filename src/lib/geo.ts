/**
 * Small geodesy helpers for the career route chart.
 * Coordinates are [latitude, longitude] in decimal degrees.
 */

export type LatLng = readonly [lat: number, lng: number];

/** Mean Earth radius (IUGG), km. */
const EARTH_RADIUS_KM = 6371.0088;
const toRad = (deg: number): number => (deg * Math.PI) / 180;
const toDeg = (rad: number): number => (rad * 180) / Math.PI;

/** Great-circle distance in km (haversine formula — stable for small distances). */
export function haversineKm([lat1, lng1]: LatLng, [lat2, lng2]: LatLng): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** Initial great-circle bearing from `a` to `b`, degrees clockwise from north, 0…360. */
export function initialBearing([lat1, lng1]: LatLng, [lat2, lng2]: LatLng): number {
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δλ = toRad(lng2 - lng1);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/** Bounds of a projected frame. */
export interface Frame {
  readonly west: number;
  readonly east: number;
  readonly south: number;
  readonly north: number;
  /** Output size in SVG units. */
  readonly width: number;
  readonly height: number;
}

/**
 * Equirectangular projection with a standard parallel at the frame's mid
 * latitude (x scaled by cos φ₀) — distortion-free enough for a regional
 * chart and trivially invertible. Returns SVG coordinates (y down).
 */
export function project([lat, lng]: LatLng, frame: Frame): { x: number; y: number } {
  const midLat = toRad((frame.north + frame.south) / 2);
  const spanX = (frame.east - frame.west) * Math.cos(midLat);
  const spanY = frame.north - frame.south;
  // Uniform scale: fit the frame, keep the aspect ratio true.
  const scale = Math.min(frame.width / spanX, frame.height / spanY);
  const offsetX = (frame.width - spanX * scale) / 2;
  const offsetY = (frame.height - spanY * scale) / 2;
  return {
    x: offsetX + (lng - frame.west) * Math.cos(midLat) * scale,
    y: offsetY + (frame.north - lat) * scale,
  };
}

/** "45.56° N · 94.16° W" */
export function formatLatLng([lat, lng]: LatLng, digits = 2): string {
  const ns = lat >= 0 ? 'N' : 'S';
  const ew = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(digits)}° ${ns} · ${Math.abs(lng).toFixed(digits)}° ${ew}`;
}
