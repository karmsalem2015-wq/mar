// src/components/admin/AdminSelect.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
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

export default function AdminSelect({
  value,
  onChange,
  options,
  className = '',
  placeholder = 'اختر...',
}: AdminSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative min-w-[160px] ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border border-transparent bg-[var(--neu-depressed)] text-sm text-[var(--neu-text-primary)] hover:border-[var(--neu-gold)]/40 transition-all text-right duration-200 focus:outline-none focus:ring-1 focus:ring-[var(--neu-gold)] ${
          isOpen ? 'border-[var(--neu-gold)]/60 text-[var(--neu-text-primary)]' : ''
        }`}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown
          className={`w-4 h-4 text-[var(--neu-text-muted)] transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[var(--neu-gold)]' : ''
          }`}
        />
      </button>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 rounded-xl border border-[var(--neu-text-muted)]/20 bg-[var(--neu-raised)] shadow-[0_10px_25px_-5px_rgba(165,180,203,0.35),0_8px_16px_-6px_rgba(165,180,203,0.35)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="max-h-60 overflow-y-auto py-1.5 [scrollbar-width:thin] no-scrollbar-track">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full text-right px-4 py-2.5 text-sm transition-all duration-150 flex items-center justify-between ${
                    isSelected
                      ? 'bg-[var(--neu-gold)]/10 text-[var(--neu-gold)] font-medium'
                      : 'text-[var(--neu-text-secondary)] hover:bg-[var(--neu-depressed)] hover:text-[var(--neu-text-primary)]'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--neu-gold)]"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
