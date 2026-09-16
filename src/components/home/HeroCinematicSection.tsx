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
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useInquiryStore } from '@/store/useInquiryStore';
import {
  getActiveHeroStopByVideoProgress,
  getHeroVideoProgress,
  HERO_MEDIA,
  HERO_STORY_STOPS,
  type HeroMediaVariant,
  type HeroStoryAction,
  type HeroStoryStop,
} from './heroStory';

const DESKTOP_MEDIA_QUERY = '(min-width: 768px) and (orientation: landscape)';
const PRELOAD_TIMEOUT_MS = 45000;
const DESKTOP_FORWARD_SEEK_THRESHOLD_S = 1.4;
const DESKTOP_REVERSE_SEEK_THRESHOLD_S = 0.12;
const DESKTOP_FOLLOW_TOLERANCE_S = 0.045;
const DESKTOP_SETTLE_IDLE_MS = 130;

type VideoWithFrameCallback = HTMLVideoElement & {
  requestVideoFrameCallback?: (callback: (now: number) => void) => number;
  cancelVideoFrameCallback?: (id: number) => void;
};

type HeroRuntimeWindow = Window & {
  __MAR_HERO_DIAG__?: () => unknown;
  __MAR_HERO_PRELOAD__?: {
    status: 'loading' | 'ready' | 'direct-fallback' | 'error';
    variant?: HeroMediaVariant;
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
          <span>مرّر للأسفل للتجوّل داخل المشروع</span>
        </div>
      )}
    </>
  );
}

interface HeroCinematicSectionProps {
  searchBar?: ReactNode;
}

