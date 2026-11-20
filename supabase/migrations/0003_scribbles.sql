-- Scribbles: short essays / notes on design and data.
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  cover_url text,
  cover_alt text,
  topic text not null default 'design' check (topic in ('design', 'data', 'both')),
  tags text[] not null default '{}',
  blocks jsonb not null default '[]',
  status project_status not null default 'draft',
  featured boolean not null default false,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create index posts_listing_idx on public.posts (status, published_at desc);

-- Reuses the projects trigger: bumps updated_at and stamps published_at on first publish.
create trigger posts_touch
before insert or update on public.posts
for each row execute function public.touch_updated_at();

alter table public.posts enable row level security;

create policy "posts public read" on public.posts
  for select using (status = 'published');
create policy "posts admin all" on public.posts
  for all using (private.is_admin()) with check (private.is_admin());
