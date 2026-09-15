'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminBreadcrumb from '../../components/admin/layout/AdminBreadcrumb';
import {
  Building2,
  FolderKanban,
  MessageSquareText,
  Eye,
  TrendingUp,
  Activity,
  Calendar,
  Users,
  Plus,
  ArrowUpLeft,
  Clock,
  CheckCircle2,
  Phone,
  BarChart2,
  Loader2,
  X,
  BellRing,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts';
import { getSubmissionsList, getDashboardStats, Submission } from '@/app/actions/submissions';

const ANALYTICS_DATA = [
  { name: 'السبت', views: 0, submissions: 0 },
  { name: 'الأحد', views: 0, submissions: 0 },
  { name: 'الإثنين', views: 0, submissions: 0 },
  { name: 'الثلاثاء', views: 0, submissions: 0 },
  { name: 'الأربعاء', views: 0, submissions: 0 },
  { name: 'الخميس', views: 0, submissions: 0 },
  { name: 'الجمعة', views: 0, submissions: 0 },
];

const PROPERTY_PERFORMANCE = [
  { name: 'شقق', 'الوحدات المعروضة': 0, 'تم بيعها': 0 },
  { name: 'فيلات', 'الوحدات المعروضة': 0, 'تم بيعها': 0 },
  { name: 'ملاحق', 'الوحدات المعروضة': 0, 'تم بيعها': 0 },
  { name: 'بنتهاوس', 'الوحدات المعروضة': 0, 'تم بيعها': 0 },
];

const STATUS_MAP = {
  new: { label: 'جديد', class: 'neu-badge-danger neu-badge-dot' },
  reviewed: { label: 'تمت المراجعة', class: 'neu-badge-warning neu-badge-dot' },
  closed: { label: 'مغلق', class: 'neu-badge-success neu-badge-dot' },
};

const TYPE_MAP = {
  contact: 'تواصل عام',
  inquiry: 'استفسار مشروع',
  property_inquiry: 'استفسار عقار',
};

export default function DashboardPage() {
  const [statsData, setStatsData] = useState({
    properties: 0,
    projects: 0,
    newSubmissions: 0,
    totalViews: 0,
    soldUnits: 0,
    activeClients: 0
  });
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const stats = await getDashboardStats();
        const subs = await getSubmissionsList();

        setStatsData((prev) => ({
          ...prev,
          properties: stats.properties,
          projects: stats.projects,
          newSubmissions: stats.newSubmissions
        }));
        setSubmissions(subs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const handleDismissAlert = (id: string) => {
    setDismissedAlertIds((prev) => [...prev, id]);
  };

  const newSubmissionsAlerts = submissions.filter(
    (s) => s.status === 'new' && !dismissedAlertIds.includes(s.id)
  );

  const recentSubmissions = submissions.slice(0, 4);

  const stats = [
    { label: 'إجمالي العقارات', value: statsData.properties, icon: Building2, color: 'gold', change: '0 هذا الشهر' },
    { label: 'المشاريع النشطة', value: statsData.projects, icon: FolderKanban, color: 'info', change: '0 قيد الإنشاء' },
    { label: 'استفسارات جديدة', value: statsData.newSubmissions, icon: MessageSquareText, color: 'danger', change: 'بحاجة للمراجعة' },
    { label: 'مشاهدات الموقع', value: statsData.totalViews, icon: Eye, color: 'success', change: '0% عن الشهر السابق' },
    { label: 'وحدات مُباعة', value: statsData.soldUnits, icon: TrendingUp, color: 'warning', change: 'من إجمالي 0' },
    { label: 'عملاء نشطين', value: statsData.activeClients, icon: Users, color: 'info', change: 'مسجلون بالنظام' },
  ];

  return (
    <div>
      <AdminBreadcrumb items={[{ label: 'لوحة التحكم' }]} />

      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[var(--neu-text-heading)] mb-1">مرحباً بك 👋</h2>
          <p className="text-[var(--neu-text-secondary)] text-sm">
            إليك نظرة عامة على نشاط الموقع والتحليلات المتقدمة اليوم
          </p>
        </div>
        <div className="neu-card p-3 flex items-center gap-2 text-xs font-semibold text-[var(--neu-text-secondary)] neu-raised-sm self-start">
          <Calendar className="w-4 h-4 text-[var(--neu-gold)]" />
          <span>اليوم، {new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Alert Notifications for New Submissions */}
      {newSubmissionsAlerts.length > 0 && (
        <div className="mb-8 space-y-3">
          {newSubmissionsAlerts.map((sub) => (
            <div
              key={sub.id}
              className="neu-card border-s-4 border-s-red-500 bg-red-950/10 p-4 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-3 duration-300"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-950/20 flex items-center justify-center shrink-0">
                  <BellRing className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[var(--neu-text-heading)]">استفسار جديد من {sub.name}</h4>
                  <p className="text-xs text-[var(--neu-text-secondary)] mt-0.5">{sub.subject}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/mar-cp/submissions?id=${sub.id}`}
                  className="neu-btn neu-btn-primary py-1.5 px-3 text-[10px] font-bold shrink-0"
                >
                  عرض وتفاصيل
                </Link>
                <button
                  type="button"
                  onClick={() => handleDismissAlert(sub.id)}
                  className="neu-btn neu-btn-ghost p-2 shrink-0 text-[var(--neu-text-secondary)] hover:text-white"
                  title="إخفاء التنبيه"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="neu-card neu-stat-card p-4 sm:p-5 hover:border-[var(--neu-gold)]/40 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-semibold text-[var(--neu-text-secondary)] mb-1.5 truncate" title={stat.label}>{stat.label}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-[var(--neu-text-heading)] tracking-tight">
                    {stat.value.toLocaleString('en-US')}
                  </p>
                  <div className="mt-2.5 flex items-center">
                    <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[var(--neu-gold)]/10 text-[var(--neu-gold)] border border-[var(--neu-gold)]/20">
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[var(--neu-gold)]/10 border border-[var(--neu-gold)]/25 flex items-center justify-center shrink-0 shadow-sm">
                  <Icon className="w-6 h-6 text-[var(--neu-gold)]" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Visitor Traffic Area Chart */}
        <div className="neu-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-[var(--neu-text-heading)]">حركة الزوار ونسب الاستفسارات</h3>
              <p className="text-xs text-[var(--neu-text-muted)] mt-0.5">معدلات المشاهدة والتحويل خلال الـ 7 أيام الماضية</p>
            </div>
            <Activity className="w-5 h-5 text-[var(--neu-gold)]" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ANALYTICS_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D99512" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#D99512" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--neu-text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: 'var(--neu-text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111315',
                    border: '1px solid rgba(217, 149, 18, 0.35)',
                    borderRadius: '12px',
                    color: '#F3F4F6',
                    fontSize: '12px',
                    fontFamily: 'inherit',
                    textAlign: 'right'
                  }}
                  itemStyle={{ color: '#F3F4F6' }}
                />
                <Area type="monotone" dataKey="views" name="المشاهدات" stroke="#D99512" strokeWidth={2.5} fillOpacity={1} fill="url(#colorViews)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Property Performance Bar Chart */}
        <div className="neu-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-[var(--neu-text-heading)]">أداء فئات الوحدات العقارية</h3>
              <p className="text-xs text-[var(--neu-text-muted)] mt-0.5">عدد الوحدات المعروضة مقارنة بالوحدات المباعة فعلياً</p>
            </div>
            <BarChart2 className="w-5 h-5 text-[var(--neu-gold)]" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PROPERTY_PERFORMANCE} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--neu-text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: 'var(--neu-text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111315',
                    border: '1px solid rgba(217, 149, 18, 0.35)',
                    borderRadius: '12px',
                    color: '#F3F4F6',
                    fontSize: '12px',
                    fontFamily: 'inherit',
                    textAlign: 'right'
                  }}
                />
                <Bar dataKey="الوحدات المعروضة" fill="#111315" radius={[6, 6, 0, 0]} />
                <Bar dataKey="تم بيعها" fill="#D99512" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        <Link
          href="/mar-cp/properties/new"
          className="neu-card neu-card-interactive flex items-center gap-4 group"
        >
          <div className="neu-raised-sm rounded-xl p-3 group-hover:shadow-[0_0_12px_var(--neu-gold-glow)]">
            <Plus className="w-6 h-6 text-[var(--neu-gold)]" />
          </div>
          <div>
            <p className="font-bold text-[var(--neu-text-heading)] group-hover:text-[var(--neu-gold)] transition-colors">
              إضافة عقار جديد
            </p>
            <p className="text-xs text-[var(--neu-text-muted)]">أضف وحدة عقارية للعرض</p>
          </div>
          <ArrowUpLeft className="w-5 h-5 text-[var(--neu-text-muted)] ms-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>

        <Link
          href="/mar-cp/projects/new"
          className="neu-card neu-card-interactive flex items-center gap-4 group"
        >
          <div className="neu-raised-sm rounded-xl p-3 group-hover:shadow-[0_0_12px_var(--neu-gold-glow)]">
            <FolderKanban className="w-6 h-6 text-[var(--neu-gold)]" />
          </div>
          <div>
            <p className="font-bold text-[var(--neu-text-heading)] group-hover:text-[var(--neu-gold)] transition-colors">
              إضافة مشروع جديد
            </p>
            <p className="text-xs text-[var(--neu-text-muted)]">أنشئ مشروعاً عقارياً</p>
          </div>
          <ArrowUpLeft className="w-5 h-5 text-[var(--neu-text-muted)] ms-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>

        <Link
          href="/mar-cp/submissions"
          className="neu-card neu-card-interactive flex items-center gap-4 group"
        >
          <div className="neu-raised-sm rounded-xl p-3 group-hover:shadow-[0_0_12px_var(--neu-gold-glow)] relative">
            <MessageSquareText className="w-6 h-6 text-[var(--neu-gold)]" />
            {statsData.newSubmissions > 0 && (
              <span className="absolute -top-1 -left-1 w-5 h-5 bg-[var(--neu-danger)] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {statsData.newSubmissions}
              </span>
            )}
          </div>
          <div>
            <p className="font-bold text-[var(--neu-text-heading)] group-hover:text-[var(--neu-gold)] transition-colors">
              الاستفسارات الجديدة
            </p>
            <p className="text-xs text-[var(--neu-text-muted)]">راجع آخر الاستفسارات</p>
          </div>
          <ArrowUpLeft className="w-5 h-5 text-[var(--neu-text-muted)] ms-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
      </div>

      {/* Recent Submissions Section (Cards) */}
      <div className="neu-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-[var(--neu-text-heading)]">آخر الاستفسارات المستلمة</h3>
            <p className="text-xs text-[var(--neu-text-muted)] mt-0.5">أحدث 4 طلبات واستفسارات بحاجة للمتابعة</p>
          </div>
          <Link
            href="/mar-cp/submissions"
            className="text-sm text-[var(--neu-gold)] hover:text-[var(--neu-gold-light)] transition-colors font-medium"
          >
            عرض الكل ←
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Loader2 className="w-8 h-8 text-[var(--neu-gold)] animate-spin mb-2" />
            <p className="text-xs text-[var(--neu-text-secondary)]">جاري تحميل الاستفسارات الحديثة...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="neu-card p-4 flex flex-col justify-between relative overflow-hidden transition-all duration-300 border border-[var(--neu-border)] hover:border-[var(--neu-gold)]/40 hover:shadow-md"
                >
                  {/* Card Header */}
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm text-[var(--neu-text-heading)] truncate">{sub.name}</h4>
                      <p className="text-[10px] text-[var(--neu-text-muted)] font-mono mt-0.5" dir="ltr text-right">{sub.phone}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`neu-badge text-[9px] py-0.5 px-2 ${STATUS_MAP[sub.status].class}`}>
                        {STATUS_MAP[sub.status].label}
                      </span>
                      <span className="neu-badge neu-badge-gold text-[9px] py-0.5 px-2">
                        {TYPE_MAP[sub.type]}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="mb-4">
                    <p className="font-semibold text-xs text-[var(--neu-text-secondary)] mb-1 truncate">{sub.subject}</p>
                    <p className="text-xs text-[var(--neu-text-secondary)] line-clamp-2 leading-relaxed bg-[var(--neu-depressed)] border border-[var(--neu-border)] p-2.5 rounded-xl min-h-[42px]">
                      {sub.message}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-[var(--neu-border)] text-[10px] text-[var(--neu-text-muted)]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(sub.created_at).toLocaleDateString('ar-SA', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <div className="flex gap-2">
                      <Link
                        href={`/mar-cp/submissions?id=${sub.id}`}
                        className="neu-btn neu-btn-ghost py-1 px-3 text-[10px] flex items-center gap-1"
                      >
                        <span>عرض وتعديل</span>
                      </Link>
                      <a
                        href={`tel:${sub.phone}`}
                        className="neu-btn neu-btn-ghost neu-btn-sm p-1.5"
                        title="اتصال مباشر"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {recentSubmissions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-[var(--neu-success)] mb-3 opacity-50" />
                <p className="text-[var(--neu-text-secondary)] font-medium">لا توجد استفسارات جديدة</p>
                <p className="text-xs text-[var(--neu-text-muted)] mt-1">تم مراجعة جميع الاستفسارات بنجاح ✓</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
