
import { haversineKm } from "@/lib/geo";

const center = {
  lat: 30.1575,
  lng: 71.4753,
};

const samplePlaces = [
  {
    name: "Far place",
    lat: 30.1800,
    lng: 71.4753,
  },
  {
    name: "Near place",
    lat: 30.1600,
    lng: 71.4753,
  },
  {
    name: "Middle place",
    lat: 30.1700,
    lng: 71.4753,
  },
];

const placesWithDistances = samplePlaces
  .map((place) => ({
    ...place,
    distance_m: Math.round(
      haversineKm(
        center.lat,
        center.lng,
        place.lat,
        place.lng
      ) * 1000
    ),
  }))
  .sort((a, b) => a.distance_m - b.distance_m);

console.log("--- Places sorted by distance ---");

for (const place of placesWithDistances) {
  console.log(`${place.name}: ${place.distance_m} metres`);
}

const isSorted = placesWithDistances.every(
  (place, index, array) =>
    index === 0 ||
    array[index - 1].distance_m <= place.distance_m
);

console.log(
  isSorted
    ? "PASSED: Places are sorted nearest first."
    : "FAILED: Places are not sorted correctly."
);
