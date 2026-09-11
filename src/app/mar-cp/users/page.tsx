// src/app/mar-cp/users/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import AdminBreadcrumb from '../../../components/admin/layout/AdminBreadcrumb';
import {
  Users,
  UserPlus,
  Key,
  Shield,
  Trash2,
  Edit2,
  Lock,
  Mail,
  User,
  CheckCircle,
  XCircle,
  X,
  Eye,
  EyeOff,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

import { getSupabaseBrowserClient } from '../../../lib/supabase/client';
import {
  getAccountsList,
  createAccount,
  updateAccountPermissions,
  updateAccountPassword,
  deleteAccount,
  UserPermissions,
  DbUserAccount,
} from '../../actions/users';

const PERMISSION_LABELS = {
  properties: 'إدارة العقارات',
  projects: 'إدارة المشاريع',
  media: 'إدارة الوسائط',
  submissions: 'الاستفسارات والرسائل',
  settings: 'التحليلات والإعدادات',
};

export default function UsersManagementPage() {
  const [accounts, setAccounts] = useState<DbUserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<'list' | 'change-password'>('list');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Account Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPermissions, setNewPermissions] = useState<UserPermissions>({
    properties: true,
    projects: true,
    media: true,
    submissions: false,
    settings: false,
  });
  const [newStatus, setNewStatus] = useState<'active' | 'suspended'>('active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Change Password Modal (For specific sub-accounts)
  const [changePasswordAccount, setChangePasswordAccount] = useState<DbUserAccount | null>(null);
  const [subNewPassword, setSubNewPassword] = useState('');
  const [subConfirmPassword, setSubConfirmPassword] = useState('');
  const [showSubPass, setShowSubPass] = useState(false);

  // Edit Permissions Modal
  const [editPermissionsAccount, setEditPermissionsAccount] = useState<DbUserAccount | null>(null);

  // Delete Confirmation Modal
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState<DbUserAccount | null>(null);

  // Password visibility
  const [showNewPass, setShowNewPass] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Change Password Form State (For currently logged in user)
  const [mainNewPassword, setMainNewPassword] = useState('');
  const [mainConfirmPassword, setMainConfirmPassword] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Fetch accounts from Supabase Auth
  const fetchAccounts = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const list = await getAccountsList();
      setAccounts(list);
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء تحميل الحسابات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Add Account Action
  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail || !newPassword) {
      alert('الرجاء إدخال كافة الحقول المطلوبة');
      return;
    }

    setIsSubmitting(true);
    try {
      const newAcc = await createAccount(newEmail, newPassword, newName, newPermissions);
      setAccounts((prev) => [newAcc, ...prev]);
      
      // Reset Form & Close Modal
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      setNewPermissions({
        properties: true,
        projects: true,
        media: true,
        submissions: false,
        settings: false,
      });
      setNewStatus('active');
      setShowAddModal(false);
      
      alert('تمت إضافة الحساب الجديد بنجاح');
    } catch (err: any) {
      alert(err.message || 'فشل إضافة الحساب الجديد');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update Permissions
  const handleUpdatePermissions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPermissionsAccount) return;

    setIsSubmitting(true);
    try {
      await updateAccountPermissions(editPermissionsAccount.id, editPermissionsAccount.permissions);
      
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === editPermissionsAccount.id
            ? { ...acc, permissions: { ...editPermissionsAccount.permissions } }
            : acc
        )
      );
      setEditPermissionsAccount(null);
      alert('تم تحديث الصلاحيات بنجاح');
    } catch (err: any) {
      alert(err.message || 'فشل تحديث الصلاحيات');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete User
  const handleDeleteUser = async () => {
    if (!confirmDeleteAccount) return;
    setIsSubmitting(true);
    try {
      await deleteAccount(confirmDeleteAccount.id);
      setAccounts((prev) => prev.filter((acc) => acc.id !== confirmDeleteAccount.id));
      setConfirmDeleteAccount(null);
      alert('تم حذف الحساب بنجاح');
    } catch (err: any) {
      alert(err.message || 'فشل حذف الحساب');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Change Sub-User Password
  const handleSubChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changePasswordAccount) return;
    if (!subNewPassword || !subConfirmPassword) {
      alert('الرجاء تعبئة كافة حقول كلمة المرور');
      return;
    }
    if (subNewPassword !== subConfirmPassword) {
      alert('كلمتا المرور غير متطابقتين');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateAccountPassword(changePasswordAccount.id, subNewPassword);
      setSubNewPassword('');
      setSubConfirmPassword('');
      setChangePasswordAccount(null);
      alert(`تم تغيير كلمة المرور للمستخدم "${changePasswordAccount.name}" بنجاح`);
    } catch (err: any) {
      alert(err.message || 'فشل تعيين كلمة المرور الجديدة');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Change Logged In User Password (Client side using Supabase Auth SDK)
  const handleMainChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);

    if (!mainNewPassword || !mainConfirmPassword) {
      setFeedbackMsg({ text: 'الرجاء تعبئة كافة الحقول المطلوبة', type: 'error' });
      return;
    }
    if (mainNewPassword !== mainConfirmPassword) {
      setFeedbackMsg({ text: 'كلمة المرور الجديدة وتأكيدها غير متطابقين', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({
        password: mainNewPassword,
      });

      if (error) throw error;

      setFeedbackMsg({ text: 'تم تغيير كلمة المرور الخاصة بك بنجاح', type: 'success' });
      setMainNewPassword('');
      setMainConfirmPassword('');
    } catch (err: any) {
      setFeedbackMsg({ text: err.message || 'فشل تغيير كلمة المرور الحالية', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = accounts.filter(
    (acc) =>
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <AdminBreadcrumb items={[{ label: 'إدارة الحسابات' }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--neu-text-heading)]">الحسابات والصلاحيات</h2>
          <p className="text-sm text-[var(--neu-text-muted)] mt-1">
            إدارة حسابات موظفي لوحة التحكم وتوزيع صلاحيات الاستخدام وتحديث كلمات المرور مباشرة من قاعدة البيانات.
          </p>
        </div>
        
        {activeTab === 'list' && !loading && !errorMsg && (
          <button
            onClick={() => setShowAddModal(true)}
            className="neu-btn neu-btn-primary"
            title="إضافة حساب جديد"
          >
            <UserPlus className="w-4 h-4" />
            إضافة حساب
          </button>
        )}
      </div>

      {/* Tabs Selector */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('list')}
          className={`neu-btn flex items-center gap-2 ${
            activeTab === 'list' ? 'neu-btn-primary' : 'neu-btn-secondary'
          }`}
        >
          <Users className="w-4 h-4" />
          قائمة الحسابات
        </button>
        <button
          onClick={() => setActiveTab('change-password')}
          className={`neu-btn flex items-center gap-2 ${
            activeTab === 'change-password' ? 'neu-btn-primary' : 'neu-btn-secondary'
          }`}
        >
          <Lock className="w-4 h-4" />
          تغيير كلمة المرور الخاصة بك
        </button>
      </div>

      {/* TAB 1: Account List */}
      {activeTab === 'list' && (
        <>
          {loading ? (
            <div className="neu-card flex flex-col items-center justify-center py-24 text-center">
              <Loader2 className="w-10 h-10 text-[var(--neu-gold)] animate-spin mb-4" />
              <p className="text-[var(--neu-text-secondary)] font-medium">جاري تحميل الحسابات من قاعدة البيانات...</p>
            </div>
          ) : errorMsg ? (
            <div className="neu-card flex flex-col items-center justify-center py-20 text-center border-red-500/20">
              <AlertTriangle className="w-12 h-12 text-[var(--neu-danger)] mb-4" />
              <p className="text-[var(--neu-text-secondary)] font-semibold">{errorMsg}</p>
              <button onClick={fetchAccounts} className="neu-btn neu-btn-secondary mt-4 text-xs">
                إعادة المحاولة
              </button>
            </div>
          ) : (
            <>
              {/* Search bar */}
              <div className="neu-card mb-6">
                <div className="relative">
                  <Users className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neu-text-muted)]" />
                  <input
                    type="text"
                    placeholder="ابحث باسم الموظف أو البريد الإلكتروني..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="neu-input neu-input-search"
                  />
                </div>
              </div>

              {/* Accounts list */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((acc) => (
                  <div key={acc.id} className="neu-card relative overflow-hidden flex flex-col justify-between">
                    {/* Status Indicator */}
                    <div className="absolute top-4 left-4">
                      {acc.status === 'active' ? (
                        <span className="neu-badge neu-badge-success flex items-center gap-1 select-none">
                          <CheckCircle className="w-3 h-3" />
                          نشط
                        </span>
                      ) : (
                        <span className="neu-badge neu-badge-danger flex items-center gap-1 select-none">
                          <XCircle className="w-3 h-3" />
                          معطل
                        </span>
                      )}
                    </div>

                    <div>
                      {/* Account Identity */}
                      <div className="flex items-center gap-3 mb-4 mt-2">
                        <div className="w-10 h-10 rounded-full bg-[var(--neu-gold)]/10 flex items-center justify-center text-[var(--neu-gold)] font-bold text-lg">
                          {acc.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-[var(--neu-text-heading)]">{acc.name}</h3>
                          <p className="text-xs text-[var(--neu-text-muted)]" dir="ltr">
                            {acc.email}
                          </p>
                        </div>
                      </div>

                      <hr className="border-white/5 my-4" />

                      {/* Permissions section */}
                      <div className="space-y-2 mb-6">
                        <p className="text-xs font-bold text-[var(--neu-text-secondary)] flex items-center gap-1.5 mb-2">
                          <Shield className="w-3.5 h-3.5 text-[var(--neu-gold)]" />
                          صلاحيات الوصول:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(acc.permissions).map(([key, value]) => (
                            <span
                              key={key}
                              className={`text-[10px] px-2 py-0.5 rounded-md font-medium border ${
                                value
                                  ? 'bg-[var(--neu-gold-glow)] border-[var(--neu-gold)]/30 text-[var(--neu-gold)]'
                                  : 'bg-white/5 border-white/5 text-[var(--neu-text-muted)] line-through opacity-50'
                              }`}
                            >
                              {PERMISSION_LABELS[key as keyof typeof PERMISSION_LABELS]}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-white/5 mt-auto">
                      <button
                        onClick={() => setEditPermissionsAccount(acc)}
                        className="neu-btn neu-btn-secondary flex-1 py-1.5 text-xs gap-1.5"
                        title="تعديل الصلاحيات"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        تعديل الصلاحيات
                      </button>
                      <button
                        onClick={() => setChangePasswordAccount(acc)}
                        className="neu-btn neu-btn-secondary p-2"
                        title="تغيير كلمة المرور"
                      >
                        <Key className="w-4 h-4 text-[var(--neu-gold)]" />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteAccount(acc)}
                        disabled={acc.name === 'سوبر أدمن' || acc.email.toLowerCase() === 'admin@mar-ksa.com'} // Protect main super admin account
                        className="neu-btn neu-btn-secondary p-2 text-red-400 hover:text-red-500 disabled:opacity-30"
                        title="حذف الحساب"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="neu-card text-center py-16">
                  <Users className="w-12 h-12 text-[var(--neu-text-muted)] mx-auto mb-3 opacity-30" />
                  <p className="text-[var(--neu-text-secondary)] font-medium">لا توجد حسابات مطابقة</p>
                  <p className="text-xs text-[var(--neu-text-muted)] mt-1">جرّب كتابة بريد إلكتروني أو اسم آخر</p>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* TAB 2: Change Main Admin Password */}
      {activeTab === 'change-password' && (
        <div className="max-w-md mx-auto">
          <div className="neu-card p-6">
            <h3 className="text-lg font-bold text-[var(--neu-text-heading)] mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-[var(--neu-gold)]" />
              تحديث كلمة المرور الخاصة بك
            </h3>

            {feedbackMsg && (
              <div
                className={`p-3 rounded-xl mb-4 text-xs font-medium ${
                  feedbackMsg.type === 'success'
                    ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                }`}
              >
                {feedbackMsg.text}
              </div>
            )}

            <form onSubmit={handleMainChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--neu-text-secondary)] mb-1">
                  كلمة المرور الجديدة *
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={mainNewPassword}
                    onChange={(e) => setMainNewPassword(e.target.value)}
                    className="neu-input pe-10"
                    placeholder="ادخل كلمة المرور الجديدة"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--neu-text-muted)] hover:text-white"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--neu-text-secondary)] mb-1">
                  تأكيد كلمة المرور الجديدة *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    value={mainConfirmPassword}
                    onChange={(e) => setMainConfirmPassword(e.target.value)}
                    className="neu-input pe-10"
                    placeholder="اعد كتابة كلمة المرور الجديدة"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--neu-text-muted)] hover:text-white"
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="neu-btn neu-btn-primary w-full mt-2"
              >
                {isSubmitting ? 'جاري الحفظ والتحديث...' : 'حفظ كلمة المرور الجديدة'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add New Account */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
          onClick={() => !isSubmitting && setShowAddModal(false)}
          role="dialog"
          aria-label="إضافة حساب جديد"
        >
          <div
            className="neu-card w-full max-w-lg max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[var(--neu-text-heading)]">إضافة حساب موظف جديد</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="neu-btn neu-btn-ghost neu-btn-sm p-1.5"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--neu-text-secondary)] mb-1">
                  الاسم الكامل *
                </label>
                <div className="relative">
                  <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neu-text-muted)]" />
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="neu-input pe-10"
                    placeholder="ادخل اسم الموظف"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--neu-text-secondary)] mb-1">
                  البريد الإلكتروني *
                </label>
                <div className="relative">
                  <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neu-text-muted)]" />
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="neu-input pe-10"
                    placeholder="name@mar-ksa.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--neu-text-secondary)] mb-1">
                  كلمة المرور الافتراضية *
                </label>
                <div className="relative">
                  <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neu-text-muted)]" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="neu-input pe-10"
                    placeholder="ادخل كلمة مرور الحساب"
                    required
                  />
                </div>
              </div>

              {/* Permissions list */}
              <div>
                <label className="block text-xs font-bold text-[var(--neu-text-secondary)] mb-2">
                  صلاحيات لوحة التحكم الممنوحة:
                </label>
                <div className="space-y-2 rounded-xl p-3.5 neu-inset-sm">
                  {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                    <label key={key} className="flex items-center gap-3 text-sm cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={newPermissions[key as keyof typeof newPermissions]}
                        onChange={(e) =>
                          setNewPermissions((prev) => ({
                            ...prev,
                            [key]: e.target.checked,
                          }))
                        }
                        className="rounded border-white/10 bg-white/5 text-[var(--neu-gold)] focus:ring-[var(--neu-gold)]"
                      />
                      <span className="text-[var(--neu-text-secondary)]">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="neu-btn neu-btn-primary flex-1"
                >
                  {isSubmitting ? 'جاري الإنشاء والربط...' : 'إنشاء الحساب'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="neu-btn neu-btn-secondary"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Permissions */}
      {editPermissionsAccount && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
          onClick={() => !isSubmitting && setEditPermissionsAccount(null)}
          role="dialog"
          aria-label="تعديل صلاحيات الحساب"
        >
          <div
            className="neu-card w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[var(--neu-text-heading)]">تعديل صلاحيات الوصول</h3>
              <button
                onClick={() => setEditPermissionsAccount(null)}
                className="neu-btn neu-btn-ghost neu-btn-sm p-1.5"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePermissions} className="space-y-4">
              <div className="mb-2">
                <p className="text-xs text-[var(--neu-text-muted)]">الحساب المختار:</p>
                <p className="text-sm font-semibold text-[var(--neu-text-heading)] mt-0.5" dir="ltr">
                  {editPermissionsAccount.name} ({editPermissionsAccount.email})
                </p>
              </div>

              <div className="space-y-2 rounded-xl p-3.5 neu-inset-sm">
                {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-3 text-sm cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={editPermissionsAccount.permissions[key as keyof typeof editPermissionsAccount.permissions]}
                      onChange={(e) =>
                        setEditPermissionsAccount((prev) => {
                          if (!prev) return null;
                          return {
                            ...prev,
                            permissions: {
                              ...prev.permissions,
                              [key]: e.target.checked,
                            },
                          };
                        })
                      }
                      className="rounded border-white/10 bg-white/5 text-[var(--neu-gold)] focus:ring-[var(--neu-gold)]"
                    />
                    <span className="text-[var(--neu-text-secondary)]">{label}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="neu-btn neu-btn-primary flex-1"
                >
                  {isSubmitting ? 'جاري الحفظ والتطبيق...' : 'حفظ الصلاحيات الجديدة'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditPermissionsAccount(null)}
                  className="neu-btn neu-btn-secondary"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Change Sub-Account Password */}
      {changePasswordAccount && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
          onClick={() => !isSubmitting && setChangePasswordAccount(null)}
          role="dialog"
          aria-label="تغيير كلمة المرور"
        >
          <div
            className="neu-card w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[var(--neu-text-heading)]">تغيير كلمة المرور</h3>
              <button
                onClick={() => setChangePasswordAccount(null)}
                className="neu-btn neu-btn-ghost neu-btn-sm p-1.5"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubChangePassword} className="space-y-4">
              <div className="mb-2">
                <p className="text-xs text-[var(--neu-text-muted)]">إعادة تعيين كلمة المرور لحساب:</p>
                <p className="text-sm font-semibold text-[var(--neu-text-heading)] mt-0.5" dir="ltr">
                  {changePasswordAccount.name} ({changePasswordAccount.email})
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--neu-text-secondary)] mb-1">
                  كلمة المرور الجديدة *
                </label>
                <div className="relative">
                  <input
                    type={showSubPass ? 'text' : 'password'}
                    value={subNewPassword}
                    onChange={(e) => setSubNewPassword(e.target.value)}
                    className="neu-input pe-10"
                    placeholder="ادخل كلمة المرور الجديدة"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSubPass(!showSubPass)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--neu-text-muted)] hover:text-white"
                  >
                    {showSubPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--neu-text-secondary)] mb-1">
                  تأكيد كلمة المرور الجديدة *
                </label>
                <input
                  type="password"
                  value={subConfirmPassword}
                  onChange={(e) => setSubConfirmPassword(e.target.value)}
                  className="neu-input"
                  placeholder="اعد كتابة كلمة المرور الجديدة"
                  required
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="neu-btn neu-btn-primary flex-1"
                >
                  {isSubmitting ? 'جاري الحفظ والتشفير...' : 'تغيير كلمة المرور'}
                </button>
                <button
                  type="button"
                  onClick={() => setChangePasswordAccount(null)}
                  className="neu-btn neu-btn-secondary"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete User Confirmation */}
      {confirmDeleteAccount && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[210] flex items-center justify-center p-4"
          onClick={() => !isSubmitting && setConfirmDeleteAccount(null)}
          role="dialog"
          aria-label="تأكيد حذف الحساب"
        >
          <div
            className="neu-card w-full max-w-md p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-full bg-[var(--neu-danger)]/10 border-2 border-[var(--neu-danger)]/20 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-[var(--neu-danger)]" />
            </div>

            <h3 className="text-lg font-bold text-[var(--neu-text-heading)] mb-2">تأكيد حذف الحساب</h3>
            <p className="text-sm text-[var(--neu-text-secondary)] mb-6">
              هل أنت متأكد من حذف حساب الموظف <strong className="text-[var(--neu-text-heading)]">"{confirmDeleteAccount.name}"</strong>؟
              <br />
              لن يتمكن هذا المستخدم من الدخول للوحة التحكم مجدداً، ولا يمكن التراجع عن هذا الإجراء.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleDeleteUser}
                disabled={isSubmitting}
                className="neu-btn neu-btn-primary bg-[var(--neu-danger)] hover:bg-[var(--neu-danger)]/90 border-0 flex-1"
              >
                {isSubmitting ? 'جاري الحذف من السيرفر...' : 'نعم، احذف الحساب'}
              </button>
              <button
                onClick={() => setConfirmDeleteAccount(null)}
                disabled={isSubmitting}
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
