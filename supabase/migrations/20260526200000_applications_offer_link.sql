-- ARTEMSI : lier les candidatures aux offres pour permettre le comptage
-- (utilise par les quotas sur offres exclusives).

alter table public.applications
  add column if not exists offer_id uuid null references public.offers(id) on delete set null;

create index if not exists applications_offer_idx
  on public.applications (offer_id);
