'use client';

import { useEffect, useState, type ReactNode } from 'react';
import HeroDesktopWheelSection from './HeroDesktopWheelSection';
import HeroMobileCinematicSection from './HeroMobileCinematicSection';

const DESKTOP_MEDIA_QUERY = '(min-width: 768px) and (orientation: landscape)';

interface HeroCinematicSectionProps {
  searchBar?: ReactNode;
}

export default function HeroCinematicSection({ searchBar }: HeroCinematicSectionProps = {}) {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const update = () => setIsDesktop(mediaQuery.matches);
    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  if (isDesktop === null) {
    return <div className="h-[100svh] w-full bg-[#060D1A]" aria-hidden="true" />;
  }

  return isDesktop
    ? <HeroDesktopWheelSection searchBar={searchBar} />
    : <HeroMobileCinematicSection searchBar={searchBar} />;
}
