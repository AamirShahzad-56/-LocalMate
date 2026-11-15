
import type { CategoryId } from "@/lib/categories";

export type LocationChoice = {
  lat: number;
  lng: number;
  label: string;
  accuracy_m?: number;
};

export type Place = {
  id: string;
  name: string | null;
  category: CategoryId;
  address: string | null;
  lat: number;
  lng: number;
  distance_m?: number;
  tags: Record<string, string>;
};

export type Bbox = {
  west: number;
  south: number;
  east: number;
  north: number;
};

export type City = {
  id: string;
  name: string;
  slug: string;
  center_lat: number;
  center_lng: number;
  default_zoom: number;
  bbox: Bbox | null;
};