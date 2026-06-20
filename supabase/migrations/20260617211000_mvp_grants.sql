/*
  # Table privileges for PostgREST roles

  Row Level Security controls *which rows* a role may touch, but PostgreSQL still
  requires table-level privileges for the operation to be attempted at all. This
  local environment does not auto-grant DML on public tables to the `anon` /
  `authenticated` roles, so the policies defined elsewhere would otherwise fail
  with "permission denied". These grants are least-privilege and idempotent; RLS
  remains the enforcing layer for row visibility.
*/

-- profiles: read/insert/update own row; admins update any (RLS enforced)
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- contact_requests: public form submission + admin read/delete
GRANT INSERT ON public.contact_requests TO anon, authenticated;
GRANT SELECT, DELETE ON public.contact_requests TO authenticated;

-- organizations
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations TO authenticated;

-- organization_members
GRANT SELECT, INSERT, DELETE ON public.organization_members TO authenticated;

-- usage_logs
GRANT SELECT, INSERT ON public.usage_logs TO authenticated;
