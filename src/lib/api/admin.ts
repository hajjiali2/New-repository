import { supabase } from '../supabase';
import { AdminStats, ContactRequest, Plan, Profile, UserRole } from '../types';

export async function getAdminStats(): Promise<AdminStats> {
  const { data, error } = await supabase.rpc('admin_stats');
  if (error) throw error;
  return data as AdminStats;
}

export async function listUsers(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Profile[];
}

export async function updateUserPlan(id: string, plan: Plan): Promise<void> {
  const { error } = await supabase.from('profiles').update({ plan }).eq('id', id);
  if (error) throw error;
}

export async function updateUserRole(id: string, role: UserRole): Promise<void> {
  const { error } = await supabase.from('profiles').update({ role }).eq('id', id);
  if (error) throw error;
}

export async function listContactRequests(): Promise<ContactRequest[]> {
  const { data, error } = await supabase
    .from('contact_requests')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ContactRequest[];
}

export async function deleteContactRequest(id: string): Promise<void> {
  const { error } = await supabase.from('contact_requests').delete().eq('id', id);
  if (error) throw error;
}
