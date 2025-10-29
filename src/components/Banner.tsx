import Image from 'next/image'

interface BannerProps {
  src?: string
  theme: 'LIGHT' | 'DARK'
}

export default function Banner({ src, theme }: BannerProps) {
  const gradientColor = theme === 'LIGHT' ? 'to-white' : 'to-black'
  const bgColor = theme === 'LIGHT' ? 'bg-white' : 'bg-black'

  return (
    <div className={`relative h-full w-full overflow-hidden ${bgColor}`}>
      {src && (
        <Image
          src={src}
          alt="Banner"
          fill
          className="object-cover"
          unoptimized
        />
      )}
      {/* Gradient overlay to fade into base color - starts transparent at top, fades to base color at bottom */}
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent ${gradientColor}`}
      />
    </div>
  )
}

