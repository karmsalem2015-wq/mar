'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowUp,
  Clock,
  Instagram,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Youtube,
} from 'lucide-react';
import BrandMark from '@/components/brand/BrandMark';
import { BRAND } from '@/config/brand';
import type { SiteSettingsData } from '@/app/actions/settings';

// Real Estate Portfolio Links
const PORTFOLIO_LINKS = [
  { href: '/properties?type=villa', label: 'فلل سكنية فاخرة' },
  { href: '/properties?type=apartment', label: 'شقق وأجنحة عصرية' },
  { href: '/properties?type=roof', label: 'أدوار وأروف روف بنتهاوس' },
  { href: '/projects', label: 'مشاريع التطوير الكبرى' },
  { href: '/properties', label: 'كافة الفرص العقارية' },
] as const;

// Company & Ecosystem Links
const COMPANY_LINKS = [
  { href: '/about', label: 'عن مار ومسيرة الريادة' },
  { href: '/contact', label: 'تواصل مع مستشارينا' },
] as const;

interface FooterProps {
  settings?: SiteSettingsData;
}

export default function Footer({ settings }: FooterProps) {
  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const social = settings?.social;
  const contact = settings?.contact;

  // Build active dynamic social links (Focused Top Saudi Real Estate Channels)
  const dynamicSocialLinks: { id: string; href: string; label: string; icon: React.ReactNode }[] = [];

  // 1. X (Twitter)
  const rawX = social?.x ?? BRAND.social.x;
  if (rawX && rawX.trim()) {
    dynamicSocialLinks.push({
      id: 'x',
      href: rawX,
      label: 'منصة إكس (تويتر)',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-current">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    });
  }

  // 2. Instagram
  const rawInstagram = social?.instagram ?? BRAND.social.instagram;
  if (rawInstagram && rawInstagram.trim()) {
    dynamicSocialLinks.push({
      id: 'instagram',
      href: rawInstagram,
      label: 'إنستغرام',
      icon: <Instagram className="size-4" aria-hidden="true" />,
    });
  }

  // 3. Snapchat
  const rawSnapchat = social?.snapchat || 'https://www.snapchat.com/add/mar_realestate';
  if (rawSnapchat && rawSnapchat.trim()) {
    dynamicSocialLinks.push({
      id: 'snapchat',
      href: rawSnapchat,
      label: 'سناب شات',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-current">
          <path d="M12.003 2c-3.74 0-6.02 2.72-6.02 5.56 0 1.25.43 2.5 1.09 3.42.13.18.17.41.1.62-.12.35-.61 1.05-1.57 1.34-.35.11-.53.47-.41.81.18.52.79.88 1.47.88.22 0 .44-.04.64-.11.29-.11.62.01.76.28.27.52.8 1.09 1.58 1.38-.61.35-1.53.72-2.58.91-.42.08-.7.46-.64.88.06.45.45.79.91.79.16 0 .32-.04.47-.11 1.21-.58 2.58-.87 3.69-.87 1.11 0 2.48.29 3.69.87.15.07.31.11.47.11.46 0 .85-.34.91-.79.06-.42-.22-.8-.64-.88-1.05-.19-1.97-.56-2.58-.91.78-.29 1.31-.86 1.58-1.38.14-.27.47-.39.76-.28.2.07.42.11.64.11.68 0 1.29-.36 1.47-.88.12-.34-.06-.7-.41-.81-.96-.29-1.45-.99-1.57-1.34-.07-.21-.03-.44.1-.62.66-.92 1.09-2.17 1.09-3.42 0-2.84-2.28-5.56-6.02-5.56z" />
        </svg>
      ),
    });
  }

  // 4. TikTok
  const rawTiktok = social?.tiktok || 'https://www.tiktok.com/@mar.realestate';
  if (rawTiktok && rawTiktok.trim()) {
    dynamicSocialLinks.push({
      id: 'tiktok',
      href: rawTiktok,
      label: 'تيك توك',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-current">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.95-4.49V8.58a8.3 8.3 0 0 0 4.82 1.54v-3.43h-.59z" />
        </svg>
      ),
    });
  }

  // 5. YouTube
  const rawYoutube = social?.youtube ?? BRAND.social.youtube;
  if (rawYoutube && rawYoutube.trim()) {
    dynamicSocialLinks.push({
      id: 'youtube',
      href: rawYoutube,
      label: 'يوتيوب',
      icon: <Youtube className="size-4" aria-hidden="true" />,
    });
  }

  return (
    <footer
      className="relative overflow-hidden bg-[#0D0F12] text-white border-t border-white/10"
      dir="rtl"
    >
      {/* Dark Dashboard Charcoal & Obsidian Gradient (Zero Blue/Navy) */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#14161A] via-[#0E1013] to-[#07080A]"
        aria-hidden="true"
      />

      {/* Subtle Warm Luxury Gold Ambient Glow at Top */}
      <div
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[200px] bg-gradient-to-b from-[#E6A821]/8 via-[#CB841B]/2 to-transparent blur-3xl opacity-60"
        aria-hidden="true"
      />

      {/* Clean, Simple Top Separator Line (Flat and elegant - no star or rotated box) */}
      <div className="relative w-full h-px bg-gradient-to-r from-transparent via-[#E6A821]/30 to-transparent z-10" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12 pt-14 sm:pt-16 pb-12">
        {/* Main Architectural 4-Column Layout (Balanced & Evenly Distributed via Flexbox) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:flex-row lg:justify-between lg:items-start gap-10 lg:gap-0 pb-14 border-b border-white/[0.08]">
          {/* Column 1: Brand, Accreditation & Social Media */}
          <div className="w-full md:col-span-2 lg:w-[325px] xl:w-[350px] shrink-0 flex flex-col justify-between space-y-6">
            <div>
              {/* Logo & Descriptor / Story Text */}
              <div className="flex flex-row items-center gap-2.5">
                <div className="shrink-0 flex items-center">
                  <BrandMark size="lg" variant="footer" />
                </div>
                <div className="flex flex-col justify-center min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#E6A821] shrink-0" aria-hidden="true" />
                    <p className="text-xs sm:text-[13px] font-bold tracking-wide text-[#E6A821] font-almarai whitespace-nowrap">
                      {BRAND.descriptorAr} • {BRAND.promiseAr}
                    </p>
                  </div>
                  <p className="mt-1 text-xs sm:text-[13px] leading-5 text-white/75 font-cairo line-clamp-2">
                    {BRAND.storyAr}
                  </p>
                </div>
              </div>

              {/* REGA & FAL Accreditation Badges (Positioned under Logo & Text) */}
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 sm:p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E6A821] font-cairo">
                    <ShieldCheck className="size-4 text-[#E6A821]" aria-hidden="true" />
                    <span>معتمد ومرخص رسمياً</span>
                  </div>
                  <span className="text-[11px] font-mono text-white/45">الهيئة العامة للعقار</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative h-11 rounded-xl bg-white px-3 py-1 shadow-sm flex items-center justify-center transition-transform hover:scale-[1.02]">
                    <Image
                      src="/rega_logo.webp"
                      alt="الهيئة العامة للعقار - REGA"
                      fill
                      sizes="140px"
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="relative h-11 rounded-xl bg-white px-3 py-1 shadow-sm flex items-center justify-center transition-transform hover:scale-[1.02]">
                    <Image
                      src="/fal.webp"
                      alt="رخصة فال العقارية - FAL"
                      fill
                      sizes="140px"
                      className="object-contain p-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Official Social Media Pill Buttons (Positioned under the Accreditation Block) */}
            <div className="pt-2">
              <span className="block text-xs font-semibold text-white/60 font-cairo mb-3">
                تابع مار العقارية على المنصات الرسمية
              </span>
              <div className="flex flex-wrap items-center gap-2.5">
                {dynamicSocialLinks.map(({ id, href, label, icon }) => (
                  <a
                    key={id}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className="flex size-10 items-center justify-center rounded-xl border border-white/12 bg-white/[0.05] text-white/80 transition-all duration-200 hover:border-[#E6A821] hover:bg-[#E6A821]/15 hover:text-[#E6A821] hover:-translate-y-0.5 shadow-sm"
                  >
                    {icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Portfolio Links */}
          <div className="w-full md:col-span-1 lg:w-auto shrink-0">
            <h4 className="text-sm sm:text-base font-bold text-white font-heading tracking-wide">
              المحفظة العقارية
            </h4>
            <span
              className="mt-2.5 block h-[2px] w-8 bg-gradient-to-r from-[#E6A821] to-[#CB841B] rounded-full"
              aria-hidden="true"
            />
            <nav className="mt-6 flex flex-col items-start gap-3" aria-label="روابط المحفظة العقارية">
              {PORTFOLIO_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group inline-flex items-center gap-2 text-xs sm:text-[13px] text-white/75 transition-colors hover:text-[#E6A821] font-cairo whitespace-nowrap"
                >
                  <span className="h-1 w-1 rounded-full bg-[#E6A821]/60 transition-all group-hover:w-2 group-hover:bg-[#E6A821] shrink-0" />
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3: Company & Ecosystem */}
          <div className="w-full md:col-span-1 lg:w-auto shrink-0">
            <h4 className="text-sm sm:text-base font-bold text-white font-heading tracking-wide">
              عن مار وخدماتنا
            </h4>
            <span
              className="mt-2.5 block h-[2px] w-8 bg-gradient-to-r from-[#E6A821] to-[#CB841B] rounded-full"
              aria-hidden="true"
            />
            <nav className="mt-6 flex flex-col items-start gap-3" aria-label="روابط الشركة والخدمات">
              {COMPANY_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group inline-flex items-center gap-2 text-xs sm:text-[13px] text-white/75 transition-colors hover:text-[#E6A821] font-cairo whitespace-nowrap"
                >
                  <span className="h-1 w-1 rounded-full bg-[#E6A821]/60 transition-all group-hover:w-2 group-hover:bg-[#E6A821] shrink-0" />
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 4: Headquarters & Contact */}
          <div className="w-full md:col-span-2 lg:w-[260px] xl:w-[285px] shrink-0">
            <h4 className="text-sm sm:text-base font-bold text-white font-heading tracking-wide">
              المقر الرئيسي والتواصل
            </h4>
            <span
              className="mt-2.5 block h-[2px] w-8 bg-gradient-to-r from-[#E6A821] to-[#CB841B] rounded-full"
              aria-hidden="true"
            />

            <div className="mt-6 space-y-4 font-cairo">
              {/* Location */}
              <div className="flex items-start gap-3.5">
                <div className="size-8.5 rounded-xl bg-[#E6A821]/10 border border-[#E6A821]/25 flex items-center justify-center shrink-0 mt-0.5 text-[#E6A821]">
                  <MapPin className="size-4" aria-hidden="true" />
                </div>
                <div>
                  <span className="block text-[11px] font-medium text-white/50">المقر الرئيسي</span>
                  <span className="text-xs sm:text-sm font-medium text-white/90">
                    {contact?.address || BRAND.contact.cityAr}
                  </span>
                </div>
              </div>

              {/* Direct Phone Lines */}
              <div className="flex items-center gap-2.5">
                <div className="size-8.5 rounded-xl bg-[#E6A821]/10 border border-[#E6A821]/25 flex items-center justify-center shrink-0 text-[#E6A821]">
                  <Phone className="size-4" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[11px] leading-tight font-medium text-white/50 mb-0.5">خدمة العملاء والمبيعات</span>
                  <div className="flex flex-wrap items-center justify-end gap-2 text-xs sm:text-sm font-mono text-white/90">
                    <a
                      href={`tel:${(contact?.unifiedNumber || BRAND.contact.primaryPhone.display).replace(/[^0-9+]/g, '')}`}
                      className="transition-colors hover:text-[#E6A821]" dir="ltr"
                    >
                      {contact?.unifiedNumber || BRAND.contact.primaryPhone.display}
                    </a>
                    {contact?.mobileNumber &&
                      contact.mobileNumber !== (contact.unifiedNumber || BRAND.contact.primaryPhone.display) && (
                        <>
                          <span className="text-white/30">|</span>
                          <a
                            href={`tel:${contact.mobileNumber.replace(/[^0-9+]/g, '')}`}
                            className="transition-colors hover:text-[#E6A821]"
                          >
                            {contact.mobileNumber}
                          </a>
                        </>
                      )}
                  </div>
                </div>
              </div>

              {/* Email */}
              <a
                href={`mailto:${contact?.companyEmail || BRAND.contact.email}`}
                className="flex items-start gap-3.5 group"
              >
                <div className="size-8.5 rounded-xl bg-[#E6A821]/10 border border-[#E6A821]/25 flex items-center justify-center shrink-0 mt-0.5 text-[#E6A821] group-hover:border-[#E6A821] transition-colors">
                  <Mail className="size-4" aria-hidden="true" />
                </div>
                <div>
                  <span className="block text-[11px] font-medium text-white/50">البريد الإلكتروني الرسمي</span>
                  <span
                    className="text-xs sm:text-sm font-medium text-white/90 font-mono group-hover:text-[#E6A821] transition-colors"
                    dir="ltr"
                  >
                    {contact?.companyEmail || BRAND.contact.email}
                  </span>
                </div>
              </a>

              {/* Working Hours */}
              <div className="flex items-start gap-3.5">
                <div className="size-8.5 rounded-xl bg-[#E6A821]/10 border border-[#E6A821]/25 flex items-center justify-center shrink-0 mt-0.5 text-[#E6A821]">
                  <Clock className="size-4" aria-hidden="true" />
                </div>
                <div>
                  <span className="block text-[11px] font-medium text-white/50">ساعات استقبال العملاء</span>
                  <span className="text-xs text-white/80">السبت - الخميس: 9:00 ص - 9:00 م</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Licensing & Compliance Box (Centered & Distinct with Enhanced Background & Visibility) */}
        <div className="mt-10 rounded-2xl border border-white/12 bg-white/[0.04] backdrop-blur-md p-5 sm:p-6 shadow-lg">
          <div className="max-w-3xl mx-auto text-center space-y-2.5 font-cairo">
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-white/90">
              <span className="inline-flex items-center gap-1.5">
                <span className="text-white/60">رخصة فال للوساطة والتسويق:</span>{' '}
                <strong className="font-mono text-[#E6A821] font-bold text-sm sm:text-base tracking-wider">
                  1200003346
                </strong>
              </span>

            </div>
            <p className="text-xs sm:text-[13px] text-white/65 leading-relaxed">
              ملتزمون بكافة اشتراطات الكود السعودي للبناء، وتصاميم هندسية معتمدة وفق أعلى معايير الجودة والاستدامة.
            </p>
          </div>
        </div>
      </div>

      {/* Deep Black Bottom Copyright & Legal Bar (Enhanced Visibility & High Contrast) */}
      <div className="relative z-10 border-t border-white/10 bg-[#060709] py-6 px-5 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-[13px] font-cairo text-white/75">
          {/* Copyright Notice */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-center sm:text-start">
            <p>
              © {new Date().getFullYear()}{' '}
              <strong className="text-white font-bold">{BRAND.nameAr}</strong> ({BRAND.nameEn}).{' '}
              جميع الحقوق محفوظة.
            </p>
          </div>

          {/* Legal Links & Scroll to Top */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 sm:gap-4 text-xs text-white/70">
              <Link href="/terms#privacy" className="hover:text-white transition-colors">
                سياسة الخصوصية
              </Link>
              <span className="size-1 rounded-full bg-white/30" aria-hidden="true" />
              <Link href="/terms" className="hover:text-white transition-colors">
                الشروط والأحكام
              </Link>
              <span className="size-1 rounded-full bg-white/30" aria-hidden="true" />
              <Link href="/terms#disclaimer" className="hover:text-white transition-colors">
                إخلاء المسؤولية
              </Link>
            </div>

            {/* Back to top button */}
            <button
              type="button"
              onClick={scrollToTop}
              aria-label="العودة إلى أعلى الصفحة"
              className="inline-flex items-center gap-2 text-xs font-medium text-white/80 hover:text-[#E6A821] transition-colors group cursor-pointer"
            >
              <span className="hidden sm:inline">للأعلى</span>
              <div className="size-8 rounded-full bg-white/[0.06] border border-white/15 flex items-center justify-center group-hover:border-[#E6A821] group-hover:bg-[#E6A821]/15 text-[#E6A821] transition-all shadow-sm">
                <ArrowUp className="size-4 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
