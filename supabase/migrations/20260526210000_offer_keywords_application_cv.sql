-- ARTEMSI : mots-cles CV/LM extraits par l'IA pour aider le candidat
-- + lien vers le CV utilise pour chaque candidature.

alter table public.offers
  add column if not exists keywords text[] null;

alter table public.applications
  add column if not exists cv_storage_path text null,
  add column if not exists cv_file_name text null;

create index if not exists applications_cv_storage_idx
  on public.applications (cv_storage_path)
  where cv_storage_path is not null;
