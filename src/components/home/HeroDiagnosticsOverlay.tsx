'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Metrics = {
  rafSamples: number;
  longRaf: number;
  maxRafMs: number;
  seekingEvents: number;
  seekedEvents: number;
  waitingEvents: number;
  stalledEvents: number;
  totalSeekMs: number;
  maxSeekMs: number;
  largeTimeJumps: number;
  frameCallbacks: number;
  maxFrameGapMs: number;
  readyState: number;
  networkState: number;
  currentTime: number;
  duration: number;
  width: number;
  height: number;
  sourceMode: 'blob' | 'direct' | 'none';
};

const INITIAL: Metrics = {
  rafSamples: 0,
  longRaf: 0,
  maxRafMs: 0,
  seekingEvents: 0,
  seekedEvents: 0,
  waitingEvents: 0,
  stalledEvents: 0,
  totalSeekMs: 0,
  maxSeekMs: 0,
  largeTimeJumps: 0,
  frameCallbacks: 0,
  maxFrameGapMs: 0,
  readyState: 0,
  networkState: 0,
  currentTime: 0,
  duration: 0,
  width: 0,
  height: 0,
  sourceMode: 'none',
};

export default function HeroDiagnosticsOverlay() {
  const [enabled, setEnabled] = useState(false);
  const [metrics, setMetrics] = useState<Metrics>(INITIAL);
  const metricsRef = useRef<Metrics>({ ...INITIAL });
  const seekStartedAtRef = useRef<number | null>(null);
  const lastRafRef = useRef(0);
  const lastVideoTimeRef = useRef(0);
  const lastFrameCallbackRef = useRef(0);

  useEffect(() => {
    setEnabled(new URLSearchParams(window.location.search).get('heroDebug') === '1');
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let disposed = false;
    let raf = 0;
    let publishTimer = 0;
    let detachVideoListeners = () => {};
    let activeVideo: HTMLVideoElement | null = null;
    let frameCallbackId = 0;

    const attach = (video: HTMLVideoElement) => {
      if (activeVideo === video) return;
      detachVideoListeners();
      activeVideo = video;

      const onSeeking = () => {
        const m = metricsRef.current;
        m.seekingEvents += 1;
        if (seekStartedAtRef.current === null) seekStartedAtRef.current = performance.now();
      };
      const onSeeked = () => {
        const m = metricsRef.current;
        m.seekedEvents += 1;
        if (seekStartedAtRef.current !== null) {
          const duration = performance.now() - seekStartedAtRef.current;
          m.totalSeekMs += duration;
          m.maxSeekMs = Math.max(m.maxSeekMs, duration);
          seekStartedAtRef.current = null;
        }
      };
      const onWaiting = () => { metricsRef.current.waitingEvents += 1; };
      const onStalled = () => { metricsRef.current.stalledEvents += 1; };

      video.addEventListener('seeking', onSeeking);
      video.addEventListener('seeked', onSeeked);
      video.addEventListener('waiting', onWaiting);
      video.addEventListener('stalled', onStalled);

      const requestVideoFrame = () => {
        const candidate = video as HTMLVideoElement & {
          requestVideoFrameCallback?: (cb: (now: number) => void) => number;
          cancelVideoFrameCallback?: (id: number) => void;
        };
        if (!candidate.requestVideoFrameCallback || disposed) return;
        frameCallbackId = candidate.requestVideoFrameCallback((now) => {
          const m = metricsRef.current;
          m.frameCallbacks += 1;
          if (lastFrameCallbackRef.current > 0) {
            m.maxFrameGapMs = Math.max(m.maxFrameGapMs, now - lastFrameCallbackRef.current);
          }
          lastFrameCallbackRef.current = now;
          requestVideoFrame();
        });
      };
      requestVideoFrame();

      detachVideoListeners = () => {
        video.removeEventListener('seeking', onSeeking);
        video.removeEventListener('seeked', onSeeked);
        video.removeEventListener('waiting', onWaiting);
        video.removeEventListener('stalled', onStalled);
        const candidate = video as HTMLVideoElement & { cancelVideoFrameCallback?: (id: number) => void };
        if (frameCallbackId && candidate.cancelVideoFrameCallback) {
          candidate.cancelVideoFrameCallback(frameCallbackId);
        }
      };
    };

    const tick = (now: number) => {
      if (disposed) return;
      const m = metricsRef.current;
      if (lastRafRef.current > 0) {
        const dt = now - lastRafRef.current;
        m.rafSamples += 1;
        m.maxRafMs = Math.max(m.maxRafMs, dt);
        if (dt > 24) m.longRaf += 1;
      }
      lastRafRef.current = now;

      const video = document.querySelector('#mar-story video') as HTMLVideoElement | null;
      if (video) {
        attach(video);
        const delta = Math.abs(video.currentTime - lastVideoTimeRef.current);
        if (lastVideoTimeRef.current > 0 && delta > 0.75) m.largeTimeJumps += 1;
        lastVideoTimeRef.current = video.currentTime;
        m.readyState = video.readyState;
        m.networkState = video.networkState;
        m.currentTime = video.currentTime;
        m.duration = Number.isFinite(video.duration) ? video.duration : 0;
        m.width = video.videoWidth;
        m.height = video.videoHeight;
        m.sourceMode = video.currentSrc.startsWith('blob:') ? 'blob' : video.currentSrc ? 'direct' : 'none';
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    publishTimer = window.setInterval(() => {
      setMetrics({ ...metricsRef.current });
    }, 250);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.clearInterval(publishTimer);
      detachVideoListeners();
    };
  }, [enabled]);

  const diagnosis = useMemo(() => {
    const avgSeek = metrics.seekedEvents ? metrics.totalSeekMs / metrics.seekedEvents : 0;
    const longRafRate = metrics.rafSamples ? metrics.longRaf / metrics.rafSamples : 0;

    if (metrics.sourceMode === 'none') return 'Waiting for video element';
    if (metrics.sourceMode !== 'blob') return 'Network fallback active';
    if (avgSeek > 55 || metrics.maxSeekMs > 140) return 'Seek/decode bottleneck';
    if (metrics.waitingEvents + metrics.stalledEvents > 1) return 'Decoder/media starvation';
    if (longRafRate > 0.2) return 'Main-thread / RAF pressure';
    if (metrics.largeTimeJumps > 2) return 'Playhead jump / seek coalescing needed';
    return 'No dominant bottleneck yet';
  }, [metrics]);

  if (!enabled) return null;

  const avgSeek = metrics.seekedEvents ? metrics.totalSeekMs / metrics.seekedEvents : 0;
  const longRafRate = metrics.rafSamples ? (metrics.longRaf / metrics.rafSamples) * 100 : 0;

  return (
    <div
      dir="ltr"
      className="fixed left-3 top-3 z-[99999] w-[310px] rounded-xl border border-white/20 bg-black/90 p-3 font-mono text-[11px] leading-5 text-white shadow-2xl backdrop-blur-md"
    >
      <div className="mb-2 flex items-center justify-between gap-2 border-b border-white/10 pb-2">
        <strong className="text-[#FDE36E]">MAR HERO PROFILER</strong>
        <span>{metrics.width}×{metrics.height}</span>
      </div>
      <div>Diagnosis: <strong>{diagnosis}</strong></div>
      <div>Source: {metrics.sourceMode} | readyState: {metrics.readyState}</div>
      <div>Seek avg/max: {avgSeek.toFixed(1)} / {metrics.maxSeekMs.toFixed(1)} ms</div>
      <div>Seeking/seeked: {metrics.seekingEvents} / {metrics.seekedEvents}</div>
      <div>Waiting/stalled: {metrics.waitingEvents} / {metrics.stalledEvents}</div>
      <div>RAF long: {longRafRate.toFixed(1)}% | max {metrics.maxRafMs.toFixed(1)} ms</div>
      <div>Video-frame max gap: {metrics.maxFrameGapMs.toFixed(1)} ms</div>
      <div>Large time jumps: {metrics.largeTimeJumps}</div>
      <div>Time: {metrics.currentTime.toFixed(2)} / {metrics.duration.toFixed(2)} s</div>
      <div className="mt-2 border-t border-white/10 pt-2 text-white/60">
        Scroll the hero normally, then take one screenshot of this panel.
      </div>
    </div>
  );
}
