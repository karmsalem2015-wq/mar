// src/components/property/PropertyActions.tsx
'use client';

import React, { useState } from 'react';
import { Heart, Share2, Phone, MessageCircle, Info } from 'lucide-react';
import { useInquiryStore } from '@/store/useInquiryStore';

interface FavoriteShareProps {
  title: string;
}

export function PropertyFavoriteShare({ title }: FavoriteShareProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      alert("تم نسخ رابط العقار لمشاركته!");
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => setIsFavorite(!isFavorite)}
        type="button"
        aria-label={isFavorite ? "إزالة من المفضلة" : "إضافة للمفضلة"}
        className={`p-3 rounded-full border transition-all duration-300 cursor-pointer ${
          isFavorite 
            ? 'bg-rose-50 text-rose-500 border-rose-200 shadow-sm' 
            : 'bg-white border-gray-200 text-gray-700 hover:text-[#CAA048] hover:border-[#CAA048]'
        }`}
      >
        <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
      </button>
      <button
        type="button"
        onClick={handleShare}
        aria-label="مشاركة رابط العقار"
        title="مشاركة رابط العقار"
        className="p-3 rounded-full bg-white border border-gray-200 hover:border-[#CAA048] text-gray-700 hover:text-[#CAA048] transition-all duration-300 cursor-pointer shadow-sm"
      >
        <Share2 className="w-5 h-5" />
      </button>
    </div>
  );
}

interface SidebarInquiryProps {
  whatsappLink: string;
}

export function PropertySidebarInquiry({ whatsappLink }: SidebarInquiryProps) {
  const openInquiry = useInquiryStore((state) => state.open);

  return (
    <div className="space-y-3.5">
      <button
        type="button"
        onClick={openInquiry}
        className="w-full py-3.5 text-xs sm:text-sm font-bold btn-mar-black rounded-full flex items-center justify-center gap-2 cursor-pointer font-cairo shadow-md transition-all"
      >
        <Phone className="w-4 h-4 shrink-0 text-[#CAA048]" />
        <span>حجز موعد للمعاينة</span>
      </button>

      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-3 text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center gap-2 transition-all duration-300 text-center font-cairo shadow-sm"
      >
        <MessageCircle className="w-4 h-4 shrink-0" />
        <span>مراسلة عبر واتساب</span>
      </a>

      <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-gray-50 border border-gray-200 text-[11px] text-gray-500 font-cairo">
        <Info className="w-4 h-4 text-[#CAA048] shrink-0" />
        <span>يرجى كتابة اسم العقار عند التواصل لتسهيل خدمتكم.</span>
      </div>
    </div>
  );
}
