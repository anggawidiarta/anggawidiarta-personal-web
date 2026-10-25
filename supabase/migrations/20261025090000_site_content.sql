-- Homepage content managed from the Studio (docs/specs/SPEC-site-content.md).
-- Public reads see only visible rows; only admins write. The homepage is built
-- from these tables, so nothing reaches visitors until "Publish site" rebuilds.

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 160),
  category text not null check (char_length(category) between 1 and 40),
  technology text not null check (char_length(technology) between 1 and 60),
  url text not null check (url ~ '^https://'),
  year int check (year between 1990 and 2100),
  position int not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.design_works (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  kind text not null check (char_length(kind) between 1 and 60),
  url text not null check (url ~ '^https://'),
  image_path text,
  image_alt text check (char_length(image_alt) <= 200),
  position int not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint design_works_alt_with_image check (image_path is null or char_length(trim(image_alt)) > 0)
);

create table public.experiences (
  id uuid primary key default gen_random_uuid(),
  role text not null check (char_length(role) between 1 and 120),
  organization text not null check (char_length(organization) between 1 and 120),
  period text check (char_length(period) <= 40),
  position int not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.certifications (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 160),
  issuer text check (char_length(issuer) <= 80),
  credential_url text check (credential_url ~ '^https://'),
  year int check (year between 1990 and 2100),
  position int not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.social_links (
  id uuid primary key default gen_random_uuid(),
  label text not null check (char_length(label) between 1 and 24),
  url text not null check (url ~ '^https://'),
  position int not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.site_settings (
  id int primary key default 1 check (id = 1),
  about text not null default '' check (char_length(about) <= 600),
  availability text not null default '' check (char_length(availability) <= 80),
  interests text not null default '' check (char_length(interests) <= 600),
  contact_email text not null check (contact_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  email_subject text not null default '' check (char_length(email_subject) <= 120),
  email_body text not null default '' check (char_length(email_body) <= 1000),
  marquee_text text not null check (char_length(marquee_text) between 1 and 200),
  content_changed_at timestamptz not null default now(),
  published_at timestamptz,
  updated_at timestamptz not null default now()
);

-- Any change to the content tables marks the site as having unpublished changes.
-- Statement-level, so deletes and bulk updates count once.
create function private.mark_content_changed()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  update public.site_settings set content_changed_at = now() where id = 1;
  return null;
end;
$$;

-- Stamping published_at (or the change marker itself) must not count as a content change.
create function private.site_settings_touch()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  meta constant text[] := array['content_changed_at', 'published_at', 'updated_at'];
begin
  if (to_jsonb(new) - meta) is distinct from (to_jsonb(old) - meta) then
    new.content_changed_at = now();
  end if;
  new.updated_at = now();
  return new;
end;
$$;

create trigger site_settings_touch before update on public.site_settings
  for each row execute function private.site_settings_touch();

do $$
declare
  t text;
begin
  foreach t in array array['projects', 'design_works', 'experiences', 'certifications', 'social_links'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create trigger %I before update on public.%I for each row execute function private.set_updated_at()',
      t || '_updated_at', t);
    execute format(
      'create trigger %I after insert or update or delete on public.%I for each statement execute function private.mark_content_changed()',
      t || '_changed', t);
    execute format(
      'create policy "visible %s are public" on public.%I for select to anon, authenticated using (visible)', t, t);
    execute format(
      'create policy "admins read every %s" on public.%I for select to authenticated using ((select private.is_admin()))', t, t);
    execute format(
      'create policy "admins create %s" on public.%I for insert to authenticated with check ((select private.is_admin()))', t, t);
    execute format(
      'create policy "admins update %s" on public.%I for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()))', t, t);
    execute format(
      'create policy "admins delete %s" on public.%I for delete to authenticated using ((select private.is_admin()))', t, t);
  end loop;
end;
$$;

alter table public.site_settings enable row level security;
create policy "site settings are public" on public.site_settings
  for select to anon, authenticated using (true);
create policy "admins update site settings" on public.site_settings
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

-- Seed with the content that was hardcoded before the CMS.
insert into public.site_settings (about, availability, interests, contact_email, email_subject, email_body, marquee_text)
values (
  'I''m a fullstack developer based in Lombok, Indonesia, building web products end to end: interface, backend, and the system architecture behind them.',
  E'Open to full-time\n& freelance work',
  'Web development, UI/UX, computer hardware, content creation, machine learning, artificial intelligence and NLP. Off the clock: anime, books and comics, music, the gym and cycling.',
  'anggawidiarta55@gmail.com',
  'Let''s work together',
  E'Hi Angga,\n\nI''d like to talk with you about a role / project:\n\n',
  'LET''S TALK — LET''S COLLABORATE — SAY HELLO — WANNA BE STARTING SOMETHING? —'
);

insert into public.projects (position, category, technology, title, url) values
  (1, 'WEB DEVELOPMENT', 'NEXT.JS & LARAVEL', 'INSIDE UMKM — WEB PLATFORM FOR MICRO, SMALL & MEDIUM ENTERPRISES', 'https://umkm.insidelombok.com/'),
  (2, 'WEB DEVELOPMENT', 'CODEIGNITER', 'ATTENDANCE APP — EMPLOYEE ATTENDANCE TRACKING', 'https://absen.oxindosolution.com/'),
  (3, 'WEB DEVELOPMENT', 'LARAVEL', 'SPA WEB APP — BOOKING & RESERVATION SYSTEM', 'https://spa.oxindosolution.com/'),
  (4, 'WEB DEVELOPMENT', 'LARAVEL', 'INVENTORY WEBSITE — INVENTORY MANAGEMENT SYSTEM', 'https://github.com/anggawidiarta/SistemInventaris-PKL/tree/master'),
  (5, 'MACHINE LEARNING', 'PYTHON & JUPYTER NOTEBOOK', 'THESIS — TWITTER SENTIMENT ANALYSIS', 'https://rosadecor.my.canva.site/thesis-showcase'),
  (6, 'UI DEVELOPMENT', 'FIREBASE', 'KATA KITA — QUOTES SHARING WEB APP', 'https://katakita-quotes-sharing.vercel.app/'),
  (7, 'CREATIVE DEVELOPMENT', 'PORTFOLIO EXPLORATION', 'DOTAKU — MOBILE APP FOR HERO INFORMATION', 'https://github.com/anggawidiarta/Dotaku-MobileApp'),
  (8, 'CREATIVE DEVELOPMENT', 'PORTFOLIO EXPLORATION', 'PLAYGROUND — JS & TS MINI PROJECTS', 'https://javascript-playground-anggawidiarta.vercel.app/');

-- "bundled:" paths point at images shipped in src/assets/design/ (see src/lib/site.ts).
insert into public.design_works (position, title, kind, url, image_path, image_alt) values
  (1, 'Toko Sepatu', 'Landing page UI/UX', 'https://tokosepatu.vercel.app/', 'bundled:shoes.jpg', 'Illustration of two sneakers'),
  (2, 'Motorcycle Homepage Concept', 'Figma UI design', 'https://www.figma.com/file/HIQID6Bf50FpXzqzl5Ikph/Playground?type=design&node-id=0%3A1&mode=design&t=rHe6Sop1e4eHEYbz-1', 'bundled:engine.jpg', 'Illustration of a V-twin motorcycle engine'),
  (3, 'Trip In Lombok', 'Landing page UI/UX', 'https://trip-in-lombok.vercel.app/', 'bundled:gunung.jpg', 'Illustration of a mountain above a pine forest');

insert into public.experiences (position, role, organization) values
  (1, 'Fullstack Web Developer', 'CV Mataram Medika'),
  (2, 'Software Developer', 'PT Oxindo Solution'),
  (3, 'Frontend Developer', 'Inside Lombok'),
  (4, 'Fullstack Web Developer', 'Jalan Digital'),
  (5, 'Fullstack Web Developer', 'Immigration Office of Mataram'),
  (6, 'Assistant Lecturer', 'University of Mataram');

insert into public.certifications (position, name) values
  (1, 'Solid Programming Principles'),
  (2, 'Specialized Google Analytics Data'),
  (3, 'AI-900: Microsoft Azure AI Fundamentals'),
  (4, 'DP-900: Microsoft Azure Data Fundamentals'),
  (5, 'PL-900: Microsoft Power Platform Fundamentals');

insert into public.social_links (position, label, url) values
  (1, 'GITHUB', 'https://github.com/anggawidiarta'),
  (2, 'LINKEDIN', 'https://www.linkedin.com/in/anggawidiarta/'),
  (3, 'INSTAGRAM', 'https://www.instagram.com/anggawdyrta/'),
  (4, 'iCodeThis', 'https://icodethis.com/anggawidiarta');

-- The seed is what is live today, so start with no unpublished changes. now() is fixed
-- for the whole transaction, hence the offset past the marker the inserts just set.
update public.site_settings set published_at = now() + interval '1 second' where id = 1;
