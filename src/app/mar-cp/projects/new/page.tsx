// src/app/mar-cp/projects/new/page.tsx
import React, { Suspense } from 'react';
import ProjectForm from '../../../../components/admin/ProjectForm';
import AdminBreadcrumb from '../../../../components/admin/layout/AdminBreadcrumb';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'إضافة مشروع جديد — لوحة التحكم',
};

export default function NewProjectPage() {
  return (
    <div>
      <AdminBreadcrumb
        items={[
          { label: 'المشاريع', href: '/mar-cp/projects' },
          { label: 'إضافة مشروع جديد' },
        ]}
      />
      <Suspense fallback={
        <div className="neu-card p-8 text-center flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-[var(--neu-gold)] border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm text-[var(--neu-text-secondary)]">جاري تحميل نموذج المشروع...</p>
        </div>
      }>
        <ProjectForm />
      </Suspense>
    </div>
  );
}
