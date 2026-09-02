grant select, insert, update, delete on table public.bucket_items to authenticated;

create policy "Authenticated users can read bucket items"
  on public.bucket_items
  for select
  to authenticated
  using (true);

create policy "Authenticated users can insert bucket items"
  on public.bucket_items
  for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update bucket items"
  on public.bucket_items
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete bucket items"
  on public.bucket_items
  for delete
  to authenticated
  using (true);
