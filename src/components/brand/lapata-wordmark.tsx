import Image from "next/image"
import Link from "next/link"

type Variant = "indigo" | "black" | "white"
type Size = "sm" | "md" | "lg" | "hero"

const files: Record<Variant, string> = {
  indigo: "/brand/lapata-wordmark-indigo.svg",
  black: "/brand/lapata-wordmark-black.svg",
  white: "/brand/lapata-wordmark-white.svg",
}

const widths: Record<Size, number> = {
  sm: 112,
  md: 160,
  lg: 220,
  hero: 280,
}

export function LapataWordmark({
  variant = "indigo",
  size = "md",
  priority,
  className,
  href,
}: {
  variant?: Variant
  size?: Size
  priority?: boolean
  className?: string
  href?: string
}) {
  const w = widths[size]
  // original viewBox 331.2 x 79.8 -> aspect ratio ~4.15
  const h = Math.round(w / 4.15)

  const img = (
    <Image
      src={files[variant]}
      alt="लापता — Lapata"
      width={w}
      height={h}
      priority={priority}
      className={className}
      style={{ height: "auto", width: w }}
    />
  )

  if (href) {
    return (
      <Link href={href} aria-label="Lapata home" className="inline-flex">
        {img}
      </Link>
    )
  }

  return img
}

export function LapataMark({
  variant = "indigo",
  size = 40,
  className,
}: {
  variant?: Variant
  size?: number
  className?: string
}) {
  const file: Record<Variant, string> = {
    indigo: "/brand/lapata-mark-indigo.svg",
    black: "/brand/lapata-mark-black.svg",
    white: "/brand/lapata-mark-white.svg",
  }

  return (
    <Image
      src={file[variant]}
      alt="Lapata mark"
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size }}
    />
  )
}
