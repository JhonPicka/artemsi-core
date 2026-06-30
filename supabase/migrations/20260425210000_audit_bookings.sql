-- ARTEMSI V1 - Reservation d'audit + notifications
-- A executer dans Supabase SQL editor.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'audit_status') then
    create type public.audit_status as enum (
      'pending',
      'confirmed',
      'declined',
      'cancelled'
    );
  end if;
end $$;

create table if not exists public.audit_bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  slot_start timestamptz not null,
  slot_end timestamptz not null,
  status public.audit_status not null default 'pending',
  user_notes text,
  admin_notes text,
  admin_token text not null default encode(gen_random_bytes(16), 'hex'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists audit_bookings_active_slot_idx
  on public.audit_bookings (slot_start)
  where status in ('pending', 'confirmed');

create index if not exists audit_bookings_user_idx
  on public.audit_bookings (user_id, slot_start desc);

drop trigger if exists audit_bookings_set_updated_at on public.audit_bookings;
create trigger audit_bookings_set_updated_at
before update on public.audit_bookings
for each row
execute function public.set_updated_at();

alter table public.audit_bookings enable row level security;

drop policy if exists "Users can read own audit bookings" on public.audit_bookings;
create policy "Users can read own audit bookings"
  on public.audit_bookings
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can create own pending audit bookings" on public.audit_bookings;
create policy "Users can create own pending audit bookings"
  on public.audit_bookings
  for insert
  to authenticated
  with check (auth.uid() = user_id and status = 'pending');

drop policy if exists "Users can cancel own pending audit bookings" on public.audit_bookings;
create policy "Users can cancel own pending audit bookings"
  on public.audit_bookings
  for update
  to authenticated
  using (auth.uid() = user_id and status = 'pending')
  with check (auth.uid() = user_id and status in ('pending', 'cancelled'));

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  message text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_unread_idx
  on public.notifications (user_id, read_at, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "Users can read own notifications" on public.notifications;
create policy "Users can read own notifications"
  on public.notifications
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can update own notifications" on public.notifications;
create policy "Users can update own notifications"
  on public.notifications
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.notify_audit_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    if new.status = 'confirmed' then
      insert into public.notifications (user_id, type, title, message, link)
      values (
        new.user_id,
        'audit_confirmed',
        'Audit confirme',
        format('Ton audit du %s est confirme.', to_char(new.slot_start at time zone 'Europe/Paris', 'DD/MM/YYYY a HH24:MI')),
        '/dashboard/audit'
      );
    elsif new.status = 'declined' then
      insert into public.notifications (user_id, type, title, message, link)
      values (
        new.user_id,
        'audit_declined',
        'Audit refuse',
        format('Ton audit du %s n a pas pu etre confirme. Choisis un autre creneau.', to_char(new.slot_start at time zone 'Europe/Paris', 'DD/MM/YYYY a HH24:MI')),
        '/dashboard/audit'
      );
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists audit_status_change_trigger on public.audit_bookings;
create trigger audit_status_change_trigger
after update on public.audit_bookings
for each row
execute function public.notify_audit_status_change();
