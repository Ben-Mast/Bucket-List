drop policy if exists "Anonymous users can read bucket items"
  on public.bucket_items;

revoke select on table public.bucket_items from anon;
