type CrownLogoProps = {
  size?: number
  className?: string
}

export function CrownLogo({ size = 120, className = '' }: CrownLogoProps) {
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
          <stop offset="40%" stopColor="#C49A96" />
          <stop offset="100%" stopColor="#8B6260" />
        </linearGradient>
        {/* Glow applied to the group — gives unified emboss depth across whole crown */}
        <filter id="crown-f" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="2.5" floodColor="#C49A96" floodOpacity="0.5" />
          <feDropShadow dx="1"   dy="3"   stdDeviation="1"   floodColor="#6B4240" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* All crown paths share the same stroke style and glow filter */}
      <g stroke="url(#crown-g)" strokeLinecap="round" strokeLinejoin="round" fill="none"
         filter="url(#crown-f)">

        {/* ── Base oval band ──────────────────────────────────── */}
        <ellipse cx="120" cy="198" rx="88" ry="12" strokeWidth="3" />
        <ellipse cx="120" cy="198" rx="74" ry="7.5" strokeWidth="1.5" strokeOpacity="0.5" />

        {/* ── Wing scrolls at far left and right ─────────────── */}
        <path strokeWidth="2.8"
          d="M 36,196 C 26,190, 18,180, 22,170 C 26,160, 36,164, 34,172 C 32,180, 24,178, 26,172" />
        <path strokeWidth="2.8"
          d="M 204,196 C 214,190, 222,180, 218,170 C 214,160, 204,164, 206,172 C 208,180, 216,178, 214,172" />

        {/* ── Left arch — strand A (outer path of left arch loop) */}
        <path strokeWidth="7"
          d="M 36,196
             C 32,172, 28,142, 32,114
             C 36,88, 48,72, 60,64
             C 70,56, 80,54, 82,62
             C 84,70, 78,80, 72,86
             C 66,92, 62,100, 64,112
             C 66,124, 74,138, 78,162
             C 80,176, 82,190, 84,196" />

        {/* ── Left arch — strand B (inner, crosses A at peak loop) */}
        <path strokeWidth="7"
          d="M 52,196
             C 50,174, 50,150, 54,128
             C 58,106, 66,90, 64,76
             C 62,62, 50,56, 42,62
             C 34,68, 32,82, 36,94
             C 40,106, 48,112, 48,126
             C 48,140, 44,160, 40,180
             L 38,196" />

        {/* ── Left peak loop oval ─────────────────────────────── */}
        <ellipse cx="68" cy="56" rx="14" ry="12" strokeWidth="6" />

        {/* ── K vertical stroke (center ascending strand) ─────── */}
        <path strokeWidth="7"
          d="M 120,192
             C 120,165, 120,138, 120,110
             C 120,82, 120,56, 120,36" />

        {/* ── K upper diagonal arm (toward right peak) ─────────── */}
        <path strokeWidth="7"
          d="M 120,118
             C 130,106, 144,90, 158,74
             C 170,62, 178,52, 182,48" />

        {/* ── K lower diagonal arm (toward base-right) ─────────── */}
        <path strokeWidth="7"
          d="M 120,118
             C 132,130, 148,146, 164,162
             C 175,173, 183,183, 186,196" />

        {/* ── Right arch — strand A (outer, mirror of left A) ──── */}
        <path strokeWidth="7"
          d="M 204,196
             C 208,172, 212,142, 208,114
             C 204,88, 192,72, 180,64
             C 170,56, 160,54, 158,62
             C 156,70, 162,80, 168,86
             C 174,92, 178,100, 176,112
             C 174,124, 166,138, 162,162
             C 160,176, 158,190, 156,196" />

        {/* ── Right arch — strand B (inner, mirror of left B) ──── */}
        <path strokeWidth="7"
          d="M 188,196
             C 190,174, 190,150, 186,128
             C 182,106, 174,90, 176,76
             C 178,62, 190,56, 198,62
             C 206,68, 208,82, 204,94
             C 200,106, 192,112, 192,126
             C 192,140, 196,160, 200,180
             L 202,196" />

        {/* ── Right peak loop oval ─────────────────────────────── */}
        <ellipse cx="172" cy="56" rx="14" ry="12" strokeWidth="6" />

        {/* ── Center top loop ──────────────────────────────────── */}
        <ellipse cx="120" cy="24" rx="16" ry="14" strokeWidth="6.5" />

        {/* ── Decorative cross-band — adds knotwork density ─────── */}
        {/* This horizontal band ties the three arches together visually */}
        <path strokeWidth="4.5" strokeOpacity="0.65"
          d="M 82,148 C 96,144, 108,142, 120,142 C 132,142, 144,144, 158,148" />

        {/* ── Inner cross detail — suggests the weave at arch bodies */}
        <path strokeWidth="3.5" strokeOpacity="0.5"
          d="M 52,110 C 70,106, 90,104, 108,104" />
        <path strokeWidth="3.5" strokeOpacity="0.5"
          d="M 132,104 C 150,104, 170,106, 188,110" />

      </g>
    </svg>
  )
}
