// src/app/not-found.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-white text-brand-black flex flex-col items-center justify-center px-4 overflow-hidden font-cairo" dir="rtl">
      {/* Background accents */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#CAA048]/5 rounded-full blur-3xl pointer-events-none -z-10" />
      
      <div className="relative z-10 text-center max-w-md mx-auto space-y-6">
        <h1 className="text-7xl sm:text-9xl font-black text-[#CAA048] font-mono tracking-widest">
          404
        </h1>
        
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-brand-black">الصفحة غير موجودة</h2>
          <p className="text-sm text-gray-500 leading-relaxed font-cairo">
            العنوان الذي تحاول الوصول إليه غير متوفر حالياً أو تم نقله. نسعد بمساعدتك في العودة للرئيسية واستعراض أرقى الوحدات والمشاريع.
          </p>
        </div>

        <div className="pt-4 flex justify-center">
          <Link
            href="/"
            className="btn-premium-gold py-3 px-8 text-sm font-bold flex items-center gap-2 rounded-xl cursor-pointer shadow-md hover:shadow-lg font-cairo"
          >
            <Home className="w-4 h-4" />
            <span>العودة للرئيسية</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
