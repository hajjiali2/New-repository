import { useEffect, useState } from 'react';
import {
  ArrowRight, Users, Building2, Mail, Activity, Shield,
  Trash2, RefreshCw, AlertCircle,
} from 'lucide-react';
import {
  getAdminStats, listUsers, listContactRequests,
  updateUserPlan, updateUserRole, deleteContactRequest,
} from '../../lib/api/admin';
import { AdminStats, ContactRequest, Plan, Profile, UserRole, PLAN_LABELS } from '../../lib/types';

interface AdminDashboardProps {
  onBack: () => void;
}

const PLANS: Plan[] = ['free', 'business', 'enterprise'];
const ROLES: UserRole[] = ['user', 'admin'];

export default function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<Profile[]>([]);
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'users' | 'requests'>('users');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [s, u, r] = await Promise.all([
        getAdminStats(),
        listUsers(),
        listContactRequests(),
      ]);
      setStats(s);
      setUsers(u);
      setRequests(r);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg.includes('admin only') ? 'هذه الصفحة مخصصة للمشرفين فقط.' : msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handlePlanChange = async (id: string, plan: Plan) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, plan } : u)));
    try { await updateUserPlan(id, plan); } catch (err) { setError(String(err)); load(); }
  };

  const handleRoleChange = async (id: string, role: UserRole) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    try { await updateUserRole(id, role); } catch (err) { setError(String(err)); load(); }
  };

  const handleDeleteRequest = async (id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    try { await deleteContactRequest(id); } catch (err) { setError(String(err)); load(); }
  };

  const statCards = stats ? [
    { icon: Users, label: 'إجمالي المستخدمين', value: stats.total_users, color: 'text-orange-400', bg: 'bg-orange-500/15' },
    { icon: Building2, label: 'المؤسسات', value: stats.total_organizations, color: 'text-blue-400', bg: 'bg-blue-500/15' },
    { icon: Mail, label: 'طلبات التواصل', value: stats.total_contact_requests, color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
    { icon: Activity, label: 'عمليات الأدوات', value: stats.total_usage_events, color: 'text-amber-400', bg: 'bg-amber-500/15' },
  ] : [];

  return (
    <div className="min-h-screen bg-[#060f33] pt-28 pb-16" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/50 hover:text-white font-arabic text-sm transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            العودة للرئيسية
          </button>
          <button
            onClick={load}
            className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/10 text-white/60 hover:text-white font-arabic text-sm transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </button>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center glow-orange">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-arabic text-white">لوحة الإدارة</h1>
            <p className="text-white/50 font-arabic text-sm">إدارة المستخدمين والمؤسسات وطلبات التواصل</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 font-arabic text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {statCards.map((c, i) => (
            <div key={i} className="glass-card rounded-2xl border border-white/8 p-5">
              <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center mb-4`}>
                <c.icon className={`w-5 h-5 ${c.color}`} />
              </div>
              <div className="text-3xl font-bold text-white font-arabic">{c.value}</div>
              <div className="text-white/50 font-arabic text-sm mt-1">{c.label}</div>
            </div>
          ))}
          {!stats && loading && Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card rounded-2xl border border-white/8 p-5 animate-pulse h-32" />
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('users')}
            className={`px-5 py-2.5 rounded-xl font-arabic text-sm transition-all ${
              tab === 'users' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : 'glass border border-white/10 text-white/50 hover:text-white'
            }`}
          >
            المستخدمون ({users.length})
          </button>
          <button
            onClick={() => setTab('requests')}
            className={`px-5 py-2.5 rounded-xl font-arabic text-sm transition-all ${
              tab === 'requests' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : 'glass border border-white/10 text-white/50 hover:text-white'
            }`}
          >
            طلبات التواصل ({requests.length})
          </button>
        </div>

        {/* Users table */}
        {tab === 'users' && (
          <div className="glass-card rounded-2xl border border-white/8 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="border-b border-white/8 text-white/40 font-arabic text-xs">
                    <th className="px-5 py-4 font-medium">الاسم</th>
                    <th className="px-5 py-4 font-medium">البريد الإلكتروني</th>
                    <th className="px-5 py-4 font-medium">الخطة</th>
                    <th className="px-5 py-4 font-medium">الدور</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4 text-white font-arabic text-sm">{u.full_name || '—'}</td>
                      <td className="px-5 py-4 text-white/60 text-sm" dir="ltr">{u.email}</td>
                      <td className="px-5 py-4">
                        <select
                          value={u.plan}
                          onChange={(e) => handlePlanChange(u.id, e.target.value as Plan)}
                          className="bg-[#0b1640] border border-white/10 rounded-lg px-3 py-1.5 text-white/80 font-arabic text-sm focus:outline-none focus:border-orange-500/50"
                        >
                          {PLANS.map((p) => (
                            <option key={p} value={p}>{PLAN_LABELS[p]}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                          className="bg-[#0b1640] border border-white/10 rounded-lg px-3 py-1.5 text-white/80 font-arabic text-sm focus:outline-none focus:border-orange-500/50"
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>{r === 'admin' ? 'مشرف' : 'مستخدم'}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && !loading && (
                    <tr><td colSpan={4} className="px-5 py-10 text-center text-white/40 font-arabic">لا يوجد مستخدمون</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Contact requests */}
        {tab === 'requests' && (
          <div className="space-y-4">
            {requests.map((r) => (
              <div key={r.id} className="glass-card rounded-2xl border border-white/8 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className="text-white font-arabic font-semibold">{r.name}</span>
                      <span className="text-white/50 text-sm" dir="ltr">{r.email}</span>
                      {r.company && <span className="text-orange-300/80 font-arabic text-xs px-2 py-0.5 rounded-md bg-orange-500/10">{r.company}</span>}
                    </div>
                    <p className="text-white/70 font-arabic text-sm leading-relaxed whitespace-pre-wrap">{r.message}</p>
                    <p className="text-white/30 text-xs mt-2" dir="ltr">{new Date(r.created_at).toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteRequest(r.id)}
                    className="flex-shrink-0 w-9 h-9 rounded-lg glass border border-white/10 flex items-center justify-center text-white/40 hover:text-red-400 hover:border-red-400/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {requests.length === 0 && !loading && (
              <div className="glass-card rounded-2xl border border-white/8 p-10 text-center text-white/40 font-arabic">
                لا توجد طلبات تواصل
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
