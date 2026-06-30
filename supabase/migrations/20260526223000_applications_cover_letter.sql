-- ARTEMSI : piece LM optionnelle sur les candidatures.

alter table public.applications
  add column if not exists cover_letter_storage_path text null,
  add column if not exists cover_letter_file_name text null;

create index if not exists applications_cover_letter_storage_idx
  on public.applications (cover_letter_storage_path)
  where cover_letter_storage_path is not null;
