-- GDMA Student Work Showcase — initial schema
-- Run this in the Supabase SQL editor for your project
-- (https://supabase.com/dashboard/project/dfvenjfmtokcqhtkryoo/sql/new)

create extension if not exists "pgcrypto";

create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  student_name text not null,
  title text,
  image_path text not null,   -- storage path, e.g. full/<uuid>.webp
  thumb_path text not null,   -- storage path, e.g. thumb/<uuid>.webp
  width int not null,
  height int not null,
  instagram_url text,
  behance_url text,
  website_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists submissions_status_idx on submissions (status, created_at desc);

-- RLS stays enabled with no policies: all access goes through the server
-- using the service role key, which bypasses RLS. No client ever talks to
-- Supabase directly, so no public read/write policies are needed.
alter table submissions enable row level security;

-- Storage bucket for artwork. Public read (so next/image can load approved
-- images directly), writes only via the server (service role key).
insert into storage.buckets (id, name, public)
values ('artwork', 'artwork', true)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Public read access to artwork'
  ) then
    create policy "Public read access to artwork"
      on storage.objects for select
      using (bucket_id = 'artwork');
  end if;
end $$;
