'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Building2, BriefcaseBusiness, Home, Info, Menu, Phone, X, ArrowDown } from 'lucide-react';
import BrandMark from '@/components/brand/BrandMark';
import { useInquiryStore } from '@/store/useInquiryStore';

const NAV_LINKS = [
  { href: '/', label: 'الرئيسية', icon: Home },
  { href: '/properties', label: 'العقارات', icon: Building2 },
  { href: '/projects', label: 'مشاريعنا', icon: BriefcaseBusiness },
  { href: '/about', label: 'عن مار', icon: Info },
  { href: '/contact', label: 'تواصل معنا', icon: Phone },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isPastHero, setIsPastHero] = useState(false);
  const openInquiry = useInquiryStore((state) => state.open);

  const handleSkipTour = () => {
    document.getElementById('content-start')?.scrollIntoView({
      behavior: shouldReduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  const checkHeroExit = useCallback(() => {
    // 1. Homepage: Content begins at #content-start right after the villa tour (#mar-story)
    const contentStart = document.getElementById('content-start');
    if (contentStart) {
      const rect = contentStart.getBoundingClientRect();
      setIsPastHero(rect.top <= 80);
      return;
    }

    const marStory = document.getElementById('mar-story');
    if (marStory) {
      const rect = marStory.getBoundingClientRect();
      setIsPastHero(rect.bottom <= 80);
      return;
    }

    // 2. Other pages: Check the first section (hero banner)
    const firstSection =
      document.querySelector('main > section:first-of-type') ||
      document.querySelector('section:first-of-type');
    if (firstSection) {
      const rect = firstSection.getBoundingClientRect();
      setIsPastHero(rect.bottom <= 80);
      return;
    }

    // 3. Fallback: Scroll position
    setIsPastHero(window.scrollY > 400);
  }, []);

  useEffect(() => {
    checkHeroExit();
    const rafId = requestAnimationFrame(checkHeroExit);
    const timeoutId = setTimeout(checkHeroExit, 100);

    window.addEventListener('scroll', checkHeroExit, { passive: true });
    window.addEventListener('resize', checkHeroExit);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', checkHeroExit);
      window.removeEventListener('resize', checkHeroExit);
    };
  }, [checkHeroExit, pathname]);

  // Single item pages (like single property or single project) show the dark header immediately
  const isSinglePage =
    pathname.startsWith('/property/') ||
    (pathname.startsWith('/projects/') && pathname !== '/projects');
  const showDarkHeader = isPastHero || isSinglePage || showMobileMenu;

  useEffect(() => {
    setShowMobileMenu(false);
  }, [pathname]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[45] w-full font-almarai transition-all duration-300 ${
        showMobileMenu
          ? 'border-b border-white/15 bg-black/95 shadow-[0_12px_40px_rgba(0,0,0,0.60)] backdrop-blur-2xl'
          : showDarkHeader
          ? 'border-b border-white/15 bg-black/85 shadow-[0_12px_40px_rgba(0,0,0,0.40)] backdrop-blur-xl'
          : 'border-b-transparent bg-transparent shadow-none backdrop-blur-none pointer-events-auto'
      }`}
    >
      <div className="mx-auto flex h-16 sm:h-20 w-full max-w-[1600px] items-center justify-between px-4 sm:px-8 lg:px-12">
        <BrandMark priority variant="white" size="lg" withArabicText />

        <nav
          className={`hidden items-center gap-1 rounded-2xl p-1 transition-all md:flex ${
            showDarkHeader
              ? 'border border-white/15 bg-black/40 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
              : 'border border-white/20 bg-black/28 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.25)]'
          }`}
          aria-label="التنقل الرئيسي"
        >
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex min-h-10 items-center gap-2 rounded-xl px-3.5 text-xs font-semibold transition-colors lg:px-4 lg:text-sm ${
                  isActive
                    ? 'text-[#E6A821] font-bold'
                    : 'text-white/85 hover:text-white hover:bg-white/10'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="mar-active-navigation"
                    className="absolute inset-0 rounded-xl border border-[#E6A821]/50 bg-white/12 shadow-inner"
                    transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <Icon className="relative z-10 size-4" aria-hidden="true" />
                <span className="relative z-10">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2.5">
          {pathname === '/' && !isPastHero && !showMobileMenu && (
            <button
              type="button"
              onClick={handleSkipTour}
              className="inline-flex items-center gap-1.5 min-h-10 px-3 sm:px-4 text-xs font-semibold text-white bg-black/28 hover:bg-black/50 border border-white/20 hover:border-white/40 rounded-full backdrop-blur-md transition-all shadow-sm cursor-pointer"
            >
              <span>تخطي <span className="hidden sm:inline">الجولة</span></span>
              <ArrowDown className="size-3.5 text-white/80" aria-hidden="true" />
            </button>
          )}

          {/* احجز استشارتك: يظهر على أجهزة الكمبيوتر والشاشات الكبيرة md فقط، ويختفي تماماً من شريط الجوال */}
          <div className="hidden md:flex items-center">
            <button
              type="button"
              className="btn-premium-gold min-h-10 px-4 text-[0.68rem] sm:px-6 sm:text-xs font-bold cursor-pointer"
              onClick={openInquiry}
            >
              احجز استشارتك
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowMobileMenu((isOpen) => !isOpen)}
            className="flex size-10 items-center justify-center rounded-xl border border-white/20 text-white bg-black/35 backdrop-blur-md hover:bg-black/50 transition-colors md:hidden"
            aria-label={showMobileMenu ? 'إغلاق القائمة' : 'فتح القائمة'}
            aria-expanded={showMobileMenu}
            aria-controls="mobile-navigation"
          >
            {showMobileMenu ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showMobileMenu && (
          <motion.nav
            id="mobile-navigation"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            className="w-full border-t border-white/15 bg-black/95 px-4 py-4 shadow-2xl backdrop-blur-2xl md:hidden overflow-hidden flex flex-col gap-2"
            aria-label="التنقل على الهاتف"
          >
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setShowMobileMenu(false)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm transition-all ${
                    isActive
                      ? 'bg-white/10 font-bold text-[#E6A821] border border-[#E6A821]/40'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {link.label}
                </Link>
              );
            })}

            {/* زر احجز استشارتك في الموبايل داخل القائمة */}
            <div className="pt-3 mt-1 border-t border-white/10">
              <button
                type="button"
                className="btn-premium-gold w-full min-h-12 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg rounded-xl"
                onClick={() => {
                  setShowMobileMenu(false);
                  openInquiry();
                }}
              >
                احجز استشارتك
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
