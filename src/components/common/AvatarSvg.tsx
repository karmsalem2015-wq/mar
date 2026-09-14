import React from 'react';

interface AvatarSvgProps {
  gender?: 'male' | 'female';
  className?: string;
}

export function MaleAvatarSvg({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="goldCharMale" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF3B3" />
          <stop offset="30%" stopColor="#F5C042" />
          <stop offset="70%" stopColor="#E58D1B" />
          <stop offset="100%" stopColor="#B85F08" />
        </linearGradient>
      </defs>

      {/* Head & Neck */}
      <circle cx="32" cy="24" r="9" fill="url(#goldCharMale)" />
      <rect x="29" y="32" width="6" height="6" rx="2" fill="url(#goldCharMale)" />

      {/* Modern Haircut */}
      <path
        d="M21 23C21 14 26 10 32 10C38 10 43 14 43 23C39 19 35 17 31 17C26 17 23 19 21 23Z"
        fill="#FFFCE8"
      />

      {/* Shoulders & Torso */}
      <path
        d="M15 54C15 42 22.5 37 32 37C41.5 37 49 42 49 54"
        fill="url(#goldCharMale)"
      />

      {/* Clean Collar Cutout */}
      <path
        d="M28 37L32 44L36 37"
        stroke="#111315"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FemaleAvatarSvg({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="goldCharFemale" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF3B3" />
          <stop offset="30%" stopColor="#F5C042" />
          <stop offset="70%" stopColor="#E58D1B" />
          <stop offset="100%" stopColor="#B85F08" />
        </linearGradient>
      </defs>

      {/* Hair Bun / Ponytail Accent */}
      <circle cx="41" cy="22" r="5" fill="url(#goldCharFemale)" />

      {/* Head & Neck */}
      <circle cx="32" cy="24" r="8.5" fill="url(#goldCharFemale)" />
      <rect x="29.5" y="31.5" width="5" height="6" rx="2" fill="url(#goldCharFemale)" />

      {/* Front Hair (Side Sweep Bangs) */}
      <path
        d="M22 23C22.5 15 26.5 11 33 11C39 11 42 15 42 22C38.5 17 34.5 15 29 16C25 17 23 19.5 22 23Z"
        fill="#FFFCE8"
      />

      {/* Shoulders & Torso */}
      <path
        d="M16 54C16 43 23 37.5 32 37.5C41 37.5 48 43 48 54"
        fill="url(#goldCharFemale)"
      />

      {/* Feminine Neckline Cutout */}
      <path
        d="M27.5 37.5C27.5 42.5 36.5 42.5 36.5 37.5"
        stroke="#111315"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function AvatarSvg({ gender = 'male', className = 'w-10 h-10' }: AvatarSvgProps) {
  if (gender === 'female') {
    return <FemaleAvatarSvg className={className} />;
  }
  return <MaleAvatarSvg className={className} />;
}
