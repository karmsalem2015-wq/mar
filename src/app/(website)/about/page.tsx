// src/app/about/page.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import CountUp from 'react-countup';
import {
  Award,
  ShieldCheck,
  Eye,
  Target,
  Quote,
  Heart,
  Landmark,
  Building2,
  Trophy,
  Calendar,
  Briefcase,
  ChevronLeft,
  Milestone,
  Workflow
} from 'lucide-react';
import { useInquiryStore } from '@/store/useInquiryStore';

// Sub-component for split-word text animations
const AnimateWords = ({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) => {
  const words = text.split(' ');
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <span className={className}>{text}</span>;
  }

  return (
    <motion.span
      className={`inline-block ${className || ''}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.04,
            delayChildren: delay
          }
        }
      }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
          }}
          className="inline-block mx-[0.15em]"
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
};

export default function AboutPage() {
  const openInquiry = useInquiryStore((state) => state.open);
  const shouldReduceMotion = useReducedMotion();
  const [activeTimelineYear, setActiveTimelineYear] = useState<number | null>(null);

  // Animation variants
  const fadeUpVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const scaleUpVariants = {
    hidden: { opacity: 0, scale: shouldReduceMotion ? 1 : 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  // Core values mock data
  const values = [
    {
      icon: Award,
      title: 'الجودة الفائقة',
      description: 'لا نساوم أبداً في اختيار المواد ومقاييس البناء. نلتزم بأعلى المعايير الهندسية لضمان استدامة عقاراتنا وفخامتها المطلقة.'
    },
    {
      icon: ShieldCheck,
      title: 'الشفافية المطلقة',
      description: 'نبني جسوراً من الثقة المتينة مع شركائنا ومستثمرينا عبر الصدق والوضوح التام في كافة مراحل التطوير والتعاقد.'
    },
    {
      icon: Landmark,
      title: 'الابتكار المستدام',
      description: 'ندمج أحدث التقنيات الذكية ومفاهيم الهندسة الصديقة للبيئة لتقديم مجتمعات سكنية عصرية تضمن توفير الطاقة والراحة.'
    },
    {
      icon: Heart,
      title: 'التركيز على العميل',
      description: 'نضع احتياجات العميل وتطلعاته الاستثمارية في مقدمة أولوياتنا قبل وخلال ومرحلة ما بعد تسليم الوحدات السكنية.'
    }
  ];

  // Timeline events mock data
  const timelineEvents = [
    {
      year: 2012,
      title: 'التأسيس والإنطلاقة الأولى',
      description: 'تأسست الشركة بمقرها الرئيسي واضعة التميز الهندسي ومصداقية التنفيذ نصب عينيها لبدء مشاريع عمرانية فريدة بالمنطقة.',
      badge: 'الخطوة الأولى'
    },
    {
      year: 2017,
      title: 'برنامج أمل ستارز والريادة السكنية',
      description: 'إطلاق وتسليم سلسلة مشاريع "أمل ستارز" بأرقى أحياء جدة، مسجلين تسليم أكثر من 250 وحدة سكنية متكاملة لعملائنا.',
      badge: 'إنجازات فارقة'
    },
    {
      year: 2021,
      title: 'التوسع الجغرافي والشراكات الكبرى',
      description: 'دخول سوق التطوير العقاري في الرياض بمشاريع نوعية، واعتماد مشاريعنا لدى البنوك والجهات التمويلية الوطنية الكبرى.',
      badge: 'آفاق جديدة'
    },
    {
      year: 2026,
      title: 'الاستدامة والحلول السكنية الذكية',
      description: 'تبني حلول البناء المستدام الصديق للبيئة وتطوير مشاريع ذكية بالكامل تواكب أسلوب الحياة العصري وتطلعات رؤية 2030.',
      badge: 'الريادة المستقبلية'
    }
  ];

  return (
    <div className="bg-white text-brand-black min-h-screen relative overflow-x-hidden font-cairo select-none dir-rtl">
      
      {/* ----------------------------------------------------
         1. Full-screen Hero Section with Integrated Stats
         ---------------------------------------------------- */}
      <section className="relative w-full min-h-[90vh] lg:min-h-screen flex items-center justify-center overflow-hidden bg-[#0d0d0f] pt-28 sm:pt-36 pb-20 sm:pb-24">
        {/* Background Image & Soft Cinematic Overlays */}
        <div className="absolute inset-0 z-0 select-none">
          <Image
            src="/hero-bg-about-sunset.jpg"
            alt="صرح معماري سكني فاخر مار العقارية في وقت الغروب الذهبي"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center scale-[1.01] transition-transform duration-1000"
          />
          {/* Sunset Twilight Architectural Overlay: preserves vibrant amber-orange sunset skies while ensuring crisp text contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/32 to-black/65" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(0,0,0,0.38)_100%)]" />
        </div>

        {/* Hero Content Area */}
        <div className="relative z-20 text-center px-4 sm:px-6 max-w-6xl mx-auto flex flex-col items-center">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 py-2 px-5 text-xs sm:text-sm font-bold text-white bg-black/55 border border-[#E6A821]/45 rounded-full font-cairo shadow-[0_4px_20px_rgba(0,0,0,0.3)] backdrop-blur-md mb-5"
          >
            <Award className="w-4 h-4 text-[#E6A821] shrink-0" />
            <span>مسيرة الريادة والتميّز المعماري • شركة مار العقارية</span>
          </motion.span>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-[4.2rem] font-black leading-[1.2] font-heading mb-6 drop-shadow-[0_4px_24px_rgba(0,0,0,0.65)] text-center tracking-tight"
          >
            <span className="block text-white">بناء الغد برؤية</span>
            <span className="block bg-gradient-to-r from-[#FDE36E] via-[#F9CC40] to-[#E6A821] bg-clip-text text-transparent drop-shadow-md font-black mt-1 sm:mt-2">
              مار العقارية
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-sm sm:text-base md:text-lg text-white/95 leading-relaxed mb-8 max-w-2xl sm:max-w-3xl mx-auto text-center font-cairo text-pretty drop-shadow-md"
          >
            نصنع مجتمعات عمرانية فاخرة تلبي شغف الرفاهية والخصوصية، ونكرس خبراتنا الهندسية لصياغة بيئات معيشية واستثمارية مستدامة تعيد تعريف جودة الحياة بالمملكة.
          </motion.p>

          {/* Unified Rounded-Full CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-md sm:max-w-none px-4 sm:px-0 mb-12 sm:mb-14"
          >
            <Link
              href="/properties"
              className="w-full sm:w-auto py-3.5 px-8 text-xs sm:text-sm font-bold btn-premium-gold flex items-center justify-center gap-2.5 cursor-pointer font-cairo transition-all duration-300 rounded-full"
            >
              <Building2 className="w-4 h-4 shrink-0 text-[#111315]" />
              <span>تصفح الوحدات السكنية</span>
            </Link>

            <Link
              href="/projects"
              className="w-full sm:w-auto py-3.5 px-8 text-xs sm:text-sm font-bold bg-black/45 hover:bg-black/75 text-white border border-white/25 hover:border-[#E6A821] rounded-full flex items-center justify-center gap-2.5 transition-all duration-300 backdrop-blur-md font-cairo text-center shadow-lg"
            >
              <Briefcase className="w-4 h-4 shrink-0 text-[#E6A821]" />
              <span>مشاريعنا المعمارية</span>
            </Link>
          </motion.div>

          {/* Integrated Status / Statistics Card inside the Hero - Translucent Black Glass */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-5xl bg-black/40 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-[0_24px_60px_rgba(0,0,0,0.4)] relative overflow-hidden"
          >
            {/* Top gold accent line */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#E6A821] to-transparent" />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative z-10">
              {/* Stat 1 */}
              <div className="flex flex-col items-center justify-center text-center group cursor-default relative">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-[#FDE36E] mb-3 group-hover:scale-110 group-hover:border-[#E6A821] group-hover:bg-[#E6A821]/20 transition-all duration-300 shadow-sm">
                  <Trophy className="w-5 h-5 text-[#E6A821]" />
                </div>
                <span className="block text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-[#FDE36E] via-[#F9CC40] to-[#E6A821] bg-clip-text text-transparent font-cairo tracking-tight leading-none mb-1.5 drop-shadow-sm">
                  <CountUp end={15} duration={2.5} enableScrollSpy scrollSpyOnce />+
                </span>
                <span className="block text-xs sm:text-sm font-bold text-white font-cairo mb-0.5">
                  عاماً من الخبرة العقارية
                </span>
                <span className="block text-[11px] text-white/70 font-cairo font-medium">
                  مسيرة ريادية في التطوير الفاخر
                </span>
                <div className="absolute left-0 top-[15%] bottom-[15%] w-[1px] bg-white/15 hidden lg:block" />
              </div>

              {/* Stat 2 */}
              <div className="flex flex-col items-center justify-center text-center group cursor-default relative">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-[#FDE36E] mb-3 group-hover:scale-110 group-hover:border-[#E6A821] group-hover:bg-[#E6A821]/20 transition-all duration-300 shadow-sm">
                  <Building2 className="w-5 h-5 text-[#E6A821]" />
                </div>
                <span className="block text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-[#FDE36E] via-[#F9CC40] to-[#E6A821] bg-clip-text text-transparent font-cairo tracking-tight leading-none mb-1.5 drop-shadow-sm">
                  <CountUp end={5000} duration={2.5} separator="," enableScrollSpy scrollSpyOnce />+
                </span>
                <span className="block text-xs sm:text-sm font-bold text-white font-cairo mb-0.5">
                  وحدة سكنية واستثمارية
                </span>
                <span className="block text-[11px] text-white/70 font-cairo font-medium">
                  تم تسليمها وفق معايير عالمية
                </span>
                <div className="absolute left-0 top-[15%] bottom-[15%] w-[1px] bg-white/15 hidden lg:block" />
              </div>

              {/* Stat 3 */}
              <div className="flex flex-col items-center justify-center text-center group cursor-default relative">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-[#FDE36E] mb-3 group-hover:scale-110 group-hover:border-[#E6A821] group-hover:bg-[#E6A821]/20 transition-all duration-300 shadow-sm">
                  <Landmark className="w-5 h-5 text-[#E6A821]" />
                </div>
                <span className="block text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-[#FDE36E] via-[#F9CC40] to-[#E6A821] bg-clip-text text-transparent font-cairo tracking-tight leading-none mb-1.5 drop-shadow-sm">
                  <CountUp end={2.5} decimals={1} duration={2.5} enableScrollSpy scrollSpyOnce />B+
                </span>
                <span className="block text-xs sm:text-sm font-bold text-white font-cairo mb-0.5">
                  ريال حجم الاستثمارات
                </span>
                <span className="block text-[11px] text-white/70 font-cairo font-medium">
                  محفظة تنمو بأعلى العوائد
                </span>
                <div className="absolute left-0 top-[15%] bottom-[15%] w-[1px] bg-white/15 hidden lg:block" />
              </div>

              {/* Stat 4 */}
              <div className="flex flex-col items-center justify-center text-center group cursor-default relative">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-[#FDE36E] mb-3 group-hover:scale-110 group-hover:border-[#E6A821] group-hover:bg-[#E6A821]/20 transition-all duration-300 shadow-sm">
                  <ShieldCheck className="w-5 h-5 text-[#E6A821]" />
                </div>
                <span className="block text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-[#FDE36E] via-[#F9CC40] to-[#E6A821] bg-clip-text text-transparent font-cairo tracking-tight leading-none mb-1.5 drop-shadow-sm">
                  <CountUp end={98} duration={2.5} enableScrollSpy scrollSpyOnce />%
                </span>
                <span className="block text-xs sm:text-sm font-bold text-white font-cairo mb-0.5">
                  نسبة رضا العملاء
                </span>
                <span className="block text-[11px] text-white/70 font-cairo font-medium">
                  ثقة متوارثة ومصداقية كاملة
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ----------------------------------------------------
         2. Legacy & Identity Section (Our Story)
         ---------------------------------------------------- */}
      <section className="py-20 sm:py-24 bg-[#FAF8F5] relative overflow-hidden border-b border-gray-200/70">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center"
          >
            {/* Right Column: Identity Content */}
            <div className="lg:col-span-7 space-y-6 text-right order-2 lg:order-1">
              <div className="block">
                <motion.span
                  variants={fadeUpVariants}
                  className="inline-flex items-center gap-2 py-1.5 px-4 text-xs font-bold text-white bg-[#111315]/80 border border-white/20 rounded-full font-cairo backdrop-blur-md shadow-sm"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E6A821]" aria-hidden="true" />
                  قصتنا وإرثنا العقاري
                </motion.span>
              </div>
              
              <motion.h2
                variants={fadeUpVariants}
                className="text-2xl sm:text-4xl lg:text-5xl font-black text-brand-black leading-[1.25] font-cairo"
              >
                <span>مفهوم ريادي للتطوير العقاري</span>
                <span className="block bg-gradient-to-r from-[#CB841B] via-[#E6A821] to-[#FDE36E] bg-clip-text text-transparent font-black mt-1">
                  يصنع فارقاً معمارياً مستداماً
                </span>
              </motion.h2>
              
              <motion.p
                variants={fadeUpVariants}
                className="text-sm sm:text-base text-gray-600 leading-relaxed font-cairo"
              >
                انطلقت شركة مار العقارية (MAR Real Estate) برؤية وطنية طموحة تسعى لإعادة صياغة المشهد السكني والاستثماري في المملكة العربية السعودية. نحن نؤمن بأن التطوير العقاري ليس مجرد تشييد مبانٍ خرسانية، بل هو ابتكار أسلوب حياة متكامل يجسد أرقى معايير الفخامة والخصوصية، ويمنح الأسر السعودية فضاءات معيشية تفيض بالسكينة والأناقة في أكثر المواقع الاستراتيجية تميزاً في الرياض وجدة.
              </motion.p>

              <motion.p
                variants={fadeUpVariants}
                className="text-sm sm:text-base text-gray-600 leading-relaxed font-cairo"
              >
                ترتكز استراتيجيتنا على دمج الابتكار المعماري مع الالتزام الهندسي الصارم بكود البناء السعودي وأعلى معايير الاستدامة وكفاءة الطاقة. ومن خلال منظومة متكاملة تخضع لأدق معايير الحوكمة والترخيص عبر منصات الهيئة العامة للعقار (رخصة فال وإتمام)، نضمن لعملائنا وشركائنا رحلة تملّك موثوقة واستثماراً متنامياً يحافظ على أصالته وقيمته عبر الأجيال، انسجاماً مع مستهدفات رؤية المملكة 2030 لرفع جودة الحياة.
              </motion.p>

              <motion.div
                variants={fadeUpVariants}
                className="p-6 sm:p-8 bg-white border border-gray-200/90 border-s-4 border-s-[#E6A821] rounded-2xl relative overflow-hidden my-6 shadow-sm group/quote cursor-default"
              >
                <Quote className="absolute top-4 left-6 w-12 h-12 text-[#E6A821]/20 select-none pointer-events-none group-hover/quote:scale-110 transition-transform duration-300" />
                <p className="text-sm sm:text-base text-gray-700 font-medium italic leading-relaxed font-cairo">
                  "في مار العقارية، نصيغ مستقبلاً سكنياً يلهم الحواس ويدوم للأجيال. استثمارنا الحقيقي يكمن في ثقة عملائنا وشغفنا الدائم بتقديم منتج معماري استثنائي لا يُضاهى."
                </p>
                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-100">
                  <div className="w-2 h-2 rounded-full bg-[#E6A821]" />
                  <span className="text-xs font-bold text-brand-black font-cairo">
                    مجلس الإدارة — شركة مار العقارية
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Left Column: Collage */}
            <div className="lg:col-span-5 relative order-1 lg:order-2 flex items-center justify-center p-4">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={scaleUpVariants}
                className="relative w-full max-w-[400px] aspect-[4/5]"
              >
                {/* Back Main Image */}
                <div className="absolute inset-0 rounded-3xl overflow-hidden border border-gray-200 shadow-lg group/img1 z-10 transition-all duration-300">
                  <Image
                    src="/projects/amal-stars-showcase.webp"
                    alt="مشروع مار الفاخر"
                    fill
                    className="object-cover transition-transform duration-700 group-hover/img1:scale-105"
                  />
                </div>

                {/* Foreground Floating Image */}
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="absolute bottom-[-20px] start-[-24px] w-[55%] aspect-square rounded-2xl overflow-hidden border-4 border-white shadow-xl z-20 group/img2 cursor-pointer"
                >
                  <Image
                    src="/properties/villa.webp"
                    alt="تصميم الفلل المستقلة"
                    fill
                    className="object-cover transition-transform duration-500 group-hover/img2:scale-105"
                  />
                </motion.div>

                {/* Floating badge */}
                <div className="absolute top-[-16px] end-[-16px] w-20 h-20 bg-brand-black text-white border-2 border-white rounded-full p-2 z-25 flex flex-col items-center justify-center text-center shadow-lg pointer-events-none">
                  <span className="block text-[8px] font-bold text-gray-300 leading-none font-cairo">15 عامًا من</span>
                  <span className="block text-xs font-bold text-[#E6A821] font-cairo mt-0.5">الريادة</span>
                  <span className="block text-[7px] text-gray-400 font-mono tracking-widest mt-0.5">MAR KSA</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ----------------------------------------------------
         3. Vision & Mission Section
         ---------------------------------------------------- */}
      <section className="py-20 bg-white border-b border-gray-200/70 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch"
          >
            {/* Vision Card */}
            <motion.div
              variants={fadeUpVariants}
              whileHover={{ y: -6 }}
              className="p-8 sm:p-10 bg-[#F7F7F7] border border-gray-200 hover:border-[#E6A821] rounded-3xl shadow-sm flex flex-col justify-between relative overflow-hidden group cursor-default transition-all duration-300"
            >
              <div className="text-right space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#111315] border border-[#E6A821]/30 flex items-center justify-center text-[#E6A821] shadow-sm mb-4 transition-colors group-hover:bg-[#E6A821] group-hover:text-[#111315]">
                  <Eye className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-brand-black font-cairo">
                  رؤيتنا الاستراتيجية
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed font-cairo">
                  أن نتبوأ الصدارة كأكثر المطورين العقاريين ثقة وتفضيلاً في المملكة العربية السعودية، عبر صياغة مفاهيم سكنية مبتكرة ترتقي بجودة الحياة وتخلق قيمة استثمارية مستدامة تتجاوز توقعات عملائنا الأوفياء وتساهم في إعمار مستقبل حضري مشرف يخدم تطلعات رؤية 2030.
                </p>
              </div>

              <div className="pt-5 mt-6 border-t border-gray-200 flex items-center justify-between">
                <span className="text-xs font-bold text-[#E6A821] uppercase font-cairo">متوافقة مع رؤية 2030</span>
                <Trophy className="w-4 h-4 text-[#E6A821]" />
              </div>
            </motion.div>

            {/* Mission Card */}
            <motion.div
              variants={fadeUpVariants}
              whileHover={{ y: -6 }}
              className="p-8 sm:p-10 bg-[#F7F7F7] border border-gray-200 hover:border-[#E6A821] rounded-3xl shadow-sm flex flex-col justify-between relative overflow-hidden group cursor-default transition-all duration-300"
            >
              <div className="text-right space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#111315] border border-[#E6A821]/30 flex items-center justify-center text-[#E6A821] shadow-sm mb-4 transition-colors group-hover:bg-[#E6A821] group-hover:text-[#111315]">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-brand-black font-cairo">
                  رسالتنا التشغيلية
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed font-cairo">
                  الالتزام الصارم بأعلى مستويات الجودة الهندسية والمصداقية التشغيلية، وتهيئة بيئات سكنية واستثمارية فائقة الأمان والاستدامة، تلبي أسلوب الحياة العصري للنخبة وتسهم إيجاباً في تنمية القطاع العقاري والاقتصادي للوطن.
                </p>
              </div>

              <div className="pt-5 mt-6 border-t border-gray-200 flex items-center justify-between">
                <span className="text-xs font-bold text-[#E6A821] uppercase font-cairo">التزام هندسي لا مساومة فيه</span>
                <ShieldCheck className="w-4 h-4 text-[#E6A821]" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ----------------------------------------------------
         4. Interactive Legacy Timeline
         ---------------------------------------------------- */}
      <section className="py-20 relative z-10 bg-[#FAF8F5] border-b border-gray-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="flex flex-col items-center text-center mb-14">
            <span className="inline-flex items-center gap-2 py-1.5 px-4 text-xs sm:text-sm font-bold text-white bg-[#111315] border border-white/20 rounded-full uppercase tracking-wider mb-3.5 font-cairo shadow-sm backdrop-blur-md">
              <Milestone className="w-3.5 h-3.5 text-white shrink-0" />
              <span>رحلة التطوير العقاري</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-black leading-tight font-cairo">
              مسيرة مكللة بالإنجازات والنمو
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 max-w-xl mx-auto font-cairo">
              المراحل التاريخية التي صنعت فارقًا حقيقيًا في تاريخ التطوير السكني والاستثماري بالمملكة
            </p>
          </div>

          {/* Interactive Timeline Body */}
          <div className="relative mt-10">
            {/* Desktop Connecting Line */}
            <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gray-200 -translate-y-1/2 hidden lg:block z-0" />

            {/* Events Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative z-10 items-stretch">
              {timelineEvents.map((evt, idx) => {
                const isActive = activeTimelineYear === evt.year;
                return (
                  <motion.div
                    key={evt.year}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="relative flex flex-col items-center text-center group cursor-pointer h-full"
                    onMouseEnter={() => setActiveTimelineYear(evt.year)}
                    onMouseLeave={() => setActiveTimelineYear(null)}
                  >
                    {/* Glowing point bubble representing Year */}
                    <div className="relative z-10 mb-5 flex flex-col items-center">
                      <span className="absolute top-[-26px] px-2.5 py-0.5 text-[10px] font-bold bg-[#111315]/75 border border-white/20 text-white rounded-full font-cairo whitespace-nowrap backdrop-blur-md shadow-sm">
                        {evt.badge}
                      </span>
                      
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-sm ${
                        isActive 
                          ? 'bg-[#111315] border-[#E6A821] text-[#E6A821] scale-110 shadow-md' 
                          : 'bg-white border-gray-300 text-brand-black group-hover:border-[#E6A821] group-hover:text-[#E6A821]'
                      }`}>
                        <span className="text-xs font-bold font-mono">
                          {evt.year}
                        </span>
                      </div>
                    </div>

                    {/* Timeline card detailing each event */}
                    <div
                      className={`p-5 rounded-2xl border transition-all duration-300 text-right w-full min-h-[160px] flex flex-col justify-between flex-1 ${
                        isActive
                          ? 'bg-white border-[#E6A821] shadow-[0_12px_30px_rgba(0,0,0,0.06),0_0_0_1px_rgba(230,168,33,0.35)] text-brand-black'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-[#E6A821]/50'
                      }`}
                    >
                      <div>
                        <h3 className="text-sm font-bold font-cairo mb-2 text-brand-black">
                          {evt.title}
                        </h3>
                        <p className="text-xs text-gray-500 leading-relaxed font-cairo">
                          {evt.description}
                        </p>
                      </div>
                      
                      <div className="pt-3 border-t border-gray-100 mt-4 flex items-center justify-between">
                        <span className="text-[10px] font-bold font-mono text-gray-400">
                          MAR KSA
                        </span>
                        <Calendar className="w-3.5 h-3.5 text-[#E6A821]" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------
         5. Core Values Section
         ---------------------------------------------------- */}
      <section className="py-20 bg-white border-b border-gray-200/70 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="flex flex-col items-center text-center mb-14"
          >
            <motion.span variants={fadeUpVariants} className="inline-flex items-center gap-2 py-1.5 px-4 text-xs sm:text-sm font-bold text-white bg-[#111315] border border-white/20 rounded-full uppercase tracking-wider mb-3 font-cairo shadow-sm backdrop-blur-md">
              <Target className="w-3.5 h-3.5 text-white shrink-0" />
              <span>مبادئنا وقيمنا الراسخة</span>
            </motion.span>
            <h2 className="text-xl sm:text-3xl font-bold text-brand-black leading-tight font-cairo">
              الركائز الأساسية التي تقود مسيرتنا اليومية
            </h2>
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[#E6A821]/50"></div>
              <div className="w-2 h-2 rotate-45 border border-[#E6A821]/60 bg-white"></div>
              <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-[#E6A821]/50"></div>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch"
          >
            {values.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  variants={fadeUpVariants}
                  whileHover={{ y: -6 }}
                  className="group relative p-7 bg-[#F7F7F7] border border-gray-200 hover:border-[#E6A821] rounded-3xl shadow-sm transition-all duration-300 flex flex-col justify-between h-full cursor-pointer text-right hover:shadow-[0_16px_36px_rgba(0,0,0,0.06),0_0_0_1px_rgba(230,168,33,0.35)]"
                >
                  <div>
                    <div className="w-12 h-12 mb-5 rounded-2xl bg-[#111315] border border-[#E6A821]/30 flex items-center justify-center text-[#E6A821] group-hover:scale-105 transition-all duration-200 shadow-sm">
                      <Icon className="w-6 h-6" />
                    </div>

                    <h3 className="text-base font-bold text-brand-black mb-2 font-cairo">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed font-cairo">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ----------------------------------------------------
         6. Operational System & Partners Section
         ---------------------------------------------------- */}
      <section className="py-20 relative z-10 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center"
          >
            {/* Right Column: Text Information */}
            <div className="lg:col-span-6 space-y-5 text-right order-2 lg:order-1">
              <div className="block">
                <motion.span variants={fadeUpVariants} className="inline-flex items-center gap-2 py-1.5 px-4 text-xs sm:text-sm font-bold text-white bg-[#111315] border border-white/20 rounded-full font-cairo shadow-sm backdrop-blur-md">
                  <Workflow className="w-3.5 h-3.5 text-white shrink-0" />
                  <span>منظومة العمل المتكاملة</span>
                </motion.span>
              </div>
              
              <motion.h2
                variants={fadeUpVariants}
                className="text-xl sm:text-3xl font-bold text-brand-black leading-snug font-cairo"
              >
                التميز الإداري والبناء الممنهج <br />
                <span className="text-[#E6A821] font-bold">لضمان دقة وموثوقية التنفيذ</span>
              </motion.h2>
              
              <motion.p
                variants={fadeUpVariants}
                className="text-sm text-gray-600 leading-relaxed font-cairo"
              >
                في شركة مار العقارية، نتبع منهجية تشغيلية صارمة تبدأ من اختيار المواقع الاستراتيجية في كبرى مدن المملكة، مروراً بدراسات الجدوى المالية وتصاميم النمذجة المتقدمة، ووصولاً للتشييد والرقابة الميدانية اليومية. هذا الترتيب الممنهج يضمن بقاء مشاريعنا متوافقة تماماً مع الجداول الزمنية ومطابقة لأرقى متطلبات الجودة.
              </motion.p>

              <motion.p
                variants={fadeUpVariants}
                className="text-sm text-gray-600 leading-relaxed font-cairo"
              >
                تعتمد مسيرتنا أيضاً على شراكات استراتيجية مع كبرى الجهات والمنظومات الوطنية المعنية بالتطوير الإسكاني والتنظيمي، مما يضمن موثوقية كاملة لكافة صكوكنا العقارية ومنتجاتنا التمويلية المعتمدة لدى جميع البنوك السعودية.
              </motion.p>
              
              {/* CTA Button */}
              <motion.div variants={fadeUpVariants} className="pt-2">
                <button
                  type="button"
                  onClick={openInquiry}
                  className="btn-premium-gold py-3.5 px-8 text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 cursor-pointer rounded-full font-cairo transition-all duration-300"
                >
                  <span>احجز استشارتك المجانية الآن</span>
                  <ChevronLeft className="w-4 h-4 shrink-0" />
                </button>
              </motion.div>
            </div>

            {/* Left Column: Partner Badges / Credentials */}
            <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
              <motion.div
                variants={scaleUpVariants}
                className="p-8 sm:p-10 bg-white border border-gray-200 hover:border-[#E6A821]/40 transition-colors shadow-sm rounded-3xl text-right relative overflow-hidden group cursor-default"
              >
                <h3 className="font-bold text-brand-black text-base sm:text-lg font-cairo mb-2">
                  الجهات التمويلية والتنظيمية الشريكة
                </h3>
                
                <p className="text-xs text-gray-500 leading-relaxed font-cairo mb-6">
                  نعتز بشراكتنا واعتماد مشاريعنا لدى كبرى الجهات العقارية والمالية في المملكة لتوفير الحلول التمويلية الميسرة لكافة المستثمرين والمواطنين.
                </p>

                {/* Grid of Partners */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl flex flex-col items-center justify-center text-center shadow-xs hover:border-[#E6A821] transition-colors">
                    <span className="block text-xs font-bold text-brand-black font-cairo">الهيئة العامة للعقار</span>
                    <span className="block text-[8px] text-gray-400 font-mono tracking-widest mt-1">REGA LICENSED</span>
                  </div>
                  <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl flex flex-col items-center justify-center text-center shadow-xs hover:border-[#E6A821] transition-colors">
                    <span className="block text-xs font-bold text-brand-black font-cairo">برنامج وافي</span>
                    <span className="block text-[8px] text-gray-400 font-mono tracking-widest mt-1">WAFI APPROVED</span>
                  </div>
                  <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl flex flex-col items-center justify-center text-center shadow-xs hover:border-[#E6A821] transition-colors">
                    <span className="block text-xs font-bold text-brand-black font-cairo">سكني</span>
                    <span className="block text-[8px] text-gray-400 font-mono tracking-widest mt-1">SAKANI COMPATIBLE</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
