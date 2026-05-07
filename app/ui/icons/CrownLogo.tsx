type CrownLogoProps = {
  size?: number
  className?: string
}

export function CrownLogo({ size = 24, className = '' }: CrownLogoProps) {
  const radius = Math.round(size * 0.22)
  const imgSize = Math.round(size * 0.72)
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: 'linear-gradient(160deg, #FDEEED 0%, #F0D5D2 100%)',
        boxShadow: '0 3px 8px rgba(200,160,156,0.28)',
        border: '1.5px solid rgba(200,155,150,0.35)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/crown-logo.svg"
        alt=""
        width={imgSize}
        height={imgSize}
        aria-hidden="true"
      />
    </div>
  )
}
