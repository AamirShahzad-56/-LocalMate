
"use client";

import { useEffect, useRef, useState } from "react";
import type { Bbox, LocationChoice } from "@/types";
import { searchLocations } from "@/lib/geocoding";

type Props = {
  bbox: Bbox | null;
  onLocation: (location: LocationChoice) => void;
};

export default function LocationSearch({
  bbox,
  onLocation,
}: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocationChoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  const skipNextSearch = useRef(false);

  useEffect(() => {
    if (skipNextSearch.current) {
      skipNextSearch.current = false;
      return;
    }

    const cleanedQuery = query.trim();

    if (cleanedQuery.length < 3) {
      setResults([]);
      setShowResults(false);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);

        const locations = await searchLocations(
          cleanedQuery,
          bbox,
          controller.signal
        );

        if (!controller.signal.aborted) {
          setResults(locations);
          setShowResults(true);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong. Please try again."
          );

          setResults([]);
          setShowResults(true);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, bbox]);

  function handleSelect(location: LocationChoice) {
    skipNextSearch.current = true;

    setQuery(location.label);
    setResults([]);
    setShowResults(false);
    setError(null);

    onLocation(location);
  }

  return (
    <section className="mb-6 rounded border bg-white p-4">
      <h2 className="mb-3 font-semibold">
        Search for a location
      </h2>

      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => {
          if (results.length > 0) {
            setShowResults(true);
          }
        }}
        placeholder="Type a place name, e.g. Gulgasht or BZU"
        className="w-full rounded border px-3 py-2 outline-none focus:border-blue-500"
      />

      <p className="mt-2 text-xs text-gray-500">
        Enter at least 3 characters to search.
      </p>

      {loading && (
        <p className="mt-3 text-sm text-blue-600">
          Searching locations...
        </p>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {showResults && !loading && !error && results.length === 0 && (
        <p className="mt-3 text-sm text-gray-500">
          No matching locations found in this area.
        </p>
      )}

      {showResults && results.length > 0 && (
        <ul className="mt-3 max-h-60 overflow-y-auto rounded border">
          {results.map((location, index) => (
            <li key={`${location.lat}-${location.lng}-${index}`}>
              <button
                type="button"
                onClick={() => handleSelect(location)}
                className="w-full border-b px-3 py-3 text-left text-sm last:border-b-0 hover:bg-blue-50"
              >
                <span className="font-medium">
                  {location.label}
                </span>

                <span className="mt-1 block text-xs text-gray-500">
                  {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
