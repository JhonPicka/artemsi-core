-- Validation admin quotidienne (jour civil Paris) avant import LBA automatique.

create table if not exists public.lba_import_daily_decisions (
  import_date date not null primary key,
  approved boolean not null default false,
  decided_at timestamptz,
  decided_by uuid references auth.users (id) on delete set null
);

comment on table public.lba_import_daily_decisions is
  'Choix admin chaque matin : autoriser ou non l''import LBA automatique du jour (Paris).';

alter table public.lba_import_daily_decisions enable row level security;
