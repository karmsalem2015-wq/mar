// src/components/property/PropertyCard.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Property } from '@/lib/mockData';
import { Bed, Bath, Ruler, MapPin, ArrowLeft } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  index?: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      delay: (i % 3) * 0.12,
      ease: [0.16, 1, 0.3, 1],
    }
  })
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }
};

export default function PropertyCard({ property, index = 0 }: PropertyCardProps) {
  // Format currency with English numerals
  const formatPrice = (price: number) => {
    if (!price || price <= 0) return 'السعر غير محدد';
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(price) + ' ر.س';
  };

  // Format area with English numerals
  const formatArea = (area: number) => {
    return `${new Intl.NumberFormat('en-US').format(area)} م²`;
  };

  // Get realistic property image based on type
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

  // Translate status badge
  const renderStatusBadge = (status: Property['status']) => {
    switch (status) {
      case 'available':
        return (
          <span className="px-3 py-1 text-[10px] font-extrabold text-white bg-status-available border border-status-available rounded-full shadow-[0_4px_12px_rgba(34,169,110,0.3)]">
            متاح للبيع
          </span>
        );
      case 'reserved':
        return (
          <span className="px-3 py-1 text-[10px] font-extrabold text-white bg-status-reserved border border-status-reserved rounded-full shadow-[0_4px_12px_rgba(212,136,58,0.3)]">
            محجوز
          </span>
        );
      case 'sold':
        return (
          <span className="px-3 py-1 text-[10px] font-extrabold text-white bg-status-sold border border-status-sold rounded-full shadow-[0_4px_12px_rgba(192,57,43,0.3)]">
            مباع
          </span>
        );
      case 'coming_soon':
        return (
          <span className="px-3 py-1 text-[10px] font-extrabold text-white bg-status-soon border border-status-soon rounded-full shadow-[0_4px_12px_rgba(36,112,194,0.3)]">
            قريباً
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-[10px] font-extrabold text-white bg-gray-600 border border-gray-600 rounded-full shadow-sm">
            غير محدد
          </span>
        );
    }
  };

  const hasRealImage = Boolean(property.media.thumbnail || property.media.gallery?.[0]);
  const displayImage = property.media.thumbnail || property.media.gallery?.[0] || getPropertyImage(property.type);

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      className="group relative flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-gray-200/90 hover:border-[#CAA048] transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:-translate-y-1.5 hover:shadow-[0_16px_40px_rgba(0,0,0,0.08),0_0_0_1px_rgba(202,160,72,0.4)] font-cairo"
    >
      {/* Top Gold Shimmer Bar */}
      <div className="absolute top-0 start-0 w-full h-[2.5px] bg-gradient-to-r from-transparent via-[#CAA048] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"></div>

      {/* Thumbnail Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {/* Subtle overlay for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10"></div>

        {/* Status Badge */}
        <div className="absolute top-4 start-4 z-20">
          {renderStatusBadge(property.status)}
        </div>

        {!hasRealImage && (
          <div className="absolute top-4 end-4 z-20">
            <span className="px-2.5 py-1 text-[10px] font-bold text-white bg-black/75 backdrop-blur-md rounded-full font-cairo">صورة توضيحية</span>
          </div>
        )}

        {/* Type tag overlay */}
        <div className="absolute bottom-4 start-4 z-20">
          <span className="px-2.5 py-1 text-[10px] font-bold text-white bg-black/75 backdrop-blur-md rounded-md uppercase font-cairo">
            {property.type === 'annex' ? 'ملحق روف' : property.type === 'villa' ? 'فيلا مستقلة' : property.type === 'penthouse' ? 'بنتهاوس' : 'شقة سكنية'}
          </span>
        </div>

        {/* Image with slow zoom effect on hover */}
        <Image
          src={displayImage}
          alt={property.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 z-0"
        />
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-5 sm:p-6 text-right">
        {/* Project Name */}
        <motion.div variants={itemVariants} className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-gray-500">
          <span className="w-1.5 h-1.5 rounded-full bg-[#CAA048]"></span>
          <span>{property.project.name}</span>
        </motion.div>

        {/* Title */}
        <motion.h3 variants={itemVariants} className="text-base font-bold text-brand-black mb-2.5 line-clamp-1 leading-snug group-hover:text-[#CAA048] transition-colors font-heading">
          {property.title}
        </motion.h3>

        {/* Address / Location */}
        <motion.div variants={itemVariants} className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
          <MapPin className="w-3.5 h-3.5 text-[#CAA048] shrink-0" />
          <span className="line-clamp-1">{property.location.district}، {property.location.city}</span>
        </motion.div>

        {/* Key Specs Icons */}
        <motion.div variants={itemVariants} className="grid grid-cols-3 gap-2 py-2.5 px-2 rounded-xl bg-gray-50 border border-gray-100 mb-4 text-xs text-gray-600">
          <div className="flex flex-col items-center justify-center gap-0.5">
            <span className="text-[10px] text-gray-400 font-medium">الغرف</span>
            <div className="flex items-center gap-1">
              <Bed className="w-3.5 h-3.5 text-[#CAA048]" />
              <span className="font-bold text-brand-black font-mono">{property.specs.bedrooms}</span>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-0.5 border-x border-gray-200">
            <span className="text-[10px] text-gray-400 font-medium">الحمامات</span>
            <div className="flex items-center gap-1">
              <Bath className="w-3.5 h-3.5 text-[#CAA048]" />
              <span className="font-bold text-brand-black font-mono">{property.specs.bathrooms}</span>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-0.5">
            <span className="text-[10px] text-gray-400 font-medium">المساحة</span>
            <div className="flex items-center gap-1">
              <Ruler className="w-3.5 h-3.5 text-[#CAA048]" />
              <span className="font-bold text-brand-black font-mono">{formatArea(property.specs.area)}</span>
            </div>
          </div>
        </motion.div>

        {/* Financial Values */}
        <motion.div variants={itemVariants} className="flex justify-between items-center mt-auto pt-3.5 border-t border-gray-100">
          <div>
            <p className="text-[10px] text-gray-400 font-medium mb-0.5">السعر الإجمالي</p>
            <p className="text-lg font-black text-brand-black font-almarai">
              {formatPrice(property.pricing.price)}
            </p>
          </div>
          {property.pricing.monthlyInstallment && (
            <div className="text-end">
              <p className="text-[10px] text-gray-400 font-medium mb-0.5">قسط متوقع</p>
              <p className="text-xs font-bold text-brand-black font-almarai">
                {new Intl.NumberFormat('en-US').format(property.pricing.monthlyInstallment)} ر.س
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Card Footer */}
      <motion.div variants={itemVariants} className="border-t border-gray-100 p-3.5 bg-gray-50/50">
        <Link
          href={`/property/${property.slug}`}
          className="btn-premium-gold w-full py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2 rounded-xl transition-all duration-200 cursor-pointer group/btn font-almarai shadow-sm"
        >
          <span>عرض التفاصيل</span>
          <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:-translate-x-1" />
        </Link>
      </motion.div>
    </motion.div>
  );
}
