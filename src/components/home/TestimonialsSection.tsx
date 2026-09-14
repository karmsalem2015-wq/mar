'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Star, Quote, ChevronRight, ChevronLeft } from 'lucide-react';

const TESTIMONIALS = [
  {
    id: 1,
    quote: "تجربة ممتازة في التملك مع شركة مار العقارية. الشقة واسعة والتشطيبات الترا سوبر لوكس والموقف الخاص مريح جداً.",
    author: "أبو محمد",
    project: "جدة، حي السلامة - مشروع أمل ستارز",
    initials: "أ م",
    rating: 5
  },
  {
    id: 2,
    quote: "برنامج إتمام التمويلي سهل علي الكثير من العقبات في حساب القسط وحساب الدفعة الأولى، التوثيق كان سريع جداً.",
    author: "سالم العتيبي",
    project: "الرياض، حي الملقا - مستثمر",
    initials: "س ع",
    rating: 5
  },
  {
    id: 3,
    quote: "فيلا مخطط السعيد رائعة ومطابقة تماماً للمواصفات المعروضة في الموقع. التعامل راقي والضمانات شاملة.",
    author: "خالد الحربي",
    project: "جدة، مخطط السعيد - مالك فيلا",
    initials: "خ خ",
    rating: 5
  },
  {
    id: 4,
    quote: "دقة في المواعيد وجودة في التنفيذ تفوق التوقعات. سكنت في شقتنا الجديدة منذ 6 أشهر وكل شيء ممتاز والخدمات متكاملة.",
    author: "عبد الرحمن السديس",
    project: "مكة المكرمة، حي النسيم - مالك شقة",
    initials: "ع س",
    rating: 5
  },
  {
    id: 5,
    quote: "كمطور عقاري أقدر التفاصيل الهندسية الممتازة التي تنفذها شركة مار العقارية. تشطيبات راقية واستغلال ذكي للمساحات.",
    author: "م. سلطان المقاطي",
    project: "جدة، حي النعيم - مستثمر عقاري",
    initials: "س م",
    rating: 5
  }
];

