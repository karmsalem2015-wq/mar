// src/components/property/UnitsCarousel.tsx
'use client';

import React from 'react';
import RTLContinuousCarousel from '@/components/ui/RTLContinuousCarousel';
import PropertyCard from './PropertyCard';
import { Property } from '@/lib/mockData';

interface UnitsCarouselProps {
  properties: Property[];
}

export default function UnitsCarousel({ properties }: UnitsCarouselProps) {
  if (!properties || properties.length === 0) return null;

  return (
    <div className="w-full py-4 relative">
      <RTLContinuousCarousel gap="gap-5 sm:gap-6">
        {properties.map((prop) => (
          <div
            key={prop.id}
            className="w-[285px] sm:w-[340px] lg:w-[370px] shrink-0 ps-1"
          >
            <PropertyCard property={prop} />
          </div>
        ))}
      </RTLContinuousCarousel>
    </div>
  );
}
