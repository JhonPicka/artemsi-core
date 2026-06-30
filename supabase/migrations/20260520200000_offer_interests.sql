-- Pool jobboard : interets utilisateur sur des offres publiques → affinage du matching

create table if not exists public.offer_interests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  offer_id uuid not null references public.offers(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, offer_id)
);

create index if not exists offer_interests_user_idx
  on public.offer_interests (user_id, created_at desc);

alter table public.user_preferences
  add column if not exists interest_keywords text[] not null default '{}'::text[];

alter table public.offer_interests enable row level security;

drop policy if exists "Users read own offer interests" on public.offer_interests;
create policy "Users read own offer interests"
  on public.offer_interests
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users insert own offer interests" on public.offer_interests;
create policy "Users insert own offer interests"
  on public.offer_interests
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users delete own offer interests" on public.offer_interests;
create policy "Users delete own offer interests"
  on public.offer_interests
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- Lecture des offres publiques pour verifier l'interet (deja via is_public policy)
