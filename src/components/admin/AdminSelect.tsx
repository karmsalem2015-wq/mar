// src/components/admin/AdminSelect.tsx
'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface AdminSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  className?: string;
  placeholder?: string;
}

type MenuPosition = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
};

export default function AdminSelect({
  value,
  onChange,
  options,
  className = '',
  placeholder = 'اختر...',
}: AdminSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const updateMenuPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger || typeof window === 'undefined') return;

    const rect = trigger.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const gutter = 8;
    const gap = 8;
    const desiredHeight = Math.min(options.length * 44 + 12, 240);
    const spaceBelow = viewportHeight - rect.bottom - gutter - gap;
    const spaceAbove = rect.top - gutter - gap;
    const openUpward = spaceBelow < Math.min(desiredHeight, 180) && spaceAbove > spaceBelow;
    const availableHeight = Math.max(120, openUpward ? spaceAbove : spaceBelow);
    const maxHeight = Math.min(240, availableHeight);
    const width = Math.max(rect.width, 160);
    const left = Math.min(
      Math.max(rect.left, gutter),
      Math.max(gutter, viewportWidth - width - gutter),
    );
    const top = openUpward
      ? Math.max(gutter, rect.top - Math.min(desiredHeight, maxHeight) - gap)
      : Math.min(viewportHeight - gutter, rect.bottom + gap);

    setMenuPosition({ top, left, width, maxHeight });
  }, [options.length]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      const clickedTrigger = containerRef.current?.contains(target);
      const clickedMenu = menuRef.current?.contains(target);

      if (!clickedTrigger && !clickedMenu) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setMenuPosition(null);
      return;
    }

    updateMenuPosition();

    const handleViewportChange = () => updateMenuPosition();
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);

    return () => {
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [isOpen, updateMenuPosition]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const dropdown =
    isOpen &&
    menuPosition &&
    typeof document !== 'undefined'
      ? createPortal(
          <div
            ref={menuRef}
            role="listbox"
            dir="rtl"
            className="fixed z-[10000] rounded-xl border border-[var(--neu-text-muted)]/20 bg-[var(--neu-raised)] shadow-[0_18px_45px_-10px_rgba(0,0,0,0.45)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
              width: menuPosition.width,
            }}
          >
            <div
              className="overflow-y-auto py-1.5 [scrollbar-width:thin] no-scrollbar-track"
              style={{ maxHeight: menuPosition.maxHeight }}
            >
              {options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full text-right px-4 py-2.5 text-sm transition-all duration-150 flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-[var(--neu-gold)]/10 text-[var(--neu-gold)] font-medium'
                        : 'text-[var(--neu-text-secondary)] hover:bg-[var(--neu-depressed)] hover:text-[var(--neu-text-primary)]'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--neu-gold)] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div ref={containerRef} className={`relative min-w-[160px] ${className}`}>
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
          className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border border-transparent bg-[var(--neu-depressed)] text-sm text-[var(--neu-text-primary)] hover:border-[var(--neu-gold)]/40 transition-all text-right duration-200 focus:outline-none focus:ring-1 focus:ring-[var(--neu-gold)] ${
            isOpen ? 'border-[var(--neu-gold)]/60 text-[var(--neu-text-primary)]' : ''
          }`}
        >
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
          <ChevronDown
            className={`w-4 h-4 shrink-0 text-[var(--neu-text-muted)] transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-[var(--neu-gold)]' : ''
            }`}
          />
        </button>
      </div>
      {dropdown}
    </>
  );
}
