'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import HeroFramesSection from './HeroSection';
import HeroVideoSection from './HeroVideoSection';
import { HERO_MEDIA } from './heroStory';

const DESKTOP_MEDIA_QUERY = '(min-width: 768px) and (orientation: landscape)';
const ORIGINAL_MOBILE_SRC = HERO_MEDIA.mobile.src;

type PreloadDiagWindow = Window & {
  __MAR_HERO_PRELOAD__?: {
    status: 'loading' | 'ready' | 'error';
    bytes?: number;
    ms?: number;
    source?: string;
    error?: string;
  };
};

interface HeroBlobPreloadSectionProps {
  searchBar?: React.ReactNode;
}

export default function HeroBlobPreloadSection({
  searchBar,
}: HeroBlobPreloadSectionProps = {}) {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const [mobileBlobReady, setMobileBlobReady] = useState(false);
  const [mobileBlobFailed, setMobileBlobFailed] = useState(false);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const update = () => setIsDesktop(mediaQuery.matches);
    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (isDesktop !== false || mobileBlobReady || mobileBlobFailed) return;

    const controller = new AbortController();
    let disposed = false;
    const startedAt = performance.now();
    const diagWindow = window as PreloadDiagWindow;
    diagWindow.__MAR_HERO_PRELOAD__ = {
      status: 'loading',
      source: ORIGINAL_MOBILE_SRC,
    };

    const preload = async () => {
      try {
        // Fetch the complete mobile movie before handing it to the video element.
        // Once converted to an object URL, every seek is local and cannot stall on
        // a new HTTP range request during the cinematic scroll.
        const response = await fetch(ORIGINAL_MOBILE_SRC, {
          cache: 'force-cache',
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Hero preload failed with HTTP ${response.status}`);
        }

        const blob = await response.blob();
        if (disposed) return;
        if (blob.size < 1024) throw new Error('Hero preload returned an empty file');

        const objectUrl = URL.createObjectURL(blob);
        objectUrlRef.current = objectUrl;

        // HERO_MEDIA is a shared runtime object. The video engine reads this value
        // when it mounts, so mobile gets the fully local object URL while desktop
        // keeps its original source untouched.
        const mutableMobileMedia = HERO_MEDIA.mobile as unknown as { src: string };
        mutableMobileMedia.src = objectUrl;

        diagWindow.__MAR_HERO_PRELOAD__ = {
          status: 'ready',
          bytes: blob.size,
          ms: performance.now() - startedAt,
          source: ORIGINAL_MOBILE_SRC,
        };
        setMobileBlobReady(true);
      } catch (error) {
        if (disposed || controller.signal.aborted) return;
        const message = error instanceof Error ? error.message : String(error);
        diagWindow.__MAR_HERO_PRELOAD__ = {
          status: 'error',
          ms: performance.now() - startedAt,
          source: ORIGINAL_MOBILE_SRC,
          error: message,
        };
        setMobileBlobFailed(true);
      }
    };

    void preload();

    return () => {
      disposed = true;
      controller.abort();
    };
  }, [isDesktop, mobileBlobFailed, mobileBlobReady]);

  useEffect(() => {
    return () => {
      const objectUrl = objectUrlRef.current;
      if (!objectUrl) return;
      const mutableMobileMedia = HERO_MEDIA.mobile as unknown as { src: string };
      if (mutableMobileMedia.src === objectUrl) {
        mutableMobileMedia.src = ORIGINAL_MOBILE_SRC;
      }
      URL.revokeObjectURL(objectUrl);
      objectUrlRef.current = null;
      delete (window as PreloadDiagWindow).__MAR_HERO_PRELOAD__;
    };
  }, []);

  // Keep desktop on the previously proven frame engine while the new full-blob
  // architecture is validated on the more demanding mobile path first.
  if (isDesktop) {
    return <HeroFramesSection searchBar={searchBar} />;
  }

  // If the full download itself fails, fall back safely instead of leaving a
  // broken hero. This also preserves the current production behaviour offline.
  if (mobileBlobFailed) {
    return <HeroFramesSection searchBar={searchBar} />;
  }

  if (isDesktop === false && mobileBlobReady) {
    return <HeroVideoSection searchBar={searchBar} />;
  }

  // During the first visit we deliberately hold the poster until the complete
  // mobile video is local. The section keeps its final geometry so there is no
  // layout jump when the scrub engine mounts.
  return (
    <section
      id="mar-story"
      aria-label="جولة مار العقارية"
      className="relative h-[500svh] w-full bg-[#060D1A] md:h-[850vh]"
    >
      <div className="sticky top-0 h-screen h-[100svh] w-full overflow-hidden bg-[#060D1A]">
        <Image
          src={HERO_MEDIA.mobile.poster}
          alt="واجهة مشروع سكني من مار العقارية"
          fill
          priority
          sizes="100vw"
          className="object-cover md:hidden"
        />
        <Image
          src={HERO_MEDIA.desktop.poster}
          alt="واجهة مشروع سكني من مار العقارية"
          fill
          priority
          sizes="100vw"
          className="hidden object-cover md:block"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(6,13,26,0.28)_0%,rgba(6,13,26,0.03)_36%,rgba(6,13,26,0.72)_100%)]"
          aria-hidden="true"
        />
        <div className="absolute right-4 top-20 z-20 flex items-center gap-2 rounded-full border border-[#E6A821]/30 bg-black/60 px-4 py-2 text-xs text-white backdrop-blur-md font-cairo shadow-lg">
          <span className="size-2 rounded-full bg-[#E6A821] animate-pulse" />
          <span>جارٍ تحميل الجولة السينمائية…</span>
        </div>
      </div>
    </section>
  );
}
