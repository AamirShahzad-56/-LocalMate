CREATE OR REPLACE FUNCTION nearby_places(
  p_lat double precision,
  p_lng double precision,
  p_radius_m int,
  p_category text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  name text,
  category text,
  address text,
  tags jsonb,
  lat double precision,
  lng double precision,
  distance_m double precision
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    p.id,
    p.name,
    p.category,
    p.address,
    p.tags,
    ST_Y(p.location::geometry) AS lat,
    ST_X(p.location::geometry) AS lng,
    ST_Distance(
      p.location,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
    ) AS distance_m
  FROM places p
  WHERE ST_DWithin(
    p.location,
    ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
    p_radius_m
  )
  AND (p_category IS NULL OR p.category = p_category)
  ORDER BY distance_m;
$$;