'use client';

import React, { useState, useEffect } from 'react';
import '../../styles/admin.css';
import AdminSidebar from '../../components/admin/layout/AdminSidebar';
import AdminTopbar from '../../components/admin/layout/AdminTopbar';
import { usePathname } from 'next/navigation';
import { getSubmissionsList } from '@/app/actions/submissions';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Load and apply initial theme synchronously
  useEffect(() => {
    try {
      const saved = (localStorage.getItem('mar-admin-theme') as 'light' | 'dark') || 'dark';
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    } catch {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    try {
      localStorage.setItem('mar-admin-theme', next);
      document.cookie = `mar-admin-theme=${next}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {}
    document.documentElement.setAttribute('data-theme', next);
  };

  const isLoginPage = pathname === '/mar-cp/login';

  useEffect(() => {
    if (isLoginPage) return;

    async function fetchUnreadCount() {
      try {
        const list = await getSubmissionsList();
        const count = list.filter((s) => s.status === 'new').length;
        setUnreadCount(count);
      } catch (err) {
        console.error('Failed to fetch unread count:', err);
      }
    }

    fetchUnreadCount();
    // Poll every 15 seconds to keep notifications synced in real-time
    const interval = setInterval(fetchUnreadCount, 15000);
    return () => clearInterval(interval);
  }, [pathname, isLoginPage]);

  if (isLoginPage) {
    return children;
  }

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem('mar-admin-theme')||'dark';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
        }}
      />
      <div className="admin-layout">
      <AdminSidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileOpen}
        onToggleMobile={() => setMobileOpen(!mobileOpen)}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        newSubmissionsCount={unreadCount}
      />
      <div className="admin-main">
        <AdminTopbar
          onToggleMobile={() => setMobileOpen(!mobileOpen)}
          newSubmissionsCount={unreadCount}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  </>
);
}
