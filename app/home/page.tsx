
"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

import { TABS, type TabId } from "@/lib/categories";
import { parseHomeParams } from "@/lib/homeParams";

function HomeContent() {
  const params = useSearchParams();

  const [activeTab, setActiveTab] = useState<TabId>("area");

  // Convert URL parameters into a validated object.
  const homeParams = parseHomeParams({
    lat: params.get("lat") ?? undefined,
    lng: params.get("lng") ?? undefined,
    radius: params.get("radius") ?? undefined,
    label: params.get("label") ?? undefined,
    city: params.get("city") ?? undefined,
  });

  // Show an error if required URL parameters are missing or invalid.
  if (!homeParams) {
    return (
      <main className="mx-auto max-w-5xl p-4">
        <div className="rounded border bg-white p-6">
          <h1 className="mb-2 text-xl font-bold">Location missing</h1>

          <p className="mb-4 text-sm text-gray-600">
            Your location information is missing or invalid.
            Please go back and select your location again.
          </p>

          <a
            href="/location"
            className="inline-block rounded bg-blue-600 px-4 py-2 text-white"
          >
            Choose location
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl p-4">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded border bg-white p-4">
        <div>
          <h1 className="text-xl font-bold">LocalMate</h1>

          <p className="text-sm text-gray-600">
            Location: {homeParams.label}
          </p>

          <p className="text-sm text-gray-600">
            Coordinates: {homeParams.lat}, {homeParams.lng}
          </p>

          <p className="text-sm text-gray-600">
            Radius: {homeParams.radius} km
          </p>

          <p className="text-sm text-gray-600">
            Service area: {homeParams.city}
          </p>
        </div>

        <button
          type="button"
          className="rounded bg-blue-600 px-4 py-2 text-white"
          disabled
        >
          Ask AI Assistant
        </button>
      </div>

      {/* Category tabs */}
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm ${
              activeTab === tab.id
                ? "bg-blue-600 text-white"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active tab content */}
      <section className="rounded border bg-white p-4">
        <p>
          Active tab: <strong>{activeTab}</strong>
        </p>

        <p className="text-sm text-gray-600">
          Results for this tab will load here (Week 3).
        </p>
      </section>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<p className="p-4">Loading...</p>}>
      <HomeContent />
    </Suspense>
  );
}
