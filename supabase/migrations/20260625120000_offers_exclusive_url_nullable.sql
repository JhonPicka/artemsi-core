-- Offres exclusives : URL facultative + lecture directe par les candidats connectés

alter table public.offers
  alter column url drop not null;

comment on column public.offers.url is
  'Lien externe vers l''annonce. Facultatif pour les offres exclusives ARTEMSI.';

drop policy if exists "Authenticated can read partner exclusive offers" on public.offers;
create policy "Authenticated can read partner exclusive offers"
  on public.offers
  for select
  to authenticated
  using (is_partner_exclusive = true and hidden_at is null);
