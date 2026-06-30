-- ARTEMSI V1 - Suivi des candidatures
-- A executer dans Supabase SQL editor.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'application_status') then
    create type public.application_status as enum (
      'sent',
      'interview',
      'accepted',
      'rejected',
      'archived'
    );
  end if;
end $$;

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  company text,
  location text,
  url text,
  status public.application_status not null default 'sent',
  applied_at date not null default now(),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists applications_set_updated_at on public.applications;
create trigger applications_set_updated_at
before update on public.applications
for each row
execute function public.set_updated_at();

alter table public.applications enable row level security;

drop policy if exists "Users can manage own applications" on public.applications;
create policy "Users can manage own applications"
  on public.applications
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists applications_user_idx
  on public.applications (user_id, applied_at desc);
