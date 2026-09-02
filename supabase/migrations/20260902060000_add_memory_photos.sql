alter table public.bucket_items
  add column memory_photo_path text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'bucket-memories',
  'bucket-memories',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "Authenticated users can view bucket memories"
  on storage.objects for select to authenticated
  using (bucket_id = 'bucket-memories');

create policy "Authenticated users can upload bucket memories"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'bucket-memories');

create policy "Authenticated users can update bucket memories"
  on storage.objects for update to authenticated
  using (bucket_id = 'bucket-memories')
  with check (bucket_id = 'bucket-memories');

create policy "Authenticated users can delete bucket memories"
  on storage.objects for delete to authenticated
  using (bucket_id = 'bucket-memories');
