-- Wedding Planner EN — product + test license
-- Run once in Supabase SQL Editor (same project as painel.codigos)

insert into public.products (slug, label, prefix, language, max_devices, download_url)
values (
  'wedding-planner-en',
  'Premium Wedding Planner EN',
  'WEDDING',
  'en',
  3,
  'https://casamento1en-two.vercel.app'
)
on conflict (slug) do update set
  label = excluded.label,
  prefix = excluded.prefix,
  language = excluded.language,
  download_url = excluded.download_url;

-- Test code: WEDDING-TEST-2026
insert into public.product_licenses (product_slug, code_hash, customer_note, max_devices)
values (
  'wedding-planner-en',
  encode(digest('WEDDING-TEST-2026', 'sha256'), 'hex'),
  'Wedding planner test code',
  3
)
on conflict (code_hash) do nothing;
