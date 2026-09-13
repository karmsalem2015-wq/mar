// src/app/mar-cp/login/page.tsx
'use client';

import React, { useState, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { getSupabaseBrowserClient } from '../../../lib/supabase/client';
import '../.././../../src/styles/admin.css';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/mar-cp';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // 1. Check fixed / developer dummy credentials (works without database)
    const isMockEmail =
      cleanEmail === 'admin@mar-ksa.com' ||
      cleanEmail === 'admin@mar.sa' ||
      cleanEmail === 'admin@example.com' ||
      cleanEmail === 'admin';
    const isMockPassword =
      cleanPassword === 'admin' ||
      cleanPassword === 'admin123' ||
      cleanPassword === '123456' ||
      cleanPassword === 'admin@123';

    if (isMockEmail && isMockPassword) {
      document.cookie = 'mar_dev_session=true; path=/; max-age=2592000; SameSite=Lax';
      document.cookie = 'mar_logged_out=; path=/; max-age=0; SameSite=Lax';
      localStorage.setItem('mar_admin_user', JSON.stringify({
        email: cleanEmail === 'admin' ? 'admin@mar-ksa.com' : cleanEmail,
        role: 'super_admin',
        name: 'مدير النظام (حساب تجريبي)'
      }));
      router.push(redirect);
      router.refresh();
      return;
    }

    // 2. Try real Supabase auth if configured
    try {
      const supabase = getSupabaseBrowserClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (authError) {
        setError('بيانات الدخول غير صحيحة. يمكنك الدخول بحساب التطوير المباشر: admin@mar-ksa.com / admin123');
        setLoading(false);
        return;
      }

      document.cookie = 'mar_dev_session=true; path=/; max-age=2592000; SameSite=Lax';
      document.cookie = 'mar_logged_out=; path=/; max-age=0; SameSite=Lax';
      router.push(redirect);
      router.refresh();
    } catch {
      setError('تعذر الاتصال بقاعدة البيانات. يمكنك الدخول بحساب التطوير المباشر: admin@mar-ksa.com / admin123');
      setLoading(false);
    }
  };

  const handleQuickDevLogin = () => {
    setEmail('admin@mar-ksa.com');
    setPassword('admin123');
    document.cookie = 'mar_dev_session=true; path=/; max-age=2592000; SameSite=Lax';
    document.cookie = 'mar_logged_out=; path=/; max-age=0; SameSite=Lax';
    localStorage.setItem('mar_admin_user', JSON.stringify({
      email: 'admin@mar-ksa.com',
      role: 'super_admin',
      name: 'مدير النظام'
    }));
    router.push(redirect);
    router.refresh();
  };

  return (
    <div className="login-card relative z-10">
      {/* Logo */}
      <div className="flex flex-col items-center mb-10">
        <div className="neu-raised-lg rounded-2xl px-6 py-4 mb-5 flex items-center justify-center">
          <Image
            src="/icon.png"
            alt="مار العقارية"
            width={64}
            height={64}
            className="size-16 rounded-xl object-contain"
            priority
          />
        </div>
        <h1 className="text-xl font-bold text-[var(--neu-text-heading)] mb-1">
          مرحباً بك
        </h1>
        <p className="text-sm text-[var(--neu-text-muted)]">
          سجّل دخولك للوصول إلى لوحة التحكم
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-[var(--neu-danger-bg)] border border-[var(--neu-danger-border)]">
          <AlertCircle className="w-5 h-5 text-[var(--neu-danger)] shrink-0" />
          <p className="text-sm text-[var(--neu-danger)] leading-relaxed">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-5">
        {/* Email */}
        <div>
          <label htmlFor="email" className="neu-label">البريد الإلكتروني</label>
          <div className="relative">
            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--neu-text-muted)]" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@mar-ksa.com"
              required
              autoComplete="email"
              className="neu-input neu-input-icon-right"
              dir="ltr"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="neu-label">كلمة المرور</label>
          <div className="relative">
            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--neu-text-muted)]" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="neu-input neu-input-icon-right neu-input-icon-left"
              dir="ltr"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--neu-text-muted)] hover:text-[var(--neu-gold)] transition-colors"
              aria-label={showPassword ? 'إخفاء كلمة المرور' : 'عرض كلمة المرور'}
            >
              {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="neu-btn neu-btn-primary neu-btn-lg w-full mt-2 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>جاري التحقق...</span>
            </>
          ) : (
            <span>تسجيل الدخول</span>
          )}
        </button>

        {/* Quick Dev Login Button */}
        <button
          type="button"
          onClick={handleQuickDevLogin}
          className="w-full mt-3 py-2.5 px-4 rounded-xl border border-[#C9A96E]/40 bg-[#C9A96E]/10 hover:bg-[#C9A96E]/20 text-[#C9A96E] font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-sm"
        >
          <span>⚡ دخول سريع مباشر (وضع التطوير والمعاينة)</span>
        </button>

        {/* Helper Box */}
        <div className="p-3 rounded-xl bg-black/20 border border-white/5 text-center text-xs text-[var(--neu-text-muted)] space-y-1">
          <p className="font-semibold text-[var(--neu-text-secondary)]">بيانات الدخول التجريبية السريعة:</p>
          <p dir="ltr" className="font-mono text-[11px] text-[#C9A96E]">admin@mar-ksa.com / admin123</p>
        </div>
      </form>

      {/* Footer */}
      <p className="text-center text-xs text-[var(--neu-text-muted)] mt-6">
        مار العقارية — لوحة التحكم الإدارية
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="login-page" dir="rtl">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 opacity-[0.015] login-bg-pattern" />

      <Suspense fallback={
        <div className="login-card relative z-10 flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-[var(--neu-gold)] animate-spin mb-4" />
          <p className="text-sm text-[var(--neu-text-secondary)]">جاري تحميل بوابة الإدارة...</p>
        </div>
      }>
        <LoginFormContent />
      </Suspense>
    </div>
  );
}
