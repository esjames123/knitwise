type LibraryIconProps = {
  size?: number
  className?: string
}

export function LibraryIcon({ size = 24, className = '' }: LibraryIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="lib-tile-bg" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#FDEEED" />
          <stop offset="100%" stopColor="#F0D5D2" />
        </linearGradient>
        <filter id="lib-tile-shadow" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#C8A09C" floodOpacity="0.28" />
        </filter>
        <filter id="lib-icon-emboss" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#8B6260" floodOpacity="0.55" />
        </filter>
      </defs>

      {/* Frosted glass tile */}
      <rect x="3" y="3" width="94" height="94" rx="22"
        fill="url(#lib-tile-bg)"
        stroke="rgba(200,155,150,0.35)"
        strokeWidth="1.5"
        filter="url(#lib-tile-shadow)"
      />
      <rect x="8" y="5" width="84" height="32" rx="16"
        fill="white" fillOpacity="0.18"
      />

      {/* Open book — embossed */}
      <g filter="url(#lib-icon-emboss)" stroke="#B8837F" strokeLinecap="round" strokeLinejoin="round">
        {/* Left page */}
        <path
          d="M16,78 L16,26 C16,23, 19,21, 22,20 L46,17 C48,16.8, 50,18, 50,20 L50,80Z"
          strokeWidth="2"
          fill="rgba(196,154,150,0.1)"
        />
        {/* Right page */}
        <path
          d="M84,78 L84,26 C84,23, 81,21, 78,20 L54,17 C52,16.8, 50,18, 50,20 L50,80Z"
          strokeWidth="2"
          fill="rgba(196,154,150,0.1)"
        />
        {/* Bottom curved edge — page depth */}
        <path
          d="M16,78 C16,82, 20,84, 24,84 L50,82 L76,84 C80,84, 84,82, 84,78"
          strokeWidth="2"
          fill="none"
        />

        {/* Text lines — left page */}
        <line x1="22" y1="27" x2="44" y2="26.5" strokeWidth="1.6" />
        <line x1="21" y1="35" x2="44" y2="34.5" strokeWidth="1.6" />
        <line x1="21" y1="43" x2="44" y2="42.5" strokeWidth="1.6" />
        <line x1="21" y1="51" x2="44" y2="50.5" strokeWidth="1.6" />
        <line x1="21" y1="59" x2="44" y2="58.5" strokeWidth="1.6" />
        <line x1="21" y1="67" x2="39" y2="66.8" strokeWidth="1.6" />

        {/* Text lines — right page */}
        <line x1="56" y1="26.5" x2="78" y2="27" strokeWidth="1.6" />
        <line x1="56" y1="34.5" x2="79" y2="35" strokeWidth="1.6" />
        <line x1="56" y1="42.5" x2="79" y2="43" strokeWidth="1.6" />
        <line x1="56" y1="50.5" x2="79" y2="51" strokeWidth="1.6" />
        <line x1="56" y1="58.5" x2="79" y2="59" strokeWidth="1.6" />
        <line x1="61" y1="66.8" x2="79" y2="67" strokeWidth="1.6" />
      </g>
    </svg>
  )
}
