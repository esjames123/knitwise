type CommunityIconProps = {
  size?: number
  className?: string
}

export function CommunityIcon({ size = 24, className = '' }: CommunityIconProps) {
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
        <linearGradient id="com-tile-bg" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#FDEEED" />
          <stop offset="100%" stopColor="#F0D5D2" />
        </linearGradient>
        <filter id="com-tile-shadow" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#C8A09C" floodOpacity="0.28" />
        </filter>
        <filter id="com-icon-emboss" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#8B6260" floodOpacity="0.55" />
        </filter>
        <clipPath id="com-yarn-clip">
          <circle cx="50" cy="50" r="30" />
        </clipPath>
      </defs>

      {/* Frosted glass tile */}
      <rect x="3" y="3" width="94" height="94" rx="22"
        fill="url(#com-tile-bg)"
        stroke="rgba(200,155,150,0.35)"
        strokeWidth="1.5"
        filter="url(#com-tile-shadow)"
      />
      <rect x="8" y="5" width="84" height="32" rx="16"
        fill="white" fillOpacity="0.18"
      />

      {/* Yarn ball — embossed */}
      <g filter="url(#com-icon-emboss)">
        {/* Ball outline */}
        <circle cx="50" cy="50" r="30" stroke="#B8837F" strokeWidth="2.2" />

        {/* Winding lines — all clipped inside the ball */}
        <g clipPath="url(#com-yarn-clip)" stroke="#B8837F" strokeLinecap="round" fill="none">
          {/* Lower-left → upper-right sweeping curves */}
          <path d="M24,67 C35,56, 50,51, 66,48 C73,46, 78,44, 76,39" strokeWidth="1.7" />
          <path d="M22,56 C33,47, 50,43, 67,40 C74,38, 78,36, 77,31" strokeWidth="1.7" />
          <path d="M26,76 C37,64, 52,58, 68,55 C75,53, 79,52, 77,47" strokeWidth="1.7" />

          {/* Upper-left → lower-right sweeping curves */}
          <path d="M33,23 C37,32, 41,46, 39,59 C38,66, 40,71, 44,73" strokeWidth="1.7" />
          <path d="M48,21 C52,30, 55,45, 53,58 C52,65, 54,70, 58,72" strokeWidth="1.7" />
          <path d="M63,22 C65,32, 67,46, 63,59 C61,66, 62,71, 66,73" strokeWidth="1.7" />

          {/* Horizontal cross bands */}
          <path d="M23,44 C35,41, 50,41, 66,43 C73,44, 77,47, 76,51" strokeWidth="1.7" />
          <path d="M25,34 C37,30, 52,30, 66,33 C73,35, 77,38, 76,42" strokeWidth="1.7" />
        </g>

        {/* Loose yarn tail */}
        <path d="M77,39 C84,30, 86,21, 80,15"
          stroke="#B8837F" strokeWidth="2" strokeLinecap="round"
        />
      </g>
    </svg>
  )
}
