'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { motion, useReducedMotion } from 'framer-motion';
import { ScanEye } from 'lucide-react';

const PanoramaViewer = dynamic(() => import('@/components/ui/PanoramaViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] sm:h-[450px] bg-bg-midnight/20 animate-pulse rounded-2xl flex items-center justify-center text-text-muted text-xs">
      جاري تحميل العرض البانورامي...
    </div>
  )
});

interface VirtualTourSectionProps {
  onOpenInquiry: () => void;
}

export default function VirtualTourSection({ onOpenInquiry }: VirtualTourSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = React.useRef<HTMLElement>(null);
  const [shouldLoadViewer, setShouldLoadViewer] = React.useState(false);

  React.useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setShouldLoadViewer(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoadViewer(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px 0px', threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const fadeUpVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0.05 : 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden py-20 sm:py-24 bg-white border-y border-gray-200/80">
      <div className="absolute top-1/2 start-0 -translate-y-1/2 w-[500px] h-[500px] bg-[#E6A821]/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Info Details */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } }
          }}
          className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-start space-y-4 lg:space-y-6 z-10"
        >
          <motion.div variants={fadeUpVariants} className="mb-1">
            <span className="inline-flex items-center gap-2 py-1.5 px-4 text-xs sm:text-sm font-bold text-white bg-[#111315] border border-white/20 rounded-full font-cairo shadow-sm backdrop-blur-md">
              <ScanEye className="w-3.5 h-3.5 text-white shrink-0" />
              <span>تجربة غامرة فريدة</span>
            </span>
          </motion.div>
          <motion.h2 variants={fadeUpVariants} className="text-2xl sm:text-4xl lg:text-[2.5rem] font-black text-brand-black font-heading heading-engraved">
            جولة افتراضية تفاعلية 360°
          </motion.h2>
          <motion.p variants={fadeUpVariants} className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-md font-cairo">
            عش تجربة التواجد الفعلي داخل أرقى مشاريعنا السكنية. اسحب الصورة البانورامية للمشاهدة حولك واكتشف التفاصيل الهندسية والتشطيبات الفاخرة للغرف المزدوجة والصالات الواسعة.
          </motion.p>
          <div className="flex flex-wrap gap-4 pt-2">
            <button
              type="button"
              className="py-3.5 px-8 text-xs sm:text-sm font-bold btn-premium-gold min-w-[200px] min-h-[44px] font-cairo shadow-sm cursor-pointer rounded-full"
              onClick={onOpenInquiry}
            >
              احجز جولة حضورية خاصة
            </button>
          </div>
        </motion.div>

        {/* Interactive Panorama Canvas - Lazy loaded when approaching viewport */}
        <div className="lg:col-span-8 w-full z-10 rounded-3xl overflow-hidden border border-gray-200 shadow-[0_15px_45px_rgba(0,0,0,0.08)] bg-gray-50 p-1.5 hover:border-[#E6A821] hover:shadow-[0_15px_45px_rgba(0,0,0,0.08),0_0_0_1px_rgba(230,168,33,0.3)] transition-all duration-500">
          {shouldLoadViewer ? (
            <PanoramaViewer
              imageSrc="/projects/panorama-penthouse.webp"
              heightClass="h-[400px] sm:h-[450px]"
            />
          ) : (
            <div className="w-full h-[400px] sm:h-[450px] bg-bg-midnight/10 animate-pulse rounded-2xl flex items-center justify-center text-text-muted text-xs font-cairo">
              جاري تجهيز العرض البانورامي 360°...
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
