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

interface HeroSectionProps {
  searchBar?: React.ReactNode;
}

export default function HeroSection({ searchBar }: HeroSectionProps = {}) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressTrackRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mediaVariantRef = useRef<HeroMediaVariant | null>(null);
  const activeStopIndexRef = useRef(0);
  const isStoryCompletedRef = useRef(false);
  const isTourLockedRef = useRef(false);

  const [mediaVariant, setMediaVariant] = useState<HeroMediaVariant | null>(null);
  const [activeStopIndex, setActiveStopIndex] = useState(0);
  const [isStoryCompleted, setIsStoryCompleted] = useState(false);
  const [isMobileTourSettled, setIsMobileTourSettled] = useState(false);
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const openInquiry = useInquiryStore((state) => state.open);

  // Decoded frame cache; the loader bounds retained image memory.
  const imageCacheRef = useRef<Map<number, HTMLImageElement>>(new Map());

  // Canvas animation & smoothing refs
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const targetFrameRef = useRef(1);
  const filteredVideoProgressRef = useRef(0);
  const lastScrollSyncTimestampRef = useRef(0);
  const smoothFrameRef = useRef(1);
  const lastDrawnFrameRef = useRef(-1);
  const lastRequestedFrameRef = useRef(1);
  const heroDiagRef = useRef({
    samples: 0, longFrames: 0, missingFrames: 0, fallbackFrames: 0,
    maxTargetJump: 0, maxPaintGap: 0, lastTarget: 1, lastPainted: 1,
    maxRafMs: 0, startedAt: 0,
  });
  const lastRafTimestampRef = useRef(0);
  const scrubRafRef = useRef<number | null>(null);
  const prioritizeFramesRef = useRef<((target: number, current: number, direction: number) => void) | null>(null);
  const scrollDirectionRef = useRef(1);

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

  // Never substitute a future frame or move backwards while moving forwards.
  // Keep the last painted image until a decoded frame exists along the path.
  const getBestAvailableImage = useCallback((targetIndex: number) => {
    const cache = imageCacheRef.current;
    const previous = lastDrawnFrameRef.current;
    if (cache.has(targetIndex)) return { index: targetIndex, img: cache.get(targetIndex)! };
    if (previous < 1) return null;
    const direction = targetIndex >= previous ? 1 : -1;
    for (let index = targetIndex; index !== previous; index -= direction) {
      const img = cache.get(index);
      if (img) return { index, img };
    }
    // If the exact path frame is not decoded yet, use the nearest decoded
    // neighbour around the target rather than freezing on a distant old frame.
    // Never look far enough to create a visible scene jump.
    for (let radius = 1; radius <= 4; radius++) {
      const backward = targetIndex - radius;
      const forward = targetIndex + radius;
      const preferred = direction > 0 ? backward : forward;
      const alternate = direction > 0 ? forward : backward;
      const preferredImg = cache.get(preferred);
      if (preferredImg) return { index: preferred, img: preferredImg };
      const alternateImg = cache.get(alternate);
      if (alternateImg) return { index: alternate, img: alternateImg };
    }
    const img = cache.get(previous);
    return img ? { index: previous, img } : null;
  }, []);

  // Paint one decoded frame without blending across scene cuts.
  const drawFrame = useCallback(
    (floatFrame: number, forceRedraw = false) => {
      const canvas = canvasRef.current;
      const variant = mediaVariantRef.current;
      if (!canvas || !variant) return;

      const total = HERO_MEDIA[variant].totalFrames;
      const rawFrameIndex = Math.min(Math.max(Math.round(floatFrame), 1), total);
      // Keep visual pacing responsive: the time-based scrub loop already filters
      // bursty scroll input. Rendering should follow that smoothed target directly.
      const frameIndex = rawFrameIndex;
      lastRequestedFrameRef.current = frameIndex;

      // Skip painting if this exact integer frame is already painted on screen
      if (!forceRedraw && lastDrawnFrameRef.current === frameIndex) return;

      const available = getBestAvailableImage(frameIndex);
      if (!available) {
        heroDiagRef.current.missingFrames++;
        return;
      }
      const { img, index: paintedIndex } = available;
      const diag = heroDiagRef.current;
      if (paintedIndex !== frameIndex) diag.fallbackFrames++;
      diag.maxPaintGap = Math.max(diag.maxPaintGap, Math.abs(paintedIndex - diag.lastPainted));
      diag.lastPainted = paintedIndex;
      if (!forceRedraw && lastDrawnFrameRef.current === paintedIndex) return;
      if (!img.complete || img.naturalWidth === 0) return;

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
      lastDrawnFrameRef.current = paintedIndex;
      const progress = (paintedIndex - 1) / (total - 1);
      const nextStopIndex = getActiveHeroStopByVideoProgress(progress, activeStopIndexRef.current);
      if (nextStopIndex !== activeStopIndexRef.current) {
        activeStopIndexRef.current = nextStopIndex;
        setActiveStopIndex(nextStopIndex);
      }
    },
    [getBestAvailableImage],
  );

  // Update canvas resolution with devicePixelRatio (capped at 1.5 for ultra-fast GPU throughput)
  const updateCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = window.innerWidth;
    // Match the stable CSS canvas height, including mobile browser chrome.
    const height = canvas.clientHeight || getStableViewportHeight();

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
      if (!variant || document.hidden) {
        scrubRafRef.current = null;
        lastRafTimestampRef.current = 0;
        return;
      }

      const totalFrames = HERO_MEDIA[variant].totalFrames;
      const lastTime = lastRafTimestampRef.current;
      lastRafTimestampRef.current = timestamp;
      const rawRafMs = lastTime === 0 ? 16 : timestamp - lastTime;
      const dt = Math.min(rawRafMs / 1000, 0.05);
      const diag = heroDiagRef.current;
      diag.samples++;
      diag.maxRafMs = Math.max(diag.maxRafMs, rawRafMs);
      if (rawRafMs > 24) diag.longFrames++;

      const isMobile = variant === 'mobile';
      const target = targetFrameRef.current;
      const current = smoothFrameRef.current;
      const delta = target - current;

      // Time-based easing behaves consistently on 60/90/120Hz screens.
      // A short touch filter absorbs event bursts without replacing native scrolling.
      const factor = 1 - Math.exp(-(isMobile ? 20 : 26) * dt);
      smoothFrameRef.current = Math.abs(delta) > 0.01
        ? current + delta * factor
        : target;
      if (Math.abs(target - smoothFrameRef.current) <= 0.01) smoothFrameRef.current = target;

      prioritizeFramesRef.current?.(target, smoothFrameRef.current, scrollDirectionRef.current);
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
      const completed = progress >= 0.85;
      if (isStoryCompletedRef.current !== completed) {
        isStoryCompletedRef.current = completed;
        setIsStoryCompleted(completed);
      }

      if (Math.abs(targetFrameRef.current - smoothFrameRef.current) > 0.01) {
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

  // One bounded queue for both near-camera requests and background warming.
  // Decoding completes before a frame enters the render cache.
  useEffect(() => {
    if (!mediaVariant || shouldReduceMotion) return;

    const variant = mediaVariant;
    const total = HERO_MEDIA[variant].totalFrames;
    const cache = imageCacheRef.current;
    cache.clear();
    lastDrawnFrameRef.current = -1;
    setIsCanvasReady(false);
    updateCanvasSize();

    let disposed = false;
    let active = 0;
    let backgroundIndex = 1;
    let lastPriorityPumpAt = 0;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let decodedBytes = 0;
    let priorityLimit = 8;
    let largestFrameBytes = 0;
    let ready = false;
    const concurrency = variant === 'mobile' ? 4 : 6;
    const byteBudget = (variant === 'mobile' ? 112 : 176) * 1024 * 1024;
    const pending = new Map<number, () => void>();
    const attempts = new Map<number, number>();
    const retryAfter = new Map<number, number>();
    let priority: number[] = [];
    let priorityKey = '';

    const evictDistantFrames = () => {
      while (decodedBytes > byteBudget && cache.size > 2) {
        let victim = -1;
        let distance = -1;
        for (const index of cache.keys()) {
          if (
            index === lastDrawnFrameRef.current ||
            Math.abs(index - Math.round(smoothFrameRef.current)) <= 12 ||
            Math.abs(index - Math.round(targetFrameRef.current)) <= 12
          ) continue;
          const rank = priority.indexOf(index);
          const nextDistance = rank >= 0 ? rank : total + Math.abs(index - smoothFrameRef.current);
          if (nextDistance > distance) { victim = index; distance = nextDistance; }
        }
        if (victim < 0) break;
        const img = cache.get(victim)!;
        decodedBytes -= img.naturalWidth * img.naturalHeight * 4;
        cache.delete(victim);
      }
    };

    const canLoad = (index: number) => !cache.has(index) && !pending.has(index)
      && (attempts.get(index) || 0) < 3
      && (retryAfter.get(index) || 0) <= Date.now();

    const pump = () => {
      if (disposed || document.hidden) return;
      while (active < concurrency) {
        let index = priority.find(canLoad);
        if (index === undefined) {
          while (backgroundIndex <= total && !canLoad(backgroundIndex)) backgroundIndex++;
          if (backgroundIndex > total) break;
          index = backgroundIndex++;
        }
        load(index);
      }
    };

    const load = (index: number) => {
      active++;
      attempts.set(index, (attempts.get(index) || 0) + 1);
      const img = new window.Image();
      let finished = false;
      const timeout = setTimeout(() => finish(false), 12000);
      const finish = (success: boolean) => {
        if (finished) return;
        finished = true;
        clearTimeout(timeout);
        img.onload = null;
        img.onerror = null;
        pending.delete(index);
        active--;
        if (disposed) { img.removeAttribute('src'); return; }
        if (success) {
          attempts.delete(index);
          retryAfter.delete(index);
          cache.set(index, img);
          const frameBytes = img.naturalWidth * img.naturalHeight * 4;
          decodedBytes += frameBytes;
          largestFrameBytes = Math.max(largestFrameBytes, frameBytes);
          priorityLimit = Math.max(2, Math.min(48, Math.floor(byteBudget / largestFrameBytes) - 2));
          priority = priority.slice(0, priorityLimit);
          // A newly decoded target must repaint even if scrolling has stopped.
          drawFrame(smoothFrameRef.current);
          if (!ready && lastDrawnFrameRef.current >= 1) {
            ready = true;
            setIsCanvasReady(true);
          }
          evictDistantFrames();
        } else {
          img.removeAttribute('src');
          retryAfter.set(index, Date.now() + 800);
          clearTimeout(retryTimer);
          retryTimer = setTimeout(pump, 850);
        }
        pump();
      };
      pending.set(index, () => finish(false));
      img.decoding = 'async';
      img.fetchPriority = priority.includes(index) ? 'high' : 'low';
      img.onload = () => {
        img.decode().then(() => finish(img.naturalWidth > 0), () => finish(false));
      };
      img.onerror = () => finish(false);
      img.src = getFrameUrl(variant, index);
    };

    const prioritize = (target: number, current: number, direction: number) => {
      const key = `${Math.round(target)}:${Math.round(current)}:${direction}:${priorityLimit}`;
      if (key === priorityKey) return;
      priorityKey = key;
      const order = new Set<number>();
      const add = (index: number) => {
        const rounded = Math.round(index);
        if (rounded >= 1 && rounded <= total) order.add(rounded);
      };
      add(current);
      add(target);
      // Bias decoding toward the direction of travel. Frames immediately in front
      // of the painted camera are more valuable than a distant target frame.
      for (let offset = 1; offset <= 28; offset++) {
        add(current + offset * direction);
        if (offset <= 10) add(current - offset * direction);
        if (offset <= 14) add(target - offset * direction);
        if (offset <= 8) add(target + offset * direction);
      }
      priority = [...order].slice(0, priorityLimit);
      // Avoid repeatedly refilling the decode queue on every high-refresh scroll tick.
      const now = performance.now();
      if (now - lastPriorityPumpAt >= 32 || active === 0) {
        lastPriorityPumpAt = now;
        pump();
      }
    };
    prioritizeFramesRef.current = prioritize;
    prioritize(targetFrameRef.current, smoothFrameRef.current, scrollDirectionRef.current);
    const resume = () => {
      if (!document.hidden) { pump(); startSmoothAnimation(); }
    };
    document.addEventListener('visibilitychange', resume);
    return () => {
      disposed = true;
      clearTimeout(retryTimer);
      document.removeEventListener('visibilitychange', resume);
      prioritizeFramesRef.current = null;
      for (const cancel of [...pending.values()]) cancel();
      cache.clear();
    };
  }, [drawFrame, mediaVariant, shouldReduceMotion, startSmoothAnimation, updateCanvasSize]);

  // Variant change detection
  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);

    const updateMediaVariant = () => {
      const nextVariant: HeroMediaVariant = mediaQuery.matches ? 'desktop' : 'mobile';
      if (mediaVariantRef.current === nextVariant) return;

      mediaVariantRef.current = nextVariant;
      targetFrameRef.current = 1;
      smoothFrameRef.current = 1;
      filteredVideoProgressRef.current = 0;
      lastScrollSyncTimestampRef.current = 0;
      lastDrawnFrameRef.current = -1;
      lastRequestedFrameRef.current = 1;
      activeStopIndexRef.current = 0;
      setActiveStopIndex(0);
      isStoryCompletedRef.current = false;
      setIsStoryCompleted(false);
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

    const viewportHeight = canvasRef.current?.clientHeight || getStableViewportHeight();
    const sectionHeight = sectionHeightRef.current || section.offsetHeight;
    const scrollableDistance = Math.max(sectionHeight - viewportHeight, 1);
    
    // Cached section geometry keeps layout reads out of the scroll path.
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

    // Once the cinematic tour reaches its completion zone, keep the final villa
    // frame locked for the rest of this page visit. Returning upward no longer
    // restarts reverse scrubbing or competes with the content below.
    if (variant === 'mobile' && isTourLockedRef.current) {
      const totalFrames = HERO_MEDIA[variant].totalFrames;
      targetFrameRef.current = totalFrames;
      smoothFrameRef.current = totalFrames;
      drawFrame(totalFrames);
      return;
    }

    const totalFrames = HERO_MEDIA[variant].totalFrames;
    const rawVideoProgress = getHeroVideoProgress(scrollProgress);

    // Filter the scroll signal BEFORE it becomes a frame target. Mouse-wheel events
    // can move the page by a large amount between two RAF callbacks; mapping that
    // raw jump directly to frames was producing ~50-frame target jumps in diagnostics.
    // Keep the existing frame smoothing/render loop untouched.
    const now = performance.now();
    const lastSync = lastScrollSyncTimestampRef.current;
    const syncDt = lastSync > 0 ? Math.min((now - lastSync) / 1000, 0.05) : 0.016;
    lastScrollSyncTimestampRef.current = now;

    const previousProgress = filteredVideoProgressRef.current;
    const progressDelta = rawVideoProgress - previousProgress;
    // Mobile needs a more responsive scrub because touch scrolling produces fewer
    // scroll-sync samples than desktop. Keep desktop tuning unchanged.
    const progressFactor = 1 - Math.exp(-(variant === 'mobile' ? 34 : 18) * syncDt);
    const maxProgressStep = (variant === 'mobile' ? 14 : 7) / Math.max(totalFrames - 1, 1);
    const easedProgressStep = progressDelta * progressFactor;
    const boundedProgressStep = Math.max(
      -maxProgressStep,
      Math.min(maxProgressStep, easedProgressStep),
    );
    let videoProgress = Math.abs(progressDelta) > 0.00005
      ? previousProgress + boundedProgressStep
      : rawVideoProgress;

    // Snap only when already very close; this prevents a long tail without
    // reintroducing a visible jump.
    if (Math.abs(rawVideoProgress - videoProgress) < 0.0008) {
      videoProgress = rawVideoProgress;
    }
    filteredVideoProgressRef.current = Math.min(Math.max(videoProgress, 0), 1);
    videoProgress = filteredVideoProgressRef.current;

    // Continuous floating-point target (NO integer rounding here!)
    const targetFrame = Math.min(
      Math.max(videoProgress * (totalFrames - 1) + 1, 1),
      totalFrames,
    );

    if (targetFrame !== targetFrameRef.current) {
      scrollDirectionRef.current = targetFrame > targetFrameRef.current ? 1 : -1;
    }
    const diag = heroDiagRef.current;
    diag.maxTargetJump = Math.max(diag.maxTargetJump, Math.abs(targetFrame - diag.lastTarget));
    diag.lastTarget = targetFrame;
    targetFrameRef.current = targetFrame;
    prioritizeFramesRef.current?.(targetFrame, smoothFrameRef.current, scrollDirectionRef.current);

    if (variant === 'mobile' && rawVideoProgress >= 0.85) {
      isTourLockedRef.current = true;
      isStoryCompletedRef.current = true;
      setIsStoryCompleted(true);
      window.dispatchEvent(new CustomEvent('mar:tour-complete'));
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: sectionTopRef.current || 0, behavior: 'auto' });
        setIsMobileTourSettled(true);
      });
      targetFrameRef.current = totalFrames;
      smoothFrameRef.current = totalFrames;
      prioritizeFramesRef.current?.(totalFrames, totalFrames, 1);
      drawFrame(totalFrames, true);
      if (scrubRafRef.current !== null) {
        window.cancelAnimationFrame(scrubRafRef.current);
        scrubRafRef.current = null;
      }
      lastRafTimestampRef.current = 0;
      return;
    }

    // Desktop keeps reversible scrubbing, but exposes the final search composition
    // only in the settle zone near the end of the tour.
    if (variant === 'desktop') {
      const completed = rawVideoProgress >= 0.965;
      if (completed !== isStoryCompletedRef.current) {
        isStoryCompletedRef.current = completed;
        setIsStoryCompleted(completed);
        if (completed) window.dispatchEvent(new CustomEvent('mar:tour-complete'));
      }
    }

    startSmoothAnimation();
  }, [drawFrame, getStableViewportHeight, shouldReduceMotion, startSmoothAnimation]);

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
      // Desktop height changes affect the vh scroll distance. Mobile chrome
      // changes are handled by the stable canvas and section ResizeObserver.
      if (mediaVariantRef.current === 'desktop' || Math.abs(currentWidth - lastViewportWidthRef.current) > 2) {
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
    const resizeObserver = new ResizeObserver(() => {
      updateSectionMetrics();
      updateCanvasSize();
      requestScrollSync();
    });
    if (sectionRef.current) resizeObserver.observe(sectionRef.current);
    if (canvasRef.current) resizeObserver.observe(canvasRef.current);

    heroDiagRef.current = {
      samples: 0, longFrames: 0, missingFrames: 0, fallbackFrames: 0,
      maxTargetJump: 0, maxPaintGap: 0, lastTarget: targetFrameRef.current,
      lastPainted: lastDrawnFrameRef.current || 1, maxRafMs: 0, startedAt: performance.now(),
    };
    (window as typeof window & { __MAR_HERO_DIAG__?: () => unknown }).__MAR_HERO_DIAG__ = () => ({
      ...heroDiagRef.current,
      longFrameRate: heroDiagRef.current.samples ? heroDiagRef.current.longFrames / heroDiagRef.current.samples : 0,
      elapsedMs: performance.now() - heroDiagRef.current.startedAt,
    });

    window.addEventListener('scroll', requestScrollSync, { passive: true });
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('scroll', requestScrollSync);
      delete (window as typeof window & { __MAR_HERO_DIAG__?: () => unknown }).__MAR_HERO_DIAG__;
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
  }, [mediaVariant, requestScrollSync, shouldReduceMotion, updateCanvasSize, updateSectionMetrics]);

  const activeStop =
    activeStopIndex >= 0 ? HERO_STORY_STOPS[activeStopIndex] : null;
  const displayedStop = shouldReduceMotion ? HERO_STORY_STOPS[0] : activeStop;

  return (
    <section
      ref={sectionRef}
      id="mar-story"
      aria-label="جولة مار العقارية"
      className={`relative w-full bg-[#060D1A] ${
        shouldReduceMotion
          ? 'h-[100svh]'
          : mediaVariant === 'mobile' && isMobileTourSettled
            ? 'h-[100svh]'
            : 'h-[420svh] md:h-[750vh] lg:h-[850vh]'
      }`}
    >
      <div className="sticky top-0 h-screen h-[100svh] w-full overflow-hidden bg-[#060D1A]">
        {/* Instant Poster Background while frame 1 initializes */}
        <div
          className={`absolute inset-0 transition-opacity duration-700 ${
            isCanvasReady && !shouldReduceMotion ? 'opacity-0 pointer-events-none' : 'opacity-100'
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

        {/* Canvas frame sequence, repainted only when a decoded frame changes */}
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

        {/* Mobile Card: Centered Horizontally Raised ~20vh to avoid colliding with floating buttons */}
        <div className="md:hidden pointer-events-none absolute inset-x-0 bottom-[20vh] z-20 flex justify-center pb-[env(safe-area-inset-bottom)] px-4">
          <AnimatePresence mode="wait" initial={false}>
            {!isStoryCompleted && displayedStop && (
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

        {/* Search Bar: final hero composition. It stays inside the sticky hero with
            a safe bottom inset so it never visually sticks to the following section. */}
        {searchBar && (
          <div
            className={`absolute inset-x-0 z-[60] flex justify-center px-3 transition-[opacity,transform] duration-500
              bottom-[10vh] md:bottom-10 lg:bottom-12 ${
              shouldReduceMotion || isStoryCompleted
                ? 'opacity-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 translate-y-5 pointer-events-none'
            }`}
          >
            <div className="w-full max-w-5xl">
              {searchBar}
            </div>
          </div>
        )}

        {/* Bottom Tour Progress Indicator */}
        {!shouldReduceMotion && !(mediaVariant === 'mobile' && isStoryCompleted) && (
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
