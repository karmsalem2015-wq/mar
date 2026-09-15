// src/app/mar-cp/analytics/page.tsx
'use client';

import React from 'react';
import AdminBreadcrumb from '../../../components/admin/layout/AdminBreadcrumb';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Clock,
  MousePointerClick,
  Globe,
  Smartphone,
  Monitor,
  ArrowUpLeft,
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
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

// ---- Mock Data ----

const MONTHLY_TRAFFIC = [
  { day: '1', views: 0, visitors: 0 },
  { day: '3', views: 0, visitors: 0 },
  { day: '5', views: 0, visitors: 0 },
  { day: '7', views: 0, visitors: 0 },
  { day: '9', views: 0, visitors: 0 },
  { day: '11', views: 0, visitors: 0 },
  { day: '13', views: 0, visitors: 0 },
  { day: '15', views: 0, visitors: 0 },
  { day: '17', views: 0, visitors: 0 },
  { day: '19', views: 0, visitors: 0 },
  { day: '21', views: 0, visitors: 0 },
  { day: '23', views: 0, visitors: 0 },
  { day: '25', views: 0, visitors: 0 },
  { day: '27', views: 0, visitors: 0 },
  { day: '29', views: 0, visitors: 0 },
  { day: '30', views: 0, visitors: 0 },
];

const TOP_PROPERTIES: { name: string; views: number }[] = [];

const TRAFFIC_SOURCES = [
  { name: 'بحث جوجل', value: 0, color: '#E6A821' },
  { name: 'زيارة مباشرة', value: 0, color: '#EA580C' },
  { name: 'سوشال ميديا', value: 0, color: '#10B981' },
  { name: 'إحالات', value: 0, color: '#F59E0B' },
];

const TOP_PAGES = [
  { page: 'الصفحة الرئيسية', path: '/', views: 0, bounce: '0%' },
  { page: 'جميع العقارات', path: '/properties', views: 0, bounce: '0%' },
  { page: 'مشروع أمل ستارز', path: '/projects/amal-stars', views: 0, bounce: '0%' },
  { page: 'صفحة التواصل', path: '/contact', views: 0, bounce: '0%' },
  { page: 'من نحن', path: '/about', views: 0, bounce: '0%' },
];

const DEVICE_STATS = [
  { device: 'الجوال', icon: Smartphone, percentage: 0, color: 'var(--neu-gold)' },
  { device: 'الكمبيوتر', icon: Monitor, percentage: 0, color: '#EA580C' },
  { device: 'التابلت', icon: Globe, percentage: 0, color: '#10B981' },
];

// Tooltip style shared across charts
const tooltipStyle = {
  backgroundColor: '#111315',
  border: '1px solid rgba(230, 168, 33, 0.25)',
  borderRadius: '12px',
  color: '#F3F4F6',
  fontSize: '12px',
  fontFamily: 'inherit',
  textAlign: 'right' as const,
};

