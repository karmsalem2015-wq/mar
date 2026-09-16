'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { z } from 'zod';
import { createSubmission } from '@/app/actions/submissions';
import { CheckCircle, AlertCircle, Loader2, Headphones, ChevronDown, UserRound, Mail, Phone, Building2, MapPin, BedDouble, Bath, WalletCards } from 'lucide-react';

const contactSchema = z.object({
  fullName: z.string().min(5, 'الرجاء إدخال الاسم الثلاثي'),
  email: z.string().email('عنوان البريد الإلكتروني غير صحيح'),
  phone: z.string().min(8, 'رقم التليفون يجب أن يكون 8 أرقام على الأقل'),
  propertyType: z.string().min(1, 'الرجاء اختيار نوع العقار أو المشروع'),
  city: z.string().optional(),
  bedrooms: z.string().optional(),
  bathrooms: z.string().optional(),
  budget: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

type SelectOption = { value: string; label: string };
function CustomSelect({ name, value, options, icon: Icon, onChange, ariaLabel }: { name: keyof ContactFormData; value?: string; options: SelectOption[]; icon: React.ElementType; onChange: (name: keyof ContactFormData, value: string) => void; ariaLabel: string }) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selected = options.find(o => o.value === value) ?? options[0];
  useEffect(() => {
    if (!open) return;
    const update = () => triggerRef.current && setRect(triggerRef.current.getBoundingClientRect());
    update(); window.addEventListener('resize', update); window.addEventListener('scroll', update, true);
    return () => { window.removeEventListener('resize', update); window.removeEventListener('scroll', update, true); };
  }, [open]);
  return <div className="relative">
    <button ref={triggerRef} type="button" aria-label={ariaLabel} aria-expanded={open} onClick={() => setOpen(v => !v)} className="w-full min-h-[44px] rounded-xl border border-gray-300 bg-white px-3 flex items-center gap-2 text-xs sm:text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#CAA048]/25 focus:border-[#CAA048]">
      <Icon className="w-4 h-4 text-[#B58B34] shrink-0"/><span className="flex-1 text-start truncate font-cairo">{selected?.label}</span><ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}/>
    </button>
    {open && rect && typeof document !== 'undefined' && createPortal(
      <><button type="button" aria-label="إغلاق القائمة" className="fixed inset-0 z-[9998] cursor-default" onClick={() => setOpen(false)}/>
      <div className="fixed z-[9999] max-h-[min(280px,45vh)] overflow-y-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-2xl" style={{ top: Math.min(rect.bottom + 6, window.innerHeight - Math.min(286, window.innerHeight * .45)), left: rect.left, width: rect.width }}>
        {options.map(o => <button key={o.value} type="button" onClick={() => { onChange(name, o.value); setOpen(false); }} className={`w-full rounded-lg px-3 py-2.5 text-start text-xs sm:text-sm font-cairo hover:bg-[#CAA048]/10 ${o.value === value ? 'bg-[#CAA048]/10 font-bold text-[#8B681F]' : 'text-gray-700'}`}>{o.label}</button>)}
      </div></>, document.body)}
  </div>;
}

