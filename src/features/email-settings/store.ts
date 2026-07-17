import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { EmailSettingsConfig, ProfileConfig, EmailAccount, ThemeConfig } from './types'

interface EmailSettingsState {
  config: EmailSettingsConfig
  
  // Profile actions
  updateProfile: (profile: Partial<ProfileConfig>) => void
  
  // Account actions
  addAccount: (account: Omit<EmailAccount, 'id'>) => void
  updateAccount: (id: string, updates: Partial<EmailAccount>) => void
  removeAccount: (id: string) => void
  
  // Theme actions
  updateTheme: (themeUpdates: Partial<ThemeConfig>) => void
  resetConfig: () => void
}

const DEFAULT_CONFIG: EmailSettingsConfig = {
  profile: {
    name: 'Alex Rivera',
    bio: 'Senior UX Architect & Tech Writer | Crafting digital experiences ✨',
    avatarUrl: ''
  },
  accounts: [
    {
      id: '1',
      email: 'user@gmail.com',
      protocol: 'IMAP',
      isEnabled: true,
      incomingServer: 'imap.gmail.com',
      incomingPort: 993,
      outgoingServer: 'smtp.gmail.com',
      outgoingPort: 587,
      useSSL: true,
      useTLS: true,
    },
    {
      id: '2',
      email: 'user@outlook.com',
      protocol: 'IMAP',
      isEnabled: true,
      incomingServer: 'outlook.office365.com',
      incomingPort: 993,
      outgoingServer: 'smtp-mail.outlook.com',
      outgoingPort: 587,
      useSSL: true,
      useTLS: true,
    }
  ],
  theme: {
    preset: 'custom',
    appTheme: 'system',
    appColorTheme: 'zinc'
  }
}

export const useEmailSettingsStore = create<EmailSettingsState>()(
  persist(
    (set) => ({
      config: DEFAULT_CONFIG,

      updateProfile: (profileUpdates) =>
        set((state) => ({
          config: {
            ...state.config,
            profile: {
              ...state.config.profile,
              ...profileUpdates
            }
          }
        })),

      addAccount: (newAccount) =>
        set((state) => {
          const accountWithId: EmailAccount = {
            ...newAccount,
            id: `account-${Date.now()}`
          }
          return {
            config: {
              ...state.config,
              accounts: [...state.config.accounts, accountWithId]
            }
          }
        }),

      updateAccount: (id, updates) =>
        set((state) => ({
          config: {
            ...state.config,
            accounts: state.config.accounts.map((account) =>
              account.id === id ? { ...account, ...updates } : account
            )
          }
        })),

      removeAccount: (id) =>
        set((state) => ({
          config: {
            ...state.config,
            accounts: state.config.accounts.filter((account) => account.id !== id)
          }
        })),

      updateTheme: (themeUpdates) =>
        set((state) => ({
          config: {
            ...state.config,
            theme: {
              ...state.config.theme,
              ...themeUpdates
            }
          }
        })),

      resetConfig: () =>
        set({
          config: DEFAULT_CONFIG
        })
    }),
    {
      name: 'email-settings-workspace'
    }
  )
)
