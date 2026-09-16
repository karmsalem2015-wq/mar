'use client';

import React from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { Compass } from 'lucide-react';
import { Property } from '@/lib/mockData';

interface CitiesSectionProps {
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  properties: Property[];
  isLoading?: boolean;
}

export default function CitiesSection({ selectedCity, setSelectedCity, properties, isLoading = false }: CitiesSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  const fadeUpVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0.05 : 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const getCityCount = (city: string) => {
    return properties.filter(p => p.location.city === city).length;
  };

  const CITIES = [
    {
      id: 'جدة',
      name: 'جدة',
      subtitle: 'عروس البحر الأحمر',
      image: '/cities/jeddah.webp',
      alt: 'واجهة مدينة جدة',
      count: getCityCount('جدة'),
      delay: 0,
    },
    {
      id: 'الرياض',
      name: 'الرياض',
      subtitle: 'عاصمة الحداثة والفرص',
      image: '/cities/riyadh.webp',
      alt: 'أبراج مدينة الرياض',
      count: getCityCount('الرياض'),
      delay: 0.1,
    },
    {
      id: 'مكه',
      name: 'مكة المكرمة',
      subtitle: 'قبلة العالم وبوابة الإيمان',
      image: '/cities/makkah.webp',
      alt: 'المسجد الحرام بمكة المكرمة',
      count: getCityCount('مكه'),
      delay: 0.2,
    },
  ];

  return (
    <div className="w-full bg-[#FAF8F5] pt-10 md:border-t md:border-gray-200/80 md:pt-36 lg:pt-40 pb-16">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12 } }
          }}
          className="flex flex-col items-center text-center mb-10 sm:mb-14"
        >
          <motion.div variants={fadeUpVariants} className="mb-3 sm:mb-4 pt-2">
            <span className="inline-flex items-center gap-2 py-1.5 px-4 text-xs sm:text-sm font-bold text-white bg-[#111315] border border-white/20 rounded-full font-cairo shadow-sm backdrop-blur-md">
              <Compass className="w-3.5 h-3.5 text-white shrink-0" />
              <span>وجهاتنا الرئيسية</span>
            </span>
          </motion.div>
          <motion.h2 variants={fadeUpVariants} className="text-2xl sm:text-4xl lg:text-[2.6rem] font-black text-brand-black mb-3.5 font-heading heading-engraved">
            اختر وجهتك المفضلة في المملكة
          </motion.h2>
          <motion.p variants={fadeUpVariants} className="text-sm sm:text-base text-gray-600 max-w-2xl sm:max-w-3xl mx-auto font-cairo leading-relaxed text-pretty">
            نساعدك على امتلاك منزل أحلامك في أرقى أحياء المدن الرئيسية
          </motion.p>
        </motion.div>

        {/* Responsive Grid: Single column on small mobile, 3 columns on sm+ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {CITIES.map((city) => {
            const isSelected = selectedCity === city.id;
            return (
              <motion.div
                key={city.id}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: city.delay }}
                className={`group relative h-44 sm:h-56 md:h-72 rounded-2xl overflow-hidden border cursor-pointer transition-all duration-500 shadow-sm ${isSelected
                    ? 'ring-2 ring-[#CAA048] border-[#CAA048] scale-[1.02] shadow-[0_12px_35px_rgba(202,160,72,0.25)] z-20'
                    : selectedCity !== 'all'
                      ? 'opacity-40 scale-95 border-gray-200'
                      : 'border-gray-200/90 hover:border-[#CAA048] hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)]'
                  }`}
                onClick={() => setSelectedCity(isSelected ? 'all' : city.id)}
              >
                {/* Selection Indicator Badge */}
                {isSelected && (
                  <span className="absolute top-3 end-3 z-30 bg-[#111315] text-[#CAA048] border border-[#CAA048] p-1.5 rounded-full shadow-lg flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-[#CAA048] stroke-[3.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}

                {/* Subtle Gold overlay on select */}
                <div className={`absolute inset-0 bg-[#CAA048]/10 transition-opacity duration-500 z-15 ${isSelected ? 'opacity-100' : 'opacity-0'}`}></div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent z-10"></div>
                <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                  <Image
                    src={city.image}
                    alt={city.alt}
                    fill
                    priority={city.id === 'جدة' || city.id === 'الرياض'}
                    loading={city.id === 'جدة' || city.id === 'الرياض' ? 'eager' : 'lazy'}
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>

                <div className="absolute bottom-4 start-4 sm:bottom-6 sm:start-6 z-20 text-start">
                  <h3 className="text-base sm:text-lg md:text-xl font-extrabold text-white mb-1 font-heading">{city.name}</h3>
                  <p className="text-xs text-[#DFC07A] font-semibold uppercase tracking-wider font-cairo">{city.subtitle}</p>
                  {isLoading ? (
                    <span className="inline-block h-3.5 w-16 rounded skeleton-luxury mt-1.5" />
                  ) : (
                    <p className="text-xs text-white/80 font-bold mt-1.5 font-cairo">
                      {city.count} عقار متاح
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
