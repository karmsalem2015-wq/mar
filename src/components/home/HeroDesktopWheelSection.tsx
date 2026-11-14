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


type HeroRuntimeWindow = Window & {
  __MAR_HERO_DIAG__?: () => unknown;
  __MAR_HERO_PRELOAD__?: {
    status: 'loading' | 'ready' | 'direct-fallback' | 'error';
    variant?: 'desktop';
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
      {action.kind === 'link' && <ArrowLeft className="size-3 sm:size-3.5" aria-hidden="true" />}
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
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#E6A821] to-transparent opacity-85" />

      <div className="mb-1.5 sm:mb-2 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-[#E6A821]/15 px-2 py-0.5 text-[0.62rem] sm:text-[0.68rem] font-bold text-[#FDE36E] border border-[#E6A821]/30 font-cairo shadow-xs">
          <span className="size-1.5 rounded-full bg-[#E6A821] animate-pulse" />
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
          <span className="size-3.5 rounded-full bg-[#E6A821]/20 border border-[#E6A821]/35 flex items-center justify-center text-[#E6A821] shrink-0">
            <ArrowDown className="size-2 animate-bounce" aria-hidden="true" />
          </span>
          <span>حرّك عجلة الماوس للتجوّل داخل المشروع</span>
        </div>
      )}
    </>
  );
}

interface HeroDesktopWheelSectionProps {
  searchBar?: ReactNode;
}

