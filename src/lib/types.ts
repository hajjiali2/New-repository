export type UserRole = 'user' | 'admin';
export type Plan = 'free' | 'business' | 'enterprise';
export type ToolId = 'chat' | 'writer' | 'translator' | 'analyzer' | 'summarizer' | 'ideagenerator';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  plan: Plan;
  role: UserRole;
  organization_id: string | null;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  plan: string;
  owner_id: string;
  created_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: string;
  created_at: string;
  profile?: Profile | null;
}

export interface UsageLog {
  id: string;
  user_id: string;
  tool: ToolId | string;
  input_chars: number;
  output_chars: number;
  created_at: string;
}

export interface ContactRequest {
  id: string;
  name: string;
  email: string;
  company: string;
  message: string;
  created_at: string;
}

export interface AdminStats {
  total_users: number;
  total_admins: number;
  plan_free: number;
  plan_business: number;
  plan_enterprise: number;
  total_organizations: number;
  total_contact_requests: number;
  total_usage_events: number;
  usage_last_7_days: number;
}

export const TOOL_LABELS: Record<string, string> = {
  chat: 'محادثة AI',
  writer: 'كاتب المحتوى',
  translator: 'المترجم الذكي',
  analyzer: 'محلل البيانات',
  summarizer: 'ملخص النصوص',
  ideagenerator: 'مولّد الأفكار',
};

export const PLAN_LABELS: Record<string, string> = {
  free: 'مجاني',
  business: 'أعمال',
  enterprise: 'مؤسسي',
};