export default function TestimonialsSection() {
  const shouldReduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isTestimonialHovered, setIsTestimonialHovered] = useState(false);
  const minSwipeDistance = 50;

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { rootMargin: '100px 0px', threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleNext = () => {
    setDirection(1);
    setCurrentTestimonialIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentTestimonialIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const goToIndex = (targetIndex: number) => {
    if (targetIndex === currentTestimonialIndex) return;
    setDirection(targetIndex > currentTestimonialIndex ? 1 : -1);
    setCurrentTestimonialIndex(targetIndex);
  };

  useEffect(() => {
    if (isTestimonialHovered || !isInView) return;
    const timer = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(timer);
  }, [isTestimonialHovered, isInView]);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  const fadeUpVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0.05 : 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const cardVariants = {
    enter: (dir: number) => ({
      x: shouldReduceMotion ? 0 : dir > 0 ? -32 : 32,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 350, damping: 30 },
        opacity: { duration: 0.35 },
        scale: { duration: 0.35 },
      },
    },
    exit: (dir: number) => ({
      x: shouldReduceMotion ? 0 : dir > 0 ? 32 : -32,
      opacity: 0,
      scale: 0.98,
      transition: {
        x: { type: 'spring', stiffness: 350, damping: 30 },
        opacity: { duration: 0.25 },
        scale: { duration: 0.25 },
      },
    }),
  };

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden py-20 sm:py-24 bg-[#F7F7F7] border-y border-gray-200/80 z-10">
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
              <Quote className="w-3.5 h-3.5 text-white shrink-0" />
              <span>آراء عملائنا</span>
            </span>
          </motion.div>
          <motion.h2 variants={fadeUpVariants} className="text-2xl sm:text-4xl lg:text-[2.5rem] font-black text-brand-black leading-tight font-heading heading-engraved">
            تجارب حقيقية لشركاء النجاح
          </motion.h2>
        </motion.div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-12">
          <motion.div
            whileHover={shouldReduceMotion ? {} : { scale: 1.008, y: -3 }}
            transition={{ type: "spring", stiffness: 380, damping: 24 }}
            className="relative bg-white border border-gray-200 rounded-[2.5rem] p-8 sm:p-12 md:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08),0_0_0_1px_rgba(202,160,72,0.3)] hover:border-[#CAA048] transition-all duration-500 overflow-hidden text-center min-h-[380px] sm:min-h-[340px] flex flex-col justify-between"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onMouseEnter={() => setIsTestimonialHovered(true)}
            onMouseLeave={() => setIsTestimonialHovered(false)}
          >
            <div className="absolute top-0 start-0 end-0 h-1.5 bg-gradient-to-r from-transparent via-[#CAA048] to-transparent rounded-t-full"></div>

            <div className="absolute top-4 end-8 text-[#CAA048]/15 pointer-events-none select-none">
              <Quote className="w-24 h-24 rotate-180" />
            </div>

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentTestimonialIndex}
                custom={direction}
                variants={cardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-col items-center justify-center flex-1"
              >
                {/* 1. Author Avatar & Name (Top) */}
                <div className="flex flex-col items-center gap-2.5 mb-4">
                  <div className="relative">
                    <div className="relative w-15 h-15 rounded-full bg-[#111315] border-2 border-[#CAA048]/50 flex items-center justify-center font-bold text-[#DFC07A] text-base shadow-md font-cairo">
                      {TESTIMONIALS[currentTestimonialIndex].initials}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-brand-black font-heading">
                      {TESTIMONIALS[currentTestimonialIndex].author}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5 font-cairo">
                      {TESTIMONIALS[currentTestimonialIndex].project}
                    </p>
                  </div>
                </div>

                {/* 2. Rating Stars (Middle) */}
                <div className="flex gap-1.5 text-[#CAA048] mb-5">
                  {[...Array(TESTIMONIALS[currentTestimonialIndex].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>

                {/* 3. Quote Text (Bottom) */}
                <p className="text-base sm:text-lg md:text-xl text-brand-black leading-relaxed font-bold max-w-2xl px-2 font-cairo">
                  &ldquo;{TESTIMONIALS[currentTestimonialIndex].quote}&rdquo;
                </p>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Navigation Arrows */}
          <div className="flex justify-center md:block mt-8 md:mt-0">
            <button
              type="button"
              onClick={handlePrev}
              className="md:absolute md:top-1/2 md:-end-6 md:-translate-y-1/2 mx-2 md:mx-0 w-12 h-12 rounded-full bg-white border border-gray-200 hover:border-[#CAA048] text-gray-700 hover:text-[#CAA048] hover:bg-[#111315] flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer z-10 min-w-[44px] min-h-[44px]"
              aria-label="التقييم السابق"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="md:absolute md:top-1/2 md:-start-6 md:-translate-y-1/2 mx-2 md:mx-0 w-12 h-12 rounded-full bg-white border border-gray-200 hover:border-[#CAA048] text-gray-700 hover:text-[#CAA048] hover:bg-[#111315] flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer z-10 min-w-[44px] min-h-[44px]"
              aria-label="التقييم التالي"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Luxury Floating Glass Pagination Dock */}
          <div className="flex items-center justify-center mt-10">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-gray-200/90 bg-white/90 px-4 py-2 shadow-[0_4px_25px_rgba(0,0,0,0.05)] backdrop-blur-md">
              {TESTIMONIALS.map((t, idx) => {
                const isActive = idx === currentTestimonialIndex;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => goToIndex(idx)}
                    className="group relative flex h-6 items-center justify-center cursor-pointer p-1 focus:outline-none"
                    aria-label={`التقييم ${idx + 1}`}
                  >
                    <motion.span
                      layout
                      transition={{
                        type: 'spring',
                        stiffness: 420,
                        damping: 28,
                      }}
                      className={`block rounded-full transition-colors duration-300 ${isActive
                          ? 'h-2.5 w-8 bg-[#CAA048] shadow-[0_2px_10px_rgba(202,160,72,0.45)]'
                          : 'size-2.5 bg-gray-300 group-hover:bg-gray-400'
                        }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
