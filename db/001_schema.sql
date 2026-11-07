-- =========================================
-- BLOCK A: CITIES AND PROFILES
-- =========================================

create table cities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  center_lat double precision not null,
  center_lng double precision not null,
  bbox_south double precision,
  bbox_west double precision,
  bbox_north double precision,
  bbox_east double precision,
  default_zoom int not null default 12,
  is_active boolean not null default true
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

-- =========================================
-- BLOCK B: PLACES AND PLACE DOCUMENTS
-- =========================================

create table places (
  id uuid primary key default gen_random_uuid(),
  osm_type text not null check (osm_type in ('node', 'way', 'relation')),
  osm_id bigint not null,
  city_id uuid not null references cities(id),
  name text,
  category text not null check (
    category in ('services', 'hospitals', 'fitness', 'parks', 'shopping', 'food', 'hotels')
  ),
  location geography(Point, 4326) not null,
  address text,
  tags jsonb not null default '{}'::jsonb,
  fetched_at timestamptz not null default now(),
  unique (osm_type, osm_id)
);

create table place_documents (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null unique references places(id) on delete cascade,
  content text not null,
  updated_at timestamptz not null default now()
);

-- =========================================
-- BLOCK C: SEARCHES, SAVED PLACES AND CHAT
-- =========================================

create table searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  city_id uuid references cities(id),
  lat double precision not null,
  lng double precision not null,
  radius_m int not null,
  category text,
  result_count int,
  created_at timestamptz not null default now()
);

create table saved_places (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  place_id uuid not null references places(id) on delete cascade,
  note text,
  created_at timestamptz not null default now(),
  unique (user_id, place_id)
);

create table chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text,
  created_at timestamptz not null default now()
);

create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references chat_sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  place_ids uuid[] not null default '{}',
  created_at timestamptz not null default now()
);

-- =========================================
-- BLOCK D: DATABASE INDEXES
-- =========================================

create index places_location_gist
on places using gist (location);

create index places_city_category_idx
on places (city_id, category);

create index places_tags_gin
on places using gin (tags);

create index searches_user_idx
on searches (user_id, created_at desc);

create index chat_messages_session_idx
on chat_messages (session_id, created_at);

-- =========================================
-- BLOCK E: ENABLE ROW LEVEL SECURITY
-- =========================================

alter table cities enable row level security;
alter table profiles enable row level security;
alter table places enable row level security;
alter table place_documents enable row level security;
alter table searches enable row level security;
alter table saved_places enable row level security;
alter table chat_sessions enable row level security;
alter table chat_messages enable row level security;

-- Public read access for cities and places
create policy "Public can read cities"
on cities
for select
using (true);

create policy "Public can read places"
on places
for select
using (true);

-- =========================================
-- BLOCK F: MULTAN CITY AND SAMPLE PLACES
-- =========================================

-- Insert Multan city
insert into cities (
  name,
  slug,
  center_lat,
  center_lng,
  bbox_south,
  bbox_west,
  bbox_north,
  bbox_east,
  default_zoom
)
values (
  'Multan',
  'multan',
  30.1575,
  71.4753,
  30.08,
  71.33,
  30.27,
  71.62,
  12
);

-- Insert 5 sample places linked to Multan
insert into places (
  osm_type,
  osm_id,
  city_id,
  name,
  category,
  location,
  address,
  tags
)
select
  'node',
  v.osm_id,
  c.id,
  v.name,
  v.category,
  ST_SetSRID(ST_MakePoint(v.lng, v.lat), 4326)::geography,
  v.address,
  v.tags::jsonb
from cities c,
(
  values
    (-1, 'Nishtar Hospital (sample)', 'hospitals', 71.4388, 30.2015, 'Nishtar Road, Multan',
      '{"amenity":"hospital","opening_hours":"24/7"}'),
    (-2, 'Qasim Bagh (sample)', 'parks', 71.4715, 30.1995, 'Near Multan Fort, Multan',
      '{"leisure":"park"}'),
    (-3, 'Sample Restaurant', 'food', 71.4720, 30.2330, 'Gulgasht Colony, Multan',
      '{"amenity":"restaurant","cuisine":"pakistani","outdoor_seating":"yes"}'),
    (-4, 'Sample Hotel', 'hotels', 71.4400, 30.1800, 'Cantt, Multan',
      '{"tourism":"hotel","parking":"yes"}'),
    (-5, 'Sample Bank', 'services', 71.4510, 30.2290, 'Bosan Road, Multan',
      '{"amenity":"bank"}')
) as v(osm_id, name, category, lng, lat, address, tags)
where c.slug = 'multan';

-- =========================================
-- BLOCK G: VERIFICATION QUERIES
-- Run these after creating the tables and inserting sample data.
-- =========================================

-- Check the 5 sample places and their coordinates
select
  name,
  category,
  ST_Y(location::geometry) as lat,
  ST_X(location::geometry) as lng
from places
order by osm_id desc;

-- Count places belonging to each city
select
  c.name as city,
  count(p.id) as places
from cities c
left join places p on p.city_id = c.id
group by c.name;