// src/app/(website)/layout.tsx
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import InquiryModal from '@/components/layout/InquiryModal';
import FloatingContact from '@/components/layout/FloatingContact';
import { getSiteSettings } from '@/app/actions/settings';

export default async function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <>
      <Navbar />
      {children}
      <Footer settings={settings} />
      <InquiryModal />
      <FloatingContact settings={settings} />
    </>
  );
}
