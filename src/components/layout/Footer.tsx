'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowUp,
  Clock,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Youtube,
  Linkedin,
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
  { href: '/#virtual-tour', label: 'الجولة الافتراضية 360°' },
  { href: '/properties#calculator', label: 'حاسبة التمويل العقاري' },
  { href: '/#request-property', label: 'خدمة اطلب عقارك الخاصة' },
  { href: '/about#partners', label: 'شركاء التطوير والإنجاز' },
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

  // Build active dynamic social links
  const dynamicSocialLinks: { id: string; href: string; label: string; icon: React.ReactNode }[] = [];

  const rawInstagram = social?.instagram ?? BRAND.social.instagram;
  if (rawInstagram && rawInstagram.trim()) {
    dynamicSocialLinks.push({
      id: 'instagram',
      href: rawInstagram,
      label: 'Instagram',
      icon: <Instagram className="size-4" aria-hidden="true" />,
    });
  }

  const rawX = social?.x ?? BRAND.social.x;
  if (rawX && rawX.trim()) {
    dynamicSocialLinks.push({
      id: 'x',
      href: rawX,
      label: 'X (Twitter)',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-current">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    });
  }

  const rawWhatsapp = social?.whatsapp ?? BRAND.contact.primaryPhone.tel;
  if (rawWhatsapp && rawWhatsapp.trim()) {
    const waHref = rawWhatsapp.startsWith('http')
      ? rawWhatsapp
      : `https://wa.me/${rawWhatsapp.replace(/[^0-9]/g, '')}`;
    dynamicSocialLinks.push({
      id: 'whatsapp',
      href: waHref,
      label: 'WhatsApp',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-current">
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 012.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 01-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1s.9 2.43 1.03 2.6c.13.17 1.77 2.7 4.28 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.07-.12-.23-.19-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.454 5.709 1.455h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
    });
  }

  const rawYoutube = social?.youtube ?? BRAND.social.youtube;
  if (rawYoutube && rawYoutube.trim()) {
    dynamicSocialLinks.push({
      id: 'youtube',
      href: rawYoutube,
      label: 'YouTube',
      icon: <Youtube className="size-4" aria-hidden="true" />,
    });
  }

  const rawFacebook = social?.facebook ?? BRAND.social.facebook;
  if (rawFacebook && rawFacebook.trim()) {
    dynamicSocialLinks.push({
      id: 'facebook',
      href: rawFacebook,
      label: 'Facebook',
      icon: <Facebook className="size-4" aria-hidden="true" />,
    });
  }

  const rawTiktok = social?.tiktok;
  if (rawTiktok && rawTiktok.trim()) {
    dynamicSocialLinks.push({
      id: 'tiktok',
      href: rawTiktok,
      label: 'TikTok',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-current">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.95-4.49V8.58a8.3 8.3 0 0 0 4.82 1.54v-3.43h-.59z" />
        </svg>
      ),
    });
  }

  const rawSnapchat = social?.snapchat;
  if (rawSnapchat && rawSnapchat.trim()) {
    dynamicSocialLinks.push({
      id: 'snapchat',
      href: rawSnapchat,
      label: 'Snapchat',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-current">
          <path d="M12.003 2c-3.74 0-6.02 2.72-6.02 5.56 0 1.25.43 2.5 1.09 3.42.13.18.17.41.1.62-.12.35-.61 1.05-1.57 1.34-.35.11-.53.47-.41.81.18.52.79.88 1.47.88.22 0 .44-.04.64-.11.29-.11.62.01.76.28.27.52.8 1.09 1.58 1.38-.61.35-1.53.72-2.58.91-.42.08-.7.46-.64.88.06.45.45.79.91.79.16 0 .32-.04.47-.11 1.21-.58 2.58-.87 3.69-.87 1.11 0 2.48.29 3.69.87.15.07.31.11.47.11.46 0 .85-.34.91-.79.06-.42-.22-.8-.64-.88-1.05-.19-1.97-.56-2.58-.91.78-.29 1.31-.86 1.58-1.38.14-.27.47-.39.76-.28.2.07.42.11.64.11.68 0 1.29-.36 1.47-.88.12-.34-.06-.7-.41-.81-.96-.29-1.45-.99-1.57-1.34-.07-.21-.03-.44.1-.62.66-.92 1.09-2.17 1.09-3.42 0-2.84-2.28-5.56-6.02-5.56z" />
        </svg>
      ),
    });
  }

  const rawLinkedin = social?.linkedin;
  if (rawLinkedin && rawLinkedin.trim()) {
    dynamicSocialLinks.push({
      id: 'linkedin',
      href: rawLinkedin,
      label: 'LinkedIn',
      icon: <Linkedin className="size-4" aria-hidden="true" />,
    });
  }

  return (
    <footer
      className="relative overflow-hidden bg-black/78 text-white border-t border-white/15 backdrop-blur-xl"
      dir="rtl"
    >
      {/* Decorative Gold Crown Divider */}
      <div className="relative w-full h-[1px] bg-gradient-to-r from-transparent via-[#CAA048]/40 to-transparent z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rotate-45 border border-[#CAA048]/70 bg-black" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12 pt-14 sm:pt-16 pb-12">
        {/* Main Architectural 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-10 pb-14 border-b border-white/[0.08]">
          {/* Column 1: Brand & Identity (lg:col-span-5) */}
          <div className="md:col-span-2 lg:col-span-5 flex flex-col justify-between">
            <div className="flex flex-row items-center gap-2.5 sm:gap-3">
              {/* Logo on the right (first in RTL) */}
              <div className="shrink-0 flex items-center">
                <BrandMark size="lg" variant="footer" />
              </div>

              {/* Texts alongside the logo (row not column) */}
              <div className="flex flex-col justify-center min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#CAA048] shrink-0" aria-hidden="true" />
                  <p className="text-xs sm:text-sm font-bold tracking-wide text-[#DFC07A] font-almarai">
                    {BRAND.descriptorAr} • {BRAND.promiseAr}
                  </p>
                </div>
                <p className="mt-1 text-xs sm:text-sm leading-5 sm:leading-6 text-white/70 font-cairo">
                  {BRAND.storyAr}
                </p>
              </div>
            </div>

            {/* Social Capsules */}
            <div className="mt-7 pt-4">
              <span className="block text-xs font-semibold text-white/50 font-cairo mb-3">
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
                    className="flex size-10 items-center justify-center rounded-xl border border-white/12 bg-white/[0.05] text-white/80 transition-all duration-300 hover:border-[#CAA048] hover:bg-[#CAA048]/20 hover:text-[#DFC07A] hover:-translate-y-0.5 shadow-sm"
                  >
                    {icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Portfolio Links (lg:col-span-2) */}
          <div className="md:col-span-1 lg:col-span-2">
            <h4 className="text-base font-bold text-white font-heading tracking-wide">
              المحفظة العقارية
            </h4>
            <span
              className="mt-2.5 block h-[2px] w-8 bg-gradient-to-r from-[#CAA048] to-[#DFC07A] rounded-full"
              aria-hidden="true"
            />
            <nav className="mt-6 flex flex-col items-start gap-3.5" aria-label="روابط المحفظة العقارية">
              {PORTFOLIO_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-[#DFC07A] font-cairo"
                >
                  <span className="h-1 w-1 rounded-full bg-[#CAA048]/50 transition-all group-hover:w-2 group-hover:bg-[#CAA048]" />
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3: Company & Ecosystem (lg:col-span-2) */}
          <div className="md:col-span-1 lg:col-span-2">
            <h4 className="text-base font-bold text-white font-heading tracking-wide">
              عن مار وخدماتنا
            </h4>
            <span
              className="mt-2.5 block h-[2px] w-8 bg-gradient-to-r from-[#CAA048] to-[#DFC07A] rounded-full"
              aria-hidden="true"
            />
            <nav className="mt-6 flex flex-col items-start gap-3.5" aria-label="روابط الشركة والخدمات">
              {COMPANY_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-[#DFC07A] font-cairo"
                >
                  <span className="h-1 w-1 rounded-full bg-[#CAA048]/50 transition-all group-hover:w-2 group-hover:bg-[#CAA048]" />
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 4: Headquarters & Contact (lg:col-span-3) */}
          <div className="md:col-span-2 lg:col-span-3">
            <h4 className="text-base font-bold text-white font-heading tracking-wide">
              المقر الرئيسي والتواصل
            </h4>
            <span
              className="mt-2.5 block h-[2px] w-8 bg-gradient-to-r from-[#CAA048] to-[#DFC07A] rounded-full"
              aria-hidden="true"
            />

            <div className="mt-6 space-y-4 font-cairo">
              {/* Location */}
              <div className="flex items-start gap-3.5">
                <div className="size-8.5 rounded-xl bg-[#CAA048]/10 border border-[#CAA048]/25 flex items-center justify-center shrink-0 mt-0.5 text-[#DFC07A]">
                  <MapPin className="size-4" aria-hidden="true" />
                </div>
                <div>
                  <span className="block text-[11px] font-medium text-white/45">المقر الرئيسي</span>
                  <span className="text-sm font-medium text-white/90">
                    {contact?.address || BRAND.contact.cityAr}
                  </span>
                </div>
              </div>

              {/* Direct Phone Lines */}
              <div className="flex items-start gap-3.5">
                <div className="size-8.5 rounded-xl bg-[#CAA048]/10 border border-[#CAA048]/25 flex items-center justify-center shrink-0 mt-0.5 text-[#DFC07A]">
                  <Phone className="size-4" aria-hidden="true" />
                </div>
                <div>
                  <span className="block text-[11px] font-medium text-white/45">خدمة العملاء والمبيعات</span>
                  <div className="flex flex-wrap items-center gap-2 text-sm font-mono text-white/90" dir="ltr">
                    <a
                      href={`tel:${(contact?.unifiedNumber || BRAND.contact.primaryPhone.display).replace(/[^0-9+]/g, '')}`}
                      className="transition-colors hover:text-[#DFC07A]"
                    >
                      {contact?.unifiedNumber || BRAND.contact.primaryPhone.display}
                    </a>
                    {(contact?.mobileNumber || BRAND.contact.secondaryPhone.display) && (
                      <>
                        <span className="text-white/30">|</span>
                        <a
                          href={`tel:${(contact?.mobileNumber || BRAND.contact.secondaryPhone.display).replace(/[^0-9+]/g, '')}`}
                          className="transition-colors hover:text-[#DFC07A]"
                        >
                          {contact?.mobileNumber || BRAND.contact.secondaryPhone.display}
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
                <div className="size-8.5 rounded-xl bg-[#CAA048]/10 border border-[#CAA048]/25 flex items-center justify-center shrink-0 mt-0.5 text-[#DFC07A] group-hover:border-[#CAA048] transition-colors">
                  <Mail className="size-4" aria-hidden="true" />
                </div>
                <div>
                  <span className="block text-[11px] font-medium text-white/45">البريد الإلكتروني الرسمي</span>
                  <span
                    className="text-sm font-medium text-white/90 font-mono group-hover:text-[#DFC07A] transition-colors"
                    dir="ltr"
                  >
                    {contact?.companyEmail || BRAND.contact.email}
                  </span>
                </div>
              </a>

              {/* Working Hours */}
              <div className="flex items-start gap-3.5">
                <div className="size-8.5 rounded-xl bg-[#CAA048]/10 border border-[#CAA048]/25 flex items-center justify-center shrink-0 mt-0.5 text-[#DFC07A]">
                  <Clock className="size-4" aria-hidden="true" />
                </div>
                <div>
                  <span className="block text-[11px] font-medium text-white/45">ساعات استقبال العملاء</span>
                  <span className="text-xs text-white/80">السبت - الخميس: 9:00 ص - 9:00 م</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Accreditation & Government Licensing Strip (شريط الامتثال والتراخيص الرسمية) */}
        <div className="mt-10 rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.04] via-white/[0.02] to-transparent p-5 sm:p-7 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Government Authority Logos */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <div className="relative h-12 w-28 rounded-xl bg-white px-2.5 py-1 border border-white/20 shadow-md flex items-center justify-center transition-transform hover:scale-[1.03]">
                <Image
                  src="/rega_logo.webp"
                  alt="الهيئة العامة للعقار - REGA"
                  fill
                  sizes="112px"
                  className="object-contain p-1.5"
                />
              </div>
              <div className="relative h-12 w-24 rounded-xl bg-white px-2.5 py-1 border border-white/20 shadow-md flex items-center justify-center transition-transform hover:scale-[1.03]">
                <Image
                  src="/fal.webp"
                  alt="رخصة فال العقارية - FAL"
                  fill
                  sizes="96px"
                  className="object-contain p-1.5"
                />
              </div>

              {/* Official Status Chip */}
              <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#CAA048]/12 border border-[#CAA048]/30 text-[#DFC07A] text-xs font-bold font-cairo">
                <ShieldCheck className="size-4" aria-hidden="true" />
                <span>معتمد ومرخص رسمياً</span>
              </div>
            </div>

            {/* License Numbers & Wafi/Code Compliance */}
            <div className="text-center lg:text-start space-y-1 text-xs text-white/65 font-cairo">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-1">
                <span>
                  رخصة فال للوساطة والتسويق:{' '}
                  <strong className="font-mono text-white font-bold text-[13px]">1200000000</strong>
                </span>
                <span className="hidden sm:inline text-white/20">•</span>
                <span>
                  ترخيص الإعلان العقاري:{' '}
                  <strong className="font-mono text-white font-bold text-[13px]">7200018942</strong>
                </span>
              </div>
              <p className="text-[11px] text-white/50">
                ملتزمون بكافة اشتراطات الكود السعودي للبناء، وتصاميم هندسية معتمدة وفق أعلى معايير الجودة والاستدامة.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Deep Black Bottom Copyright & Legal Bar */}
      <div className="relative z-10 border-t border-white/[0.08] bg-black/40 py-6 px-5 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-4 text-xs font-cairo text-white/60">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 text-center sm:text-start">
            <p>
              © {new Date().getFullYear()}{' '}
              <strong className="text-white font-bold">{BRAND.nameAr}</strong> ({BRAND.nameEn}).
              جميع الحقوق محفوظة.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-white/50 text-[11px]">
              <span className="hover:text-white/80 transition-colors cursor-pointer">
                سياسة الخصوصية
              </span>
              <span className="size-1 rounded-full bg-white/20" aria-hidden="true" />
              <span className="hover:text-white/80 transition-colors cursor-pointer">
                الشروط والأحكام
              </span>
              <span className="size-1 rounded-full bg-white/20" aria-hidden="true" />
              <span className="hover:text-white/80 transition-colors cursor-pointer">
                إخلاء المسؤولية
              </span>
            </div>

            {/* Back to top button */}
            <button
              type="button"
              onClick={scrollToTop}
              aria-label="العودة إلى أعلى الصفحة"
              className="inline-flex items-center gap-2 text-xs text-white/60 hover:text-[#DFC07A] transition-colors group cursor-pointer"
            >
              <span className="hidden sm:inline">للأعلى</span>
              <div className="size-7 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center group-hover:border-[#CAA048] group-hover:bg-[#CAA048]/15 text-[#DFC07A] transition-all">
                <ArrowUp className="size-3.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
