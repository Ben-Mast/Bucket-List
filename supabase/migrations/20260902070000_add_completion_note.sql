alter table public.bucket_items
  add column completion_note text
  check (completion_note is null or char_length(completion_note) <= 500);
