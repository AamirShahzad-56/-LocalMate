
import { haversineKm } from "@/lib/geo";
import type { Bbox, City } from "@/types";

const FALLBACK_RADIUS_KM = 25;

export function isInsideBbox(
  lat: number,
  lng: number,
  b: Bbox
): boolean {
  return (
    lat >= b.south &&
    lat <= b.north &&
    lng >= b.west &&
    lng <= b.east
  );
}

// Returns the supported city containing this point, or null.
export function findCityForPoint(
  lat: number,
  lng: number,
  cities: City[]
): City | null {
  for (const city of cities) {
    if (city.bbox) {
      if (isInsideBbox(lat, lng, city.bbox)) {
        return city;
      }
    } else if (
      haversineKm(
        lat,
        lng,
        city.center_lat,
        city.center_lng
      ) <= FALLBACK_RADIUS_KM
    ) {
      return city;
    }
  }

  return null;
}

// Builds the coverage message from supported city names.
export function coverageMessage(cities: City[]): string {
  const names = cities.map((city) => city.name);

  if (names.length === 0) {
    return "LocalMate has no supported cities yet.";
  }

  if (names.length === 1) {
    return `LocalMate currently covers ${names[0]}.`;
  }

  const last = names[names.length - 1];

  return `LocalMate currently covers ${names
    .slice(0, -1)
    .join(", ")} and ${last}.`;
}
