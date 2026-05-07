type CrownLogoProps = {
  size?: number
  color?: string
  className?: string
}

export function CrownLogo({ size = 120, color = '#D4A5A0', className = '' }: CrownLogoProps) {
  return (
    <svg
      width={size}
      height={size * (160 / 200)}
      viewBox="0 0 200 160"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="crown-grad" x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#f8e8e6" />
          <stop offset="40%" stopColor={color} />
          <stop offset="100%" stopColor="#9e706d" />
        </linearGradient>
        <filter id="crown-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor={color} floodOpacity="0.5" />
        </filter>
      </defs>

      {/* ── Base oval band ─────────────────────────────────────── */}
      <ellipse cx="100" cy="150" rx="78" ry="11"
        stroke="url(#crown-grad)" strokeWidth="3"
        filter="url(#crown-glow)" />
      <ellipse cx="100" cy="150" rx="66" ry="7"
        stroke="url(#crown-grad)" strokeWidth="1.4" strokeOpacity="0.55" />

      {/* ── Left wing scroll ───────────────────────────────────── */}
      <path
        d="M 28,143 C 20,138, 14,130, 18,122 C 22,114, 30,118, 28,126 C 26,134, 20,132, 22,126"
        stroke="url(#crown-grad)" strokeWidth="2.2" strokeLinecap="round" fill="none" />

      {/* ── Left arch — rises from base to left peak, loops, returns ── */}
      {/* Ascending left arch */}
      <path
        d="M 32,143 C 30,118, 36,86, 50,64 C 54,56, 58,50, 56,57"
        stroke="url(#crown-grad)" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      {/* Left peak loop */}
      <circle cx="52" cy="44" r="11"
        stroke="url(#crown-grad)" strokeWidth="2.2"
        filter="url(#crown-glow)" />
      {/* Descending left arch back to mid-base */}
      <path
        d="M 56,51 C 60,60, 63,80, 68,108 C 70,120, 74,135, 78,143"
        stroke="url(#crown-grad)" strokeWidth="2.4" strokeLinecap="round" fill="none" />

      {/* ── Center arch — tallest, rises from center base ─────── */}
      {/* Ascending center arch */}
      <path
        d="M 78,143 C 80,128, 86,100, 92,72 C 95,55, 98,36, 100,26"
        stroke="url(#crown-grad)" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      {/* Center peak loop */}
      <circle cx="100" cy="15" r="13"
        stroke="url(#crown-grad)" strokeWidth="2.4"
        filter="url(#crown-glow)" />
      {/* Descending center arch */}
      <path
        d="M 100,26 C 102,36, 105,55, 108,72 C 114,100, 120,128, 122,143"
        stroke="url(#crown-grad)" strokeWidth="2.4" strokeLinecap="round" fill="none" />

      {/* ── Right arch — mirror of left ────────────────────────── */}
      {/* Ascending right arch */}
      <path
        d="M 122,143 C 126,135, 130,120, 132,108 C 137,80, 140,60, 144,51"
        stroke="url(#crown-grad)" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      {/* Right peak loop */}
      <circle cx="148" cy="44" r="11"
        stroke="url(#crown-grad)" strokeWidth="2.2"
        filter="url(#crown-glow)" />
      {/* Descending right arch */}
      <path
        d="M 144,57 C 142,50, 146,56, 150,64 C 164,86, 170,118, 168,143"
        stroke="url(#crown-grad)" strokeWidth="2.4" strokeLinecap="round" fill="none" />

      {/* ── Right wing scroll ──────────────────────────────────── */}
      <path
        d="M 172,143 C 180,138, 186,130, 182,122 C 178,114, 170,118, 172,126 C 174,134, 180,132, 178,126"
        stroke="url(#crown-grad)" strokeWidth="2.2" strokeLinecap="round" fill="none" />

      {/* ── K monogram ────────────────────────────────────────── */}
      <text
        x="100"
        y="128"
        textAnchor="middle"
        fontFamily="'Playfair Display', Georgia, 'Times New Roman', serif"
        fontSize="60"
        fontStyle="italic"
        fontWeight="700"
        fill="url(#crown-grad)"
        filter="url(#crown-glow)"
      >
        K
      </text>
    </svg>
  )
}
