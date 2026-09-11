// src/components/layout/InquiryModal.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle, Loader2, CalendarCheck } from 'lucide-react';
import { useInquiryStore } from '../../store/useInquiryStore';
import { createSubmission } from '../../app/actions/submissions';

export default function InquiryModal() {
  const isOpen = useInquiryStore((state) => state.isOpen);
  const close = useInquiryStore((state) => state.close);
  const [inquirySuccess, setInquirySuccess] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleInquirySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSending(true);
    setError('');

    const form = e.currentTarget;
    const nameInput = form.querySelector('#inquiry-name') as HTMLInputElement;
    const phoneInput = form.querySelector('#inquiry-phone') as HTMLInputElement;
    const cityInput = form.querySelector('#inquiry-city') as HTMLInputElement;
    const notesInput = form.querySelector('#inquiry-notes') as HTMLTextAreaElement;

    try {
      const res = await createSubmission({
        name: nameInput.value,
        phone: phoneInput.value,
        email: '',
        subject: `طلب حجز معاينة في ${cityInput.value}`,
        message: notesInput.value || `طلب حجز معاينة خاصة. المدينة المفضلة: ${cityInput.value}`,
        type: 'property_inquiry',
        resident_type: 'citizen'
      });

      if (res.success) {
        setInquirySuccess(true);
        form.reset();
        setTimeout(() => {
          close();
          setInquirySuccess(false);
        }, 2500);
      } else {
        setError(res.error || 'فشل إرسال طلب المعاينة');
      }
    } catch (err) {
      setError('حدث خطأ في الشبكة، يرجى المحاولة لاحقاً');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300 animate-fade-in"
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-white border border-gray-200 shadow-2xl rounded-3xl p-6 sm:p-10 text-right overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient Background Accent */}
            <div className="absolute top-0 end-0 w-48 h-48 bg-[#CAA048]/5 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              type="button"
              className="absolute top-6 end-6 p-2 text-gray-400 hover:text-[#CAA048] bg-gray-100 hover:bg-[#111315] rounded-xl border border-gray-200 hover:border-[#CAA048] transition-colors duration-200 cursor-pointer"
              onClick={close}
              aria-label="إغلاق"
              title="إغلاق نافذة الحجز"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="mb-8 pb-4 border-b border-gray-100">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 text-xs font-bold text-white bg-[#111315] border border-white/20 rounded-full mb-2 font-cairo shadow-sm">
                <CalendarCheck className="w-3.5 h-3.5 text-white shrink-0" />
                <span>حجز موعد ومعاينة خاصة</span>
              </span>
              <h4 className="text-xl sm:text-2xl font-bold text-brand-black leading-tight font-heading">
                طلب معاينة عقارية فاخرة
              </h4>
            </div>

            {/* Form */}
            <form onSubmit={handleInquirySubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="inquiry-name" className="block text-xs font-bold text-gray-700 mb-2 font-cairo">الاسم بالكامل</label>
                  <input
                    id="inquiry-name"
                    type="text"
                    required
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#CAA048] focus:bg-white rounded-xl px-4 py-3 text-xs sm:text-sm text-brand-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CAA048]/20 transition-all font-cairo"
                    placeholder="الاسم الثلاثي"
                  />
                </div>

                <div>
                  <label htmlFor="inquiry-phone" className="block text-xs font-bold text-gray-700 mb-2 font-cairo">رقم الجوال</label>
                  <input
                    id="inquiry-phone"
                    type="tel"
                    required
                    pattern="^(05|009665|\+9665)\d{8}$"
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#CAA048] focus:bg-white rounded-xl px-4 py-3 text-xs sm:text-sm text-brand-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CAA048]/20 transition-all text-left font-mono font-cairo"
                    placeholder="05xxxxxxxx"
                  />
                </div>

                <div>
                  <label htmlFor="inquiry-city" className="block text-xs font-bold text-gray-700 mb-2 font-cairo">المدينة المفضلة</label>
                  <input
                    id="inquiry-city"
                    type="text"
                    required
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#CAA048] focus:bg-white rounded-xl px-4 py-3 text-xs sm:text-sm text-brand-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CAA048]/20 transition-all font-cairo"
                    placeholder="جدة أو الرياض"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="inquiry-notes" className="block text-xs font-bold text-gray-700 mb-2 font-cairo">ملاحظات أو متطلبات خاصة (اختياري)</label>
                <textarea
                  id="inquiry-notes"
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-[#CAA048] focus:bg-white rounded-xl px-4 py-3 text-xs sm:text-sm text-brand-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CAA048]/20 transition-all resize-none font-cairo"
                  placeholder="مثال: رغبة في روف بـ 5 غرف في شمال جدة..."
                />
              </div>

              {error && (
                <p className="text-xs text-red-500 font-bold mb-3 font-cairo">
                  ⚠️ {error}
                </p>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full py-3.5 px-6 rounded-xl text-sm font-bold bg-[#111315] hover:bg-[#CAA048] hover:text-[#111315] text-[#DFC07A] border border-[#CAA048]/40 hover:border-[#CAA048] flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 font-cairo disabled:opacity-50 shadow-md hover:shadow-lg"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                      <span>جاري إرسال طلبك...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 shrink-0 text-[#CAA048]" />
                      <span>تأكيد طلب حجز المعاينة الخاصة</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Success Popup inside Modal */}
            <AnimatePresence>
              {inquirySuccess && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white/98 rounded-3xl p-10 flex flex-col items-center justify-center text-center space-y-4 font-cairo"
                >
                  <div className="w-16 h-16 rounded-full bg-[#111315] border border-[#CAA048]/40 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-[#CAA048]" />
                  </div>
                  <h4 className="text-xl font-bold text-brand-black font-heading">تم إرسال طلب المعاينة بنجاح</h4>
                  <p className="text-xs text-gray-500 max-w-sm">سيتم الاتصال بك لتنسيق موعد الجولة الحية والخاصة مع مستشار مبيعات مار العقارية.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
