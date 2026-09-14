// src/components/layout/FloatingContact.tsx
'use client';

import React from 'react';
import { BRAND, WHATSAPP_MESSAGE, WHATSAPP_URL } from '@/config/brand';
import type { SiteSettingsData } from '@/app/actions/settings';

interface FloatingContactProps {
  settings?: SiteSettingsData;
}

export default function FloatingContact({ settings }: FloatingContactProps) {
  const unifiedPhone = settings?.contact?.unifiedNumber || BRAND.contact.primaryPhone.display;
  const rawPhoneDigits = unifiedPhone.replace(/[^0-9+]/g, '');
  const phoneUrl = `tel:${rawPhoneDigits.startsWith('+') ? rawPhoneDigits : rawPhoneDigits ? `+966${rawPhoneDigits.replace(/^0/, '')}` : BRAND.contact.primaryPhone.tel}`;

  const rawWhatsapp = settings?.social?.whatsapp || BRAND.contact.primaryPhone.tel;
  const whatsappUrl = rawWhatsapp.startsWith('http')
    ? rawWhatsapp
    : `https://wa.me/${rawWhatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <>
      {/* 1. Official Floating Phone Call Button - Bottom Right */}
      <a
        href={phoneUrl}
        className="group fixed bottom-6 right-6 z-[45] flex size-12 sm:size-14 items-center justify-center rounded-full bg-gradient-to-tr from-[#059669] via-[#10B981] to-[#34D399] text-white shadow-[0_10px_25px_rgba(16,185,129,0.4)] transition-all duration-300 hover:scale-110 hover:shadow-[0_14px_35px_rgba(16,185,129,0.55)] active:scale-95"
        title="اتصال هاتفي مباشر"
        aria-label="اتصال هاتفي مباشر"
      >
        {/* Subtle Ambient Pulse Ring */}
        <span
          className="pointer-events-none absolute -inset-1 rounded-full bg-[#10B981] opacity-25 animate-ping duration-1000"
          aria-hidden="true"
        />

        {/* Official Filled Telephone Handset SVG */}
        <svg
          viewBox="0 0 24 24"
          className="relative z-10 size-6 sm:size-7 fill-white transition-transform duration-300 group-hover:rotate-12"
          aria-hidden="true"
        >
          <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-2.2 2.2a15.053 15.053 0 01-6.59-6.59l2.2-2.21a.96.96 0 00.25-1.01A11.36 11.36 0 018.57 3.9c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.52c0-.55-.45-1-.99-1z" />
        </svg>
      </a>

      {/* 2. Official Floating WhatsApp Button - Bottom Left */}
      <a
        href={whatsappUrl || WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group fixed bottom-6 left-6 z-[45] flex size-12 sm:size-14 items-center justify-center rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-[0_10px_25px_rgba(37,211,102,0.4)] transition-all duration-300 hover:scale-110 hover:shadow-[0_14px_35px_rgba(37,211,102,0.6)] active:scale-95"
        title="محادثة واتساب فورية"
        aria-label="محادثة واتساب فورية"
      >
        {/* Subtle Ambient Pulse Ring */}
        <span
          className="pointer-events-none absolute -inset-1 rounded-full bg-[#25D366] opacity-30 animate-ping duration-1000"
          aria-hidden="true"
        />

        {/* Official WhatsApp Brand SVG */}
        <svg
          viewBox="0 0 24 24"
          className="relative z-10 size-6.5 sm:size-7.5 fill-white transition-transform duration-300 group-hover:scale-105"
          aria-hidden="true"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.454 5.709 1.455h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </>
  );
}