export default function ContactFormSection() {
  const shouldReduceMotion = useReducedMotion();
  const [formData, setFormData] = useState<ContactFormData>({
    fullName: '',
    email: '',
    phone: '',
    propertyType: 'شقة',
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

  const setSelectValue = (name: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
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
      const fullName = data.fullName.trim();
      const messageNotes = `نوع العقار: ${data.propertyType} | المدينة: ${data.city || 'غير محدد'} | الغرف: ${data.bedrooms || 'غير محدد'} | الحمامات: ${data.bathrooms || 'غير محدد'} | الميزانية: ${data.budget || 'غير محدد'}`;

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
          fullName: '',
          email: '',
          phone: '',
          propertyType: 'شقة',
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

                  <div dir="rtl">
                    <div className="space-y-1">
                      <label htmlFor="contact-full-name" className="block text-xs font-semibold text-gray-700 font-cairo text-start">الاسم الثلاثي *</label>
                      <div className="relative">
                        <UserRound className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-[#B58B34] pointer-events-none" />
                        <input id="contact-full-name" name="fullName" type="text" dir="rtl" autoComplete="name" placeholder="اكتب الاسم الثلاثي" value={formData.fullName} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 focus:border-[#CAA048] focus:bg-white rounded-xl pl-3 pr-10 py-2.5 text-xs sm:text-sm text-brand-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CAA048]/20 transition-all min-h-[44px] font-cairo text-start" />
                      </div>
                      {errors.fullName && <p className="text-xs text-red-500 mt-1 font-cairo">{errors.fullName}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:gap-4" dir="rtl">
                    <div className="space-y-1">
                      <label htmlFor="contact-email" className="block text-xs font-semibold text-gray-700 font-cairo text-start">البريد الإلكتروني *</label>
                      <div className="relative"><Mail className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-[#B58B34] pointer-events-none"/><input id="contact-email" name="email" type="email" dir="ltr" autoComplete="email" placeholder="name@example.com" value={formData.email} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 focus:border-[#CAA048] rounded-xl pl-3 pr-10 py-2.5 text-xs sm:text-sm text-brand-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CAA048]/20 min-h-[44px] text-start"/></div>
                      {errors.email && <p className="text-xs text-red-500 mt-1 font-cairo">{errors.email}</p>}
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="contact-phone" className="block text-xs font-semibold text-gray-700 font-cairo text-start">رقم التليفون *</label>
                      <div className="relative"><Phone className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 text-[#B58B34] pointer-events-none"/><input id="contact-phone" name="phone" type="tel" dir="ltr" inputMode="tel" autoComplete="tel" placeholder="05xxxxxxxx" value={formData.phone} onChange={handleChange} className="w-full bg-gray-50 border border-gray-300 focus:border-[#CAA048] rounded-xl pl-3 pr-10 py-2.5 text-xs sm:text-sm text-brand-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CAA048]/20 min-h-[44px] text-start font-mono"/></div>
                      {errors.phone && <p className="text-xs text-red-500 mt-1 font-cairo">{errors.phone}</p>}
                    </div>
                  </div>
                </div>

                {/* Group 2: Property Preferences */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs sm:text-sm font-bold text-brand-black border-s-2 border-[#CAA048] ps-2.5 font-heading">معلومات العقار المطلوب</h3>

                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    <div className="space-y-1"><label className="block text-xs font-semibold text-gray-700 font-cairo">نوع العقار</label><CustomSelect name="propertyType" value={formData.propertyType} icon={Building2} ariaLabel="نوع العقار" onChange={setSelectValue} options={[{value:'شقة',label:'شقة سكنية'},{value:'فيلا',label:'فيلا مستقلة'},{value:'ملحق',label:'ملحق روف / بنتهاوس'},{value:'مشروع ابو هايل افينيو',label:'أبو هايل أفينيو'},{value:'مشروع امل ستارز',label:'أمل ستارز'},{value:'مشروع ريناد غاليري',label:'ريناد غاليري'},{value:'مشروع هتان التيسير',label:'هتان التيسير'}]} /></div>
                    <div className="space-y-1"><label className="block text-xs font-semibold text-gray-700 font-cairo">المدينة المفضلة</label><CustomSelect name="city" value={formData.city} icon={MapPin} ariaLabel="المدينة المفضلة" onChange={setSelectValue} options={['جدة','الرياض','مكة','المدينة','الخبر','الدمام'].map(v=>({value:v,label:v}))} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    <div className="space-y-1"><label className="block text-xs font-semibold text-gray-700 font-cairo">عدد الغرف</label><CustomSelect name="bedrooms" value={formData.bedrooms} icon={BedDouble} ariaLabel="عدد الغرف" onChange={setSelectValue} options={[1,2,3,4,5].map(n=>({value:String(n),label:n+' غرف'})).concat([{value:'6+',label:'6 غرف أو أكثر'}])} /></div>
                    <div className="space-y-1"><label className="block text-xs font-semibold text-gray-700 font-cairo">عدد الحمامات</label><CustomSelect name="bathrooms" value={formData.bathrooms} icon={Bath} ariaLabel="عدد الحمامات" onChange={setSelectValue} options={[1,2,3,4,5,6,7,8].map(n=>({value:String(n),label:String(n)})).concat([{value:'9+',label:'9 أو أكثر'}])} /></div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700 font-cairo">الميزانية المتوقعة</label>
                    <CustomSelect name="budget" value={formData.budget} icon={WalletCards} ariaLabel="الميزانية المتوقعة" onChange={setSelectValue} options={[{value:'',label:'اختر الميزانية'},{value:'أقل من 500,000 ريال سعودي',label:'أقل من 500,000 ريال سعودي'},{value:'500,000 - 1,000,000 ريال سعودي',label:'500,000 – 1,000,000 ريال سعودي'},{value:'1,000,000 - 2,000,000 ريال سعودي',label:'1,000,000 – 2,000,000 ريال سعودي'},{value:'2,000,000 - 3,000,000 ريال سعودي',label:'2,000,000 – 3,000,000 ريال سعودي'},{value:'3,000,000 - 5,000,000 ريال سعودي',label:'3,000,000 – 5,000,000 ريال سعودي'},{value:'أكثر من 5,000,000 ريال سعودي',label:'أكثر من 5,000,000 ريال سعودي'}]} />
                  </div>                </div>

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
