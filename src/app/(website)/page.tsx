'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { PROPERTIES, PROJECTS, Property, Project } from '@/lib/mockData';
import { getPropertiesListAdmin, getProjectsListAdmin } from '@/app/actions/properties';
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
  const [dbProperties, setDbProperties] = useState<Property[]>([]);
  const [dbProjects, setDbProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [propsData, projsData] = await Promise.all([
          getPropertiesListAdmin(),
          getProjectsListAdmin()
        ]);
        if (propsData && propsData.length > 0) {
          setDbProperties(propsData.map(normalizeProperty));
        } else {
          setDbProperties(PROPERTIES);
        }
        if (projsData && projsData.length > 0) {
          setDbProjects(projsData.map(normalizeProject));
        } else {
          setDbProjects(PROJECTS);
        }
      } catch (e) {
        console.error("Error loading home page database data:", e);
        setDbProperties(PROPERTIES);
        setDbProjects(PROJECTS);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
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
