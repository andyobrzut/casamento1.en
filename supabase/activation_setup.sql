create extension if not exists pgcrypto with schema extensions;

create table if not exists public.product_licenses (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null,
  code_hash text not null unique,
  customer_note text,
  max_devices integer not null default 2 check (max_devices between 1 and 10),
  active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.product_activations (
  id uuid primary key default gen_random_uuid(),
  license_id uuid not null references public.product_licenses(id) on delete cascade,
  device_hash text not null,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (license_id, device_hash)
);

alter table public.product_licenses enable row level security;
alter table public.product_activations enable row level security;

revoke all on public.product_licenses from anon, authenticated;
revoke all on public.product_activations from anon, authenticated;

create or replace function public.activate_license(
  p_code text,
  p_device_id text,
  p_product_slug text
) returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  found_license public.product_licenses%rowtype;
  found_activation public.product_activations%rowtype;
  hashed_device text;
  device_count integer;
begin
  hashed_device := encode(digest(p_device_id, 'sha256'), 'hex');

  select * into found_license
  from public.product_licenses
  where product_slug = p_product_slug
    and code_hash = encode(digest(upper(trim(p_code)), 'sha256'), 'hex')
  for update;

  if not found then return jsonb_build_object('ok', false, 'reason', 'invalid_code'); end if;
  if not found_license.active then return jsonb_build_object('ok', false, 'reason', 'disabled_code'); end if;
  if found_license.expires_at is not null and found_license.expires_at < now() then
    return jsonb_build_object('ok', false, 'reason', 'expired_code');
  end if;

  select * into found_activation
  from public.product_activations
  where license_id = found_license.id and device_hash = hashed_device;

  if found then
    update public.product_activations set last_seen_at = now() where id = found_activation.id;
    return jsonb_build_object('ok', true, 'activation_id', found_activation.id);
  end if;

  select count(*) into device_count
  from public.product_activations
  where license_id = found_license.id;

  if device_count >= found_license.max_devices then
    return jsonb_build_object('ok', false, 'reason', 'device_limit');
  end if;

  insert into public.product_activations (license_id, device_hash)
  values (found_license.id, hashed_device)
  returning * into found_activation;

  return jsonb_build_object('ok', true, 'activation_id', found_activation.id);
end;
$$;

create or replace function public.verify_activation(
  p_activation_id text,
  p_device_id text,
  p_product_slug text
) returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  found_activation public.product_activations%rowtype;
begin
  select a.* into found_activation
  from public.product_activations a
  join public.product_licenses l on l.id = a.license_id
  where a.id = p_activation_id::uuid
    and a.device_hash = encode(digest(p_device_id, 'sha256'), 'hex')
    and l.product_slug = p_product_slug
    and l.active = true
    and (l.expires_at is null or l.expires_at >= now());

  if not found then return jsonb_build_object('ok', false, 'reason', 'not_activated'); end if;

  update public.product_activations set last_seen_at = now() where id = found_activation.id;
  return jsonb_build_object('ok', true, 'activation_id', found_activation.id);
exception when invalid_text_representation then
  return jsonb_build_object('ok', false, 'reason', 'not_activated');
end;
$$;

revoke all on function public.activate_license(text, text, text) from public;
revoke all on function public.verify_activation(text, text, text) from public;
grant execute on function public.activate_license(text, text, text) to anon, authenticated;
grant execute on function public.verify_activation(text, text, text) to anon, authenticated;

-- Primeiro código de teste: CHERRY-TEST-2026
insert into public.product_licenses (product_slug, code_hash, customer_note, max_devices)
values (
  'planner-app-cherry-en',
  encode(digest('CHERRY-TEST-2026', 'sha256'), 'hex'),
  'Código inicial de teste',
  2
)
on conflict (code_hash) do nothing;
CHERRY-TEST-2026
