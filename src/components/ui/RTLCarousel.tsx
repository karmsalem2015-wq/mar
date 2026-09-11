'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronRight, ChevronLeft, Pause, Play } from 'lucide-react';

export interface RTLCarouselProps {
  children: React.ReactNode;
  /**
   * Title displayed above carousel controls (optional)
   */
  title?: string;
  /**
   * Subtitle or counter badge text (optional)
   */
  badgeText?: string;
  /**
   * Show next/prev arrow buttons
   */
  showArrows?: boolean;
  /**
   * Show interactive dots / pagination dock
   */
  showDots?: boolean;
  /**
   * Show numeric counter (e.g. 01 / 06)
   */
  showCounter?: boolean;
  /**
   * Enable smart auto-play in RTL direction
   */
  autoPlay?: boolean;
  /**
   * Auto-play interval in ms (default: 5000)
   */
  autoPlayInterval?: number;
  /**
   * Additional wrapper class
   */
  className?: string;
  /**
   * Track / slider wrapper class
   */
  trackClassName?: string;
  /**
   * Loop back to start when reaching end
   */
  loop?: boolean;
}

export default function RTLCarousel({
  children,
  title,
  badgeText,
  showArrows = true,
  showDots = true,
  showCounter = true,
  autoPlay = false,
  autoPlayInterval = 5000,
  className = '',
  trackClassName = '',
  loop = true,
}: RTLCarouselProps) {
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  // States
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isDragging, setIsDragging] = useState(false);

  // Drag tracking refs
  const dragStartXRef = useRef(0);
  const scrollStartRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const isPointerDownRef = useRef(false);

  // Count items from children
  const childrenArray = React.useMemo(() => {
    return React.Children.toArray(children);
  }, [children]);

  const count = childrenArray.length;

  useEffect(() => {
    setTotalItems(count);
  }, [count]);

  // Determine active item based on scroll position in RTL
  const updateActiveIndex = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const items = Array.from(container.children) as HTMLElement[];
    if (items.length === 0) return;

    const containerRect = container.getBoundingClientRect();
    let bestIndex = 0;
    let minDistance = Infinity;

    // In RTL, the container starts from the right edge
    items.forEach((item, idx) => {
      const itemRect = item.getBoundingClientRect();
      // Calculate distance between item's horizontal center and container's visible center
      const itemCenter = itemRect.left + itemRect.width / 2;
      const containerCenter = containerRect.left + containerRect.width / 2;
      const distance = Math.abs(itemCenter - containerCenter);

      if (distance < minDistance) {
        minDistance = distance;
        bestIndex = idx;
      }
    });

    setCurrentIndex(bestIndex);
    setCanScrollPrev(loop || bestIndex > 0);
    setCanScrollNext(loop || bestIndex < items.length - 1);
  }, [loop]);

  // Throttled scroll listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let timeoutId: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateActiveIndex, 40);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    updateActiveIndex();

    window.addEventListener('resize', handleScroll);

    return () => {
      clearTimeout(timeoutId);
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [updateActiveIndex]);

  // Navigate to specific index safely
  const scrollToIndex = useCallback(
    (targetIndex: number) => {
      const container = containerRef.current;
      if (!container) return;

      const items = Array.from(container.children) as HTMLElement[];
      if (items.length === 0) return;

      const boundedIndex = Math.max(0, Math.min(targetIndex, items.length - 1));
      const targetElement = items[boundedIndex];

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
        setCurrentIndex(boundedIndex);
      }
    },
    []
  );

  // In RTL Arabic layout:
  // "Next" (التالي): advances forward towards the left side (ChevronLeft)
  const handleNext = useCallback(() => {
    if (currentIndex >= count - 1) {
      if (loop) scrollToIndex(0);
    } else {
      scrollToIndex(currentIndex + 1);
    }
  }, [currentIndex, count, loop, scrollToIndex]);

  // "Prev" (السابق): moves backward towards the right side (ChevronRight)
  const handlePrev = useCallback(() => {
    if (currentIndex <= 0) {
      if (loop) scrollToIndex(count - 1);
    } else {
      scrollToIndex(currentIndex - 1);
    }
  }, [currentIndex, count, loop, scrollToIndex]);

  // Smart Autoplay (in RTL, advancing forward means handleNext)
  useEffect(() => {
    if (!isPlaying || isHovered || isDragging || count <= 1) return;

    const timer = setInterval(() => {
      handleNext();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [isPlaying, isHovered, isDragging, count, autoPlayInterval, handleNext]);

  // Mouse Drag to Scroll handlers (Desktop touch emulation)
  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Primary button only
    const container = containerRef.current;
    if (!container) return;

    isPointerDownRef.current = true;
    hasDraggedRef.current = false;
    dragStartXRef.current = e.pageX;
    scrollStartRef.current = container.scrollLeft;
    setIsDragging(true);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isPointerDownRef.current || !containerRef.current) return;
    const deltaX = e.pageX - dragStartXRef.current;

    if (Math.abs(deltaX) > 6) {
      hasDraggedRef.current = true;
    }

    // Scroll naturally with drag
    containerRef.current.scrollLeft = scrollStartRef.current - deltaX;
  };

  const onMouseUp = () => {
    isPointerDownRef.current = false;
    setIsDragging(false);
  };

  // Prevent accidental clicks on child links when dragging
  const onClickCapture = (e: React.MouseEvent) => {
    if (hasDraggedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      hasDraggedRef.current = false;
    }
  };

  // Keyboard navigation
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      // In RTL, left arrow navigates to NEXT item
      e.preventDefault();
      handleNext();
    } else if (e.key === 'ArrowRight') {
      // In RTL, right arrow navigates to PREV item
      e.preventDefault();
      handlePrev();
    }
  };

  return (
    <div
      className={`relative w-full select-none font-cairo ${className}`}
      dir="rtl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        onMouseUp();
      }}
      onKeyDown={onKeyDown}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="معرض الوحدات والمشاريع"
    >
      {/* Top Controls Header (if title, counter, or arrows requested) */}
      {(title || badgeText || showArrows || showCounter) && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 px-1">
          {/* Title and Badge */}
          <div className="flex items-center gap-3">
            {badgeText && (
              <span className="py-1 px-3 text-xs font-bold text-[#CAA048] bg-[#CAA048]/10 border border-[#CAA048]/25 rounded-full font-cairo">
                {badgeText}
              </span>
            )}
            {title && (
              <h3 className="text-lg sm:text-xl font-extrabold text-brand-black font-cairo">
                {title}
              </h3>
            )}
          </div>

          {/* Controls Bar: Counter, Play/Pause, Arrows */}
          <div className="flex items-center gap-2.5 ms-auto">
            {/* Live Numeric Counter */}
            {showCounter && count > 0 && (
              <div className="px-3 py-1.5 rounded-xl bg-gray-100/90 border border-gray-200/80 text-xs font-mono font-bold text-gray-700 flex items-center gap-1">
                <span className="text-[#CAA048]">
                  {String(currentIndex + 1).padStart(2, '0')}
                </span>
                <span className="text-gray-400">/</span>
                <span>{String(count).padStart(2, '0')}</span>
              </div>
            )}

            {/* AutoPlay Toggle (if autoPlay is enabled) */}
            {autoPlay && (
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 rounded-xl bg-white border border-gray-200 hover:border-[#CAA048] text-gray-600 hover:text-[#CAA048] shadow-xs transition-colors cursor-pointer"
                title={isPlaying ? 'إيقاف التشغيل التلقائي' : 'تشغيل العرض التلقائي'}
                aria-label={isPlaying ? 'إيقاف العرض التلقائي' : 'تشغيل العرض التلقائي'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            )}

            {/* Navigation Buttons */}
            {showArrows && count > 1 && (
              <div className="flex items-center gap-1.5">
                {/* Previous Button (Right Arrow in RTL) */}
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={!canScrollPrev}
                  aria-label="العنصر السابق"
                  title="السابق"
                  className="p-2.5 rounded-xl bg-white border border-gray-200 hover:border-[#CAA048] text-gray-700 hover:text-[#CAA048] hover:bg-[#111315] shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer disabled:opacity-30 disabled:pointer-events-none active:scale-95 min-w-[40px] min-h-[40px] flex items-center justify-center"
                >
                  <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                </button>

                {/* Next Button (Left Arrow in RTL) */}
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canScrollNext}
                  aria-label="العنصر التالي"
                  title="التالي"
                  className="p-2.5 rounded-xl bg-white border border-gray-200 hover:border-[#CAA048] text-gray-700 hover:text-[#CAA048] hover:bg-[#111315] shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer disabled:opacity-30 disabled:pointer-events-none active:scale-95 min-w-[40px] min-h-[40px] flex items-center justify-center"
                >
                  <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Side Arrow Overlays for Desktop */}
      {showArrows && count > 1 && (
        <>
          {/* Floating Right Button (Prev in RTL) */}
          <button
            type="button"
            onClick={handlePrev}
            disabled={!canScrollPrev}
            aria-label="السابق"
            className="hidden lg:flex absolute top-1/2 -start-5 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/95 hover:bg-[#111315] text-[#111315] hover:text-[#E6A821] border border-gray-200 hover:border-[#E6A821] shadow-lg hover:shadow-xl items-center justify-center transition-all duration-300 cursor-pointer hover:scale-110 active:scale-95 disabled:opacity-0 disabled:pointer-events-none backdrop-blur-md"
          >
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Floating Left Button (Next in RTL) */}
          <button
            type="button"
            onClick={handleNext}
            disabled={!canScrollNext}
            aria-label="التالي"
            className="hidden lg:flex absolute top-1/2 -end-5 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/95 hover:bg-[#111315] text-[#111315] hover:text-[#E6A821] border border-gray-200 hover:border-[#E6A821] shadow-lg hover:shadow-xl items-center justify-center transition-all duration-300 cursor-pointer hover:scale-110 active:scale-95 disabled:opacity-0 disabled:pointer-events-none backdrop-blur-md"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
        </>
      )}

      {/* Carousel Scroll Container (Snap on mobile, drag on desktop) */}
      <div
        ref={containerRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onClickCapture={onClickCapture}
        className={`w-full flex flex-row flex-nowrap overflow-x-auto snap-x snap-mandatory py-3 px-1 scroll-smooth scrollbar-none transition-all ${
          isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
        } ${trackClassName}`}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
        dir="rtl"
      >
        {childrenArray.map((child, idx) => (
          <div
            key={idx}
            className="snap-start shrink-0 transition-transform duration-300"
            role="group"
            aria-roledescription="slide"
            aria-label={`عنصر ${idx + 1} من ${count}`}
          >
            {child}
          </div>
        ))}
      </div>

      {/* Luxury Interactive Dots / Floating Pagination Dock */}
      {showDots && count > 1 && (
        <div className="flex items-center justify-center mt-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-200/90 bg-white/90 px-3.5 py-1.5 shadow-sm backdrop-blur-md">
            {childrenArray.map((_, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => scrollToIndex(idx)}
                  className="group relative flex h-5 items-center justify-center cursor-pointer p-0.5 focus:outline-none"
                  aria-label={`انتقال إلى العنصر ${idx + 1}`}
                >
                  <motion.span
                    layout
                    transition={{
                      type: 'spring',
                      stiffness: 450,
                      damping: 30,
                    }}
                    className={`block rounded-full transition-colors duration-300 ${
                      isActive
                        ? 'h-2 w-7 bg-[#CAA048] shadow-xs'
                        : 'size-2 bg-gray-300 group-hover:bg-[#CAA048]/50'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
