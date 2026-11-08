
import LocationPicker from "@/components/LocationPicker";

export default function LocationPage() {
  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Choose your location</h1>
      <LocationPicker />
    </main>
  );
}
