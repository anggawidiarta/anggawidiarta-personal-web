-- Blog posts managed from the Studio. The public site builds from rows where
-- status = 'published'; everything else is admin-only (private.is_admin()).
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 120),
  title text not null check (char_length(title) between 1 and 200),
  description text not null default '' check (char_length(description) <= 200),
  body text not null default '',
  tags text[] not null default '{}',
  cover_path text,
  cover_alt text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  sample boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint published_posts_have_a_date
    check (status <> 'published' or published_at is not null)
);

create index posts_status_published_at_idx on public.posts (status, published_at desc);

alter table public.posts enable row level security;

revoke insert, update, delete on table public.posts from anon;

create policy "published posts are public"
  on public.posts for select
  to anon, authenticated
  using (status = 'published');

create policy "admins read every post"
  on public.posts for select
  to authenticated
  using ((select private.is_admin()));

create policy "admins create posts"
  on public.posts for insert
  to authenticated
  with check ((select private.is_admin()));

create policy "admins update posts"
  on public.posts for update
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy "admins delete posts"
  on public.posts for delete
  to authenticated
  using ((select private.is_admin()));

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function private.set_updated_at();

-- Images for covers and article bodies. Public bucket: files are served by URL
-- without a select policy (so anon cannot list them); only admins can write.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'blog-media', 'blog-media', true, 4194304,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
);

create policy "admins read blog media"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'blog-media' and (select private.is_admin()));

create policy "admins upload blog media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'blog-media' and (select private.is_admin()));

create policy "admins update blog media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'blog-media' and (select private.is_admin()))
  with check (bucket_id = 'blog-media' and (select private.is_admin()));

create policy "admins delete blog media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'blog-media' and (select private.is_admin()));
