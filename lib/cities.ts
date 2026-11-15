import { supabase } from "@/lib/supabase";
import type { City } from "@/types";

export async function getActiveCities(): Promise<City[]> {
  const { data, error } = await supabase
    .from("cities")
    .select(
      "id, name, slug, center_lat, center_lng, default_zoom, bbox_south, bbox_west, bbox_north, bbox_east"
    )
    .eq("is_active", true);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    center_lat: c.center_lat,
    center_lng: c.center_lng,
    default_zoom: c.default_zoom,
    bbox:
      c.bbox_south !== null &&
      c.bbox_west !== null &&
      c.bbox_north !== null &&
      c.bbox_east !== null
        ? {
            south: c.bbox_south,
            west: c.bbox_west,
            north: c.bbox_north,
            east: c.bbox_east,
          }
        : null,
  }));
}