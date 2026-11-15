
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import GpsButton from "@/components/GpsButton";
import LocationSearch from "@/components/LocationSearch";

import { getActiveCities } from "@/lib/cities";
import { RADIUS_OPTIONS_KM } from "@/lib/categories";

import type { City, LocationChoice } from "@/types";

export default function LocationPicker() {
  const [location, setLocation] = useState<LocationChoice | null>(null);
  const [radiusKm] = useState<number>(3);

  const [city, setCity] = useState<City | null>(null);
  const [cityLoading, setCityLoading] = useState(true);
  const [cityError, setCityError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCity() {
      try {
        const cities = await getActiveCities();

        if (cancelled) return;

        if (cities.length === 0) {
          setCityError("No active service area is available.");
          return;
        }

        const activeCity = cities[0];

        if (!activeCity.bbox) {
          setCityError("The service area boundary is not configured.");
          return;
        }

        setCity(activeCity);
      } catch (error) {
        if (!cancelled) {
          setCityError(
            error instanceof Error
              ? error.message
              : "Could not load the service area."
          );
        }
      } finally {
        if (!cancelled) {
          setCityLoading(false);
        }
      }
    }

    loadCity();

    return () => {
      cancelled = true;
    };
  }, []);

  const homeHref = location
    ? `/home?${new URLSearchParams({
        lat: String(location.lat),
        lng: String(location.lng),
        radius: String(radiusKm),
      }).toString()}`
    : "#";

  return (
    <div>
      {/* 1. Location */}
      <section className="mb-6 rounded border bg-white p-4">
        <h2 className="mb-3 font-semibold">1. Location</h2>

        <GpsButton onLocation={setLocation} />

        <div className="my-4 border-t" />

        {cityLoading && (
          <p className="text-sm text-gray-500">
            Loading service area...
          </p>
        )}

        {cityError && (
          <p role="alert" className="text-sm text-red-600">
            {cityError}
          </p>
        )}

        {city?.bbox && (
          <LocationSearch
            bbox={city.bbox}
            onLocation={setLocation}
          />
        )}

        {location && (
          <div className="mt-4 rounded bg-green-50 p-3 text-sm">
            <p className="font-medium">{location.label}</p>

            <p>
              {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
            </p>

            {location.accuracy_m !== undefined && (
              <p className="text-gray-600">
                Accuracy: about {location.accuracy_m} m
              </p>
            )}
          </div>
        )}
      </section>

      {/* 2. Radius */}
      <section className="mb-6 rounded border bg-white p-4">
        <h2 className="mb-2 font-semibold">2. Radius</h2>

        <p className="text-sm text-gray-600">
          Options: {RADIUS_OPTIONS_KM.join(", ")} km.
          Using {radiusKm} km for now.
        </p>
      </section>

      {/* 3. Continue */}
      {location ? (
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
          Choose a location to continue
        </button>
      )}
    </div>
  );
}
