create table public.locations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (btrim(name) <> ''),
  created_at timestamp with time zone not null default now()
);

create unique index locations_name_unique_ci on public.locations (lower(btrim(name)));
alter table public.locations enable row level security;
grant select, insert, update, delete on table public.locations to authenticated;
create policy "Authenticated users can manage locations" on public.locations
  for all to authenticated using (true) with check (true);

create table public.weather_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null check (btrim(name) <> ''),
  created_at timestamp with time zone not null default now()
);

create unique index weather_tags_name_unique_ci on public.weather_tags (lower(btrim(name)));
alter table public.weather_tags enable row level security;
grant select, insert, update, delete on table public.weather_tags to authenticated;
create policy "Authenticated users can manage weather tags" on public.weather_tags
  for all to authenticated using (true) with check (true);

alter table public.bucket_items
  add column location_id uuid references public.locations(id) on delete set null,
  add column weather_id uuid references public.weather_tags(id) on delete set null;
