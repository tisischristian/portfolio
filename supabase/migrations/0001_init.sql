-- Portfolio schema (PORTFOLIO_INSTRUCTIONS §8.1)
-- Apply with: supabase db push   (or paste into the Supabase SQL editor)

create extension if not exists pgcrypto;

create type discipline as enum ('design', 'data');
create type project_status as enum ('draft', 'published');

-- ───────── Admin allow-list ─────────
-- Add your own auth user id after signing up once:
--   insert into public.admins (user_id) values ('<your-auth-user-uuid>');
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ───────── Projects ─────────
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  discipline discipline not null,
  title text not null,
  slug text not null unique,
  summary text,
  cover_url text,
  cover_alt text,
  year int,
  category text,
  tags text[] not null default '{}',
  featured boolean not null default false,
  sort_order int not null default 0,
  status project_status not null default 'draft',
  -- design-specific
  client text,
  role text,
  deliverables text[],
  palette text[],
  fonts text[],
  -- data-specific
  question text,
  dataset_source text,
  dataset_size text,
  tools text[],
  metrics jsonb not null default '[]',   -- [{label, value}]
  embed_url text,
  github_url text,
  notebook_url text,
  report_url text,
  -- content
  blocks jsonb not null default '[]',    -- ordered content blocks
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create index projects_listing_idx on public.projects (discipline, status, sort_order);
create index projects_featured_idx on public.projects (featured) where featured;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  if new.status = 'published' and (old is null or old.status <> 'published') then
    new.published_at = coalesce(new.published_at, now());
  end if;
  return new;
end;
$$;

create trigger projects_touch
before insert or update on public.projects
for each row execute function public.touch_updated_at();

-- ───────── Media ─────────
create table public.media (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  path text not null,
  mime text,
  width int,
  height int,
  size_bytes int,
  alt text,
  blur_data_url text,
  created_at timestamptz not null default now()
);

-- ───────── Messages ─────────
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 254),
  interest text check (interest in ('design', 'data', 'both')),
  budget text check (char_length(budget) <= 60),
  body text not null check (char_length(body) between 1 and 5000),
  read boolean not null default false,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

-- ───────── Settings ─────────
create table public.settings (
  key text primary key,
  value jsonb not null
);

-- ───────── Row-level security ─────────
alter table public.admins   enable row level security;
alter table public.projects enable row level security;
alter table public.media    enable row level security;
alter table public.messages enable row level security;
alter table public.settings enable row level security;

-- admins: an admin can see the list; nobody writes it from the client
create policy "admins read" on public.admins
  for select using (public.is_admin());

-- projects: public reads published, admin does everything
create policy "projects public read" on public.projects
  for select using (status = 'published');
create policy "projects admin all" on public.projects
  for all using (public.is_admin()) with check (public.is_admin());

-- media: public read (it backs public pages), admin write
create policy "media public read" on public.media
  for select using (true);
create policy "media admin all" on public.media
  for all using (public.is_admin()) with check (public.is_admin());

-- messages: anyone can insert (contact form), only admin reads/updates/deletes
create policy "messages public insert" on public.messages
  for insert with check (read = false and archived = false);
create policy "messages admin read" on public.messages
  for select using (public.is_admin());
create policy "messages admin update" on public.messages
  for update using (public.is_admin()) with check (public.is_admin());
create policy "messages admin delete" on public.messages
  for delete using (public.is_admin());

-- settings: public read, admin write
create policy "settings public read" on public.settings
  for select using (true);
create policy "settings admin all" on public.settings
  for all using (public.is_admin()) with check (public.is_admin());

-- ───────── Storage buckets ─────────
insert into storage.buckets (id, name, public)
values ('public-media', 'public-media', true),
       ('private', 'private', false)
on conflict (id) do nothing;

create policy "public-media read" on storage.objects
  for select using (bucket_id = 'public-media');
create policy "public-media admin write" on storage.objects
  for insert with check (bucket_id = 'public-media' and public.is_admin());
create policy "public-media admin update" on storage.objects
  for update using (bucket_id = 'public-media' and public.is_admin());
create policy "public-media admin delete" on storage.objects
  for delete using (bucket_id = 'public-media' and public.is_admin());

create policy "private admin all" on storage.objects
  for all using (bucket_id = 'private' and public.is_admin())
  with check (bucket_id = 'private' and public.is_admin());

-- ───────── Seed settings ─────────
insert into public.settings (key, value) values
  ('profile', '{"name":"{{NAME}}","monogram":"{{MONOGRAM}}","location":"{{LOCATION}}","available":true}'),
  ('socials', '[]')
on conflict (key) do nothing;
