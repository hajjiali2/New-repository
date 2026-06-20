/*
  # MVP backend RPC endpoints

  Secure, server-side operations exposed to the client via supabase.rpc():
    - create_organization(org_name)        -> creates org, adds caller as owner-member
    - add_org_member(org, member_email)     -> owner adds an existing user by email
    - remove_org_member(org, member_id)     -> owner/admin removes a member
    - admin_stats()                         -> platform-wide counts (admin only)

  All functions are SECURITY DEFINER with a locked search_path and perform their
  own authorization checks (auth.uid(), is_org_owner(), is_admin()).
*/

CREATE OR REPLACE FUNCTION public.create_organization(org_name text)
RETURNS public.organizations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  uid uuid := auth.uid();
  new_org public.organizations;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  INSERT INTO public.organizations (name, owner_id)
  VALUES (COALESCE(NULLIF(trim(org_name), ''), 'My Organization'), uid)
  RETURNING * INTO new_org;

  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (new_org.id, uid, 'owner')
  ON CONFLICT (organization_id, user_id) DO NOTHING;

  UPDATE public.profiles SET organization_id = new_org.id WHERE id = uid;

  RETURN new_org;
END;
$$;

CREATE OR REPLACE FUNCTION public.add_org_member(org uuid, member_email text)
RETURNS public.organization_members
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  member_profile public.profiles;
  new_member public.organization_members;
BEGIN
  IF NOT public.is_org_owner(org) THEN
    RAISE EXCEPTION 'only the organization owner can add members';
  END IF;

  SELECT * INTO member_profile
  FROM public.profiles
  WHERE lower(email) = lower(trim(member_email))
  LIMIT 1;

  IF member_profile.id IS NULL THEN
    RAISE EXCEPTION 'no registered user found with email %', member_email;
  END IF;

  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (org, member_profile.id, 'member')
  ON CONFLICT (organization_id, user_id) DO UPDATE SET role = EXCLUDED.role
  RETURNING * INTO new_member;

  UPDATE public.profiles SET organization_id = org WHERE id = member_profile.id;

  RETURN new_member;
END;
$$;

CREATE OR REPLACE FUNCTION public.remove_org_member(org uuid, member_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT (public.is_org_owner(org) OR public.is_admin()) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  IF member_id = (SELECT owner_id FROM public.organizations WHERE id = org) THEN
    RAISE EXCEPTION 'cannot remove the organization owner';
  END IF;

  DELETE FROM public.organization_members
  WHERE organization_id = org AND user_id = member_id;

  UPDATE public.profiles
  SET organization_id = NULL
  WHERE id = member_id AND organization_id = org;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_stats()
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result json;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'admin only';
  END IF;

  SELECT json_build_object(
    'total_users', (SELECT count(*) FROM public.profiles),
    'total_admins', (SELECT count(*) FROM public.profiles WHERE role = 'admin'),
    'plan_free', (SELECT count(*) FROM public.profiles WHERE plan = 'free'),
    'plan_business', (SELECT count(*) FROM public.profiles WHERE plan = 'business'),
    'plan_enterprise', (SELECT count(*) FROM public.profiles WHERE plan = 'enterprise'),
    'total_organizations', (SELECT count(*) FROM public.organizations),
    'total_contact_requests', (SELECT count(*) FROM public.contact_requests),
    'total_usage_events', (SELECT count(*) FROM public.usage_logs),
    'usage_last_7_days', (SELECT count(*) FROM public.usage_logs WHERE created_at > now() - interval '7 days')
  ) INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_organization(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_org_member(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_org_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_stats() TO authenticated;
