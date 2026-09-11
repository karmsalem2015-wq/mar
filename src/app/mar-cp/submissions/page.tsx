// src/app/mar-cp/submissions/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import AdminBreadcrumb from '../../../components/admin/layout/AdminBreadcrumb';
import AdminSelect from '../../../components/admin/AdminSelect';
import {
  Search,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  CheckCircle2,
  Eye,
  Filter,
  MessageSquareText,
  Trash2,
  Loader2,
} from 'lucide-react';
import {
  getSubmissionsList,
  updateSubmissionStatus,
  updateSubmissionNotes,
  deleteSubmissionAction,
} from '@/app/actions/submissions';



const STATUS_MAP = {
  new: { label: 'جديد', class: 'neu-badge-danger neu-badge-dot' },
  reviewed: { label: 'تمت المراجعة', class: 'neu-badge-warning neu-badge-dot' },
  closed: { label: 'مغلق', class: 'neu-badge-success neu-badge-dot' },
};

const TYPE_MAP = {
  contact: 'تواصل عام',
  inquiry: 'استفسار مشروع',
  property_inquiry: 'استفسار عقار',
};

interface Submission {
  id: string;
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  type: 'contact' | 'inquiry' | 'property_inquiry';
  resident_type: string;
  status: 'new' | 'reviewed' | 'closed';
  created_at: string;
  notes?: string;
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedMobileIds, setExpandedMobileIds] = useState<string[]>([]);

  // Deletion Confirmation Modal states
  const [submissionToDelete, setSubmissionToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Fetch submissions list on mount
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const list = await getSubmissionsList();
      setSubmissions(list);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleStatusChange = async (id: string, newStatus: 'new' | 'reviewed' | 'closed') => {
    // Optimistic update
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );
    await updateSubmissionStatus(id, newStatus);
  };

  const handleNotesChange = async (id: string, notes: string) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, notes } : s))
    );
    await updateSubmissionNotes(id, notes);
  };

  const toggleMobileExpand = (id: string) => {
    setExpandedMobileIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteError('');
    setSubmissionToDelete({ id, name });
  };

  const confirmDelete = async () => {
    if (!submissionToDelete) return;
    setIsDeleting(true);
    setDeleteError('');
    try {
      const res = await deleteSubmissionAction(submissionToDelete.id);
      if (res.success) {
        setSubmissions((prev) => prev.filter((s) => s.id !== submissionToDelete.id));
        if (selectedId === submissionToDelete.id) {
          setSelectedId(null);
        }
        setSubmissionToDelete(null);
      } else {
        setDeleteError(res.error || 'فشل حذف الاستفسار');
      }
    } catch (err) {
      setDeleteError('حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = submissions.filter((s) => {
    const matchSearch = !searchQuery || s.name.includes(searchQuery) || s.phone.includes(searchQuery);
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchType = typeFilter === 'all' || s.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const selectedSubmission = submissions.find((s) => s.id === selectedId);

  return (
    <div>
      <AdminBreadcrumb items={[{ label: 'الاستفسارات' }]} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--neu-text-heading)]">إدارة الاستفسارات</h2>
          <p className="text-sm text-[var(--neu-text-muted)] mt-1">
            {submissions.filter((s) => s.status === 'new').length} استفسار جديد بانتظار المراجعة
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="neu-card mb-6">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neu-text-muted)]" />
            <input
              type="text"
              placeholder="ابحث بالاسم أو رقم الجوال..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="neu-input neu-input-search"
            />
          </div>
          <AdminSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: 'كل الحالات' },
              { value: 'new', label: 'جديد' },
              { value: 'reviewed', label: 'تمت المراجعة' },
              { value: 'closed', label: 'مغلق' },
            ]}
            className="w-full md:w-40"
            placeholder="تصفية حسب الحالة"
          />
          <AdminSelect
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { value: 'all', label: 'كل الأنواع' },
              { value: 'contact', label: 'تواصل عام' },
              { value: 'inquiry', label: 'استفسار مشروع' },
              { value: 'property_inquiry', label: 'استفسار عقار' },
            ]}
            className="w-full md:w-44"
            placeholder="تصفية حسب النوع"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-start">
        {/* Submissions List */}
        <div className="xl:col-span-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center neu-card">
              <Loader2 className="w-10 h-10 text-[var(--neu-gold)] animate-spin mb-3" />
              <p className="text-sm text-[var(--neu-text-secondary)]">جاري تحميل الاستفسارات من قاعدة البيانات...</p>
            </div>
          ) : (
            <div>
              {/* Desktop Table View */}
              <div className="neu-table-wrapper overflow-x-auto hidden md:block">
                <table className="neu-table">
                  <thead>
                    <tr>
                      <th>المرسل</th>
                      <th className="hidden sm:table-cell">النوع</th>
                      <th>الحالة</th>
                      <th className="hidden md:table-cell">التاريخ</th>
                      <th>إجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((sub) => (
                      <tr
                        key={sub.id}
                        className={`cursor-pointer ${selectedId === sub.id ? '!bg-[var(--neu-gold-glow)]' : ''}`}
                        onClick={() => setSelectedId(sub.id)}
                      >
                        <td>
                          <div>
                            <p className="font-semibold text-[var(--neu-text-heading)]">{sub.name}</p>
                            <p className="text-xs text-[var(--neu-text-muted)] mt-0.5">{sub.subject}</p>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell">
                          <span className="text-xs text-[var(--neu-text-secondary)]">{TYPE_MAP[sub.type]}</span>
                        </td>
                        <td>
                          <span className={`neu-badge ${STATUS_MAP[sub.status].class}`}>
                            {STATUS_MAP[sub.status].label}
                          </span>
                        </td>
                        <td className="hidden md:table-cell">
                          <span className="text-xs text-[var(--neu-text-muted)]">
                            {new Date(sub.created_at).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <a
                              href={`tel:${sub.phone}`}
                              className="neu-btn neu-btn-ghost neu-btn-sm"
                              title="اتصال"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Phone className="w-4 h-4" />
                            </a>
                            <a
                              href={`https://wa.me/966${sub.phone.replace(/^0/, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="neu-btn neu-btn-ghost neu-btn-sm text-[var(--neu-gold)]"
                              title="واتساب"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(sub.id, sub.name);
                              }}
                              className="neu-btn neu-btn-ghost neu-btn-sm text-[var(--neu-danger)] hover:!text-[var(--neu-danger)]"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards List View */}
              <div className="grid grid-cols-1 gap-4 md:hidden">
                {filtered.map((sub) => {
                  const isExpanded = expandedMobileIds.includes(sub.id);
                  return (
                    <div
                      key={sub.id}
                      className={`neu-card flex flex-col gap-4 p-4 relative overflow-hidden transition-all duration-300 ${selectedId === sub.id ? 'border-[var(--neu-gold)]/40 shadow-lg' : ''
                        }`}
                    >
                      {/* Top Header section: Info, Status & Type badges */}
                      <div className="flex justify-between items-start gap-3">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-sm text-[var(--neu-text-heading)]">
                            {sub.name}
                          </h4>
                          <p className="text-xs text-[var(--neu-text-muted)] mt-0.5">{sub.subject}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className={`neu-badge text-[10px] py-0.5 px-2 ${STATUS_MAP[sub.status].class}`}>
                            {STATUS_MAP[sub.status].label}
                          </span>
                          <span className="neu-badge neu-badge-gold text-[10px] py-0.5 px-2">
                            {TYPE_MAP[sub.type]}
                          </span>
                        </div>
                      </div>

                      {/* Date and Quick Actions bar when collapsed */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                        <span className="text-[10px] text-[var(--neu-text-muted)]">
                          {new Date(sub.created_at).toLocaleDateString('ar-SA', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleMobileExpand(sub.id)}
                            className="neu-btn neu-btn-ghost py-1 px-3 text-[10px] flex items-center gap-1"
                          >
                            <span>{isExpanded ? 'إغلاق التفاصيل' : 'عرض التفاصيل'}</span>
                          </button>
                          <a
                            href={`tel:${sub.phone}`}
                            className="neu-btn neu-btn-ghost neu-btn-sm p-1.5 text-[var(--neu-text-secondary)]"
                            title="اتصال"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={`https://wa.me/966${sub.phone.replace(/^0/, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="neu-btn neu-btn-ghost neu-btn-sm p-1.5 text-[var(--neu-gold)]"
                            title="واتساب"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>

                      {/* Expanded details block */}
                      {isExpanded && (
                        <div className="mt-2 space-y-4 pt-4 border-t border-white/10 text-xs animate-in fade-in slide-in-from-top-3 duration-200">
                          <div>
                            <p className="text-[10px] text-[var(--neu-text-muted)] mb-1">رقم الجوال</p>
                            <a href={`tel:${sub.phone}`} className="font-semibold text-[var(--neu-gold)] hover:underline" dir="ltr">
                              {sub.phone}
                            </a>
                          </div>

                          {sub.email && (
                            <div>
                              <p className="text-[10px] text-[var(--neu-text-muted)] mb-1">البريد الإلكتروني</p>
                              <a href={`mailto:${sub.email}`} className="text-xs text-[var(--neu-text-secondary)] hover:text-[var(--neu-gold)]" dir="ltr">
                                {sub.email}
                              </a>
                            </div>
                          )}

                          <div>
                            <p className="text-[10px] text-[var(--neu-text-muted)] mb-1">نوع الإقامة</p>
                            <p className="text-xs text-[var(--neu-text-secondary)]">
                              {sub.resident_type === 'citizen' ? 'مواطن' : 'مقيم'}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] text-[var(--neu-text-muted)] mb-1">محتوى الرسالة</p>
                            <p className="text-xs text-[var(--neu-text-primary)] leading-relaxed neu-inset-sm rounded-xl p-3 bg-black/25">
                              {sub.message}
                            </p>
                          </div>

                          {/* Status Change Toggles */}
                          <div>
                            <p className="text-[10px] text-[var(--neu-text-muted)] mb-2">تغيير الحالة</p>
                            <div className="flex gap-2">
                              {(['new', 'reviewed', 'closed'] as const).map((s) => (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() => handleStatusChange(sub.id, s)}
                                  className={`neu-btn neu-btn-sm py-1.5 flex-1 text-[10px] ${sub.status === s ? 'neu-btn-primary' : 'neu-btn-secondary'
                                    }`}
                                >
                                  {STATUS_MAP[s].label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Admin Notes */}
                          <div>
                            <p className="text-[10px] text-[var(--neu-text-muted)] mb-2">ملاحظات إدارية</p>
                            <textarea
                              placeholder="أضف ملاحظاتك هنا..."
                              className="neu-input neu-textarea text-xs"
                              rows={3}
                              value={(sub as any).notes || ''}
                              onChange={(e) => handleNotesChange(sub.id, e.target.value)}
                            />
                          </div>

                          {/* Big Call/WhatsApp/Delete Actions */}
                          <div className="flex gap-2 pt-2 border-t border-white/5 flex-wrap sm:flex-nowrap">
                            <a
                              href={`https://wa.me/966${sub.phone.replace(/^0/, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="neu-btn neu-btn-primary py-2 text-xs flex-1 flex items-center justify-center gap-1.5"
                            >
                              <MessageCircle className="w-4 h-4" />
                              <span>واتساب</span>
                            </a>
                            <a
                              href={`tel:${sub.phone}`}
                              className="neu-btn neu-btn-secondary py-2 text-xs flex-1 flex items-center justify-center gap-1.5"
                            >
                              <Phone className="w-4 h-4" />
                              <span>اتصال</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => handleDeleteClick(sub.id, sub.name)}
                              className="neu-btn neu-btn-secondary py-2 text-xs text-[var(--neu-danger)] hover:!text-[var(--neu-danger)] flex-1 flex items-center justify-center gap-1.5"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>حذف</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {filtered.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <MessageSquareText className="w-12 h-12 text-[var(--neu-text-muted)] mb-3 opacity-30" />
                  <p className="text-[var(--neu-text-secondary)] font-medium">لا توجد استفسارات مطابقة</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <div className="hidden xl:block">
          {selectedSubmission ? (
            <div className="neu-card">
              <h3 className="text-lg font-bold text-[var(--neu-text-heading)] mb-4">تفاصيل الاستفسار</h3>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-[var(--neu-text-muted)] mb-1">الاسم</p>
                  <p className="font-semibold text-[var(--neu-text-heading)]">{selectedSubmission.name}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--neu-text-muted)] mb-1">رقم الجوال</p>
                  <a href={`tel:${selectedSubmission.phone}`} className="font-semibold text-[var(--neu-gold)] hover:underline" dir="ltr">
                    {selectedSubmission.phone}
                  </a>
                </div>
                {selectedSubmission.email && (
                  <div>
                    <p className="text-xs text-[var(--neu-text-muted)] mb-1">البريد الإلكتروني</p>
                    <a href={`mailto:${selectedSubmission.email}`} className="text-sm text-[var(--neu-text-secondary)] hover:text-[var(--neu-gold)]" dir="ltr">
                      {selectedSubmission.email}
                    </a>
                  </div>
                )}
                <div>
                  <p className="text-xs text-[var(--neu-text-muted)] mb-1">النوع</p>
                  <span className="neu-badge neu-badge-gold">{TYPE_MAP[selectedSubmission.type]}</span>
                </div>
                <div>
                  <p className="text-xs text-[var(--neu-text-muted)] mb-1">نوع الإقامة</p>
                  <p className="text-sm text-[var(--neu-text-secondary)]">
                    {selectedSubmission.resident_type === 'citizen' ? 'مواطن' : 'مقيم'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--neu-text-muted)] mb-1">الرسالة</p>
                  <p className="text-sm text-[var(--neu-text-primary)] leading-relaxed neu-inset-sm rounded-xl p-3">
                    {selectedSubmission.message}
                  </p>
                </div>

                {/* Status Change */}
                <div>
                  <p className="text-xs text-[var(--neu-text-muted)] mb-2">تغيير الحالة</p>
                  <div className="flex gap-2">
                    {(['new', 'reviewed', 'closed'] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleStatusChange(selectedSubmission.id, s)}
                        className={`neu-btn neu-btn-sm flex-1 ${selectedSubmission.status === s
                            ? 'neu-btn-primary'
                            : 'neu-btn-secondary'
                          }`}
                      >
                        {STATUS_MAP[s].label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Admin Notes */}
                <div>
                  <p className="text-xs text-[var(--neu-text-muted)] mb-2">ملاحظات إدارية</p>
                  <textarea
                    placeholder="أضف ملاحظاتك هنا..."
                    className="neu-input neu-textarea"
                    rows={3}
                    value={(selectedSubmission as any).notes || ''}
                    onChange={(e) => handleNotesChange(selectedSubmission.id, e.target.value)}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <a
                    href={`https://wa.me/966${selectedSubmission.phone.replace(/^0/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="neu-btn neu-btn-primary neu-btn-sm flex-1"
                  >
                    <MessageCircle className="w-4 h-4" />
                    واتساب
                  </a>
                  <a
                    href={`tel:${selectedSubmission.phone}`}
                    className="neu-btn neu-btn-secondary neu-btn-sm flex-1"
                  >
                    <Phone className="w-4 h-4" />
                    اتصال
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="neu-card flex flex-col items-center justify-center py-16 text-center">
              <Eye className="w-10 h-10 text-[var(--neu-text-muted)] mb-3 opacity-30" />
              <p className="text-sm text-[var(--neu-text-muted)]">اختر استفساراً لعرض التفاصيل</p>
            </div>
          )}
        </div>
      </div>

      {/* Custom Neumorphic Delete Confirmation Modal */}
      {submissionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all duration-300">
          <div
            className="neu-card w-full max-w-md p-6 text-center transform transition-all duration-300 animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-950/20 border border-red-500/30 flex items-center justify-center">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>

            <h3 className="text-lg font-bold text-[var(--neu-text-heading)] mb-2 font-tajawal">
              تأكيد حذف الاستفسار
            </h3>
            <p className="text-sm text-[var(--neu-text-secondary)] mb-6">
              هل أنت متأكد من رغبتك في حذف استفسار <span className="font-bold text-[var(--neu-text-heading)]">"{submissionToDelete.name}"</span>؟ لا يمكن التراجع عن هذا الإجراء.
            </p>

            {deleteError && (
              <p className="text-xs text-red-500 font-bold mb-4">⚠️ {deleteError}</p>
            )}

            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="neu-btn neu-btn-primary bg-red-600 hover:bg-red-700 !text-white flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري الحذف...</span>
                  </>
                ) : (
                  <span>نعم، احذف</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setSubmissionToDelete(null)}
                disabled={isDeleting}
                className="neu-btn neu-btn-secondary flex-1 py-2.5 text-xs font-bold"
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
