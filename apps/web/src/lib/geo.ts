/**
 * Geographic utility functions for geofence enforcement.
 */

const EARTH_RADIUS_METERS = 6_371_000;

function toRad(deg: number): number {
    return (deg * Math.PI) / 180;
}

/**
 * Haversine formula — calculates great-circle distance between two GPS points.
 * Returns distance in METERS.
 */
export function haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_METERS * c;
}

/**
 * Returns true if (workerLat, workerLon) is within radiusMeters of (storeLat, storeLon).
 */
export function isWithinRadius(
    workerLat: number,
    workerLon: number,
    storeLat: number,
    storeLon: number,
    radiusMeters: number
): boolean {
    const distance = haversineDistance(workerLat, workerLon, storeLat, storeLon);
    return distance <= radiusMeters;
}
