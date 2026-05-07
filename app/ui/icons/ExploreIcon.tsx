type ExploreIconProps = {
  size?: number
  className?: string
}

export function ExploreIcon({ size = 24, className = '' }: ExploreIconProps) {
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
        <linearGradient id="exp-tile-bg" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#FDEEED" />
          <stop offset="100%" stopColor="#F0D5D2" />
        </linearGradient>
        <filter id="exp-tile-shadow" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#C8A09C" floodOpacity="0.28" />
        </filter>
        <filter id="exp-icon-emboss" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#8B6260" floodOpacity="0.55" />
        </filter>
      </defs>

      {/* Frosted glass tile */}
      <rect x="3" y="3" width="94" height="94" rx="22"
        fill="url(#exp-tile-bg)"
        stroke="rgba(200,155,150,0.35)"
        strokeWidth="1.5"
        filter="url(#exp-tile-shadow)"
      />
      {/* Frosted sheen — top highlight */}
      <rect x="8" y="5" width="84" height="32" rx="16"
        fill="white" fillOpacity="0.18"
      />

      {/* Compass star — embossed */}
      <g filter="url(#exp-icon-emboss)">
        {/* Outer ring */}
        <circle cx="50" cy="50" r="32" stroke="#B8837F" strokeWidth="1.8" />

        {/* Cardinal points — solid filled (N, E, S, W) */}
        <path d="M50,18 L54,35 L50,50 L46,35Z" fill="#C49A96" />
        <path d="M82,50 L65,54 L50,50 L65,46Z" fill="#C49A96" />
        <path d="M50,82 L46,65 L50,50 L54,65Z" fill="#C49A96" />
        <path d="M18,50 L35,46 L50,50 L35,54Z" fill="#C49A96" />

        {/* Diagonal points — slightly lighter (NE, SE, SW, NW) */}
        <path d="M73,27 L63,40 L50,50 L60,37Z" fill="#C49A96" fillOpacity="0.72" />
        <path d="M73,73 L60,63 L50,50 L63,60Z" fill="#C49A96" fillOpacity="0.72" />
        <path d="M27,73 L37,60 L50,50 L40,63Z" fill="#C49A96" fillOpacity="0.72" />
        <path d="M27,27 L40,37 L50,50 L37,40Z" fill="#C49A96" fillOpacity="0.72" />

        {/* Inner ring */}
        <circle cx="50" cy="50" r="11" stroke="#B8837F" strokeWidth="1.4" />

        {/* Center dot */}
        <circle cx="50" cy="50" r="2.8" fill="#C49A96" />
      </g>
    </svg>
  )
}
