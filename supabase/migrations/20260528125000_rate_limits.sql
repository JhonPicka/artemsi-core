create table if not exists public.rate_limits (
  bucket text not null,
  key text not null,
  count integer not null default 0,
  reset_at timestamptz not null,
  primary key (bucket, key)
);

alter table public.rate_limits enable row level security;

create or replace function public.consume_rate_limit(
  p_bucket text,
  p_key text,
  p_limit integer,
  p_window_seconds integer,
  p_now_ms bigint
)
returns table(ok boolean, retry_after_sec integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := to_timestamp(p_now_ms::double precision / 1000.0);
  v_row public.rate_limits%rowtype;
begin
  insert into public.rate_limits (bucket, key, count, reset_at)
  values (p_bucket, p_key, 1, v_now + make_interval(secs => p_window_seconds))
  on conflict (bucket, key) do nothing;

  select *
  into v_row
  from public.rate_limits
  where bucket = p_bucket
    and key = p_key
  for update;

  if v_row.reset_at <= v_now then
    update public.rate_limits
    set count = 1,
        reset_at = v_now + make_interval(secs => p_window_seconds)
    where bucket = p_bucket
      and key = p_key;
    return query select true, 0;
    return;
  end if;

  if v_row.count >= p_limit then
    return query
      select false, greatest(1, ceil(extract(epoch from (v_row.reset_at - v_now)))::integer);
    return;
  end if;

  update public.rate_limits
  set count = v_row.count + 1
  where bucket = p_bucket
    and key = p_key;

  return query select true, 0;
end;
$$;

revoke all on function public.consume_rate_limit(text, text, integer, integer, bigint) from public;
grant execute on function public.consume_rate_limit(text, text, integer, integer, bigint) to service_role;
