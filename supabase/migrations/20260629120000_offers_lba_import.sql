-- Import offres externes (La Bonne Alternance) — deduplication par cle stable.

alter table public.offers
  add column if not exists external_key text;

comment on column public.offers.external_key is
  'Cle de deduplication import (ex. lba:partner_label:partner_job_id).';

create unique index if not exists offers_external_key_unique_idx
  on public.offers (external_key)
  where external_key is not null;

create index if not exists offers_external_key_idx
  on public.offers (external_key)
  where external_key is not null;
