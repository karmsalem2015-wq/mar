// src/components/admin/layout/AdminTopbar.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, Bell, ExternalLink, Search, Sun, Moon } from 'lucide-react';

interface AdminTopbarProps {
  onToggleMobile: () => void;
  pageTitle?: string;
  newSubmissionsCount?: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function AdminTopbar({
  onToggleMobile,
  pageTitle,
  newSubmissionsCount = 0,
  theme,
  onToggleTheme,
}: AdminTopbarProps) {
  return (
    <header className="admin-topbar">
      {/* Mobile menu button */}
      <button
        onClick={onToggleMobile}
        className="lg:hidden flex items-center justify-center neu-btn-icon neu-raised-sm ms-0 me-3"
        aria-label="فتح القائمة"
      >
        <Menu className="w-5 h-5 text-[var(--neu-text-secondary)]" />
      </button>

      {/* Official Horizontal Brand Logo */}
      <Link
        href="/mar-cp"
        className="flex items-center me-6 shrink-0 transition-opacity duration-200 hover:opacity-90"
        title="مار العقارية - لوحة التحكم"
      >
        <Image
          src="/heder-logo.png"
          alt="مار العقارية"
          width={160}
          height={42}
          className="h-9 sm:h-10 w-auto object-contain shrink-0"
          priority
        />
      </Link>

      {/* Page title */}
      {pageTitle && (
        <h1 className="text-lg font-bold text-[var(--neu-text-heading)] me-4 hidden sm:block">
          {pageTitle}
        </h1>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Quick search */}
      <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl neu-inset-sm me-3">
        <Search className="w-4 h-4 text-[var(--neu-text-muted)]" />
        <input
          type="text"
          placeholder="بحث سريع..."
          className="bg-transparent border-none outline-none text-sm text-[var(--neu-text-primary)] placeholder-[var(--neu-text-muted)] w-48 font-inherit"
        />
      </div>

      {/* Theme Toggle */}
      <button
        onClick={onToggleTheme}
        className="flex items-center justify-center neu-btn-icon neu-raised-sm me-2"
        aria-label="تبديل المظهر"
        title={theme === 'light' ? 'تفعيل الوضع الداكن' : 'تفعيل الوضع الفاتح'}
      >
        {theme === 'light' ? (
          <Moon className="w-5 h-5 text-[var(--neu-text-secondary)]" />
        ) : (
          <Sun className="w-5 h-5 text-[var(--neu-text-secondary)]" />
        )}
      </button>

      {/* Notifications */}
      <button
        className="flex items-center justify-center neu-btn-icon neu-raised-sm relative me-2"
        aria-label="الإشعارات"
        title="الإشعارات"
      >
        <Bell className="w-5 h-5 text-[var(--neu-text-secondary)]" />
        {newSubmissionsCount > 0 && (
          <span className="absolute -top-1.5 -end-1.5 min-w-[18px] h-[18px] rounded-full bg-red-600 border-2 border-[var(--neu-bg)] text-[9px] font-bold text-white flex items-center justify-center px-1">
            {newSubmissionsCount}
          </span>
        )}
      </button>

      {/* View site link */}
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center neu-btn-icon neu-raised-sm"
        aria-label="عرض الموقع"
        title="عرض الموقع"
      >
        <ExternalLink className="w-5 h-5 text-[var(--neu-text-secondary)]" />
      </a>
    </header>
  );
}
