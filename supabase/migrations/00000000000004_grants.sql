-- ============================================================================
-- PostgREST role grants.
-- RLS policies alone are not enough — Postgres also requires table-level
-- GRANTs for the anon/authenticated roles PostgREST connects as. The
-- Supabase dashboard applies these automatically for tables created through
-- the UI; since this schema is managed via SQL migrations, they're granted
-- explicitly here. Row-level access is still fully governed by the RLS
-- policies in 00000000000002_rls.sql.
-- ============================================================================

grant usage on schema public to anon, authenticated, service_role;

grant select on all tables in schema public to anon;
grant insert on public.analytics_events to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant all privileges on all tables in schema public to service_role;

grant usage, select on all sequences in schema public to anon, authenticated;
grant all privileges on all sequences in schema public to service_role;

alter default privileges in schema public grant select on tables to anon;
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public grant all privileges on tables to service_role;
alter default privileges in schema public grant usage, select on sequences to anon, authenticated;
alter default privileges in schema public grant all privileges on sequences to service_role;
