
import type { Bbox, LocationChoice } from "@/types";

type PhotonFeature = {
  properties: {
    name?: string;
    street?: string;
    district?: string;
    city?: string;
    state?: string;
    country?: string;
    osm_key?: string;
    osm_value?: string;
    type?: string;
  };
  geometry: {
    coordinates: [number, number];
  };
};

type PhotonResponse = {
  features: PhotonFeature[];
};

const cache = new Map<string, LocationChoice[]>();

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isRelevantResult(
  query: string,
  properties: PhotonFeature["properties"]
): boolean {
  const normalizedQuery = normalizeText(query);

  const searchableText = normalizeText(
    [
      properties.name,
      properties.street,
      properties.district,
      properties.city,
      properties.state,
    ]
      .filter(Boolean)
      .join(" ")
  );

  // Prefer a complete phrase match.
  if (searchableText.includes(normalizedQuery)) {
    return true;
  }

  // Otherwise, require most meaningful query words to match.
  const words = normalizedQuery
    .split(" ")
    .filter((word) => word.length >= 3);

  if (words.length === 0) {
    return false;
  }

  const matchedWords = words.filter((word) =>
    searchableText.includes(word)
  );

  return matchedWords.length / words.length >= 0.6;
}

export async function searchLocations(
  query: string,
  bbox: Bbox | null,
  signal?: AbortSignal
): Promise<LocationChoice[]> {
  const cleanedQuery = query.trim();

  if (cleanedQuery.length < 3) {
    return [];
  }

  const cacheKey =
    `${cleanedQuery.toLowerCase()}-${JSON.stringify(bbox)}`;

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }

  // Check whether the exact query refers to a city outside our service area.
  if (bbox) {
    const globalParams = new URLSearchParams({
      q: cleanedQuery,
      limit: "5",
      lang: "en",
      countrycode: "PK",
    });

    const globalResponse = await fetch(
      `https://photon.komoot.io/api/?${globalParams.toString()}`,
      { signal }
    );

    if (!globalResponse.ok) {
      throw new Error("Location search failed. Please try again.");
    }

    const globalData: PhotonResponse = await globalResponse.json();

    const matchingCity = globalData.features.find((feature) => {
      const properties = feature.properties;

      return (
        normalizeText(properties.name ?? "") ===
          normalizeText(cleanedQuery) &&
        properties.osm_key === "place" &&
        properties.osm_value === "city" &&
        properties.type === "city"
      );
    });

    if (matchingCity) {
      const [cityLng, cityLat] =
        matchingCity.geometry.coordinates;

      const cityIsInsideArea =
        cityLat >= bbox.south &&
        cityLat <= bbox.north &&
        cityLng >= bbox.west &&
        cityLng <= bbox.east;

      if (!cityIsInsideArea) {
        cache.set(cacheKey, []);
        return [];
      }
    }
  }

  const params = new URLSearchParams({
    q: cleanedQuery,
    limit: "10",
    lang: "en",
    countrycode: "PK",
  });

  if (bbox) {
    params.set(
      "bbox",
      `${bbox.west},${bbox.south},${bbox.east},${bbox.north}`
    );
  }

  const response = await fetch(
    `https://photon.komoot.io/api/?${params.toString()}`,
    { signal }
  );

  if (!response.ok) {
    throw new Error("Location search failed. Please try again.");
  }

  const data: PhotonResponse = await response.json();

  const locations = data.features
    .filter((feature) =>
      isRelevantResult(cleanedQuery, feature.properties)
    )
    .map((feature) => {
      const [lng, lat] = feature.geometry.coordinates;
      const properties = feature.properties;

      const label = [
        properties.name,
        properties.street,
        properties.district,
        properties.city,
        properties.state,
      ]
        .filter(Boolean)
        .filter(
          (value, index, array) =>
            array.indexOf(value) === index
        )
        .join(", ");

      return {
        lat,
        lng,
        label: label || properties.country || "Unknown location",
      };
    })
    .filter((location) => {
      if (!bbox) return true;

      return (
        location.lat >= bbox.south &&
        location.lat <= bbox.north &&
        location.lng >= bbox.west &&
        location.lng <= bbox.east
      );
    });

  cache.set(cacheKey, locations);

  return locations;
}
