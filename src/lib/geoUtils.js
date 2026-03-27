/**
 * Geolocation Utility Functions
 */

/**
 * Calculates the distance between two points on Earth in meters using Haversine formula.
 */
export const getDistance = (lat1, lon1, lat2, lon2) => {
  // Support object arguments: getDistance({lat, lng}, {lat, lng})
  if (typeof lat1 === 'object' && lat1 !== null && typeof lon1 === 'object') {
    const p1 = lat1;
    const p2 = lon1;
    return getDistance(p1.lat || p1.latitude, p1.lng || p1.longitude, p2.lat || p2.latitude, p2.lng || p2.longitude);
  }

  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return Infinity;
  
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // distance in meters
};

/**
 * Checks if a point is within a given radius of another point.
 * Supports:
 * 1. isWithinRadius({lat, lng}, {lat, lng}, 5, 'km')
 * 2. isWithinRadius(lat1, lon1, lat2, lon2, 5000) // meters
 */
export const isWithinRadius = (...args) => {
  if (args.length >= 5) {
    const [lat1, lon1, lat2, lon2, radiusMeters] = args;
    return getDistance(lat1, lon1, lat2, lon2) <= radiusMeters;
  }
  const [p1, p2, radius, unit = 'km'] = args;
  const distance = getDistance(p1, p2);
  const r = unit === 'km' ? radius * 1000 : radius;
  return distance <= r;
};

/**
 * Filters a list of items based on their distance from a target coordinate.
 */
export const filterByRadius = (items, target, radiusKm) => {
  return items.filter(item => isWithinRadius(target, item, radiusKm, 'km'));
};
