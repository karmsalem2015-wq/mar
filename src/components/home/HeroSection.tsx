'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowLeft,
  Building2,
  MessageCircle,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useInquiryStore } from '@/store/useInquiryStore';
import {
  getActiveHeroStopByVideoProgress,
  getHeroVideoProgress,
  HERO_MEDIA,
  HERO_STORY_STOPS,
  HeroMediaVariant,
  HeroStoryAction,
  HeroStoryStop,
} from './heroStory';

const DESKTOP_MEDIA_QUERY = '(min-width: 768px) and (orientation: landscape)';

function getFrameUrl(variant: HeroMediaVariant, index: number): string {
  const padded = String(index).padStart(4, '0');
  return `${HERO_MEDIA[variant].framesPath}/frame_${padded}.webp`;
}

function StoryAction({
  action,
  onOpenInquiry,
}: {
  action: HeroStoryAction;
  onOpenInquiry: () => void;
}) {
  const className =
    action.emphasis === 'primary'
      ? 'inline-flex min-h-7 sm:min-h-8 flex-1 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#CB841B] via-[#E6A821] to-[#FDE36E] px-2.5 py-1 sm:px-3 sm:py-1.5 text-[0.68rem] sm:text-xs font-bold text-[#111315] shadow-md shadow-[#E6A821]/15 hover:brightness-105 active:scale-[0.98] transition-colors duration-200 font-cairo sm:flex-none cursor-pointer'
      : 'inline-flex min-h-7 sm:min-h-8 flex-1 items-center justify-center gap-1.5 rounded-full border border-white/20 bg-black/40 hover:bg-white/15 px-2.5 py-1 sm:px-3 sm:py-1.5 text-[0.68rem] sm:text-xs font-bold text-white backdrop-blur-md transition-colors duration-200 hover:border-white/40 font-cairo sm:flex-none cursor-pointer';

  const content = (
    <>
      {action.kind === 'inquiry' ? (
        <MessageCircle className="size-3 sm:size-3.5 text-[#E6A821]" aria-hidden="true" />
      ) : (
        <Building2 className="size-3 sm:size-3.5" aria-hidden="true" />
      )}
      <span>{action.label}</span>
      {action.kind === 'link' && (
        <ArrowLeft className="size-3 sm:size-3.5" aria-hidden="true" />
      )}
    </>
  );

  if (action.kind === 'link') {
    return (
      <Link href={action.href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={className} onClick={onOpenInquiry}>
      {content}
    </button>
  );
}

function StoryCardBody({
  stop,
  shouldReduceMotion,
  openInquiry,
}: {
  stop: HeroStoryStop;
  shouldReduceMotion?: boolean | null;
  openInquiry: () => void;
}) {
  return (
    <>
      {/* Subtle Luxury Top Gold Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#E6A821] to-transparent opacity-85" />

      <div className="mb-1.5 sm:mb-2 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-[#E6A821]/15 px-2 py-0.5 text-[0.62rem] sm:text-[0.68rem] font-bold text-[#FDE36E] border border-[#E6A821]/30 font-cairo shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E6A821] animate-pulse" />
          <span>{stop.eyebrow}</span>
        </span>
        <span className="font-mono text-[0.62rem] sm:text-[0.68rem] font-bold text-white/50 tracking-wider" dir="ltr">
          {stop.sceneNumber} / 05
        </span>
      </div>

      <h2 className="text-balance text-xs sm:text-sm md:text-base font-black leading-snug text-white font-heading drop-shadow-md">
        {stop.title}
      </h2>
      <p className="mt-1 text-[0.68rem] sm:text-xs leading-relaxed text-white/85 max-w-xs font-cairo drop-shadow-xs line-clamp-2 sm:line-clamp-none">
        {stop.description}
      </p>

      {stop.actions && (
        <div className="mt-2.5 flex flex-row gap-2">
          {stop.actions.map((action) => (
            <StoryAction
              key={`${action.kind}-${action.label}`}
              action={action}
              onOpenInquiry={openInquiry}
            />
          ))}
        </div>
      )}

      {stop.sceneNumber === '01' && !shouldReduceMotion && (
        <div className="mt-2 flex items-center gap-1.5 border-t border-white/10 pt-1.5 text-[0.62rem] sm:text-[0.68rem] text-white/65 font-cairo">
          <span className="w-3.5 h-3.5 rounded-full bg-[#E6A821]/20 border border-[#E6A821]/35 flex items-center justify-center text-[#E6A821] shrink-0">
            <ArrowDown className="size-2 animate-bounce" aria-hidden="true" />
          </span>
          <span>مرّر للأسفل للتجوّل داخل المشروع</span>
        </div>
      )}
    </>
  );
}

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressTrackRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mediaVariantRef = useRef<HeroMediaVariant | null>(null);
  const activeStopIndexRef = useRef(0);

  const [mediaVariant, setMediaVariant] = useState<HeroMediaVariant | null>(null);
  const [activeStopIndex, setActiveStopIndex] = useState(0);
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const openInquiry = useInquiryStore((state) => state.open);

  // Progressive image cache (Apple style)
  const imageCacheRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const isMountedRef = useRef(true);

  // Canvas animation & smoothing refs
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const targetFrameRef = useRef(1);
  const smoothFrameRef = useRef(1);
  const lastDrawnFrameRef = useRef(-1);
  const lastRafTimestampRef = useRef(0);
  const scrubRafRef = useRef<number | null>(null);
  const loadSingleFrameRef = useRef<((index: number) => Promise<HTMLImageElement | null>) | null>(null);

  // Viewport & section layout stability (prevents synchronous layout thrashing)
  const stableViewportHeightRef = useRef(0);
  const lastViewportWidthRef = useRef(0);
  const sectionHeightRef = useRef(0);
  const sectionTopRef = useRef(0);

  const updateSectionMetrics = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;
    sectionHeightRef.current = section.offsetHeight;
    const rect = section.getBoundingClientRect();
    const currentScrollY = window.scrollY || window.pageYOffset || 0;
    sectionTopRef.current = rect.top + currentScrollY;
  }, []);

  const getStableViewportHeight = useCallback(() => {
    if (typeof window === 'undefined') return 800;
    const currentWidth = window.innerWidth;
    if (
      stableViewportHeightRef.current === 0 ||
      Math.abs(currentWidth - lastViewportWidthRef.current) > 2
    ) {
      stableViewportHeightRef.current = window.innerHeight;
      lastViewportWidthRef.current = currentWidth;
    }
    return stableViewportHeightRef.current;
  }, []);

  // Priority Window Preloader: pre-emptively buffers frames around the user's scroll direction
  const preloadWindow = useCallback((centerIndex: number, ahead = 35, behind = 10) => {
    const variant = mediaVariantRef.current;
    if (!variant || !loadSingleFrameRef.current) return;
    const total = HERO_MEDIA[variant].totalFrames;
    const cache = imageCacheRef.current;

    const start = Math.max(1, Math.floor(centerIndex - behind));
    const end = Math.min(total, Math.ceil(centerIndex + ahead));

    for (let i = start; i <= end; i++) {
      if (!cache.has(i)) {
        loadSingleFrameRef.current(i);
      }
    }
  }, []);

  // Find the closest loaded frame to prevent any blank gaps while streaming
  const getBestAvailableImage = useCallback(
    (targetIndex: number, total: number): HTMLImageElement | null => {
      const cache = imageCacheRef.current;
      if (cache.has(targetIndex)) return cache.get(targetIndex)!;

      for (let offset = 1; offset < total; offset++) {
        const lower = targetIndex - offset;
        if (lower >= 1 && cache.has(lower)) return cache.get(lower)!;
        const upper = targetIndex + offset;
        if (upper <= total && cache.has(upper)) return cache.get(upper)!;
      }
      return null;
    },
    [],
  );

  // Crisp single-frame GPU renderer (Apple-standard: pure 1080p, zero ghosting, zero crossfade judder)
  const drawFrame = useCallback(
    (floatFrame: number, forceRedraw = false) => {
      const canvas = canvasRef.current;
      const variant = mediaVariantRef.current;
      if (!canvas || !variant) return;

      const total = HERO_MEDIA[variant].totalFrames;
      const frameIndex = Math.min(Math.max(Math.round(floatFrame), 1), total);

      // Skip painting if this exact integer frame is already painted on screen
      if (!forceRedraw && lastDrawnFrameRef.current === frameIndex) return;

      const img = getBestAvailableImage(frameIndex, total);
      if (!img || !img.complete || img.naturalWidth === 0) return;

      let ctx = ctxRef.current;
      if (!ctx) {
        ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
        ctxRef.current = ctx;
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'medium';
        }
      }
      if (!ctx) return;

      lastDrawnFrameRef.current = frameIndex;

      const width = canvas.width;
      const height = canvas.height;
      const imgRatio = img.naturalWidth / img.naturalHeight;
      const canvasRatio = width / height;

      let renderWidth = width;
      let renderHeight = height;
      let x = 0;
      let y = 0;

      if (canvasRatio > imgRatio) {
        renderHeight = width / imgRatio;
        y = (height - renderHeight) / 2;
      } else {
        renderWidth = height * imgRatio;
        x = (width - renderWidth) / 2;
      }

      ctx.drawImage(img, x, y, renderWidth, renderHeight);
    },
    [getBestAvailableImage],
  );

  // Update canvas resolution with devicePixelRatio (capped at 1.5 for ultra-fast GPU throughput)
  const updateCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = window.innerWidth;
    // On mobile, use getStableViewportHeight() so the canvas resolution is NEVER wiped by address bar collapse
    const height = getStableViewportHeight();

    const targetWidth = Math.round(width * dpr);
    const targetHeight = Math.round(height * dpr);

    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      ctxRef.current = canvas.getContext('2d', { alpha: false, desynchronized: true });
      if (ctxRef.current) {
        ctxRef.current.imageSmoothingEnabled = true;
        ctxRef.current.imageSmoothingQuality = 'medium';
      }
      if (smoothFrameRef.current > 0) {
        drawFrame(smoothFrameRef.current, true);
      }
    }
  }, [drawFrame, getStableViewportHeight]);

  // Steadicam inertia smoothing loop: continuous sub-frame floating-point tracking
  const stepSmoothAnimation = useCallback(
    (timestamp: number) => {
      const variant = mediaVariantRef.current;
      if (!variant) {
        scrubRafRef.current = null;
        lastRafTimestampRef.current = 0;
        return;
      }

      const totalFrames = HERO_MEDIA[variant].totalFrames;
      const lastTime = lastRafTimestampRef.current;
      lastRafTimestampRef.current = timestamp;
      const dt = lastTime === 0 ? 0.016 : Math.min((timestamp - lastTime) / 1000, 0.05);

      const isMobile = variant === 'mobile';
      const target = targetFrameRef.current;
      const current = smoothFrameRef.current;
      const delta = target - current;

      if (isMobile) {
        // Mobile touch: direct 1:1 tracking.
        // Mobile OS (iOS Safari & Android Chrome) provides native 120Hz momentum deceleration.
        // Eliminating artificial software lag makes swiping feel feather-light with zero dragging resistance.
        smoothFrameRef.current = target;
      } else {
        // Desktop: Lenis handles the smooth cubic-bezier scroll easing.
        // Responsive tracking (lambda 26.0) locks the canvas to Lenis without trailing lag or float.
        const factor = 1 - Math.exp(-26.0 * dt);
        if (Math.abs(delta) > 0.005) {
          smoothFrameRef.current += delta * factor;
        } else {
          smoothFrameRef.current = target;
        }
      }

      const currentFloatFrame = Math.min(
        Math.max(smoothFrameRef.current, 1),
        totalFrames,
      );

      // Render crisp frame
      drawFrame(currentFloatFrame);

      // Story card sync tied to current camera progress
      const progress = (currentFloatFrame - 1) / (totalFrames - 1);
      const nextStopIndex = getActiveHeroStopByVideoProgress(progress, activeStopIndexRef.current);
      if (activeStopIndexRef.current !== nextStopIndex) {
        activeStopIndexRef.current = nextStopIndex;
        setActiveStopIndex(nextStopIndex);
      }

      if (Math.abs(targetFrameRef.current - smoothFrameRef.current) > 0.005) {
        scrubRafRef.current = window.requestAnimationFrame(stepSmoothAnimation);
      } else {
        scrubRafRef.current = null;
        lastRafTimestampRef.current = 0;
      }
    },
    [drawFrame],
  );

  const startSmoothAnimation = useCallback(() => {
    if (scrubRafRef.current === null) {
      lastRafTimestampRef.current = 0;
      scrubRafRef.current = window.requestAnimationFrame(stepSmoothAnimation);
    }
  }, [stepSmoothAnimation]);

  // Progressive Runway + Proximity Preloader
  useEffect(() => {
    if (!mediaVariant) return;

    isMountedRef.current = true;
    const variant = mediaVariant;
    const total = HERO_MEDIA[variant].totalFrames;
    const cache = imageCacheRef.current;
    cache.clear();

    let isAborted = false;
    const pendingPromises = new Map<number, Promise<HTMLImageElement | null>>();

    const loadSingleFrame = (index: number): Promise<HTMLImageElement | null> => {
      if (cache.has(index)) return Promise.resolve(cache.get(index)!);
      if (pendingPromises.has(index)) return pendingPromises.get(index)!;

      const p = new Promise<HTMLImageElement | null>((resolve) => {
        const img = new window.Image();
        img.src = getFrameUrl(variant, index);
        img.decoding = 'async';
        img.onload = () => {
          if (!isAborted && isMountedRef.current) {
            cache.set(index, img);
            resolve(img);
          } else {
            resolve(null);
          }
        };
        img.onerror = () => resolve(null);
      });

      pendingPromises.set(index, p);
      return p;
    };

    loadSingleFrameRef.current = loadSingleFrame;

    const loadHierarchicalSequence = async () => {
      // 1. Instant initial frame paint
      const firstImg = await loadSingleFrame(1);
      if (isAborted) return;

      if (firstImg) {
        setIsCanvasReady(true);
        updateCanvasSize();
        drawFrame(1, true);
      }

      // 2. High-speed Sequential Runway (frames 2 through 40)
      // Loads contiguously so the user has an immediate smooth buffer with zero missing frames
      const runway: number[] = [];
      for (let i = 2; i <= Math.min(40, total); i++) {
        runway.push(i);
      }
      await Promise.all(runway.map(loadSingleFrame));
      if (isAborted) return;

      // 3. High-throughput continuous worker pool for all remaining frames
      // 8 parallel workers continuously drain the queue so slow individual frames never stall the pipeline
      const remaining: number[] = [];
      for (let i = 41; i <= total; i++) {
        if (!cache.has(i)) remaining.push(i);
      }

      const CONCURRENCY = 8;
      let nextIndex = 0;
      const worker = async () => {
        while (nextIndex < remaining.length && !isAborted) {
          const frameIdx = remaining[nextIndex++];
          if (frameIdx !== undefined && !cache.has(frameIdx)) {
            await loadSingleFrame(frameIdx);
          }
        }
      };

      await Promise.all(Array.from({ length: CONCURRENCY }, worker));
    };

    loadHierarchicalSequence();

    return () => {
      isAborted = true;
      loadSingleFrameRef.current = null;
    };
  }, [drawFrame, mediaVariant, updateCanvasSize]);

  // Variant change detection
  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);

    const updateMediaVariant = () => {
      const nextVariant: HeroMediaVariant = mediaQuery.matches ? 'desktop' : 'mobile';
      if (mediaVariantRef.current === nextVariant) return;

      mediaVariantRef.current = nextVariant;
      targetFrameRef.current = 1;
      smoothFrameRef.current = 1;
      lastDrawnFrameRef.current = -1;
      activeStopIndexRef.current = 0;
      setActiveStopIndex(0);
      setIsCanvasReady(false);
      setMediaVariant(nextVariant);
    };

    updateMediaVariant();
    mediaQuery.addEventListener('change', updateMediaVariant);

    return () => mediaQuery.removeEventListener('change', updateMediaVariant);
  }, []);

  // Scroll sync handler
  const syncStoryToScroll = useCallback(() => {
    animationFrameRef.current = null;

    const section = sectionRef.current;
    if (!section || shouldReduceMotion) return;

    const viewportHeight = getStableViewportHeight();
    const sectionHeight = sectionHeightRef.current || section.offsetHeight;
    const scrollableDistance = Math.max(sectionHeight - viewportHeight, 1);
    
    // Read window.scrollY directly: zero layout thrashing, 100% GPU composited
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const relativeScroll = Math.max(0, scrollY - (sectionTopRef.current || 0));
    const scrollProgress = Math.min(Math.max(relativeScroll / scrollableDistance, 0), 1);

    if (progressBarRef.current) {
      progressBarRef.current.style.transform = `scaleX(${scrollProgress})`;
    }
    progressTrackRef.current?.setAttribute(
      'aria-valuenow',
      String(Math.round(scrollProgress * 100)),
    );

    const variant = mediaVariantRef.current;
    if (!variant) return;

    const totalFrames = HERO_MEDIA[variant].totalFrames;
    const videoProgress = getHeroVideoProgress(scrollProgress);
    
    // Continuous floating-point target (NO integer rounding here!)
    const targetFrame = Math.min(
      Math.max(videoProgress * (totalFrames - 1) + 1, 1),
      totalFrames,
    );

    targetFrameRef.current = targetFrame;
    
    // Proximity window preload ahead of current target
    preloadWindow(targetFrame);

    startSmoothAnimation();
  }, [getStableViewportHeight, preloadWindow, shouldReduceMotion, startSmoothAnimation]);

  const requestScrollSync = useCallback(() => {
    if (animationFrameRef.current !== null) return;
    animationFrameRef.current = window.requestAnimationFrame(syncStoryToScroll);
  }, [syncStoryToScroll]);

  // Event listeners for scroll and resize
  useEffect(() => {
    if (shouldReduceMotion) {
      activeStopIndexRef.current = 0;
      setActiveStopIndex(0);
      return;
    }

    const handleOrientationChange = () => {
      stableViewportHeightRef.current = 0;
      updateSectionMetrics();
      updateCanvasSize();
      requestScrollSync();
    };

    const handleResize = () => {
      const currentWidth = window.innerWidth;
      // Only recalculate canvas dimensions if WIDTH changed (orientation flip or desktop resize)
      // Disregard height-only shifts caused by the mobile browser address bar sliding!
      if (Math.abs(currentWidth - lastViewportWidthRef.current) > 2) {
        stableViewportHeightRef.current = window.innerHeight;
        lastViewportWidthRef.current = currentWidth;
        updateSectionMetrics();
        updateCanvasSize();
      }
      requestScrollSync();
    };

    updateSectionMetrics();
    updateCanvasSize();
    requestScrollSync();

    window.addEventListener('scroll', requestScrollSync, { passive: true });
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('scroll', requestScrollSync);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (scrubRafRef.current !== null) {
        window.cancelAnimationFrame(scrubRafRef.current);
        scrubRafRef.current = null;
      }
    };
  }, [requestScrollSync, shouldReduceMotion, updateCanvasSize, updateSectionMetrics]);

  const activeStop =
    activeStopIndex >= 0 ? HERO_STORY_STOPS[activeStopIndex] : null;
  const displayedStop = shouldReduceMotion ? HERO_STORY_STOPS[0] : activeStop;

  return (
    <section
      ref={sectionRef}
      id="mar-story"
      aria-label="جولة مار العقارية"
      className={`relative w-full bg-[#060D1A] ${
        shouldReduceMotion ? 'h-[100svh]' : 'h-[420svh] md:h-[900vh] lg:h-[1100vh]'
      }`}
    >
      <div className="sticky top-0 h-screen h-[100svh] w-full overflow-hidden bg-[#060D1A]">
        {/* Instant Poster Background while frame 1 initializes */}
        <div
          className={`absolute inset-0 transition-opacity duration-700 ${
            isCanvasReady ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <Image
            src={HERO_MEDIA.desktop.poster}
            alt="واجهة مشروع سكني من مار العقارية"
            fill
            priority
            sizes="(min-width: 768px) and (orientation: landscape) 100vw, 1px"
            className="hidden object-cover md:landscape:block"
          />
          <Image
            src={HERO_MEDIA.mobile.poster}
            alt="واجهة مشروع سكني من مار العقارية"
            fill
            priority
            sizes="(max-width: 767px) 100vw, (orientation: portrait) 100vw, 1px"
            className="object-cover md:landscape:hidden"
          />
        </div>

        {/* 60fps/120fps GPU Canvas Renderer */}
        {mediaVariant && !shouldReduceMotion && (
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 size-full object-cover transition-opacity duration-500 ${
              isCanvasReady ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden="true"
          />
        )}

        {/* Elegant Luxury Vignette & Contrast Overlay */}
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(6,13,26,0.28)_0%,rgba(6,13,26,0.03)_36%,rgba(6,13,26,0.72)_100%)] md:bg-[linear-gradient(90deg,rgba(6,13,26,0.48)_0%,rgba(6,13,26,0.06)_45%,rgba(6,13,26,0.46)_100%)]"
          aria-hidden="true"
        />

        {/* Subtle loading badge before initial frame arrives */}
        {!isCanvasReady && !shouldReduceMotion && (
          <div className="absolute right-4 top-20 z-20 flex items-center gap-2 rounded-full border border-[#E6A821]/30 bg-black/60 px-4 py-2 text-xs text-white backdrop-blur-md sm:right-8 sm:top-24 font-cairo shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[#E6A821] animate-pulse" />
            <span>جارٍ تجهيز الجولة السينمائية…</span>
          </div>
        )}

        {/* Mobile Card: Centered Horizontally at Bottom */}
        <div className="md:hidden pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center pb-[calc(4.5rem+env(safe-area-inset-bottom))] px-4">
          <AnimatePresence mode="wait" initial={false}>
            {displayedStop && (
              <motion.div
                key={displayedStop.id}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease: 'easeOut' }}
                className="pointer-events-auto w-full max-w-[19rem] sm:max-w-[20.5rem] rounded-2xl border border-white/15 hover:border-[#E6A821]/40 bg-black/70 p-3 sm:p-3.5 text-right text-white shadow-[0_16px_36px_rgba(0,0,0,0.45)] backdrop-blur-xl relative overflow-hidden transition-colors duration-200"
              >
                <StoryCardBody
                  stop={displayedStop}
                  shouldReduceMotion={shouldReduceMotion}
                  openInquiry={openInquiry}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop Right Side Slot */}
        <div className="hidden md:flex pointer-events-none absolute inset-y-0 right-10 lg:right-16 xl:right-24 z-20 items-center">
          <AnimatePresence mode="wait" initial={false}>
            {displayedStop && displayedStop.desktopSide === 'right' && (
              <motion.article
                key={displayedStop.id}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="pointer-events-auto w-full max-w-[21.5rem] rounded-2xl border border-white/15 hover:border-[#E6A821]/40 bg-black/65 p-4 text-right text-white shadow-[0_16px_36px_rgba(0,0,0,0.45)] backdrop-blur-xl relative overflow-hidden transition-colors duration-200"
              >
                <StoryCardBody
                  stop={displayedStop}
                  shouldReduceMotion={shouldReduceMotion}
                  openInquiry={openInquiry}
                />
              </motion.article>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop Left Side Slot */}
        <div className="hidden md:flex pointer-events-none absolute inset-y-0 left-10 lg:left-16 xl:left-24 z-20 items-center">
          <AnimatePresence mode="wait" initial={false}>
            {displayedStop && displayedStop.desktopSide === 'left' && (
              <motion.article
                key={displayedStop.id}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="pointer-events-auto w-full max-w-[21.5rem] rounded-2xl border border-white/15 hover:border-[#E6A821]/40 bg-black/65 p-4 text-right text-white shadow-[0_16px_36px_rgba(0,0,0,0.45)] backdrop-blur-xl relative overflow-hidden transition-colors duration-200"
              >
                <StoryCardBody
                  stop={displayedStop}
                  shouldReduceMotion={shouldReduceMotion}
                  openInquiry={openInquiry}
                />
              </motion.article>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Tour Progress Indicator */}
        {!shouldReduceMotion && (
          <div
            ref={progressTrackRef}
            className="absolute inset-x-0 bottom-0 z-30 h-1 bg-white/15"
            role="progressbar"
            aria-label="تقدم الجولة"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={0}
          >
            <div
              ref={progressBarRef}
              className="h-full origin-right scale-x-0 bg-gradient-to-l from-[#CB841B] via-[#E6A821] to-[#FDE36E] shadow-[0_0_12px_rgba(230,168,33,0.5)] will-change-transform"
            />
          </div>
        )}
      </div>
    </section>
  );
}
