-- Raccourci candidat par offre : { tips: string[] }.

alter table public.offers
  add column if not exists application_guide jsonb null;

comment on column public.offers.application_guide is
  'Raccourci candidat : tips[] (3-6 points concis pour adapter CV/LM)';
