-- Billing gating minimal pour lancement MVP payant.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'subscription_status') then
    create type public.subscription_status as enum (
      'inactive',
      'active',
      'past_due',
      'canceled'
    );
  end if;
end $$;

alter table public.profiles
  add column if not exists subscription_status public.subscription_status not null default 'inactive',
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists subscription_current_period_end timestamptz;

create table if not exists public.billing_customers (
  email text primary key,
  subscription_status public.subscription_status not null default 'inactive',
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_checkout_session_id text,
  current_period_end timestamptz,
  last_event_type text,
  last_event_id text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.billing_customers enable row level security;

drop policy if exists "No direct read billing_customers" on public.billing_customers;
create policy "No direct read billing_customers"
  on public.billing_customers
  for select
  using (false);

drop policy if exists "No direct write billing_customers" on public.billing_customers;
create policy "No direct write billing_customers"
  on public.billing_customers
  for all
  using (false)
  with check (false);
