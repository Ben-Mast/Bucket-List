create table public.bucket_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text,
  completed boolean not null default false,
  created_at timestamp with time zone not null default now(),
  completed_at timestamp with time zone
);

alter table public.bucket_items enable row level security;

grant select on table public.bucket_items to anon;
revoke insert, update, delete on table public.bucket_items from anon;

create policy "Anonymous users can read bucket items"
  on public.bucket_items
  for select
  to anon
  using (true);
