// src/app/mar-cp/projects/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AdminBreadcrumb from '../../../components/admin/layout/AdminBreadcrumb';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  Star,
  FolderKanban,
  Loader2,
} from 'lucide-react';
import { getProjectsListAdmin, deleteProject } from '@/app/actions/properties';

const STATUS_LABELS: Record<string, { label: string; class: string }> = {
  under_construction: { label: 'تحت الإنشاء', class: 'neu-badge-warning neu-badge-dot' },
  completed: { label: 'مكتمل', class: 'neu-badge-success neu-badge-dot' },
  upcoming: { label: 'قادم', class: 'neu-badge-info neu-badge-dot' },
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [projectToDelete, setProjectToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const fetchProjects = async () => {
    setLoading(true);
    const data = await getProjectsListAdmin();
    setProjects(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = (id: string, name: string) => {
    setDeleteError('');
    setProjectToDelete({ id, name });
  };

  const filteredProjects = projects.filter((proj) => {
    if (!searchQuery) return true;
    const nameVal = proj.name || '';
    const cityVal = proj.city || proj.location?.city || '';
    return nameVal.includes(searchQuery) || cityVal.includes(searchQuery);
  });

  return (
    <div>
      <AdminBreadcrumb items={[{ label: 'المشاريع' }]} />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--neu-text-heading)]">إدارة المشاريع</h2>
          <p className="text-sm text-[var(--neu-text-muted)] mt-1">
            {projects.length} مشروع مسجّل
          </p>
        </div>
        <Link href="/mar-cp/projects/new" className="neu-btn neu-btn-primary">
          <Plus className="w-4 h-4" />
          إضافة مشروع
        </Link>
      </div>

      {/* Search */}
      <div className="neu-card mb-6">
        <div className="relative">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neu-text-muted)]" />
          <input
            type="text"
            placeholder="ابحث بالاسم أو المدينة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="neu-input neu-input-search"
          />
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center neu-card">
          <Loader2 className="w-10 h-10 text-[var(--neu-gold)] animate-spin mb-3" />
          <p className="text-sm text-[var(--neu-text-secondary)]">جاري تحميل المشاريع من قاعدة البيانات...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredProjects.map((proj) => {
              const heroSrc = proj.hero_image || proj.media?.hero || '/projects/placeholder.webp';
              const cityVal = proj.city || proj.location?.city || '';
              const districtVal = proj.district || proj.location?.district || '';
              const availUnits = proj.available_units !== undefined ? proj.available_units : proj.specs?.availableUnits;
              const totalUnits = proj.total_units !== undefined ? proj.total_units : proj.specs?.totalUnits;
              const minPrice = proj.price_min !== undefined ? proj.price_min : proj.priceRange?.min;

              return (
                <div key={proj.id} className="neu-card neu-card-interactive overflow-hidden p-0">
                  {/* Image */}
                  <div className="p-3 pb-0">
                    <div className="relative h-48 bg-[var(--neu-depressed)] rounded-2xl overflow-hidden">
                      <Image
                        src={heroSrc}
                        alt={proj.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-3 right-3">
                        <span className={`neu-badge ${STATUS_LABELS[proj.status]?.class || ''}`}>
                          {STATUS_LABELS[proj.status]?.label || proj.status}
                        </span>
                      </div>
                      {proj.featured && (
                        <div className="absolute top-3 left-3">
                          <Star className="w-5 h-5 text-[var(--neu-gold)] fill-[var(--neu-gold)]" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-[var(--neu-text-heading)] mb-1">{proj.name}</h3>
                    <p className="text-sm text-[var(--neu-text-muted)] mb-3">
                      {cityVal}، {districtVal}
                    </p>

                    <div className="flex items-center justify-between text-sm mb-4">
                      <div>
                        <span className="text-[var(--neu-text-muted)]">الوحدات: </span>
                        <span className="font-semibold text-[var(--neu-text-heading)]">
                          {availUnits}/{totalUnits}
                        </span>
                      </div>
                      <div>
                        <span className="text-[var(--neu-gold)] font-bold">
                          {minPrice ? minPrice.toLocaleString('en-US') : '0'}
                        </span>
                        <span className="text-xs text-[var(--neu-text-muted)] ms-1">ر.س</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/projects/${proj.slug}`}
                        target="_blank"
                        className="neu-btn neu-btn-ghost neu-btn-sm flex-1"
                      >
                        <Eye className="w-4 h-4" />
                        معاينة
                      </Link>
                      <Link
                        href={`/mar-cp/projects/${proj.id}`}
                        className="neu-btn neu-btn-secondary neu-btn-sm flex-1"
                      >
                        <Edit3 className="w-4 h-4" />
                        تعديل
                      </Link>
                      <button
                        onClick={() => handleDelete(proj.id, proj.name)}
                        className="neu-btn neu-btn-danger neu-btn-sm"
                        title="حذف"
                        aria-label={`حذف مشروع ${proj.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProjects.length === 0 && (
            <div className="neu-card flex flex-col items-center justify-center py-16 text-center">
              <FolderKanban className="w-12 h-12 text-[var(--neu-text-muted)] mb-3 opacity-30" />
              <p className="text-[var(--neu-text-secondary)] font-medium">لا توجد مشاريع مطابقة</p>
            </div>
          )}
        </>
      )}
      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[210] flex items-center justify-center p-4"
          onClick={() => !isDeleting && setProjectToDelete(null)}
          role="dialog"
          aria-label="تأكيد الحذف"
        >
          <div
            className="neu-card w-full max-w-md p-6 text-center animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-full bg-[var(--neu-danger)]/10 border-2 border-[var(--neu-danger)]/20 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-[var(--neu-danger)]" />
            </div>
            
            <h3 className="text-lg font-bold text-[var(--neu-text-heading)] mb-2">تأكيد حذف المشروع</h3>
            <p className="text-sm text-[var(--neu-text-secondary)] mb-6">
              هل أنت متأكد من رغبتك في حذف المشروع <strong className="text-[var(--neu-text-heading)]">"{projectToDelete.name}"</strong>؟
              <br />
              سيتم حذف كافة البيانات المرتبطة بهذا المشروع نهائياً من قاعدة البيانات، ولا يمكن التراجع عن هذا الإجراء.
            </p>

            {deleteError && (
              <p className="text-xs text-[var(--neu-danger)] mb-4 font-bold">
                ⚠️ {deleteError}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={async () => {
                  setIsDeleting(true);
                  setDeleteError('');
                  const res = await deleteProject(projectToDelete.id);
                  if (res.success) {
                    setProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id));
                    setProjectToDelete(null);
                  } else {
                    setDeleteError(res.error || 'فشل حذف المشروع');
                  }
                  setIsDeleting(false);
                }}
                disabled={isDeleting}
                className="neu-btn neu-btn-primary bg-[var(--neu-danger)] hover:bg-[var(--neu-danger)]/90 border-0 flex-1"
              >
                {isDeleting ? 'جاري الحذف...' : 'نعم، احذف المشروع'}
              </button>
              <button
                onClick={() => setProjectToDelete(null)}
                disabled={isDeleting}
                className="neu-btn neu-btn-secondary flex-1"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
