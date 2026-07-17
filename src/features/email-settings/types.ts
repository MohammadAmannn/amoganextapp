export interface EmailAccount {
  id: string
  email: string
  password?: string
  protocol: 'IMAP' | 'POP3'
  incomingServer: string
  incomingPort: number
  outgoingServer: string
  outgoingPort: number
  useSSL: boolean
  useTLS: boolean
  isEnabled: boolean
}

export interface ThemeConfig {
  preset: 'aura-flow' | 'sunset-horizon' | 'midnight-glow' | 'cyber-neo' | 'minimal-silk' | 'custom'
  customBg?: string
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

export interface EmailSettingsConfig {
  profile: ProfileConfig
  accounts: EmailAccount[]
  theme: ThemeConfig
}
