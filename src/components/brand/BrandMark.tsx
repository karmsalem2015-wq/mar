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
  useIcon?: boolean;
  src?: string;
}

const HEADER_LOGO_SIZE_CLASSES: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'h-8 sm:h-9 w-auto',
  md: 'h-10 sm:h-11 md:h-12 w-auto',
  lg: 'h-14 sm:h-16 md:h-20 w-auto',
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
      className={`group inline-flex items-center gap-3 transition-all duration-300 hover:opacity-95 ${className}`}
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
          className={`flex flex-col border-r pr-3 text-right leading-tight ${
            isWhite ? 'border-white/20' : 'border-gray-200'
          }`}
        >
          <span
            className={`font-almarai text-sm font-black transition-colors ${
              isWhite ? 'text-white' : 'text-brand-black group-hover:text-[#CAA048]'
            }`}
          >
            {BRAND.nameAr}
          </span>
          <span className="font-almarai text-[10px] text-[#CAA048] font-bold">
            {BRAND.promiseAr}
          </span>
        </div>
      )}
    </Link>
  );
}
