-- Wedding Planner EN — minimal license setup (no products table required)
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/drjdiowgxihjddptyjsa/sql

create extension if not exists pgcrypto with schema extensions;

insert into public.product_licenses (product_slug, code_hash, customer_note, max_devices, active)
values (
  'wedding-planner-en',
  encode(digest(upper(trim('WEDDING-GKAS-N7CH')), 'sha256'), 'hex'),
  'Wedding planner code',
  3,
  true
)
on conflict (code_hash) do update set
  product_slug = excluded.product_slug,
  active = true,
  max_devices = excluded.max_devices;

-- Optional: only if products table already exists
insert into public.products (slug, label, prefix, language, max_devices, download_url)
values (
  'wedding-planner-en',
  'Premium Wedding Planner EN',
  'WEDDING',
  'en',
  3,
  'https://casamento1en-two.vercel.app'
)
on conflict (slug) do nothing;

-- Verify the code is registered
select product_slug, customer_note, active, max_devices
from public.product_licenses
where code_hash = encode(digest(upper(trim('WEDDING-GKAS-N7CH')), 'sha256'), 'hex');
