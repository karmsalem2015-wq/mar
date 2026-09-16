'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Property, Project } from '@/lib/mockData';
import { getHomePropertyStats, getHomePropertiesPage, getProjectsListAdmin } from '@/app/actions/properties';
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
  const HOME_BATCH = 12;
  const [dbProperties, setDbProperties] = useState<Property[]>([]);
  const [dbProjects, setDbProjects] = useState<Project[]>([]);
  const [totalPropertyCount, setTotalPropertyCount] = useState(0);
  const [cityPropertyCounts, setCityPropertyCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState<boolean>(USE_DATABASE);
  const [isLoadingRemainingProperties, setIsLoadingRemainingProperties] = useState(false);
  const loadingPageRef = useRef(false);

  useEffect(() => {
    if (!USE_DATABASE) return;
    let cancelled = false;
    // Count is deliberately independent of row/media loading.
    getHomePropertyStats().then(stats => { if (!cancelled) { setTotalPropertyCount(stats.total); setCityPropertyCounts(stats.cityCounts); } });

    let started = false;
    async function loadInitialData() {
      if (started || cancelled) return;
      started = true;
      try {
        const [rows, projects] = await Promise.all([getHomePropertiesPage(0, HOME_BATCH), getProjectsListAdmin()]);
        if (cancelled) return;
        setDbProperties((rows || []).map(normalizeProperty));
        setDbProjects((projects || []).map(normalizeProject));
      } catch (e) {
        console.error('Error loading home data:', e);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    const contentStart = document.getElementById('content-start');
    let observer: IntersectionObserver | undefined;
    if (contentStart && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) { loadInitialData(); observer?.disconnect(); }
      }, { rootMargin: '700px 0px' });
      observer.observe(contentStart);
    } else {
      loadInitialData();
    }
    const fallback = window.setTimeout(loadInitialData, 12000);
    return () => { cancelled = true; observer?.disconnect(); window.clearTimeout(fallback); };
  }, []);

  const loadMoreProperties = async () => {
    if (!USE_DATABASE || loadingPageRef.current || dbProperties.length >= totalPropertyCount) return;
    loadingPageRef.current = true;
    setIsLoadingRemainingProperties(true);
    try {
      const rows = await getHomePropertiesPage(dbProperties.length, HOME_BATCH);
      const normalized: Property[] = (rows || []).map(normalizeProperty);
      setDbProperties(prev => {
        const ids = new Set(prev.map(p => p.id));
        return [...prev, ...normalized.filter(p => !ids.has(p.id))];
      });
    } finally {
      loadingPageRef.current = false;
      setIsLoadingRemainingProperties(false);
    }
  };

  // Filter States
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedRooms, setSelectedRooms] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const openInquiry = useInquiryStore((state) => state.open);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
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
        cityCounts={cityPropertyCounts}
        isLoading={false}
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
        loadedPropertyCount={dbProperties.length}
        onLoadMore={loadMoreProperties}
        hasMore={dbProperties.length < totalPropertyCount}
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
