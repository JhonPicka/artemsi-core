-- ARTEMSI V1 - Offres recues par utilisateur
-- A executer dans Supabase SQL editor.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'offer_source') then
    create type public.offer_source as enum ('indeed', 'partner', 'autre');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'offer_assignment_status') then
    create type public.offer_assignment_status as enum (
      'sent',
      'seen',
      'applied',
      'archived'
    );
  end if;
end $$;

create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company text,
  location text,
  url text not null,
  source public.offer_source not null default 'indeed',
  is_partner_exclusive boolean not null default false,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.offer_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  offer_id uuid not null references public.offers(id) on delete cascade,
  status public.offer_assignment_status not null default 'sent',
  assigned_at timestamptz not null default now(),
  seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, offer_id)
);

drop trigger if exists offers_set_updated_at on public.offers;
create trigger offers_set_updated_at
before update on public.offers
for each row
execute function public.set_updated_at();

drop trigger if exists offer_assignments_set_updated_at on public.offer_assignments;
create trigger offer_assignments_set_updated_at
before update on public.offer_assignments
for each row
execute function public.set_updated_at();

alter table public.offers enable row level security;
alter table public.offer_assignments enable row level security;

drop policy if exists "Users can read assigned offers" on public.offers;
create policy "Users can read assigned offers"
  on public.offers
  for select
  to authenticated
  using (
    exists (
      select 1 from public.offer_assignments oa
      where oa.offer_id = public.offers.id
        and oa.user_id = auth.uid()
    )
  );

drop policy if exists "Users can read own offer assignments" on public.offer_assignments;
create policy "Users can read own offer assignments"
  on public.offer_assignments
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can update own offer assignments" on public.offer_assignments;
create policy "Users can update own offer assignments"
  on public.offer_assignments
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists offer_assignments_user_idx
  on public.offer_assignments (user_id, assigned_at desc);
