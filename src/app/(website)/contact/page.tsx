// src/app/contact/page.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Building,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  Send,
  Instagram,
  Facebook,
  Youtube,
  MessageCircle,
  ArrowUpLeft,
  Navigation,
  User,
  HelpCircle,
  PhoneCall,
  Share2
} from 'lucide-react';
import { createSubmission } from '@/app/actions/submissions';
import { BRAND, WHATSAPP_MESSAGE, WHATSAPP_URL } from '@/config/brand';
import { getSiteSettings, type SiteSettingsData } from '@/app/actions/settings';

const WhatsAppIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 012.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 01-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1s.9 2.43 1.03 2.6c.13.17 1.77 2.7 4.28 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.07-.12-.23-.19-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.454 5.709 1.455h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function ContactPage() {
  // Site settings state
  const [siteSettings, setSiteSettings] = useState<SiteSettingsData | null>(null);

  React.useEffect(() => {
    getSiteSettings().then((res) => {
      if (res) setSiteSettings(res);
    }).catch(console.error);
  }, []);

  const activeSocial = siteSettings?.social || BRAND.social;
  const activeContact = siteSettings?.contact;

  const unifiedDisplay = activeContact?.unifiedNumber || BRAND.contact.primaryPhone.display;
  const unifiedTel = (activeContact?.unifiedNumber || BRAND.contact.primaryPhone.display).replace(/[^0-9+]/g, '');

  const mobileDisplay = activeContact?.mobileNumber || BRAND.contact.secondaryPhone.display;
  const mobileTel = (activeContact?.mobileNumber || BRAND.contact.secondaryPhone.display).replace(/[^0-9+]/g, '');

  const companyEmail = activeContact?.companyEmail || BRAND.contact.email;
  const addressText = activeContact?.address || BRAND.contact.cityAr;

  const rawWhatsapp = siteSettings?.social?.whatsapp || BRAND.contact.primaryPhone.tel;
  const dynamicWhatsappUrl = rawWhatsapp.startsWith('http')
    ? rawWhatsapp
    : `https://wa.me/${rawWhatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  // Form States
  const [residentType, setResidentType] = useState<'citizen' | 'resident'>('citizen');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('general');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  // Active Branch Switcher State
  const [activeBranch, setActiveBranch] = useState<'jeddah' | 'riyadh'>('jeddah');

  // Stagger entry animations
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  };

  // Submit Handler for contact form
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    const type = 'contact';
    const subStr = subject === 'general' ? 'استفسار عام' : subject === 'sales' ? 'طلب مبيعات' : 'طلب معاينة أو حجز';

    try {
      const res = await createSubmission({
        name,
        phone,
        email,
        subject: subStr,
        message,
        type,
        resident_type: residentType
      });

      if (res.success) {
        setFormSuccess(true);
        // Reset form fields
        setResidentType('citizen');
        setName('');
        setPhone('');
        setEmail('');
        setSubject('general');
        setMessage('');
        
        // Auto dismiss success screen after 4 seconds
        setTimeout(() => {
          setFormSuccess(false);
        }, 4000);
      } else {
        alert(res.error || 'حدث خطأ أثناء إرسال طلبك');
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ في الشبكة، يرجى المحاولة لاحقاً');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-white text-brand-black min-h-screen relative overflow-x-hidden font-cairo select-none dir-rtl">
      
      {/* ----------------------------------------------------
         1. Full-screen Hero Section with Direct Action Channels
         ---------------------------------------------------- */}
      <section className="relative w-full min-h-[90vh] lg:min-h-screen flex items-center justify-center overflow-hidden bg-[#0d0d0f] pt-28 sm:pt-36 pb-20 sm:pb-24">
        {/* Background Image & Soft Architectural Overlays (Preserving original background image as requested) */}
        <div className="absolute inset-0 z-0 select-none">
          <Image
            src="/hero-bg-3.webp"
            alt="شركة مار العقارية للتطوير العقاري"
            fill
            sizes="100vw"
            className="object-cover object-center scale-[1.01] transition-transform duration-1000"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/72 via-black/45 to-black/80 z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.48)_100%)] z-10" />
        </div>

        <div className="relative z-20 text-center px-4 sm:px-6 max-w-4xl mx-auto flex flex-col items-center">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 py-2 px-5 text-xs sm:text-sm font-bold text-white bg-black/55 border border-[#E6A821]/45 rounded-full font-cairo shadow-[0_4px_20px_rgba(0,0,0,0.3)] backdrop-blur-md mb-5"
          >
            <PhoneCall className="w-4 h-4 text-[#E6A821] shrink-0" />
            <span>الريادة والخدمة الاستثنائية • شركة مار العقارية</span>
          </motion.span>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-[4.2rem] font-black leading-[1.2] font-heading mb-6 drop-shadow-[0_4px_24px_rgba(0,0,0,0.65)] text-center tracking-tight"
          >
            <span className="block text-white">قنوات الاتصال المباشر لـ</span>
            <span className="block bg-gradient-to-r from-[#FDE36E] via-[#F9CC40] to-[#E6A821] bg-clip-text text-transparent drop-shadow-md font-black mt-1 sm:mt-2">
              نخبة المستثمرين العقاريين
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-sm sm:text-base md:text-lg text-white/95 leading-relaxed mb-10 max-w-2xl sm:max-w-3xl mx-auto text-center font-cairo text-pretty drop-shadow-md"
          >
            نقدّم تجربة استشارية متكاملة تتوافق مع تطلعاتكم. تواصلوا معنا مباشرة عبر قنوات الاتصال الهاتفي والمراسلة الرقمية السريعة.
          </motion.p>

          {/* Unified Rounded-Full Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-md sm:max-w-none px-4 sm:px-0 mb-12 sm:mb-14"
          >
            {/* Button 1: Call Directly */}
            <a
              href={`tel:${BRAND.contact.primaryPhone.tel}`}
              className="w-full sm:w-auto py-3.5 px-8 text-xs sm:text-sm font-bold btn-premium-gold flex items-center justify-center gap-2.5 cursor-pointer font-cairo transition-all duration-300 rounded-full"
            >
              <Phone className="w-4 h-4 shrink-0 text-[#111315]" />
              <span>اتصل بنا الآن</span>
            </a>

            {/* Button 2: WhatsApp with official SVG */}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto py-3.5 px-8 text-xs sm:text-sm font-bold bg-[#25D366] hover:bg-[#20ba5a] text-white border border-white/20 rounded-full flex items-center justify-center gap-2.5 transition-all duration-300 shadow-md hover:shadow-lg font-cairo text-center cursor-pointer"
            >
              <WhatsAppIcon className="w-4 h-4 shrink-0" />
              <span>مراسلة فورية عبر واتساب</span>
            </a>
          </motion.div>

          {/* Trust Highlights Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-3xl"
          >
            <div className="flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-white/90 text-xs font-cairo">
              <span className="w-2 h-2 rounded-full bg-[#25D366] shrink-0" />
              <span>فريق استشاري متاح ومستعد للرد</span>
            </div>
            <div className="flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-white/90 text-xs font-cairo">
              <span className="w-2 h-2 rounded-full bg-[#E6A821] shrink-0" />
              <span>استشارات تملك واستثمار معتمدة</span>
            </div>
            <div className="flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-white/90 text-xs font-cairo">
              <span className="w-2 h-2 rounded-full bg-[#25D366] shrink-0" />
              <span>متابعة فورية على مدار الساعة</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ----------------------------------------------------
         2. Main Content: Form & Corporate Branches Info
         ---------------------------------------------------- */}
      <section className="py-16 relative z-10 bg-[#FAF8F5] border-b border-gray-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-10 items-stretch">
            
            {/* Right Column: Contact Form (Col span 7) */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeUpVariants}
              className="lg:col-span-7"
            >
              <div className="p-6 sm:p-10 bg-white border border-gray-200 hover:border-[#E6A821]/40 transition-colors rounded-3xl shadow-sm h-full flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#CB841B] via-[#E6A821] to-[#FDE36E]" />
                
                <AnimatePresence mode="wait">
                  {!formSuccess ? (
                    <motion.div
                      key="contact-form"
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={{
                        hidden: {},
                        visible: { transition: { staggerChildren: 0.05 } }
                      }}
                    >
                      <motion.h3 
                        variants={fadeUpVariants}
                        className="text-xl font-bold text-brand-black mb-1.5 font-cairo text-right"
                      >
                        إرسال استفسار استثماري
                      </motion.h3>
                      <motion.p 
                        variants={fadeUpVariants}
                        className="text-xs text-gray-500 mb-6 leading-relaxed text-right font-cairo"
                      >
                        يرجى تعبئة الحقول وسيقوم مستشارنا العقاري المعتمد بالتواصل معكم لتقديم الاستشارة اللازمة.
                      </motion.p>

                      <form onSubmit={handleContactSubmit} className="space-y-4">
                        {/* Resident / Citizen Selection */}
                        <motion.div variants={fadeUpVariants} className="text-right">
                          <span className="block text-xs font-bold text-gray-700 mb-1.5 font-cairo">
                            الصفة
                          </span>
                          <div className="grid grid-cols-2 gap-2 p-1.5 bg-gray-100/90 border border-gray-200 rounded-xl">
                            <button
                              type="button"
                              onClick={() => setResidentType('citizen')}
                              className={`py-2 rounded-lg text-xs font-bold transition-all font-cairo cursor-pointer text-center ${
                                residentType === 'citizen'
                                  ? 'bg-[#111315] text-[#E6A821] border border-[#E6A821]/40 shadow-sm'
                                  : 'text-gray-600 hover:text-black bg-transparent border border-transparent'
                              }`}
                            >
                              مواطن
                            </button>
                            <button
                              type="button"
                              onClick={() => setResidentType('resident')}
                              className={`py-2 rounded-lg text-xs font-bold transition-all font-cairo cursor-pointer text-center ${
                                residentType === 'resident'
                                  ? 'bg-[#111315] text-[#E6A821] border border-[#E6A821]/40 shadow-sm'
                                  : 'text-gray-600 hover:text-black bg-transparent border border-transparent'
                              }`}
                            >
                              مقيم
                            </button>
                          </div>
                        </motion.div>

                        {/* Name input */}
                        <motion.div variants={fadeUpVariants} className="text-right">
                          <label htmlFor="contact-name" className="block text-xs font-bold text-gray-700 mb-1.5 font-cairo">
                            الاسم بالكامل
                          </label>
                          <div className="relative text-gray-400 focus-within:text-[#E6A821] transition-colors">
                            <User className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
                            <input
                              id="contact-name"
                              type="text"
                              required
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 focus:border-[#E6A821] focus:bg-white rounded-xl ps-10 pe-4 py-3 text-xs sm:text-sm text-brand-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E6A821]/20 transition-all font-cairo"
                              placeholder="الاسم الثلاثي"
                            />
                          </div>
                        </motion.div>

                        {/* Grid: Phone & Email */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <motion.div variants={fadeUpVariants} className="text-right">
                            <label htmlFor="contact-phone" className="block text-xs font-bold text-gray-700 mb-1.5 font-cairo">
                              رقم الجوال
                            </label>
                            <div className="relative text-gray-400 focus-within:text-[#E6A821] transition-colors">
                              <Phone className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
                              <input
                                id="contact-phone"
                                type="tel"
                                required
                                pattern="^(05|009665|\+9665)\d{8}$"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 focus:border-[#E6A821] focus:bg-white rounded-xl ps-10 pe-4 py-3 text-xs sm:text-sm text-brand-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E6A821]/20 transition-all text-left font-mono font-cairo"
                                placeholder="05xxxxxxxx"
                              />
                            </div>
                          </motion.div>

                          <motion.div variants={fadeUpVariants} className="text-right">
                            <label htmlFor="contact-email" className="block text-xs font-bold text-gray-700 mb-1.5 font-cairo">
                              البريد الإلكتروني (اختياري)
                            </label>
                            <div className="relative text-gray-400 focus-within:text-[#E6A821] transition-colors">
                              <Mail className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
                              <input
                                id="contact-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 focus:border-[#E6A821] focus:bg-white rounded-xl ps-10 pe-4 py-3 text-xs sm:text-sm text-brand-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E6A821]/20 transition-all text-left font-mono font-cairo"
                                placeholder="username@domain.com"
                              />
                            </div>
                          </motion.div>
                        </div>

                        {/* Subject */}
                        <motion.div variants={fadeUpVariants} className="text-right">
                          <label htmlFor="contact-subject" className="block text-xs font-bold text-gray-700 mb-1.5 font-cairo">
                            موضوع الاستفسار
                          </label>
                          <div className="relative text-gray-400 focus-within:text-[#E6A821] transition-colors">
                            <HelpCircle className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
                            <select
                              id="contact-subject"
                              value={subject}
                              onChange={(e) => setSubject(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 focus:border-[#E6A821] focus:bg-white rounded-xl ps-10 pe-10 py-3 text-xs sm:text-sm text-brand-black focus:outline-none focus:ring-2 focus:ring-[#E6A821]/20 transition-all appearance-none cursor-pointer font-cairo"
                            >
                              <option value="general">استفسار عام</option>
                              <option value="buy">شراء وحدة سكنية فاخرة</option>
                              <option value="invest">فرص ومشاريع استثمارية</option>
                              <option value="visit">طلب حجز موعد معاينة ميدانية</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[#E6A821]">
                              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                              </svg>
                            </div>
                          </div>
                        </motion.div>

                        {/* Message */}
                        <motion.div variants={fadeUpVariants} className="text-right">
                          <label htmlFor="contact-message" className="block text-xs font-bold text-gray-700 mb-1.5 font-cairo">
                            تفاصيل الرسالة
                          </label>
                          <div className="relative text-gray-400 focus-within:text-[#E6A821] transition-colors">
                            <MessageCircle className="absolute start-3.5 top-3.5 w-4 h-4 pointer-events-none" />
                            <textarea
                              id="contact-message"
                              required
                              rows={3}
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 focus:border-[#E6A821] focus:bg-white rounded-xl ps-10 pe-4 py-3 text-xs sm:text-sm text-brand-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E6A821]/20 transition-all resize-none font-cairo"
                              placeholder="اكتب استفسارك بالتفصيل للمشروع أو المواصفات..."
                            />
                          </div>
                        </motion.div>

                        {/* Submit Button */}
                        <motion.div variants={fadeUpVariants} className="pt-2">
                          <button
                            type="submit"
                            disabled={isSending}
                            className="btn-premium-gold w-full py-3.5 px-6 rounded-full text-sm font-bold flex items-center justify-center gap-2 cursor-pointer font-cairo disabled:opacity-50 transition-all duration-300"
                          >
                            {isSending ? (
                              <>
                                <svg className="animate-spin h-5 w-5 text-[#111315]" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span>جاري إرسال طلبكم...</span>
                              </>
                            ) : (
                              <>
                                <Send className="w-4 h-4 shrink-0" />
                                <span>إرسال الرسالة</span>
                              </>
                            )}
                          </button>
                        </motion.div>
                      </form>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="success-screen"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                      className="py-12 flex flex-col items-center justify-center text-center space-y-5 font-cairo"
                    >
                      <div className="w-16 h-16 rounded-full bg-[#E6A821]/10 border-2 border-[#E6A821] flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-[#E6A821]" />
                      </div>
                      
                      <div className="space-y-2 max-w-md">
                        <h4 className="text-xl font-bold text-brand-black">
                          تم استلام رسالتكم بنجاح
                        </h4>
                        <p className="text-xs font-semibold text-[#E6A821]">
                          رقم المتابعة الخاص بطلبكم: <span className="font-mono text-brand-black">#MAR-{Math.floor(1000 + Math.random() * 9000)}</span>
                        </p>
                        <p className="text-xs text-gray-500 leading-relaxed pt-2">
                          نشكر اهتمامكم بشركة مار العقارية. سيتواصل معكم المستشار المختص عبر الهاتف أو الواتساب قريباً.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Left Column: Branch Switcher & Details */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={fadeUpVariants}
              className="lg:col-span-5"
            >
              <div className="p-6 sm:p-10 bg-white border border-gray-200 hover:border-[#E6A821]/40 transition-colors rounded-3xl shadow-sm h-full flex flex-col justify-between gap-6 relative overflow-hidden">
                <div className="space-y-4">
                  <motion.h3 
                    variants={fadeUpVariants}
                    className="text-xs font-bold text-[#E6A821] uppercase tracking-wider font-cairo text-right"
                  >
                    MAR CONTACT / تواصل مع مار
                  </motion.h3>
                  
                  <motion.div 
                    variants={fadeUpVariants}
                    className="grid grid-cols-2 gap-2 p-1.5 bg-gray-100/90 border border-gray-200 rounded-xl"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveBranch('jeddah')}
                      className={`py-2 rounded-lg text-xs font-bold transition-all font-cairo cursor-pointer text-center ${
                        activeBranch === 'jeddah'
                          ? 'bg-[#111315] text-[#E6A821] border border-[#E6A821]/40 shadow-sm'
                          : 'text-gray-600 hover:text-black bg-transparent border border-transparent'
                      }`}
                    >
                      الهاتف الرئيسي
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveBranch('riyadh')}
                      className={`py-2 rounded-lg text-xs font-bold transition-all font-cairo cursor-pointer text-center ${
                        activeBranch === 'riyadh'
                          ? 'bg-[#111315] text-[#E6A821] border border-[#E6A821]/40 shadow-sm'
                          : 'text-gray-600 hover:text-black bg-transparent border border-transparent'
                      }`}
                    >
                      الهاتف الإضافي
                    </button>
                  </motion.div>
                </div>

                <div className="flex-1 flex flex-col justify-center min-h-[200px]">
                  <AnimatePresence mode="wait">
                    {activeBranch === 'jeddah' ? (
                      <motion.div
                        key="jeddah-branch"
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={{
                          hidden: { opacity: 0 },
                          visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
                        }}
                        className="space-y-4 text-right"
                      >
                        <motion.div variants={fadeUpVariants} className="flex items-center gap-2 pb-2 border-b border-gray-100">
                          <Building className="w-5 h-5 text-[#E6A821] shrink-0" />
                          <h4 className="font-bold text-brand-black text-base font-cairo">تواصل مع مار العقارية</h4>
                        </motion.div>
                        
                        <div className="space-y-3 text-xs sm:text-sm text-gray-600 font-cairo">
                          <motion.p variants={fadeUpVariants} className="flex items-start gap-2.5">
                            <MapPin className="w-4 h-4 text-[#E6A821] shrink-0 mt-0.5" />
                            <span>{addressText}</span>
                          </motion.p>
                          <motion.p variants={fadeUpVariants} className="flex items-center gap-2.5">
                            <Phone className="w-4 h-4 text-[#E6A821] shrink-0" />
                            <span className="font-mono" dir="ltr">{unifiedDisplay}</span>
                          </motion.p>
                          <motion.p variants={fadeUpVariants} className="flex items-center gap-2.5">
                            <Mail className="w-4 h-4 text-[#E6A821] shrink-0" />
                            <span className="font-mono text-xs">{companyEmail}</span>
                          </motion.p>
                          <motion.p variants={fadeUpVariants} className="flex items-center gap-2.5">
                            <Clock className="w-4 h-4 text-[#E6A821] shrink-0" />
                            <span>اتصل بنا أو أرسل طلبك وسيتواصل معك فريق مار.</span>
                          </motion.p>
                        </div>

                        <motion.div variants={fadeUpVariants} className="pt-2 flex flex-wrap gap-3">
                          <a
                            href={`tel:${unifiedTel}`}
                            className="btn-mar-black py-2.5 px-6 text-xs font-bold rounded-full flex items-center gap-2 shadow-sm font-cairo text-white hover:text-[#E6A821]"
                          >
                            <Phone className="w-3.5 h-3.5 text-[#E6A821]" /> اتصل بنا
                          </a>
                          <a
                            href={dynamicWhatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2.5 px-6 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full text-xs font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-lg font-cairo cursor-pointer"
                          >
                            <WhatsAppIcon className="w-3.5 h-3.5 shrink-0" /> مراسلة فورية
                          </a>
                        </motion.div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="riyadh-branch"
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={{
                          hidden: { opacity: 0 },
                          visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
                        }}
                        className="space-y-4 text-right"
                      >
                        <motion.div variants={fadeUpVariants} className="flex items-center gap-2 pb-2 border-b border-gray-100">
                          <Building className="w-5 h-5 text-[#E6A821] shrink-0" />
                          <h4 className="font-bold text-brand-black text-base font-cairo">خدمة العملاء والمتابعة</h4>
                        </motion.div>
                        
                        <div className="space-y-3 text-xs sm:text-sm text-gray-600 font-cairo">
                          <motion.p variants={fadeUpVariants} className="flex items-start gap-2.5">
                            <MapPin className="w-4 h-4 text-[#E6A821] shrink-0 mt-0.5" />
                            <span>قناة اتصال إضافية لخدمة العملاء ومتابعة الاستفسارات.</span>
                          </motion.p>
                          <motion.p variants={fadeUpVariants} className="flex items-center gap-2.5">
                            <Phone className="w-4 h-4 text-[#E6A821] shrink-0" />
                            <span className="font-mono" dir="ltr">{mobileDisplay}</span>
                          </motion.p>
                          <motion.p variants={fadeUpVariants} className="flex items-center gap-2.5">
                            <Mail className="w-4 h-4 text-[#E6A821] shrink-0" />
                            <span className="font-mono text-xs">{companyEmail}</span>
                          </motion.p>
                          <motion.p variants={fadeUpVariants} className="flex items-center gap-2.5">
                            <Clock className="w-4 h-4 text-[#E6A821] shrink-0" />
                            <span>نسعد باستقبال استفساراتكم عن المشاريع والعروض.</span>
                          </motion.p>
                        </div>

                        <motion.div variants={fadeUpVariants} className="pt-2 flex flex-wrap gap-3">
                          <a
                            href={`tel:${mobileTel}`}
                            className="btn-mar-black py-2.5 px-6 text-xs font-bold rounded-full flex items-center gap-2 shadow-sm font-cairo text-white hover:text-[#E6A821]"
                          >
                            <Phone className="w-3.5 h-3.5 text-[#E6A821]" /> اتصل بنا
                          </a>
                          <a
                            href={dynamicWhatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2.5 px-6 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full text-xs font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-lg font-cairo cursor-pointer"
                          >
                            <WhatsAppIcon className="w-3.5 h-3.5 shrink-0" /> مراسلة فورية
                          </a>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* HQ Building Showcase & Google Maps Link */}
                <motion.div 
                  variants={fadeUpVariants}
                  className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-4 items-center"
                >
                  <div className="relative w-full sm:w-20 h-20 rounded-xl overflow-hidden border border-gray-200 shrink-0 shadow-xs">
                    <Image
                      src="/projects/villa_3d_render.webp"
                      alt="مقر المركز الرئيسي"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="text-right flex-1 space-y-1">
                    <h4 className="font-bold text-brand-black text-xs sm:text-sm font-cairo">موقع المركز الرئيسي</h4>
                    <p className="text-[11px] text-gray-500 leading-relaxed font-cairo">
                      {BRAND.contact.cityAr}
                    </p>
                    <div className="pt-1">
                      <a
                        href="https://maps.google.com/?q=MAR+Real+Estate+Jeddah"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#E6A821] hover:text-[#CB841B] text-xs font-bold transition-colors font-cairo"
                      >
                        <Navigation className="w-3 h-3" />
                        <span>عرض الاتجاهات على خرائط Google</span>
                      </a>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------
         3. Social Media Grid Section
         ---------------------------------------------------- */}
      <section className="py-16 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } }
          }}
          className="flex flex-col items-center text-center mb-12"
        >
          <motion.span variants={fadeUpVariants} className="inline-flex items-center gap-2 py-1.5 px-4 text-xs sm:text-sm font-bold text-white bg-[#111315] border border-white/20 rounded-full uppercase tracking-wider mb-3 font-cairo shadow-sm backdrop-blur-md">
            <Share2 className="w-3.5 h-3.5 text-white shrink-0" />
            <span>منصاتنا الرقمية</span>
          </motion.span>
          <motion.h2 variants={fadeUpVariants} className="text-xl sm:text-3xl font-bold text-brand-black leading-tight font-cairo">
            تواصل معنا عبر شبكاتنا الاجتماعية
          </motion.h2>
          <motion.div variants={fadeUpVariants} className="mt-4 flex items-center justify-center gap-2">
            <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[#E6A821]/50"></div>
            <div className="w-2 h-2 rotate-45 border border-[#E6A821]/60 bg-white"></div>
            <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-[#E6A821]/50"></div>
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } }
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* Instagram Card */}
          <motion.div
            variants={fadeUpVariants}
            whileHover={{ y: -6 }}
            className="p-6 bg-[#F7F7F7] border border-gray-200 hover:border-[#E6A821] rounded-3xl shadow-sm flex flex-col justify-between items-start text-right transition-all duration-300 relative overflow-hidden group min-h-[250px] hover:shadow-[0_16px_36px_rgba(0,0,0,0.06),0_0_0_1px_rgba(230,168,33,0.3)]"
          >
            <div className="w-full">
              <div className="w-12 h-12 rounded-2xl bg-[#111315] border border-[#E6A821]/30 flex items-center justify-center text-[#E6A821] mb-4 transition-all duration-300 group-hover:scale-105 shadow-sm">
                <Instagram className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-brand-black text-base font-cairo">إنستغرام</h4>
              <span className="text-xs text-[#E6A821] font-mono font-bold" dir="ltr">@mar.realestate</span>
              <p className="text-xs text-gray-500 leading-relaxed mt-2.5 mb-5 font-cairo">
                تابع تغطياتنا الميدانية وجولاتنا الحية لمشاريعنا الفاخرة أولاً بأول.
              </p>
            </div>
            <a
              href={activeSocial.instagram || BRAND.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 bg-white hover:bg-[#111315] text-brand-black hover:text-[#E6A821] border border-gray-200 hover:border-[#E6A821]/40 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs font-cairo mt-auto"
            >
              <span>متابعة الآن</span>
              <ArrowUpLeft className="w-3.5 h-3.5" />
            </a>
          </motion.div>

          {/* YouTube Card */}
          <motion.div
            variants={fadeUpVariants}
            whileHover={{ y: -6 }}
            className="p-6 bg-[#F7F7F7] border border-gray-200 hover:border-[#E6A821] rounded-3xl shadow-sm flex flex-col justify-between items-start text-right transition-all duration-300 relative overflow-hidden group min-h-[250px] hover:shadow-[0_16px_36px_rgba(0,0,0,0.06),0_0_0_1px_rgba(230,168,33,0.3)]"
          >
            <div className="w-full">
              <div className="w-12 h-12 rounded-2xl bg-[#111315] border border-[#E6A821]/30 flex items-center justify-center text-[#E6A821] mb-4 transition-all duration-300 group-hover:scale-105 shadow-sm">
                <Youtube className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-brand-black text-base font-cairo">يوتيوب</h4>
              <span className="text-xs text-[#E6A821] font-mono font-bold" dir="ltr">Mar Real Estate</span>
              <p className="text-xs text-gray-500 leading-relaxed mt-2.5 mb-5 font-cairo">
                شاهد العروض السينمائية وجولات الفيديو عالية الدقة لوحداتنا ومشاريعنا.
              </p>
            </div>
            <a
              href={activeSocial.youtube || BRAND.social.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 bg-white hover:bg-[#111315] text-brand-black hover:text-[#E6A821] border border-gray-200 hover:border-[#E6A821]/40 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs font-cairo mt-auto"
            >
              <span>زيارة القناة</span>
              <ArrowUpLeft className="w-3.5 h-3.5" />
            </a>
          </motion.div>

          {/* Facebook Card */}
          <motion.div
            variants={fadeUpVariants}
            whileHover={{ y: -6 }}
            className="p-6 bg-[#F7F7F7] border border-gray-200 hover:border-[#E6A821] rounded-3xl shadow-sm flex flex-col justify-between items-start text-right transition-all duration-300 relative overflow-hidden group min-h-[250px] hover:shadow-[0_16px_36px_rgba(0,0,0,0.06),0_0_0_1px_rgba(230,168,33,0.3)]"
          >
            <div className="w-full">
              <div className="w-12 h-12 rounded-2xl bg-[#111315] border border-[#E6A821]/30 flex items-center justify-center text-[#E6A821] mb-4 transition-all duration-300 group-hover:scale-105 shadow-sm">
                <Facebook className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-brand-black text-base font-cairo">فيسبوك</h4>
              <span className="text-xs text-[#E6A821] font-mono font-bold" dir="ltr">Mar1RealEstate</span>
              <p className="text-xs text-gray-500 leading-relaxed mt-2.5 mb-5 font-cairo">
                تابع أخبار مار العقارية وأحدث المشاريع والعروض المنشورة.
              </p>
            </div>
            <a
              href={activeSocial.facebook || BRAND.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 bg-white hover:bg-[#111315] text-brand-black hover:text-[#E6A821] border border-gray-200 hover:border-[#E6A821]/40 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs font-cairo mt-auto"
            >
              <span>زيارة الصفحة</span>
              <ArrowUpLeft className="w-3.5 h-3.5" />
            </a>
          </motion.div>

          {/* X (Twitter) Card */}
          <motion.div
            variants={fadeUpVariants}
            whileHover={{ y: -6 }}
            className="p-6 bg-[#F7F7F7] border border-gray-200 hover:border-[#E6A821] rounded-3xl shadow-sm flex flex-col justify-between items-start text-right transition-all duration-300 relative overflow-hidden group min-h-[250px] hover:shadow-[0_16px_36px_rgba(0,0,0,0.06),0_0_0_1px_rgba(230,168,33,0.3)]"
          >
            <div className="w-full">
              <div className="w-12 h-12 rounded-2xl bg-[#111315] border border-[#E6A821]/30 flex items-center justify-center text-[#E6A821] mb-4 transition-all duration-300 group-hover:scale-105 shadow-sm">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </div>
              <h4 className="font-bold text-brand-black text-base font-cairo">منصة إكس</h4>
              <span className="text-xs text-[#E6A821] font-mono font-bold" dir="ltr">@Mar_Real_Estate</span>
              <p className="text-xs text-gray-500 leading-relaxed mt-2.5 mb-5 font-cairo">
                ابق على اطلاع بآخر أخبار التطوير العقاري وتحديثات مشاريعنا.
              </p>
            </div>
            <a
              href={activeSocial.x || BRAND.social.x}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 bg-white hover:bg-[#111315] text-brand-black hover:text-[#E6A821] border border-gray-200 hover:border-[#E6A821]/40 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs font-cairo mt-auto"
            >
              <span>آخر التحديثات</span>
              <ArrowUpLeft className="w-3.5 h-3.5" />
            </a>
          </motion.div>
        </motion.div>
      </section>

    </div>
  );
}
