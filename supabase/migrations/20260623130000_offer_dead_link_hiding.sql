-- Masquage automatique des offres apres signalements de lien mort

alter table public.offers
  add column if not exists hidden_at timestamptz,
  add column if not exists hidden_reason text;

create index if not exists offers_hidden_at_idx
  on public.offers (hidden_at)
  where hidden_at is not null;

drop policy if exists "Authenticated can read public offers" on public.offers;
create policy "Authenticated can read public offers"
  on public.offers
  for select
  to authenticated
  using (is_public = true and hidden_at is null);

drop policy if exists "Users can read assigned offers" on public.offers;
create policy "Users can read assigned offers"
  on public.offers
  for select
  to authenticated
  using (
    hidden_at is null
    and exists (
      select 1 from public.offer_assignments oa
      where oa.offer_id = public.offers.id
        and oa.user_id = auth.uid()
    )
  );
