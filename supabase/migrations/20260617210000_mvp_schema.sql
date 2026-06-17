/*
  # MVP schema: roles, organizations, members, usage logs

  1. Changes to `profiles`
    - add `role` (text, 'user' | 'admin', default 'user')
    - add `organization_id` (uuid, nullable, FK -> organizations)

  2. New tables
    - `organizations` (id, name, plan, owner_id, created_at)
    - `organization_members` (id, organization_id, user_id, role, created_at)
    - `usage_logs` (id, user_id, tool, input_chars, output_chars, created_at)

  3. Helper functions (SECURITY DEFINER, locked search_path)
    - `is_admin()` — is the current user a platform admin
    - `current_org_id()` — current user's organization
    - `is_org_owner(uuid)` — does the current user own the given org
    - `can_view_usage(uuid)` — may the current user see usage of a target user

  4. Security
    - RLS enabled on all new tables with policies for users, org owners, and admins
    - contact_requests SELECT tightened to admins only
*/

-- 1. profiles columns ---------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS organization_id uuid;

-- 2. organizations ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  plan text NOT NULL DEFAULT 'business',
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'profiles_organization_id_fkey'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_organization_id_fkey
      FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  created_at timestamptz DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool text NOT NULL DEFAULT '',
  input_chars integer NOT NULL DEFAULT 0,
  output_chars integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS usage_logs_user_id_idx ON public.usage_logs (user_id);
CREATE INDEX IF NOT EXISTS usage_logs_created_at_idx ON public.usage_logs (created_at);
CREATE INDEX IF NOT EXISTS organization_members_org_idx ON public.organization_members (organization_id);

-- 3. helper functions ---------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.current_org_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_org_owner(org uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organizations
    WHERE id = org AND owner_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.can_view_usage(target uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    target = auth.uid()
    OR public.is_admin()
    OR EXISTS (
      SELECT 1
      FROM public.organization_members m
      JOIN public.organizations o ON o.id = m.organization_id
      WHERE m.user_id = target AND o.owner_id = auth.uid()
    );
$$;

-- 4. RLS ----------------------------------------------------------------------
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- profiles: admins and org owners gain read/update beyond own row
CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Org owners can read member profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (organization_id IS NOT NULL AND public.is_org_owner(organization_id));

-- organizations
CREATE POLICY "Owners and members can read organization"
  ON public.organizations FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR id = public.current_org_id() OR public.is_admin());

CREATE POLICY "Users can create their organization"
  ON public.organizations FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their organization"
  ON public.organizations FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR public.is_admin())
  WITH CHECK (owner_id = auth.uid() OR public.is_admin());

CREATE POLICY "Owners can delete their organization"
  ON public.organizations FOR DELETE TO authenticated
  USING (owner_id = auth.uid() OR public.is_admin());

-- organization_members
CREATE POLICY "Members and owners can read membership"
  ON public.organization_members FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_org_owner(organization_id)
    OR public.is_admin()
  );

CREATE POLICY "Owners can add members"
  ON public.organization_members FOR INSERT TO authenticated
  WITH CHECK (public.is_org_owner(organization_id));

CREATE POLICY "Owners can remove members"
  ON public.organization_members FOR DELETE TO authenticated
  USING (public.is_org_owner(organization_id) OR public.is_admin());

-- usage_logs
CREATE POLICY "Users can log own usage"
  ON public.usage_logs FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Authorized users can read usage"
  ON public.usage_logs FOR SELECT TO authenticated
  USING (public.can_view_usage(user_id));

-- contact_requests: restrict reads to admins (was: any authenticated user)
DROP POLICY IF EXISTS "Authenticated users can view contact requests" ON public.contact_requests;

CREATE POLICY "Admins can view contact requests"
  ON public.contact_requests FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete contact requests"
  ON public.contact_requests FOR DELETE TO authenticated
  USING (public.is_admin());
