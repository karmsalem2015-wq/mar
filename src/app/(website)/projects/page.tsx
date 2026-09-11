// src/app/projects/page.tsx
'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { PROJECTS, Project } from '@/lib/mockData';
import { getProjectsListAdmin } from '@/app/actions/properties';
import { normalizeProject } from '@/lib/normalizers';
import CustomSelect from '@/components/ui/CustomSelect';
import RTLContinuousCarousel from '@/components/ui/RTLContinuousCarousel';
import { useInquiryStore } from '@/store/useInquiryStore';
import {
  Search,
  MapPin,
  Building2,
  LayoutGrid,
  List,
  SlidersHorizontal,
  TableProperties,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Phone,
  MessageCircle,
  X,
  Check,
  Building,
  RotateCcw,
  Sliders,
  Filter,
  Calendar,
  Compass,
  Download,
  Landmark
} from 'lucide-react';

// Sub-component for horizontal detailed project card view
const DetailedProjectCard = ({ project, openInquiry, index = 0 }: { project: Project; openInquiry: () => void; index?: number }) => {
  let statusLabel = '';
  let statusClass = '';
  if (project.status === 'completed') {
    statusLabel = 'جاهز للتسليم';
    statusClass = 'bg-[#111315]/80 backdrop-blur-md border border-[#CAA048]/40 text-[#DFC07A] shadow-sm';
  } else if (project.status === 'under_construction') {
    statusLabel = 'تحت الإنشاء';
    statusClass = 'bg-[#111315]/80 backdrop-blur-md border border-[#CAA048]/40 text-[#DFC07A] shadow-sm';
  } else if (project.status === 'upcoming') {
    statusLabel = 'قريباً';
    statusClass = 'bg-[#111315]/80 backdrop-blur-md border border-white/20 text-white shadow-sm';
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(price) + ' ر.س';
  };

  const whatsappLink = `https://wa.me/966550085811?text=${encodeURIComponent(`السلام عليكم، أرغب في الاستفسار عن تفاصيل ${project.name}`)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.55, delay: (index % 3) * 0.12, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col lg:flex-row bg-white border border-gray-200/90 rounded-3xl overflow-hidden shadow-sm transition-all duration-300 hover:border-[#CAA048] hover:shadow-[0_16px_40px_rgba(0,0,0,0.08),0_0_0_1px_rgba(202,160,72,0.3)] font-cairo"
    >
      {/* Top subtle gold ambient shimmer on hover */}
      <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#CAA048] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

      {/* Image Block */}
      <div className="relative w-full lg:w-[35%] aspect-[16/10] lg:aspect-auto min-h-[240px] overflow-hidden bg-gray-100">
        <Image
          src={project.media.hero || '/properties/apartment.webp'}
          alt={project.name}
          fill
          sizes="(max-width: 1024px) 100vw, 35vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105 z-0"
        />
        <div className="absolute top-4 start-4 z-20">
          <span className={`px-3 py-1 text-[10px] font-bold rounded-full font-cairo ${statusClass}`}>
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Info Block */}
      <div className="flex-1 p-6 sm:p-8 flex flex-col text-right justify-between">
        <div>
          <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
            <div>
              <div className="flex items-center gap-1.5 mb-1.5 text-xs text-gray-500">
                <MapPin className="w-3.5 h-3.5 text-[#CAA048] shrink-0" />
                <span>{project.location.city} • {project.location.district}</span>
              </div>
              <Link href={`/projects/${project.slug}`}>
                <h3 className="text-base sm:text-lg font-bold text-brand-black leading-tight font-cairo group-hover:text-[#CAA048] transition-colors">
                  {project.name}
                </h3>
              </Link>
            </div>
            <div className="text-right lg:text-left">
              <span className="text-[10px] text-gray-400 block mb-0.5 font-cairo">نطاق الأسعار</span>
              <span className="text-lg sm:text-xl font-bold text-[#CAA048] font-cairo">
                {formatPrice(project.priceRange.min)} - {formatPrice(project.priceRange.max)}
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-5 font-cairo">
            {project.description}
          </p>

          {/* Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3 rounded-2xl bg-gray-50 border border-gray-100 mb-6 text-xs text-gray-600 text-center font-cairo">
            <div className="flex flex-col items-center justify-center gap-1">
              <span className="text-[10px] text-gray-400">المنطقة</span>
              <span className="font-bold text-brand-black">{project.location.district}</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-1 border-s sm:border-s-0 sm:border-x border-gray-200">
              <span className="text-[10px] text-gray-400">إجمالي الوحدات</span>
              <span className="font-bold text-brand-black font-mono">{project.specs.totalUnits} شقة</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-1 border-s border-gray-200">
              <span className="text-[10px] text-gray-400">الوحدات المتاحة</span>
              <span className="font-bold text-[#CAA048] font-mono">{project.specs.availableUnits} شقة</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-1 border-s border-gray-200">
              <span className="text-[10px] text-gray-400">تاريخ التسليم</span>
              <span className="font-bold text-brand-black">{project.specs.completionDate}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-gray-100 pt-5">
          <Link
            href={`/properties?project=${project.slug}`}
            className="w-full sm:w-auto py-2.5 px-5 text-xs font-bold bg-gray-100 hover:bg-[#111315] hover:text-white border border-gray-200 hover:border-[#111315] rounded-xl flex items-center justify-center gap-1.5 transition-all text-center font-cairo"
          >
            <span>استعراض وحدات المشروع</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </Link>

          <a
            href={project.brochureUrl || `/brochure-${project.slug}.pdf`}
            target={project.brochureUrl ? "_blank" : undefined}
            rel={project.brochureUrl ? "noopener noreferrer" : undefined}
            download={!project.brochureUrl}
            className="w-full sm:w-auto py-2.5 px-5 text-xs font-bold bg-white hover:bg-[#111315] hover:text-[#CAA048] text-[#111315] border border-[#CAA048]/40 hover:border-[#CAA048] rounded-xl flex items-center justify-center gap-1.5 transition-all text-center font-cairo"
          >
            <Download className="w-3.5 h-3.5 text-[#CAA048]" />
            <span>تحميل البروفايل PDF</span>
          </a>

          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto py-2.5 px-5 text-xs font-bold bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl flex items-center justify-center gap-1.5 transition-colors text-center font-cairo shadow-sm"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>استفسار واتساب</span>
          </a>

          <button
            type="button"
            onClick={openInquiry}
            className="w-full sm:w-auto py-2.5 px-6 text-xs font-bold bg-[#111315] hover:bg-[#CAA048] hover:text-[#111315] text-[#DFC07A] border border-[#CAA048]/40 hover:border-[#CAA048] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer font-cairo transition-all shadow-sm"
          >
            <Phone className="w-3.5 h-3.5 text-[#CAA048]" />
            <span>طلب تفاصيل المشروع</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Sub-component for standard project card (grid/carousel)
const ProjectCard = ({ project, openInquiry, index = 0 }: { project: Project; openInquiry: () => void; index?: number }) => {
  let statusLabel = '';
  let statusClass = '';
  if (project.status === 'completed') {
    statusLabel = 'جاهز للتسليم';
    statusClass = 'bg-[#111315]/80 backdrop-blur-md border border-[#CAA048]/40 text-[#DFC07A] shadow-sm';
  } else if (project.status === 'under_construction') {
    statusLabel = 'تحت الإنشاء';
    statusClass = 'bg-[#111315]/80 backdrop-blur-md border border-[#CAA048]/40 text-[#DFC07A] shadow-sm';
  } else if (project.status === 'upcoming') {
    statusLabel = 'قريباً';
    statusClass = 'bg-[#111315]/80 backdrop-blur-md border border-white/20 text-white shadow-sm';
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(price) + ' ر.س';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: (index % 3) * 0.12, ease: [0.16, 1, 0.3, 1] }}
      className="group relative bg-white border border-gray-200/90 rounded-3xl overflow-hidden shadow-sm transition-all duration-300 hover:border-[#CAA048] hover:shadow-[0_16px_40px_rgba(0,0,0,0.08),0_0_0_1px_rgba(202,160,72,0.3)] flex flex-col h-full text-right font-cairo"
    >
      {/* Top subtle gold ambient shimmer on hover */}
      <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#CAA048] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

      {/* Image Block */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100 shrink-0">
        <Image
          src={project.media.hero || '/properties/apartment.webp'}
          alt={project.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105 z-0"
        />
        <div className="absolute top-4 start-4 z-20">
          <span className={`px-3 py-1 text-[10px] font-bold rounded-full font-cairo ${statusClass}`}>
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Info Block */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-2 text-xs text-gray-500">
            <MapPin className="w-3.5 h-3.5 text-[#CAA048] shrink-0" />
            <span>{project.location.city} • {project.location.district}</span>
          </div>

          <Link href={`/projects/${project.slug}`}>
            <h3 className="text-lg font-bold text-brand-black mb-2 leading-tight font-cairo group-hover:text-[#CAA048] transition-colors">
              {project.name}
            </h3>
          </Link>

          <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2 font-cairo">
            {project.tagline || project.description}
          </p>

          <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100 mb-4 text-[11px] text-gray-600 text-center font-cairo">
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] text-gray-400">تاريخ التسليم</span>
              <span className="font-bold text-brand-black">{project.specs.completionDate}</span>
            </div>
            <div className="flex flex-col gap-0.5 flex-1">
              <span className="text-[9px] text-gray-400">الوحدات المتاحة</span>
              <span className="font-bold text-[#CAA048] font-mono">{project.specs.availableUnits} من {project.specs.totalUnits}</span>
            </div>
          </div>
        </div>

        {/* Price & Action */}
        <div>
          <div className="border-t border-gray-100 pt-4 flex items-center justify-between gap-4">
            <div className="text-right">
              <span className="text-[9px] text-gray-400 block font-cairo">تبدأ الأسعار من</span>
              <span className="text-base font-bold text-[#CAA048] font-cairo">
                {formatPrice(project.priceRange.min)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={project.brochureUrl || `/brochure-${project.slug}.pdf`}
                target={project.brochureUrl ? "_blank" : undefined}
                rel={project.brochureUrl ? "noopener noreferrer" : undefined}
                download={!project.brochureUrl}
                title="تحميل البروفايل PDF"
                className="p-2 rounded-xl bg-gray-100 hover:bg-[#111315] border border-gray-200 hover:border-[#CAA048] text-gray-700 hover:text-[#CAA048] transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
              </a>
              <Link
                href={`/projects/${project.slug}`}
                className="py-2 px-4 text-xs font-bold bg-[#111315] hover:bg-[#CAA048] hover:text-[#111315] text-[#DFC07A] border border-[#CAA048]/30 hover:border-[#CAA048] rounded-xl cursor-pointer font-cairo transition-all shadow-sm text-center"
              >
                تفاصيل
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function ProjectsPage() {
  const [dbProjects, setDbProjects] = useState<Project[]>(PROJECTS);

  useEffect(() => {
    async function loadData() {
      try {
        const projsData = await getProjectsListAdmin();
        if (projsData && projsData.length > 0) {
          setDbProjects(projsData.map(normalizeProject));
        }
      } catch (e) {
        console.error("Error loading projects page data:", e);
      }
    }
    loadData();
  }, []);

  const openInquiry = useInquiryStore((state) => state.open);
  const isReducedMotion = useReducedMotion();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [minPrice, setMinPrice] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<string>('all');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [isAdvancedOpenComplete, setIsAdvancedOpenComplete] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'grid' | 'detailed' | 'carousel' | 'table'>('grid');

  // DOM Refs
  const carouselRef = useRef<HTMLDivElement>(null);
  const tableWrapperRef = useRef<HTMLDivElement>(null);

  // Extract unique cities dynamically
  const cityOptions = useMemo(() => {
    const citiesSet = new Set<string>();
    dbProjects.forEach(proj => citiesSet.add(proj.location.city));
    const citiesArray = Array.from(citiesSet);
    return [
      { value: 'all', label: 'كل المدن' },
      ...citiesArray.map(c => ({ value: c, label: c }))
    ];
  }, [dbProjects]);

  const statusOptions = [
    { value: 'all', label: 'كل الحالات' },
    { value: 'completed', label: 'جاهز للتسليم' },
    { value: 'under_construction', label: 'تحت الإنشاء' },
    { value: 'upcoming', label: 'قريباً' }
  ];

  // Dynamic districts options depending on selected city
  const districtOptions = useMemo(() => {
    const list = [{ value: 'all', label: 'كل الأحياء' }];
    const uniqueDistricts = new Set<string>();

    dbProjects.forEach(proj => {
      if (selectedCity === 'all' || proj.location.city === selectedCity) {
        uniqueDistricts.add(proj.location.district);
      }
    });

    uniqueDistricts.forEach(dist => {
      list.push({ value: dist, label: dist });
    });

    return list;
  }, [dbProjects, selectedCity]);

  // Dynamic filter visibility depending on options availability
  const showCityFilter = useMemo(() => cityOptions.length > 2, [cityOptions]);
  const showDistrictFilter = useMemo(() => districtOptions.length > 2, [districtOptions]);

  const gridColsClass = useMemo(() => {
    let cols = 2; // Search query takes col-span-2
    if (showCityFilter) cols += 1;
    if (showDistrictFilter) cols += 1;
    return `grid grid-cols-1 md:grid-cols-${cols} gap-4`;
  }, [showCityFilter, showDistrictFilter]);

  // Price select options
  const minPriceOptions = [
    { value: 'all', label: 'الحد الأدنى' },
    { value: '500000', label: '500 ألف ر.س' },
    { value: '700000', label: '700 ألف ر.س' },
    { value: '1000000', label: '1 مليون ر.س' }
  ];

  const maxPriceOptions = [
    { value: 'all', label: 'الحد الأقصى' },
    { value: '750000', label: '750 ألف ر.س' },
    { value: '1000000', label: '1 مليون ر.س' },
    { value: '2000000', label: '2 مليون ر.س' },
    { value: '15000000', label: '15 مليون ر.س' }
  ];

  // Filtering Logic
  const filteredProjects = useMemo(() => {
    return dbProjects.filter(proj => {
      // 1. Search Query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const inName = proj.name.toLowerCase().includes(query);
        const inDistrict = proj.location.district.toLowerCase().includes(query);
        const inTagline = proj.tagline?.toLowerCase().includes(query) || false;
        const inDesc = proj.description.toLowerCase().includes(query);
        if (!inName && !inDistrict && !inTagline && !inDesc) return false;
      }

      // 2. City
      if (selectedCity !== 'all' && proj.location.city !== selectedCity) return false;

      // 3. District
      if (selectedDistrict !== 'all' && proj.location.district !== selectedDistrict) return false;

      // 4. Status
      if (selectedStatus !== 'all' && proj.status !== selectedStatus) return false;

      // 5. Price Min
      if (minPrice !== 'all' && proj.priceRange.min < parseInt(minPrice)) return false;

      // 6. Price Max
      if (maxPrice !== 'all' && proj.priceRange.max > parseInt(maxPrice)) return false;

      return true;
    });
  }, [
    dbProjects,
    searchQuery,
    selectedCity,
    selectedDistrict,
    selectedStatus,
    minPrice,
    maxPrice
  ]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim() !== '') count++;
    if (selectedCity !== 'all') count++;
    if (selectedDistrict !== 'all') count++;
    if (selectedStatus !== 'all') count++;
    if (minPrice !== 'all') count++;
    if (maxPrice !== 'all') count++;
    return count;
  }, [
    searchQuery,
    selectedCity,
    selectedDistrict,
    selectedStatus,
    minPrice,
    maxPrice
  ]);

  // Reset Filters Helper
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCity('all');
    setSelectedDistrict('all');
    setSelectedStatus('all');
    setMinPrice('all');
    setMaxPrice('all');
  };

  // Table and Carousel horizontal scroll adjustment effect (starting from the right in RTL)
  useEffect(() => {
    if (viewMode === 'table' && tableWrapperRef.current) {
      const el = tableWrapperRef.current;
      el.scrollLeft = 0;
      const timer = setTimeout(() => {
        el.scrollLeft = 0;
      }, 55);
      return () => clearTimeout(timer);
    }
    if (viewMode === 'carousel' && carouselRef.current) {
      const el = carouselRef.current;
      el.scrollLeft = 0;
      const timer = setTimeout(() => {
        el.scrollLeft = 0;
      }, 55);
      return () => clearTimeout(timer);
    }
  }, [viewMode, filteredProjects]);

  // Carousel navigation trigger helpers
  const handleCarouselNav = (direction: 'next' | 'prev') => {
    if (carouselRef.current) {
      const container = carouselRef.current;
      const amount = container.clientWidth * 0.8;
      const sign = direction === 'next' ? -1 : 1; // negative leftwards in RTL
      container.scrollBy({ left: amount * sign, behavior: 'smooth' });
    }
  };

  const formatPriceRange = (min: number, max: number) => {
    const minF = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(min);
    const maxF = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(max);
    return `${minF} - ${maxF} ر.س`;
  };

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-brand-black relative overflow-x-hidden font-cairo" dir="rtl">
      {/* ----------------------------------------------------
         1. Full-screen Hero Section
         ---------------------------------------------------- */}
      <section className="relative min-h-[90vh] lg:min-h-screen w-full flex items-center justify-center bg-[#0d0d0f] overflow-hidden pt-28 sm:pt-36 pb-20 sm:pb-24">
        {/* Background Image & Soft Cinematic Overlays */}
        <div className="absolute inset-0 z-0 select-none">
          <Image
            src="/hero-bg-projects.png"
            alt="مشاريع شركة مار العقارية الكبرى"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center scale-[1.01] transition-transform duration-1000"
          />
          {/* Subtle architectural gradient: protects navbar & text contrast while letting the illuminated towers and pool shine through */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/30 to-black/75" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_10%,rgba(0,0,0,0.35)_100%)]" />
        </div>

        {/* Banner Contents */}
        <div className="relative z-10 max-w-5xl w-[92%] mx-auto text-center flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 py-2 px-5 text-xs sm:text-sm font-bold text-white bg-black/55 border border-[#CAA048]/45 rounded-full font-cairo shadow-[0_4px_20px_rgba(0,0,0,0.3)] backdrop-blur-md mb-5"
          >
            <Building2 className="w-4 h-4 text-[#CAA048] shrink-0" />
            <span>مشاريع مار المعمارية الكبرى</span>
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-[4.2rem] font-black leading-[1.2] font-heading mb-6 drop-shadow-[0_4px_24px_rgba(0,0,0,0.65)] text-center tracking-tight"
          >
            <span className="block text-white">استكشف مشاريعنا</span>
            <span className="block bg-gradient-to-r from-[#FDE36E] via-[#F9CC40] to-[#E6A821] bg-clip-text text-transparent drop-shadow-md font-black mt-1 sm:mt-2">
              المعمارية الفاخرة
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-sm sm:text-base md:text-lg text-white/95 leading-relaxed mb-10 max-w-2xl sm:max-w-3xl mx-auto text-center font-cairo text-pretty drop-shadow-md"
          >
            نصنع مجتمعات سكنية متكاملة تواكب تطلعاتكم، ونقدم رؤية هندسية مبتكرة تجمع الأصالة بالحداثة في مواقع استراتيجية متميزة.
          </motion.p>

          {/* Call To Actions */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-md sm:max-w-none px-4 sm:px-0"
          >
            <button
              type="button"
              onClick={openInquiry}
              className="w-full sm:w-auto py-3.5 px-8 text-xs sm:text-sm font-bold btn-premium-gold flex items-center justify-center gap-2.5 cursor-pointer font-cairo transition-all duration-300 rounded-full"
            >
              <Calendar className="w-4 h-4 shrink-0 text-[#111315]" />
              <span>تواصل معنا للاستفسار</span>
            </button>

            <a
              href="#projects-listings-section"
              className="w-full sm:w-auto py-3.5 px-8 text-xs sm:text-sm font-bold bg-black/45 hover:bg-black/75 text-white border border-white/25 hover:border-[#CAA048] rounded-full flex items-center justify-center gap-2.5 transition-all duration-300 backdrop-blur-md font-cairo text-center shadow-lg"
            >
              <Compass className="w-4 h-4 shrink-0 text-[#CAA048]" />
              <span>تصفح كافة المشاريع</span>
            </a>
          </motion.div>

          {/* Micro Trust Indicators Strip */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="mt-12 hidden sm:flex flex-wrap items-center justify-center gap-6 text-xs text-white/80 font-cairo"
          >
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/35 border border-white/10 backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              <span>مشاريع بمواقع استراتيجية حيوية</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/35 border border-white/10 backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-[#CAA048]" />
              <span>معايير بناء وجودة هندسية معتمدة</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/35 border border-white/10 backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-sky-400" />
              <span>مجتمعات راقية متكاملة الخدمات</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Listings Wrapper */}
      <div id="projects-listings-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 relative z-10">

        {/* Filter panel card */}
        <motion.section
          initial={isReducedMotion ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: isReducedMotion ? 0 : 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-8 shadow-sm mb-10 transition-all duration-300"
        >
          <div className="flex flex-col gap-6">

            {/* Primary filter row */}
            <div className={gridColsClass}>
              {/* Search input */}
              <div className="relative w-full text-right md:col-span-2">
                <label htmlFor="proj-search" className="sr-only">البحث عن مشروع</label>
                <div className="relative">
                  <input
                    id="proj-search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث باسم المشروع، الحي، أو المدينة..."
                    className="w-full bg-gray-50 border border-gray-200 hover:border-[#CAA048]/40 focus:border-[#CAA048] focus:bg-white rounded-xl ps-12 pe-4 py-3 text-sm text-brand-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CAA048]/20 transition-all duration-200 font-cairo"
                  />
                  <Search className="w-5 h-5 text-gray-400 absolute top-1/2 start-4 -translate-y-1/2" />
                </div>
              </div>

              {/* City selector */}
              {showCityFilter && (
                <CustomSelect
                  id="city-select"
                  title="المدينة"
                  options={cityOptions}
                  value={selectedCity}
                  onChange={(val) => {
                    setSelectedCity(val);
                    setSelectedDistrict('all'); // reset district on city switch
                  }}
                />
              )}

              {/* District selector */}
              {showDistrictFilter && (
                <CustomSelect
                  id="district-select"
                  title="الحي"
                  options={districtOptions}
                  value={selectedDistrict}
                  onChange={setSelectedDistrict}
                />
              )}
            </div>

            {/* Collapsible advanced filters panel */}
            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  onAnimationStart={() => setIsAdvancedOpenComplete(false)}
                  onAnimationComplete={() => {
                    if (showAdvanced) setIsAdvancedOpenComplete(true);
                  }}
                  className={`w-full ${isAdvancedOpenComplete ? 'overflow-visible' : 'overflow-hidden'}`}
                >
                  <div className="border-t border-gray-100 pt-6 flex flex-col gap-6">

                    {/* Advanced parameters */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Project Status */}
                      <CustomSelect
                        id="status-select"
                        title="حالة المشروع"
                        options={statusOptions}
                        value={selectedStatus}
                        onChange={setSelectedStatus}
                      />

                      {/* Min Price */}
                      <CustomSelect
                        id="min-price-select"
                        title="الحد الأدنى للسعر"
                        options={minPriceOptions}
                        value={minPrice}
                        onChange={setMinPrice}
                      />

                      {/* Max Price */}
                      <CustomSelect
                        id="max-price-select"
                        title="الحد الأقصى للسعر"
                        options={maxPriceOptions}
                        value={maxPrice}
                        onChange={setMaxPrice}
                      />
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions and active filter state indicators */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-4 mt-2">
              <div className="flex items-center gap-3">
                {/* Advanced filter toggle button */}
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors duration-200 font-cairo ${showAdvanced
                      ? 'bg-[#111315] border-[#CAA048] text-[#CAA048]'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-[#CAA048]/40 hover:text-brand-black'
                    }`}
                >
                  <Filter className="w-4 h-4" />
                  <span>{showAdvanced ? 'إخفاء الفلاتر المتقدمة' : 'المزيد من الفلاتر'}</span>
                </button>

                {/* Reset button if any filter active */}
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors font-cairo"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>إعادة تعيين ({activeFiltersCount})</span>
                  </button>
                )}
              </div>

              {/* Status Results Count */}
              <div className="text-xs text-gray-500 font-cairo">
                تم العثور على <strong className="text-[#CAA048] font-mono text-sm font-bold">{filteredProjects.length}</strong> مشروع مطروح
              </div>
            </div>

          </div>
        </motion.section>

        {/* Display modes switcher row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h2 className="text-lg font-bold text-[#181A1B] font-cairo border-r-2 border-[#CAA048] pr-3 border-e-2 pe-3 border-r-0">مشاريعنا العقارية</h2>

          <div className="flex items-center gap-1 bg-[#111315] border border-[#CAA048]/30 p-1 rounded-xl shadow-xs">
            {/* Grid view button */}
            <button
              type="button"
              title="عرض الشبكة"
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg cursor-pointer transition-all ${
                viewMode === 'grid'
                  ? 'bg-gradient-to-r from-[#CAA048] to-[#DFC07A] text-[#111315] shadow-xs'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <LayoutGrid className={`w-4 h-4 ${viewMode === 'grid' ? 'text-[#111315]' : 'text-gray-300'}`} />
            </button>

            {/* Detailed row view button */}
            <button
              type="button"
              title="العرض التفصيلي"
              onClick={() => setViewMode('detailed')}
              className={`p-2 rounded-lg cursor-pointer transition-all ${
                viewMode === 'detailed'
                  ? 'bg-gradient-to-r from-[#CAA048] to-[#DFC07A] text-[#111315] shadow-xs'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <List className={`w-4 h-4 ${viewMode === 'detailed' ? 'text-[#111315]' : 'text-gray-300'}`} />
            </button>

            {/* Carousel view button */}
            <button
              type="button"
              title="العرض الدائري"
              onClick={() => setViewMode('carousel')}
              className={`p-2 rounded-lg cursor-pointer transition-all ${
                viewMode === 'carousel'
                  ? 'bg-gradient-to-r from-[#CAA048] to-[#DFC07A] text-[#111315] shadow-xs'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <SlidersHorizontal className={`w-4 h-4 ${viewMode === 'carousel' ? 'text-[#111315]' : 'text-gray-300'}`} />
            </button>

            {/* Table view button */}
            <button
              type="button"
              title="عرض الجدول"
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg cursor-pointer transition-all ${
                viewMode === 'table'
                  ? 'bg-gradient-to-r from-[#CAA048] to-[#DFC07A] text-[#111315] shadow-xs'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <TableProperties className={`w-4 h-4 ${viewMode === 'table' ? 'text-[#111315]' : 'text-gray-300'}`} />
            </button>
          </div>
        </div>

        {/* ----------------------------------------------------
           3. Display Modes Render Block
           ---------------------------------------------------- */}
        <div className="relative">
          <AnimatePresence mode="wait">

            {/* Grid View Mode */}
            {viewMode === 'grid' && (
              <motion.div
                key="grid-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
              >
                {filteredProjects.map((project, index) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    openInquiry={openInquiry}
                    index={index}
                  />
                ))}
              </motion.div>
            )}

            {/* Detailed Row View Mode */}
            {viewMode === 'detailed' && (
              <motion.div
                key="detailed-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col gap-6"
              >
                {filteredProjects.map((project, index) => (
                  <DetailedProjectCard
                    key={project.id}
                    project={project}
                    openInquiry={openInquiry}
                    index={index}
                  />
                ))}
              </motion.div>
            )}

            {/* Carousel Mode */}
            {viewMode === 'carousel' && (
              <motion.div
                key="carousel-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="w-full py-2 relative"
              >
                <RTLContinuousCarousel gap="gap-6">
                  {filteredProjects.map((project) => (
                    <div
                      key={project.id}
                      className="w-[290px] sm:w-[350px] shrink-0 ps-1"
                    >
                      <ProjectCard project={project} openInquiry={openInquiry} />
                    </div>
                  ))}
                </RTLContinuousCarousel>
              </motion.div>
            )}

            {/* Table Mode */}
            {viewMode === 'table' && (
              <motion.div
                key="table-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="w-full overflow-hidden"
              >
                {/* Scrollable table container */}
                <div
                  ref={tableWrapperRef}
                  className="custom-table-wrapper w-full max-h-[60vh] overflow-auto rounded-2xl border border-gray-200 bg-white shadow-xl scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
                  dir="rtl"
                >
                  <table className="w-full min-w-[950px] text-right text-xs sm:text-[13px] table-auto border-collapse">
                    <thead className="sticky top-0 z-20 shadow-sm">
                      <tr className="border-b border-gray-200 text-brand-black font-bold font-cairo bg-gray-50">
                        <th className="py-4 px-5 font-bold whitespace-nowrap border-x border-gray-200 first:border-s-0 last:border-e-0 text-right bg-gray-50 text-brand-black">اسم المشروع</th>
                        <th className="py-4 px-5 font-bold whitespace-nowrap border-x border-gray-200 first:border-s-0 last:border-e-0 text-right bg-gray-50 text-brand-black">المدينة</th>
                        <th className="py-4 px-5 font-bold whitespace-nowrap border-x border-gray-200 first:border-s-0 last:border-e-0 text-right bg-gray-50 text-brand-black">الحي</th>
                        <th className="py-4 px-5 font-bold whitespace-nowrap border-x border-gray-200 first:border-s-0 last:border-e-0 text-right bg-gray-50 text-brand-black">تاريخ التسليم</th>
                        <th className="py-4 px-5 font-bold whitespace-nowrap border-x border-gray-200 first:border-s-0 last:border-e-0 text-right bg-gray-50 text-brand-black">الوحدات المتاحة</th>
                        <th className="py-4 px-5 font-bold whitespace-nowrap border-x border-gray-200 first:border-s-0 last:border-e-0 text-right bg-gray-50 text-brand-black">نطاق الأسعار</th>
                        <th className="py-4 px-5 font-bold whitespace-nowrap text-center border-x border-gray-200 first:border-s-0 last:border-e-0 bg-gray-50 text-brand-black">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-brand-black bg-white">
                      {filteredProjects.map((project) => {
                        let statusText = '';
                        if (project.status === 'completed') statusText = 'جاهز للتسليم';
                        else if (project.status === 'under_construction') statusText = 'تحت الإنشاء';
                        else if (project.status === 'upcoming') statusText = 'قريباً';

                        return (
                          <tr
                            key={project.id}
                            className="odd:bg-white even:bg-gray-50/50 hover:bg-[#CAA048]/[0.05] transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                          >
                            {/* Project Name & Thumbnail */}
                            <td className="py-3 px-5 border-x border-gray-100 first:border-s-0 last:border-e-0 text-right">
                              <div className="flex items-center gap-3">
                                <div className="relative w-14 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                                  <Image
                                    src={project.media.hero || '/properties/apartment.webp'}
                                    alt={project.name}
                                    fill
                                    sizes="56px"
                                    className="object-cover"
                                  />
                                </div>
                                <div className="text-right">
                                  <span className="block font-bold text-brand-black text-xs sm:text-sm font-cairo">{project.name}</span>
                                  <span className="block text-[10px] text-gray-500 mt-0.5">{statusText}</span>
                                </div>
                              </div>
                            </td>

                            {/* Location */}
                            <td className="py-3 px-5 text-xs sm:text-sm border-x border-gray-100 first:border-s-0 last:border-e-0 text-right whitespace-nowrap text-gray-700">{project.location.city}</td>
                            <td className="py-3 px-5 text-xs sm:text-sm border-x border-gray-100 first:border-s-0 last:border-e-0 text-right whitespace-nowrap text-gray-700">{project.location.district}</td>

                            {/* Specs */}
                            <td className="py-3 px-5 text-xs sm:text-sm border-x border-gray-100 first:border-s-0 last:border-e-0 text-right whitespace-nowrap text-gray-700">{project.specs.completionDate}</td>
                            <td className="py-3 px-5 font-mono text-xs sm:text-sm text-[#CAA048] font-bold border-x border-gray-100 first:border-s-0 last:border-e-0 text-right whitespace-nowrap">
                              {project.specs.availableUnits} / {project.specs.totalUnits}
                            </td>

                            {/* Price */}
                            <td className="py-3 px-5 font-bold text-[#CAA048] text-xs sm:text-sm font-cairo border-x border-gray-100 first:border-s-0 last:border-e-0 text-right whitespace-nowrap">
                              {formatPriceRange(project.priceRange.min, project.priceRange.max)}
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-5 text-center border-x border-gray-100 first:border-s-0 last:border-e-0">
                              <div className="inline-flex items-center gap-2 justify-center">
                                <a
                                  href={project.brochureUrl || `/brochure-${project.slug}.pdf`}
                                  target={project.brochureUrl ? "_blank" : undefined}
                                  rel={project.brochureUrl ? "noopener noreferrer" : undefined}
                                  download={!project.brochureUrl}
                                  title="تحميل البروفايل PDF"
                                  className="p-1.5 rounded-lg bg-gray-100 hover:bg-[#111315] border border-gray-200 hover:border-[#CAA048] text-gray-700 hover:text-[#CAA048] transition-all cursor-pointer"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </a>
                                <Link
                                  href={`/properties?project=${project.slug}`}
                                  className="py-1.5 px-3 rounded-lg bg-gray-100 hover:bg-[#111315] hover:text-white border border-gray-200 text-brand-black text-[10px] font-bold transition-all text-center"
                                >
                                  استعراض الوحدات
                                </Link>
                                <button
                                  type="button"
                                  onClick={openInquiry}
                                  className="py-1.5 px-3 rounded-lg bg-[#111315] hover:bg-[#CAA048] hover:text-[#111315] text-[#DFC07A] border border-[#CAA048]/40 hover:border-[#CAA048] text-[10px] font-bold transition-all shadow-sm cursor-pointer"
                                >
                                  تفاصيل
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Empty view indicator if list is empty */}
            {filteredProjects.length === 0 && (
              <motion.div
                key="empty-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="text-center py-20 bg-gray-50 border border-gray-200 rounded-3xl"
              >
                <Building className="w-12 h-12 text-[#CAA048]/40 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-bold text-brand-black mb-2 font-cairo">لم نجد مشاريع مطابقة</h3>
                <p className="text-xs text-gray-500 mb-6 max-w-sm mx-auto leading-relaxed">
                  جرب تعديل خيارات التصفية أو تغيير كلمات البحث للعثور على النتائج المتاحة.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="py-2.5 px-6 rounded-xl bg-[#111315] hover:bg-[#CAA048] text-[#DFC07A] hover:text-[#111315] border border-[#CAA048]/30 text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  إعادة تعيين كافة الفلاتر
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </main>
  );
}
