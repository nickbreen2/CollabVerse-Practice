import Image from 'next/image'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface BannerProps {
  src?: string
  avatarUrl?: string | null
  initials?: string
  theme: 'LIGHT' | 'DARK'
}

export default function Banner({ src, avatarUrl, initials, theme }: BannerProps) {
  const gradientColor = theme === 'LIGHT' ? 'to-white' : 'to-black'
  const bgColor = theme === 'LIGHT' ? 'bg-white' : 'bg-black'
  
  // Use avatarUrl if provided, otherwise fall back to src
  const imageSrc = avatarUrl || src

  return (
    <div className={`relative h-full w-full overflow-hidden ${bgColor}`} style={{ border: 'none', outline: 'none' }}>
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt="Profile banner"
          fill
          className="object-cover !border-0 border-none"
          style={{
            objectPosition: 'center 30%', // Move image down - shows more of the top
            transform: 'scale(1.3)', // Make image 30% bigger
            transformOrigin: 'center center', // Scale from center
            border: 'none',
            outline: 'none',
            boxShadow: 'none',
          }}
          unoptimized
        />
      ) : initials ? (
        // Fallback to initials if no image
        <div className="absolute inset-0 flex items-center justify-center">
          <Avatar className={`h-48 w-48 border-4 ${theme === 'LIGHT' ? 'border-white/45' : 'border-black/45'}`}>
            <AvatarFallback className="text-6xl font-bold bg-gradient-to-br from-purple-500 to-pink-500 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      ) : null}
      {/* Gradient overlay to fade into base color - starts transparent at top, fades to base color at bottom */}
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent ${gradientColor}`}
      />
    </div>
  )
}

