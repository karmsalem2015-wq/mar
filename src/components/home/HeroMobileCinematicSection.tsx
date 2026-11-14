'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowLeft, Building2, MessageCircle } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useInquiryStore } from '@/store/useInquiryStore';
import {
  getActiveHeroStopByVideoProgress,
  HERO_MEDIA,
  HERO_STORY_STOPS,
  type HeroStoryAction,
  type HeroStoryStop,
} from './heroStory';

const SWIPE_THRESHOLD_PX = 28;
const MOBILE_PLAYBACK_RATE = 1.65;

type HintMode = 'start' | 'resume' | null;

type HeroRuntimeWindow = Window & {
  __MAR_HERO_DIAG__?: () => unknown;
  __MAR_HERO_PRELOAD__?: {
    status: 'loading' | 'ready' | 'direct-fallback' | 'error';
    variant?: 'mobile';
    bytes?: number;
    totalBytes?: number;
    progress?: number;
    ms?: number;
    source?: string;
    error?: string;
  };
};

function StoryAction({
  action,
  onOpenInquiry,
}: {
  action: HeroStoryAction;
  onOpenInquiry: () => void;
}) {
  const className =
    action.emphasis === 'primary'
      ? 'inline-flex min-h-6 flex-[1.08] items-center justify-center gap-1 rounded-full bg-gradient-to-r from-[#CB841B] via-[#E6A821] to-[#FDE36E] px-1.5 py-0.5 text-[0.56rem] font-bold leading-none whitespace-nowrap text-[#111315] shadow-md shadow-[#E6A821]/15 active:scale-[0.98] transition-transform duration-150 font-cairo cursor-pointer'
      : 'inline-flex min-h-6 flex-[0.92] items-center justify-center gap-1 rounded-full border border-white/20 bg-black/40 px-1.5 py-0.5 text-[0.56rem] font-bold leading-none whitespace-nowrap text-white backdrop-blur-md transition-colors duration-200 font-cairo cursor-pointer';

  const content = (
    <>
      {action.kind === 'inquiry' ? (
        <MessageCircle className="size-2.5 shrink-0 text-[#E6A821]" aria-hidden="true" />
      ) : (
        <Building2 className="size-2.5 shrink-0" aria-hidden="true" />
      )}
      <span className="whitespace-nowrap">{action.label}</span>
      {action.kind === 'link' && <ArrowLeft className="size-2.5 shrink-0" aria-hidden="true" />}
    </>
  );

  if (action.kind === 'link') {
    return (
      <Link href={action.href} className={className} data-hero-interactive="true">
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={onOpenInquiry}
      data-hero-interactive="true"
    >
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
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[#E6A821] to-transparent opacity-85" />

      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 rounded-full border border-[#E6A821]/30 bg-[#E6A821]/15 px-1.5 py-0.5 text-[0.56rem] font-bold text-[#FDE36E] font-cairo">
          <span className="size-1 rounded-full bg-[#E6A821] animate-pulse" />
          <span>{stop.eyebrow}</span>
        </span>
        <span className="font-mono text-[0.56rem] font-bold tracking-wider text-white/50" dir="ltr">
          {stop.sceneNumber} / 05
        </span>
      </div>

      <h2 className="text-balance text-[0.72rem] font-black leading-snug text-white font-heading drop-shadow-md">
        {stop.title}
      </h2>
      <p className="mt-0.5 line-clamp-2 max-w-xs text-[0.63rem] leading-[1.55] text-white/82 font-cairo drop-shadow-xs">
        {stop.description}
      </p>

      {stop.actions && (
        <div className="mt-2 flex flex-row gap-1.5">
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
        <div className="mt-1.5 flex items-center gap-1 border-t border-white/10 pt-1 text-[0.56rem] text-white/60 font-cairo">
          <span className="flex size-3 shrink-0 items-center justify-center rounded-full border border-[#E6A821]/35 bg-[#E6A821]/20 text-[#E6A821]">
            <ArrowDown className="size-1.5 animate-bounce" aria-hidden="true" />
          </span>
          <span>اسحب لأعلى مرة واحدة لبدء الجولة</span>
        </div>
      )}
    </>
  );
}

interface HeroMobileCinematicSectionProps {
  searchBar?: ReactNode;
}

export default function HeroMobileCinematicSection({
  searchBar,
}: HeroMobileCinematicSectionProps = {}) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressTrackRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const uiRafRef = useRef<number | null>(null);
  const videoFrameRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const activeStopIndexRef = useRef(0);
  const tourCompletedRef = useRef(false);
  const playPendingRef = useRef(false);
  const hasStartedRef = useRef(false);
  const waitingEventsRef = useRef(0);
  const stalledEventsRef = useRef(0);
  const playStartsRef = useRef(0);
  const playPausesRef = useRef(0);

  const [activeStopIndex, setActiveStopIndex] = useState(0);
  const [isStoryCompleted, setIsStoryCompleted] = useState(false);
  const [wasSkipped, setWasSkipped] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [hintMode, setHintMode] = useState<HintMode>(null);
  const shouldReduceMotion = useReducedMotion();
  const openInquiry = useInquiryStore((state) => state.open);

  const syncPresentation = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const duration = Number.isFinite(video.duration) && video.duration > 0
      ? video.duration
      : HERO_MEDIA.mobile.duration;
    const safeDuration = Math.max(duration - 0.04, 0.01);
    const progress = Math.min(Math.max(video.currentTime / safeDuration, 0), 1);

    if (progressBarRef.current) {
      progressBarRef.current.style.transform = `scaleX(${progress})`;
    }
    progressTrackRef.current?.setAttribute('aria-valuenow', String(Math.round(progress * 100)));

    const nextStopIndex = getActiveHeroStopByVideoProgress(progress, activeStopIndexRef.current);
    if (nextStopIndex !== activeStopIndexRef.current) {
      activeStopIndexRef.current = nextStopIndex;
      setActiveStopIndex(nextStopIndex);
    }
  }, []);

  const stopUiLoop = useCallback(() => {
    if (uiRafRef.current !== null) {
      window.cancelAnimationFrame(uiRafRef.current);
      uiRafRef.current = null;
    }
    const video = videoRef.current;
    if (video && videoFrameRef.current !== null) {
      video.cancelVideoFrameCallback?.(videoFrameRef.current);
    }
    videoFrameRef.current = null;
  }, []);

  const startUiLoop = useCallback(() => {
    const video = videoRef.current;
    if (!video || uiRafRef.current !== null || videoFrameRef.current !== null) return;

    // Sync story cards to decoded video frames instead of repainting at display refresh rate.
    if (typeof video.requestVideoFrameCallback === 'function') {
      const onFrame = () => {
        videoFrameRef.current = null;
        syncPresentation();
        if (!video.paused && !video.ended && !tourCompletedRef.current) {
          videoFrameRef.current = video.requestVideoFrameCallback(onFrame);
        }
      };
      videoFrameRef.current = video.requestVideoFrameCallback(onFrame);
      return;
    }

    // Graceful fallback on older browsers.
    const tick = () => {
      uiRafRef.current = null;
      syncPresentation();
      if (!video.paused && !video.ended && !tourCompletedRef.current) {
        uiRafRef.current = window.requestAnimationFrame(tick);
      }
    };
    uiRafRef.current = window.requestAnimationFrame(tick);
  }, [syncPresentation]);

  const pauseForTouch = useCallback(() => {
    const video = videoRef.current;
    playPendingRef.current = false;
    if (!video || tourCompletedRef.current) return;

    if (!video.paused) {
      video.pause();
      playPausesRef.current += 1;
    }
    video.playbackRate = MOBILE_PLAYBACK_RATE;
    stopUiLoop();
    syncPresentation();

    if (hasStartedRef.current) {
      setHintMode('resume');
    }
  }, [stopUiLoop, syncPresentation]);

  const startPlayback = useCallback(() => {
    const video = videoRef.current;
    if (
      !video ||
      !isVideoReady ||
      videoFailed ||
      tourCompletedRef.current ||
      playPendingRef.current
    ) return;

    hasStartedRef.current = true;
    setHintMode(null);
    video.playbackRate = MOBILE_PLAYBACK_RATE;
    startUiLoop();

    if (!video.paused) return;

    playPendingRef.current = true;
    playStartsRef.current += 1;
    void video.play().then(() => {
      playPendingRef.current = false;
      startUiLoop();
    }).catch(() => {
      playPendingRef.current = false;
      setHintMode('resume');
    });
  }, [isVideoReady, startUiLoop, videoFailed]);

  const completeTour = useCallback(() => {
    if (tourCompletedRef.current) return;
    tourCompletedRef.current = true;
    playPendingRef.current = false;
    setHintMode(null);
    stopUiLoop();

    const video = videoRef.current;
    if (video) {
      video.pause();
      video.playbackRate = MOBILE_PLAYBACK_RATE;
    }

    if (progressBarRef.current) progressBarRef.current.style.transform = 'scaleX(1)';
    progressTrackRef.current?.setAttribute('aria-valuenow', '100');
    activeStopIndexRef.current = HERO_STORY_STOPS.length - 1;
    setActiveStopIndex(HERO_STORY_STOPS.length - 1);
    setIsStoryCompleted(true);
    window.dispatchEvent(new CustomEvent('mar:tour-complete'));
  }, [stopUiLoop]);

  // Native video progressive loading avoids allocating a duplicate full-size MP4 Blob.
  useEffect(() => {
    if (shouldReduceMotion) return;
    (window as HeroRuntimeWindow).__MAR_HERO_PRELOAD__ = {
      status: 'loading',
      variant: 'mobile',
      source: HERO_MEDIA.mobile.src,
    };
  }, [shouldReduceMotion]);

  const markMediaReady = useCallback(() => {
    if (tourCompletedRef.current) return;
    setIsVideoReady(true);
    (window as HeroRuntimeWindow).__MAR_HERO_PRELOAD__ = {
      status: 'ready',
      variant: 'mobile',
      source: HERO_MEDIA.mobile.src,
    };
    window.dispatchEvent(new Event('mar:hero-media-ready'));
  }, []);

  useEffect(() => {
    const skip = () => {
      completeTour();
      setWasSkipped(true);
    };
    window.addEventListener('mar:tour-skip', skip);
    if ((window as Window & { __MAR_HERO_SKIPPED__?: boolean }).__MAR_HERO_SKIPPED__) {
      skip();
    }
    return () => window.removeEventListener('mar:tour-skip', skip);
  }, [completeTour]);

  useEffect(() => {
    if (shouldReduceMotion) completeTour();
  }, [shouldReduceMotion, completeTour]);

  useEffect(() => {
    if (shouldReduceMotion) return;
    const section = sectionRef.current;
    if (!section) return;

    const isInteractiveTarget = (target: EventTarget | null) => {
      return target instanceof Element && Boolean(
        target.closest('a,button,input,textarea,select,[data-hero-interactive="true"]')
      );
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (tourCompletedRef.current || !isVideoReady || videoFailed || isInteractiveTarget(event.target)) return;
      const touch = event.touches[0];
      touchStartYRef.current = touch?.clientY ?? null;

      const video = videoRef.current;
      if (video && !video.paused) {
        pauseForTouch();
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (tourCompletedRef.current || !isVideoReady || videoFailed || isInteractiveTarget(event.target)) return;
      event.preventDefault();
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (tourCompletedRef.current || !isVideoReady || videoFailed || isInteractiveTarget(event.target)) return;

      const startY = touchStartYRef.current;
      touchStartYRef.current = null;
      const endY = event.changedTouches[0]?.clientY;
      if (startY === null || endY === undefined) return;

      const deltaY = startY - endY;
      if (deltaY >= SWIPE_THRESHOLD_PX) {
        event.preventDefault();
        startPlayback();
      } else if (hasStartedRef.current) {
        setHintMode('resume');
      } else {
        setHintMode('start');
      }
    };

    const handleWheel = (event: WheelEvent) => {
      if (tourCompletedRef.current || !isVideoReady || videoFailed || event.ctrlKey || event.deltaY === 0) return;
      event.preventDefault();
      if (event.deltaY > 0) startPlayback();
      else pauseForTouch();
    };

    section.addEventListener('touchstart', handleTouchStart, { passive: true });
    section.addEventListener('touchmove', handleTouchMove, { passive: false });
    section.addEventListener('touchend', handleTouchEnd, { passive: false });
    section.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      section.removeEventListener('touchstart', handleTouchStart);
      section.removeEventListener('touchmove', handleTouchMove);
      section.removeEventListener('touchend', handleTouchEnd);
      section.removeEventListener('wheel', handleWheel);
    };
  }, [pauseForTouch, shouldReduceMotion, startPlayback, isVideoReady, videoFailed]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !tourCompletedRef.current) {
        pauseForTouch();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [pauseForTouch]);

  useEffect(() => {
    const runtimeWindow = window as HeroRuntimeWindow;
    runtimeWindow.__MAR_HERO_DIAG__ = () => {
      const video = videoRef.current;
      return {
        engine: 'mobile-one-swipe-native-playback',
        transportMode: video && !video.paused ? 'playback' : 'idle',
        oneWay: true,
        sourceMode: video?.currentSrc ? 'direct' : 'none',
        currentTime: video?.currentTime ?? 0,
        duration: video?.duration ?? 0,
        playbackRate: video?.playbackRate ?? MOBILE_PLAYBACK_RATE,
        readyState: video?.readyState ?? 0,
        networkState: video?.networkState ?? 0,
        waitingEvents: waitingEventsRef.current,
        stalledEvents: stalledEventsRef.current,
        playStarts: playStartsRef.current,
        playPauses: playPausesRef.current,
        completed: tourCompletedRef.current,
        hintMode,
      };
    };

    return () => {
      delete runtimeWindow.__MAR_HERO_DIAG__;
      delete runtimeWindow.__MAR_HERO_PRELOAD__;
    };
  }, [hintMode]);

  useEffect(() => {
    return () => {
      stopUiLoop();
      const video = videoRef.current;
      if (video && !video.paused) video.pause();
    };
  }, [stopUiLoop]);

  const displayedStop = shouldReduceMotion
    ? HERO_STORY_STOPS[0]
    : HERO_STORY_STOPS[activeStopIndex] ?? HERO_STORY_STOPS[0];

  return (
    <section
      ref={sectionRef}
      id="mar-story"
      aria-label="جولة مار العقارية"
      className="relative h-[100svh] w-full bg-[#060D1A] overscroll-none"
      style={{ touchAction: isStoryCompleted || !isVideoReady || videoFailed || shouldReduceMotion ? 'pan-y' : 'none' }}
    >
      <div className="relative h-[100svh] w-full overflow-hidden bg-[#060D1A]">
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            isVideoReady && !wasSkipped && !videoFailed && !shouldReduceMotion ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`}
        >
          <Image
            src={HERO_MEDIA.mobile.poster}
            alt="واجهة مشروع سكني من مار العقارية"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>

        {!shouldReduceMotion && !wasSkipped && (
          <video
            ref={videoRef}
            src={HERO_MEDIA.mobile.src}
            poster={HERO_MEDIA.mobile.poster}
            preload="auto"
            muted
            playsInline
            disablePictureInPicture
            aria-hidden="true"
            tabIndex={-1}
            className={`absolute inset-0 size-full object-cover transition-opacity duration-300 ${
              isVideoReady ? 'opacity-100' : 'opacity-0'
            }`}
            onLoadedData={(event) => {
              const video = event.currentTarget;
              video.pause();
              video.playbackRate = MOBILE_PLAYBACK_RATE;
              markMediaReady();
              setHintMode('start');
              syncPresentation();
            }}
            onCanPlay={markMediaReady}
            onPlay={() => {
              setHintMode(null);
              startUiLoop();
            }}
            onPause={() => {
              playPendingRef.current = false;
              stopUiLoop();
              syncPresentation();
            }}
            onTimeUpdate={() => syncPresentation()}
            onWaiting={() => { waitingEventsRef.current += 1; }}
            onStalled={() => { stalledEventsRef.current += 1; }}
            onEnded={() => completeTour()}
            onError={() => {
              if (tourCompletedRef.current) return;
              (window as HeroRuntimeWindow).__MAR_HERO_PRELOAD__ = {
                status: 'error',
                variant: 'mobile',
                source: HERO_MEDIA.mobile.src,
                error: 'Unable to play the cinematic tour',
              };
              setVideoFailed(true);
              completeTour();
            }}
          />
        )}

        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(6,13,26,0.26)_0%,rgba(6,13,26,0.02)_40%,rgba(6,13,26,0.72)_100%)]"
          aria-hidden="true"
        />

        {!isVideoReady && !shouldReduceMotion && !videoFailed && !isStoryCompleted && (
          <div className="absolute right-4 top-20 z-30 min-w-40 rounded-full border border-[#E6A821]/30 bg-black/60 px-3 py-1.5 text-[0.68rem] text-white backdrop-blur-md font-cairo shadow-lg">
            <div className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-[#E6A821] animate-pulse" />
              <span>جارٍ تحميل الجولة السينمائية…</span>

            </div>
          </div>
        )}

        {videoFailed && (
          <div className="absolute right-4 top-20 z-30 rounded-full border border-white/15 bg-black/60 px-3 py-1.5 text-[0.68rem] text-white/80 backdrop-blur-md font-cairo">
            تعذّر تشغيل الجولة على هذا الجهاز
          </div>
        )}

        {!isStoryCompleted && displayedStop && (
          <div className="pointer-events-none absolute inset-x-0 bottom-[18vh] z-40 flex flex-col items-center gap-2 px-3 pb-[env(safe-area-inset-bottom)]">
            <AnimatePresence>
              {hintMode && isVideoReady && !videoFailed && (
                <motion.div
                  key={hintMode}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.18 }}
                  className="pointer-events-none"
                >
                  <div className="flex items-center gap-1.5 rounded-full border border-[#E6A821]/35 bg-black/75 px-3 py-1.5 text-[0.66rem] font-bold text-white shadow-lg backdrop-blur-xl font-cairo">
                    <span className="flex size-6 items-center justify-center rounded-full border border-[#E6A821]/40 bg-[#E6A821]/15 text-[#FDE36E]">
                      <ArrowDown className="size-3 rotate-180 animate-bounce" aria-hidden="true" />
                    </span>
                    <span>{hintMode === 'start' ? 'اسحب لأعلى لبدء الجولة' : 'اسحب لأعلى لاستكمال الجولة'}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={displayedStop.id}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -5, scale: 0.985 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: 'easeOut' }}
                className="pointer-events-auto relative w-full max-w-[17.5rem] overflow-hidden rounded-xl border border-white/15 bg-black/68 p-2.5 text-right text-white shadow-[0_14px_30px_rgba(0,0,0,0.42)] backdrop-blur-xl"
              >
                <StoryCardBody
                  stop={displayedStop}
                  shouldReduceMotion={shouldReduceMotion}
                  openInquiry={openInquiry}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {searchBar && (
          <div
            className={`absolute inset-x-0 bottom-[10vh] z-[60] flex justify-center px-3 transition-[opacity,transform] duration-500 ${
              shouldReduceMotion || isStoryCompleted
                ? 'pointer-events-auto translate-y-0 opacity-100'
                : 'pointer-events-none translate-y-5 opacity-0'
            }`}
          >
            <div className="w-full max-w-5xl">{searchBar}</div>
          </div>
        )}

        {!shouldReduceMotion && !isStoryCompleted && (
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
