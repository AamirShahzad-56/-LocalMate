
"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { TABS, type TabId } from "@/lib/categories";

function HomeContent() {
  const params = useSearchParams();
  const lat = params.get("lat");
  const lng = params.get("lng");
  const radius = params.get("radius");

  const [activeTab, setActiveTab] = useState<TabId>("area");

  return (
    <main className="mx-auto max-w-5xl p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded border bg-white p-4">
        <div>
          <h1 className="text-xl font-bold">LocalMate</h1>
          <p className="text-sm text-gray-600">
            Location: {lat}, {lng} · Radius: {radius} km
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
