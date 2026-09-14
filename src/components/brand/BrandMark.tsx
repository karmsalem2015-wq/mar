import Image from 'next/image';
import Link from 'next/link';
import { BRAND } from '@/config/brand';

interface BrandMarkProps {
  compact?: boolean;
  priority?: boolean;
  className?: string;
  variant?: 'dark' | 'white' | 'footer';
  size?: 'sm' | 'md' | 'lg';
  withArabicText?: boolean;
  showSubtitle?: boolean;
  useIcon?: boolean;
  src?: string;
}

const HEADER_LOGO_SIZE_CLASSES: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'h-9 sm:h-10 w-auto',
  md: 'h-11 sm:h-12 md:h-13 w-auto',
  lg: 'h-12 sm:h-14 md:h-16 w-auto',
};

const FOOTER_LOGO_SIZE_CLASSES: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'h-9 w-auto',
  md: 'h-11 sm:h-12 md:h-14 w-auto',
  lg: 'h-[64px] sm:h-[68px] md:h-[72px] w-auto',
};

const ICON_SIZE_CLASSES: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'size-8 sm:size-9',
  md: 'size-10 sm:size-11 md:size-12',
  lg: 'size-16 sm:size-20 md:size-24',
};

export default function BrandMark({
  compact = false,
  priority = false,
  className = '',
  variant = 'dark',
  size = 'md',
  withArabicText = false,
  showSubtitle = true,
  useIcon = false,
  src,
}: BrandMarkProps) {
  const isFooter = variant === 'footer';
  const logoSrc =
    src ||
    (isFooter
      ? BRAND.footerLogo || '/mar-logo-gold.png'
      : useIcon
      ? BRAND.icon || '/icon.png'
      : BRAND.headerLogo || '/heder-logo.png');

  const isWhite = variant === 'white' || variant === 'footer';
  const isSquareIcon = useIcon || logoSrc === BRAND.icon || logoSrc === '/icon.png';
  
  const sizeClasses = isSquareIcon
    ? ICON_SIZE_CLASSES[size]
    : isFooter
    ? FOOTER_LOGO_SIZE_CLASSES[size]
    : HEADER_LOGO_SIZE_CLASSES[size];

  return (
    <Link
      href="/"
      aria-label={`${BRAND.nameAr} — الرئيسية`}
      className={`group inline-flex items-center gap-3 sm:gap-3.5 transition-all duration-300 hover:opacity-95 ${className}`}
    >
      <div className="relative flex shrink-0 items-center">
        <Image
          src={logoSrc}
          alt={`${BRAND.nameAr} - ${BRAND.nameEn}`}
          width={isFooter || isSquareIcon ? 200 : 380}
          height={isFooter || isSquareIcon ? 200 : 150}
          className={`${sizeClasses} object-contain transition-transform duration-300 group-hover:scale-[1.03]`}
          priority={priority}
          unoptimized
        />
      </div>

      {withArabicText && !compact && (
        <div
          className={`flex flex-col border-r pr-3 sm:pr-3.5 text-right justify-center select-none ${
            isWhite ? 'border-[#E6A821]/30' : 'border-gray-200'
          }`}
        >
          <span
            className="font-cairo text-sm sm:text-base md:text-lg lg:text-xl font-black tracking-wide leading-tight transition-all duration-300 group-hover:brightness-110"
            style={
              isWhite
                ? {
                    background:
                      'linear-gradient(135deg, #FFF1AC 0%, #F5C042 22%, #E58D1B 50%, #B85F08 75%, #FCD868 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.45))',
                  }
                : undefined
            }
          >
            {BRAND.nameAr}
          </span>
          {showSubtitle && (
            <span
              className={`font-cairo text-[10px] sm:text-[11px] font-bold tracking-wider leading-none mt-1 transition-colors ${
                isWhite ? 'text-[#F5C042]/90' : 'text-[#CAA048]'
              }`}
            >
              {BRAND.promiseAr}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
