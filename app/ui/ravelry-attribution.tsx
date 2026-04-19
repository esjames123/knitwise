import Link from 'next/link'

// Ravelry's brand uses a distinctive red-pink wordmark.
// Using their approximate brand color per their attribution guidelines.
const RAVELRY_RED = '#D15E78'

/** Inline "via Ravelry" credit shown on each pattern card, next to the designer. */
export function RavelryCardCredit() {
  return (
    <a
      href="https://www.ravelry.com"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-0.5 text-xs transition-opacity hover:opacity-80"
      style={{ color: RAVELRY_RED }}
      aria-label="Pattern data via Ravelry"
    >
      via&nbsp;
      <span className="font-semibold">Ravelry</span>
      {/* External link icon */}
      <svg
        width="9" height="9" viewBox="0 0 12 12"
        fill="none" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 2H2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V7" />
        <path d="M8 1h3v3" />
        <path d="M11 1 5.5 6.5" />
      </svg>
    </a>
  )
}

/** Page-level "Powered by Ravelry" footer strip shown below the results grid. */
export function RavelryFooter() {
  return (
    <div
      className="mt-10 flex items-center justify-center gap-2 border-t pt-6 text-xs"
      style={{ borderColor: '#3a3530', color: '#7a6e67' }}
    >
      <span>Pattern data powered by</span>
      <Link
        href="https://www.ravelry.com"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 font-semibold transition-colors hover:opacity-80"
        style={{ color: RAVELRY_RED }}
      >
        {/* Ravelry "R" logomark */}
        <svg
          width="16" height="16" viewBox="0 0 32 32"
          aria-hidden="true"
          role="img"
        >
          <circle cx="16" cy="16" r="16" fill={RAVELRY_RED} />
          <text
            x="16" y="22"
            textAnchor="middle"
            fill="white"
            fontSize="18"
            fontFamily="Georgia, serif"
            fontWeight="bold"
            fontStyle="italic"
          >
            R
          </text>
        </svg>
        Ravelry
      </Link>
    </div>
  )
}
