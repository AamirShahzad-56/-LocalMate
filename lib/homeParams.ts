
import { RADIUS_OPTIONS_KM } from "@/lib/categories";

export type HomeParams = {
  lat: number;
  lng: number;
  radius: number;
  label: string;
  city: string;
};

type RawHomeParams = Record<
  string,
  string | string[] | undefined
>;

export function parseHomeParams(
  params: RawHomeParams
): HomeParams | null {
  const latValue = params.lat;
  const lngValue = params.lng;
  const radiusValue = params.radius;
  const labelValue = params.label;
  const cityValue = params.city;

  // Reject missing or repeated URL parameters.
  if (
    typeof latValue !== "string" ||
    typeof lngValue !== "string" ||
    typeof radiusValue !== "string" ||
    typeof labelValue !== "string" ||
    typeof cityValue !== "string"
  ) {
    return null;
  }

  const lat = Number(latValue);
  const lng = Number(lngValue);
  const radius = Number(radiusValue);

  // Validate coordinates.
  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return null;
  }

  // Validate the selected radius.
  if (
    !RADIUS_OPTIONS_KM.some((option) => option === radius)
  ) {
    return null;
  }

  const label = labelValue.trim();
  const city = cityValue.trim();

  // Validate location label and city slug.
  if (!label || !city) {
    return null;
  }

  return {
    lat,
    lng,
    radius,
    label,
    city,
  };
}
