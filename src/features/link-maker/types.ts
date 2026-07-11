export interface LinkItem {
  id: string
  title: string
  url: string
  icon?: string // Lucide icon name
  bg?: string // custom background override
  text?: string // custom text color override
  animation?: 'none' | 'bounce' | 'pulse' | 'wiggle' | 'glow' | 'shake'
  isEnabled: boolean
}

export interface SocialItem {
  platform: string // e.g., github, linkedin, twitter, instagram, youtube, facebook, whatsapp, email, phone
  url: string
  isEnabled: boolean
}

export interface ThemeConfig {
  preset: 'aura-flow' | 'sunset-horizon' | 'midnight-glow' | 'cyber-neo' | 'minimal-silk' | 'custom'
  customBg?: string // solid hex or gradient css
  bgType?: 'solid' | 'gradient' | 'image'
  fontFamily?: 'font-sans' | 'font-serif' | 'font-mono' | 'font-display'
  buttonStyle?: 'solid' | 'outline' | 'glass' | 'neon' | 'brutalism'
  buttonShape?: 'square' | 'rounded' | 'pill'
  appTheme?: 'light' | 'dark' | 'system'
  appColorTheme?: string
}

export interface ProfileConfig {
  name: string
  bio: string
  avatarUrl?: string
}

export interface LinkTreeConfig {
  profile: ProfileConfig
  links: LinkItem[]
  socials: SocialItem[]
  theme: ThemeConfig
}

export interface Project {
  id: string
  name: string
  updatedAt: string
  config: LinkTreeConfig
  shortUrl?: string
  shortUrlSuffix?: string
  expiresAt?: string
}

