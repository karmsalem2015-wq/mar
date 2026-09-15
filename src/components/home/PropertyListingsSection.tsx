'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { MapPin, Building, Building2, DollarSign, Layers, Bed, Bath, Ruler, ArrowLeft, X, LayoutGrid, Home, TrendingUp } from 'lucide-react';
import { Property } from '@/lib/mockData';
import CustomSelect from '@/components/ui/CustomSelect';
import RTLContinuousCarousel from '@/components/ui/RTLContinuousCarousel';

const CATEGORY_TABS = [
  { id: 'all', label: 'الكل', icon: LayoutGrid },
  { id: 'flat', label: 'شقق سكنية', icon: Building2 },
  { id: 'villa', label: 'فلل فخمة', icon: Home },
  { id: 'roof', label: 'أروف / بنتهاوس', icon: Layers },
  { id: 'investment', label: 'عروض الاستثمار', icon: TrendingUp },
] as const;

const CITY_OPTIONS = [
  { value: 'all', label: 'كل المدن' },
  { value: 'جدة', label: 'جدة' },
  { value: 'الرياض', label: 'الرياض' },
  { value: 'مكه', label: 'مكة المكرمة' }
];

const TYPE_OPTIONS = [
  { value: 'all', label: 'كل الفئات' },
  { value: 'flat', label: 'شقة سكينة' },
  { value: 'villa', label: 'فيلا مستقلة' },
  { value: 'roof', label: 'ملحق روف / بنتهاوس' },
  { value: 'investment', label: 'فرص استثمارية' }
];

const ROOMS_OPTIONS = [
  { value: 'all', label: 'أي عدد' },
  { value: '4', label: '4 غرف' },
  { value: '5', label: '5 غرف' },
  { value: '6', label: '6 غرف' }
];

const PRICE_OPTIONS = [
  { value: 'all', label: 'أي سعر' },
  { value: '600000', label: 'حتى 600,000 ر.س' },
  { value: '800000', label: 'حتى 800,000 ر.س' },
  { value: '1000000', label: 'حتى 1,000,000 ر.س' },
  { value: '2000000', label: 'حتى 2,000,000 ر.س' },
  { value: '20000000', label: 'حتى 20,000,000 ر.س' }
];

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(price) + ' ر.س';
};

const formatArea = (area: number) => {
  return `${new Intl.NumberFormat('en-US').format(area)} م²`;
};

const getPropertyImage = (type: Property['type']) => {
  switch (type) {
    case 'villa':
      return '/properties/villa.webp';
    case 'penthouse':
    case 'annex':
    case 'duplex':
      return '/properties/penthouse.webp';
    default:
      return '/properties/apartment.webp';
  }
};

