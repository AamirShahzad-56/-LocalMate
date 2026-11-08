
"use client";

import { useState } from "react";
import type { LocationChoice } from "@/types";

type Props = {
  onLocation: (loc: LocationChoice) => void;
};

export default function GpsButton({ onLocation }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);

    if (!("geolocation" in navigator)) {
      setError(
        "Your browser does not support GPS. Please type your location instead."
      );
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoading(false);
        onLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: "My current location",
          accuracy_m: Math.round(pos.coords.accuracy),
        });
      },
      (err) => {
        setLoading(false);

        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError(
              "Location permission was denied. Allow location access in your browser settings, or type your location instead."
            );
            break;
          case err.POSITION_UNAVAILABLE:
            setError(
              "Your position could not be determined. Check that location is turned on, or type your location instead."
            );
            break;
          case err.TIMEOUT:
            setError(
              "Getting your location took too long. Please try again, or type your location instead."
            );
            break;
          default:
            setError("Something went wrong while getting your location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
      >
        {loading
          ? "Getting your location..."
          : "Use my current location (GPS)"}
      </button>

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
