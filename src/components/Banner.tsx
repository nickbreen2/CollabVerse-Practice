import Image from 'next/image'

interface BannerProps {
  src?: string
  theme: 'LIGHT' | 'DARK'
}

export default function Banner({ src, theme }: BannerProps) {
  const baseColor = theme === 'LIGHT' ? 'from-white/90' : 'from-black/90'
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
      {/* Gradient overlay to fade into base color */}
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${baseColor} via-transparent/50 to-transparent`}
      />
    </div>
  )
}

