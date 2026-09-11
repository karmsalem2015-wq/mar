'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Award, ShieldCheck, Clock, HelpCircle } from 'lucide-react';

export default function WhyUsSection() {
  const shouldReduceMotion = useReducedMotion();

  const fadeUpVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0.05 : 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const CARDS = [
    {
      icon: Award,
      title: 'جودة بناء وتشييد ممتازة',
      desc: 'نلتزم بمعايير الكود السعودي للبناء مع توفير ضمانات إنشائية شاملة على الهياكل والسباكة والكهرباء.',
    },
    {
      icon: ShieldCheck,
      title: 'الشفافية المطلقة',
      desc: 'عقود قانونية موثقة وخالية من أي رسوم خفية أو بنود غير معلنة. الثقة هي الأساس بيننا وبين عملائنا.',
    },
    {
      icon: Clock,
      title: 'خبرة 15 عاماً',
      desc: 'نفخر بتسليم أكثر من 25 مشروعاً ناجحاً وأكثر من 500 وحدة سكنية لعائلات تنعم بالاستقرار الآن.',
    },
    {
      icon: HelpCircle,
      title: 'دعم ما بعد البيع',
      desc: 'فريق صيانة ودعم فني متاح لتلبية احتياجاتك وإصلاح الأعطال الطارئة حتى بعد تسليم المفاتيح.',
    },
  ];

  return (
    <section id="about-section" className="relative w-full overflow-hidden py-20 sm:py-24 bg-white border-y border-gray-200/80 z-10">
      <div className="absolute top-0 start-1/4 w-[400px] h-[400px] bg-[#CAA048]/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } }
          }}
          className="flex flex-col items-center text-center mb-12 sm:mb-16"
        >
          <motion.div variants={fadeUpVariants} className="mb-3.5">
            <span className="inline-flex items-center gap-2 py-1.5 px-4 text-xs sm:text-sm font-bold text-white bg-[#111315] border border-white/20 rounded-full font-cairo shadow-sm backdrop-blur-md">
              <Award className="w-3.5 h-3.5 text-white shrink-0" />
              <span>سر تميزنا</span>
            </span>
          </motion.div>
          <motion.h2 variants={fadeUpVariants} className="text-2xl sm:text-4xl lg:text-[2.5rem] font-black text-brand-black leading-tight font-heading heading-engraved">
            لماذا يختار العملاء شركة مار العقارية؟
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            visible: { transition: { staggerChildren: 0.1 } }
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center"
        >
          {CARDS.map((card, idx) => {
            const IconComp = card.icon;
            return (
              <motion.div
                key={idx}
                variants={fadeUpVariants}
                whileHover={shouldReduceMotion ? {} : { scale: 1.03, y: -6 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="group relative p-8 bg-[#F7F7F7] border border-gray-200/80 hover:border-[#CAA048] rounded-3xl shadow-sm hover:shadow-[0_20px_45px_rgba(0,0,0,0.08),0_0_0_1px_rgba(202,160,72,0.3)] transition-all duration-300 flex flex-col justify-between h-full cursor-pointer"
              >
                <div className="absolute top-0 start-0 end-0 h-1 bg-gradient-to-r from-transparent via-[#CAA048] to-transparent rounded-t-full opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#111315] border border-[#CAA048]/30 flex items-center justify-center text-[#CAA048] shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <IconComp className="w-7 h-7 text-[#CAA048]" />
                </div>

                <h3 className="text-base sm:text-lg font-bold text-brand-black group-hover:text-[#CAA048] mb-3 transition-colors duration-200 font-heading">{card.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-cairo">
                  {card.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
