'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Building, Layers, DollarSign, X } from 'lucide-react';
import CustomSelect from '@/components/ui/CustomSelect';

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

interface SearchBarSectionProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedCity: string;
  setSelectedCity: (val: string) => void;
  selectedType: string;
  setSelectedType: (val: string) => void;
  selectedRooms: string;
  setSelectedRooms: (val: string) => void;
  maxPrice: string;
  setMaxPrice: (val: string) => void;
  handleSearch: (e: React.FormEvent) => void;
}

export default function SearchBarSection({
  searchQuery,
  setSearchQuery,
  selectedCity,
  setSelectedCity,
  selectedType,
  setSelectedType,
  selectedRooms,
  setSelectedRooms,
  maxPrice,
  setMaxPrice,
  handleSearch,
}: SearchBarSectionProps) {
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Close filter overlay when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setShowMobileFilters(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setShowMobileFilters(false);
      }
    }
    if (showMobileFilters) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showMobileFilters]);

  return (
    <section id="search-filter-section" className="relative z-40 w-[94%] sm:w-[92%] max-w-5xl mx-auto px-2 sm:px-4 -mt-10 sm:-mt-28 lg:-mt-32">
      <form ref={formRef} onSubmit={handleSearch} className="relative w-full">
        {/* Fully rounded (pill) search bar container */}
        <div className="p-2 sm:p-2.5 bg-white/95 backdrop-blur-xl border border-gray-200/90 rounded-full shadow-[0_15px_45px_rgba(0,0,0,0.08)] hover:border-[#CAA048]/50 relative z-50 transition-all duration-300">
          <div className="w-full bg-[#EAEAEA] hover:bg-[#E5E5E5] focus-within:bg-white border border-gray-300/90 focus-within:border-[#CAA048] focus-within:ring-2 focus-within:ring-[#CAA048]/25 rounded-full p-1.5 sm:p-2 flex items-center justify-between gap-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.07)] transition-all duration-200">
            {/* Search Input */}
            <div className="flex-1 flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white shadow-xs border border-gray-200/80 flex items-center justify-center shrink-0">
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#CAA048] shrink-0" />
              </div>
              <input
                id="hero-search-input"
                type="text"
                placeholder="ابحث بالحي، اسم المشروع، أو المعالم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-xs sm:text-sm font-semibold text-brand-black placeholder:text-gray-500 font-cairo text-start min-w-0 truncate"
              />
            </div>

            {/* Clear Query button */}
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-gray-500 hover:text-brand-black bg-white/80 hover:bg-white border border-gray-200/80 shrink-0 p-1.5 cursor-pointer transition-colors duration-200 min-w-[32px] min-h-[32px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center rounded-full shadow-2xs"
                title="مسح البحث"
                aria-label="مسح حقل البحث"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Search Submit Button */}
            <button
              type="submit"
              className="h-[42px] px-5 sm:px-7 text-xs sm:text-sm font-bold btn-premium-gold shrink-0 flex items-center gap-1.5 cursor-pointer font-cairo rounded-full whitespace-nowrap"
            >
              <Search className="w-4 h-4" />
              <span>بحث</span>
            </button>

            {/* Advanced Filter Toggle Trigger Button */}
            <button
              type="button"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center border transition-all duration-300 cursor-pointer shrink-0 ${
                showMobileFilters
                  ? 'bg-[#111315] text-[#CAA048] border-[#CAA048] shadow-md scale-95'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-[#CAA048] hover:text-[#CAA048] shadow-xs'
              }`}
              title={showMobileFilters ? "إغلاق التصفية" : "تصفية متقدمة"}
              aria-label={showMobileFilters ? "إغلاق التصفية" : "تصفية متقدمة"}
              aria-expanded={showMobileFilters}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
              </svg>
            </button>
          </div>
        </div>

        {/* Collapsible Advanced Filters Card (Absolute Overlay) */}
        <AnimatePresence>
          {showMobileFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="w-full absolute left-0 right-0 top-full mt-3 z-50 overflow-visible"
            >
              <div className="p-5 sm:p-7 bg-white/98 backdrop-blur-2xl border border-gray-200/90 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.18)] flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                  {/* City */}
                  <div className="space-y-1.5">
                    <label htmlFor="filter-city" className="block text-xs font-bold text-gray-700 mb-2 flex items-center gap-1 font-cairo">
                      <MapPin className="w-3.5 h-3.5 text-[#CAA048]" /> المدينة
                    </label>
                    <CustomSelect
                      id="filter-city"
                      title="تصفية بالمدينة"
                      options={CITY_OPTIONS}
                      value={selectedCity}
                      onChange={setSelectedCity}
                    />
                  </div>

                  {/* Type */}
                  <div className="space-y-1.5">
                    <label htmlFor="filter-type" className="block text-xs font-bold text-gray-700 mb-2 flex items-center gap-1 font-cairo">
                      <Building className="w-3.5 h-3.5 text-[#CAA048]" /> نوع العقار
                    </label>
                    <CustomSelect
                      id="filter-type"
                      title="تصفية بنوع العقار"
                      options={TYPE_OPTIONS}
                      value={selectedType}
                      onChange={setSelectedType}
                    />
                  </div>

                  {/* Rooms */}
                  <div className="space-y-1.5">
                    <label htmlFor="filter-rooms" className="block text-xs font-bold text-gray-700 mb-2 flex items-center gap-1 font-cairo">
                      <Layers className="w-3.5 h-3.5 text-[#CAA048]" /> عدد الغرف
                    </label>
                    <CustomSelect
                      id="filter-rooms"
                      title="تصفية بعدد الغرف"
                      options={ROOMS_OPTIONS}
                      value={selectedRooms}
                      onChange={setSelectedRooms}
                    />
                  </div>

                  {/* Max Price */}
                  <div className="space-y-1.5">
                    <label htmlFor="filter-price" className="block text-xs font-bold text-gray-700 mb-2 flex items-center gap-1 font-cairo">
                      <DollarSign className="w-3.5 h-3.5 text-[#CAA048]" /> السعر الأقصى
                    </label>
                    <CustomSelect
                      id="filter-price"
                      title="تصفية بالحد الأقصى للسعر"
                      options={PRICE_OPTIONS}
                      value={maxPrice}
                      onChange={setMaxPrice}
                    />
                  </div>

                  {/* Search & Apply CTA Button */}
                  <div className="space-y-1.5">
                    <span className="block text-xs font-bold text-transparent mb-2 hidden lg:block select-none pointer-events-none">&nbsp;</span>
                    <button
                      type="submit"
                      className="w-full h-[46px] text-xs sm:text-sm font-bold btn-premium-gold flex items-center justify-center gap-2 cursor-pointer font-cairo rounded-xl sm:rounded-2xl whitespace-nowrap shadow-md"
                    >
                      <Search className="w-4 h-4 shrink-0" />
                      <span>تطبيق الفلاتر</span>
                    </button>
                  </div>
                </div>

                {/* Reset filters */}
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
      </form>
    </section>
  );
}
