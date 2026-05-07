type IconProps = {
  size?: number
  color?: string
  className?: string
}

export function CommunityIcon({ size = 24, color = 'currentColor', className = '' }: IconProps) {
  const clipId = 'yarn-clip'

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
        <clipPath id={clipId}>
          <circle cx="50" cy="50" r="40" />
        </clipPath>
      </defs>

      {/* Ball outline */}
      <circle cx="50" cy="50" r="40" stroke={color} strokeWidth="2.2" />

      {/* Winding lines — all clipped inside the circle */}
      <g clipPath={`url(#${clipId})`} stroke={color} strokeWidth="1.6" strokeLinecap="round">
        {/* Diagonal lines going lower-left → upper-right */}
        <path d="M14,72 C28,60, 50,52, 72,48 C82,46, 88,42, 90,36" fill="none" />
        <path d="M10,56 C24,46, 48,38, 74,34 C84,32, 90,28, 90,22" fill="none" />
        <path d="M16,86 C30,74, 54,66, 78,62 C86,60, 90,56, 88,50" fill="none" />

        {/* Diagonal lines going upper-left → lower-right */}
        <path d="M28,12 C34,28, 40,50, 38,72 C37,82, 40,88, 46,90" fill="none" />
        <path d="M48,10 C54,26, 60,50, 58,72 C57,82, 60,88, 66,90" fill="none" />
        <path d="M68,12 C72,28, 76,50, 72,72 C70,82, 72,88, 78,88" fill="none" />

        {/* Curving cross lines for depth */}
        <path d="M12,36 C26,42, 50,44, 74,40 C84,38, 90,42, 88,50" fill="none" />
        <path d="M18,20 C32,28, 54,32, 76,28 C86,26, 90,30, 88,38" fill="none" />
      </g>

      {/* Loose yarn tail coming off the ball */}
      <path
        d="M88,36 C94,28, 96,20, 90,14"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
