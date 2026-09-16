'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import HeroDesktopWheelSection from './HeroDesktopWheelSection';
import HeroMobileCinematicSection from './HeroMobileCinematicSection';

const DESKTOP_MEDIA_QUERY = '(min-width: 768px) and (orientation: landscape)';
const DESKTOP_FINAL_FRAME = '/media/hero/frames/desktop/frame_0381.webp';

type HeroPreloadWindow = Window & {
  __MAR_HERO_PRELOAD__?: {
    status?: 'loading' | 'ready' | 'direct-fallback' | 'error';
  };
};

interface HeroCinematicSectionProps {
  searchBar?: ReactNode;
}

export default function HeroCinematicSection({ searchBar }: HeroCinematicSectionProps = {}) {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const [desktopFinalReady, setDesktopFinalReady] = useState(false);
  const [showDesktopFinal, setShowDesktopFinal] = useState(false);
  const finalPreloadStartedRef = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const update = () => setIsDesktop(mediaQuery.matches);
    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!isDesktop) {
      finalPreloadStartedRef.current = false;
      setDesktopFinalReady(false);
      setShowDesktopFinal(false);
      return;
    }

    let disposed = false;
    let pollTimer: number | null = null;

    const preloadFinalFrame = () => {
      if (finalPreloadStartedRef.current) return;
      finalPreloadStartedRef.current = true;

      const image = new window.Image();
      image.decoding = 'async';
      image.src = DESKTOP_FINAL_FRAME;

      const markReady = () => {
        if (!disposed) setDesktopFinalReady(true);
      };

      if (image.complete) {
        void image.decode().then(markReady).catch(markReady);
      } else {
        image.onload = () => {
          void image.decode().then(markReady).catch(markReady);
        };
        image.onerror = () => {
          // Keep the video frame as a graceful fallback if the still image fails.
          finalPreloadStartedRef.current = false;
        };
      }
    };

    const checkVideoPreload = () => {
      const status = (window as HeroPreloadWindow).__MAR_HERO_PRELOAD__?.status;
      if (status === 'ready' || status === 'direct-fallback') {
        preloadFinalFrame();
        if (pollTimer !== null) {
          window.clearInterval(pollTimer);
          pollTimer = null;
        }
      }
    };

    const handleTourComplete = () => {
      // The wheel engine is already on its final video position. Replace only
      // the visual layer with the pre-decoded still so the completed hero stays
      // razor sharp without touching playback or page-unlock behavior.
      preloadFinalFrame();
      setShowDesktopFinal(true);
    };

    checkVideoPreload();
    if (!finalPreloadStartedRef.current) {
      pollTimer = window.setInterval(checkVideoPreload, 250);
    }

    window.addEventListener('mar:tour-complete', handleTourComplete);

    return () => {
      disposed = true;
      if (pollTimer !== null) window.clearInterval(pollTimer);
      window.removeEventListener('mar:tour-complete', handleTourComplete);
    };
  }, [isDesktop]);

  if (isDesktop === null) {
    return <div className="h-[100svh] w-full bg-[#060D1A]" aria-hidden="true" />;
  }

  if (!isDesktop) {
    return <HeroMobileCinematicSection searchBar={searchBar} />;
  }

  return (
    <div className="relative h-[100svh] w-full bg-[#060D1A]">
      <HeroDesktopWheelSection searchBar={searchBar} />

      {desktopFinalReady && (
        <div
          className={`pointer-events-none absolute inset-0 z-[5] overflow-hidden transition-opacity duration-200 ease-out ${
            showDesktopFinal ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden="true"
        >
          <Image
            src={DESKTOP_FINAL_FRAME}
            alt=""
            fill
            unoptimized
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,13,26,0.48)_0%,rgba(6,13,26,0.06)_45%,rgba(6,13,26,0.46)_100%)]" />
        </div>
      )}
    </div>
  );
}
