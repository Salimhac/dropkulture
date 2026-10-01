import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  wordmarkClassName?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showWordmark = true,
  wordmarkClassName = '',
}) => {
  const iconSizes = {
    sm: 'w-6 h-6 sm:w-7 sm:h-7',
    md: 'w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9',
    lg: 'w-10 h-10 sm:w-12 sm:h-12',
    xl: 'w-12 h-12 sm:w-16 sm:h-16',
  };

  const textSizes = {
    sm: 'text-sm sm:text-base',
    md: 'text-base sm:text-lg md:text-xl',
    lg: 'text-xl sm:text-2xl',
    xl: 'text-2xl sm:text-3xl',
  };

  // Unique IDs so multiple instances don't clash
  const uid = React.useId().replace(/:/g, '');

  return (
    <div className={`inline-flex items-center gap-2 sm:gap-3 group select-none ${className}`.trim()}>
      {/* Metallic Angular "D" Mark */}
      <div className={`${iconSizes[size]} relative flex-shrink-0 transition-transform duration-300 group-hover:scale-105`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_2px_14px_rgba(255,255,255,0.15)]"
        >
          <defs>
            {/* Vertical brushed-silver gradient — light at top, dark at bottom */}
            <linearGradient id={`silver-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FDFDFD" />
              <stop offset="18%" stopColor="#E8EAEE" />
              <stop offset="45%" stopColor="#B8BCC4" />
              <stop offset="70%" stopColor="#8E9299" />
              <stop offset="100%" stopColor="#5A5D63" />
            </linearGradient>

            {/* Bright edge highlight for the top-left angular face */}
            <linearGradient id={`highlight-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#C8CCD3" />
            </linearGradient>

            {/* Droplet gradient — bright top, silver bottom */}
            <linearGradient id={`drop-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="55%" stopColor="#DCDFE4" />
              <stop offset="100%" stopColor="#9AA0A8" />
            </linearGradient>

            {/* Droplet inner crescent highlight */}
            <radialGradient id={`dropShine-${uid}`} cx="35%" cy="60%" r="55%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/*
            Angular "D":
            - Left side: straight vertical bar
            - Top-left: angular cut (diagonal notch)
            - Right side: thick curved bowl
            - Bottom-left: sharp wedge point extending left
          */}
          <path
            d="
              M 14 22
              L 52 22
              C 82 22 92 40 92 55
              C 92 74 80 88 52 88
              L 30 88
              L 44 74
              L 52 74
              C 68 74 76 66 76 55
              C 76 44 68 36 52 36
              L 26 36
              L 14 22
              Z
            "
            fill={`url(#silver-${uid})`}
          />

          {/* Bright top-left angular face */}
          <path
            d="
              M 14 22
              L 52 22
              C 68 22 80 27 86 38
              L 76 40
              C 71 33 62 30 52 30
              L 24 30
              L 14 22
              Z
            "
            fill={`url(#highlight-${uid})`}
            opacity="0.9"
          />

          {/* Sharp bottom-left wedge */}
          <path
            d="
              M 30 88
              L 44 74
              L 40 60
              L 26 74
              Z
            "
            fill={`url(#silver-${uid})`}
            opacity="0.85"
          />

          {/* Droplet — sharp point up, round bottom, centered in counter */}
          <path
            d="
              M 54 42
              C 54 42 47 51 47 58
              C 47 62.4 50.1 66 54 66
              C 57.9 66 61 62.4 61 58
              C 61 51 54 42 54 42
              Z
            "
            fill={`url(#drop-${uid})`}
          />

          {/* Droplet crescent highlight */}
          <path
            d="
              M 54 46
              C 54 46 50 52 50 57
              C 50 60 51.5 62 54 62
              C 52 60 51.5 58 51.5 56.5
              C 51.5 52 54 46 54 46
              Z
            "
            fill={`url(#dropShine-${uid})`}
          />
        </svg>
      </div>

      {/* Wordmark — all-caps, wide-tracking, techno display font */}
      {showWordmark && (
        <span
          className={`font-display font-extrabold uppercase text-white ${textSizes[size]} ${wordmarkClassName}`}
          style={{
            letterSpacing: '0.18em',
            fontStretch: 'expanded',
          }}
        >
          DROP<span className="text-[#C0C0C0]">KULTURE</span>
        </span>
      )}
    </div>
  );
};