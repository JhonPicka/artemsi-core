-- ARTEMSI : quota de candidats pour les offres exclusives uniquement.
-- Quand is_partner_exclusive = true, max_applicants peut limiter le nombre
-- de candidatures liees a une offre. NULL = pas de quota (comportement actuel).

alter table public.offers
  add column if not exists max_applicants integer null;

-- Sanity check au niveau base : interdire les valeurs negatives ou zero.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'offers_max_applicants_positive'
  ) then
    alter table public.offers
      add constraint offers_max_applicants_positive
      check (max_applicants is null or max_applicants > 0);
  end if;
end $$;
