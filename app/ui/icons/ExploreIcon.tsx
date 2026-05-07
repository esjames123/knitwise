type IconProps = {
  size?: number
  color?: string
  className?: string
}

export function ExploreIcon({ size = 24, color = 'currentColor', className = '' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Outer ring */}
      <circle cx="50" cy="50" r="44" stroke={color} strokeWidth="2" />

      {/* Cardinal points — N, E, S, W (solid filled, elongated diamond) */}
      <path d="M50,6 L55,44 L50,50 L45,44Z" fill={color} />
      <path d="M94,50 L56,45 L50,50 L56,55Z" fill={color} />
      <path d="M50,94 L45,56 L50,50 L55,56Z" fill={color} />
      <path d="M6,50 L44,55 L50,50 L44,45Z" fill={color} />

      {/* Diagonal points — NE, SE, SW, NW (thinner, slightly shorter) */}
      <path d="M74.7,25.3 L64.5,39.7 L50,50 L60.3,35.5Z" fill={color} fillOpacity="0.75" />
      <path d="M74.7,74.7 L60.3,64.5 L50,50 L64.5,60.3Z" fill={color} fillOpacity="0.75" />
      <path d="M25.3,74.7 L35.5,60.3 L50,50 L39.7,64.5Z" fill={color} fillOpacity="0.75" />
      <path d="M25.3,25.3 L39.7,35.5 L50,50 L35.5,39.7Z" fill={color} fillOpacity="0.75" />

      {/* Inner ring */}
      <circle cx="50" cy="50" r="16" stroke={color} strokeWidth="1.5" />

      {/* Center dot */}
      <circle cx="50" cy="50" r="4" fill={color} />
    </svg>
  )
}
