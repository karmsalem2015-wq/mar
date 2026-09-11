'use client';

import React from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { Handshake } from 'lucide-react';

const PARTNERS = [
  { id: 1, src: '/1.png', alt: 'شركة الحالي للتطوير العقاري والمقاولات' },
  { id: 2, src: '/2.png', alt: 'دهانات جوتن' },
  { id: 3, src: '/3.png', alt: 'شركة سابك' },
  { id: 4, src: '/4.png', alt: 'مصنع نخبة مار للبلك' },
];

export default function PartnersMarquee() {
  const shouldReduceMotion = useReducedMotion();

  const fadeUpVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0.05 : 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const MARQUEE_ITEMS = [...PARTNERS, ...PARTNERS, ...PARTNERS, ...PARTNERS];

  return (
    <section className="relative w-full overflow-hidden py-20 bg-white border-b border-gray-200/70 z-10">
      <div className="relative w-full mx-auto z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } }
          }}
          className="flex flex-col items-center text-center mb-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <motion.span variants={fadeUpVariants} className="inline-flex items-center gap-2 py-1.5 px-4 text-xs sm:text-sm font-bold text-white bg-[#111315] border border-white/20 rounded-full font-cairo shadow-sm backdrop-blur-md mb-3.5">
            <Handshake className="w-3.5 h-3.5 text-white shrink-0" />
            <span>شركاء النجاح</span>
          </motion.span>
          <motion.h2 variants={fadeUpVariants} className="text-xl sm:text-3xl font-bold leading-tight font-heading heading-engraved">
            نعتز بثقتهم لبناء مستقبل واعد
          </motion.h2>

          <motion.div variants={fadeUpVariants} className="mt-4 flex items-center justify-center gap-2">
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-[#B28932]/50"></div>
            <div className="w-2.5 h-2.5 rotate-45 border border-[#B28932]/60 bg-white shadow-xs"></div>
            <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-[#B28932]/50"></div>
          </motion.div>
        </motion.div>

        <div className="w-full max-w-[1200px] mx-auto relative overflow-hidden py-2 select-none" dir="ltr">

          <div className="flex flex-row flex-nowrap gap-4 sm:gap-6 w-max animate-marquee-ltr hover:[animation-play-state:paused] cursor-pointer">
            {MARQUEE_ITEMS.map((partner, idx) => (
              <div
                key={`${partner.id}-marquee-${idx}`}
                dir="rtl"
                className="group relative flex items-center justify-center p-4 bg-gray-50/70 border border-gray-200/80 hover:border-[#CAA048] rounded-2xl w-[150px] sm:w-[180px] md:w-[220px] h-[90px] sm:h-[110px] md:h-[130px] transition-all duration-300 cursor-pointer overflow-hidden shrink-0 shadow-sm hover:shadow-md hover:-translate-y-1"
              >
                <div className="relative w-full h-full bg-white rounded-xl p-3 flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-transform duration-300 group-hover:scale-105">
                  <Image
                    src={partner.src}
                    alt={partner.alt}
                    width={120}
                    height={60}
                    className="h-auto w-auto max-h-full max-w-full object-contain"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
