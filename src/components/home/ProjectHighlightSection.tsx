'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { MapPin, Download, ArrowLeft, Building, Landmark } from 'lucide-react';
import { Project } from '@/lib/mockData';
import RTLContinuousCarousel from '@/components/ui/RTLContinuousCarousel';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(price) + ' ر.س';
};

function FeaturedProjectCard({ project }: { project: Project }) {
  return (
    <div className="group relative w-full bg-white rounded-3xl overflow-hidden border border-gray-200/90 shadow-[0_12px_40px_rgba(0,0,0,0.06)] hover:border-[#CAA048] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08),0_0_0_1px_rgba(202,160,72,0.4)] transition-all duration-500 mb-12">
      <div className="absolute top-0 start-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#CAA048] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20"></div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        <div className="order-1 lg:order-2 lg:col-span-7 relative h-64 sm:h-80 md:h-[400px] lg:h-auto min-h-[260px] lg:min-h-[440px] overflow-hidden bg-gray-100">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>

          <div className="absolute top-6 end-6 z-20 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-[#111315] border border-[#CAA048] rounded-full shadow-md uppercase font-cairo">
              <span className="size-1.5 rounded-full bg-[#CAA048]" />
              مشروع مميز
            </span>
            <span className="px-4 py-1.5 text-xs font-bold text-white bg-black/75 backdrop-blur-md rounded-full font-cairo">
              {project.status === 'completed' ? 'مشروع مكتمل' : project.status === 'under_construction' ? 'تحت الإنشاء' : 'قريباً'}
            </span>
          </div>

          <Image
            src={project.media.hero || "/projects/amal-stars-showcase.webp"}
            alt={project.name}
            fill
            loading="lazy"
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover transition-transform duration-[8000ms] ease-luxury group-hover:scale-108"
          />
        </div>

        <div className="order-2 lg:order-1 lg:col-span-5 p-6 sm:p-8 md:p-10 flex flex-col justify-between text-start">
          <div>
            <div className="flex items-center gap-1.5 mb-3 text-xs font-bold text-[#CAA048] font-cairo">
              <span className="w-2 h-2 rounded-full bg-[#CAA048]"></span>
              <span>{project.tagline}</span>
            </div>

            <Link href={`/projects/${project.slug}`}>
              <h3 className="text-xl sm:text-2xl font-extrabold text-brand-black mb-4 leading-snug font-heading group-hover:text-[#CAA048] transition-colors duration-300">
                {project.name}
              </h3>
            </Link>

            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 mb-5 font-cairo">
              <MapPin className="w-4 h-4 text-[#CAA048] shrink-0" />
              <span>{project.location.district}، {project.location.city}</span>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6 line-clamp-4 font-cairo">
              {project.description}
            </p>

            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-200/80 mb-6 text-xs text-gray-700">
              <div>
                <span className="block text-gray-500 mb-1.5 text-xs uppercase tracking-wider font-cairo">تاريخ التسليم</span>
                <span className="font-bold text-brand-black text-xs sm:text-sm font-cairo">{project.specs.completionDate}</span>
              </div>
              <div>
                <span className="block text-gray-500 mb-1.5 text-xs uppercase tracking-wider font-cairo">إجمالي الوحدات</span>
                <span className="font-bold text-brand-black font-cairo text-xs sm:text-sm">{project.specs.totalUnits} وحدة</span>
              </div>
              <div>
                <span className="block text-gray-500 mb-1.5 text-xs uppercase tracking-wider font-cairo">نطاق الأسعار</span>
                <span className="font-bold text-brand-black font-cairo text-xs sm:text-sm">تبدأ من {formatPrice(project.priceRange.min)}</span>
              </div>
              <div>
                <span className="block text-gray-500 mb-1.5 text-xs uppercase tracking-wider font-cairo">الوحدات المتاحة</span>
                <span className="font-bold text-emerald-600 font-cairo text-xs sm:text-sm">{project.specs.availableUnits} وحدة</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full">
            <a
              href={project.brochureUrl || `/brochure-${project.slug}.pdf`}
              target={project.brochureUrl ? "_blank" : undefined}
              rel={project.brochureUrl ? "noopener noreferrer" : undefined}
              download={!project.brochureUrl}
              className="w-full sm:flex-1 py-3.5 px-6 text-xs sm:text-sm font-bold btn-premium-gold flex items-center justify-center gap-2 cursor-pointer font-cairo whitespace-nowrap min-h-[44px] rounded-full shadow-sm"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>تحميل البروفايل (PDF)</span>
            </a>
            <Link
              href={`/projects/${project.slug}`}
              className="w-full sm:flex-1 py-3.5 px-6 text-xs sm:text-sm font-bold btn-mar-outline flex items-center justify-center text-center gap-2 cursor-pointer font-cairo whitespace-nowrap min-h-[44px] rounded-full"
            >
              <span>استعرض المشروع</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function SimplifiedProjectCard({ project }: { project: Project }) {
  return (
    <div className="group relative flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-gray-200/90 transition-all duration-500 hover:border-[#CAA048] hover:shadow-xl hover:-translate-y-1 w-[280px] sm:w-[285px] md:w-[310px] shrink-0">
      <div className="absolute top-0 start-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#CAA048] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"></div>

      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10"></div>
        <Image
          src={project.media.hero || "/projects/amal-stars-showcase.webp"}
          alt={project.name}
          fill
          sizes="(max-width: 768px) 200px, 290px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 end-3 z-20">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-[#111315] border border-[#CAA048]/60 rounded-md font-cairo shadow-sm">
            <span className="size-1 rounded-full bg-[#CAA048]" />
            {project.status === 'completed' ? 'مكتمل' : project.status === 'under_construction' ? 'تحت الإنشاء' : 'قريباً'}
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5 flex flex-col flex-1 text-start">
        <Link href={`/projects/${project.slug}`}>
          <h4 className="text-xs sm:text-sm font-bold text-brand-black line-clamp-1 mb-2 group-hover:text-[#CAA048] transition-colors duration-300 font-heading">
            {project.name}
          </h4>
        </Link>

        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3 font-cairo">
          <MapPin className="w-3.5 h-3.5 text-[#CAA048] shrink-0" />
          <span className="line-clamp-1">{project.location.district}، {project.location.city}</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-600 border-t border-gray-100 pt-2 mb-4 font-cairo">
          <span className="font-semibold">{project.specs.totalUnits} وحدة</span>
          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
          <span className="font-cairo font-medium">{project.specs.completionDate}</span>
        </div>

        <div className="mt-auto pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
          <div>
            <p className="text-xs text-gray-500 font-cairo">يبدأ من</p>
            <p className="text-xs sm:text-sm font-black text-brand-black font-cairo">
              {formatPrice(project.priceRange.min)}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href={project.brochureUrl || `/brochure-${project.slug}.pdf`}
              target={project.brochureUrl ? "_blank" : undefined}
              rel={project.brochureUrl ? "noopener noreferrer" : undefined}
              download={!project.brochureUrl}
              title="تحميل البروفايل PDF"
              aria-label="تحميل البروفايل PDF"
              className="p-2.5 rounded-xl bg-gray-50 hover:bg-[#111315] hover:text-[#CAA048] hover:border-[#CAA048] border border-gray-200 text-gray-700 transition-all cursor-pointer min-w-[42px] min-h-[42px] flex items-center justify-center"
            >
              <Download className="w-4 h-4" />
            </a>
            <Link
              href={`/projects/${project.slug}`}
              className="py-2 px-4 text-xs font-bold btn-premium-gold flex items-center gap-1 cursor-pointer font-cairo text-center min-h-[42px]"
            >
              <span>استعرض</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProjectHighlightSectionProps {
  projects: Project[];
  isLoading?: boolean;
}

export default function ProjectHighlightSection({ projects, isLoading = false }: ProjectHighlightSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const [projectsViewMode, setProjectsViewMode] = useState<'grid' | 'table'>('grid');
  const projectsTableRef = useRef<HTMLDivElement>(null);

  const fadeUpVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0.05 : 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const featuredProject = useMemo(() => {
    return projects.find(p => p.featured) || projects[0];
  }, [projects]);

  const carouselProjects = useMemo(() => {
    if (!featuredProject) return [];
    return projects.filter(p => p.id !== featuredProject.id);
  }, [projects, featuredProject]);

  useEffect(() => {
    if (projectsViewMode === 'table' && projectsTableRef.current) {
      const el = projectsTableRef.current;
      el.scrollLeft = el.scrollWidth;
      const timer = setTimeout(() => {
        el.scrollLeft = el.scrollWidth;
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [projectsViewMode]);

  return (
    <section id="projects-section" className="bg-[#F7F7F7] border-y border-gray-200/80 py-20 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
          <motion.div variants={fadeUpVariants} className="mb-3">
            <span className="inline-flex items-center gap-2 py-1.5 px-4 text-xs sm:text-sm font-bold text-white bg-[#111315] border border-white/20 rounded-full font-cairo shadow-sm backdrop-blur-md">
              <Landmark className="w-3.5 h-3.5 text-white shrink-0" />
              <span>مشاريعنا العقارية الكبرى</span>
            </span>
          </motion.div>
          <motion.h2 variants={fadeUpVariants} className="text-2xl sm:text-4xl lg:text-[2.5rem] font-black text-brand-black mt-1 font-heading heading-engraved">
            نسعى لإيجاد مجتمعات سكنية متكاملة
          </motion.h2>

          <div className="flex justify-center mt-6">
            <div className="flex items-center bg-gray-200/70 border border-gray-300 rounded-xl p-1 shrink-0">
              <button
                type="button"
                onClick={() => setProjectsViewMode('grid')}
                className={`px-4 py-2 rounded-lg transition-all duration-300 cursor-pointer text-xs sm:text-sm font-bold font-cairo min-h-[40px] flex items-center ${projectsViewMode === 'grid'
                    ? 'bg-[#111315] text-white border border-[#CAA048]/60 shadow-sm'
                    : 'text-gray-700 hover:text-brand-black'
                  }`}
              >
                كروت العرض
              </button>
              <button
                type="button"
                onClick={() => setProjectsViewMode('table')}
                className={`px-4 py-2 rounded-lg transition-all duration-300 cursor-pointer text-xs sm:text-sm font-bold font-cairo min-h-[40px] flex items-center ${projectsViewMode === 'table'
                    ? 'bg-[#111315] text-white border border-[#CAA048]/60 shadow-sm'
                    : 'text-gray-700 hover:text-brand-black'
                  }`}
              >
                جدول التفاصيل
              </button>
            </div>
          </div>
        </motion.div>

        {projectsViewMode === 'table' ? (
          <div ref={projectsTableRef} className="custom-table-wrapper w-full max-h-[60vh] overflow-auto rounded-2xl border border-gray-200 bg-white shadow-xl scrollbar-thin mb-12" dir="rtl">
            <table className="w-full min-w-[950px] text-start text-xs sm:text-sm table-auto border-collapse" dir="rtl">
              <thead className="sticky top-0 z-20 shadow-sm bg-gray-50">
                <tr className="border-b border-gray-200 text-brand-black font-cairo">
                  <th className="py-4 px-5 font-bold whitespace-nowrap border-x border-gray-200/80 text-start bg-gray-50">الصورة</th>
                  <th className="py-4 px-5 font-bold whitespace-nowrap border-x border-gray-200/80 text-start bg-gray-50">اسم المشروع</th>
                  <th className="py-4 px-5 font-bold whitespace-nowrap border-x border-gray-200/80 text-start bg-gray-50">الموقع</th>
                  <th className="py-4 px-5 font-bold whitespace-nowrap border-x border-gray-200/80 text-start bg-gray-50">إجمالي الوحدات</th>
                  <th className="py-4 px-5 font-bold whitespace-nowrap border-x border-gray-200/80 text-start bg-gray-50">الوحدات المتاحة</th>
                  <th className="py-4 px-5 font-bold whitespace-nowrap border-x border-gray-200/80 text-start bg-gray-50">نطاق الأسعار</th>
                  <th className="py-4 px-5 font-bold whitespace-nowrap text-center border-x border-gray-200/80 bg-gray-50">التفاصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-800 bg-white">
                {projects.map((project) => (
                  <tr key={project.id} className="odd:bg-white even:bg-gray-50/50 hover:bg-[#CAA048]/[0.05] transition-colors duration-150 border-b border-gray-100">
                    <td className="py-3 px-5 border-x border-gray-200/60 text-start">
                      <div className="relative w-14 h-10 rounded-lg overflow-hidden border border-gray-200 shadow-sm shrink-0">
                        <Image src={project.media.hero} alt={project.name} fill sizes="56px" className="object-cover" />
                      </div>
                    </td>
                    <td className="py-3 px-5 font-semibold border-x border-gray-200/60 text-start whitespace-nowrap font-cairo">
                      <div className="flex flex-col gap-0.5 text-start">
                        <span className="font-bold text-brand-black font-cairo">{project.name}</span>
                        {project.tagline && <span className="text-xs text-gray-500 font-cairo">{project.tagline}</span>}
                      </div>
                    </td>
                    <td className="py-3 px-5 text-gray-600 border-x border-gray-200/60 text-start whitespace-nowrap font-cairo">
                      {project.location.city}، {project.location.district}
                    </td>
                    <td className="py-3 px-5 text-gray-600 border-x border-gray-200/60 text-start whitespace-nowrap font-cairo">{project.specs.totalUnits} وحدة</td>
                    <td className="py-3 px-5 text-brand-black font-bold border-x border-gray-200/60 text-start whitespace-nowrap">
                      <span className="inline-block py-1 px-3 text-xs font-semibold text-white bg-[#111315] border border-[#CAA048]/50 rounded-full font-cairo">
                        {project.specs.availableUnits} متاح
                      </span>
                    </td>
                    <td className="py-3 px-5 font-bold text-brand-black font-cairo border-x border-gray-200/60 text-start whitespace-nowrap">
                      من {project.priceRange.min.toLocaleString()} إلى {project.priceRange.max.toLocaleString()} ر.س
                    </td>
                    <td className="py-3 px-5 text-center border-x border-gray-200/60">
                      <div className="flex items-center justify-center gap-2">
                        <a
                          href={project.brochureUrl || `/brochure-${project.slug}.pdf`}
                          target={project.brochureUrl ? "_blank" : undefined}
                          rel={project.brochureUrl ? "noopener noreferrer" : undefined}
                          download={!project.brochureUrl}
                          title="تحميل البروفايل PDF"
                          aria-label="تحميل البروفايل PDF"
                          className="p-2.5 rounded-xl bg-gray-50 hover:bg-[#111315] hover:text-[#CAA048] hover:border-[#CAA048] border border-gray-200 text-gray-700 transition-all cursor-pointer min-w-[42px] min-h-[42px] flex items-center justify-center"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <Link
                          href={`/projects/${project.slug}`}
                          className="py-2 px-5 text-xs font-bold btn-premium-gold rounded-lg inline-block font-cairo whitespace-nowrap min-w-[125px] min-h-[44px] flex items-center justify-center"
                        >
                          عرض كامل التفاصيل
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : isLoading ? (
          <div className="space-y-12">
            {/* Featured Project Skeleton */}
            <div className="w-full bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-sm p-6 sm:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="order-1 lg:order-2 lg:col-span-7 h-64 sm:h-80 md:h-[380px] rounded-2xl overflow-hidden skeleton-luxury border border-gray-100"></div>
                <div className="order-2 lg:order-1 lg:col-span-5 space-y-4">
                  <div className="h-4 w-28 rounded-full skeleton-luxury"></div>
                  <div className="h-8 w-3/4 rounded-xl skeleton-luxury"></div>
                  <div className="h-4 w-40 rounded-full skeleton-luxury"></div>
                  <div className="h-20 w-full rounded-xl skeleton-luxury"></div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="h-12 rounded-xl skeleton-luxury"></div>
                    <div className="h-12 rounded-xl skeleton-luxury"></div>
                  </div>
                  <div className="h-11 w-44 rounded-full skeleton-luxury mt-4"></div>
                </div>
              </div>
            </div>

            {/* Project Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3].map((idx) => (
                <div key={idx} className="bg-white rounded-2xl overflow-hidden border border-gray-200 p-4 space-y-3 shadow-sm">
                  <div className="aspect-[16/10] rounded-xl skeleton-luxury"></div>
                  <div className="h-4 w-3/4 rounded skeleton-luxury"></div>
                  <div className="h-3 w-1/2 rounded skeleton-luxury"></div>
                  <div className="h-8 w-full rounded skeleton-luxury"></div>
                </div>
              ))}
            </div>
          </div>
        ) : projects.length > 0 ? (
          <>
            {featuredProject && <FeaturedProjectCard project={featuredProject} />}
            {carouselProjects.length > 0 && (
              <div className="w-full mt-6 mb-8 relative">
                <RTLContinuousCarousel gap="gap-4 sm:gap-6">
                  {carouselProjects.map((project) => (
                    <div key={project.id} className="ps-1">
                      <SimplifiedProjectCard project={project} />
                    </div>
                  ))}
                </RTLContinuousCarousel>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-3xl max-w-md mx-auto shadow-sm p-6">
            <Building className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-700 font-cairo">لا توجد مشاريع عقارية مطروحة حالياً.</p>
          </div>
        )}

        <div className="text-center mt-6">
          <Link
            href="/projects"
            className="py-3.5 px-10 text-xs sm:text-sm font-bold btn-premium-gold inline-flex items-center gap-2 cursor-pointer font-cairo min-h-[44px]"
          >
            <span>عرض جميع المشاريع العقارية</span>
            <ArrowLeft className="w-4 h-4 transition-transform duration-300 -translate-x-0.5 group-hover:-translate-x-1.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
