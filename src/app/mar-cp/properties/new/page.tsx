import React, { Suspense } from 'react';
import PropertyForm from '../../../../components/admin/PropertyForm';
import AdminBreadcrumb from '../../../../components/admin/layout/AdminBreadcrumb';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'إضافة عقار جديد — لوحة التحكم',
};

export default function NewPropertyPage() {
  return (
    <div>
      <AdminBreadcrumb
        items={[
          { label: 'العقارات', href: '/mar-cp/properties' },
          { label: 'إضافة عقار جديد' },
        ]}
      />
      <Suspense fallback={
        <div className="neu-card p-8 text-center flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-[var(--neu-gold)] border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm text-[var(--neu-text-secondary)]">جاري تحميل النموذج...</p>
        </div>
      }>
        <PropertyForm />
      </Suspense>
    </div>
  );
}
