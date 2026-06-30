-- ARTEMSI V1 - Profil etendu : niveaux Bac+1/+4/+5, domaine d'etude, duree contrat
-- A executer dans Supabase SQL editor.

-- 1) Etendre l'enum study_level
do $$
begin
  if not exists (
    select 1 from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'study_level' and e.enumlabel = 'BAC_PLUS_1'
  ) then
    alter type public.study_level add value 'BAC_PLUS_1';
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'study_level' and e.enumlabel = 'BAC_PLUS_4'
  ) then
    alter type public.study_level add value 'BAC_PLUS_4';
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'study_level' and e.enumlabel = 'BAC_PLUS_5'
  ) then
    alter type public.study_level add value 'BAC_PLUS_5';
  end if;
end $$;

-- 2) Nouvelles colonnes profil + preferences
alter table public.profiles
  add column if not exists study_domain text,
  add column if not exists contract_duration text;

alter table public.user_preferences
  add column if not exists study_domain text,
  add column if not exists contract_duration text;