export default function AnalyticsPage() {
  const stats = [
    {
      label: 'إجمالي الزيارات',
      value: '0',
      change: '0%',
      trend: 'up' as const,
      icon: Eye,
    },
    {
      label: 'الزوار الفريدون',
      value: '0',
      change: '0%',
      trend: 'up' as const,
      icon: Users,
    },
    {
      label: 'معدل التحويل',
      value: '0%',
      change: '0%',
      trend: 'up' as const,
      icon: MousePointerClick,
    },
    {
      label: 'متوسط مدة الجلسة',
      value: '0:00',
      change: '0s',
      trend: 'up' as const,
      icon: Clock,
    },
  ];

  return (
    <div>
      <AdminBreadcrumb items={[{ label: 'التحليلات' }]} />

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[var(--neu-text-heading)]">تحليلات الموقع</h2>
        <p className="text-sm text-[var(--neu-text-muted)] mt-1">
          نظرة شاملة على أداء الموقع خلال الـ 30 يوم الماضية
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-5 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="neu-card p-3 sm:p-5">
              <div className="flex items-start justify-between gap-1">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-semibold text-[var(--neu-text-secondary)] mb-1 truncate">{stat.label}</p>
                  <p className="text-2xl sm:text-3xl font-black text-[var(--neu-text-heading)] tracking-tight">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.trend === 'up' ? (
                      <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                    )}
                    <span className={`text-[10px] sm:text-xs font-semibold ${stat.trend === 'up' ? 'text-green-500' : 'text-red-400'}`}>
                      {stat.change}
                    </span>
                    <span className="text-[10px] text-[var(--neu-text-muted)]">عن الشهر السابق</span>
                  </div>
                </div>
                <div className="neu-raised-sm rounded-xl p-2 sm:p-3 shrink-0 border border-[var(--neu-border)]">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--neu-gold)]" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1: Traffic + Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        {/* Monthly Traffic Area Chart */}
        <div className="neu-card lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-[var(--neu-text-heading)]">حركة الزوار الشهرية</h3>
              <p className="text-xs text-[var(--neu-text-muted)] mt-0.5">المشاهدات والزوار الفريدون خلال 30 يوم</p>
            </div>
            <ArrowUpLeft className="w-5 h-5 text-[var(--neu-gold)]" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_TRAFFIC} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViewsAnalytics" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E6A821" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#E6A821" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EA580C" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#EA580C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="day" tick={{ fill: 'var(--neu-text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: 'var(--neu-text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: '#F3F4F6' }} />
                <Area type="monotone" dataKey="views" name="المشاهدات" stroke="#E6A821" strokeWidth={2.5} fillOpacity={1} fill="url(#colorViewsAnalytics)" />
                <Area type="monotone" dataKey="visitors" name="الزوار" stroke="#EA580C" strokeWidth={2} fillOpacity={1} fill="url(#colorVisitors)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Traffic Sources Pie Chart */}
        <div className="neu-card">
          <h3 className="font-bold text-[var(--neu-text-heading)] mb-6">مصادر الزوار</h3>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={TRAFFIC_SOURCES}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {TRAFFIC_SOURCES.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: '#F3F4F6' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="space-y-2 mt-4">
            {TRAFFIC_SOURCES.map((source) => (
              <div key={source.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="analytics-legend-dot" style={{ '--dot-color': source.color } as React.CSSProperties} />
                  <span className="text-[var(--neu-text-secondary)]">{source.name}</span>
                </div>
                <span className="font-semibold text-[var(--neu-text-heading)]">{source.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2: Top Properties + Device Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        {/* Top Properties Bar Chart */}
        <div className="neu-card lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-[var(--neu-text-heading)]">أكثر العقارات مشاهدة</h3>
              <p className="text-xs text-[var(--neu-text-muted)] mt-0.5">ترتيب العقارات حسب عدد المشاهدات</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TOP_PROPERTIES} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(165,180,203,0.15)" />
                <XAxis type="number" tick={{ fill: 'var(--neu-text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fill: 'var(--neu-text-secondary)', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={120}
                />
                <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: '#F3F4F6' }} />
                <Bar dataKey="views" name="المشاهدات" fill="#E6A821" radius={[0, 6, 6, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="neu-card">
          <h3 className="font-bold text-[var(--neu-text-heading)] mb-6">الأجهزة المستخدمة</h3>
          <div className="space-y-5">
            {DEVICE_STATS.map((device) => {
              const Icon = device.icon;
              return (
                <div key={device.device}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="neu-raised-sm rounded-lg p-2">
                        <Icon className="w-4 h-4 analytics-device-icon" style={{ '--icon-color': device.color } as React.CSSProperties} />
                      </div>
                      <span className="text-sm text-[var(--neu-text-secondary)]">{device.device}</span>
                    </div>
                    <span className="font-bold text-[var(--neu-text-heading)]">{device.percentage}%</span>
                  </div>
                  <div className="neu-progress-wrapper">
                    <div
                      className="neu-progress-bar"
                      style={{ '--bar-color': device.color, width: `${device.percentage}%` } as React.CSSProperties}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary note */}
          <div className="mt-6 p-3 rounded-xl neu-inset-sm">
            <p className="text-xs text-[var(--neu-text-muted)] leading-relaxed text-center">
              <Smartphone className="w-3.5 h-3.5 inline-block me-1 text-[var(--neu-gold)]" />
              لا تتوفر بيانات أجهزة حقيقية حتى الآن
            </p>
          </div>
        </div>
      </div>

      {/* Top Pages Table */}
      <div className="neu-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-[var(--neu-text-heading)]">أكثر الصفحات زيارة</h3>
            <p className="text-xs text-[var(--neu-text-muted)] mt-0.5">ترتيب الصفحات حسب عدد الزيارات الشهرية</p>
          </div>
        </div>
        <div className="neu-table-wrapper overflow-x-auto">
          <table className="neu-table">
            <thead>
              <tr>
                <th>#</th>
                <th>الصفحة</th>
                <th className="hidden sm:table-cell">المسار</th>
                <th>الزيارات</th>
                <th className="hidden sm:table-cell">معدل الارتداد</th>
              </tr>
            </thead>
            <tbody>
              {TOP_PAGES.map((page, i) => (
                <tr key={page.path}>
                  <td>
                    <span className="text-xs font-bold text-[var(--neu-gold)]">{i + 1}</span>
                  </td>
                  <td>
                    <span className="font-semibold text-[var(--neu-text-heading)]">{page.page}</span>
                  </td>
                  <td className="hidden sm:table-cell">
                    <code className="text-xs text-[var(--neu-text-muted)] bg-[var(--neu-depressed)] px-2 py-0.5 rounded" dir="ltr">
                      {page.path}
                    </code>
                  </td>
                  <td>
                    <span className="font-semibold text-[var(--neu-text-heading)]">
                      {page.views.toLocaleString('en-US')}
                    </span>
                  </td>
                  <td className="hidden sm:table-cell">
                    <span className="text-sm text-[var(--neu-text-secondary)]">{page.bounce}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
