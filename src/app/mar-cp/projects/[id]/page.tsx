// src/app/mar-cp/projects/[id]/page.tsx
import React, { Suspense } from 'react';
import ProjectForm from '../../../../components/admin/ProjectForm';
import AdminBreadcrumb from '../../../../components/admin/layout/AdminBreadcrumb';
import { getProjectById } from '@/app/actions/properties';
import { notFound } from 'next/navigation';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تعديل المشروع — لوحة التحكم',
};

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) {
    notFound();
  }

  return (
    <div>
      <AdminBreadcrumb
        items={[
          { label: 'المشاريع', href: '/mar-cp/projects' },
          { label: `تعديل: ${project.name}` },
        ]}
      />
      <Suspense fallback={
        <div className="neu-card p-8 text-center flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-[var(--neu-gold)] border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm text-[var(--neu-text-secondary)]">جاري تحميل نموذج المشروع...</p>
        </div>
      }>
        <ProjectForm initialData={project} projectId={id} />
      </Suspense>
    </div>
  );
}
