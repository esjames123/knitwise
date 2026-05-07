type CrownLogoProps = {
  size?: number
  className?: string
}

export function CrownLogo({ size = 120, className = '' }: CrownLogoProps) {
  return (
    <svg
      width={size}
      height={Math.round(size * 0.8)}
      viewBox="0 0 200 160"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="crown-grad" x1="15%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%" stopColor="#F8E0DE" />
          <stop offset="45%" stopColor="#D4A5A0" />
          <stop offset="100%" stopColor="#9E706D" />
        </linearGradient>
        <filter id="crown-glow" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#D4A5A0" floodOpacity="0.5" />
          <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#9E706D" floodOpacity="0.3" />
        </filter>
        <filter id="crown-k-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="1" stdDeviation="2.5" floodColor="#D4A5A0" floodOpacity="0.6" />
        </filter>
      </defs>

      {/* ── Base oval band ─────────────────────────────────── */}
      <ellipse cx="100" cy="150" rx="78" ry="11"
        stroke="url(#crown-grad)" strokeWidth="3"
        filter="url(#crown-glow)"
      />
      <ellipse cx="100" cy="150" rx="66" ry="7"
        stroke="url(#crown-grad)" strokeWidth="1.4" strokeOpacity="0.5"
      />

      {/* ── Left wing scroll ──────────────────────────────── */}
      <path
        d="M28,143 C20,138, 14,130, 18,122 C22,114, 30,118, 28,126 C26,134, 20,132, 22,126"
        stroke="url(#crown-grad)" strokeWidth="2.2" strokeLinecap="round"
        filter="url(#crown-glow)"
      />

      {/* ── Left arch ─────────────────────────────────────── */}
      <path
        d="M32,143 C30,118, 36,86, 50,64 C54,56, 58,50, 56,57"
        stroke="url(#crown-grad)" strokeWidth="2.4" strokeLinecap="round"
        filter="url(#crown-glow)"
      />
      <circle cx="52" cy="45" r="11"
        stroke="url(#crown-grad)" strokeWidth="2.2"
        filter="url(#crown-glow)"
      />
      <path
        d="M56,51 C60,60, 64,82, 68,110 C70,122, 74,136, 78,143"
        stroke="url(#crown-grad)" strokeWidth="2.4" strokeLinecap="round"
        filter="url(#crown-glow)"
      />

      {/* ── Center arch ───────────────────────────────────── */}
      <path
        d="M78,143 C80,128, 86,100, 92,72 C96,54, 98,36, 100,26"
        stroke="url(#crown-grad)" strokeWidth="2.5" strokeLinecap="round"
        filter="url(#crown-glow)"
      />
      <circle cx="100" cy="15" r="13"
        stroke="url(#crown-grad)" strokeWidth="2.4"
        filter="url(#crown-glow)"
      />
      <path
        d="M100,26 C102,36, 104,54, 108,72 C114,100, 120,128, 122,143"
        stroke="url(#crown-grad)" strokeWidth="2.5" strokeLinecap="round"
        filter="url(#crown-glow)"
      />

      {/* ── Right arch ────────────────────────────────────── */}
      <path
        d="M122,143 C126,136, 130,122, 132,110 C136,82, 140,60, 144,51"
        stroke="url(#crown-grad)" strokeWidth="2.4" strokeLinecap="round"
        filter="url(#crown-glow)"
      />
      <circle cx="148" cy="45" r="11"
        stroke="url(#crown-grad)" strokeWidth="2.2"
        filter="url(#crown-glow)"
      />
      <path
        d="M144,57 C142,50, 146,56, 150,64 C164,86, 170,118, 168,143"
        stroke="url(#crown-grad)" strokeWidth="2.4" strokeLinecap="round"
        filter="url(#crown-glow)"
      />

      {/* ── Right wing scroll ─────────────────────────────── */}
      <path
        d="M172,143 C180,138, 186,130, 182,122 C178,114, 170,118, 172,126 C174,134, 180,132, 178,126"
        stroke="url(#crown-grad)" strokeWidth="2.2" strokeLinecap="round"
        filter="url(#crown-glow)"
      />

      {/* ── K monogram ────────────────────────────────────── */}
      <text
        x="100"
        y="128"
        textAnchor="middle"
        fontFamily="'Playfair Display', Georgia, 'Times New Roman', serif"
        fontSize="62"
        fontStyle="italic"
        fontWeight="700"
        fill="url(#crown-grad)"
        filter="url(#crown-k-glow)"
      >
        K
      </text>
    </svg>
  )
}
