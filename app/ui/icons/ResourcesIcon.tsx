type ResourcesIconProps = {
  size?: number
  className?: string
}

export function ResourcesIcon({ size = 24, className = '' }: ResourcesIconProps) {
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
        <linearGradient id="res-tile-bg" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#FDEEED" />
          <stop offset="100%" stopColor="#F0D5D2" />
        </linearGradient>
        <filter id="res-tile-shadow" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#C8A09C" floodOpacity="0.28" />
        </filter>
        <filter id="res-icon-emboss" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#8B6260" floodOpacity="0.55" />
        </filter>
        {/* Clip to lower-right for interlock depth effect */}
        <clipPath id="res-link-front">
          <polygon points="56,0 100,0 100,100 0,100 0,56" />
        </clipPath>
      </defs>

      {/* Frosted glass tile */}
      <rect x="3" y="3" width="94" height="94" rx="22"
        fill="url(#res-tile-bg)"
        stroke="rgba(200,155,150,0.35)"
        strokeWidth="1.5"
        filter="url(#res-tile-shadow)"
      />
      <rect x="8" y="5" width="84" height="32" rx="16"
        fill="white" fillOpacity="0.18"
      />

      {/* Chain links — embossed */}
      <g filter="url(#res-icon-emboss)">
        {/* Link B — lower-right (drawn first, at back) */}
        <rect x="40" y="52" width="28" height="17" rx="8.5"
          transform="rotate(-35, 54, 60.5)"
          stroke="#B8837F" strokeWidth="7" strokeLinecap="round"
        />

        {/* Link A — upper-left (drawn on top — appears in front at top) */}
        <rect x="32" y="31" width="28" height="17" rx="8.5"
          transform="rotate(-35, 46, 39.5)"
          stroke="#B8837F" strokeWidth="7" strokeLinecap="round"
        />

        {/* Redraw lower arc of Link B through clip — creates true interlock */}
        <g clipPath="url(#res-link-front)">
          <rect x="40" y="52" width="28" height="17" rx="8.5"
            transform="rotate(-35, 54, 60.5)"
            stroke="#B8837F" strokeWidth="7" strokeLinecap="round"
          />
        </g>
      </g>
    </svg>
  )
}
