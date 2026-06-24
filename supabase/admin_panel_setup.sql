create extension if not exists pgcrypto with schema extensions;

create table if not exists public.app_admin_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public.app_admin_settings enable row level security;
revoke all on public.app_admin_settings from anon, authenticated;

-- IMPORTANTE: antes de executar, troque MINHA-SENHA-ADMIN-AQUI por uma senha forte sua.
insert into public.app_admin_settings (key, value, updated_at)
values (
  'license_admin_password_hash',
  encode(digest('MINHA-SENHA-ADMIN-AQUI', 'sha256'), 'hex'),
  now()
)
on conflict (key) do update
set value = excluded.value,
    updated_at = now();

create or replace function public.admin_password_matches(p_admin_password text)
returns boolean
language sql
security definer
set search_path = public, extensions
as $$
  select exists (
    select 1
    from public.app_admin_settings
    where key = 'license_admin_password_hash'
      and value = encode(digest(coalesce(p_admin_password, ''), 'sha256'), 'hex')
  );
$$;

create or replace function public.admin_license_json(p_license public.product_licenses)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id', p_license.id,
    'product_slug', p_license.product_slug,
    'customer_note', p_license.customer_note,
    'max_devices', p_license.max_devices,
    'active', p_license.active,
    'created_at', p_license.created_at,
    'activation_count', (
      select count(*)::int
      from public.product_activations a
      where a.license_id = p_license.id
    ),
    'last_seen_at', (
      select max(a.last_seen_at)
      from public.product_activations a
      where a.license_id = p_license.id
    )
  );
$$;

create or replace function public.admin_list_licenses(
  p_admin_password text,
  p_product_slug text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if not public.admin_password_matches(p_admin_password) then
    return jsonb_build_object('ok', false, 'reason', 'invalid_admin_password');
  end if;

  select coalesce(jsonb_agg(public.admin_license_json(l) order by l.created_at desc), '[]'::jsonb)
  into result
  from public.product_licenses l
  where l.product_slug = trim(p_product_slug);

  return jsonb_build_object('ok', true, 'licenses', result);
end;
$$;

create or replace function public.admin_create_license(
  p_admin_password text,
  p_product_slug text,
  p_code text,
  p_customer_note text,
  p_max_devices integer default 2
) returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  clean_code text;
  created_license public.product_licenses%rowtype;
begin
  if not public.admin_password_matches(p_admin_password) then
    return jsonb_build_object('ok', false, 'reason', 'invalid_admin_password');
  end if;

  clean_code := upper(trim(p_code));

  if length(clean_code) < 6 then
    return jsonb_build_object('ok', false, 'reason', 'invalid_code');
  end if;

  insert into public.product_licenses (product_slug, code_hash, customer_note, max_devices)
  values (
    trim(p_product_slug),
    encode(digest(clean_code, 'sha256'), 'hex'),
    nullif(trim(p_customer_note), ''),
    greatest(1, least(coalesce(p_max_devices, 2), 10))
  )
  returning * into created_license;

  return jsonb_build_object(
    'ok', true,
    'code', clean_code,
    'license', public.admin_license_json(created_license)
  );
exception when unique_violation then
  return jsonb_build_object('ok', false, 'reason', 'duplicate_code');
end;
$$;

create or replace function public.admin_set_license_status(
  p_admin_password text,
  p_license_id uuid,
  p_active boolean
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_license public.product_licenses%rowtype;
begin
  if not public.admin_password_matches(p_admin_password) then
    return jsonb_build_object('ok', false, 'reason', 'invalid_admin_password');
  end if;

  update public.product_licenses
  set active = coalesce(p_active, active)
  where id = p_license_id
  returning * into updated_license;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'not_found');
  end if;

  return jsonb_build_object('ok', true, 'license', public.admin_license_json(updated_license));
end;
$$;

revoke all on function public.admin_password_matches(text) from public;
revoke all on function public.admin_license_json(public.product_licenses) from public;
revoke all on function public.admin_list_licenses(text, text) from public;
revoke all on function public.admin_create_license(text, text, text, text, integer) from public;
revoke all on function public.admin_set_license_status(text, uuid, boolean) from public;

grant execute on function public.admin_list_licenses(text, text) to anon, authenticated;
grant execute on function public.admin_create_license(text, text, text, text, integer) to anon, authenticated;
grant execute on function public.admin_set_license_status(text, uuid, boolean) to anon, authenticated;

