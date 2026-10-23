-- Keep the helper out of the API-exposed `public` schema so it is not callable
-- through /rest/v1/rpc. RLS policies can still use private.is_admin().
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

alter function public.is_admin() set schema private;

revoke execute on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;
