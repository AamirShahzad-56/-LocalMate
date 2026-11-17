
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import GpsButton from "@/components/GpsButton";
import LocationSearch from "@/components/LocationSearch";
import RadiusSelector from "@/components/RadiusSelector";

import { getActiveCities } from "@/lib/cities";
import {
  coverageMessage,
  findCityForPoint,
} from "@/lib/serviceArea";

import type { City, LocationChoice } from "@/types";

export default function LocationPicker() {
  const [location, setLocation] = useState<LocationChoice | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(3);

  const [cities, setCities] = useState<City[]>([]);
  const [citiesLoaded, setCitiesLoaded] = useState(false);
  const [citiesError, setCitiesError] = useState<string | null>(null);

  // Load all active service-area cities.
  useEffect(() => {
    let cancelled = false;

    async function loadCities() {
      try {
        const activeCities = await getActiveCities();

        if (cancelled) return;

        setCities(activeCities);

        if (activeCities.length === 0) {
          setCitiesError("No active service area is available.");
        }
      } catch (error) {
        if (!cancelled) {
          setCitiesError(
            error instanceof Error
              ? error.message
              : "Could not load supported cities."
          );
        }
      } finally {
        if (!cancelled) {
          setCitiesLoaded(true);
        }
      }
    }

    loadCities();

    return () => {
      cancelled = true;
    };
  }, []);

  // Find which supported city contains the selected location.
  const matchedCity = useMemo(
    () =>
      location
        ? findCityForPoint(location.lat, location.lng, cities)
        : null,
    [location, cities]
  );

  const outsideArea =
    !!location && citiesLoaded && !matchedCity;

  const canContinue =
    !!location && citiesLoaded && !!matchedCity;

  // Build the URL for the home page.
  const homeHref = useMemo(() => {
    if (!location || !matchedCity) return "#";

    return `/home?${new URLSearchParams({
      lat: location.lat.toFixed(5),
      lng: location.lng.toFixed(5),
      radius: String(radiusKm),
      label: location.label,
      city: matchedCity.slug,
    }).toString()}`;
  }, [location, matchedCity, radiusKm]);

  return (
    <div>
      {/* 1. Location */}
      <section className="mb-6 rounded border bg-white p-4">
        <h2 className="mb-3 font-semibold">1. Location</h2>

        <GpsButton onLocation={setLocation} />

        <div className="my-4 flex items-center gap-3 text-sm text-gray-500">
          <span className="h-px flex-1 bg-gray-200" />
          or
          <span className="h-px flex-1 bg-gray-200" />
        </div>

        {citiesError && (
          <p role="alert" className="mb-2 text-sm text-red-600">
            {citiesError}
          </p>
        )}

        {/* Show search after active cities load successfully. */}
        {citiesLoaded && !citiesError && (
          <LocationSearch
            bbox={cities[0]?.bbox ?? null}
            onLocation={setLocation}
          />
        )}

        {location && (
          <div
            className={`mt-4 rounded p-3 text-sm ${
              outsideArea ? "bg-red-50" : "bg-green-50"
            }`}
          >
            <p className="font-medium">{location.label}</p>

            <p>
              {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
            </p>

            {location.accuracy_m !== undefined && (
              <p className="text-gray-600">
                Accuracy: about {location.accuracy_m} m
              </p>
            )}

            {matchedCity && (
              <p className="text-green-700">
                Inside service area: {matchedCity.name}
              </p>
            )}
          </div>
        )}

        {outsideArea && (
          <p role="alert" className="mt-2 text-sm font-medium text-red-600">
            {coverageMessage(cities)} Please choose a location inside the
            service area.
          </p>
        )}
      </section>

      {/* 2. Radius */}
      <section className="mb-6 rounded border bg-white p-4">
        <h2 className="mb-3 font-semibold">2. Radius</h2>

        <RadiusSelector
          value={radiusKm}
          onChange={setRadiusKm}
        />

        <p className="mt-2 text-sm text-gray-600">
          Selected: {radiusKm} km
        </p>
      </section>

      {/* 3. Continue */}
      {canContinue ? (
        <Link
          href={homeHref}
          className="inline-block rounded bg-blue-600 px-4 py-2 text-white"
        >
          Continue to home
        </Link>
      ) : (
        <button
          type="button"
          disabled
          className="rounded bg-gray-300 px-4 py-2 text-gray-600"
        >
          Choose a location inside the service area
        </button>
      )}
    </div>
  );
}
