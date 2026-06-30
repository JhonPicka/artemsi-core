-- Durcit la securite billing sur profiles + evite les doublons candidature/offre.

create or replace function public.prevent_profile_billing_self_write()
returns trigger
language plpgsql
as $$
begin
  -- On bloque uniquement les ecritures faites dans un contexte utilisateur authentifie.
  if auth.role() = 'authenticated' and auth.uid() = coalesce(new.id, old.id) then
    if tg_op = 'INSERT' then
      if new.subscription_status is distinct from 'inactive'
        or new.stripe_customer_id is not null
        or new.stripe_subscription_id is not null
        or new.subscription_current_period_end is not null then
        raise exception 'Billing fields are managed server-side only';
      end if;
    elsif tg_op = 'UPDATE' then
      if new.subscription_status is distinct from old.subscription_status
        or new.stripe_customer_id is distinct from old.stripe_customer_id
        or new.stripe_subscription_id is distinct from old.stripe_subscription_id
        or new.subscription_current_period_end is distinct from old.subscription_current_period_end then
        raise exception 'Billing fields are managed server-side only';
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_billing_self_write on public.profiles;
create trigger profiles_prevent_billing_self_write
before insert or update on public.profiles
for each row
execute function public.prevent_profile_billing_self_write();

with ranked as (
  select
    id,
    row_number() over (
      partition by user_id, offer_id
      order by created_at asc, id asc
    ) as rn
  from public.applications
  where offer_id is not null
)
delete from public.applications a
using ranked r
where a.id = r.id
  and r.rn > 1;

create unique index if not exists applications_user_offer_unique_idx
  on public.applications (user_id, offer_id)
  where offer_id is not null;
