import React from 'react';

interface SlothMascotProps {
  size?: number;
  mood?: 'relaxed' | 'thinking' | 'celebrating' | 'sleeping';
  className?: string;
}

export const SlothMascot: React.FC<SlothMascotProps> = ({
  size = 64,
  mood = 'relaxed',
  className = '',
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`inline-block ${className}`}
      aria-label={`LazyDesk Sloth Mascot (${mood})`}
    >
      <defs>
        <linearGradient id={`fur-${mood}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C5A880" />
          <stop offset="100%" stopColor="#9C7A4F" />
        </linearGradient>
        <linearGradient id={`face-${mood}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FBF7EE" />
          <stop offset="100%" stopColor="#EADBCE" />
        </linearGradient>
      </defs>

      {/* Branch */}
      <path d="M 5 85 Q 50 78 95 85" stroke="#5C4033" strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M 85 81 Q 90 70 82 66 Q 76 75 85 81" fill="#40916C" />

      {/* Body */}
      <ellipse cx="50" cy="52" rx="33" ry="27" fill={`url(#fur-${mood})`} />

      {/* Arms holding branch */}
      <path d="M 22 55 Q 20 80 28 85" stroke={`url(#fur-${mood})`} strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M 78 55 Q 80 80 72 85" stroke={`url(#fur-${mood})`} strokeWidth="9" strokeLinecap="round" fill="none" />

      {/* Claws */}
      <path d="M 26 83 L 26 88 M 29 83 L 29 88" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round" />
      <path d="M 71 83 L 71 88 M 74 83 L 74 88" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round" />

      {/* Face mask */}
      <ellipse cx="50" cy="46" rx="21" ry="17" fill={`url(#face-${mood})`} />

      {/* Eye stripes */}
      <path d="M 36 40 Q 42 44 43 51 Q 38 49 35 43 Z" fill="#6B4F35" />
      <path d="M 64 40 Q 58 44 57 51 Q 62 49 65 43 Z" fill="#6B4F35" />

      {/* Eyes based on mood */}
      {mood === 'thinking' && (
        <>
          <circle cx="39" cy="46" r="2.5" fill="#1F2937" />
          <circle cx="61" cy="45" r="2.5" fill="#1F2937" />
          <path d="M 35 40 Q 40 38 43 41" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          {/* Eyeglasses */}
          <circle cx="39" cy="46" r="5" stroke="#2D6A4F" strokeWidth="1.5" fill="none" />
          <circle cx="61" cy="46" r="5" stroke="#2D6A4F" strokeWidth="1.5" fill="none" />
          <line x1="44" y1="46" x2="56" y2="46" stroke="#2D6A4F" strokeWidth="1.5" />
        </>
      )}

      {mood === 'sleeping' && (
        <>
          <line x1="36" y1="46" x2="42" y2="46" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
          <line x1="58" y1="46" x2="64" y2="46" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
          <text x="75" y="32" fill="#52B788" fontSize="12" fontWeight="bold">z</text>
          <text x="82" y="24" fill="#52B788" fontSize="9" fontWeight="bold">z</text>
          <text x="87" y="18" fill="#52B788" fontSize="7" fontWeight="bold">z</text>
        </>
      )}

      {(mood === 'relaxed' || mood === 'celebrating') && (
        <>
          <path d="M 37 45 Q 40 48 42 45" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M 58 45 Q 60 48 63 45" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" fill="none" />
        </>
      )}

      {/* Nose */}
      <ellipse cx="50" cy="51" rx="5.5" ry="3.5" fill="#603813" />

      {/* Smile */}
      <path d="M 46 54 Q 50 57 54 54" stroke="#4A3B32" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Cheeks */}
      <circle cx="34" cy="51" r="3" fill="#F87171" opacity="0.4" />
      <circle cx="66" cy="51" r="3" fill="#F87171" opacity="0.4" />

      {mood === 'celebrating' && (
        <text x="44" y="22" fontSize="18">🎉</text>
      )}
    </svg>
  );
};
