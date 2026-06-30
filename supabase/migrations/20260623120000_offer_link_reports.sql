-- Signalements de liens morts sur les offres

create table if not exists public.offer_link_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  offer_id uuid not null references public.offers(id) on delete cascade,
  notes text,
  created_at timestamptz not null default now(),
  unique (user_id, offer_id)
);

create index if not exists offer_link_reports_offer_idx
  on public.offer_link_reports (offer_id, created_at desc);

alter table public.offer_link_reports enable row level security;

drop policy if exists "Users read own offer link reports" on public.offer_link_reports;
create policy "Users read own offer link reports"
  on public.offer_link_reports
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users insert own offer link reports" on public.offer_link_reports;
create policy "Users insert own offer link reports"
  on public.offer_link_reports
  for insert
  to authenticated
  with check (auth.uid() = user_id);
