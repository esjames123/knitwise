type IconProps = {
  size?: number
  color?: string
  className?: string
}

export function LibraryIcon({ size = 24, color = 'currentColor', className = '' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 88"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Left page */}
      <path
        d="M8,72 L8,18 C8,15, 11,13, 14,12.5 L46,10 C48,9.8, 50,11, 50,13 L50,74Z"
        stroke={color}
        strokeWidth="2.2"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Right page */}
      <path
        d="M92,72 L92,18 C92,15, 89,13, 86,12.5 L54,10 C52,9.8, 50,11, 50,13 L50,74Z"
        stroke={color}
        strokeWidth="2.2"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Spine curve at top */}
      <path d="M50,10 C50,10, 50,74, 50,74" stroke={color} strokeWidth="1.5" />

      {/* Bottom page edge with slight perspective */}
      <path d="M8,72 C8,76, 12,78, 16,78 L50,76 L84,78 C88,78, 92,76, 92,72"
        stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Text lines — left page */}
      <line x1="16" y1="23" x2="44" y2="22.3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="15" y1="32" x2="44" y2="31.3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="15" y1="41" x2="44" y2="40.3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="15" y1="50" x2="44" y2="49.3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="15" y1="59" x2="38" y2="58.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />

      {/* Text lines — right page */}
      <line x1="56" y1="22.3" x2="84" y2="23" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="56" y1="31.3" x2="85" y2="32" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="56" y1="40.3" x2="85" y2="41" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="56" y1="49.3" x2="85" y2="50" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="62" y1="58.5" x2="85" y2="59" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
