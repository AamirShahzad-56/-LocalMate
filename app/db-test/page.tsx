
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Place = {
  id: string;
  name: string | null;
  category: string;
  address: string | null;
  tags: Record<string, unknown> | null;
  lat: number;
  lng: number;
  distance_m: number;
};

export default function DbTestPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.rpc("nearby_places", {
        p_lat: 30.1575,
        p_lng: 71.4753,
        p_radius_m: 5000,
        p_category: null,
      });

      if (error) {
        setError(error.message);
      } else {
        setPlaces(data ?? []);
      }

      setLoading(false);
    }

    load();
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Nearby Places in Multan
      </h1>

      <p className="mb-4 text-gray-600">
        Searching within 5 km of Multan city center.
      </p>

      {loading && <p>Loading nearby places...</p>}

      {error && (
        <p className="text-red-600">
          Error: {error}
        </p>
      )}

      {!loading && !error && places.length === 0 && (
        <p>No nearby places found.</p>
      )}

      <ul className="space-y-3">
        {places.map((p) => (
          <li key={p.id} className="border rounded-lg p-4">
            <p className="font-semibold text-lg">
              {p.name ?? "Unnamed place"}
            </p>

            <p className="text-sm text-gray-600">
              {p.category} · {p.address ?? "Address unavailable"}
            </p>

            <p className="text-sm mt-2">
              Distance: {(p.distance_m / 1000).toFixed(2)} km
            </p>

            <p className="text-sm">
              Coordinates: {p.lat}, {p.lng}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