function FeaturedPropertyCard({ property }: { property: Property }) {
  return (
    <div className="group relative w-full bg-white rounded-3xl overflow-hidden border border-gray-200/90 shadow-[0_12px_40px_rgba(0,0,0,0.06)] hover:border-[#CAA048] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08),0_0_0_1px_rgba(202,160,72,0.4)] transition-all duration-500 mb-12">
      <div className="absolute top-0 start-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#CAA048] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20"></div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Left side: Image */}
        <div className="order-1 lg:order-2 lg:col-span-7 relative h-64 sm:h-80 md:h-[400px] lg:h-auto min-h-[260px] lg:min-h-[440px] overflow-hidden bg-gray-100">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>

          <div className="absolute top-6 end-6 z-20 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-[#111315] border border-[#CAA048] rounded-full shadow-md uppercase font-cairo">
              <span className="size-1.5 rounded-full bg-[#CAA048]" />
              عقار مميز جداً
            </span>
            <span className="px-4 py-1.5 text-xs font-bold text-white bg-black/75 backdrop-blur-md rounded-full font-cairo">
              {property.status === 'available' ? 'متاح للبيع' : property.status === 'reserved' ? 'محجوز' : 'مباع'}
            </span>
          </div>

          <div className="absolute bottom-6 end-6 z-20">
            <span className="px-3.5 py-1.5 text-xs font-bold text-white bg-black/70 backdrop-blur-md border border-white/20 rounded-lg font-cairo">
              {property.type === 'annex' ? 'ملحق روف' : property.type === 'villa' ? 'فيلا مستقلة' : property.type === 'penthouse' ? 'بنتهاوس' : 'شقة سكنية'}
            </span>
          </div>

          <Image
            src={getPropertyImage(property.type)}
            alt={property.title}
            fill
            loading="lazy"
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover transition-transform duration-[8000ms] ease-luxury group-hover:scale-108"
          />
        </div>

        {/* Right side: Content */}
        <div className="order-2 lg:order-1 lg:col-span-5 p-6 sm:p-8 md:p-10 flex flex-col justify-between text-start">
          <div>
            <div className="flex items-center gap-1.5 mb-3 text-xs font-semibold text-gray-500 font-cairo">
              <span className="w-2 h-2 rounded-full bg-[#CAA048]"></span>
              <span>{property.project.name}</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-brand-black mb-4 leading-snug font-heading group-hover:text-[#CAA048] transition-colors duration-300">
              {property.title}
            </h3>

            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 mb-5 font-cairo">
              <MapPin className="w-4 h-4 text-[#CAA048] shrink-0" />
              <span>{property.location.district}، {property.location.city}</span>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6 line-clamp-4 font-cairo">
              {property.description}
            </p>

            {property.specs.features && property.specs.features.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {property.specs.features.slice(0, 4).map((feat, i) => (
                  <span key={i} className="py-1 px-3 text-xs font-semibold bg-gray-100 border border-gray-200/80 text-gray-700 rounded-lg font-cairo">
                    {feat}
                  </span>
                ))}
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-200/80 mb-6 text-xs text-gray-700">
              <div className="flex flex-col items-center justify-center gap-1">
                <span className="text-xs text-gray-500 font-cairo">الغرف</span>
                <div className="flex items-center gap-1">
                  <Bed className="w-4 h-4 text-[#CAA048]" />
                  <span className="font-bold text-brand-black font-cairo text-sm">{property.specs.bedrooms}</span>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 border-x border-gray-200">
                <span className="text-xs text-gray-500 font-cairo">الحمامات</span>
                <div className="flex items-center gap-1">
                  <Bath className="w-4 h-4 text-[#CAA048]" />
                  <span className="font-bold text-brand-black font-cairo text-sm">{property.specs.bathrooms}</span>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center gap-1">
                <span className="text-xs text-gray-500 font-cairo">المساحة</span>
                <div className="flex items-center gap-1">
                  <Ruler className="w-4 h-4 text-[#CAA048]" />
                  <span className="font-bold text-brand-black font-cairo text-sm">{formatArea(property.specs.area)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1 font-cairo">السعر الإجمالي</p>
              <p className="text-xl sm:text-2xl font-black text-brand-black font-cairo">
                {formatPrice(property.pricing.price)}
              </p>
              {property.pricing.monthlyInstallment && (
                <p className="text-xs text-gray-500 mt-1 font-cairo">
                  قسط شهري متوقع: <strong className="text-brand-black font-cairo font-bold">{new Intl.NumberFormat('en-US').format(property.pricing.monthlyInstallment)} ر.س</strong>
                </p>
              )}
            </div>

            <Link
              href={`/property/${property.slug}`}
              className="py-3 px-8 text-xs sm:text-sm font-bold btn-premium-gold flex items-center gap-2 group/btn cursor-pointer font-cairo min-h-[44px]"
            >
              <span>عرض كامل التفاصيل</span>
              <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover/btn:-translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function SimplifiedPropertyCard({ property }: { property: Property }) {
  return (
    <div className="group relative flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-gray-200/90 transition-all duration-500 hover:border-[#CAA048] hover:shadow-xl hover:-translate-y-1 w-[82vw] max-w-[320px] sm:w-[285px] md:w-[310px] shrink-0">
      <div className="absolute top-0 start-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#CAA048] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"></div>

      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10"></div>
        <Image
          src={getPropertyImage(property.type)}
          alt={property.title}
          fill
          sizes="(max-width: 768px) 200px, 290px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 end-3 z-20">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-[#111315] border border-[#CAA048]/60 rounded-md font-cairo shadow-sm">
            <span className="size-1 rounded-full bg-[#CAA048]" />
            {property.type === 'annex' ? 'ملحق' : property.type === 'villa' ? 'فيلا' : property.type === 'penthouse' ? 'روف' : 'شقة'}
          </span>
        </div>
        <div className="absolute top-3 start-3 z-20">
          <span className={`px-2.5 py-1 text-xs font-bold text-white rounded-md font-cairo shadow-sm ${property.status === 'sold' ? 'bg-status-sold' : property.status === 'reserved' ? 'bg-status-reserved' : 'bg-status-available'}`}>
            {property.status === 'sold' ? 'مباع' : property.status === 'reserved' ? 'محجوز' : 'متاح'}
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5 flex flex-col flex-1 text-start">
        <h4 className="text-xs sm:text-sm font-bold text-brand-black line-clamp-1 mb-2 group-hover:text-[#CAA048] transition-colors duration-300 font-heading">
          {property.title}
        </h4>

        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3 font-cairo">
          <MapPin className="w-3.5 h-3.5 text-[#CAA048] shrink-0" />
          <span className="line-clamp-1">{property.location.district}</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-600 border-t border-gray-100 pt-2 mb-4 font-cairo">
          <span className="font-semibold">{property.specs.bedrooms} غرف</span>
          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
          <span className="font-cairo font-medium">{formatArea(property.specs.area)}</span>
        </div>

        <div className="mt-auto pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
          <div>
            <p className="text-xs text-gray-500 font-cairo">السعر</p>
            <p className="text-xs sm:text-sm font-black text-brand-black font-cairo">
              {formatPrice(property.pricing.price)}
            </p>
          </div>

          <Link
            href={`/property/${property.slug}`}
            className="py-2 px-4 text-xs font-bold btn-premium-gold flex items-center gap-1 cursor-pointer font-cairo min-h-[44px]"
          >
            <span>عرض</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

interface PropertyListingsSectionProps {
  properties: Property[];
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  selectedRooms: string;
  setSelectedRooms: (rooms: string) => void;
  maxPrice: string;
  setMaxPrice: (price: string) => void;
  isLoading?: boolean;
}

export default function PropertyListingsSection({
  properties,
  selectedCity,
  setSelectedCity,
  selectedType,
  setSelectedType,
  selectedRooms,
  setSelectedRooms,
  maxPrice,
  setMaxPrice,
  isLoading = false,
}: PropertyListingsSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const [showLocalFilters, setShowLocalFilters] = useState<boolean>(false);
  const [isLocalFiltersOpenComplete, setIsLocalFiltersOpenComplete] = useState<boolean>(false);
  const [propertiesViewMode, setPropertiesViewMode] = useState<'grid' | 'table'>('grid');
  const propertiesTableRef = useRef<HTMLDivElement>(null);

  const fadeUpVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0.05 : 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  const featuredProperty = useMemo(() => {
    if (properties.length === 0) return null;
    const featuredApartment = properties.find(p => p.featured && p.type === 'apartment');
    if (featuredApartment) return featuredApartment;
    const anyFeatured = properties.find(p => p.featured);
    if (anyFeatured) return anyFeatured;
    return properties[0];
  }, [properties]);

  const carouselProperties = useMemo(() => {
    if (!featuredProperty) return [];
    return properties.filter(p => p.id !== featuredProperty.id);
  }, [properties, featuredProperty]);

  useEffect(() => {
    if (propertiesViewMode === 'table' && propertiesTableRef.current) {
      const el = propertiesTableRef.current;
      el.scrollLeft = el.scrollWidth;
      const timer = setTimeout(() => {
        el.scrollLeft = el.scrollWidth;
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [propertiesViewMode, properties]);

  return (
    <div className="w-full bg-white pb-16">
      <section id="listings-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-28">
        {/* 1. Section Header: Tag & Heading Above Filters */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } }
          }}
          className="flex flex-col items-center text-center pt-16 pb-6 sm:pb-8"
        >
          <motion.div variants={fadeUpVariants} className="mb-3">
            <span className="inline-flex items-center gap-2 py-1.5 px-4 text-xs sm:text-sm font-bold text-white bg-[#111315] border border-white/20 rounded-full font-cairo shadow-sm backdrop-blur-md">
              <Building2 className="w-3.5 h-3.5 text-white shrink-0" />
              <span>قائمتنا المحدثة</span>
            </span>
          </motion.div>
          <motion.h2 variants={fadeUpVariants} className="text-2xl sm:text-4xl lg:text-[2.6rem] font-black text-brand-black mb-3 font-heading heading-engraved">
            تصفح آخر العروض والفرص الحالية
          </motion.h2>
          <motion.p variants={fadeUpVariants} className="text-sm sm:text-base text-gray-600 max-w-3xl sm:max-w-4xl mx-auto font-cairo leading-relaxed text-pretty">
            اختر من بين مجموعة حصرية من الوحدات السكنية والاستثمارية المصممة بأعلى معايير الجودة
          </motion.p>
        </motion.div>

        {/* 2. Category Tabs (Filters) */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 pb-8">
          {CATEGORY_TABS.map((tab) => {
            const isSelected = selectedType === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                className={`group inline-flex items-center gap-2 sm:gap-2.5 py-2.5 px-4.5 sm:py-3 sm:px-5.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 border cursor-pointer min-h-[44px] font-cairo select-none ${
                  isSelected
                    ? 'bg-[#111315] text-white border-[#CAA048] font-extrabold shadow-[0_6px_20px_rgba(0,0,0,0.18)] -translate-y-0.5'
                    : 'bg-white hover:bg-gray-50 text-gray-700 hover:text-brand-black border-gray-200/90 hover:border-[#CAA048]/50 shadow-xs hover:shadow-sm hover:-translate-y-0.5'
                }`}
                onClick={() => setSelectedType(tab.id)}
              >
                <Icon
                  className={`size-4 sm:size-4.5 shrink-0 transition-colors duration-300 ${
                    isSelected ? 'text-[#CAA048]' : 'text-gray-400 group-hover:text-[#CAA048]'
                  }`}
                  aria-hidden="true"
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 3. Toolbar: Switcher, Filter Toggle & Counter */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-between gap-4 pb-6 pt-2 border-b border-gray-100 mb-8">
          <div className="text-xs sm:text-sm text-gray-600 font-cairo">
            تم العثور على <strong className="text-brand-black font-bold font-cairo text-sm sm:text-base">{properties.length}</strong> وحدة مطروحة
          </div>

          <div className="grid grid-cols-[1fr_auto] sm:flex items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
            {/* View Switcher */}
            <div className="grid grid-cols-2 bg-gray-100 border border-gray-200 rounded-xl p-1 min-w-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setPropertiesViewMode('grid')}
                className={`px-2.5 sm:px-3.5 py-2 rounded-lg transition-all duration-300 cursor-pointer text-xs sm:text-sm font-bold font-almarai min-h-[40px] flex items-center justify-center whitespace-nowrap ${propertiesViewMode === 'grid'
                    ? 'bg-[#111315] text-white border border-[#CAA048]/60 shadow-sm'
                    : 'text-gray-600 hover:text-brand-black'
                  }`}
              >
                كروت العرض
              </button>
              <button
                type="button"
                onClick={() => setPropertiesViewMode('table')}
                className={`px-2.5 sm:px-3.5 py-2 rounded-lg transition-all duration-300 cursor-pointer text-xs sm:text-sm font-bold font-almarai min-h-[40px] flex items-center justify-center whitespace-nowrap ${propertiesViewMode === 'table'
                    ? 'bg-[#111315] text-white border border-[#CAA048]/60 shadow-sm'
                    : 'text-gray-600 hover:text-brand-black'
                  }`}
              >
                جدول التفاصيل
              </button>
            </div>

            {/* Local Filter Toggle */}
            <button
              type="button"
              onClick={() => setShowLocalFilters(!showLocalFilters)}
              className={`flex items-center justify-center p-2.5 rounded-xl border transition-all duration-300 cursor-pointer shrink-0 min-w-[44px] min-h-[44px] ${showLocalFilters
                  ? 'bg-[#111315] text-[#CAA048] border-[#CAA048] shadow-md scale-95'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-[#CAA048] hover:text-[#CAA048] shadow-sm'
                }`}
              title="تصفية العقارات"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
              </svg>
            </button>
          </div>
        </div>

        {/* Local Filter Card */}
        <AnimatePresence>
          {showLocalFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              onAnimationStart={() => setIsLocalFiltersOpenComplete(false)}
              onAnimationComplete={() => {
                if (showLocalFilters) setIsLocalFiltersOpenComplete(true);
              }}
              className={`w-full mb-8 relative z-30 ${isLocalFiltersOpenComplete ? 'overflow-visible' : 'overflow-hidden'}`}
            >
              <div className="p-5 sm:p-7 bg-white border border-gray-200 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.08)] flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                  <div className="space-y-1.5 text-start">
                    <label htmlFor="local-filter-city" className="block text-xs font-bold text-gray-700 mb-2 flex items-center gap-1 font-cairo">
                      <MapPin className="w-3.5 h-3.5 text-[#CAA048]" /> المدينة
                    </label>
                    <CustomSelect
                      id="local-filter-city"
                      title="تصفية بالمدينة"
                      options={CITY_OPTIONS}
                      value={selectedCity}
                      onChange={setSelectedCity}
                    />
                  </div>

                  <div className="space-y-1.5 text-start">
                    <label htmlFor="local-filter-type" className="block text-xs font-bold text-gray-700 mb-2 flex items-center gap-1 font-cairo">
                      <Building className="w-3.5 h-3.5 text-[#CAA048]" /> نوع العقار
                    </label>
                    <CustomSelect
                      id="local-filter-type"
                      title="تصفية بنوع العقار"
                      options={TYPE_OPTIONS}
                      value={selectedType}
                      onChange={setSelectedType}
                    />
                  </div>

                  <div className="space-y-1.5 text-start">
                    <label htmlFor="local-filter-rooms" className="block text-xs font-bold text-gray-700 mb-2 flex items-center gap-1 font-cairo">
                      <Layers className="w-3.5 h-3.5 text-[#CAA048]" /> عدد الغرف
                    </label>
                    <CustomSelect
                      id="local-filter-rooms"
                      title="تصفية بعدد الغرف"
                      options={ROOMS_OPTIONS}
                      value={selectedRooms}
                      onChange={setSelectedRooms}
                    />
                  </div>

                  <div className="space-y-1.5 text-start">
                    <label htmlFor="local-filter-price" className="block text-xs font-bold text-gray-700 mb-2 flex items-center gap-1 font-cairo">
                      <DollarSign className="w-3.5 h-3.5 text-[#CAA048]" /> السعر الأقصى
                    </label>
                    <CustomSelect
                      id="local-filter-price"
                      title="تصفية بالحد الأقصى للسعر"
                      options={PRICE_OPTIONS}
                      value={maxPrice}
                      onChange={setMaxPrice}
                    />
                  </div>
                </div>

                {(selectedCity !== 'all' || selectedType !== 'all' || selectedRooms !== 'all' || maxPrice !== 'all') && (
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCity('all');
                        setSelectedType('all');
                        setSelectedRooms('all');
                        setMaxPrice('all');
                      }}
                      className="text-xs text-gray-500 hover:text-[#CAA048] transition-colors duration-200 underline cursor-pointer font-cairo min-h-[44px] px-2 flex items-center"
                    >
                      إعادة تعيين الفلاتر
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="space-y-12">
            {/* Featured Skeleton */}
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

            {/* Cards Skeleton Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[1, 2, 3, 4].map((idx) => (
                <div key={idx} className="bg-white rounded-2xl overflow-hidden border border-gray-200 p-4 space-y-3 shadow-sm">
                  <div className="aspect-[16/10] rounded-xl skeleton-luxury"></div>
                  <div className="h-4 w-3/4 rounded skeleton-luxury"></div>
                  <div className="h-3 w-1/2 rounded skeleton-luxury"></div>
                  <div className="h-8 w-full rounded skeleton-luxury"></div>
                </div>
              ))}
            </div>
          </div>
        ) : properties.length > 0 ? (
          <div className="space-y-12">
            {propertiesViewMode === 'table' ? (
              <div ref={propertiesTableRef} className="custom-table-wrapper w-full max-h-[60vh] overflow-auto rounded-2xl border border-gray-200 bg-white shadow-xl scrollbar-thin" dir="rtl">
                <table className="w-full min-w-[950px] text-start text-xs sm:text-sm table-auto border-collapse" dir="rtl">
                  <thead className="sticky top-0 z-20 shadow-sm bg-gray-50">
                    <tr className="border-b border-gray-200 text-brand-black font-cairo">
                      <th className="py-4 px-5 font-bold whitespace-nowrap border-x border-gray-200/80 text-start bg-gray-50">الصورة</th>
                      <th className="py-4 px-5 font-bold whitespace-nowrap border-x border-gray-200/80 text-start bg-gray-50">اسم الوحدة</th>
                      <th className="py-4 px-5 font-bold whitespace-nowrap border-x border-gray-200/80 text-start bg-gray-50">النوع</th>
                      <th className="py-4 px-5 font-bold whitespace-nowrap border-x border-gray-200/80 text-start bg-gray-50">الموقع</th>
                      <th className="py-4 px-5 font-bold whitespace-nowrap border-x border-gray-200/80 text-start bg-gray-50">المساحة</th>
                      <th className="py-4 px-5 font-bold whitespace-nowrap border-x border-gray-200/80 text-start bg-gray-50">الغرف / الحمامات</th>
                      <th className="py-4 px-5 font-bold whitespace-nowrap border-x border-gray-200/80 text-start bg-gray-50">السعر</th>
                      <th className="py-4 px-5 font-bold whitespace-nowrap text-center border-x border-gray-200/80 bg-gray-50">التفاصيل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-gray-800 bg-white">
                    {properties.map((property) => {
                      let typeLabel = 'شقة';
                      if (property.type === 'villa') typeLabel = 'فيلا';
                      else if (property.type === 'annex') typeLabel = 'ملحق';
                      else if (property.type === 'penthouse') typeLabel = 'بنتهاوس';
                      else if (property.type === 'duplex') typeLabel = 'دوبلكس';

                      return (
                        <tr key={property.id} className="odd:bg-white even:bg-gray-50/50 hover:bg-[#CAA048]/[0.05] transition-colors duration-150 border-b border-gray-100">
                          <td className="py-3 px-5 border-x border-gray-200/60 text-start">
                            <div className="relative w-14 h-10 rounded-lg overflow-hidden border border-gray-200 shadow-sm shrink-0">
                              <Image src={property.media.thumbnail} alt={property.title} fill sizes="56px" className="object-cover" />
                            </div>
                          </td>
                          <td className="py-3 px-5 font-semibold text-brand-black border-x border-gray-200/60 text-start whitespace-nowrap font-cairo">{property.title}</td>
                          <td className="py-3 px-5 text-gray-600 border-x border-gray-200/60 text-start">
                            <span className="inline-block py-1 px-3 text-xs font-semibold text-white bg-[#111315] border border-[#CAA048]/50 rounded-full whitespace-nowrap font-cairo">
                              {typeLabel}
                            </span>
                          </td>
                          <td className="py-3 px-5 text-gray-600 border-x border-gray-200/60 text-start whitespace-nowrap font-cairo">
                            {property.location.city}، {property.location.district}
                          </td>
                          <td className="py-3 px-5 font-cairo text-brand-black border-x border-gray-200/60 font-semibold text-start whitespace-nowrap">
                            {property.specs.area} م²
                          </td>
                          <td className="py-3 px-5 text-gray-600 border-x border-gray-200/60 text-start whitespace-nowrap font-cairo">
                            {property.specs.bedrooms} غرف / {property.specs.bathrooms} حمام
                          </td>
                          <td className="py-3 px-5 font-bold text-brand-black font-cairo border-x border-gray-200/60 text-start whitespace-nowrap">
                            {property.pricing.price.toLocaleString()} ر.س
                          </td>
                          <td className="py-3 px-5 text-center border-x border-gray-200/60">
                            <Link href={`/property/${property.slug}`} className="py-2 px-5 text-xs font-bold btn-premium-gold rounded-lg inline-block font-cairo whitespace-nowrap min-w-[125px] min-h-[44px] flex items-center justify-center">
                              عرض كامل التفاصيل
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <>
                {featuredProperty && <FeaturedPropertyCard property={featuredProperty} />}
                {carouselProperties.length > 0 && (
                  <div className="w-full mt-6 mb-8 relative">
                    <RTLContinuousCarousel gap="gap-4 sm:gap-6">
                      {carouselProperties.map((property) => (
                        <div key={property.id} className="ps-1">
                          <SimplifiedPropertyCard property={property} />
                        </div>
                      ))}
                    </RTLContinuousCarousel>
                  </div>
                )}
              </>
            )}

            <div className="text-center mt-6">
              <Link
                href="/properties"
                className="py-3.5 px-10 text-xs sm:text-sm font-bold btn-premium-gold inline-flex items-center gap-2 cursor-pointer font-cairo min-h-[44px]"
              >
                <span>عرض جميع الوحدات العقارية</span>
                <ArrowLeft className="w-4 h-4 transition-transform duration-300 -translate-x-0.5 group-hover:-translate-x-1.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 border border-gray-200 rounded-3xl max-w-md mx-auto shadow-sm p-6">
            <Building className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-700 font-cairo">عذراً، لم نجد أي عروض تطابق فلاتر البحث الحالية.</p>
            <button
              type="button"
              className="mt-4 text-xs font-bold text-[#CAA048] underline hover:text-[#B88E3E] cursor-pointer min-h-[44px] px-4 font-cairo"
              onClick={() => {
                setSelectedCity('all');
                setSelectedType('all');
                setSelectedRooms('all');
                setMaxPrice('all');
              }}
            >
              إعادة تهيئة الفلاتر
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
