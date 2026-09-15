// src/app/property/[slug]/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { PROPERTIES } from '@/lib/mockData';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getPropertyBySlug } from '@/app/actions/properties';
import MediaGallery from '@/components/ui/MediaGallery';
import { PropertyFavoriteShare, PropertySidebarInquiry } from '@/components/property/PropertyActions';
import {
  Bed,
  Bath,
  Maximize2,
  MapPin,
  Building2,
  Compass,
  Layers,
  Car,
  ChevronLeft,
  ShieldCheck,
  Eye,
  Info,
  Sparkles,
  Map,
  CheckCircle,
  FileBadge,
  UserRound,
  Database,
  Warehouse,
  WashingMachine,
  DoorOpen,
  Trees
} from 'lucide-react';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate metadata dynamically on the server for search engine optimization
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  return {
    title: property ? `${property.title} | شركة مار العقارية` : 'وحدة عقارية فاخرة',
    description: property?.description || 'تصفح تفاصيل ومواصفات الوحدة العقارية المعروضة تملّكاً واستثماراً.',
  };
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  // Combine thumbnail and gallery images, ensuring thumbnail is the first image and no duplicates
  const galleryImages: string[] = [];
  if (property.media.thumbnail) {
    galleryImages.push(property.media.thumbnail);
  }
  if (Array.isArray(property.media.images)) {
    property.media.images.forEach((img: string) => {
      if (img && !galleryImages.includes(img)) {
        galleryImages.push(img);
      }
    });
  }
  if (galleryImages.length === 0) {
    galleryImages.push('/properties/apartment.webp');
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(price) + ' ر.س';
  };

  const propertyTypeLabel = (() => {
    switch (property.type) {
      case 'apartment': return 'شقة سكنية';
      case 'villa': return 'فيلا فاخرة';
      case 'annex': return 'ملحق روف';
      case 'penthouse': return 'بنتهاوس فاخر';
      case 'duplex': return 'دوبلكس راقي';
      default: return 'وحدة عقارية';
    }
  })();

  const propertyStatusLabel = (() => {
    switch (property.status) {
      case 'available': return 'متاحة للبيع';
      case 'reserved': return 'محجوزة';
      case 'sold': return 'تم البيع';
      case 'coming_soon': return 'قريباً';
      default: return 'نشط';
    }
  })();

  const statusColorClass = (() => {
    switch (property.status) {
      case 'available': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'reserved': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'sold': return 'bg-rose-50 text-rose-600 border-rose-200';
      case 'coming_soon': return 'bg-[#CAA048]/10 text-[#CAA048] border-[#CAA048]/30';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  })();

  const directionLabel = (() => {
    if (!property.specs.direction) return 'غير محدد';
    switch (property.specs.direction) {
      case 'north': return 'شمالية';
      case 'south': return 'جنوبية';
      case 'east': return 'شرقية';
      case 'west': return 'غربية';
      case 'corner': return 'على زاوية';
      default: return property.specs.direction;
    }
  })();

  const getFeatureIcon = (feature: string) => {
    const value = feature.trim().toLowerCase();
    if (value.includes('خادم') || value.includes('عاملة')) return UserRound;
    if (value.includes('موقف') || value.includes('سيارة') || value.includes('كراج')) return Car;
    if (value.includes('خزان') || value.includes('مياه')) return Database;
    if (value.includes('مستودع') || value.includes('مخزن')) return Warehouse;
    if (value.includes('غسيل')) return WashingMachine;
    if (value.includes('مدخل') || value.includes('باب')) return DoorOpen;
    if (value.includes('حديق') || value.includes('سطح')) return Trees;
    return Sparkles;
  };

  const whatsappLink = `https://wa.me/966568526666?text=${encodeURIComponent(
    `السلام عليكم، أرغب في الاستفسار عن تفاصيل: ${property.title} (${property.pricing.price} ر.س)`
  )}`;

  return (
    <main className="min-h-screen bg-white pt-44 lg:pt-[18vh] pb-20 relative overflow-x-hidden text-right animate-fade-in" dir="rtl">
      {/* Background Ambience */}
      <div className="absolute top-[-5%] start-[-10%] w-[50vw] h-[50vw] bg-gradient-to-br from-[#CAA048]/5 via-amber-50/20 to-transparent rounded-full blur-[140px] pointer-events-none -z-10 opacity-70" />
      <div className="absolute top-[20%] end-[-10%] w-[45vw] h-[45vw] bg-gradient-to-tl from-[#CAA048]/5 via-gray-100/50 to-transparent rounded-full blur-[130px] pointer-events-none -z-10 opacity-60" />
      <div className="absolute bottom-[10%] start-[10%] w-[40vw] h-[40vw] bg-gradient-to-tr from-amber-50/30 via-transparent to-transparent rounded-full blur-[150px] pointer-events-none -z-10 opacity-50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        {/* 1. Breadcrumbs */}
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 justify-start font-cairo">
            <li>
              <Link href="/" className="hover:text-[#CAA048] transition-colors">الرئيسية</Link>
            </li>
            <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
            <li>
              <Link href="/properties" className="hover:text-[#CAA048] transition-colors">الوحدات السكنية</Link>
            </li>
            <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
            <li className="text-brand-black font-semibold truncate max-w-[200px] sm:max-w-none" aria-current="page">
              {property.title}
            </li>
          </ol>
        </nav>

        {/* 2. Title & Action Row */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-200 pb-6">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-bold rounded-full bg-[#111315] border border-white/20 text-white shadow-sm font-cairo">
                <Building2 className="w-3.5 h-3.5 text-white shrink-0" />
                <span>{propertyTypeLabel}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-bold rounded-full bg-[#111315]/80 backdrop-blur-md border border-[#CAA048]/40 text-white shadow-sm font-cairo">
                <span className={`size-1.5 rounded-full ${
                  property.status === 'available' ? 'bg-emerald-400' :
                  property.status === 'reserved' ? 'bg-amber-400' :
                  property.status === 'sold' ? 'bg-rose-400' : 'bg-[#CAA048]'
                }`} />
                {propertyStatusLabel}
              </span>
              {property.project.slug !== 'independent' && (
                <Link
                  href={`/projects/${property.project.slug}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-bold rounded-full bg-[#111315]/80 backdrop-blur-md border border-white/20 text-white hover:border-[#CAA048] hover:text-[#CAA048] transition-all shadow-sm font-cairo"
                >
                  <Building2 className="w-3 h-3 text-[#CAA048]" />
                  <span>{property.project.name}</span>
                </Link>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-brand-black font-cairo leading-tight">
              {property.title}
            </h1>
            <div className="flex items-center gap-1.5 mt-2 text-xs sm:text-sm text-gray-500 font-cairo">
              <MapPin className="w-4 h-4 text-[#CAA048] shrink-0" />
              <span>
                {[property.location.district, property.location.city].filter(Boolean).join('، ') || property.location.address || 'الموقع غير محدد'}
              </span>
            </div>
          </div>

          {/* Share & Favorite Component (Client Side) */}
          <PropertyFavoriteShare title={property.title} />
        </section>

        {/* 3. Reusable Client Photo Gallery & Video Player (Full Width) */}
        <div className="w-full">
          <MediaGallery images={galleryImages} videos={property.media.videos} virtualTour={property.media.virtualTour} title={property.title} />
        </div>

        {/* 4. Split Layout Section: Pricing & Inquiry (Right) vs Map (Left) - Equal Height */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">

          {/* Right side: stacked pricing and inquiry cards */}
          <div className="flex flex-col gap-6 justify-between h-full">

            {/* Pricing Card */}
            <section className="bg-white border border-gray-200/90 hover:border-[#CAA048] rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex-1 flex flex-col justify-center transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-[#CAA048] to-transparent"></div>

              <span className="text-xs text-gray-500 block mb-1 font-cairo">قيمة العقار الإجمالية</span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#CAA048] font-cairo leading-none mb-6">
                {formatPrice(property.pricing.price)}
              </h2>

              <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-5 text-xs text-gray-600 font-cairo">
                <div>
                  <span className="text-[10px] text-gray-500 block mb-1">سعر المتر المربع</span>
                  <span className="font-extrabold text-brand-black font-mono text-sm">{formatPrice(property.pricing.pricePerMeter)} / م²</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block mb-1">قابلية التفاوض</span>
                  <span className={`font-extrabold text-sm ${property.pricing.isNegotiable ? 'text-emerald-600' : 'text-gray-500'}`}>
                    {property.pricing.isNegotiable ? 'قابل للتفاوض' : 'السعر نهائي'}
                  </span>
                </div>
              </div>
            </section>

            {/* Inquiry Card */}
            <section className="bg-white border border-gray-200/90 hover:border-[#CAA048] rounded-3xl p-6 sm:p-8 shadow-xl flex-1 flex flex-col justify-center transition-all duration-300">
              <h3 className="text-sm sm:text-base font-bold text-brand-black mb-4 font-cairo">استفسر عن العقار</h3>
              <PropertySidebarInquiry whatsappLink={whatsappLink} />
            </section>

          </div>

          {/* Left side: Map Stretching to match height of stacked cards */}
          <section className="bg-white border border-gray-200/90 hover:border-[#CAA048] rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between h-full min-h-[350px] transition-all duration-300">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-brand-black font-cairo flex items-center gap-2">
                  <Map className="w-5 h-5 text-[#CAA048]" />
                  <span>الموقع الجغرافي</span>
                </h2>
                <p className="text-xs text-gray-500 mt-1 font-cairo">يقع العقار في حي {property.location.district} بمدينة {property.location.city}</p>
              </div>
            </div>

            {/* Real Google Maps Container */}
            <div className="relative w-full flex-1 rounded-2xl overflow-hidden border border-gray-200 shadow-md bg-gray-100 group/map min-h-[220px]">
              <iframe
                src={`https://maps.google.com/maps?q=${property.location.coordinates.lat},${property.location.coordinates.lng}&z=15&output=embed`}
                className="w-full h-full border-0 grayscale opacity-90 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
                allowFullScreen
                loading="lazy"
                title={property.title}
              ></iframe>

              {/* Overlay Badge */}
              <div className="absolute bottom-3 end-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-gray-200 text-[10px] text-gray-800 flex items-center gap-1.5 pointer-events-none shadow-sm font-cairo">
                <ShieldCheck className="w-3.5 h-3.5 text-[#CAA048]" />
                <span className="font-bold">متوافق مع الكود السعودي للبناء</span>
              </div>
            </div>
          </section>

        </div>

        {/* 5. Specifications Grid Panel (Full Width) */}
        <section className="bg-white border border-gray-200/90 hover:border-[#CAA048] rounded-3xl p-6 sm:p-8 shadow-xl transition-all duration-300">
          <h2 className="text-base sm:text-lg font-bold text-brand-black mb-6 font-cairo flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#CAA048]" />
            <span>مواصفات وتفاصيل الوحدة</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">

            {/* Spec item 1: Area */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 flex flex-col items-center justify-center text-center group hover:border-[#CAA048] hover:bg-white transition-all duration-300 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#111315] border border-[#CAA048]/30 flex items-center justify-center text-[#CAA048] mb-3 group-hover:scale-105 transition-transform duration-300">
                <Maximize2 className="w-5 h-5 text-[#CAA048]" />
              </div>
              <span className="text-[10px] text-gray-500 mb-0.5 font-cairo">المساحة الإجمالية</span>
              <span className="text-sm font-bold text-brand-black font-mono">{property.specs.area} م²</span>
            </div>

            {/* Spec item 2: Bedrooms */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 flex flex-col items-center justify-center text-center group hover:border-[#CAA048] hover:bg-white transition-all duration-300 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#111315] border border-[#CAA048]/30 flex items-center justify-center text-[#CAA048] mb-3 group-hover:scale-105 transition-transform duration-300">
                <Bed className="w-5 h-5 text-[#CAA048]" />
              </div>
              <span className="text-[10px] text-gray-500 mb-0.5 font-cairo">غرف النوم</span>
              <span className="text-sm font-bold text-brand-black font-cairo">{property.specs.bedrooms} غرف</span>
            </div>

            {/* Spec item 3: Bathrooms */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 flex flex-col items-center justify-center text-center group hover:border-[#CAA048] hover:bg-white transition-all duration-300 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#111315] border border-[#CAA048]/30 flex items-center justify-center text-[#CAA048] mb-3 group-hover:scale-105 transition-transform duration-300">
                <Bath className="w-5 h-5 text-[#CAA048]" />
              </div>
              <span className="text-[10px] text-gray-500 mb-0.5 font-cairo">دورات المياه</span>
              <span className="text-sm font-bold text-brand-black font-cairo">{property.specs.bathrooms} حمامات</span>
            </div>

            {/* Spec item 4: Parking */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 flex flex-col items-center justify-center text-center group hover:border-[#CAA048] hover:bg-white transition-all duration-300 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#111315] border border-[#CAA048]/30 flex items-center justify-center text-[#CAA048] mb-3 group-hover:scale-105 transition-transform duration-300">
                <Car className="w-5 h-5 text-[#CAA048]" />
              </div>
              <span className="text-[10px] text-gray-500 mb-0.5 font-cairo">موقف سيارات</span>
              <span className="text-sm font-bold text-brand-black font-cairo">
                {property.specs.parking ? `${property.specs.parking} موقف` : 'غير متاح'}
              </span>
            </div>

            {/* Spec item 5: Floor */}
            {property.specs.floor !== undefined && (
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 flex flex-col items-center justify-center text-center group hover:border-[#CAA048] hover:bg-white transition-all duration-300 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-[#111315] border border-[#CAA048]/30 flex items-center justify-center text-[#CAA048] mb-3 group-hover:scale-105 transition-transform duration-300">
                  <Layers className="w-5 h-5 text-[#CAA048]" />
                </div>
                <span className="text-[10px] text-gray-500 mb-0.5 font-cairo">الطابق / الدور</span>
                <span className="text-sm font-bold text-brand-black font-cairo">
                  {property.specs.floor === 0 ? 'الأرضي' : `${property.specs.floor}`}
                </span>
              </div>
            )}

            {/* Spec item 6: Direction */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 flex flex-col items-center justify-center text-center group hover:border-[#CAA048] hover:bg-white transition-all duration-300 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#111315] border border-[#CAA048]/30 flex items-center justify-center text-[#CAA048] mb-3 group-hover:scale-105 transition-transform duration-300">
                <Compass className="w-5 h-5 text-[#CAA048]" />
              </div>
              <span className="text-[10px] text-gray-500 mb-0.5 font-cairo">اتجاه الواجهة</span>
              <span className="text-sm font-bold text-brand-black font-cairo">{directionLabel}</span>
            </div>

            {/* Spec item 7: View */}
            {property.specs.view && (
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 flex flex-col items-center justify-center text-center group hover:border-[#CAA048] hover:bg-white transition-all duration-300 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-[#111315] border border-[#CAA048]/30 flex items-center justify-center text-[#CAA048] mb-3 group-hover:scale-105 transition-transform duration-300">
                  <Eye className="w-5 h-5 text-[#CAA048]" />
                </div>
                <span className="text-[10px] text-gray-500 mb-0.5 font-cairo">الإطلالة</span>
                <span className="text-sm font-bold text-brand-black truncate max-w-[110px] font-cairo">{property.specs.view}</span>
              </div>
            )}

            {/* Spec item 8: Kitchen */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 flex flex-col items-center justify-center text-center group hover:border-[#CAA048] hover:bg-white transition-all duration-300 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#111315] border border-[#CAA048]/30 flex items-center justify-center text-[#CAA048] mb-3 group-hover:scale-105 transition-transform duration-300">
                <Building2 className="w-5 h-5 text-[#CAA048]" />
              </div>
              <span className="text-[10px] text-gray-500 mb-0.5 font-cairo">المطبخ</span>
              <span className="text-sm font-bold text-brand-black font-cairo">{property.specs.kitchen ? 'مستقل وجاهز' : 'غير مجهز'}</span>
            </div>

          </div>
        </section>

        {/* 6. Description (Full Width) */}
        {property.description?.trim() && (
          <section className="bg-white border border-gray-200/90 hover:border-[#CAA048] rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden transition-all duration-300">
            <h2 className="text-base sm:text-lg font-bold text-brand-black mb-4 font-cairo">الوصف التفصيلي</h2>
            <p className="text-sm text-gray-700 leading-relaxed font-cairo whitespace-pre-line">
              {property.description}
            </p>
          </section>
        )}

        {(property as any).advertisingLicenseNumber && (
          <section className="bg-white border border-gray-200/90 rounded-2xl px-5 py-4 shadow-sm flex items-center gap-3">
            <FileBadge className="w-5 h-5 text-[#CAA048] shrink-0" />
            <div className="font-cairo">
              <span className="block text-[10px] text-gray-500 mb-0.5">ترخيص الإعلان العقاري</span>
              <span className="text-sm font-bold text-brand-black font-mono" dir="ltr">{(property as any).advertisingLicenseNumber}</span>
            </div>
          </section>
        )}

        {/* 6.5. Floor Plan (if available) */}
        {property.media.floorPlan && (
          <section className="bg-white border border-gray-200/90 hover:border-[#CAA048] rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden transition-all duration-300">
            <h2 className="text-base sm:text-lg font-bold text-brand-black mb-6 font-cairo flex items-center gap-2">
              <Maximize2 className="w-5 h-5 text-[#CAA048]" />
              <span>مخطط الطابق الهندسي</span>
            </h2>
            <div className="relative w-full max-w-4xl mx-auto aspect-[4/3] sm:aspect-[16/9] rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center p-4">
              <div className="relative w-full h-full">
                <Image
                  src={property.media.floorPlan}
                  alt={`مخطط الطابق لـ ${property.title}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 1024px"
                />
              </div>
            </div>
          </section>
        )}

        {/* 7. Amenities, Project Banner & Safety summary Cards Grid */}
        <div className={`grid grid-cols-1 ${property.project.slug !== 'independent' ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-8 items-stretch`}>

          {/* Amenities Checklist */}
          {property.specs.features && property.specs.features.length > 0 && (
            <section className="bg-white border border-gray-200/90 hover:border-[#CAA048] rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between transition-all duration-300">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-brand-black mb-6 font-cairo flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#CAA048]" />
                  <span>الضمانات والتجهيزات</span>
                </h2>

                <div className="grid grid-cols-1 gap-3">
                  {property.specs.features.map((feat, idx) => {
                    const FeatureIcon = getFeatureIcon(feat);
                    return (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200/80 hover:border-[#CAA048]/40 transition-colors">
                        <span className="w-8 h-8 rounded-lg bg-white border border-[#CAA048]/25 flex items-center justify-center shrink-0">
                          <FeatureIcon className="w-4 h-4 text-[#CAA048]" strokeWidth={1.8} aria-hidden="true" />
                        </span>
                        <span className="text-xs font-bold text-brand-black font-cairo">{feat}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* Project Banner link (if associated) */}
          {property.project.slug !== 'independent' && (
            <section className="bg-gradient-to-br from-gray-900 to-brand-black border border-gray-800 rounded-3xl p-6 shadow-xl text-white flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#DFC07A]">
                  <Building2 className="w-5 h-5 shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider font-cairo">مشروع عقاري متكامل</span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-white font-cairo">{property.project.name}</h4>
                  <p className="text-xs text-gray-300 mt-1 leading-relaxed font-cairo">تنتمي هذه الشقة لمجمعنا السكني المكتمل الخدمات بمدينة جدة.</p>
                </div>
              </div>

              <Link
                href={`/projects/${property.project.slug}`}
                className="w-full mt-6 py-2.5 text-xs font-bold btn-soft-gold-metallic rounded-xl flex items-center justify-center gap-1.5 transition-all text-center font-cairo shadow-md"
              >
                <span>عرض تفاصيل المشروع الكامل</span>
                <ChevronLeft className="w-4 h-4" />
              </Link>
            </section>
          )}

          {/* Safety & Warranties summary Card */}
          <section className="bg-white border border-gray-200/90 hover:border-[#CAA048] rounded-3xl p-6 shadow-xl flex flex-col justify-between transition-all duration-300">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-brand-black font-cairo flex items-center gap-1.5 mb-6">
                <ShieldCheck className="w-5 h-5 text-[#CAA048] shrink-0" />
                <span>ضمانات مار العقارية</span>
              </h3>
              <ul className="space-y-3.5 text-xs text-gray-600 list-disc list-inside ps-2 font-cairo">
                <li>ضمان 15 سنة على الهيكل الإنشائي والخرسانات.</li>
                <li>ضمان 5 سنوات على أعمال السباكة والكهرباء والدهانات.</li>
                <li>ضمان 2 سنتين على الأنظمة الذكية والمصاعد والمضخات.</li>
                <li>توافر خزان أرضي وعلوي مستقل لكل وحدة سكنية.</li>
              </ul>
            </div>
          </section>

        </div>

      </div>
    </main>
  );
}

// Generate static params for prerendering dynamic page routes
export async function generateStaticParams() {
  return PROPERTIES.map((p) => ({
    slug: p.slug,
  }));
}
