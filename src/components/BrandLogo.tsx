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

  return (
    <div className={`inline-flex items-center gap-2 sm:gap-2.5 group select-none ${className}`.trim()}>
      {/* Metallic Silver Geometric D Logo Icon */}
      <div className={`${iconSizes[size]} relative flex-shrink-0 transition-transform duration-300 group-hover:scale-105`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_2px_12px_rgba(255,255,255,0.18)]"
        >
          <defs>
            {/* Primary Brushed Steel / Silver Gradient */}
            <linearGradient id="silverPlate" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="25%" stopColor="#E2E4E8" />
              <stop offset="48%" stopColor="#A8ACB4" />
              <stop offset="72%" stopColor="#D5D9E0" />
              <stop offset="100%" stopColor="#8C9099" />
            </linearGradient>

            {/* Top Bevel Highlight */}
            <linearGradient id="silverHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#E6E8EC" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#9CA0A8" stopOpacity="0.3" />
            </linearGradient>

            {/* Inner Darker Steel Shadow */}
            <linearGradient id="steelShadow" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5B5F66" />
              <stop offset="50%" stopColor="#7E828A" />
              <stop offset="100%" stopColor="#BAC0CA" />
            </linearGradient>

            {/* Droplet Highlight */}
            <linearGradient id="dropletGradient" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#E0E3E8" />
              <stop offset="100%" stopColor="#9EA3AC" />
            </linearGradient>
          </defs>

          {/* Base Geometric 'D' Shape with cutout for the droplet */}
          <path
            d="M20 18 L60 18 C78 18 90 29 90 50 C90 71 78 82 60 82 L20 82 L20 54 L34 54 L34 70 L58 70 C69 70 76 63 76 50 C76 37 69 30 58 30 L34 30 L34 40 L20 40 Z"
            fill="url(#silverPlate)"
          />

          {/* Upper Wing / Bevel Cut */}
          <path
            d="M10 28 L20 18 L60 18 C75 18 85 27 88 44 L78 40 C75 32 68 28 58 28 L30 28 L20 38 Z"
            fill="url(#silverHighlight)"
            opacity="0.8"
          />

          {/* Lower Shadow Edge */}
          <path
            d="M20 74 L20 82 L60 82 C78 82 90 71 90 50 C90 48 89.8 46 89.5 44 C88 66 76 74 58 74 Z"
            fill="url(#steelShadow)"
            opacity="0.6"
          />

          {/* Droplet Icon in Center Void */}
          {/* Sits at (50, 48) inside the D */}
          <path
            d="M50 36 C50 36 43 45 43 51 C43 55.4 46.1 59 50 59 C53.9 59 57 55.4 57 51 C57 45 50 36 50 36 Z"
            fill="url(#dropletGradient)"
          />
        </svg>
      </div>

      {/* Wordmark */}
      {showWordmark && (
        <span
          className={`font-display font-extrabold tracking-tight text-white ${textSizes[size]} ${wordmarkClassName}`}
          style={{ letterSpacing: '-0.03em' }}
        >
          Drop<span className="text-[#C0C0C0]">Kulture</span>
        </span>
      )}
    </div>
  );
};
