// src/app/mar-cp/projects/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AdminBreadcrumb from '../../../components/admin/layout/AdminBreadcrumb';
import AdminSelect from '../../../components/admin/AdminSelect';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  Star,
  FolderKanban,
  Loader2,
  LayoutGrid,
  List,
  Building2,
  Calendar,
  MapPin,
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
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

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
    const nameVal = proj.name || '';
    const cityVal = proj.city || proj.location?.city || '';
    const districtVal = proj.district || proj.location?.district || '';
    
    const matchesSearch = !searchQuery ||
      nameVal.includes(searchQuery) ||
      cityVal.includes(searchQuery) ||
      districtVal.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || proj.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <AdminBreadcrumb items={[{ label: 'المشاريع' }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--neu-text-heading)]">إدارة المشاريع</h2>
          <p className="text-sm text-[var(--neu-text-muted)] mt-1">
            {projects.length} مشروع مسجّل في النظام
          </p>
        </div>
        <Link href="/mar-cp/projects/new" className="neu-btn neu-btn-primary">
          <Plus className="w-4 h-4" />
          إضافة مشروع
        </Link>
      </div>

      {/* Filters Bar & View Switcher */}
      <div className="neu-card mb-6">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neu-text-muted)]" />
            <input
              type="text"
              placeholder="ابحث باسم المشروع، المدينة، أو الحي..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="neu-input neu-input-search"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Status Filter */}
            <AdminSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: 'كل الحالات' },
                { value: 'under_construction', label: 'تحت الإنشاء' },
                { value: 'completed', label: 'مكتمل' },
                { value: 'upcoming', label: 'قادم' },
              ]}
              className="w-full sm:w-44"
              placeholder="تصفية حسب الحالة"
            />

            {/* View Mode Toggle: Table / Cards */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--neu-depressed)] border border-[var(--neu-border)] shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-[var(--neu-gold)] text-black shadow-sm'
                    : 'text-[var(--neu-text-secondary)] hover:text-[var(--neu-text-heading)]'
                }`}
                title="عرض الجدول"
                aria-label="عرض الجدول"
              >
                <List className="w-3.5 h-3.5" />
                <span>جدول</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[var(--neu-gold)] text-black shadow-sm'
                    : 'text-[var(--neu-text-secondary)] hover:text-[var(--neu-text-heading)]'
                }`}
                title="عرض الكروت"
                aria-label="عرض الكروت"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>كروت</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center neu-card">
          <Loader2 className="w-10 h-10 text-[var(--neu-gold)] animate-spin mb-3" />
          <p className="text-sm text-[var(--neu-text-secondary)]">جاري تحميل المشاريع...</p>
        </div>
      ) : (
        <>
          {viewMode === 'table' ? (
            <div>
              {/* Desktop Table View */}
              <div className="neu-table-wrapper w-full max-w-full overflow-x-auto overscroll-x-contain" style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-x pan-y" }}>
                <table className="neu-table !w-[960px] !min-w-[960px]">
                  <thead>
                    <tr>
                      <th>المشروع</th>
                      <th>الحالة</th>
                      <th>المدينة والحي</th>
                      <th>نطاق الأسعار</th>
                      <th>الوحدات</th>
                      <th>تاريخ التسليم</th>
                      <th className="!min-w-[150px]">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.map((proj) => {
                      const heroSrc = proj.hero_image || proj.media?.hero || '/projects/placeholder.webp';
                      const cityVal = proj.city || proj.location?.city || '';
                      const districtVal = proj.district || proj.location?.district || '';
                      const availUnits = proj.available_units !== undefined ? proj.available_units : proj.specs?.availableUnits;
                      const totalUnits = proj.total_units !== undefined ? proj.total_units : proj.specs?.totalUnits;
                      const minPrice = proj.price_min !== undefined ? proj.price_min : proj.priceRange?.min;
                      const maxPrice = proj.price_max !== undefined ? proj.price_max : proj.priceRange?.max;
                      const completionDate = proj.completion_date || proj.specs?.completionDate || 'غير محدد';

                      return (
                        <tr key={proj.id}>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="w-14 h-14 rounded-xl overflow-hidden bg-[var(--neu-depressed)] shrink-0 relative border border-white/5">
                                <Image
                                  src={heroSrc}
                                  alt={proj.name}
                                  fill
                                  className="object-cover"
                                  sizes="56px"
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-[var(--neu-text-heading)] truncate max-w-[200px]">
                                  {proj.name}
                                </p>
                                <p className="text-xs text-[var(--neu-text-muted)] mt-0.5 truncate max-w-[220px]">
                                  {proj.tagline || `${cityVal}، ${districtVal}`}
                                </p>
                              </div>
                              {proj.featured && (
                                <Star className="w-4 h-4 text-[var(--neu-gold)] fill-[var(--neu-gold)] shrink-0" />
                              )}
                            </div>
                          </td>
                          <td>
                            <span className={`neu-badge ${STATUS_LABELS[proj.status]?.class || ''}`}>
                              {STATUS_LABELS[proj.status]?.label || proj.status}
                            </span>
                          </td>
                          <td>
                            <span className="text-sm text-[var(--neu-text-secondary)]">
                              {cityVal}، {districtVal}
                            </span>
                          </td>
                          <td>
                            <span className="font-semibold text-[var(--neu-gold)]">
                              {minPrice ? minPrice.toLocaleString('en-US') : '0'}
                              {maxPrice && maxPrice > minPrice ? ` - ${maxPrice.toLocaleString('en-US')}` : ''}
                            </span>
                            <span className="text-xs text-[var(--neu-text-muted)] ms-1">ر.س</span>
                          </td>
                          <td>
                            <span className="text-sm font-semibold text-[var(--neu-text-heading)] font-mono">
                              {availUnits !== undefined ? `${availUnits} من ${totalUnits || '-'}` : (totalUnits || '-')}
                            </span>
                          </td>
                          <td>
                            <span className="text-xs text-[var(--neu-text-secondary)]">
                              {completionDate}
                            </span>
                          </td>
                          <td className="!min-w-[150px]">
                          <div className="flex items-center gap-1 whitespace-nowrap">
                              <Link
                                href={`/projects/${proj.slug}`}
                                target="_blank"
                                className="neu-btn neu-btn-ghost neu-btn-sm"
                                title="معاينة"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              <Link
                                href={`/mar-cp/projects/${proj.id}`}
                                className="neu-btn neu-btn-ghost neu-btn-sm"
                                title="تعديل"
                              >
                                <Edit3 className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => handleDelete(proj.id, proj.name)}
                                className="neu-btn neu-btn-ghost neu-btn-sm text-[var(--neu-danger)] hover:!text-[var(--neu-danger)]"
                                title="حذف"
                                aria-label={`حذف مشروع ${proj.name}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>
          ) : (
            /* Cards Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredProjects.map((proj) => {
                const heroSrc = proj.hero_image || proj.media?.hero || '/projects/placeholder.webp';
                const cityVal = proj.city || proj.location?.city || '';
                const districtVal = proj.district || proj.location?.district || '';
                const availUnits = proj.available_units !== undefined ? proj.available_units : proj.specs?.availableUnits;
                const totalUnits = proj.total_units !== undefined ? proj.total_units : proj.specs?.totalUnits;
                const minPrice = proj.price_min !== undefined ? proj.price_min : proj.priceRange?.min;
                const maxPrice = proj.price_max !== undefined ? proj.price_max : proj.priceRange?.max;

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
                          <span className="font-semibold text-[var(--neu-text-heading)] font-mono">
                            {availUnits}/{totalUnits}
                          </span>
                        </div>
                        <div>
                          <span className="text-[var(--neu-gold)] font-bold">
                            {minPrice ? minPrice.toLocaleString('en-US') : '0'}
                            {maxPrice && maxPrice > minPrice ? ` - ${maxPrice.toLocaleString('en-US')}` : ''}
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
          )}

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
