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

const PRELOAD_TIMEOUT_MS = 45000;
const WHEEL_IDLE_MS = 180;
const MIN_PLAYBACK_RATE = 1.1;
const MAX_PLAYBACK_RATE = 2.4;

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
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressTrackRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const wheelIdleTimerRef = useRef<number | null>(null);
  const uiRafRef = useRef<number | null>(null);
  const activeStopIndexRef = useRef(0);
  const tourCompletedRef = useRef(false);
  const playPendingRef = useRef(false);
  const waitingEventsRef = useRef(0);
  const stalledEventsRef = useRef(0);
  const playStartsRef = useRef(0);
  const playPausesRef = useRef(0);

  const [preparedSrc, setPreparedSrc] = useState<string | null>(null);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const [activeStopIndex, setActiveStopIndex] = useState(0);
  const [isStoryCompleted, setIsStoryCompleted] = useState(false);
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
  }, []);

  const startUiLoop = useCallback(() => {
    if (uiRafRef.current !== null) return;
    const tick = () => {
      uiRafRef.current = null;
      syncPresentation();
      const video = videoRef.current;
      if (video && !video.paused && !video.ended && !tourCompletedRef.current) {
        uiRafRef.current = window.requestAnimationFrame(tick);
      }
    };
    uiRafRef.current = window.requestAnimationFrame(tick);
  }, [syncPresentation]);

  const pausePlayback = useCallback(() => {
    if (wheelIdleTimerRef.current !== null) {
      window.clearTimeout(wheelIdleTimerRef.current);
      wheelIdleTimerRef.current = null;
    }
    const video = videoRef.current;
    playPendingRef.current = false;
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

  useEffect(() => {
    if (shouldReduceMotion) return;

    const originalSrc = HERO_MEDIA.desktop.src;
    const controller = new AbortController();
    let disposed = false;
    const startedAt = performance.now();
    const runtimeWindow = window as HeroRuntimeWindow;

    runtimeWindow.__MAR_HERO_PRELOAD__ = {
      status: 'loading',
      variant: 'desktop',
      source: originalSrc,
      progress: 0,
    };

    const timeout = window.setTimeout(() => controller.abort(), PRELOAD_TIMEOUT_MS);

    const prepare = async () => {
      try {
        const response = await fetch(originalSrc, {
          cache: 'force-cache',
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const totalBytes = Number(response.headers.get('content-length') || 0);
        let blob: Blob;

        if (response.body && totalBytes > 0) {
          const reader = response.body.getReader();
          const chunks: ArrayBuffer[] = [];
          let received = 0;

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (!value) continue;
            const chunk = new Uint8Array(value.byteLength);
            chunk.set(value);
            chunks.push(chunk.buffer);
            received += value.byteLength;
            const progress = Math.min(received / totalBytes, 1);
            setPreloadProgress(progress);
            runtimeWindow.__MAR_HERO_PRELOAD__ = {
              status: 'loading',
              variant: 'desktop',
              bytes: received,
              totalBytes,
              progress,
              ms: performance.now() - startedAt,
              source: originalSrc,
            };
          }

          blob = new Blob(chunks, {
            type: response.headers.get('content-type') || 'video/mp4',
          });
        } else {
          blob = await response.blob();
          setPreloadProgress(1);
        }

        if (disposed || blob.size < 1024) return;
        const objectUrl = URL.createObjectURL(blob);
        objectUrlRef.current = objectUrl;
        runtimeWindow.__MAR_HERO_PRELOAD__ = {
          status: 'ready',
          variant: 'desktop',
          bytes: blob.size,
          totalBytes: totalBytes || blob.size,
          progress: 1,
          ms: performance.now() - startedAt,
          source: originalSrc,
        };
        setPreparedSrc(objectUrl);
      } catch (error) {
        if (disposed) return;
        const message = error instanceof Error ? error.message : String(error);
        runtimeWindow.__MAR_HERO_PRELOAD__ = {
          status: 'direct-fallback',
          variant: 'desktop',
          progress: preloadProgress,
          ms: performance.now() - startedAt,
          source: originalSrc,
          error: message,
        };
        setPreparedSrc(originalSrc);
      } finally {
        window.clearTimeout(timeout);
      }
    };

    void prepare();

    return () => {
      disposed = true;
      controller.abort();
      window.clearTimeout(timeout);
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [shouldReduceMotion]);

  useEffect(() => {
    if (shouldReduceMotion) return;
    const section = sectionRef.current;
    if (!section) return;

    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey || tourCompletedRef.current) return;
      event.preventDefault();

      const video = videoRef.current;
      if (!video || !isVideoReady || videoFailed || event.deltaY === 0) return;

      if (event.deltaY < 0) {
        // The desktop tour is deliberately one-way. Upward wheel input simply
        // pauses the movie; it never asks the decoder to seek backwards.
        pausePlayback();
        return;
      }

      const multiplier = event.deltaMode === 1
        ? 16
        : event.deltaMode === 2
          ? window.innerHeight
          : 1;
      const normalizedDelta = Math.min(Math.abs(event.deltaY * multiplier), 180);
      const intensity = normalizedDelta / 180;
      const playbackRate = MIN_PLAYBACK_RATE + intensity * (MAX_PLAYBACK_RATE - MIN_PLAYBACK_RATE);
      video.playbackRate = playbackRate;

      if (wheelIdleTimerRef.current !== null) {
        window.clearTimeout(wheelIdleTimerRef.current);
      }
      wheelIdleTimerRef.current = window.setTimeout(() => {
        pausePlayback();
      }, WHEEL_IDLE_MS);

      startUiLoop();

      if (video.paused && !playPendingRef.current) {
        playPendingRef.current = true;
        playStartsRef.current += 1;
        void video.play().then(() => {
          playPendingRef.current = false;
          startUiLoop();
        }).catch(() => {
          playPendingRef.current = false;
        });
      }
    };

    section.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      section.removeEventListener('wheel', handleWheel);
      pausePlayback();
      stopUiLoop();
    };
  }, [isVideoReady, pausePlayback, shouldReduceMotion, startUiLoop, stopUiLoop, videoFailed]);

  useEffect(() => {
    const runtimeWindow = window as HeroRuntimeWindow;
    runtimeWindow.__MAR_HERO_DIAG__ = () => {
      const video = videoRef.current;
      return {
        engine: 'desktop-wheel-native-playback',
        transportMode: video && !video.paused ? 'playback' : 'idle',
        oneWay: true,
        sourceMode: preparedSrc?.startsWith('blob:') ? 'blob' : preparedSrc ? 'direct' : 'none',
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
  }, [preparedSrc]);

  useEffect(() => {
    return () => {
      if (wheelIdleTimerRef.current !== null) window.clearTimeout(wheelIdleTimerRef.current);
      stopUiLoop();
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
      className="relative h-[100svh] w-full bg-[#060D1A]"
    >
      <div className="relative h-screen h-[100svh] w-full overflow-hidden bg-[#060D1A]">
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            isVideoReady && !shouldReduceMotion ? 'opacity-0 pointer-events-none' : 'opacity-100'
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

        {preparedSrc && !shouldReduceMotion && (
          <video
            ref={videoRef}
            src={preparedSrc}
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
              video.currentTime = 0;
              video.playbackRate = 1;
              setIsVideoReady(true);
              syncPresentation();
            }}
            onCanPlay={() => setIsVideoReady(true)}
            onPlay={() => startUiLoop()}
            onPause={() => {
              playPendingRef.current = false;
              syncPresentation();
            }}
            onTimeUpdate={() => syncPresentation()}
            onWaiting={() => { waitingEventsRef.current += 1; }}
            onStalled={() => { stalledEventsRef.current += 1; }}
            onEnded={() => completeTour()}
            onError={() => setVideoFailed(true)}
          />
        )}

        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(6,13,26,0.48)_0%,rgba(6,13,26,0.06)_45%,rgba(6,13,26,0.46)_100%)]"
          aria-hidden="true"
        />

        {!isVideoReady && !shouldReduceMotion && !videoFailed && (
          <div className="absolute right-8 top-24 z-20 min-w-44 rounded-full border border-[#E6A821]/30 bg-black/60 px-4 py-2 text-xs text-white backdrop-blur-md font-cairo shadow-lg">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#E6A821] animate-pulse" />
              <span>جارٍ تحميل الجولة السينمائية…</span>
              {preloadProgress > 0 && preloadProgress < 1 && (
                <span dir="ltr" className="text-white/60">{Math.round(preloadProgress * 100)}%</span>
              )}
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
