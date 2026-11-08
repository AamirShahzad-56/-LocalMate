
import Link from "next/link";
import { RADIUS_OPTIONS_KM } from "@/lib/categories";

export default function LocationPage() {
  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-2xl font-bold">
        Choose your location
      </h1>

      <section className="mb-6 rounded border bg-white p-4">
        <h2 className="mb-2 font-semibold">1. Location</h2>
        <p className="text-sm text-gray-600">
          GPS button (Tue 10 Nov) and typed search (Wed 11 Nov) go here.
        </p>
      </section>

      <section className="mb-6 rounded border bg-white p-4">
        <h2 className="mb-2 font-semibold">2. Radius</h2>
        <p className="text-sm text-gray-600">
          Options: {RADIUS_OPTIONS_KM.join(", ")} km (selector on Thu 12 Nov).
        </p>
      </section>

      <Link
        href="/home?lat=30.1575&lng=71.4753&radius=3"
        className="inline-block rounded bg-blue-600 px-4 py-2 text-white"
      >
        Continue to home (temporary)
      </Link>
    </main>
  );
}
