// src/app/properties/page.tsx
'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { PROPERTIES, Property } from '@/lib/mockData';
import { getPropertiesListAdmin } from '@/app/actions/properties';
import { USE_DATABASE } from '@/config/brand';
import { normalizeProperty } from '@/lib/normalizers';
import PropertyCard from '@/components/property/PropertyCard';
import CustomSelect from '@/components/ui/CustomSelect';
import RTLContinuousCarousel from '@/components/ui/RTLContinuousCarousel';
import { useInquiryStore } from '@/store/useInquiryStore';
import {
  Search,
  MapPin,
  Building2,
  Ruler,
  Bed,
  Bath,
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
  Compass
} from 'lucide-react';

// Sub-component for horizontal detailed card view
const DetailedPropertyCard = ({ property, openInquiry, index = 0 }: { property: Property; openInquiry: () => void; index?: number }) => {
  let typeLabel = '';
  if (property.type === 'apartment') typeLabel = 'شقة سكنية';
  else if (property.type === 'villa') typeLabel = 'فيلا مستقلة';
  else if (property.type === 'annex') typeLabel = 'ملحق روف';
  else if (property.type === 'penthouse') typeLabel = 'بنتهاوس فاخر';
  else if (property.type === 'duplex') typeLabel = 'دوبلكس';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(price) + ' ر.س';
  };

  const formatArea = (area: number) => {
    return `${new Intl.NumberFormat('en-US').format(area)} م²`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.55, delay: (index % 3) * 0.12, ease: [0.16, 1, 0.3, 1] }}
      className="group flex flex-col lg:flex-row bg-white border border-gray-200/90 rounded-3xl overflow-hidden shadow-sm transition-all duration-300 hover:border-[#CAA048] hover:shadow-[0_16px_40px_rgba(0,0,0,0.08),0_0_0_1px_rgba(202,160,72,0.4)] font-cairo"
    >
      {/* Image Block */}
      <div className="relative w-full lg:w-[35%] aspect-[16/10] lg:aspect-auto min-h-[240px] overflow-hidden bg-gray-100">
        <Image
          src={property.media.thumbnail || '/properties/apartment.webp'}
          alt={property.title}
          fill
          sizes="(max-width: 1024px) 100vw, 35vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105 z-0"
        />
        <div className="absolute top-4 start-4 z-20">
          <span className="px-3 py-1 text-[10px] font-bold text-white bg-status-available rounded-full shadow-sm font-cairo">
            {property.status === 'available' ? 'متاح للبيع' : 'محجوز'}
          </span>
        </div>
      </div>

      {/* Info Block */}
      <div className="flex-1 p-6 sm:p-8 flex flex-col text-right justify-between">
        <div>
          <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
            <div>
              <div className="flex items-center gap-1.5 mb-1.5 text-xs text-gray-500">
                <span className="w-1.5 h-1.5 rounded-full bg-[#CAA048]"></span>
                <span>{property.project.name}</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-brand-black leading-tight font-almarai group-hover:text-[#CAA048] transition-colors">
                {property.title}
              </h3>
            </div>
            <div className="text-right lg:text-left">
              <span className="text-[10px] text-gray-400 block mb-0.5 font-cairo">السعر الإجمالي</span>
              <span className="text-lg sm:text-xl font-bold text-[#CAA048] font-almarai">
                {formatPrice(property.pricing.price)}
              </span>
              {property.pricing.pricePerMeter > 0 && (
                <span className="block text-[10px] text-gray-500 mt-0.5 font-mono">
                  ({formatPrice(property.pricing.pricePerMeter)} / م²)
                </span>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
            <MapPin className="w-3.5 h-3.5 text-[#CAA048] shrink-0" />
            <span>{property.location.address}</span>
          </div>

          {/* Description */}
          <p className="text-xs text-gray-600 leading-relaxed mb-5 line-clamp-2 font-cairo">
            {property.description}
          </p>

          {/* Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3 rounded-2xl bg-gray-50 border border-gray-100 mb-5 text-xs text-gray-600 text-center">
            <div className="flex flex-col items-center justify-center gap-1">
              <span className="text-[10px] text-gray-400">المساحة</span>
              <div className="flex items-center gap-1 font-bold text-brand-black font-mono">
                <Ruler className="w-3.5 h-3.5 text-[#CAA048]" />
                <span>{formatArea(property.specs.area)}</span>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-1 border-s sm:border-s-0 sm:border-x border-gray-200">
              <span className="text-[10px] text-gray-400">الغرف</span>
              <div className="flex items-center gap-1 font-bold text-brand-black font-mono">
                <Bed className="w-3.5 h-3.5 text-[#CAA048]" />
                <span>{property.specs.bedrooms}</span>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-1 border-s border-gray-200">
              <span className="text-[10px] text-gray-400">الحمامات</span>
              <div className="flex items-center gap-1 font-bold text-brand-black font-mono">
                <Bath className="w-3.5 h-3.5 text-[#CAA048]" />
                <span>{property.specs.bathrooms}</span>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-1 border-s border-gray-200">
              <span className="text-[10px] text-gray-400">الفئة</span>
              <span className="font-bold text-[#CAA048] font-cairo">{typeLabel}</span>
            </div>
          </div>

          {/* Features */}
          {property.specs.features && property.specs.features.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {property.specs.features.slice(0, 4).map((feat, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold text-white bg-[#111315]/65 backdrop-blur-md border border-white/20 rounded-lg font-cairo shadow-xs"
                >
                  <Check className="w-3 h-3 text-[#CAA048]" />
                  <span>{feat}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100 mt-auto">
          <button
            type="button"
            onClick={openInquiry}
            className="py-2.5 px-6 text-xs font-bold btn-mar-black rounded-xl flex items-center justify-center gap-1.5 cursor-pointer font-almarai transition-all shadow-sm"
          >
            <span>طلب معاينة خاصة</span>
          </button>

          <a
            href={`https://wa.me/966568526666?text=${encodeURIComponent(`السلام عليكم، أريد الاستفسار عن الوحدة العقارية: ${property.title}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-4 text-xs font-bold bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl transition-colors flex items-center justify-center gap-1.5 font-almarai shadow-sm"
          >
            <MessageCircle className="w-4 h-4" />
            <span>واتساب</span>
          </a>

          <a
            href="tel:+966568526666"
            className="py-2.5 px-4 text-xs font-bold bg-gray-100 hover:bg-[#111315] hover:text-[#CAA048] text-brand-black border border-transparent hover:border-[#CAA048] rounded-xl transition-all flex items-center justify-center gap-1.5 font-almarai"
          >
            <Phone className="w-4 h-4 text-[#CAA048]" />
            <span>اتصال</span>
          </a>

          <Link
            href={`/property/${property.slug}`}
            className="ms-auto py-2 px-3 text-xs font-bold text-gray-500 hover:text-[#CAA048] transition-colors flex items-center gap-1 font-almarai"
          >
            <span>عرض التفاصيل</span>
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default function PropertiesPage() {
  const [dbProperties, setDbProperties] = useState<Property[]>(PROPERTIES);

  useEffect(() => {
    if (!USE_DATABASE) return;
    async function loadData() {
      try {
        const propsData = await getPropertiesListAdmin();
        if (propsData && propsData.length > 0) {
          setDbProperties(propsData.map(normalizeProperty));
        }
      } catch (e) {
        console.error("Error loading properties page data:", e);
      }
    }
    loadData();
  }, []);

  const shouldReduceMotion = useReducedMotion();
  const openInquiry = useInquiryStore((state) => state.open);

  // Layout switcher state
  const [viewMode, setViewMode] = useState<'grid' | 'detailed' | 'carousel' | 'table'>('grid');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedRooms, setSelectedRooms] = useState('all');
  const [selectedBaths, setSelectedBaths] = useState('all');
  const [minPrice, setMinPrice] = useState('all');
  const [maxPrice, setMaxPrice] = useState('all');
  const [minArea, setMinArea] = useState('all');
  const [maxArea, setMaxArea] = useState('all');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isAdvancedOpenComplete, setIsAdvancedOpenComplete] = useState(false);

  // References
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Dynamic lists extraction
  const cityOptions = useMemo(() => {
    const citiesSet = new Set<string>();
    dbProperties.forEach(p => citiesSet.add(p.location.city));
    const citiesArray = Array.from(citiesSet);
    return [
      { value: 'all', label: 'كل المدن' },
      ...citiesArray.map(c => ({ value: c, label: c }))
    ];
  }, [dbProperties]);

  const typeOptions = useMemo(() => [
    { value: 'all', label: 'كل الأنواع' },
    { value: 'apartment', label: 'شقة' },
    { value: 'villa', label: 'فيلا' },
    { value: 'annex', label: 'ملحق' },
    { value: 'penthouse', label: 'بنتهاوس' },
    { value: 'duplex', label: 'دوبلكس' }
  ], []);

  const roomOptions = useMemo(() => [
    { value: 'all', label: 'الكل' },
    { value: '2', label: 'غرفتين' },
    { value: '3', label: '٣ غرف' },
    { value: '4', label: '٤ غرف' },
    { value: '5', label: '٥ غرف' },
    { value: '6', label: '٦ غرف فأكثر' }
  ], []);

  const bathOptions = useMemo(() => [
    { value: 'all', label: 'الكل' },
    { value: '2', label: 'حمامين' },
    { value: '3', label: '٣ حمامات' },
    { value: '4', label: '٤ حمامات' },
    { value: '5', label: '٥ حمامات فأكثر' }
  ], []);

  const minPriceOptions = useMemo(() => [
    { value: 'all', label: 'الحد الأدنى للسعر' },
    { value: '500000', label: '٥٠٠,٠٠٠ ر.س' },
    { value: '750000', label: '٧٥٠,٠٠٠ ر.س' },
    { value: '1000000', label: '١,٠٠٠,٠٠٠ ر.س' },
    { value: '1500000', label: '١,٥٠٠,٠٠٠ ر.س' },
    { value: '2000000', label: '٢,٠٠٠,٠٠٠ ر.س' },
    { value: '5000000', label: '٥,٠٠٠,٠٠٠ ر.س' },
    { value: '10000000', label: '١٠,٠٠٠,٠٠٠ ر.س' }
  ], []);

  const maxPriceOptions = useMemo(() => [
    { value: 'all', label: 'الحد الأقصى للسعر' },
    { value: '750000', label: '٧٥٠,٠٠٠ ر.س' },
    { value: '1000000', label: '١,٠٠٠,٠٠٠ ر.س' },
    { value: '1500000', label: '١,٥٠٠,٠٠٠ ر.س' },
    { value: '2000000', label: '٢,٠٠٠,٠٠٠ ر.س' },
    { value: '5000000', label: '٥,٠٠٠,٠٠٠ ر.س' },
    { value: '10000000', label: '١٠,٠٠٠,٠٠٠ ر.س' },
    { value: '20000000', label: '٢٠,٠٠٠,٠٠٠ ر.س' }
  ], []);

  const minAreaOptions = useMemo(() => [
    { value: 'all', label: 'الحد الأدنى للمساحة' },
    { value: '100', label: '١٠٠ م²' },
    { value: '150', label: '١٥٠ م²' },
    { value: '200', label: '٢٠٠ م²' },
    { value: '250', label: '٢٥٠ م²' },
    { value: '300', label: '٣٠٠ م²' },
    { value: '400', label: '٤٠٠ م²' }
  ], []);

  const maxAreaOptions = useMemo(() => [
    { value: 'all', label: 'الحد الأقصى للمساحة' },
    { value: '150', label: '١٥٠ م²' },
    { value: '200', label: '٢٠٠ م²' },
    { value: '250', label: '٢٥٠ م²' },
    { value: '300', label: '٣٠٠ م²' },
    { value: '400', label: '٤٠٠ م²' },
    { value: '500', label: '٥٠٠ م²' },
    { value: '1000', label: '١٠٠٠ م²' }
  ], []);

  // Extract unique districts dynamically depending on the selected city
  const districtOptions = useMemo(() => {
    const districtsSet = new Set<string>();
    dbProperties.forEach(p => {
      if (selectedCity === 'all' || p.location.city === selectedCity) {
        districtsSet.add(p.location.district);
      }
    });
    const districtsArray = Array.from(districtsSet);
    return [
      { value: 'all', label: 'كل الأحياء' },
      ...districtsArray.map(d => ({ value: d, label: d }))
    ];
  }, [dbProperties, selectedCity]);

  // Extract unique amenities list dynamically
  const availableAmenities = useMemo(() => {
    const amenitiesSet = new Set<string>();
    dbProperties.forEach(p => {
      if (p.specs.features) {
        p.specs.features.forEach(feat => amenitiesSet.add(feat));
      }
    });
    return Array.from(amenitiesSet);
  }, [dbProperties]);

  // Filter properties logic
  const filteredProperties = useMemo(() => {
    return dbProperties.filter(p => {
      // 1. Keyword search
      const query = searchQuery.trim().toLowerCase();
      if (query !== '') {
        const matchTitle = p.title.toLowerCase().includes(query);
        const matchDesc = p.description.toLowerCase().includes(query);
        const matchDistrict = p.location.district.toLowerCase().includes(query);
        const matchCity = p.location.city.toLowerCase().includes(query);
        const matchProject = p.project.name.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchDistrict && !matchCity && !matchProject) return false;
      }

      // 2. City
      if (selectedCity !== 'all' && p.location.city !== selectedCity) return false;

      // 3. District
      if (selectedDistrict !== 'all' && p.location.district !== selectedDistrict) return false;

      // 4. Type
      if (selectedType !== 'all' && p.type !== selectedType) return false;

      // 5. Rooms
      if (selectedRooms !== 'all') {
        const roomsNum = p.specs.bedrooms;
        if (selectedRooms === '6') {
          if (roomsNum < 6) return false;
        } else {
          if (roomsNum.toString() !== selectedRooms) return false;
        }
      }

      // 6. Bathrooms
      if (selectedBaths !== 'all') {
        const bathsNum = p.specs.bathrooms;
        if (selectedBaths === '5') {
          if (bathsNum < 5) return false;
        } else {
          if (bathsNum.toString() !== selectedBaths) return false;
        }
      }

      // 7. Price
      if (minPrice !== 'all' && p.pricing.price < Number(minPrice)) return false;
      if (maxPrice !== 'all' && p.pricing.price > Number(maxPrice)) return false;

      // 8. Area
      if (minArea !== 'all' && p.specs.area < Number(minArea)) return false;
      if (maxArea !== 'all' && p.specs.area > Number(maxArea)) return false;

      // 9. Amenities (Logical AND: property must match all selected amenities)
      if (selectedAmenities.length > 0) {
        if (!p.specs.features) return false;
        const hasAll = selectedAmenities.every(feat => p.specs.features?.includes(feat));
        if (!hasAll) return false;
      }

      return true;
    });
  }, [
    dbProperties,
    searchQuery,
    selectedCity,
    selectedDistrict,
    selectedType,
    selectedRooms,
    selectedBaths,
    minPrice,
    maxPrice,
    minArea,
    maxArea,
    selectedAmenities
  ]);

  // Reset all filters helper
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCity('all');
    setSelectedDistrict('all');
    setSelectedType('all');
    setSelectedRooms('all');
    setSelectedBaths('all');
    setMinPrice('all');
    setMaxPrice('all');
    setMinArea('all');
    setMaxArea('all');
    setSelectedAmenities([]);
  };

  // Toggle amenity selection helper
  const handleToggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  // Track the number of active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery !== '') count++;
    if (selectedCity !== 'all') count++;
    if (selectedDistrict !== 'all') count++;
    if (selectedType !== 'all') count++;
    if (selectedRooms !== 'all') count++;
    if (selectedBaths !== 'all') count++;
    if (minPrice !== 'all') count++;
    if (maxPrice !== 'all') count++;
    if (minArea !== 'all') count++;
    if (maxArea !== 'all') count++;
    count += selectedAmenities.length;
    return count;
  }, [
    searchQuery,
    selectedCity,
    selectedDistrict,
    selectedType,
    selectedRooms,
    selectedBaths,
    minPrice,
    maxPrice,
    minArea,
    maxArea,
    selectedAmenities
  ]);

  // Dynamic filter visibility depending on options availability
  const showCityFilter = useMemo(() => cityOptions.length > 2, [cityOptions]);
  const showDistrictFilter = useMemo(() => districtOptions.length > 2, [districtOptions]);

  const gridColsClass = useMemo(() => {
    let cols = 2; // Search query takes col-span-2
    if (showCityFilter) cols += 1;
    if (showDistrictFilter) cols += 1;
    return `grid grid-cols-1 md:grid-cols-${cols} gap-4`;
  }, [showCityFilter, showDistrictFilter]);

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
  }, [viewMode, filteredProperties]);

  // Carousel layout buttons trigger helpers
  const handleCarouselNav = (direction: 'next' | 'prev') => {
    if (carouselRef.current) {
      const container = carouselRef.current;
      const amount = container.clientWidth * 0.8;
      const sign = direction === 'next' ? -1 : 1; // negative leftwards in RTL
      container.scrollBy({ left: amount * sign, behavior: 'smooth' });
    }
  };

  // Helper for marquee repetition in carousel layout
  const carouselPropertiesList = useMemo(() => {
    return filteredProperties;
  }, [filteredProperties]);

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-brand-black relative overflow-x-hidden font-cairo" dir="rtl">
      {/* ----------------------------------------------------
         1. Full-screen Hero Section
         ---------------------------------------------------- */}
      <section className="relative min-h-[90vh] lg:min-h-screen w-full flex items-center justify-center bg-[#0d0d0f] overflow-hidden pt-28 sm:pt-36 pb-20 sm:pb-24">
        {/* Background Image & Soft Cinematic Overlays */}
        <div className="absolute inset-0 z-0 select-none">
          <Image
            src="/hero-bg-properties.jpg"
            alt="فلل ووحدات شركة مار العقارية الفاخرة"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center scale-[1.01] transition-transform duration-1000"
          />
          {/* Subtle architectural gradient: protects navbar & text contrast while letting the illuminated villa and pool shine through */}
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
            <span>محفظة مار العقارية الحصرية</span>
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-[4.2rem] font-black leading-[1.2] font-heading mb-6 drop-shadow-[0_4px_24px_rgba(0,0,0,0.65)] text-center tracking-tight"
          >
            <span className="block text-white">استكشف الوحدات</span>
            <span className="block bg-gradient-to-r from-[#FDE36E] via-[#F9CC40] to-[#E6A821] bg-clip-text text-transparent drop-shadow-md font-black mt-1 sm:mt-2">
              العقارية الفاخرة
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-sm sm:text-base md:text-lg text-white/95 leading-relaxed mb-10 max-w-2xl sm:max-w-3xl mx-auto text-center font-cairo text-pretty drop-shadow-md"
          >
            مجموعتنا الفريدة من الوحدات السكنية الفاخرة المصممة خصيصاً لتلبي تطلعاتكم في العيش الراقي، بمواقع استراتيجية وتشطيبات عالمية الجودة.
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
              <span>تواصل معنا للمعاينة</span>
            </button>

            <a
              href="#properties-listings-section"
              className="w-full sm:w-auto py-3.5 px-8 text-xs sm:text-sm font-bold bg-black/45 hover:bg-black/75 text-white border border-white/25 hover:border-[#CAA048] rounded-full flex items-center justify-center gap-2.5 transition-all duration-300 backdrop-blur-md font-cairo text-center shadow-lg"
            >
              <Compass className="w-4 h-4 shrink-0 text-[#CAA048]" />
              <span>تصفح كافة الوحدات</span>
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
              <span>وحدات حصرية جاهزة للتسليم</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/35 border border-white/10 backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-[#CAA048]" />
              <span>مرخصة عبر منصة فال وإتمام</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/35 border border-white/10 backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-sky-400" />
              <span>أرقى أحياء الرياض وجدة</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Listings Wrapper */}
      <div id="properties-listings-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 relative z-10">

        {/* Filter panel card */}
        <motion.section
          initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-8 shadow-sm mb-10 transition-all duration-300"
        >
          <div className="flex flex-col gap-6">

            {/* Primary filter row */}
            <div className={gridColsClass}>
              {/* Search input */}
              <div className="relative w-full text-right md:col-span-2">
                <label htmlFor="prop-search" className="sr-only">البحث عن وحدة</label>
                <div className="relative">
                  <input
                    id="prop-search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث باسم الوحدة، الحي، أو المشروع..."
                    className="w-full bg-gray-50 border border-gray-200 hover:border-[#CAA048]/50 focus:border-[#CAA048] focus:bg-white rounded-xl ps-12 pe-4 py-3 text-sm text-brand-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CAA048]/20 transition-all duration-200 font-cairo"
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

                    {/* Select options row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Property Type */}
                      <CustomSelect
                        id="type-select"
                        title="نوع العقار"
                        options={typeOptions}
                        value={selectedType}
                        onChange={setSelectedType}
                      />

                      {/* Rooms count */}
                      <CustomSelect
                        id="rooms-select"
                        title="عدد الغرف"
                        options={roomOptions}
                        value={selectedRooms}
                        onChange={setSelectedRooms}
                      />

                      {/* Bathrooms count */}
                      <CustomSelect
                        id="baths-select"
                        title="عدد الحمامات"
                        options={bathOptions}
                        value={selectedBaths}
                        onChange={setSelectedBaths}
                      />

                      {/* Area range */}
                      <div className="grid grid-cols-2 gap-2">
                        <CustomSelect
                          id="min-area-select"
                          title="أقل مساحة"
                          options={minAreaOptions}
                          value={minArea}
                          onChange={setMinArea}
                        />
                        <CustomSelect
                          id="max-area-select"
                          title="أقصى مساحة"
                          options={maxAreaOptions}
                          value={maxArea}
                          onChange={setMaxArea}
                        />
                      </div>
                    </div>

                    {/* Price options row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <CustomSelect
                        id="min-price-select"
                        title="الحد الأدنى للسعر"
                        options={minPriceOptions}
                        value={minPrice}
                        onChange={setMinPrice}
                      />
                      <CustomSelect
                        id="max-price-select"
                        title="الحد الأقصى للسعر"
                        options={maxPriceOptions}
                        value={maxPrice}
                        onChange={setMaxPrice}
                      />
                    </div>

                    {/* Amenities tag selectors */}
                    <div>
                      <span className="block text-xs font-bold text-[#181A1B] mb-3 font-cairo">المميزات والخدمات الخاصة:</span>
                      <div className="flex flex-wrap gap-2">
                        {availableAmenities.map((amenity) => {
                          const isSelected = selectedAmenities.includes(amenity);
                          return (
                            <button
                              key={amenity}
                              type="button"
                              onClick={() => handleToggleAmenity(amenity)}
                              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all duration-200 flex items-center gap-1.5 font-cairo ${isSelected
                                  ? 'bg-[#111315] border-[#CAA048] text-[#CAA048] font-bold shadow-sm ring-1 ring-[#CAA048]/30'
                                  : 'bg-white border-gray-200 text-gray-700 hover:border-[#CAA048] hover:text-[#111315]'
                                }`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5 text-[#CAA048]" />}
                              <span>{amenity}</span>
                            </button>
                          );
                        })}
                      </div>
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
                    : 'bg-white border-gray-200 text-gray-600 hover:border-[#CAA048] hover:text-[#111315]'
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
                تم العثور على <strong className="text-[#CAA048] font-mono text-sm font-bold">{filteredProperties.length}</strong> وحدة مطروحة
              </div>
            </div>

          </div>
        </motion.section>

        {/* Display modes switcher row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h2 className="text-lg font-bold text-brand-black font-cairo flex items-center gap-2">
            <Building className="w-5 h-5 text-[#CAA048]" />
            <span>قائمة الوحدات المتاحة</span>
          </h2>

          {/* Buttons Group */}
          <div className="flex items-center bg-gray-100 border border-gray-200 rounded-xl p-1 shrink-0 select-none shadow-xs">
            {/* Grid */}
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-label="عرض الكروت"
              title="عرض كروت العقارات"
              className={`p-2 rounded-lg transition-all duration-200 cursor-pointer ${viewMode === 'grid'
                  ? 'bg-[#111315] text-[#CAA048] border border-[#CAA048] shadow-xs'
                  : 'text-gray-500 hover:text-[#111315]'
                }`}
            >
              <LayoutGrid className={`w-4 h-4 ${viewMode === 'grid' ? 'text-[#CAA048]' : 'text-gray-500'}`} />
            </button>

            {/* Detailed Cards */}
            <button
              type="button"
              onClick={() => setViewMode('detailed')}
              aria-label="عرض التفاصيل الكاملة"
              title="عرض الكروت التفصيلية"
              className={`p-2 rounded-lg transition-all duration-200 cursor-pointer ${viewMode === 'detailed'
                  ? 'bg-[#111315] text-[#CAA048] border border-[#CAA048] shadow-xs'
                  : 'text-gray-500 hover:text-[#111315]'
                }`}
            >
              <List className={`w-4 h-4 ${viewMode === 'detailed' ? 'text-[#CAA048]' : 'text-gray-500'}`} />
            </button>

            {/* Carousel */}
            <button
              type="button"
              onClick={() => setViewMode('carousel')}
              aria-label="عرض المعرض التفاعلي"
              title="عرض تصفح الكاروسل"
              className={`p-2 rounded-lg transition-all duration-200 cursor-pointer ${viewMode === 'carousel'
                  ? 'bg-[#111315] text-[#CAA048] border border-[#CAA048] shadow-xs'
                  : 'text-gray-500 hover:text-[#111315]'
                }`}
            >
              <SlidersHorizontal className={`w-4 h-4 ${viewMode === 'carousel' ? 'text-[#CAA048]' : 'text-gray-500'}`} />
            </button>

            {/* Table */}
            <button
              type="button"
              onClick={() => setViewMode('table')}
              aria-label="عرض الجداول"
              title="عرض جدول التفاصيل"
              className={`p-2 rounded-lg transition-all duration-200 cursor-pointer ${viewMode === 'table'
                  ? 'bg-[#111315] text-[#CAA048] border border-[#CAA048] shadow-xs'
                  : 'text-gray-500 hover:text-[#111315]'
                }`}
            >
              <TableProperties className={`w-4 h-4 ${viewMode === 'table' ? 'text-[#CAA048]' : 'text-gray-500'}`} />
            </button>
          </div>
        </div>

        {/* Listings content render based on viewMode */}
        <section className="min-h-[250px]">
          {filteredProperties.length > 0 ? (
            <AnimatePresence mode="wait">

              {/* Grid Mode */}
              {viewMode === 'grid' && (
                <motion.div
                  key="grid-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
                >
                  {filteredProperties.map((property, index) => (
                    <PropertyCard key={property.id} property={property} index={index} />
                  ))}
                </motion.div>
              )}

              {/* Detailed Rows Mode */}
              {viewMode === 'detailed' && (
                <motion.div
                  key="detailed-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="flex flex-col gap-6"
                >
                  {filteredProperties.map((property, index) => (
                    <DetailedPropertyCard
                      key={property.id}
                      property={property}
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
                    {carouselPropertiesList.map((property) => (
                      <div
                        key={property.id}
                        className="w-[290px] sm:w-[350px] shrink-0 ps-1"
                      >
                        <PropertyCard property={property} />
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
                >
                  <div
                    ref={tableWrapperRef}
                    className="custom-table-wrapper w-full max-h-[60vh] overflow-auto rounded-2xl border border-gray-200 bg-white shadow-sm"
                    dir="rtl"
                  >
                    <table className="w-full min-w-[950px] text-right text-xs sm:text-[13px] table-auto border-collapse font-cairo">
                      <thead className="sticky top-0 z-20 shadow-xs">
                        <tr className="border-b border-gray-200 text-brand-black font-cairo bg-gray-50">
                          <th className="py-3.5 px-4 font-bold whitespace-nowrap border-x border-gray-200 first:border-s-0 last:border-e-0 text-right bg-gray-50">الصورة</th>
                          <th className="py-3.5 px-4 font-bold whitespace-nowrap border-x border-gray-200 first:border-s-0 last:border-e-0 text-right bg-gray-50">اسم الوحدة</th>
                          <th className="py-3.5 px-4 font-bold whitespace-nowrap border-x border-gray-200 first:border-s-0 last:border-e-0 text-right bg-gray-50">النوع</th>
                          <th className="py-3.5 px-4 font-bold whitespace-nowrap border-x border-gray-200 first:border-s-0 last:border-e-0 text-right bg-gray-50">الموقع</th>
                          <th className="py-3.5 px-4 font-bold whitespace-nowrap border-x border-gray-200 first:border-s-0 last:border-e-0 text-right bg-gray-50">المساحة</th>
                          <th className="py-3.5 px-4 font-bold whitespace-nowrap border-x border-gray-200 first:border-s-0 last:border-e-0 text-right bg-gray-50">الغرف / الحمامات</th>
                          <th className="py-3.5 px-4 font-bold whitespace-nowrap border-x border-gray-200 first:border-s-0 last:border-e-0 text-right bg-gray-50">السعر الإجمالي</th>
                          <th className="py-3.5 px-4 font-bold whitespace-nowrap text-center border-x border-gray-200 first:border-s-0 last:border-e-0 bg-gray-50">التفاصيل</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700 bg-white">
                        {filteredProperties.map((property) => {
                          let typeLabel = '';
                          if (property.type === 'apartment') typeLabel = 'شقة';
                          else if (property.type === 'villa') typeLabel = 'فيلا';
                          else if (property.type === 'annex') typeLabel = 'ملحق';
                          else if (property.type === 'penthouse') typeLabel = 'بنتهاوس';
                          else if (property.type === 'duplex') typeLabel = 'دوبلكس';

                          return (
                            <tr key={property.id} className="odd:bg-white even:bg-gray-50/50 hover:bg-[#CAA048]/[0.05] transition-colors border-b border-gray-100 last:border-b-0">
                              {/* Image */}
                              <td className="py-2.5 px-4 border-x border-gray-100 first:border-s-0 last:border-e-0 text-right">
                                <div className="relative w-14 h-10 rounded-lg overflow-hidden border border-gray-200 shadow-xs shrink-0">
                                  <Image
                                    src={property.media.thumbnail || '/properties/apartment.webp'}
                                    alt={property.title}
                                    fill
                                    sizes="56px"
                                    className="object-cover"
                                  />
                                </div>
                              </td>

                              {/* Title */}
                              <td className="py-2.5 px-4 font-semibold border-x border-gray-100 first:border-s-0 last:border-e-0 text-right whitespace-nowrap">
                                <span className="font-bold text-brand-black block">{property.title}</span>
                                <span className="text-[10px] text-gray-400 block mt-0.5">{property.project.name}</span>
                              </td>

                              {/* Type */}
                              <td className="py-2.5 px-4 border-x border-gray-100 first:border-s-0 last:border-e-0 text-right whitespace-nowrap">
                                <span className="inline-block py-0.5 px-2.5 text-[11px] font-bold text-[#111315] bg-white border border-[#CAA048]/50 rounded-full font-cairo">
                                  {typeLabel}
                                </span>
                              </td>

                              {/* Location */}
                              <td className="py-2.5 px-4 text-gray-500 border-x border-gray-100 first:border-s-0 last:border-e-0 text-right whitespace-nowrap font-cairo">
                                {property.location.city}، {property.location.district}
                              </td>

                              {/* Area */}
                              <td className="py-2.5 px-4 font-bold border-x border-gray-100 first:border-s-0 last:border-e-0 text-right whitespace-nowrap font-mono text-brand-black">
                                {new Intl.NumberFormat('en-US').format(property.specs.area)} م²
                              </td>

                              {/* Specs */}
                              <td className="py-2.5 px-4 text-gray-500 border-x border-gray-100 first:border-s-0 last:border-e-0 text-right whitespace-nowrap font-mono">
                                {property.specs.bedrooms} غرف / {property.specs.bathrooms} حمامات
                              </td>

                              {/* Price */}
                              <td className="py-2.5 px-4 font-bold text-[#CAA048] font-cairo border-x border-gray-100 first:border-s-0 last:border-e-0 text-right whitespace-nowrap">
                                {new Intl.NumberFormat('en-US').format(property.pricing.price)} ر.س
                              </td>

                              {/* Details button */}
                              <td className="py-2.5 px-4 text-center border-x border-gray-100 first:border-s-0 last:border-e-0">
                                <Link
                                  href={`/property/${property.slug}`}
                                  className="py-1 px-4 text-xs font-bold bg-[#111315] hover:bg-[#CAA048] hover:text-[#111315] text-white border border-[#CAA048]/30 rounded-lg inline-block font-cairo whitespace-nowrap text-center transition-colors"
                                >
                                  التفاصيل
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          ) : (
            /* Empty state */
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 bg-white border border-gray-200 rounded-3xl max-w-md mx-auto shadow-sm font-cairo"
            >
              <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-bold text-brand-black mb-2">لا توجد نتائج مطابقة</h3>
              <p className="text-xs text-gray-500 px-6 mb-6 leading-relaxed">
                لم نجد أي وحدات عقارية تطابق خيارات التصفية المحددة. يرجى تعديل خيارات البحث أو إعادة تعيين لوحة الفلاتر.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="py-2.5 px-6 text-xs font-bold bg-[#111315] hover:bg-[#CAA048] hover:text-[#111315] text-white border border-[#CAA048]/40 rounded-xl flex items-center justify-center gap-1.5 mx-auto cursor-pointer transition-colors shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>إعادة تعيين لوحة الفلاتر</span>
              </button>
            </motion.div>
          )}
        </section>

      </div>
    </main>
  );
}
