create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (btrim(name) <> ''),
  created_at timestamp with time zone not null default now()
);

create unique index categories_name_unique_ci
  on public.categories (lower(btrim(name)));

alter table public.categories enable row level security;

grant select, insert, update, delete on table public.categories to authenticated;

create policy "Authenticated users can manage categories"
  on public.categories
  for all
  to authenticated
  using (true)
  with check (true);

alter table public.bucket_items
  add column category_id uuid references public.categories(id) on delete set null;

insert into public.categories (name)
select distinct btrim(category)
from public.bucket_items
where category is not null and btrim(category) <> ''
on conflict do nothing;

update public.bucket_items as item
set category_id = category_row.id
from public.categories as category_row
where item.category is not null
  and lower(btrim(item.category)) = lower(btrim(category_row.name));

alter table public.bucket_items drop column category;
