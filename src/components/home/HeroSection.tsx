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
  getActiveHeroStop,
  getHeroVideoProgress,
  HERO_MEDIA,
  HERO_STORY_STOPS,
  HeroMediaVariant,
  HeroStoryAction,
} from './heroStory';

const DESKTOP_MEDIA_QUERY = '(min-width: 768px) and (orientation: landscape)';

function StoryAction({
  action,
  onOpenInquiry,
}: {
  action: HeroStoryAction;
  onOpenInquiry: () => void;
}) {
  const className =
    action.emphasis === 'primary'
      ? 'inline-flex min-h-8 flex-1 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#CB841B] via-[#E6A821] to-[#FDE36E] px-3.5 py-1.5 text-xs font-bold text-[#111315] shadow-md shadow-[#E6A821]/15 hover:brightness-105 active:scale-[0.98] transition-all duration-300 font-cairo sm:flex-none cursor-pointer'
      : 'inline-flex min-h-8 flex-1 items-center justify-center gap-1.5 rounded-full border border-white/20 bg-black/40 hover:bg-white/15 px-3.5 py-1.5 text-xs font-bold text-white backdrop-blur-md transition-all duration-300 hover:border-white/40 font-cairo sm:flex-none cursor-pointer';

  const content = (
    <>
      {action.kind === 'inquiry' ? (
        <MessageCircle className="size-3.5 text-[#E6A821]" aria-hidden="true" />
      ) : (
        <Building2 className="size-3.5" aria-hidden="true" />
      )}
      <span>{action.label}</span>
      {action.kind === 'link' && (
        <ArrowLeft className="size-3.5" aria-hidden="true" />
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

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressTrackRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mediaVariantRef = useRef<HeroMediaVariant | null>(null);
  const activeStopIndexRef = useRef(0);
  const lastTargetTimeRef = useRef(-1);
  const [mediaVariant, setMediaVariant] = useState<HeroMediaVariant | null>(null);
  const [activeStopIndex, setActiveStopIndex] = useState(0);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const openInquiry = useInquiryStore((state) => state.open);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);

    const updateMediaVariant = () => {
      const nextVariant: HeroMediaVariant = mediaQuery.matches ? 'desktop' : 'mobile';
      if (mediaVariantRef.current === nextVariant) return;

      mediaVariantRef.current = nextVariant;
      lastTargetTimeRef.current = -1;
      setIsVideoReady(false);
      setHasVideoError(false);
      setMediaVariant(nextVariant);
    };

    updateMediaVariant();
    mediaQuery.addEventListener('change', updateMediaVariant);

    return () => mediaQuery.removeEventListener('change', updateMediaVariant);
  }, []);

  const targetTimeRef = useRef(0);
  const smoothTimeRef = useRef(0);
  const scrubRafRef = useRef<number | null>(null);

  const stepSmoothScrub = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.duration) {
      scrubRafRef.current = null;
      return;
    }

    const target = targetTimeRef.current;
    const current = smoothTimeRef.current;
    const delta = target - current;

    // LERP dampening: responsive 60fps interpolation for an instantaneous luxury glide
    if (Math.abs(delta) > 0.005) {
      smoothTimeRef.current += delta * 0.10;

      if (!video.seeking) {
        video.currentTime = smoothTimeRef.current;
      }
      scrubRafRef.current = window.requestAnimationFrame(stepSmoothScrub);
    } else {
      smoothTimeRef.current = target;
      if (!video.seeking && Math.abs(video.currentTime - target) > 0.015) {
        video.currentTime = target;
      }
      scrubRafRef.current = null;
    }
  }, []);

  const startSmoothScrub = useCallback(() => {
    if (scrubRafRef.current === null) {
      scrubRafRef.current = window.requestAnimationFrame(stepSmoothScrub);
    }
  }, [stepSmoothScrub]);

  const handleSeeked = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const target = targetTimeRef.current;
    const delta = target - video.currentTime;
    if (Math.abs(delta) > 0.03) {
      startSmoothScrub();
    }
  }, [startSmoothScrub]);

  const syncStoryToScroll = useCallback(() => {
    animationFrameRef.current = null;

    const section = sectionRef.current;
    if (!section || shouldReduceMotion) return;

    const rect = section.getBoundingClientRect();
    const scrollableDistance = Math.max(section.offsetHeight - window.innerHeight, 1);
    const scrollProgress = Math.min(Math.max(-rect.top / scrollableDistance, 0), 1);
    const nextStopIndex = getActiveHeroStop(scrollProgress);

    if (activeStopIndexRef.current !== nextStopIndex) {
      activeStopIndexRef.current = nextStopIndex;
      setActiveStopIndex(nextStopIndex);
    }

    if (progressBarRef.current) {
      progressBarRef.current.style.transform = `scaleX(${scrollProgress})`;
    }
    progressTrackRef.current?.setAttribute(
      'aria-valuenow',
      String(Math.round(scrollProgress * 100)),
    );

    const video = videoRef.current;
    if (!video || !mediaVariant || video.readyState < HTMLMediaElement.HAVE_METADATA) {
      return;
    }

    const configuredDuration = HERO_MEDIA[mediaVariant].duration;
    const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : configuredDuration;
    const videoProgress = getHeroVideoProgress(scrollProgress);
    const targetTime = Math.min(videoProgress * duration, Math.max(duration - 0.04, 0));

    targetTimeRef.current = targetTime;
    startSmoothScrub();
  }, [mediaVariant, shouldReduceMotion, startSmoothScrub]);

  const requestScrollSync = useCallback(() => {
    if (animationFrameRef.current !== null) return;
    animationFrameRef.current = window.requestAnimationFrame(syncStoryToScroll);
  }, [syncStoryToScroll]);

  useEffect(() => {
    if (shouldReduceMotion) {
      activeStopIndexRef.current = 0;
      setActiveStopIndex(0);
      return;
    }

    requestScrollSync();
    window.addEventListener('scroll', requestScrollSync, { passive: true });
    window.addEventListener('resize', requestScrollSync);

    return () => {
      window.removeEventListener('scroll', requestScrollSync);
      window.removeEventListener('resize', requestScrollSync);
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (scrubRafRef.current !== null) {
        window.cancelAnimationFrame(scrubRafRef.current);
        scrubRafRef.current = null;
      }
    };
  }, [requestScrollSync, shouldReduceMotion]);

  const handleVideoReady = () => {
    const video = videoRef.current;
    if (video) video.pause();
    setIsVideoReady(true);
    setHasVideoError(false);
    requestScrollSync();
  };


  const activeStop =
    activeStopIndex >= 0 ? HERO_STORY_STOPS[activeStopIndex] : null;
  const displayedStop = shouldReduceMotion ? HERO_STORY_STOPS[0] : activeStop;

  return (
    <section
      ref={sectionRef}
      id="mar-story"
      aria-label="جولة مار العقارية"
      className={`relative w-full bg-[#060D1A] ${shouldReduceMotion ? 'h-[100svh]' : 'h-[700svh] md:h-[650vh] lg:h-[600vh]'
        }`}
    >
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden bg-[#060D1A]">
        <div className="absolute inset-0">
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

        {mediaVariant && !shouldReduceMotion && !hasVideoError && (
          <video
            key={mediaVariant}
            ref={videoRef}
            src={HERO_MEDIA[mediaVariant].src}
            className={`absolute inset-0 size-full object-cover transition-opacity duration-500 ${isVideoReady ? 'opacity-100' : 'opacity-0'
              }`}
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
            tabIndex={-1}
            onLoadedMetadata={requestScrollSync}
            onCanPlay={handleVideoReady}
            onSeeked={handleSeeked}
            onError={() => {
              setHasVideoError(true);
              setIsVideoReady(false);
            }}
          />
        )}

        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(6,13,26,0.28)_0%,rgba(6,13,26,0.03)_36%,rgba(6,13,26,0.72)_100%)] md:bg-[linear-gradient(90deg,rgba(6,13,26,0.48)_0%,rgba(6,13,26,0.06)_45%,rgba(6,13,26,0.46)_100%)]"
          aria-hidden="true"
        />


        {!isVideoReady && !hasVideoError && !shouldReduceMotion && (
          <div className="absolute right-4 top-20 z-20 flex items-center gap-2 rounded-full border border-[#E6A821]/30 bg-black/60 px-4 py-2 text-xs text-white backdrop-blur-md sm:right-8 sm:top-24 font-cairo shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[#E6A821] animate-pulse" />
            <span>جارٍ تجهيز الجولة السينمائية…</span>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 z-20 flex items-end px-4 pb-[calc(5.75rem+env(safe-area-inset-bottom))] pt-24 sm:px-8 md:items-center md:px-10 md:pb-0 md:pt-20 lg:px-16 xl:px-24">
          <AnimatePresence mode="wait" initial={false}>
            {displayedStop && (
              <motion.article
                key={displayedStop.id}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
                className={`pointer-events-auto w-full max-w-[18.5rem] sm:max-w-[20.5rem] md:max-w-[22.5rem] rounded-2xl border border-white/15 hover:border-[#E6A821]/40 bg-black/60 p-3.5 sm:p-4 text-right text-white shadow-[0_16px_36px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all duration-300 relative overflow-hidden ${displayedStop.desktopSide === 'left' ? 'md:mr-auto' : 'md:ml-auto'
                  }`}
              >
                {/* Subtle Luxury Top Gold Accent Line */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#E6A821] to-transparent opacity-85" />

                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6A821]/15 px-2.5 py-0.5 text-[0.68rem] font-bold text-[#FDE36E] border border-[#E6A821]/30 font-cairo shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E6A821] animate-pulse" />
                    <span>{displayedStop.eyebrow}</span>
                  </span>
                  <span className="font-mono text-[0.68rem] font-bold text-white/50 tracking-wider" dir="ltr">
                    {displayedStop.sceneNumber} / 05
                  </span>
                </div>

                <h2 className="text-balance text-sm sm:text-base md:text-lg font-black leading-snug text-white font-heading drop-shadow-md">
                  {displayedStop.title}
                </h2>
                <p className="mt-1 text-[0.72rem] sm:text-xs leading-relaxed text-white/85 max-w-xs font-cairo drop-shadow-xs">
                  {displayedStop.description}
                </p>

                {displayedStop.actions && (
                  <div className="mt-3 flex flex-row gap-2">
                    {displayedStop.actions.map((action) => (
                      <StoryAction
                        key={`${action.kind}-${action.label}`}
                        action={action}
                        onOpenInquiry={openInquiry}
                      />
                    ))}
                  </div>
                )}

                {displayedStop.sceneNumber === '01' && !shouldReduceMotion && (
                  <div className="mt-2 flex items-center gap-1.5 border-t border-white/10 pt-1.5 text-[0.68rem] text-white/65 font-cairo">
                    <span className="w-4 h-4 rounded-full bg-[#E6A821]/20 border border-[#E6A821]/35 flex items-center justify-center text-[#E6A821] shrink-0">
                      <ArrowDown className="size-2.5 animate-bounce" aria-hidden="true" />
                    </span>
                    <span>مرّر للأسفل للتجوّل داخل المشروع</span>
                  </div>
                )}
              </motion.article>
            )}
          </AnimatePresence>
        </div>

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
