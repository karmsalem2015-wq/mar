// src/app/mar-cp/properties/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AdminBreadcrumb from '../../../components/admin/layout/AdminBreadcrumb';
import AdminSelect from '../../../components/admin/AdminSelect';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit3,
  Trash2,
  Eye,
  Star,
  Building2,
  Loader2,
  LayoutGrid,
  List,
} from 'lucide-react';
import { getPropertiesListAdmin, deleteProperty } from '@/app/actions/properties';

const STATUS_LABELS: Record<string, { label: string; class: string }> = {
  available: { label: 'متاح', class: 'neu-badge-success neu-badge-dot' },
  reserved: { label: 'محجوز', class: 'neu-badge-warning neu-badge-dot' },
  sold: { label: 'مُباع', class: 'neu-badge-danger neu-badge-dot' },
  coming_soon: { label: 'قريباً', class: 'neu-badge-info neu-badge-dot' },
};

const TYPE_LABELS: Record<string, string> = {
  apartment: 'شقة',
  villa: 'فيلا',
  annex: 'ملحق',
  penthouse: 'بنتهاوس',
  duplex: 'دوبلكس',
};

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const [propertyToDelete, setPropertyToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const fetchProperties = async () => {
    setLoading(true);
    const data = await getPropertiesListAdmin();
    setProperties(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleDelete = (id: string, title: string) => {
    setDeleteError('');
    setPropertyToDelete({ id, title });
  };

  const filteredProperties = properties.filter((prop) => {
    const titleText = prop.title || '';
    const cityText = prop.city || prop.location?.city || '';
    const districtText = prop.district || prop.location?.district || '';
    
    const matchesSearch = !searchQuery ||
      titleText.includes(searchQuery) ||
      cityText.includes(searchQuery) ||
      districtText.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || prop.status === statusFilter;
    const matchesType = typeFilter === 'all' || prop.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div>
      <AdminBreadcrumb items={[{ label: 'العقارات' }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--neu-text-heading)]">إدارة العقارات</h2>
          <p className="text-sm text-[var(--neu-text-muted)] mt-1">
            {properties.length} عقار مسجّل في النظام
          </p>
        </div>
        <Link href="/mar-cp/properties/new" className="neu-btn neu-btn-primary">
          <Plus className="w-4 h-4" />
          إضافة عقار
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="neu-card mb-6">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neu-text-muted)]" />
            <input
              type="text"
              placeholder="ابحث بالعنوان، المدينة، أو الحي..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="neu-input neu-input-search"
            />
          </div>

          {/* Status Filter */}
          <AdminSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'كل الحالات' },
              { value: 'available', label: 'متاح' },
              { value: 'reserved', label: 'محجوز' },
              { value: 'sold', label: 'مُباع' },
              { value: 'coming_soon', label: 'قريباً' },
            ]}
            className="w-full md:w-40"
            placeholder="تصفية حسب الحالة"
          />

          {/* Type Filter */}
          <AdminSelect
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { value: 'all', label: 'كل الأنواع' },
              { value: 'apartment', label: 'شقة' },
              { value: 'villa', label: 'فيلا' },
              { value: 'annex', label: 'ملحق' },
              { value: 'penthouse', label: 'بنتهاوس' },
              { value: 'duplex', label: 'دوبلكس' },
            ]}
            className="w-full md:w-40"
            placeholder="تصفية حسب النوع"
          />

          <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--neu-depressed)] border border-[var(--neu-border)] shrink-0">
            <button type="button" onClick={() => setViewMode('table')} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold ${viewMode === 'table' ? 'bg-[var(--neu-gold)] text-black' : 'text-[var(--neu-text-secondary)]'}`} aria-label="عرض الجدول"><List className="w-3.5 h-3.5" /><span>جدول</span></button>
            <button type="button" onClick={() => setViewMode('grid')} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold ${viewMode === 'grid' ? 'bg-[var(--neu-gold)] text-black' : 'text-[var(--neu-text-secondary)]'}`} aria-label="عرض الكروت"><LayoutGrid className="w-3.5 h-3.5" /><span>كروت</span></button>
          </div>
        </div>
      </div>

      {/* Properties Table */}
      <div>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Loader2 className="w-10 h-10 text-[var(--neu-gold)] animate-spin mb-3" />
            <p className="text-sm text-[var(--neu-text-secondary)]">جاري تحميل العقارات من قاعدة البيانات...</p>
          </div>
        ) : (
          <>
            {viewMode === 'table' && (
            <div className="neu-table-wrapper overflow-x-auto overscroll-x-contain w-full">
              <table className="neu-table min-w-[860px]">
                <thead>
                  <tr>
                    <th>العقار</th>
                    <th className="hidden md:table-cell">النوع</th>
                    <th>الحالة</th>
                    <th className="hidden sm:table-cell">السعر</th>
                    <th className="hidden lg:table-cell">المشروع</th>
                    <th className="hidden xl:table-cell">المدينة</th>
                    <th>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProperties.map((prop) => {
                    const bedroomsVal = prop.bedrooms !== undefined ? prop.bedrooms : prop.specs?.bedrooms;
                    const areaVal = prop.area !== undefined ? prop.area : prop.specs?.area;
                    const priceVal = prop.price !== undefined ? prop.price : prop.pricing?.price;
                    const thumbnailSrc = prop.thumbnail || prop.media?.thumbnail || '/properties/placeholder.webp';
                    const projectName = prop.projects?.name || prop.project?.name || 'عقار منفصل';
                    const cityVal = prop.city || prop.location?.city || '';
                    const districtVal = prop.district || prop.location?.district || '';

                    return (
                      <tr key={prop.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-[var(--neu-depressed)] shrink-0 relative">
                              <Image
                                src={thumbnailSrc}
                                alt={prop.title}
                                fill
                                className="object-cover"
                                sizes="56px"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-[var(--neu-text-heading)] truncate max-w-[200px]">
                                {prop.title}
                              </p>
                              <p className="text-xs text-[var(--neu-text-muted)] mt-0.5">
                                {bedroomsVal} غرف · {areaVal} م²
                              </p>
                            </div>
                            {prop.featured && (
                              <Star className="w-4 h-4 text-[var(--neu-gold)] fill-[var(--neu-gold)] shrink-0" />
                            )}
                          </div>
                        </td>
                        <td className="hidden md:table-cell">
                          <span className="neu-badge neu-badge-gold">
                            {TYPE_LABELS[prop.type] || prop.type}
                          </span>
                        </td>
                        <td>
                          <span className={`neu-badge ${STATUS_LABELS[prop.status]?.class || ''}`}>
                            {STATUS_LABELS[prop.status]?.label || prop.status}
                          </span>
                        </td>
                        <td className="hidden sm:table-cell">
                          <span className="font-semibold text-[var(--neu-gold)]">
                            {priceVal ? priceVal.toLocaleString('en-US') : '0'}
                          </span>
                          <span className="text-xs text-[var(--neu-text-muted)] ms-1">ر.س</span>
                        </td>
                        <td className="hidden lg:table-cell">
                          <span className="text-sm text-[var(--neu-text-secondary)]">
                            {projectName}
                          </span>
                        </td>
                        <td className="hidden xl:table-cell">
                          <span className="text-sm text-[var(--neu-text-secondary)]">
                            {cityVal}، {districtVal}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <Link
                              href={`/property/${prop.slug}`}
                              target="_blank"
                              className="neu-btn neu-btn-ghost neu-btn-sm"
                              title="معاينة"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link
                              href={`/mar-cp/properties/${prop.id}`}
                              className="neu-btn neu-btn-ghost neu-btn-sm"
                              title="تعديل"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(prop.id, prop.title)}
                              className="neu-btn neu-btn-ghost neu-btn-sm text-[var(--neu-danger)] hover:!text-[var(--neu-danger)]"
                              title="حذف"
                              aria-label={`حذف عقار ${prop.title}`}
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
            )}

            {/* Cards List View */}
            {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProperties.map((prop) => {
                const bedroomsVal = prop.bedrooms !== undefined ? prop.bedrooms : prop.specs?.bedrooms;
                const bathroomsVal = prop.bathrooms !== undefined ? prop.bathrooms : prop.specs?.bathrooms;
                const areaVal = prop.area !== undefined ? prop.area : prop.specs?.area;
                const priceVal = prop.price !== undefined ? prop.price : prop.pricing?.price;
                const thumbnailSrc = prop.thumbnail || prop.media?.thumbnail || '/properties/placeholder.webp';
                const projectName = prop.projects?.name || prop.project?.name || 'عقار منفصل';
                const cityVal = prop.city || prop.location?.city || '';
                const districtVal = prop.district || prop.location?.district || '';

                return (
                  <div key={prop.id} className="neu-card flex flex-col gap-4 p-4 relative overflow-hidden">
                    {/* Top Header section: Image, Title, Project, Featured Star */}
                    <div className="flex gap-4 items-start">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[var(--neu-depressed)] shrink-0 relative border border-white/10">
                        <Image
                          src={thumbnailSrc}
                          alt={prop.title}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <span className={`neu-badge text-[10px] py-0.5 px-2 ${STATUS_LABELS[prop.status]?.class || ''}`}>
                            {STATUS_LABELS[prop.status]?.label || prop.status}
                          </span>
                          <span className="neu-badge neu-badge-gold text-[10px] py-0.5 px-2">
                            {TYPE_LABELS[prop.type] || prop.type}
                          </span>
                          {prop.featured && (
                            <Star className="w-3.5 h-3.5 text-[var(--neu-gold)] fill-[var(--neu-gold)] shrink-0" />
                          )}
                        </div>
                        <h4 className="font-bold text-sm text-[var(--neu-text-heading)] line-clamp-1">
                          {prop.title}
                        </h4>
                        <p className="text-xs text-[var(--neu-text-muted)] mt-1 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-[var(--neu-gold)]" />
                          <span>{projectName}</span>
                        </p>
                      </div>
                    </div>

                    {/* Details Info List */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 py-3 border-y border-white/5 text-xs">
                      <div>
                        <span className="text-[10px] text-[var(--neu-text-muted)] block">المدينة والحي</span>
                        <span className="font-semibold text-[var(--neu-text-secondary)]">
                          {cityVal}، {districtVal}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[var(--neu-text-muted)] block">السعر</span>
                        <span className="font-extrabold text-[var(--neu-gold)]">
                          {priceVal ? priceVal.toLocaleString('en-US') : '0'} ر.س
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[var(--neu-text-muted)] block">المساحة</span>
                        <span className="font-semibold text-[var(--neu-text-secondary)] font-sans">{areaVal} م²</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[var(--neu-text-muted)] block">توزيع الغرف</span>
                        <span className="font-semibold text-[var(--neu-text-secondary)]">
                          {bedroomsVal} غرف {bathroomsVal !== undefined && bathroomsVal !== null && `· ${bathroomsVal} حمام`}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons footer */}
                    <div className="flex gap-2 w-full mt-1">
                      <Link
                        href={`/property/${prop.slug}`}
                        target="_blank"
                        className="neu-btn neu-btn-ghost flex-1 py-2 text-xs flex items-center justify-center gap-1.5"
                        title="معاينة"
                      >
                        <Eye className="w-4 h-4" />
                        <span>عرض</span>
                      </Link>
                      <Link
                        href={`/mar-cp/properties/${prop.id}`}
                        className="neu-btn neu-btn-ghost flex-1 py-2 text-xs flex items-center justify-center gap-1.5"
                        title="تعديل"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>تعديل</span>
                      </Link>
                      <button
                        onClick={() => handleDelete(prop.id, prop.title)}
                        className="neu-btn neu-btn-ghost text-[var(--neu-danger)] hover:!text-[var(--neu-danger)] flex-1 py-2 text-xs flex items-center justify-center gap-1.5"
                        title="حذف"
                        aria-label={`حذف عقار ${prop.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>حذف</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            )}

            {filteredProperties.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Building2 className="w-12 h-12 text-[var(--neu-text-muted)] mb-3 opacity-30" />
                <p className="text-[var(--neu-text-secondary)] font-medium">لا توجد عقارات مطابقة</p>
                <p className="text-xs text-[var(--neu-text-muted)] mt-1">جرّب تغيير معايير البحث</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {propertyToDelete && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[210] flex items-center justify-center p-4"
          onClick={() => !isDeleting && setPropertyToDelete(null)}
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
            
            <h3 className="text-lg font-bold text-[var(--neu-text-heading)] mb-2">تأكيد حذف العقار</h3>
            <p className="text-sm text-[var(--neu-text-secondary)] mb-6">
              هل أنت متأكد من رغبتك في حذف العقار <strong className="text-[var(--neu-text-heading)]">"{propertyToDelete.title}"</strong>؟
              <br />
              سيتم حذف كافة البيانات والصور والفيديوهات الخاصة بهذا العقار نهائياً من مساحة التخزين السحابي وقاعدة البيانات، ولا يمكن التراجع عن هذا الإجراء.
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
                  const res = await deleteProperty(propertyToDelete.id);
                  if (res.success) {
                    setProperties((prev) => prev.filter((p) => p.id !== propertyToDelete.id));
                    setPropertyToDelete(null);
                  } else {
                    setDeleteError(res.error || 'فشل حذف العقار');
                  }
                  setIsDeleting(false);
                }}
                disabled={isDeleting}
                className="neu-btn neu-btn-primary bg-[var(--neu-danger)] hover:bg-[var(--neu-danger)]/90 border-0 flex-1"
              >
                {isDeleting ? 'جاري الحذف...' : 'نعم، احذف العقار'}
              </button>
              <button
                onClick={() => setPropertyToDelete(null)}
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
