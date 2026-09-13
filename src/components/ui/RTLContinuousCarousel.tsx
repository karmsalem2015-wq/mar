'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

export interface RTLContinuousCarouselProps {
  children: React.ReactNode[];
  speed?: number; // pixels per step (default 0.75)
  className?: string;
  itemClassName?: string;
  gap?: string;
}

export default function RTLContinuousCarousel({
  children,
  speed = 0.8,
  className = '',
  itemClassName = '',
  gap = 'gap-4 sm:gap-6',
}: RTLContinuousCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isHoveredRef = useRef(false);
  const isTouchingRef = useRef(false);
  const isPausedRef = useRef(false);
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Mouse drag support for desktop
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const [isDraggingState, setIsDraggingState] = useState(false);
  const [isInView, setIsInView] = useState(false);

  // Lazy-load auto-scroll: only activate when carousel is near viewport
  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { rootMargin: '150px 0px', threshold: 0 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Pause auto-scroll temporarily (e.g. after clicking an arrow or ending touch)
  const pauseTemporarily = useCallback((ms = 2500) => {
    isPausedRef.current = true;
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
    }
    resumeTimerRef.current = setTimeout(() => {
      isPausedRef.current = false;
    }, ms);
  }, []);

  // Duplicate items 4 times to ensure a continuous infinite loop
  const rawItems = React.useMemo(() => React.Children.toArray(children), [children]);
  const duplicatedItems = React.useMemo(() => {
    if (rawItems.length === 0) return [];
    if (rawItems.length < 5) {
      return [...rawItems, ...rawItems, ...rawItems, ...rawItems, ...rawItems, ...rawItems];
    }
    return [...rawItems, ...rawItems, ...rawItems, ...rawItems];
  }, [rawItems]);

  // Initial scroll position setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Small delay to let DOM render
    const timer = setTimeout(() => {
      // In RTL, starting near 0 is fine, wrap-around takes care of loop
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (maxScroll > 100 && Math.abs(container.scrollLeft) < 10) {
        // Position slightly inwards so backward scrolling also has room
        container.scrollLeft = container.scrollLeft < 0 ? -(maxScroll / 4) : maxScroll / 4;
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [duplicatedItems.length]);

  // Continuous auto-scroll loop (only executes when carousel is scrolled into view)
  useEffect(() => {
    const container = containerRef.current;
    if (!container || duplicatedItems.length === 0 || !isInView) return;

    let lastTime = performance.now();

    const step = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      // Only run auto-scroll if not hovered, not touching, not dragging, and not paused
      if (
        !isHoveredRef.current &&
        !isTouchingRef.current &&
        !isDraggingRef.current &&
        !isPausedRef.current
      ) {
        // Move in RTL direction (leftwards = negative in RTL scrollBy)
        container.scrollBy({ left: -speed, behavior: 'auto' });

        // Seamless wrap-around check
        const { scrollLeft, scrollWidth, clientWidth } = container;
        const maxScroll = scrollWidth - clientWidth;
        const currentAbs = Math.abs(scrollLeft);

        // If scrolled past 3/4 of the duplicated track, wrap back seamlessly
        if (currentAbs >= (maxScroll * 3) / 4) {
          const shift = maxScroll / 2;
          container.scrollLeft = scrollLeft < 0 ? scrollLeft + shift : scrollLeft - shift;
        } else if (currentAbs <= 10) {
          // If scrolled all the way to start (e.g. from clicking Prev), wrap forward
          const shift = maxScroll / 2;
          container.scrollLeft = scrollLeft < 0 ? scrollLeft - shift : scrollLeft + shift;
        }
      }

      animationFrameRef.current = requestAnimationFrame(step);
    };

    animationFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current);
      }
    };
  }, [duplicatedItems.length, speed, isInView]);

  // Arrow navigation handlers
  // Next in RTL: advances forward to the left (points Left)
  const handleNext = () => {
    const container = containerRef.current;
    if (!container) return;
    const scrollAmount = Math.max(container.clientWidth * 0.45, 310);
    container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    pauseTemporarily(2800);
  };

  // Prev in RTL: moves backward to the right (points Right)
  const handlePrev = () => {
    const container = containerRef.current;
    if (!container) return;
    const scrollAmount = Math.max(container.clientWidth * 0.45, 310);
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    pauseTemporarily(2800);
  };

  // Touch handlers for mobile swipe
  const onTouchStart = () => {
    isTouchingRef.current = true;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
  };

  const onTouchEnd = () => {
    isTouchingRef.current = false;
    pauseTemporarily(2500);
  };

  // Mouse Drag handlers for desktop
  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // primary click only
    const container = containerRef.current;
    if (!container) return;

    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.pageX;
    startScrollLeftRef.current = container.scrollLeft;
    setIsDraggingState(true);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    const deltaX = e.pageX - startXRef.current;

    if (Math.abs(deltaX) > 6) {
      hasDraggedRef.current = true;
    }

    containerRef.current.scrollLeft = startScrollLeftRef.current - deltaX;
  };

  const onMouseUp = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsDraggingState(false);
      pauseTemporarily(2000);
    }
  };

  const onClickCapture = (e: React.MouseEvent) => {
    if (hasDraggedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      hasDraggedRef.current = false;
    }
  };

  return (
    <div
      className={`relative w-full select-none font-cairo group/continuous ${className}`}
      dir="rtl"
      onMouseEnter={() => {
        isHoveredRef.current = true;
      }}
      onMouseLeave={() => {
        isHoveredRef.current = false;
        onMouseUp();
      }}
    >
      {/* Desktop-Only Navigation Arrows (Hidden on mobile as requested) */}
      <button
        type="button"
        onClick={handlePrev}
        aria-label="العنصر السابق"
        title="السابق"
        className="hidden md:flex absolute top-1/2 -start-4 lg:-start-6 -translate-y-1/2 z-30 w-11 h-11 lg:w-12 lg:h-12 rounded-full bg-white/95 text-[#111315] hover:bg-[#111315] hover:text-[#E6A821] border border-gray-200 hover:border-[#E6A821] shadow-lg hover:shadow-xl items-center justify-center transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 backdrop-blur-md min-w-[44px] min-h-[44px]"
      >
        <ChevronRight className="w-5 h-5 stroke-[2.5]" />
      </button>

      <button
        type="button"
        onClick={handleNext}
        aria-label="العنصر التالي"
        title="التالي"
        className="hidden md:flex absolute top-1/2 -end-4 lg:-end-6 -translate-y-1/2 z-30 w-11 h-11 lg:w-12 lg:h-12 rounded-full bg-white/95 text-[#111315] hover:bg-[#111315] hover:text-[#E6A821] border border-gray-200 hover:border-[#E6A821] shadow-lg hover:shadow-xl items-center justify-center transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 backdrop-blur-md min-w-[44px] min-h-[44px]"
      >
        <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
      </button>

      {/* Scroll / Swipe Track Container */}
      <div
        ref={containerRef}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onClickCapture={onClickCapture}
        className={`w-full flex flex-row flex-nowrap overflow-x-auto py-3 px-1 scrollbar-none ${
          isDraggingState ? 'cursor-grabbing' : 'cursor-grab'
        } ${gap}`}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
        dir="rtl"
      >
        {duplicatedItems.map((child, idx) => (
          <div
            key={idx}
            className={`shrink-0 transition-transform duration-300 ${itemClassName}`}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
