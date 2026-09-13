// src/components/ui/PanoramaViewer.tsx
'use client';

import React, { useRef, useState, useEffect } from 'react';
import { RotateCw, Move } from 'lucide-react';

interface PanoramaViewerProps {
  imageSrc: string;
  heightClass?: string;
  autoplay?: boolean;
}

export default function PanoramaViewer({
  imageSrc,
  heightClass = 'h-[450px]',
  autoplay = true,
}: PanoramaViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Interaction State
  const stateRef = useRef({
    xOffset: 0, // Horizontal pixel offset on the panorama image
    yOffset: 0, // Vertical tilt pixel offset
    isDragging: false,
    startX: 0,
    startY: 0,
    speedX: 0.5, // Auto-rotation speed when idle
    inertiaX: 0, // Kinetic scrolling speed
    lastTime: 0,
    imageWidth: 0,
    imageHeight: 0,
    isIdle: true,
    idleTimer: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = imageSrc;

    img.onload = () => {
      stateRef.current.imageWidth = img.width;
      stateRef.current.imageHeight = img.height;
      setIsLoading(false);
      
      // Initial render size setup
      resizeCanvas();
      requestAnimationFrame(render);
    };

    img.onerror = () => {
      setError(true);
      setIsLoading(false);
    };

    function resizeCanvas() {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    // Resize listener
    window.addEventListener('resize', resizeCanvas);

    let animationFrameId: number;

    function render(timestamp: number) {
      if (!canvas || !ctx || !img) return;

      const state = stateRef.current;
      const { imageWidth, imageHeight } = state;

      if (imageWidth === 0 || imageHeight === 0) return;

      // Handle auto-rotation & inertia decay
      if (state.isDragging) {
        state.inertiaX = 0;
      } else {
        // Apply inertia friction
        state.xOffset += state.inertiaX;
        state.inertiaX *= 0.95; // Friction factor

        // If inertially stopped, and idle for > 3s, apply autoplay
        if (Math.abs(state.inertiaX) < 0.05 && autoplay && state.isIdle) {
          state.xOffset += state.speedX;
        }
      }

      // Keep offset in bounds of the image width
      state.xOffset = (state.xOffset + imageWidth) % imageWidth;

      // Vertical tilt bounds (limit vertical looking angle)
      const maxTilt = imageHeight * 0.15;
      state.yOffset = Math.max(-maxTilt, Math.min(maxTilt, state.yOffset));

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // We want to map a source slice of the image to the destination canvas
      // Let's define the field of view in source pixels
      const fovWidth = imageWidth * 0.35; // 35% of the panorama is visible at once (approx 120 deg FOV)
      const fovHeight = imageHeight * 0.7;  // visible height fraction

      // Source Crop Coordinates
      const sx = state.xOffset;
      const sy = (imageHeight - fovHeight) / 2 + state.yOffset;

      // Handle horizontal wrap-around
      if (sx + fovWidth <= imageWidth) {
        // Standard single slice draw
        ctx.drawImage(
          img,
          sx, sy, fovWidth, fovHeight, // Source
          0, 0, canvas.width, canvas.height // Destination
        );
      } else {
        // Draw in two pieces: left side of seam, and wrapped right side of seam
        const slice1Width = imageWidth - sx;
        const slice2Width = fovWidth - slice1Width;

        // Map relative widths to canvas destination widths
        const dest1Width = (slice1Width / fovWidth) * canvas.width;
        const dest2Width = canvas.width - dest1Width;

        // Piece 1: Left
        ctx.drawImage(
          img,
          sx, sy, slice1Width, fovHeight,
          0, 0, dest1Width, canvas.height
        );

        // Piece 2: Right (wrapped around)
        ctx.drawImage(
          img,
          0, sy, slice2Width, fovHeight,
          dest1Width, 0, dest2Width, canvas.height
        );
      }

      animationFrameId = requestAnimationFrame(render);
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [imageSrc, autoplay]);

  // Drag interaction handlers
  const handleStart = (clientX: number, clientY: number) => {
    const state = stateRef.current;
    state.isDragging = true;
    state.isIdle = false;
    state.startX = clientX;
    state.startY = clientY;
    
    // Clear idle timer
    if (state.idleTimer) clearTimeout(state.idleTimer);
  };

  const handleMove = (clientX: number, clientY: number) => {
    const state = stateRef.current;
    if (!state.isDragging) return;

    const dx = clientX - state.startX;
    const dy = clientY - state.startY;

    // Scale movements based on resolution
    const scaleFactor = 0.8;
    state.xOffset -= dx * scaleFactor;
    state.yOffset += dy * scaleFactor;

    // Track speed for inertia calculation on release
    state.inertiaX = -dx * 0.15;

    state.startX = clientX;
    state.startY = clientY;
  };

  const handleEnd = () => {
    const state = stateRef.current;
    state.isDragging = false;

    // Reset idle timer (resume auto-rotate after 3.5s of no user action)
    state.idleTimer = window.setTimeout(() => {
      stateRef.current.isIdle = true;
    }, 3500);
  };

  // Mouse Events
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  };

  const onMouseUpOrLeave = () => {
    handleEnd();
  };

  // Touch Events (Mobile)
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handleStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const onTouchEnd = () => {
    handleEnd();
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full overflow-hidden bg-bg-midnight rounded-3xl border border-border-gold/30 shadow-2xl cursor-grab active:cursor-grabbing ${heightClass}`}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUpOrLeave}
      onMouseLeave={onMouseUpOrLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-midnight/90 backdrop-blur-md z-10 gap-3">
          <RotateCw className="w-8 h-8 text-gold-primary animate-spin" />
          <span className="text-xs text-text-muted font-bold">جاري تحميل المعاينة البانورامية...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-midnight/90 z-10 gap-3 text-center px-4">
          <span className="text-sm font-bold text-status-sold">فشل تحميل الصورة البانورامية</span>
          <span className="text-xs text-text-muted max-w-xs">تأكد من وجود صورة بانورامية equirectangular صالحة للتحميل.</span>
        </div>
      )}

      {/* Control UI Hint overlay */}
      {!isLoading && !error && (
        <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2 bg-bg-midnight/60 backdrop-blur-md border border-border-gold/20 py-1.5 px-3 rounded-full pointer-events-none select-none">
          <Move className="w-3.5 h-3.5 text-gold-primary" />
          <span className="text-[10px] text-text-secondary font-bold">اسحب بالماوس أو الإصبع للمشاهدة 360°</span>
        </div>
      )}
    </div>
  );
}
