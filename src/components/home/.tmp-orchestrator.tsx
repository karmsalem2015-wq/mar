'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import HeroDesktopWheelSection from './HeroDesktopWheelSection';
import HeroMobileCinematicSection from './HeroMobileCinematicSection';

const DESKTOP_MEDIA_QUERY = '(min-width: 768px) and (orientation: landscape)';
const DESKTOP_FINAL_FRAME = '/media/hero/frames/desktop/frame_0381.webp';
const MOBILE_PLAYBACK_RATE_OVERRIDE = 1.65;
const DESKTOP_CONTINUOUS_PLAYBACK_RATE = 1.5;

type DesktopHintMode = 'start' | 'resume' | null;

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
  const [desktopHintMode, setDesktopHintMode] = useState<DesktopHintMode>('start');
  const finalPreloadStartedRef = useRef(false);
  const desktopRootRef = useRef<HTMLDivElement>(null);
  const mobileRootRef = useRef<HTMLDivElement>(null);
  const desktopTourCompletedRef = useRef(false);
  const desktopStartedRef = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const update = () => setIsDesktop(mediaQuery.matches);
    update();
    mediaQuery.addEventListener('change', update);
    return () => mediaQuery.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (isDesktop !== false) return;
    const root = mobileRootRef.current;
    if (!root) return;

    let disposed = false;
    let attachedVideo: HTMLVideoElement | null = null;
    let pollTimer: number | null = null;

    const applyMobileRate = () => {
      if (!attachedVideo || attachedVideo.paused) return;
      if (Math.abs(attachedVideo.playbackRate - MOBILE_PLAYBACK_RATE_OVERRIDE) > 0.01) {
        attachedVideo.playbackRate = MOBILE_PLAYBACK_RATE_OVERRIDE;
      }
    };

    const attach = () => {
      if (disposed) return;
      const video = root.querySelector('video');
      if (!video || video === attachedVideo) return;

      if (attachedVideo) {
        attachedVideo.removeEventListener('play', applyMobileRate);
        attachedVideo.removeEventListener('playing', applyMobileRate);
      }

      attachedVideo = video;
      attachedVideo.addEventListener('play', applyMobileRate);
      attachedVideo.addEventListener('playing', applyMobileRate);
      applyMobileRate();
    };

    attach();
    pollTimer = window.setInterval(attach, 150);

    return () => {
      disposed = true;
      if (pollTimer !== null) window.clearInterval(pollTimer);
      if (attachedVideo) {
        attachedVideo.removeEventListener('play', applyMobileRate);
        attachedVideo.removeEventListener('playing', applyMobileRate);
      }
    };
  }, [isDesktop]);

  useEffect(() => {
    if (isDesktop !== true) {
      desktopTourCompletedRef.current = false;
      desktopStartedRef.current = false;
      setDesktopHintMode('start');
      return;
    }

    const root = desktopRootRef.current;
    if (!root) return;

    const isInteractiveTarget = (target: EventTarget | null) =>
      target instanceof Element && Boolean(target.closest('a,button,input,textarea,select'));

    const getVideo = () => root.querySelector('video');

    const startDesktopPlayback = () => {
      const video = getVideo();
      if (!video || desktopTourCompletedRef.current || video.ended) return;
      desktopStartedRef.current = true;
      setDesktopHintMode(null);
      video.playbackRate = DESKTOP_CONTINUOUS_PLAYBACK_RATE;
      if (video.paused) {
        void video.play().catch(() => {
          setDesktopHintMode(desktopStartedRef.current ? 'resume' : 'start');
        });
      }
    };

    const pauseDesktopPlayback = () => {
      const video = getVideo();
      if (!video || desktopTourCompletedRef.current) return;
      if (!video.paused) video.pause();
      video.playbackRate = DESKTOP_CONTINUOUS_PLAYBACK_RATE;
      setDesktopHintMode(desktopStartedRef.current ? 'resume' : 'start');
    };

    const handleWheelCapture = (event: WheelEvent) => {
      if (event.ctrlKey || desktopTourCompletedRef.current || event.deltaY === 0) return;
      event.preventDefault();
      event.stopPropagation();

      if (event.deltaY > 0) startDesktopPlayback();
      else pauseDesktopPlayback();
    };

    const handlePointerDownCapture = (event: PointerEvent) => {
      if (desktopTourCompletedRef.current || isInteractiveTarget(event.target)) return;
      const video = getVideo();
      if (video && !video.paused) pauseDesktopPlayback();
    };

    root.addEventListener('wheel', handleWheelCapture, { passive: false, capture: true });
    root.addEventListener('pointerdown', handlePointerDownCapture, { capture: true });

    return () => {
      root.removeEventListener('wheel', handleWheelCapture, true);
      root.removeEventListener('pointerdown', handlePointerDownCapture, true);
    };
  }, [isDesktop]);

  useEffect(() => {
    if (!isDesktop) {
      finalPreloadStartedRef.current = false;
      desktopTourCompletedRef.current = false;
      desktopStartedRef.current = false;
      setDesktopFinalReady(false);
      setShowDesktopFinal(false);
      setDesktopHintMode('start');
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
      desktopTourCompletedRef.current = true;
      setDesktopHintMode(null);
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
    return (
      <div ref={mobileRootRef} className="relative h-[100svh] w-full bg-[#060D1A]">
        <HeroMobileCinematicSection searchBar={searchBar} />
      </div>
    );
  }

  return (
    <div ref={desktopRootRef} className="relative h-[100svh] w-full bg-[#060D1A]">
      <HeroDesktopWheelSection searchBar={searchBar} />

      {desktopHintMode && !showDesktopFinal && (
        <div className="pointer-events-none absolute inset-x-0 bottom-7 z-[65] flex justify-center px-4">
          <div className="flex items-center gap-2 rounded-full border border-[#E6A821]/35 bg-black/75 px-4 py-2 text-xs font-bold text-white shadow-xl backdrop-blur-xl font-cairo">
            <span className="flex size-7 items-center justify-center rounded-full border border-[#E6A821]/40 bg-[#E6A821]/15 text-[#FDE36E]">
              <span className="text-base leading-none">↓</span>
            </span>
            <span>
              {desktopHintMode === 'start'
                ? 'حرّك عجلة الماوس لأسفل مرة واحدة لبدء الجولة'
                : 'حرّك عجلة الماوس لأسفل لاستكمال الجولة'}
            </span>
          </div>
        </div>
      )}

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
