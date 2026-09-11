// src/components/admin/layout/AdminSidebar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  FolderKanban,
  MessageSquareText,
  Settings,
  BarChart3,
  ImageIcon,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  X,
  Users,
} from 'lucide-react';
import { getSupabaseBrowserClient } from '../../../lib/supabase/client';

interface AdminSidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleMobile: () => void;
  onToggleCollapse: () => void;
  newSubmissionsCount?: number;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: boolean;
}

interface NavSection {
  section: string;
  items: NavItem[];
}

const NAV_ITEMS: NavSection[] = [
  {
    section: 'الرئيسية',
    items: [
      { label: 'لوحة التحكم', href: '/mar-cp', icon: LayoutDashboard },
    ],
  },
  {
    section: 'إدارة المحتوى',
    items: [
      { label: 'العقارات', href: '/mar-cp/properties', icon: Building2 },
      { label: 'المشاريع', href: '/mar-cp/projects', icon: FolderKanban },
      { label: 'الوسائط', href: '/mar-cp/media', icon: ImageIcon },
    ],
  },
  {
    section: 'التعامل',
    items: [
      { label: 'الاستفسارات', href: '/mar-cp/submissions', icon: MessageSquareText, badge: true },
    ],
  },
  {
    section: 'النظام',
    items: [
      { label: 'التحليلات', href: '/mar-cp/analytics', icon: BarChart3 },
      { label: 'إدارة الحسابات', href: '/mar-cp/users', icon: Users },
      { label: 'إعدادات الموقع', href: '/mar-cp/settings', icon: Settings },
    ],
  },
];

export default function AdminSidebar({
  collapsed,
  mobileOpen,
  onToggleMobile,
  onToggleCollapse,
  newSubmissionsCount = 0,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === '/mar-cp') return pathname === '/mar-cp';
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
      router.push('/mar-cp/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
      window.location.href = '/mar-cp/login';
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggleMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`admin-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
        role="navigation"
        aria-label="القائمة الجانبية"
      >
        {/* Sidebar Header with collapse/close controls */}
        <div className="flex items-center justify-between p-4 h-[70px] shrink-0">
          {/* Desktop collapse button */}
          <button
            onClick={onToggleCollapse}
            className={`hidden lg:flex items-center justify-center neu-btn-icon neu-raised-sm desktop-collapse-btn ${
              collapsed ? 'mx-auto' : 'ms-auto'
            }`}
            aria-label={collapsed ? 'توسيع القائمة' : 'طي القائمة'}
          >
            {collapsed ? (
              <ChevronsLeft className="w-5 h-5 text-[var(--neu-text-secondary)]" />
            ) : (
              <ChevronsRight className="w-5 h-5 text-[var(--neu-text-secondary)]" />
            )}
          </button>

          {/* Mobile close button */}
          <button
            onClick={onToggleMobile}
            className="lg:hidden ms-auto p-1.5 rounded-lg text-[var(--neu-text-muted)] hover:text-[var(--neu-gold)] transition-colors flex items-center justify-center"
            aria-label="إغلاق القائمة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((section) => (
            <div key={section.section}>
              <div className="sidebar-section-label">{section.section}</div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`sidebar-nav-item ${active ? 'active' : ''}`}
                    onClick={() => {
                      if (mobileOpen) onToggleMobile();
                    }}
                    title={collapsed ? item.label : undefined}
                  >
                    <div className="relative flex items-center justify-center">
                      <Icon className="sidebar-nav-icon" />
                      {item.badge && newSubmissionsCount > 0 && (
                        <span className="sidebar-badge-absolute">
                          {newSubmissionsCount}
                        </span>
                      )}
                    </div>
                    <span className="sidebar-label">{item.label}</span>
                    {item.badge && newSubmissionsCount > 0 && (
                      <span className="badge sidebar-badge-inline">{newSubmissionsCount}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom: Logout */}
        <div className="p-3 flex justify-center w-full">
          <button
            type="button"
            onClick={handleLogout}
            className="sidebar-logout-btn"
            title={collapsed ? 'تسجيل الخروج' : undefined}
            aria-label="تسجيل الخروج"
          >
            <LogOut className="sidebar-logout-icon" />
            <span className="sidebar-logout-text">تسجيل الخروج</span>
          </button>
        </div>
      </aside>
    </>
  );
}
