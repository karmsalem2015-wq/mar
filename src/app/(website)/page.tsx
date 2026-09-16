'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Property, Project } from '@/lib/mockData';
import { getPropertiesListAdmin, getProjectsListAdmin } from '@/app/actions/properties';
import { USE_DATABASE } from '@/config/brand';
import { normalizeProperty, normalizeProject } from '@/lib/normalizers';
import { useInquiryStore } from '@/store/useInquiryStore';

import HeroSection from '@/components/home/HeroSection';
import SearchBarSection from '@/components/home/SearchBarSection';
import CitiesSection from '@/components/home/CitiesSection';
import PropertyListingsSection from '@/components/home/PropertyListingsSection';
import ProjectHighlightSection from '@/components/home/ProjectHighlightSection';
import RequestPropertyBanner from '@/components/home/RequestPropertyBanner';
import VirtualTourSection from '@/components/home/VirtualTourSection';
import WhyUsSection from '@/components/home/WhyUsSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import PartnersMarquee from '@/components/home/PartnersMarquee';
import ContactFormSection from '@/components/home/ContactFormSection';

export default function HomePage() {
  const INITIAL_HOME_BATCH = 50;
  const [dbProperties, setDbProperties] = useState<Property[]>([]);
  const [dbProjects, setDbProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(USE_DATABASE);
  const [isLoadingRemainingProperties, setIsLoadingRemainingProperties] = useState<boolean>(USE_DATABASE);
  const [loadedPropertyCount, setLoadedPropertyCount] = useState<number>(0);
  const remainingPropertiesRef = useRef<Property[] | null>(null);

  useEffect(() => {
    if (!USE_DATABASE) return;
    let cancelled = false;
    let started = false;
    async function loadData() {
      try {
        const [propsData, projsData] = await Promise.all([
          getPropertiesListAdmin(),
          getProjectsListAdmin()
        ]);
        if (cancelled) return;
        if (propsData && propsData.length > 0) {
          const normalizedProperties = propsData.map(normalizeProperty);
          const firstBatch = normalizedProperties.slice(0, INITIAL_HOME_BATCH);
          setDbProperties(firstBatch);
          setLoadedPropertyCount(firstBatch.length);

          // Network work is already finished here. Commit the full result shortly after
          // the initial lightweight paint so the listings never remain stuck at 50.
          remainingPropertiesRef.current = normalizedProperties;
          window.setTimeout(() => {
            if (cancelled || !remainingPropertiesRef.current) return;
            setDbProperties(remainingPropertiesRef.current);
            setLoadedPropertyCount(remainingPropertiesRef.current.length);
            setIsLoadingRemainingProperties(false);
            remainingPropertiesRef.current = null;
          }, 250);
        } else {
          setDbProperties([]);
          setLoadedPropertyCount(0);
          setIsLoadingRemainingProperties(false);
        }
        if (projsData && projsData.length > 0) {
          setDbProjects(projsData.map(normalizeProject));
        } else {
          setDbProjects([]);
        }
      } catch (e) {
        console.error("Error loading home page database data:", e);
        setDbProperties([]);
        setLoadedPropertyCount(0);
        setIsLoadingRemainingProperties(false);
        setDbProjects([]);
      } finally {
        setIsLoading(false);
      }
    }
    const startDataLoad = () => {
      if (started || cancelled) return;
      started = true;
      loadData();
    };

    // Keep the hero's frame decoding and scroll scrub isolated from Supabase/data work.
    // Diagnostic test: do not fetch until content-start actually enters the viewport, isolating hero performance from database work.
    const contentStart = document.getElementById('content-start');
    let observer: IntersectionObserver | undefined;
    if (contentStart && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          startDataLoad();
          observer?.disconnect();
        }
      }, { rootMargin: '0px 0px' });
      observer.observe(contentStart);
    }

    const fallbackTimer = window.setTimeout(startDataLoad, 30000);
    return () => {
      cancelled = true;
      observer?.disconnect();
      window.clearTimeout(fallbackTimer);
    };
  }, []);

  useEffect(() => {
    if (!USE_DATABASE) return;
    const listings = document.getElementById('listings-section');
    if (!listings || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      const remaining = remainingPropertiesRef.current;
      if (remaining) {
        setDbProperties(remaining);
        setLoadedPropertyCount(remaining.length);
        setIsLoadingRemainingProperties(false);
        remainingPropertiesRef.current = null;
      }
      observer.disconnect();
    }, { rootMargin: '1400px 0px' });
    observer.observe(listings);
    return () => observer.disconnect();
  }, []);

  // Filter States
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedRooms, setSelectedRooms] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const openInquiry = useInquiryStore((state) => state.open);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const remaining = remainingPropertiesRef.current;
    if (remaining) {
      setDbProperties(remaining);
      setLoadedPropertyCount(remaining.length);
      setIsLoadingRemainingProperties(false);
      remainingPropertiesRef.current = null;
    }
    const listingsSection = document.getElementById('listings-section');
    listingsSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredProperties = useMemo(() => {
    return dbProperties.filter(property => {
      const cityMatch = selectedCity === 'all' || property.location.city === selectedCity;

      let typeMatch = true;
      if (selectedType !== 'all') {
        if (selectedType === 'flat') typeMatch = property.type === 'apartment';
        else if (selectedType === 'villa') typeMatch = property.type === 'villa';
        else if (selectedType === 'roof') typeMatch = property.type === 'annex' || property.type === 'penthouse';
        else if (selectedType === 'investment') typeMatch = property.featured;
      }

      const roomsMatch = selectedRooms === 'all' || property.specs.bedrooms.toString() === selectedRooms;
      const priceMatch = maxPrice === 'all' || property.pricing.price <= Number(maxPrice);

      const queryNormalized = searchQuery.trim().toLowerCase();
      const textMatch = queryNormalized === '' ||
        property.title.toLowerCase().includes(queryNormalized) ||
        property.location.district.toLowerCase().includes(queryNormalized) ||
        property.location.city.toLowerCase().includes(queryNormalized) ||
        property.project.name.toLowerCase().includes(queryNormalized);

      return cityMatch && typeMatch && roomsMatch && priceMatch && textMatch;
    });
  }, [dbProperties, selectedCity, selectedType, selectedRooms, maxPrice, searchQuery]);

  return (
    <div className="relative min-h-screen bg-bg-midnight text-text-primary font-tajawal" dir="rtl">
      {/* 1. Hero Section (with Mobile-only docked search bar inside) */}
      <HeroSection
        searchBar={
          <SearchBarSection
            mode="docked"
            idPrefix="mobile-"
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            selectedRooms={selectedRooms}
            setSelectedRooms={setSelectedRooms}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            handleSearch={handleSearch}
          />
        }
      />

      {/* 2. Desktop Search Bar Section: Original flow, position, height & timing at the end of the tour */}
      <div id="content-start" className="scroll-mt-24">
        <div className="hidden md:block">
          <SearchBarSection
            mode="flow"
            idPrefix="desktop-"
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            selectedRooms={selectedRooms}
            setSelectedRooms={setSelectedRooms}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            handleSearch={handleSearch}
          />
        </div>
      </div>

      {/* 3. Cities Destinations Grid */}
      <CitiesSection
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        properties={dbProperties}
        isLoading={isLoading}
      />

      {/* 3. Latest Offers & Property Listings */}
      <PropertyListingsSection
        properties={filteredProperties}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        selectedRooms={selectedRooms}
        setSelectedRooms={setSelectedRooms}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        isLoading={isLoading}
        isLoadingRemaining={isLoadingRemainingProperties}
        loadedPropertyCount={loadedPropertyCount}
      />

      {/* 5. Request Property Custom Banner */}
      <RequestPropertyBanner onOpenInquiry={openInquiry} />

      {/* 6. Major Real-Estate Projects Showcase */}
      <ProjectHighlightSection projects={dbProjects} isLoading={isLoading} />

      {/* 7. Interactive 360° Virtual Tour */}
      <VirtualTourSection onOpenInquiry={openInquiry} />

      {/* 8. Contact Form Section */}
      <ContactFormSection />

      {/* 9. Why Us Section */}
      <WhyUsSection />

      {/* 10. Testimonials Carousel */}
      <TestimonialsSection />

      {/* 11. Success Partners Marquee */}
      <PartnersMarquee />
    </div>
  );
}