export default function HeroDesktopWheelSection({
  searchBar,
}: HeroDesktopWheelSectionProps = {}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressTrackRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const uiRafRef = useRef<number | null>(null);
  const videoFrameRef = useRef<number | null>(null);
  const activeStopIndexRef = useRef(0);
  const tourCompletedRef = useRef(false);
  const waitingEventsRef = useRef(0);
  const stalledEventsRef = useRef(0);
  const playStartsRef = useRef(0);
  const playPausesRef = useRef(0);

  const [activeStopIndex, setActiveStopIndex] = useState(0);
  const [isStoryCompleted, setIsStoryCompleted] = useState(false);
  const [wasSkipped, setWasSkipped] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const openInquiry = useInquiryStore((state) => state.open);

  const syncPresentation = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const duration = Number.isFinite(video.duration) && video.duration > 0
      ? video.duration
      : HERO_MEDIA.desktop.duration;
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

  const pausePlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!video.paused) {
      video.pause();
      playPausesRef.current += 1;
    }
    video.playbackRate = 1;
    syncPresentation();
  }, [syncPresentation]);

  const completeTour = useCallback(() => {
    if (tourCompletedRef.current) return;
    tourCompletedRef.current = true;
    pausePlayback();
    const video = videoRef.current;
    if (video && Number.isFinite(video.duration)) {
      video.currentTime = Math.max(video.duration - 0.04, 0);
    }
    if (progressBarRef.current) progressBarRef.current.style.transform = 'scaleX(1)';
    progressTrackRef.current?.setAttribute('aria-valuenow', '100');
    activeStopIndexRef.current = HERO_STORY_STOPS.length - 1;
    setActiveStopIndex(HERO_STORY_STOPS.length - 1);
    setIsStoryCompleted(true);
    window.dispatchEvent(new CustomEvent('mar:tour-complete'));
  }, [pausePlayback]);

  // Native video progressive loading avoids allocating a duplicate full-size MP4 Blob.
  useEffect(() => {
    if (shouldReduceMotion) return;
    (window as HeroRuntimeWindow).__MAR_HERO_PRELOAD__ = {
      status: 'loading',
      variant: 'desktop',
      source: HERO_MEDIA.desktop.src,
    };
  }, [shouldReduceMotion]);

  const markMediaReady = useCallback(() => {
    if (tourCompletedRef.current) return;
    setIsVideoReady(true);
    (window as HeroRuntimeWindow).__MAR_HERO_PRELOAD__ = {
      status: 'ready',
      variant: 'desktop',
      source: HERO_MEDIA.desktop.src,
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
    const runtimeWindow = window as HeroRuntimeWindow;
    runtimeWindow.__MAR_HERO_DIAG__ = () => {
      const video = videoRef.current;
      return {
        engine: 'desktop-wheel-native-playback',
        transportMode: video && !video.paused ? 'playback' : 'idle',
        oneWay: true,
        sourceMode: video?.currentSrc ? 'direct' : 'none',
        currentTime: video?.currentTime ?? 0,
        duration: video?.duration ?? 0,
        playbackRate: video?.playbackRate ?? 1,
        readyState: video?.readyState ?? 0,
        networkState: video?.networkState ?? 0,
        waitingEvents: waitingEventsRef.current,
        stalledEvents: stalledEventsRef.current,
        playStarts: playStartsRef.current,
        playPauses: playPausesRef.current,
        completed: tourCompletedRef.current,
      };
    };

    return () => {
      delete runtimeWindow.__MAR_HERO_DIAG__;
      delete runtimeWindow.__MAR_HERO_PRELOAD__;
    };
  }, []);

  useEffect(() => {
    return () => {
      stopUiLoop();
    };
  }, [stopUiLoop]);

  const displayedStop = shouldReduceMotion
    ? HERO_STORY_STOPS[0]
    : HERO_STORY_STOPS[activeStopIndex] ?? HERO_STORY_STOPS[0];

  return (
    <section
      id="mar-story"
      aria-label="جولة مار العقارية"
      className="relative h-[100svh] w-full bg-[#060D1A]"
    >
      <div className="relative h-screen h-[100svh] w-full overflow-hidden bg-[#060D1A]">
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            isVideoReady && !wasSkipped && !videoFailed && !shouldReduceMotion ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <Image
            src={HERO_MEDIA.desktop.poster}
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
            src={HERO_MEDIA.desktop.src}
            poster={HERO_MEDIA.desktop.poster}
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
              video.playbackRate = 1;
              markMediaReady();
              syncPresentation();
            }}
            onCanPlay={markMediaReady}
            onPlay={() => { playStartsRef.current += 1; startUiLoop(); }}
            onPause={() => {
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
                variant: 'desktop',
                source: HERO_MEDIA.desktop.src,
                error: 'Unable to play the cinematic tour',
              };
              setVideoFailed(true);
              completeTour();
            }}
          />
        )}

        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(6,13,26,0.48)_0%,rgba(6,13,26,0.06)_45%,rgba(6,13,26,0.46)_100%)]"
          aria-hidden="true"
        />

        {!isVideoReady && !shouldReduceMotion && !videoFailed && !isStoryCompleted && (
          <div className="absolute right-8 top-24 z-20 min-w-44 rounded-full border border-[#E6A821]/30 bg-black/60 px-4 py-2 text-xs text-white backdrop-blur-md font-cairo shadow-lg">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#E6A821] animate-pulse" />
              <span>جارٍ تحميل الجولة السينمائية…</span>

            </div>
          </div>
        )}

        {videoFailed && (
          <div className="absolute right-8 top-24 z-20 rounded-full border border-white/15 bg-black/60 px-4 py-2 text-xs text-white/80 backdrop-blur-md font-cairo">
            تعذّر تشغيل الجولة على هذا الجهاز
          </div>
        )}

        <div className="pointer-events-none absolute inset-y-0 right-10 lg:right-16 xl:right-24 z-20 flex items-center">
          <AnimatePresence mode="wait" initial={false}>
            {displayedStop.desktopSide === 'right' && !isStoryCompleted && (
              <motion.article
                key={displayedStop.id}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="pointer-events-auto w-full max-w-[21.5rem] rounded-2xl border border-white/15 hover:border-[#E6A821]/40 bg-black/65 p-4 text-right text-white shadow-[0_16px_36px_rgba(0,0,0,0.45)] backdrop-blur-xl relative overflow-hidden transition-colors duration-200"
              >
                <StoryCardBody stop={displayedStop} shouldReduceMotion={shouldReduceMotion} openInquiry={openInquiry} />
              </motion.article>
            )}
          </AnimatePresence>
        </div>

        <div className="pointer-events-none absolute inset-y-0 left-10 lg:left-16 xl:left-24 z-20 flex items-center">
          <AnimatePresence mode="wait" initial={false}>
            {displayedStop.desktopSide === 'left' && !isStoryCompleted && (
              <motion.article
                key={displayedStop.id}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="pointer-events-auto w-full max-w-[21.5rem] rounded-2xl border border-white/15 hover:border-[#E6A821]/40 bg-black/65 p-4 text-right text-white shadow-[0_16px_36px_rgba(0,0,0,0.45)] backdrop-blur-xl relative overflow-hidden transition-colors duration-200"
              >
                <StoryCardBody stop={displayedStop} shouldReduceMotion={shouldReduceMotion} openInquiry={openInquiry} />
              </motion.article>
            )}
          </AnimatePresence>
        </div>

        {searchBar && (
          <div
            className={`absolute inset-x-0 z-[60] flex justify-center px-3 transition-[opacity,transform] duration-500 bottom-10 lg:bottom-12 ${
              shouldReduceMotion || isStoryCompleted
                ? 'opacity-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 translate-y-5 pointer-events-none'
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
