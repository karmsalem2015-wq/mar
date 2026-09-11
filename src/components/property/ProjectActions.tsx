// src/components/property/ProjectActions.tsx
'use client';

import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { useInquiryStore } from '@/store/useInquiryStore';

interface ProjectInquiryProps {
  whatsappLink: string;
}

export function ProjectSidebarInquiry({ whatsappLink }: ProjectInquiryProps) {
  const openInquiry = useInquiryStore((state) => state.open);

  return (
    <div className="space-y-3.5">
      <button
        type="button"
        onClick={openInquiry}
        className="w-full py-3.5 text-xs sm:text-sm font-bold btn-mar-black rounded-full flex items-center justify-center gap-2 cursor-pointer font-cairo shadow-md transition-all"
      >
        <Phone className="w-4 h-4 shrink-0 text-[#CAA048]" />
        <span>حجز استشارة أو موعد زيارة</span>
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
    </div>
  );
}
