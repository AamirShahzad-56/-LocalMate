
"use client";

import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => <p>Loading map...</p>,
});

export default function MapTestPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Map test</h1>
      <Map />
    </main>
  );
}
