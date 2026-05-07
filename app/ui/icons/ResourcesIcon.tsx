type IconProps = {
  size?: number
  color?: string
  className?: string
}

export function ResourcesIcon({ size = 24, color = 'currentColor', className = '' }: IconProps) {
  const clipId = 'res-lower-clip'

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
        {/* Clip to lower-right area so link B's front arc redraws on top of link A */}
        <clipPath id={clipId}>
          <polygon points="55,0 100,0 100,100 0,100 0,55" />
        </clipPath>
      </defs>

      {/* Link B — lower-right (drawn first, at back) */}
      <rect
        x="40" y="51" width="50" height="26"
        rx="13"
        transform="rotate(-35, 65, 64)"
        stroke={color}
        strokeWidth="9"
        strokeLinecap="round"
      />

      {/* Link A — upper-left (drawn second, appears in front at top) */}
      <rect
        x="10" y="23" width="50" height="26"
        rx="13"
        transform="rotate(-35, 35, 36)"
        stroke={color}
        strokeWidth="9"
        strokeLinecap="round"
      />

      {/* Redraw lower arc of Link B on top to create true interlock effect */}
      <g clipPath={`url(#${clipId})`}>
        <rect
          x="40" y="51" width="50" height="26"
          rx="13"
          transform="rotate(-35, 65, 64)"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
}
