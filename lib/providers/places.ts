
import {
  getCategory,
  type Category,
  type CategoryId,
} from "@/lib/categories";

import { haversineKm } from "@/lib/geo";
import type { NearbyPlace } from "@/types";

// ---------- Errors ----------

export type ProviderErrorCode =
  | "INVALID_INPUT"
  | "UNKNOWN_CATEGORY"
  | "UPSTREAM";

export class PlacesProviderError extends Error {
  code: ProviderErrorCode;

  constructor(code: ProviderErrorCode, message: string) {
    super(message);
    this.name = "PlacesProviderError";
    this.code = code;
  }
}

// ---------- Settings ----------

const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const USER_AGENT =
  "LocalMate-FYP/1.0 (student project; contact: aamirshahzad11228899@gmail.com)";

const REQUEST_TIMEOUT_MS = 60000;
const MIN_RADIUS_M = 100;
const MAX_RADIUS_M = 10000;

// ---------- Query builder ----------

export function buildOverpassQuery(
  category: Category,
  lat: number,
  lng: number,
  radiusM: number
): string {
  const around = `(around:${Math.round(radiusM)},${lat},${lng})`;

  const clauses = category.osmTags
    .map(
      (tag) =>
        `  nwr["${tag.key}"~"^(${tag.values.join("|")})$"]${around};`
    )
    .join("\n");

  return `[out:json][timeout:25];\n(\n${clauses}\n);\nout center tags;`;
}

// ---------- Helpers ----------

type OverpassElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: Record<string, string>;
};

function getSubtype(
  category: Category,
  tags: Record<string, string>
): string | null {
  for (const tag of category.osmTags) {
    const value = tags[tag.key];

    if (value && tag.values.includes(value)) {
      return value;
    }
  }

  return null;
}

function buildAddress(
  tags: Record<string, string>
): string | null {
  if (tags["addr:full"]) {
    return tags["addr:full"];
  }

  const street = [
    tags["addr:housenumber"],
    tags["addr:street"],
  ]
    .filter(Boolean)
    .join(" ");

  const parts = [
    street,
    tags["addr:suburb"],
    tags["addr:city"],
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : null;
}

// ---------- Overpass request ----------

async function runQuery(
  query: string
): Promise<{ elements: OverpassElement[] }> {
  let lastMessage = "unknown error";

  for (const url of ENDPOINTS) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "User-Agent": USER_AGENT,
        },
        body: new URLSearchParams({
          data: query,
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const json = await response.json();

      // Overpass can return HTTP 200 with an error remark.
      if (
        typeof json.remark === "string" &&
        json.remark.toLowerCase().includes("error")
      ) {
        throw new Error(json.remark);
      }

      return json as { elements: OverpassElement[] };
    } catch (error) {
      lastMessage =
        error instanceof Error
          ? error.message
          : "Unknown request error";

      // Try the next Overpass endpoint.
    }
  }

  throw new PlacesProviderError(
    "UPSTREAM",
    `Places service is not available right now (${lastMessage}).`
  );
}

// ---------- Main function ----------

export async function searchNearby(
  lat: number,
  lng: number,
  radiusM: number,
  categoryId: CategoryId
): Promise<NearbyPlace[]> {
  // Validate latitude.
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    throw new PlacesProviderError(
      "INVALID_INPUT",
      "Invalid latitude."
    );
  }

  // Validate longitude.
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    throw new PlacesProviderError(
      "INVALID_INPUT",
      "Invalid longitude."
    );
  }

  // Validate radius in meters.
  if (
    !Number.isFinite(radiusM) ||
    radiusM < MIN_RADIUS_M ||
    radiusM > MAX_RADIUS_M
  ) {
    throw new PlacesProviderError(
      "INVALID_INPUT",
      `Radius must be between ${MIN_RADIUS_M} and ${MAX_RADIUS_M} meters.`
    );
  }

  // Find the requested category configuration.
  const category = getCategory(categoryId);

  if (!category) {
    throw new PlacesProviderError(
      "UNKNOWN_CATEGORY",
      `Unknown category: ${categoryId}`
    );
  }

  // Build and execute the Overpass query.
  const data = await runQuery(
    buildOverpassQuery(category, lat, lng, radiusM)
  );

  const places: NearbyPlace[] = [];
  const seen = new Set<string>();

  // Convert Overpass elements into LocalMate places.
  for (const element of data.elements ?? []) {
    const placeLat = element.lat ?? element.center?.lat;
    const placeLng = element.lon ?? element.center?.lon;

    // Skip elements without coordinates.
    if (placeLat === undefined || placeLng === undefined) {
      continue;
    }

    // Prevent duplicate OSM elements.
    const key = `${element.type}/${element.id}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);

    const tags = element.tags ?? {};

    places.push({
      osm_type: element.type,
      osm_id: element.id,
      name:
        tags.name ||
        tags.brand ||
        tags.operator ||
        null,
      category: category.id,
      subtype: getSubtype(category, tags),
      address: buildAddress(tags),
      lat: placeLat,
      lng: placeLng,
      distance_m: Math.round(
        haversineKm(lat, lng, placeLat, placeLng) * 1000
      ),
      tags,
    });
  }

  // Return nearest places first.
  return places.sort(
    (a, b) => a.distance_m - b.distance_m
  );
}
