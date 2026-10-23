-- Allowlist of people who may use the CMS. Rows are added from the Supabase
-- dashboard / SQL editor only; there is no insert/update/delete policy.
create table public.admins (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

revoke all on table public.admins from anon;

create policy "admins can read their own row"
  on public.admins
  for select
  to authenticated
  using (id = (select auth.uid()));

-- Reused by RLS policies on future tables (posts, ...).
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins where id = (select auth.uid())
  );
$$;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;
