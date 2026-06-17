import { supabase } from '../supabase';
import { Organization, OrganizationMember, Profile, UsageLog } from '../types';

export async function getMyOrganization(): Promise<Organization | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: owned, error: ownedErr } = await supabase
    .from('organizations')
    .select('*')
    .eq('owner_id', user.id)
    .maybeSingle();
  if (ownedErr) throw ownedErr;
  if (owned) return owned as Organization;

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.organization_id) {
    const { data: org } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', profile.organization_id)
      .maybeSingle();
    return (org as Organization | null) ?? null;
  }
  return null;
}

export async function createOrganization(name: string): Promise<Organization> {
  const { data, error } = await supabase.rpc('create_organization', { org_name: name });
  if (error) throw error;
  return data as Organization;
}

export async function renameOrganization(id: string, name: string): Promise<void> {
  const { error } = await supabase.from('organizations').update({ name }).eq('id', id);
  if (error) throw error;
}

export async function listMembers(orgId: string): Promise<OrganizationMember[]> {
  const { data: members, error } = await supabase
    .from('organization_members')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: true });
  if (error) throw error;

  const list = (members ?? []) as OrganizationMember[];
  if (list.length === 0) return [];

  const ids = list.map((m) => m.user_id);
  const { data: profiles } = await supabase.from('profiles').select('*').in('id', ids);
  const byId = new Map((profiles ?? []).map((p) => [(p as Profile).id, p as Profile]));

  return list.map((m) => ({ ...m, profile: byId.get(m.user_id) ?? null }));
}

export async function addMemberByEmail(orgId: string, email: string): Promise<void> {
  const { error } = await supabase.rpc('add_org_member', { org: orgId, member_email: email });
  if (error) throw error;
}

export async function removeMember(orgId: string, userId: string): Promise<void> {
  const { error } = await supabase.rpc('remove_org_member', { org: orgId, member_id: userId });
  if (error) throw error;
}

export async function getOrgUsage(memberIds: string[]): Promise<UsageLog[]> {
  if (memberIds.length === 0) return [];
  const { data, error } = await supabase
    .from('usage_logs')
    .select('*')
    .in('user_id', memberIds)
    .order('created_at', { ascending: false })
    .limit(500);
  if (error) throw error;
  return (data ?? []) as UsageLog[];
}
