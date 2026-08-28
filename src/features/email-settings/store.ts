import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { EmailSettingsConfig, ProfileConfig, EmailAccount, ThemeConfig, SupabaseStorageConfig, SupabaseAccount, AiAccount, ChatAccount } from './types'

interface EmailSettingsState {
  config: EmailSettingsConfig
  
  // Profile actions
  updateProfile: (profile: Partial<ProfileConfig>) => void
  
  // Account actions
  addAccount: (account: Omit<EmailAccount, 'id'>) => void
  updateAccount: (id: string, updates: Partial<EmailAccount>) => void
  removeAccount: (id: string) => void

  // Supabase Storage Account actions
  addStorageAccount: (account: Omit<SupabaseAccount, 'id'>) => void
  updateStorageAccount: (id: string, updates: Partial<SupabaseAccount>) => void
  removeStorageAccount: (id: string) => void

  // Supabase Chat Account actions
  addChatAccount: (account: Omit<ChatAccount, 'id'>) => void
  updateChatAccount: (id: string, updates: Partial<ChatAccount>) => void
  removeChatAccount: (id: string) => void

  // AI API Account actions
  addAiAccount: (account: Omit<AiAccount, 'id'>) => void
  updateAiAccount: (id: string, updates: Partial<AiAccount>) => void
  removeAiAccount: (id: string) => void
  
  // Theme actions
  updateTheme: (themeUpdates: Partial<ThemeConfig>) => void

  // Storage actions
  updateStorage: (storageUpdates: Partial<SupabaseStorageConfig>) => void
  resetStorage: () => void

  resetConfig: () => void
}

const DEFAULT_STORAGE_CONFIG: SupabaseStorageConfig = {
  supabaseUrl: '',
  supabaseAnonKey: '',
  bucketName: 'chat-files',
  isCustomEnabled: false,
  status: 'untested',
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
  storageAccounts: [],
  chatAccounts: [],
  aiAccounts: [],
  theme: {
    preset: 'custom',
    appTheme: 'system',
    appColorTheme: 'zinc'
  },
  storage: DEFAULT_STORAGE_CONFIG,
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

      addStorageAccount: (newAccount) =>
        set((state) => {
          const accountWithId: SupabaseAccount = {
            ...newAccount,
            id: `storage-${Date.now()}`
          }
          return {
            config: {
              ...state.config,
              storageAccounts: [...(state.config.storageAccounts || []), accountWithId]
            }
          }
        }),

      updateStorageAccount: (id, updates) =>
        set((state) => ({
          config: {
            ...state.config,
            storageAccounts: (state.config.storageAccounts || []).map((account) =>
              account.id === id ? { ...account, ...updates } : account
            )
          }
        })),

      removeStorageAccount: (id) =>
        set((state) => ({
          config: {
            ...state.config,
            storageAccounts: (state.config.storageAccounts || []).filter((account) => account.id !== id)
          }
        })),

      addChatAccount: (newAccount) =>
        set((state) => {
          const accountWithId: ChatAccount = {
            ...newAccount,
            id: `chat-${Date.now()}`
          }
          return {
            config: {
              ...state.config,
              chatAccounts: [...(state.config.chatAccounts || []), accountWithId]
            }
          }
        }),

      updateChatAccount: (id, updates) =>
        set((state) => ({
          config: {
            ...state.config,
            chatAccounts: (state.config.chatAccounts || []).map((account) =>
              account.id === id ? { ...account, ...updates } : account
            )
          }
        })),

      removeChatAccount: (id) =>
        set((state) => ({
          config: {
            ...state.config,
            chatAccounts: (state.config.chatAccounts || []).filter((account) => account.id !== id)
          }
        })),

      addAiAccount: (newAccount) =>
        set((state) => {
          const accountWithId: AiAccount = {
            ...newAccount,
            id: `ai-${Date.now()}`
          }
          return {
            config: {
              ...state.config,
              aiAccounts: [...(state.config.aiAccounts || []), accountWithId]
            }
          }
        }),

      updateAiAccount: (id, updates) =>
        set((state) => ({
          config: {
            ...state.config,
            aiAccounts: (state.config.aiAccounts || []).map((account) =>
              account.id === id ? { ...account, ...updates } : account
            )
          }
        })),

      removeAiAccount: (id) =>
        set((state) => ({
          config: {
            ...state.config,
            aiAccounts: (state.config.aiAccounts || []).filter((account) => account.id !== id)
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

      updateStorage: (storageUpdates) =>
        set((state) => ({
          config: {
            ...state.config,
            storage: {
              ...(state.config.storage || DEFAULT_STORAGE_CONFIG),
              ...storageUpdates
            }
          }
        })),

      resetStorage: () =>
        set((state) => ({
          config: {
            ...state.config,
            storage: DEFAULT_STORAGE_CONFIG
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
