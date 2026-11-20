-- Keep the admin check out of the exposed `public` API schema (Supabase lint 0028/0029).
-- Existing RLS policies reference the function by OID, so they follow the move.
create schema if not exists private;
grant usage on schema private to anon, authenticated;
alter function public.is_admin() set schema private;
alter function private.is_admin() set search_path = public;
