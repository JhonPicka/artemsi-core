-- ARTEMSI V1 - Auth/Profile/Onboarding foundation
-- Run with Supabase migration tooling.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'study_level') then
    create type public.study_level as enum (
      'CAP_BEP',
      'BAC',
      'BAC_PLUS_2',
      'BAC_PLUS_3',
      'BAC_PLUS_4_5',
      'AUTRE'
    );
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'contract_type') then
    create type public.contract_type as enum (
      'ALTERNANCE',
      'APPRENTISSAGE',
      'PRO',
      'AUTRE'
    );
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'document_type') then
    create type public.document_type as enum ('cv', 'cover_letter');
  end if;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  phone text,
  school_name text,
  study_level public.study_level,
  target_job text,
  regions text[] not null default '{}'::text[],
  start_date date,
  contract_type public.contract_type,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  search_regions text[] not null default '{}'::text[],
  target_job text,
  contract_type public.contract_type,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  document_type public.document_type not null,
  file_path text not null,
  file_name text not null,
  mime_type text not null,
  file_size_bytes integer not null check (file_size_bytes > 0),
  is_active boolean not null default true,
  uploaded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists user_documents_single_active_type_idx
  on public.user_documents(user_id, document_type)
  where is_active = true;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists user_preferences_set_updated_at on public.user_preferences;
create trigger user_preferences_set_updated_at
before update on public.user_preferences
for each row
execute function public.set_updated_at();

drop trigger if exists user_documents_set_updated_at on public.user_documents;
create trigger user_documents_set_updated_at
before update on public.user_documents
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.user_documents enable row level security;

drop policy if exists "Users manage own profile" on public.profiles;
create policy "Users manage own profile"
  on public.profiles
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Users manage own preferences" on public.user_preferences;
create policy "Users manage own preferences"
  on public.user_preferences
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage own documents" on public.user_documents;
create policy "Users manage own documents"
  on public.user_documents
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'user-documents',
  'user-documents',
  false,
  10485760,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do nothing;

drop policy if exists "Users can upload own documents" on storage.objects;
create policy "Users can upload own documents"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'user-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can read own documents" on storage.objects;
create policy "Users can read own documents"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'user-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can update own documents" on storage.objects;
create policy "Users can update own documents"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'user-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'user-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can delete own documents" on storage.objects;
create policy "Users can delete own documents"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'user-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
