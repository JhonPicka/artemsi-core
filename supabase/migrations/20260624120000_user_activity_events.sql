-- Suivi d'activité candidat (clics, offres, navigation) pour l'admin.

create table if not exists public.user_activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists user_activity_events_user_idx
  on public.user_activity_events (user_id, created_at desc);

create index if not exists user_activity_events_type_idx
  on public.user_activity_events (event_type, created_at desc);

alter table public.user_activity_events enable row level security;

drop policy if exists "Users insert own activity events" on public.user_activity_events;
create policy "Users insert own activity events"
  on public.user_activity_events
  for insert
  to authenticated
  with check (auth.uid() = user_id);