export default function HeroCinematicSection({
  searchBar,
}: HeroCinematicSectionProps = {}) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressTrackRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const scrollRafRef = useRef<number | null>(null);
  const scrubRafRef = useRef<number | null>(null);
  const seekPaintRafRef = useRef<number | null>(null);
  const seekFrameCallbackRef = useRef<number | null>(null);
  const mediaVariantRef = useRef<HeroMediaVariant | null>(null);
  const activeStopIndexRef = useRef(0);
  const isStoryCompletedRef = useRef(false);
  const isTourLockedRef = useRef(false);
  const targetProgressRef = useRef(0);
  const smoothProgressRef = useRef(0);
  const lastScrubTimestampRef = useRef(0);
  const lastSeekRequestTimestampRef = useRef(0);
  const lastScrollEventAtRef = useRef(0);
  const stableViewportHeightRef = useRef(0);
  const lastViewportWidthRef = useRef(0);
  const sectionHeightRef = useRef(0);
  const sectionTopRef = useRef(0);
  const objectUrlRef = useRef<string | null>(null);
  const lastDiagTargetRef = useRef(0);
  const desktopPlayPendingRef = useRef(false);
  const desktopPlaybackActiveRef = useRef(false);

  // Native seeking remains the transport for mobile and for exceptional desktop
  // moves (reverse scroll, large jumps, final precision settle). Desktop forward
  // motion uses ordinary sequential playback so the decoder can present frames
  // continuously instead of repeatedly restarting around keyframes.
  const seekInFlightRef = useRef(false);
  const pendingSeekTimeRef = useRef<number | null>(null);
  const seekStartedAtRef = useRef(0);

  const diagRef = useRef({
    engine: 'blob-video-hybrid',
    transportMode: 'idle' as 'idle' | 'playback' | 'seek',
    samples: 0,
    seeks: 0,
    seekRequests: 0,
    completedSeeks: 0,
    coalescedSeeks: 0,
    desktopPlayStarts: 0,
    desktopPlayPauses: 0,
    desktopCatchupSeeks: 0,
    desktopReverseSeeks: 0,
    longFrames: 0,
    waitingEvents: 0,
    stalledEvents: 0,
    seekErrors: 0,
    totalSeekLatencyMs: 0,
    maxSeekLatencyMs: 0,
    maxTargetJump: 0,
    maxSeekGap: 0,
    maxRafMs: 0,
    startedAt: 0,
  });

  const [mediaVariant, setMediaVariant] = useState<HeroMediaVariant | null>(null);
  const [preparedSrc, setPreparedSrc] = useState<string | null>(null);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const [activeStopIndex, setActiveStopIndex] = useState(0);
  const [isStoryCompleted, setIsStoryCompleted] = useState(false);
  const [isMobileTourSettled, setIsMobileTourSettled] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const openInquiry = useInquiryStore((state) => state.open);

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

  const updateSectionMetrics = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;
    sectionHeightRef.current = section.offsetHeight;
    const rect = section.getBoundingClientRect();
    const currentScrollY = window.scrollY || window.pageYOffset || 0;
    sectionTopRef.current = rect.top + currentScrollY;
  }, []);

  const resetSeekPipeline = useCallback(() => {
    seekInFlightRef.current = false;
    pendingSeekTimeRef.current = null;
    seekStartedAtRef.current = 0;
    lastSeekRequestTimestampRef.current = 0;
    desktopPlayPendingRef.current = false;
    desktopPlaybackActiveRef.current = false;

    if (seekPaintRafRef.current !== null) {
      window.cancelAnimationFrame(seekPaintRafRef.current);
      seekPaintRafRef.current = null;
    }

    const video = videoRef.current as VideoWithFrameCallback | null;
    if (video) {
      if (!video.paused) video.pause();
      video.playbackRate = 1;
    }
    if (
      seekFrameCallbackRef.current !== null &&
      video?.cancelVideoFrameCallback
    ) {
      video.cancelVideoFrameCallback(seekFrameCallbackRef.current);
      seekFrameCallbackRef.current = null;
    }
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const update = () => {
      const nextVariant: HeroMediaVariant = mediaQuery.matches ? 'desktop' : 'mobile';
      if (mediaVariantRef.current === nextVariant) return;
      mediaVariantRef.current = nextVariant;
      targetProgressRef.current = 0;
      smoothProgressRef.current = 0;
      lastScrubTimestampRef.current = 0;
      lastScrollEventAtRef.current = 0;
      activeStopIndexRef.current = 0;
      isStoryCompletedRef.current = false;
      isTourLockedRef.current = false;
      resetSeekPipeline();
      setActiveStopIndex(0);
      setIsStoryCompleted(false);
      setIsMobileTourSettled(false);
      setIsVideoReady(false);
      setVideoFailed(false);
      setPreparedSrc(null);
      setPreloadProgress(0);
      setMediaVariant(nextVariant);
    };

    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, [resetSeekPipeline]);

  useEffect(() => {
    if (!mediaVariant || shouldReduceMotion) return;

    const originalSrc = HERO_MEDIA[mediaVariant].src;
    const controller = new AbortController();
    let disposed = false;
    const startedAt = performance.now();
    const runtimeWindow = window as HeroRuntimeWindow;

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    runtimeWindow.__MAR_HERO_PRELOAD__ = {
      status: 'loading',
      variant: mediaVariant,
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
              variant: mediaVariant,
              bytes: received,
              totalBytes,
              progress,
              ms: performance.now() - startedAt,
              source: originalSrc,
            };
          }

          blob = new Blob(chunks, { type: response.headers.get('content-type') || 'video/mp4' });
        } else {
          blob = await response.blob();
          setPreloadProgress(1);
        }

        if (disposed || blob.size < 1024) return;
        const objectUrl = URL.createObjectURL(blob);
        objectUrlRef.current = objectUrl;
        runtimeWindow.__MAR_HERO_PRELOAD__ = {
          status: 'ready',
          variant: mediaVariant,
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
          variant: mediaVariant,
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
  }, [mediaVariant, shouldReduceMotion]);

  const commitSeek = useCallback((desiredTime: number, force = false) => {
    const video = videoRef.current;
    const variant = mediaVariantRef.current;
    if (!video || !variant || video.readyState < 1) return false;

    const frameDuration = 1 / HERO_MEDIA[variant].fps;
    const gap = Math.abs(video.currentTime - desiredTime);
    const minimumGap = force ? Math.min(frameDuration * 0.15, 0.006) : frameDuration * 0.9;

    if (gap < minimumGap) {
      pendingSeekTimeRef.current = null;
      return false;
    }

    if (seekInFlightRef.current || video.seeking) {
      pendingSeekTimeRef.current = desiredTime;
      diagRef.current.coalescedSeeks += 1;
      return false;
    }

    try {
      if (!video.paused) {
        video.pause();
        diagRef.current.desktopPlayPauses += variant === 'desktop' ? 1 : 0;
      }
      desktopPlaybackActiveRef.current = false;
      desktopPlayPendingRef.current = false;
      video.playbackRate = 1;
      seekInFlightRef.current = true;
      seekStartedAtRef.current = performance.now();
      diagRef.current.transportMode = 'seek';
      video.currentTime = desiredTime;
      diagRef.current.seeks += 1;
      diagRef.current.maxSeekGap = Math.max(diagRef.current.maxSeekGap, gap);
      return true;
    } catch {
      seekInFlightRef.current = false;
      seekStartedAtRef.current = 0;
      diagRef.current.seekErrors += 1;
      return false;
    }
  }, []);

  const applyVideoTime = useCallback((progress: number, force = false) => {
    const video = videoRef.current;
    const variant = mediaVariantRef.current;
    if (!video || !variant || video.readyState < 1) return;

    const duration = Number.isFinite(video.duration) && video.duration > 0
      ? video.duration
      : HERO_MEDIA[variant].duration;
    const desiredTime = Math.min(Math.max(progress, 0), 1) * Math.max(0, duration - 0.04);

    diagRef.current.seekRequests += 1;

    if (seekInFlightRef.current || video.seeking) {
      pendingSeekTimeRef.current = desiredTime;
      diagRef.current.coalescedSeeks += 1;
      return;
    }

    commitSeek(desiredTime, force);
  }, [commitSeek]);

  const flushLatestSeekAfterPaint = useCallback(() => {
    const video = videoRef.current as VideoWithFrameCallback | null;
    if (!video) return;

    const flush = () => {
      seekFrameCallbackRef.current = null;
      seekPaintRafRef.current = null;
      const pending = pendingSeekTimeRef.current;
      pendingSeekTimeRef.current = null;
      if (pending === null) {
        diagRef.current.transportMode = 'idle';
        return;
      }
      commitSeek(pending);
    };

    if (video.requestVideoFrameCallback) {
      seekFrameCallbackRef.current = video.requestVideoFrameCallback(() => flush());
    } else {
      seekPaintRafRef.current = window.requestAnimationFrame(() => flush());
    }
  }, [commitSeek]);

  const handleSeeked = useCallback(() => {
    seekInFlightRef.current = false;
    diagRef.current.completedSeeks += 1;

    if (seekStartedAtRef.current > 0) {
      const latency = performance.now() - seekStartedAtRef.current;
      diagRef.current.totalSeekLatencyMs += latency;
      diagRef.current.maxSeekLatencyMs = Math.max(diagRef.current.maxSeekLatencyMs, latency);
      seekStartedAtRef.current = 0;
    }

    flushLatestSeekAfterPaint();
  }, [flushLatestSeekAfterPaint]);

  const stepVideoScrub = useCallback((timestamp: number) => {
    const variant = mediaVariantRef.current;
    const video = videoRef.current;
    if (!variant || !video || document.hidden || videoFailed) {
      scrubRafRef.current = null;
      lastScrubTimestampRef.current = 0;
      return;
    }

    const previousTimestamp = lastScrubTimestampRef.current;
    lastScrubTimestampRef.current = timestamp;
    const rawRafMs = previousTimestamp === 0 ? 16 : timestamp - previousTimestamp;
    const dt = Math.min(rawRafMs / 1000, 0.05);
    diagRef.current.samples += 1;
    diagRef.current.maxRafMs = Math.max(diagRef.current.maxRafMs, rawRafMs);
    if (rawRafMs > 24) diagRef.current.longFrames += 1;

    const target = targetProgressRef.current;
    const current = smoothProgressRef.current;
    const delta = target - current;
    const response = variant === 'desktop' ? 10 : 11.5;
    const factor = 1 - Math.exp(-response * dt);
    let next = Math.abs(delta) > 0.00025 ? current + delta * factor : target;
    if (Math.abs(target - next) <= 0.00025) next = target;
    next = Math.min(Math.max(next, 0), 1);
    smoothProgressRef.current = next;

    const duration = Number.isFinite(video.duration) && video.duration > 0
      ? video.duration
      : HERO_MEDIA[variant].duration;
    const safeDuration = Math.max(0, duration - 0.04);

    if (variant === 'desktop') {
      const desiredTime = next * safeDuration;
      const timeGap = desiredTime - video.currentTime;
      const absGap = Math.abs(timeGap);
      const scrollIdleMs = timestamp - lastScrollEventAtRef.current;
      const frameDuration = 1 / HERO_MEDIA.desktop.fps;

      const pausePlayback = () => {
        desktopPlayPendingRef.current = false;
        desktopPlaybackActiveRef.current = false;
        if (!video.paused) {
          video.pause();
          diagRef.current.desktopPlayPauses += 1;
        }
        if (Math.abs(video.playbackRate - 1) > 0.01) video.playbackRate = 1;
        if (!seekInFlightRef.current) diagRef.current.transportMode = 'idle';
      };

      if (seekInFlightRef.current || video.seeking) {
        // A rare catch-up/reverse seek is already decoding. Keep only the newest
        // target and do not compete with the decoder by starting playback.
        pendingSeekTimeRef.current = desiredTime;
      } else if (timeGap < -DESKTOP_REVERSE_SEEK_THRESHOLD_S) {
        pausePlayback();
        diagRef.current.desktopReverseSeeks += 1;
        applyVideoTime(next);
      } else if (timeGap > DESKTOP_FORWARD_SEEK_THRESHOLD_S) {
        pausePlayback();
        diagRef.current.desktopCatchupSeeks += 1;
        applyVideoTime(next);
      } else if (timeGap > DESKTOP_FOLLOW_TOLERANCE_S) {
        // Normal forward motion: let the browser decode sequentially. Playback
        // rate rises gently with distance so the movie follows the smoothed
        // scroll playhead without a stream of random-access seeks.
        const playbackRate = Math.min(2.25, Math.max(0.8, 0.85 + timeGap * 1.25));
        if (Math.abs(video.playbackRate - playbackRate) > 0.06) {
          video.playbackRate = playbackRate;
        }
        diagRef.current.transportMode = 'playback';

        if (video.paused && !desktopPlayPendingRef.current) {
          desktopPlayPendingRef.current = true;
          diagRef.current.desktopPlayStarts += 1;
          void video.play().then(() => {
            desktopPlayPendingRef.current = false;
            desktopPlaybackActiveRef.current = true;
          }).catch(() => {
            desktopPlayPendingRef.current = false;
            desktopPlaybackActiveRef.current = false;
            commitSeek(desiredTime);
          });
        }
      } else {
        pausePlayback();

        // Once scrolling has stopped, do at most one precision settle seek. This
        // removes small accumulated drift without disturbing active motion.
        if (
          scrollIdleMs >= DESKTOP_SETTLE_IDLE_MS &&
          absGap > frameDuration * 0.75 &&
          !seekInFlightRef.current
        ) {
          applyVideoTime(next, true);
        }
      }
    } else {
      const seekInterval = 1000 / HERO_MEDIA.mobile.fps;
      if (
        timestamp - lastSeekRequestTimestampRef.current >= seekInterval ||
        next === target
      ) {
        lastSeekRequestTimestampRef.current = timestamp;
        applyVideoTime(next, next === target);
      }
    }

    const presentedProgress = variant === 'desktop' && safeDuration > 0
      ? Math.min(Math.max(video.currentTime / safeDuration, 0), 1)
      : next;
    const nextStopIndex = getActiveHeroStopByVideoProgress(presentedProgress, activeStopIndexRef.current);
    if (nextStopIndex !== activeStopIndexRef.current) {
      activeStopIndexRef.current = nextStopIndex;
      setActiveStopIndex(nextStopIndex);
    }

    const progressNeedsFollow = Math.abs(targetProgressRef.current - smoothProgressRef.current) > 0.00025;
    const desktopDesiredTime = smoothProgressRef.current * safeDuration;
    const desktopNeedsFollow = variant === 'desktop' && (
      Math.abs(desktopDesiredTime - video.currentTime) > DESKTOP_FOLLOW_TOLERANCE_S ||
      !video.paused ||
      desktopPlayPendingRef.current ||
      seekInFlightRef.current ||
      pendingSeekTimeRef.current !== null
    );

    if (progressNeedsFollow || desktopNeedsFollow) {
      scrubRafRef.current = window.requestAnimationFrame(stepVideoScrub);
    } else {
      scrubRafRef.current = null;
      lastScrubTimestampRef.current = 0;
      if (variant === 'desktop') diagRef.current.transportMode = 'idle';
    }
  }, [applyVideoTime, commitSeek, videoFailed]);

  const startVideoScrub = useCallback(() => {
    if (scrubRafRef.current === null) {
      lastScrubTimestampRef.current = 0;
      scrubRafRef.current = window.requestAnimationFrame(stepVideoScrub);
    }
  }, [stepVideoScrub]);

  const syncStoryToScroll = useCallback(() => {
    scrollRafRef.current = null;
    const section = sectionRef.current;
    const variant = mediaVariantRef.current;
    if (!section || !variant || shouldReduceMotion || videoFailed) return;

    const viewportHeight = videoRef.current?.clientHeight || getStableViewportHeight();
    const sectionHeight = sectionHeightRef.current || section.offsetHeight;
    const scrollableDistance = Math.max(sectionHeight - viewportHeight, 1);
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const relativeScroll = Math.max(0, scrollY - (sectionTopRef.current || 0));
    const scrollProgress = Math.min(Math.max(relativeScroll / scrollableDistance, 0), 1);

    if (progressBarRef.current) progressBarRef.current.style.transform = `scaleX(${scrollProgress})`;
    progressTrackRef.current?.setAttribute('aria-valuenow', String(Math.round(scrollProgress * 100)));

    if (variant === 'mobile' && isTourLockedRef.current) {
      targetProgressRef.current = 1;
      smoothProgressRef.current = 1;
      applyVideoTime(1, true);
      return;
    }

    const rawVideoProgress = getHeroVideoProgress(scrollProgress);
    const jump = Math.abs(rawVideoProgress - lastDiagTargetRef.current);
    diagRef.current.maxTargetJump = Math.max(diagRef.current.maxTargetJump, jump);
    lastDiagTargetRef.current = rawVideoProgress;
    targetProgressRef.current = rawVideoProgress;

    if (variant === 'mobile' && rawVideoProgress >= 0.85) {
      isTourLockedRef.current = true;
      isStoryCompletedRef.current = true;
      setIsStoryCompleted(true);
      targetProgressRef.current = 1;
      smoothProgressRef.current = 1;
      applyVideoTime(1, true);
      window.dispatchEvent(new CustomEvent('mar:tour-complete'));
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: sectionTopRef.current || 0, behavior: 'auto' });
        setIsMobileTourSettled(true);
      });
      if (scrubRafRef.current !== null) {
        window.cancelAnimationFrame(scrubRafRef.current);
        scrubRafRef.current = null;
      }
      return;
    }

    if (variant === 'desktop') {
      const completed = rawVideoProgress >= 0.965;
      if (completed !== isStoryCompletedRef.current) {
        isStoryCompletedRef.current = completed;
        setIsStoryCompleted(completed);
        if (completed) window.dispatchEvent(new CustomEvent('mar:tour-complete'));
      }
    }

    startVideoScrub();
  }, [applyVideoTime, getStableViewportHeight, shouldReduceMotion, startVideoScrub, videoFailed]);

  const requestScrollSync = useCallback(() => {
    if (scrollRafRef.current !== null) return;
    scrollRafRef.current = window.requestAnimationFrame(syncStoryToScroll);
  }, [syncStoryToScroll]);

  useEffect(() => {
    if (!mediaVariant || shouldReduceMotion) return;

    const handleScroll = () => {
      lastScrollEventAtRef.current = performance.now();
      requestScrollSync();
    };
    const handleResize = () => {
      const width = window.innerWidth;
      if (
        mediaVariantRef.current === 'desktop' ||
        Math.abs(width - lastViewportWidthRef.current) > 2
      ) {
        stableViewportHeightRef.current = window.innerHeight;
        lastViewportWidthRef.current = width;
        updateSectionMetrics();
      }
      requestScrollSync();
    };
    const handleOrientationChange = () => {
      stableViewportHeightRef.current = 0;
      updateSectionMetrics();
      requestScrollSync();
    };

    updateSectionMetrics();
    requestScrollSync();
    const resizeObserver = new ResizeObserver(() => {
      updateSectionMetrics();
      requestScrollSync();
    });
    if (sectionRef.current) resizeObserver.observe(sectionRef.current);
    if (videoRef.current) resizeObserver.observe(videoRef.current);

    diagRef.current = {
      engine: 'blob-video-hybrid',
      transportMode: 'idle',
      samples: 0,
      seeks: 0,
      seekRequests: 0,
      completedSeeks: 0,
      coalescedSeeks: 0,
      desktopPlayStarts: 0,
      desktopPlayPauses: 0,
      desktopCatchupSeeks: 0,
      desktopReverseSeeks: 0,
      longFrames: 0,
      waitingEvents: 0,
      stalledEvents: 0,
      seekErrors: 0,
      totalSeekLatencyMs: 0,
      maxSeekLatencyMs: 0,
      maxTargetJump: 0,
      maxSeekGap: 0,
      maxRafMs: 0,
      startedAt: performance.now(),
    };
    lastDiagTargetRef.current = 0;

    (window as HeroRuntimeWindow).__MAR_HERO_DIAG__ = () => {
      const video = videoRef.current;
      const completed = diagRef.current.completedSeeks;
      return {
        ...diagRef.current,
        averageSeekLatencyMs: completed
          ? diagRef.current.totalSeekLatencyMs / completed
          : 0,
        seekInFlight: seekInFlightRef.current,
        pendingSeek: pendingSeekTimeRef.current,
        desktopPlaybackActive: desktopPlaybackActiveRef.current,
        desktopPlayPending: desktopPlayPendingRef.current,
        playbackRate: video?.playbackRate ?? 1,
        longFrameRate: diagRef.current.samples
          ? diagRef.current.longFrames / diagRef.current.samples
          : 0,
        elapsedMs: performance.now() - diagRef.current.startedAt,
        currentTime: video?.currentTime ?? 0,
        duration: video?.duration ?? 0,
        readyState: video?.readyState ?? 0,
        networkState: video?.networkState ?? 0,
        variant: mediaVariantRef.current,
        sourceMode: preparedSrc?.startsWith('blob:') ? 'blob' : 'direct',
      };
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    document.addEventListener('visibilitychange', requestScrollSync);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      document.removeEventListener('visibilitychange', requestScrollSync);
      delete (window as HeroRuntimeWindow).__MAR_HERO_DIAG__;
      if (scrollRafRef.current !== null) window.cancelAnimationFrame(scrollRafRef.current);
      if (scrubRafRef.current !== null) window.cancelAnimationFrame(scrubRafRef.current);
      scrollRafRef.current = null;
      scrubRafRef.current = null;
      resetSeekPipeline();
    };
  }, [mediaVariant, preparedSrc, requestScrollSync, resetSeekPipeline, shouldReduceMotion, updateSectionMetrics]);

  useEffect(() => {
    return () => {
      delete (window as HeroRuntimeWindow).__MAR_HERO_PRELOAD__;
      resetSeekPipeline();
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [resetSeekPipeline]);

  const displayedStop = shouldReduceMotion
    ? HERO_STORY_STOPS[0]
    : activeStopIndex >= 0
      ? HERO_STORY_STOPS[activeStopIndex]
      : null;

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
            : 'h-[500svh] md:h-[750vh] lg:h-[850vh]'
      }`}
    >
      <div className="sticky top-0 h-screen h-[100svh] w-full overflow-hidden bg-[#060D1A]">
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

        {mediaVariant && preparedSrc && !shouldReduceMotion && (
          <video
            key={`${mediaVariant}-${preparedSrc.startsWith('blob:') ? 'blob' : 'direct'}`}
            ref={videoRef}
            src={preparedSrc}
            poster={HERO_MEDIA[mediaVariant].poster}
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
              resetSeekPipeline();
              setIsVideoReady(true);
              event.currentTarget.pause();
              applyVideoTime(smoothProgressRef.current, true);
              requestScrollSync();
            }}
            onCanPlay={() => setIsVideoReady(true)}
            onPlay={() => {
              desktopPlaybackActiveRef.current = mediaVariantRef.current === 'desktop';
              if (mediaVariantRef.current === 'desktop') diagRef.current.transportMode = 'playback';
            }}
            onPause={() => {
              desktopPlaybackActiveRef.current = false;
              if (!seekInFlightRef.current) diagRef.current.transportMode = 'idle';
            }}
            onSeeking={() => {
              if (!seekInFlightRef.current) {
                seekInFlightRef.current = true;
                seekStartedAtRef.current = performance.now();
              }
              diagRef.current.transportMode = 'seek';
            }}
            onSeeked={handleSeeked}
            onWaiting={() => { diagRef.current.waitingEvents += 1; }}
            onStalled={() => { diagRef.current.stalledEvents += 1; }}
            onEnded={() => {
              desktopPlaybackActiveRef.current = false;
              desktopPlayPendingRef.current = false;
              diagRef.current.transportMode = 'idle';
            }}
            onError={() => {
              seekInFlightRef.current = false;
              desktopPlaybackActiveRef.current = false;
              desktopPlayPendingRef.current = false;
              setVideoFailed(true);
            }}
          />
        )}

        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(6,13,26,0.28)_0%,rgba(6,13,26,0.03)_36%,rgba(6,13,26,0.72)_100%)] md:bg-[linear-gradient(90deg,rgba(6,13,26,0.48)_0%,rgba(6,13,26,0.06)_45%,rgba(6,13,26,0.46)_100%)]"
          aria-hidden="true"
        />

        {!isVideoReady && !shouldReduceMotion && !videoFailed && (
          <div className="absolute right-4 top-20 z-20 min-w-44 rounded-full border border-[#E6A821]/30 bg-black/60 px-4 py-2 text-xs text-white backdrop-blur-md sm:right-8 sm:top-24 font-cairo shadow-lg">
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
          <div className="absolute right-4 top-20 z-20 rounded-full border border-white/15 bg-black/60 px-4 py-2 text-xs text-white/80 backdrop-blur-md sm:right-8 sm:top-24 font-cairo">
            تعذّر تشغيل الجولة على هذا الجهاز
          </div>
        )}

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
                <StoryCardBody stop={displayedStop} shouldReduceMotion={shouldReduceMotion} openInquiry={openInquiry} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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
                <StoryCardBody stop={displayedStop} shouldReduceMotion={shouldReduceMotion} openInquiry={openInquiry} />
              </motion.article>
            )}
          </AnimatePresence>
        </div>

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
                <StoryCardBody stop={displayedStop} shouldReduceMotion={shouldReduceMotion} openInquiry={openInquiry} />
              </motion.article>
            )}
          </AnimatePresence>
        </div>

        {searchBar && (
          <div
            className={`absolute inset-x-0 z-[60] flex justify-center px-3 transition-[opacity,transform] duration-500 bottom-[10vh] md:bottom-10 lg:bottom-12 ${
              shouldReduceMotion || isStoryCompleted
                ? 'opacity-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 translate-y-5 pointer-events-none'
            }`}
          >
            <div className="w-full max-w-5xl">{searchBar}</div>
          </div>
        )}

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
