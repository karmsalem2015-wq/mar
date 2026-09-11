// src/app/mar-cp/properties/[id]/page.tsx
import React from 'react';
import PropertyForm from '../../../../components/admin/PropertyForm';
import AdminBreadcrumb from '../../../../components/admin/layout/AdminBreadcrumb';
import { getPropertyById } from '@/app/actions/properties';
import { notFound } from 'next/navigation';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تعديل العقار — لوحة التحكم',
};

interface EditPropertyPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const { id } = await params;
  const property = await getPropertyById(id);

  if (!property) {
    notFound();
  }

  return (
    <div>
      <AdminBreadcrumb
        items={[
          { label: 'العقارات', href: '/mar-cp/properties' },
          { label: `تعديل: ${property.title}` },
        ]}
      />
      <PropertyForm initialData={property} propertyId={id} />
    </div>
  );
}
