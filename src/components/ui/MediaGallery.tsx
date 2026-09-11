// src/components/ui/MediaGallery.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Camera, Video, ChevronRight, ChevronLeft, Rotate3d } from 'lucide-react';

interface MediaGalleryProps {
  images: string[];
  videos?: string[];
  virtualTour?: string;
  title: string;
}

export default function MediaGallery({ images, videos = [], virtualTour, title }: MediaGalleryProps) {
  const [activeTab, setActiveTab] = useState<'photos' | 'video' | 'tour'>('photos');
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [animateZoom, setAnimateZoom] = useState(false);

  const hasVideo = videos && videos.length > 0;
  const activeVideoUrl = hasVideo ? videos[currentVideoIndex] : null;
  const hasTour = !!virtualTour;

  // Autoplay slideshow for photos
  useEffect(() => {
    if (activeTab !== 'photos' || images.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setCurrentPhotoIndex((prev) => (prev + 1) % images.length);
    }, 6000); // 6 seconds interval matching hero slider

    return () => clearInterval(timer);
  }, [activeTab, images.length, isHovered]);

  // Cinematic zoom transition effect on index change
  useEffect(() => {
    setAnimateZoom(false);
    const zoomTimeout = setTimeout(() => {
      setAnimateZoom(true);
    }, 100);
    return () => clearTimeout(zoomTimeout);
  }, [currentPhotoIndex]);

  const handlePrevImage = () => {
    setCurrentPhotoIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentPhotoIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="h-[60vh] md:h-[80vh] flex flex-col bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xl">
      {/* Media Switcher Header */}
      <div className="flex border-b border-gray-200 bg-gray-50/80 p-2 gap-2 shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('photos')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer font-cairo ${
            activeTab === 'photos'
              ? 'bg-[#111315] text-white border border-[#E6A821] font-extrabold shadow-md'
              : 'text-gray-600 hover:text-brand-black hover:bg-gray-100 border border-transparent'
          }`}
        >
          <Camera className={`w-4 h-4 ${activeTab === 'photos' ? 'text-[#E6A821]' : 'text-gray-500'}`} />
          <span>معرض الصور ({images.length})</span>
        </button>

        {hasVideo && (
          <button
            type="button"
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer font-cairo ${
              activeTab === 'video'
                ? 'bg-[#111315] text-white border border-[#E6A821] font-extrabold shadow-md'
                : 'text-gray-600 hover:text-brand-black hover:bg-gray-100 border border-transparent'
            }`}
          >
            <Video className={`w-4 h-4 ${activeTab === 'video' ? 'text-[#E6A821]' : 'text-gray-500'}`} />
            <span>فيديو العرض</span>
          </button>
        )}

        {hasTour && (
          <button
            type="button"
            onClick={() => setActiveTab('tour')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer font-cairo ${
              activeTab === 'tour'
                ? 'bg-[#111315] text-white border border-[#E6A821] font-extrabold shadow-md'
                : 'text-gray-600 hover:text-brand-black hover:bg-gray-100 border border-transparent'
            }`}
          >
            <Rotate3d className={`w-4 h-4 ${activeTab === 'tour' ? 'text-[#E6A821]' : 'text-gray-500'}`} />
            <span>جولة افتراضية 3D</span>
          </button>
        )}
      </div>

      {/* Media Display Container */}
      <div 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative flex-1 min-h-0 bg-black/40 overflow-hidden"
      >
        {activeTab === 'photos' ? (
          <div className="relative w-full h-full">
            {images.map((img, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentPhotoIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                <Image
                  src={img}
                  alt={`${title} - صورة ${index + 1}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority={index === 0}
                  className={`object-cover transition-transform duration-[6500ms] ease-luxury ${
                    index === currentPhotoIndex && animateZoom ? 'scale-[1.08]' : 'scale-100'
                  }`}
                />
              </div>
            ))}
          </div>
        ) : activeTab === 'video' ? (
          <div className="w-full h-full bg-black flex items-center justify-center relative z-20">
            {activeVideoUrl && (
              <video
                src={activeVideoUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            )}
          </div>
        ) : (
          <div className="w-full h-full bg-black flex items-center justify-center relative z-20">
            {virtualTour && (
              <iframe
                src={virtualTour}
                className="w-full h-full border-0"
                allowFullScreen
                allow="xr-spatial-tracking; gyroscope; accelerometer"
                title={`الجولة الافتراضية 3D لـ ${title}`}
              />
            )}
          </div>
        )}

        {/* Left/Right Control Arrows */}
        {activeTab === 'photos' && images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrevImage}
              aria-label="الصورة السابقة"
              className="absolute top-1/2 -translate-y-1/2 start-4 p-2.5 rounded-full bg-white/95 hover:bg-[#111315] text-brand-black hover:text-[#E6A821] border border-gray-200 hover:border-[#E6A821] shadow-lg transition-all duration-300 cursor-pointer z-20"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNextImage}
              aria-label="الصورة التالية"
              className="absolute top-1/2 -translate-y-1/2 end-4 p-2.5 rounded-full bg-white/95 hover:bg-[#111315] text-brand-black hover:text-[#E6A821] border border-gray-200 hover:border-[#E6A821] shadow-lg transition-all duration-300 cursor-pointer z-20"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Image Counter Label */}
        {activeTab === 'photos' && (
          <div className="absolute bottom-4 start-4 bg-[#111315]/85 px-3 py-1.5 rounded-lg border border-[#E6A821]/40 text-[10px] sm:text-xs text-white font-bold z-20 font-mono shadow-sm">
            {currentPhotoIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails list */}
      {activeTab === 'photos' && images.length > 1 && (
        <div className="p-3 bg-gray-50 border-t border-gray-200 flex items-center gap-3 overflow-x-auto custom-scrollbar shrink-0">
          {images.map((img, idx) => {
            const isSelected = idx === currentPhotoIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentPhotoIndex(idx)}
                className={`relative w-20 sm:w-24 aspect-[16/10] rounded-xl overflow-hidden shrink-0 border-2 transition-all duration-300 cursor-pointer ${
                  isSelected ? 'border-[#E6A821] scale-105 shadow-md shadow-black/20' : 'border-gray-200 opacity-60 hover:opacity-100'
                }`}
              >
                <Image
                  src={img}
                  alt="صورة مصغرة للمشروع"
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Video Thumbnails */}
      {activeTab === 'video' && videos.length > 1 && (
        <div className="p-3 bg-gray-50 border-t border-gray-200 flex items-center gap-3 overflow-x-auto custom-scrollbar shrink-0">
          {videos.map((vid, idx) => {
            const isSelected = idx === currentVideoIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentVideoIndex(idx)}
                className={`relative w-20 sm:w-24 aspect-[16/10] rounded-xl overflow-hidden shrink-0 border-2 transition-all duration-300 cursor-pointer flex items-center justify-center bg-gray-100 ${
                  isSelected ? 'border-[#E6A821] scale-105 shadow-md shadow-black/20' : 'border-gray-200 opacity-60 hover:opacity-100'
                }`}
              >
                <Video className="w-6 h-6 text-[#E6A821]" />
                <span className="absolute bottom-1 right-1 bg-[#111315]/90 text-[9px] text-white px-1.5 py-0.5 rounded font-mono font-bold">
                  فيديو {idx + 1}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
