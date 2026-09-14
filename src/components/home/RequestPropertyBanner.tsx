'use client';

import React from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { KeyRound } from 'lucide-react';

interface RequestPropertyBannerProps {
  onOpenInquiry: () => void;
}

export default function RequestPropertyBanner({ onOpenInquiry }: RequestPropertyBannerProps) {
  const shouldReduceMotion = useReducedMotion();

  const fadeUpVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0.05 : 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section className="relative w-full md:h-[70vh] min-h-[580px] overflow-hidden py-20 md:py-0 bg-white flex items-center">
      {/* Sleek Architectural Deep Black Skewed Banner (matching post-scroll header) */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-[#050505] -skew-y-2 origin-top-right z-0 border-y border-[#CAA048]/30 shadow-[0_25px_60px_rgba(0,0,0,0.65)]" />
      
      {/* Warm Ambient Gold Radial Glows for high visual depth (no navy or blue) */}
      <div className="absolute top-1/2 end-1/4 w-[550px] h-[450px] bg-[#E6A821]/12 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none z-0" />
      <div className="absolute bottom-0 start-12 w-[320px] h-[320px] bg-[#CAA048]/10 rounded-full blur-[100px] pointer-events-none z-0" />

      <div className="relative w-full max-w-6xl mx-auto px-6 sm:px-8 z-10 flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16 lg:gap-16">

        {/* Text Column */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12 } }
          }}
          className="flex-[0.5] w-full md:w-[38%] text-center md:text-start space-y-6 z-10 flex flex-col items-center md:items-start"
        >
          {/* Section Tag with KeyRound icon (No star) */}
          <motion.span
            variants={fadeUpVariants}
            className="inline-flex items-center gap-2 py-1.5 px-4 text-xs sm:text-sm font-bold text-white bg-white/10 border border-white/20 rounded-full font-cairo shadow-sm backdrop-blur-md"
          >
            <KeyRound className="w-3.5 h-3.5 text-[#DFC07A] shrink-0" />
            <span style={{ color: '#FFFFFF' }} className="text-white font-bold">خدمة اطلب عقارك المتميزة</span>
          </motion.span>

          {/* Main Title in Pure High-Contrast White */}
          <motion.h2
            variants={fadeUpVariants}
            style={{ color: '#FFFFFF' }}
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-2 font-heading leading-tight"
          >
            اطلب عقارك
          </motion.h2>

          {/* Calligraphy Brush stroke style text in authentic Alexandria font */}
          <motion.div
            initial={{ scale: shouldReduceMotion ? 1 : 1.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{
              type: "spring",
              stiffness: 35,
              damping: 16,
              delay: 0.1
            }}
            className="relative inline-block"
          >
            {/* Architectural Gold Horizon Ribbon */}
            <div className="absolute top-[52%] -translate-y-1/2 start-[-20px] end-[-25px] h-6 sm:h-7 md:h-8.5 bg-gradient-to-r from-[#CAA048] via-[#DFC07A] to-[#CAA048] border-y border-white/30 z-0 rounded-[2px] shadow-sm" />

            {/* Layer 1: Radiant Outline in Gold */}
            <span className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white relative z-10 font-heading [-webkit-text-stroke:5px_#CAA048] sm:[-webkit-text-stroke:7px_#CAA048] md:[-webkit-text-stroke:8px_#CAA048] [text-shadow:0_8px_20px_rgba(202,160,72,0.45)] select-none">
              بخطوة
            </span>

            {/* Layer 2: Gold Accent Stroke */}
            <span className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-[#DFC07A] absolute inset-0 z-[15] font-heading [-webkit-text-stroke:2px_#B88E3E] select-none pointer-events-none">
              بخطوة
            </span>

            {/* Layer 3: Pure Crisp White Top Letterform */}
            <span className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white absolute inset-0 z-20 font-heading pointer-events-none select-none drop-shadow-[0_4px_12px_rgba(202,160,72,0.5)]">
              بخطوة
            </span>
          </motion.div>

          {/* High-Contrast Crisp Description (Pure light text on dark background) */}
          <motion.p
            variants={fadeUpVariants}
            style={{ color: '#F3F4F6' }}
            className="text-xs sm:text-sm text-white/90 max-w-md leading-relaxed mt-4 font-cairo"
          >
            لا داعي للبحث الطويل والمجهد. حدد مواصفات منزلك أو استثمارك العقاري وسيقوم مستشارونا الماليون والعقاريون بتوفير أفضل الفرص المتوافقة مع تطلعاتك.
          </motion.p>

          {/* Primary CTA Button */}
          <motion.div variants={fadeUpVariants} className="pt-4">
            <button
              type="button"
              onClick={onOpenInquiry}
              className="btn-premium-gold py-3.5 px-12 text-sm font-bold rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer min-h-[46px] font-cairo"
            >
              اطلب الآن
            </button>
          </motion.div>
        </motion.div>

        {/* Image Column */}
        <motion.div
          initial={{ scale: shouldReduceMotion ? 1 : 1.4, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{
            type: "spring",
            stiffness: 28,
            damping: 18,
            delay: 0.3
          }}
          className="flex-none md:flex-[1.3] w-full md:w-[62%] h-[280px] sm:h-[380px] md:h-[560px] lg:h-[640px] relative z-10 group bg-transparent"
        >
          <Image
            src="/projects/villa_3d_render.webp"
            alt="تصميم ثلاثي الأبعاد لفيلا فخمة"
            fill
            sizes="(max-width: 768px) 100vw, 60vw"
            className="object-contain transition-transform duration-[6000ms] ease-luxury group-hover:translate-y-[-10px] group-hover:scale-105"
          />
        </motion.div>
      </div>
    </section>
  );
}
