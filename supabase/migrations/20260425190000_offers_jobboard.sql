-- ARTEMSI V1 - Jobboard public (offres visibles a tous les utilisateurs)
-- A executer dans Supabase SQL editor.

alter table public.offers
  add column if not exists is_public boolean not null default false;

drop policy if exists "Authenticated can read public offers" on public.offers;
create policy "Authenticated can read public offers"
  on public.offers
  for select
  to authenticated
  using (is_public = true);

create index if not exists offers_is_public_created_idx
  on public.offers (is_public, created_at desc);
