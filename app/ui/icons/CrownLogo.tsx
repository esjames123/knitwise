type CrownLogoProps = {
  size?: number
  className?: string
  color?: string
}

export function CrownLogo({ size = 120, className = '', color = '#C49A96' }: CrownLogoProps) {
  return (
    <svg
      width={size}
      height={Math.round(size * (210 / 240))}
      viewBox="0 0 240 210"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="crown-g" x1="15%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%" stopColor="#F0D0CE" />
          <stop offset="40%" stopColor={color} />
          <stop offset="100%" stopColor="#7A5250" />
        </linearGradient>
        <filter id="crown-f" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1"   stdDeviation="2"   floodColor={color}   floodOpacity="0.45" />
          <feDropShadow dx="0.5" dy="2" stdDeviation="0.8" floodColor="#5C3A38" floodOpacity="0.3"  />
        </filter>
      </defs>

      <g stroke="url(#crown-g)" strokeLinecap="round" strokeLinejoin="round" fill="none"
         filter="url(#crown-f)">

        {/* ── Base oval band ──────────────────────────────────── */}
        <ellipse cx="120" cy="198" rx="88" ry="11"   strokeWidth="2.5" />
        <ellipse cx="120" cy="198" rx="74" ry="6.5"  strokeWidth="1.2" strokeOpacity="0.5" />

        {/* ── Wing scrolls ────────────────────────────────────── */}
        <path strokeWidth="2.5"
          d="M 36,196 C 26,190, 18,180, 22,170 C 26,160, 36,164, 34,172 C 32,180, 24,178, 26,172" />
        <path strokeWidth="2.5"
          d="M 204,196 C 214,190, 222,180, 218,170 C 214,160, 204,164, 206,172 C 208,180, 216,178, 214,172" />

        {/* ── Left arch — outer strand ────────────────────────── */}
        <path strokeWidth="5.5"
          d="M 36,196
             C 32,172, 28,142, 32,114
             C 36,88, 48,72, 60,64
             C 70,56, 80,54, 82,62
             C 84,70, 78,80, 72,86
             C 66,92, 62,100, 64,112
             C 66,124, 74,138, 78,162
             C 80,176, 82,190, 84,196" />

        {/* ── Left arch — inner crossing strand ───────────────── */}
        <path strokeWidth="5.5"
          d="M 52,196
             C 50,174, 50,150, 54,128
             C 58,106, 66,90, 64,76
             C 62,62, 50,56, 42,62
             C 34,68, 32,82, 36,94
             C 40,106, 48,112, 48,126
             C 48,140, 44,160, 40,180
             L 38,196" />

        {/* ── Left peak loop ──────────────────────────────────── */}
        <ellipse cx="70" cy="57" rx="13" ry="11" strokeWidth="5" />

        {/* ── K vertical stroke ────────────────────────────────── */}
        <path strokeWidth="6"
          d="M 120,192
             C 120,165, 120,138, 120,110
             C 120,82,  120,56,  120,36" />

        {/* ── K upper arm ──────────────────────────────────────── */}
        <path strokeWidth="6"
          d="M 120,118
             C 130,106, 144,90, 158,74
             C 170,62, 178,52, 182,48" />

        {/* ── K lower arm ──────────────────────────────────────── */}
        <path strokeWidth="6"
          d="M 120,118
             C 132,130, 148,146, 164,162
             C 175,173, 183,183, 186,196" />

        {/* ── Right arch — outer strand ───────────────────────── */}
        <path strokeWidth="5.5"
          d="M 204,196
             C 208,172, 212,142, 208,114
             C 204,88, 192,72, 180,64
             C 170,56, 160,54, 158,62
             C 156,70, 162,80, 168,86
             C 174,92, 178,100, 176,112
             C 174,124, 166,138, 162,162
             C 160,176, 158,190, 156,196" />

        {/* ── Right arch — inner crossing strand ──────────────── */}
        <path strokeWidth="5.5"
          d="M 188,196
             C 190,174, 190,150, 186,128
             C 182,106, 174,90, 176,76
             C 178,62, 190,56, 198,62
             C 206,68, 208,82, 204,94
             C 200,106, 192,112, 192,126
             C 192,140, 196,160, 200,180
             L 202,196" />

        {/* ── Right peak loop ─────────────────────────────────── */}
        <ellipse cx="170" cy="57" rx="13" ry="11" strokeWidth="5" />

        {/* ── Center top loop ──────────────────────────────────── */}
        <ellipse cx="120" cy="24" rx="15" ry="13" strokeWidth="5.5" />

        {/* ── Decorative cross-band ────────────────────────────── */}
        <path strokeWidth="3.5" strokeOpacity="0.6"
          d="M 84,148 C 96,144, 108,142, 120,142 C 132,142, 144,144, 156,148" />

        {/* ── Inner arch detail lines ──────────────────────────── */}
        <path strokeWidth="2.8" strokeOpacity="0.45"
          d="M 52,110 C 70,106, 90,104, 108,104" />
        <path strokeWidth="2.8" strokeOpacity="0.45"
          d="M 132,104 C 150,104, 170,106, 188,110" />

      </g>
    </svg>
  )
}
