-- Retours de suppression de compte (conservés après effacement du compte auth).

create table if not exists public.account_deletion_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  email text,
  reason_code text not null,
  reason_detail text,
  created_at timestamptz not null default now()
);

create index if not exists account_deletion_feedback_created_at_idx
  on public.account_deletion_feedback (created_at desc);

alter table public.account_deletion_feedback enable row level security;

drop policy if exists "No direct access account_deletion_feedback" on public.account_deletion_feedback;
create policy "No direct access account_deletion_feedback"
  on public.account_deletion_feedback
  for all
  using (false)
  with check (false);
