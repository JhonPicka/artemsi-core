-- Tag domaine d'étude sur les offres (aligné sur profiles.study_domain)

alter table public.offers
  add column if not exists study_domain text;

comment on column public.offers.study_domain is
  'Domaine d''étude cible (codes STUDY_DOMAINS : INFORMATIQUE, MARKETING, …, AUTRE).';

create index if not exists offers_study_domain_idx
  on public.offers (study_domain)
  where hidden_at is null;
