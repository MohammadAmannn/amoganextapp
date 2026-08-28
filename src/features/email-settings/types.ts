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

export interface SupabaseAccount {
  id: string
  name: string
  supabaseUrl: string
  supabaseAnonKey: string
  bucketName: string
  isEnabled: boolean
  defaultFolder?: string
}

export interface SupabaseStorageConfig {
  supabaseUrl: string
  supabaseAnonKey: string
  bucketName?: string
  isCustomEnabled: boolean
  lastTestedAt?: string
  status?: 'connected' | 'error' | 'untested'
}

export interface AiAccount {
  id: string
  name: string
  model: string
  apiKey: string
  isEnabled: boolean
}

export interface ChatAccount {
  id: string
  name: string
  supabaseUrl: string
  supabaseAnonKey: string
  isEnabled: boolean
}

export interface EmailSettingsConfig {
  profile: ProfileConfig
  accounts: EmailAccount[]
  storageAccounts?: SupabaseAccount[]
  chatAccounts?: ChatAccount[]
  aiAccounts?: AiAccount[]
  theme: ThemeConfig
  storage?: SupabaseStorageConfig
}
