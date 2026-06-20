import { useEffect, useState } from 'react';
import {
  ArrowRight, Building2, Users, Activity, UserPlus, Trash2,
  Check, Pencil, AlertCircle, BarChart3,
} from 'lucide-react';
import { User } from '@supabase/supabase-js';
import {
  getMyOrganization, createOrganization, renameOrganization,
  listMembers, addMemberByEmail, removeMember, getOrgUsage,
} from '../../lib/api/business';
import { Organization, OrganizationMember, UsageLog, TOOL_LABELS, PLAN_LABELS } from '../../lib/types';
import { getErrorMessage } from '../../lib/errors';

interface BusinessDashboardProps {
  user: User | null;
  onBack: () => void;
}

export default function BusinessDashboard({ user, onBack }: BusinessDashboardProps) {
  const [org, setOrg] = useState<Organization | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [usage, setUsage] = useState<UsageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const [newOrgName, setNewOrgName] = useState('');
  const [creating, setCreating] = useState(false);

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  const isOwner = !!org && !!user && org.owner_id === user.id;

  const loadOrgData = async (organization: Organization) => {
    const m = await listMembers(organization.id);
    setMembers(m);
    const u = await getOrgUsage(m.map((x) => x.user_id));
    setUsage(u);
  };

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const o = await getMyOrganization();
      setOrg(o);
      if (o) await loadOrgData(o);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!newOrgName.trim() || creating) return;
    setCreating(true);
    setError('');
    try {
      const o = await createOrganization(newOrgName.trim());
      setOrg(o);
      await loadOrgData(o);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  const handleRename = async () => {
    if (!org || !nameDraft.trim()) { setEditingName(false); return; }
    try {
      await renameOrganization(org.id, nameDraft.trim());
      setOrg({ ...org, name: nameDraft.trim() });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setEditingName(false);
    }
  };

  const handleInvite = async () => {
    if (!org || !inviteEmail.trim() || inviting) return;
    setInviting(true);
    setError('');
    setInfo('');
    try {
      await addMemberByEmail(org.id, inviteEmail.trim());
      setInfo(`تمت إضافة ${inviteEmail.trim()} إلى الفريق.`);
      setInviteEmail('');
      await loadOrgData(org);
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg.includes('no registered user') ? 'لا يوجد مستخدم مسجّل بهذا البريد الإلكتروني.' : msg);
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!org) return;
    setMembers((prev) => prev.filter((m) => m.user_id !== userId));
    try {
      await removeMember(org.id, userId);
      await loadOrgData(org);
    } catch (err) {
      setError(getErrorMessage(err));
      load();
    }
  };

  const usageByTool = usage.reduce<Record<string, number>>((acc, u) => {
    acc[u.tool] = (acc[u.tool] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060f33] pt-28 pb-16" dir="rtl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="glass-card rounded-2xl border border-white/8 p-10 animate-pulse h-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060f33] pt-28 pb-16" dir="rtl">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/50 hover:text-white font-arabic text-sm mb-8 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          العودة للرئيسية
        </button>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 font-arabic text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}
        {info && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-arabic text-sm">
            {info}
          </div>
        )}

        {!org ? (
          /* Create organization */
          <div className="glass-card rounded-2xl border border-white/8 p-8 max-w-lg mx-auto text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto mb-5 glow-orange">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold font-arabic text-white mb-2">أنشئ مؤسستك</h1>
            <p className="text-white/50 font-arabic text-sm mb-6">
              أنشئ مساحة عمل لفريقك وتابع استخدام الأدوات في مكان واحد.
            </p>
            <input
              type="text"
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="اسم المؤسسة"
              className="w-full px-4 py-3 rounded-xl glass border border-white/10 text-white placeholder-white/30 font-arabic text-sm focus:outline-none focus:border-orange-500/50 transition-colors mb-4 text-center"
            />
            <button
              onClick={handleCreate}
              disabled={creating || !newOrgName.trim()}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold font-arabic text-sm hover:from-orange-600 hover:to-orange-700 transition-all glow-orange disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {creating ? 'جاري الإنشاء...' : 'إنشاء المؤسسة'}
            </button>
          </div>
        ) : (
          <>
            {/* Org header */}
            <div className="glass-card rounded-2xl border border-white/8 p-6 mb-8">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/15 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    {editingName ? (
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          value={nameDraft}
                          onChange={(e) => setNameDraft(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                          className="bg-[#0b1640] border border-white/10 rounded-lg px-3 py-1.5 text-white font-arabic text-lg focus:outline-none focus:border-orange-500/50"
                        />
                        <button onClick={handleRename} className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-300 flex items-center justify-center">
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold font-arabic text-white">{org.name || 'مؤسستي'}</h1>
                        {isOwner && (
                          <button
                            onClick={() => { setNameDraft(org.name); setEditingName(true); }}
                            className="text-white/30 hover:text-white transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                    <span className="inline-block mt-1 text-xs font-arabic px-2.5 py-0.5 rounded-md bg-orange-500/15 text-orange-300">
                      خطة {PLAN_LABELS[org.plan] || org.plan}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <div className="glass-card rounded-2xl border border-white/8 p-5">
                <div className="w-11 h-11 rounded-xl bg-orange-500/15 flex items-center justify-center mb-3">
                  <Users className="w-5 h-5 text-orange-400" />
                </div>
                <div className="text-3xl font-bold text-white font-arabic">{members.length}</div>
                <div className="text-white/50 font-arabic text-sm mt-1">أعضاء الفريق</div>
              </div>
              <div className="glass-card rounded-2xl border border-white/8 p-5">
                <div className="w-11 h-11 rounded-xl bg-amber-500/15 flex items-center justify-center mb-3">
                  <Activity className="w-5 h-5 text-amber-400" />
                </div>
                <div className="text-3xl font-bold text-white font-arabic">{usage.length}</div>
                <div className="text-white/50 font-arabic text-sm mt-1">عمليات الأدوات</div>
              </div>
              <div className="glass-card rounded-2xl border border-white/8 p-5">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/15 flex items-center justify-center mb-3">
                  <BarChart3 className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-3xl font-bold text-white font-arabic">{Object.keys(usageByTool).length}</div>
                <div className="text-white/50 font-arabic text-sm mt-1">أدوات مستخدمة</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Members */}
              <div className="lg:col-span-3 glass-card rounded-2xl border border-white/8 p-6">
                <h2 className="text-lg font-bold font-arabic text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-400" />
                  أعضاء الفريق
                </h2>

                {isOwner && (
                  <div className="flex gap-2 mb-5">
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                      placeholder="بريد عضو مسجّل لإضافته"
                      dir="ltr"
                      className="flex-1 px-4 py-2.5 rounded-xl glass border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                    />
                    <button
                      onClick={handleInvite}
                      disabled={inviting || !inviteEmail.trim()}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-arabic text-sm font-semibold hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                    >
                      <UserPlus className="w-4 h-4" />
                      إضافة
                    </button>
                  </div>
                )}

                <div className="space-y-2">
                  {members.map((m) => (
                    <div key={m.id} className="flex items-center justify-between gap-3 p-3 rounded-xl glass border border-white/8">
                      <div className="min-w-0">
                        <div className="text-white font-arabic text-sm truncate">
                          {m.profile?.full_name || '—'}
                          {m.role === 'owner' && <span className="mr-2 text-xs text-orange-300 font-arabic">(المالك)</span>}
                        </div>
                        <div className="text-white/40 text-xs truncate" dir="ltr">{m.profile?.email}</div>
                      </div>
                      {isOwner && m.role !== 'owner' && (
                        <button
                          onClick={() => handleRemove(m.user_id)}
                          className="flex-shrink-0 w-8 h-8 rounded-lg glass border border-white/10 flex items-center justify-center text-white/40 hover:text-red-400 hover:border-red-400/30 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {members.length === 0 && (
                    <p className="text-white/40 font-arabic text-sm text-center py-6">لا يوجد أعضاء بعد</p>
                  )}
                </div>
              </div>

              {/* Usage breakdown */}
              <div className="lg:col-span-2 glass-card rounded-2xl border border-white/8 p-6">
                <h2 className="text-lg font-bold font-arabic text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-amber-400" />
                  استخدام الأدوات
                </h2>
                <div className="space-y-3">
                  {Object.entries(usageByTool)
                    .sort((a, b) => b[1] - a[1])
                    .map(([tool, count]) => {
                      const max = Math.max(...Object.values(usageByTool), 1);
                      return (
                        <div key={tool}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white/70 font-arabic text-sm">{TOOL_LABELS[tool] || tool}</span>
                            <span className="text-white/50 font-arabic text-sm">{count}</span>
                          </div>
                          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500"
                              style={{ width: `${(count / max) * 100}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  {Object.keys(usageByTool).length === 0 && (
                    <p className="text-white/40 font-arabic text-sm text-center py-6">لا توجد بيانات استخدام بعد</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
