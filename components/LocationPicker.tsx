
"use client";

import { useState } from "react";
import Link from "next/link";
import GpsButton from "@/components/GpsButton";
import { RADIUS_OPTIONS_KM } from "@/lib/categories";
import type { LocationChoice } from "@/types";

export default function LocationPicker() {
  const [location, setLocation] = useState<LocationChoice | null>(null);
  const [radiusKm] = useState<number>(3);

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

        <p className="my-3 text-sm text-gray-500">
          Or type a location (coming Wed 11 Nov).
        </p>

        {location && (
          <div className="rounded bg-green-50 p-3 text-sm">
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

      {/* 2. Radius (placeholder) */}
      <section className="mb-6 rounded border bg-white p-4">
        <h2 className="mb-2 font-semibold">2. Radius</h2>
        <p className="text-sm text-gray-600">
          Options: {RADIUS_OPTIONS_KM.join(", ")} km (selector on Thu 12 Nov).
          Using {radiusKm} km for now.
        </p>
      </section>

      {/* Continue */}
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
