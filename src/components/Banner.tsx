import Image from 'next/image'

interface BannerProps {
  theme: 'LIGHT' | 'DARK'
  avatarUrl?: string | null
  initials?: string
}

export default function Banner({ theme, avatarUrl, initials }: BannerProps) {
  const bgColor = theme === 'LIGHT' ? 'bg-white' : 'bg-black'

  return (
    <div className={`relative h-full w-full overflow-hidden ${bgColor}`}>
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt="Profile cover"
          fill
          className="object-cover"
          unoptimized
        />
      ) : (
        /* Fallback gradient when no avatar */
        <div className={`absolute inset-0 bg-gradient-to-br ${
          theme === 'LIGHT' 
            ? 'from-purple-100 via-pink-50 to-white' 
            : 'from-purple-900/40 via-pink-900/20 to-black'
        }`}>
          {initials && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-9xl font-bold opacity-10 ${
                theme === 'LIGHT' ? 'text-purple-300' : 'text-purple-500'
              }`}>
                {initials}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

