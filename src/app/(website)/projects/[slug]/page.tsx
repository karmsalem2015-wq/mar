// src/app/projects/[slug]/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { PROJECTS } from '@/lib/mockData';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getProjectBySlug, getPropertiesByProjectSlug } from '@/app/actions/properties';
import MediaGallery from '@/components/ui/MediaGallery';
import { ProjectSidebarInquiry } from '@/components/property/ProjectActions';
import UnitsCarousel from '@/components/property/UnitsCarousel';
import {
  Building2,
  MapPin,
  Calendar,
  LayoutGrid,
  Download,
  ChevronLeft,
  Sparkles,
  ShieldCheck,
  Info,
  Tag,
  ArrowLeft,
  Map
} from 'lucide-react';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate dynamic metadata for SEO on Server Side
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  return {
    title: project ? `${project.name} | شركة مار العقارية` : 'مشروع سكني فاخر',
    description: project?.description || 'مجمعات سكنية فاخرة بتصاميم عصرية وتشطيبات راقية تناسب تطلعاتكم في المملكة العربية السعودية.',
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  // Filter properties belonging to this project
  const associatedProperties = await getPropertiesByProjectSlug(project.slug);

  // Project Gallery images list - falls back to interior assets if none exist
  const galleryImages =
    project.media.gallery && project.media.gallery.length > 0
      ? [project.media.hero, ...project.media.gallery]
      : [
        project.media.hero || '/properties/apartment.webp',
        '/properties/villa.webp',
        '/properties/penthouse.webp',
        '/properties/apartment.webp'
      ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(price) + ' ر.س';
  };

  const projectStatusLabel = (() => {
    switch (project.status) {
      case 'completed': return 'جاهز للتسليم';
      case 'under_construction': return 'تحت الإنشاء';
      case 'upcoming': return 'قريباً';
      default: return 'نشط';
    }
  })();

  const statusColorClass = (() => {
    switch (project.status) {
      case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'under_construction': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'upcoming': return 'bg-[#CAA048]/10 text-[#CAA048] border-[#CAA048]/30';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  })();

  const whatsappLink = `https://wa.me/966550085811?text=${encodeURIComponent(
    `السلام عليكم، أرغب في الاستفسار عن تفاصيل مشروع: ${project.name}`
  )}`;

  return (
    <main className="min-h-screen bg-white pt-44 lg:pt-[18vh] pb-20 relative overflow-x-hidden text-right animate-fade-in" dir="rtl">
      {/* Background Ambience */}
      <div className="absolute top-[-5%] start-[-10%] w-[50vw] h-[50vw] bg-gradient-to-br from-[#CAA048]/5 via-amber-50/20 to-transparent rounded-full blur-[140px] pointer-events-none -z-10 opacity-70" />
      <div className="absolute top-[20%] end-[-10%] w-[45vw] h-[45vw] bg-gradient-to-tl from-[#CAA048]/5 via-gray-100/50 to-transparent rounded-full blur-[130px] pointer-events-none -z-10 opacity-60" />
      <div className="absolute bottom-[10%] start-[10%] w-[40vw] h-[40vw] bg-gradient-to-tr from-sky-50/50 via-transparent to-transparent rounded-full blur-[150px] pointer-events-none -z-10 opacity-50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        {/* 1. Breadcrumbs */}
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 justify-start font-cairo">
            <li>
              <Link href="/" className="hover:text-[#CAA048] transition-colors">الرئيسية</Link>
            </li>
            <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
            <li>
              <Link href="/projects" className="hover:text-[#CAA048] transition-colors">مشاريعنا</Link>
            </li>
            <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
            <li className="text-brand-black font-semibold truncate max-w-[200px] sm:max-w-none" aria-current="page">
              {project.name}
            </li>
          </ol>
        </nav>

        {/* 2. Title & Status Row */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-200 pb-6">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-bold rounded-full bg-[#111315] border border-white/20 text-white shadow-sm font-cairo">
                <Building2 className="w-3.5 h-3.5 text-white shrink-0" />
                <span>مشروع سكني فاخر</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 text-xs font-bold rounded-full bg-[#111315]/80 backdrop-blur-md border border-[#CAA048]/40 text-white shadow-sm font-cairo">
                <span className={`size-1.5 rounded-full ${
                  project.status === 'under_construction' ? 'bg-amber-400' :
                  project.status === 'completed' ? 'bg-emerald-400' : 'bg-[#CAA048]'
                }`} />
                {projectStatusLabel}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-brand-black font-cairo leading-tight">
              {project.name}
            </h1>
            <div className="flex items-center gap-1.5 mt-2 text-xs sm:text-sm text-gray-500 font-cairo">
              <MapPin className="w-4 h-4 text-[#CAA048] shrink-0" />
              <span>حي {project.location.district}، {project.location.city}، المملكة العربية السعودية</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={project.brochureUrl || `/brochure-${project.slug}.pdf`}
              target={project.brochureUrl ? "_blank" : undefined}
              rel={project.brochureUrl ? "noopener noreferrer" : undefined}
              download={!project.brochureUrl}
              className="btn-premium-gold py-3 px-6 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer font-cairo shadow-md"
            >
              <Download className="w-4 h-4 text-[#111315]" />
              <span>تحميل البروفايل (PDF)</span>
            </a>
          </div>
        </section>

        {/* 3. Media Gallery (Full Width) */}
        <div className="w-full">
          <MediaGallery images={galleryImages} videos={project.media.videos} title={project.name} />
        </div>

        {/* 4. Split Layout Section: Pricing & Inquiry (Right) vs Map (Left) - Equal Height */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">

          {/* Right side: Price Range and Inquiry stacked */}
          <div className="flex flex-col gap-6 justify-between h-full">

            {/* Price Range Panel */}
            <section className="bg-white border border-gray-200/90 hover:border-[#CAA048] rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex-1 flex flex-col justify-center transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-[#CAA048] to-transparent"></div>

              <span className="text-xs text-gray-500 block mb-1 font-cairo">نطاق أسعار وحدات المشروع السكنية</span>
              <h2 className="text-xl sm:text-2xl font-black text-[#CAA048] font-cairo leading-tight">
                <span className="font-cairo text-xs block text-gray-500 font-normal mb-1">تبدأ من:</span>
                <span className="font-mono text-3xl font-black">{formatPrice(project.priceRange.min)}</span>
                {project.priceRange.max > project.priceRange.min && (
                  <>
                    <span className="mx-2 text-gray-400 text-sm font-normal">إلى</span>
                    <span className="font-mono text-3xl font-black block mt-1">{formatPrice(project.priceRange.max)}</span>
                  </>
                )}
              </h2>

              <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-5 mt-4 text-xs text-gray-600 font-cairo">
                <div>
                  <span className="text-[10px] text-gray-500 block mb-0.5">نوع الاستثمار</span>
                  <span className="font-bold text-brand-black">تملك سكني فاخر</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block mb-0.5">الدفعة الأولى</span>
                  <span className="font-bold text-emerald-600">متاحة وميسرة</span>
                </div>
              </div>
            </section>

            {/* Quick Contact Box */}
            <section className="bg-white border border-gray-200/90 hover:border-[#CAA048] rounded-3xl p-6 sm:p-8 shadow-xl flex-1 flex flex-col justify-center transition-all duration-300">
              <h3 className="text-sm sm:text-base font-bold text-brand-black mb-4 font-cairo">استفسر عن المشروع</h3>
              <ProjectSidebarInquiry whatsappLink={whatsappLink} />
            </section>

          </div>

          {/* Left side: Map stretching to equal height of cards */}
          <section className="bg-white border border-gray-200/90 hover:border-[#CAA048] rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between h-full min-h-[350px] transition-all duration-300">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-brand-black font-cairo flex items-center gap-2">
                  <Map className="w-5 h-5 text-[#CAA048]" />
                  <span>موقع المشروع</span>
                </h2>
                <p className="text-xs text-gray-500 mt-1 font-cairo">المملكة العربية السعودية، مدينة {project.location.city}، حي {project.location.district}</p>
              </div>
            </div>

            {/* Real Google Maps Container */}
            <div className="relative w-full flex-1 rounded-2xl overflow-hidden border border-gray-200 shadow-md bg-gray-100 group/map min-h-[220px]">
              <iframe
                src={`https://maps.google.com/maps?q=${encodeURIComponent(`${project.name}، حي ${project.location.district}، ${project.location.city}`)}&z=15&output=embed`}
                className="w-full h-full border-0 grayscale opacity-90 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
                allowFullScreen
                loading="lazy"
                title={project.name}
              ></iframe>

              {/* Overlay Badge */}
              <div className="absolute bottom-3 end-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-gray-200 text-[10px] text-gray-800 flex items-center gap-1.5 pointer-events-none shadow-sm font-cairo">
                <ShieldCheck className="w-3.5 h-3.5 text-[#CAA048]" />
                <span className="font-bold">ضمانات تشطيب كاملة متوافقة كلياً</span>
              </div>
            </div>
          </section>

        </div>

        {/* 5. Project Highlights / Specifications Panel (Full Width) */}
        <section className="bg-white border border-gray-200/90 hover:border-[#CAA048] rounded-3xl p-6 sm:p-8 shadow-xl transition-all duration-300">
          <h2 className="text-base sm:text-lg font-bold text-brand-black mb-6 font-cairo flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#CAA048]" />
            <span>مميزات ومواصفات المجمع السكني</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 hover:border-[#CAA048]/40 flex flex-col items-center shadow-sm transition-colors">
              <Building2 className="w-6 h-6 text-[#CAA048] mb-2" />
              <span className="text-[10px] text-gray-500 mb-0.5 font-cairo">إجمالي الوحدات</span>
              <span className="text-sm font-bold text-brand-black font-cairo">{project.specs.totalUnits} شقة</span>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 hover:border-[#CAA048]/40 flex flex-col items-center shadow-sm transition-colors">
              <LayoutGrid className="w-6 h-6 text-[#CAA048] mb-2" />
              <span className="text-[10px] text-gray-500 mb-0.5 font-cairo">الوحدات المتاحة</span>
              <span className="text-sm font-bold text-[#CAA048] font-cairo">{project.specs.availableUnits} شقة</span>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 hover:border-[#CAA048]/40 flex flex-col items-center shadow-sm transition-colors">
              <Calendar className="w-6 h-6 text-[#CAA048] mb-2" />
              <span className="text-[10px] text-gray-500 mb-0.5 font-cairo">تاريخ الاستلام</span>
              <span className="text-sm font-bold text-brand-black font-cairo">{project.specs.completionDate}</span>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 hover:border-[#CAA048]/40 flex flex-col items-center shadow-sm transition-colors">
              <Tag className="w-6 h-6 text-[#CAA048] mb-2" />
              <span className="text-[10px] text-gray-500 mb-0.5 font-cairo">الحد الأدنى للسعر</span>
              <span className="text-xs font-bold text-[#CAA048] font-mono">
                {formatPrice(project.priceRange.min)}
              </span>
            </div>
          </div>
        </section>

        {/* 6. Description & Amenities Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">

          {/* Description Section */}
          <div className="lg:col-span-2 h-full">
            <section className="bg-white border border-gray-200/90 hover:border-[#CAA048] rounded-3xl p-6 sm:p-8 shadow-xl h-full transition-all duration-300">
              <h2 className="text-base sm:text-lg font-bold text-brand-black mb-4 font-cairo">عن المشروع</h2>
              <p className="text-sm text-gray-700 leading-relaxed font-cairo whitespace-pre-line">
                {project.description}
              </p>
            </section>
          </div>

          {/* Side Column: Warranties and info */}
          <section className="bg-white border border-gray-200/90 hover:border-[#CAA048] rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between h-full transition-all duration-300">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-brand-black font-cairo flex items-center gap-1.5 mb-6">
                <ShieldCheck className="w-5 h-5 text-[#CAA048] shrink-0" />
                <span>امتيازات وضمانات المطور</span>
              </h3>
              <ul className="space-y-3.5 text-xs text-gray-600 list-disc list-inside ps-2 font-cairo">
                <li>هيكل إنشائي خرساني بضمانات تصل إلى 15 سنة.</li>
                <li>كود أمني ذكي للمجمع بالكامل على مدار 24 ساعة.</li>
                <li>توزيع حدائق ومسطحات خضراء داخلية بالمشروع.</li>
                <li>مواقف سيارات خاصة وسفلية آمنة ومظللة.</li>
              </ul>
            </div>
          </section>

        </div>

        {/* 7. Associated Properties List */}
        <section className="border-t border-gray-200 pt-16 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-brand-black font-cairo">
                وحدات سكنية متاحة في <span className="text-[#CAA048]">{project.name}</span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 font-cairo">تصفح الشقق والملحقات المتوفرة للبيع الفوري في هذا المجمع</p>
            </div>

            <Link
              href={`/properties?project=${project.slug}`}
              className="px-5 py-2.5 text-xs font-bold bg-[#111315] hover:bg-[#CAA048] hover:text-[#111315] text-[#DFC07A] border border-[#CAA048]/30 hover:border-[#CAA048] rounded-xl transition-all text-center self-start sm:self-center font-cairo shadow-sm"
            >
              عرض كافة الوحدات
            </Link>
          </div>

          {associatedProperties.length > 0 ? (
            <UnitsCarousel properties={associatedProperties} />
          ) : (
            <div className="p-12 rounded-3xl bg-gray-50 border border-gray-200/90 hover:border-[#CAA048] text-center flex flex-col items-center justify-center max-w-2xl mx-auto font-cairo transition-all">
              <Info className="w-10 h-10 text-[#CAA048] mb-3" />
              <h3 className="text-base font-bold text-brand-black mb-1">لا توجد وحدات سكنية معروضة حالياً</h3>
              <p className="text-xs text-gray-500">تم بيع كافة وحدات هذا المشروع بالكامل أو يرجى التواصل معنا للاستعلام عن توافر وحدات أوف-بلان غير معلنة.</p>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}

// Generate static params for prerendering dynamic project routes
export async function generateStaticParams() {
  return PROJECTS.map((p) => ({
    slug: p.slug,
  }));
}
