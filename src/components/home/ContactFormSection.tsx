'use client';

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { z } from 'zod';
import { createSubmission } from '@/app/actions/submissions';
import { CheckCircle, AlertCircle, Loader2, Headphones } from 'lucide-react';

const contactSchema = z.object({
  title: z.string().min(1, 'الرجاء اختيار اللقب'),
  firstName: z.string().min(2, 'الاسم الأول يجب أن يكون حرفين على الأقل'),
  lastName: z.string().min(2, 'اسم العائلة يجب أن يكون حرفين على الأقل'),
  email: z.string().email('عنوان البريد الإلكتروني غير صحيح'),
  phone: z.string().min(8, 'رقم التليفون يجب أن يكون 8 أرقام على الأقل'),
  propertyType: z.string().min(1, 'الرجاء اختيار نوع العقار أو المشروع'),
  zipCode: z.string().optional(),
  city: z.string().optional(),
  bedrooms: z.string().optional(),
  bathrooms: z.string().optional(),
  budget: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactFormSection() {
  const shouldReduceMotion = useReducedMotion();
  const [formData, setFormData] = useState<ContactFormData>({
    title: 'السيد',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    propertyType: 'شقة',
    zipCode: '',
    city: 'جدة',
    bedrooms: '4',
    bathrooms: '3',
    budget: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof ContactFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    const validation = contactSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Partial<Record<keyof ContactFormData, string>> = {};
      validation.error.issues.forEach(issue => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as keyof ContactFormData] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const data = validation.data;
      const fullName = `${data.title} ${data.firstName} ${data.lastName}`.trim();
      const messageNotes = `نوع العقار: ${data.propertyType} | المدينة: ${data.city || 'غير محدد'} | الرمز البريدي: ${data.zipCode || 'لا يوجد'} | الغرف: ${data.bedrooms || 'غير محدد'} | الحمامات: ${data.bathrooms || 'غير محدد'} | الميزانية: ${data.budget || 'غير محدد'}`;

      const res = await createSubmission({
        name: fullName,
        phone: data.phone,
        email: data.email,
        subject: `طلب تواصل جديد: ${data.propertyType}`,
        message: messageNotes,
        type: 'contact',
        resident_type: 'citizen',
        notes: messageNotes
      });

      if (res.success) {
        setSubmitSuccess(true);
        setFormData({
          title: 'السيد',
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          propertyType: 'شقة',
          zipCode: '',
          city: 'جدة',
          bedrooms: '4',
          bathrooms: '3',
          budget: '',
        });
      } else {
        setSubmitError(res.error || 'حدث خطأ أثناء تقديم الطلب. الرجاء المحاولة مرة أخرى.');
      }
    } catch (err) {
      setSubmitError('تعذر الاتصال بالخادم. الرجاء المحاولة لاحقاً.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact-section" className="relative w-full overflow-hidden py-12 sm:py-20 bg-[#F7F7F7] border-y border-gray-200/80 z-10">
      {/* Background Decorative Blob */}
      <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#CAA048]/5 rounded-full blur-3xl z-0 pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 text-center">
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="flex items-center justify-center mb-2">
            <span className="inline-flex items-center gap-2 py-1.5 px-4 text-xs sm:text-sm font-bold text-white bg-[#111315] border border-white/20 rounded-full font-cairo shadow-sm backdrop-blur-md">
              <Headphones className="w-3.5 h-3.5 text-white shrink-0" />
              <span>تواصل معنا</span>
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-[2.5rem] font-black text-brand-black leading-tight font-heading heading-engraved">أبق على اتصال</h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-2xl sm:max-w-3xl mx-auto font-cairo text-pretty">
            تمتلك شركتنا العقارية عدداً من القوائم الفاخرة والحصرية المثالية للعملاء الراغبين في التملك أو الاستثمار.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-4xl mx-auto mt-7 sm:mt-10 z-10"
        >
          <div className="relative bg-white border border-gray-300 p-4 sm:p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
            <div className="absolute top-0 start-10 end-10 h-[2px] bg-gradient-to-r from-transparent via-[#CAA048] to-transparent"></div>

            {submitSuccess ? (
              <div className="py-12 px-4 text-center space-y-4">
                <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto" />
                <h3 className="text-xl sm:text-2xl font-bold text-brand-black font-heading">تم إرسال طلبك بنجاح!</h3>
                <p className="text-sm text-gray-600 max-w-md mx-auto font-cairo">
                  شكراً لتواصلك معنا. سيقوم مستشارنا العقاري بالاتصال بك في أقرب وقت.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitSuccess(false)}
                  className="mt-4 py-3 px-8 text-xs sm:text-sm font-bold btn-premium-gold rounded-full min-h-[42px] font-cairo cursor-pointer"
                >
                  إرسال طلب آخر
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-start" noValidate>
                {submitError && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2 font-cairo">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Group 1: Personal Info */}
                <div className="space-y-3">
                  <h3 className="text-xs sm:text-sm font-bold text-brand-black border-s-2 border-[#CAA048] ps-2.5 font-heading">معلومات شخصية</h3>

                  <div className="grid grid-cols-[0.65fr_1fr_1fr] gap-2 sm:gap-4">
                    <div className="space-y-1">
                      <label htmlFor="contact-title" className="block text-xs font-semibold text-gray-700 font-cairo">اللقب</label>
                      <select
                        id="contact-title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full bg-gray-50 border border-gray-300 focus:border-[#CAA048] focus:bg-white rounded-xl px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-brand-black focus:outline-none focus:ring-2 focus:ring-[#CAA048]/20 transition-all min-h-[42px] font-cairo"
                      >
                        <option value="السيد">السيد</option>
                        <option value="السيدة">السيدة</option>
                        <option value="شركة">شركة / جهة</option>
                      </select>
                      {errors.title && <p className="text-xs text-red-500 mt-1 font-cairo">{errors.title}</p>}
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="contact-first-name" className="block text-xs font-semibold text-gray-700 font-cairo">الاسم الأول *</label>
                      <input
                        id="contact-first-name"
                        name="firstName"
                        type="text"
                        placeholder="أدخل الاسم الأول"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full bg-gray-50 border border-gray-300 focus:border-[#CAA048] focus:bg-white rounded-xl px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-brand-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#CAA048]/20 transition-all min-h-[42px] font-cairo"
                      />
                      {errors.firstName && <p className="text-xs text-red-500 mt-1 font-cairo">{errors.firstName}</p>}
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="contact-last-name" className="block text-xs font-semibold text-gray-700 font-cairo">اسم العائلة *</label>
                      <input
                        id="contact-last-name"
                        name="lastName"
                        type="text"
                        placeholder="أدخل اسم العائلة"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full bg-gray-50 border border-gray-300 focus:border-[#CAA048] focus:bg-white rounded-xl px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-brand-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#CAA048]/20 transition-all min-h-[42px] font-cairo"
                      />
                      {errors.lastName && <p className="text-xs text-red-500 mt-1 font-cairo">{errors.lastName}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    <div className="space-y-1">
                      <label htmlFor="contact-email" className="block text-xs font-semibold text-gray-700 font-cairo">البريد الإلكتروني *</label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-gray-50 border border-gray-300 focus:border-[#CAA048] focus:bg-white rounded-xl px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-brand-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#CAA048]/20 transition-all min-h-[42px] font-cairo"
                      />
                      {errors.email && <p className="text-xs text-red-500 mt-1 font-cairo">{errors.email}</p>}
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="contact-phone" className="block text-xs font-semibold text-gray-700 font-cairo">رقم التليفون *</label>
                      <input
                        id="contact-phone"
                        name="phone"
                        type="tel"
                        placeholder="05xxxxxxxx"
                        dir="ltr"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full bg-gray-50 border border-gray-300 focus:border-[#CAA048] focus:bg-white rounded-xl px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-brand-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#CAA048]/20 transition-all text-start font-mono min-h-[42px]"
                      />
                      {errors.phone && <p className="text-xs text-red-500 mt-1 font-cairo">{errors.phone}</p>}
                    </div>
                  </div>
                </div>

                {/* Group 2: Property Preferences */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs sm:text-sm font-bold text-brand-black border-s-2 border-[#CAA048] ps-2.5 font-heading">معلومات العقار المطلوب</h3>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
                    <div className="space-y-1">
                      <label htmlFor="contact-property-type" className="block text-xs font-semibold text-gray-700 font-cairo">نوع العقار</label>
                      <select
                        id="contact-property-type"
                        name="propertyType"
                        value={formData.propertyType}
                        onChange={handleChange}
                        className="w-full bg-gray-50 border border-gray-300 focus:border-[#CAA048] focus:bg-white rounded-xl px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-brand-black focus:outline-none focus:ring-2 focus:ring-[#CAA048]/20 transition-all min-h-[42px] font-cairo"
                      >
                        <option value="شقة">شقة سكنية</option>
                        <option value="فيلا">فيلا مستقلة</option>
                        <option value="ملحق">ملحق روف / بنتهاوس</option>
                        <option value="مشروع ابو هايل افينيو">مشروع أبو هايل أفينيو</option>
                        <option value="مشروع امل ستارز">مشروع أمل ستارز</option>
                        <option value="مشروع ريناد غاليري">مشروع ريناد غاليري</option>
                        <option value="مشروع هتان التيسير">مشروع هتان التيسير</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="contact-city" className="block text-xs font-semibold text-gray-700 font-cairo">المدينة المفضلة</label>
                      <input
                        id="contact-city"
                        name="city"
                        type="text"
                        placeholder="جدة، الرياض، مكة"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full bg-gray-50 border border-gray-300 focus:border-[#CAA048] focus:bg-white rounded-xl px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-brand-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#CAA048]/20 transition-all min-h-[42px] font-cairo"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="contact-zip" className="block text-xs font-semibold text-gray-700 font-cairo">الرمز البريدي</label>
                      <input
                        id="contact-zip"
                        name="zipCode"
                        type="text"
                        placeholder="الرمز البريدي"
                        value={formData.zipCode}
                        onChange={handleChange}
                        className="w-full bg-gray-50 border border-gray-300 focus:border-[#CAA048] focus:bg-white rounded-xl px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-brand-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#CAA048]/20 transition-all font-mono min-h-[42px]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="contact-bedrooms" className="block text-xs font-semibold text-gray-700 font-cairo">عدد الغرف</label>
                      <select
                        id="contact-bedrooms"
                        name="bedrooms"
                        value={formData.bedrooms}
                        onChange={handleChange}
                        className="w-full bg-gray-50 border border-gray-300 focus:border-[#CAA048] focus:bg-white rounded-xl px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-brand-black focus:outline-none focus:ring-2 focus:ring-[#CAA048]/20 transition-all min-h-[42px] font-cairo"
                      >
                        <option value="1">1 غرفة</option>
                        <option value="2">2 غرف</option>
                        <option value="3">3 غرف</option>
                        <option value="4">4 غرف</option>
                        <option value="5">5 غرف</option>
                        <option value="6+">6+ غرف</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="contact-bathrooms" className="block text-xs font-semibold text-gray-700 font-cairo">عدد الحمامات</label>
                      <input
                        id="contact-bathrooms"
                        name="bathrooms"
                        type="number"
                        placeholder="مثال: 3"
                        value={formData.bathrooms}
                        onChange={handleChange}
                        className="w-full bg-gray-50 border border-gray-300 focus:border-[#CAA048] focus:bg-white rounded-xl px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-brand-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#CAA048]/20 transition-all min-h-[42px] font-cairo"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="contact-budget" className="block text-xs font-semibold text-gray-700 font-cairo">الميزانية المتوقعة (ر.س)</label>
                      <input
                        id="contact-budget"
                        name="budget"
                        type="text"
                        placeholder="مثال: 800,000"
                        value={formData.budget}
                        onChange={handleChange}
                        className="w-full bg-gray-50 border border-gray-300 focus:border-[#CAA048] focus:bg-white rounded-xl px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-brand-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#CAA048]/20 transition-all min-h-[42px] font-cairo"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-6 text-xs sm:text-sm font-bold btn-premium-gold rounded-xl transition-all duration-300 shadow-md cursor-pointer flex items-center justify-center gap-2 min-h-[42px] font-cairo"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>جاري إرسال الطلب...</span>
                      </>
                    ) : (
                      <span>إرسال الطلب</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
