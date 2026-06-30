-- Onboarding étendu : rythme alternance, secteurs, attribution, urgence recherche

alter table public.profiles
  add column if not exists alternance_rhythm text,
  add column if not exists alternance_rhythm_other text,
  add column if not exists preferred_sectors text[] not null default '{}'::text[],
  add column if not exists acquisition_source text,
  add column if not exists acquisition_source_other text,
  add column if not exists applications_sent_range text,
  add column if not exists search_level text;

alter table public.user_preferences
  add column if not exists preferred_sectors text[] not null default '{}'::text[],
  add column if not exists alternance_rhythm text;
