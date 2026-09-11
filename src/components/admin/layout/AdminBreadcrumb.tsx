// src/components/admin/layout/AdminBreadcrumb.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AdminBreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function AdminBreadcrumb({ items }: AdminBreadcrumbProps) {
  return (
    <nav aria-label="مسار التنقل" className="flex items-center gap-1.5 text-sm mb-6">
      <Link
        href="/mar-cp"
        className="text-[var(--neu-text-muted)] hover:text-[var(--neu-gold)] transition-colors"
        title="الرئيسية"
      >
        <Home className="w-4 h-4" />
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronLeft className="w-3.5 h-3.5 text-[var(--neu-text-muted)]" />
            {isLast || !item.href ? (
              <span className="text-[var(--neu-gold)] font-semibold">{item.label}</span>
            ) : (
              <Link
                href={item.href}
                className="text-[var(--neu-text-muted)] hover:text-[var(--neu-text-primary)] transition-colors"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
