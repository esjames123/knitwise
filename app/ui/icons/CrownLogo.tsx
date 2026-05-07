type CrownLogoProps = {
  size?: number
  className?: string
}

export function CrownLogo({ size = 24, className = '' }: CrownLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/crown-logo.svg"
      alt=""
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    />
  )
}
