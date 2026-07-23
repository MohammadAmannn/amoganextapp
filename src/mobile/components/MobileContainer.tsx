import { useState, useEffect } from 'react'
import { isCapacitor } from '@/lib/platform'
import { sqliteManager } from '../database/sqlite/connection'
import { StorageService } from '../services/storage/storageService'
import { SyncService } from '../services/sync/syncService'
import { Splash } from '../auth/Splash'
import { ProfileScreen } from '../profile/ProfileScreen'
import { ConversationList } from '../chat/ConversationList'
import { ChatScreen } from '../chat/ChatScreen'
import { MobileConversation } from '../types'

type ScreenState = 'splash' | 'unauthenticated' | 'chat_list' | 'chat_screen' | 'profile'

export function MobileContainer({ children }: { children?: React.ReactNode }) {
  const [screen, setScreen] = useState<ScreenState>('splash')
  const [activeConversation, setActiveConversation] = useState<MobileConversation | null>(null)
  const [isMobileShell, setIsMobileShell] = useState(false)

  useEffect(() => {
    if (isCapacitor()) {
      setIsMobileShell(true)
      initMobileEngine()
    }
  }, [])

  const initMobileEngine = async () => {
    // 1. Initialize SQLite Database Engine
    try {
      await sqliteManager.initialize()
    } catch (e) {
      console.warn('[MobileContainer] SQLite init warning:', e)
    }

    // 2. Initialize Network Listener & Sync Engine
    try {
      await SyncService.initNetworkListener()
    } catch (e) {
      console.warn('[MobileContainer] Network listener warning:', e)
    }

    // 4. Register App Resume & Lifecycle handlers
    if (isCapacitor()) {
      try {
        const { App } = await import('@capacitor/app')
        App.addListener('appStateChange', (state) => {
          console.log('[MobileContainer] App State Changed:', state.isActive ? 'Active' : 'Background')
          if (state.isActive) {
            SyncService.syncAll()
          }
        })
      } catch (e) {
        console.warn('[MobileContainer] Capacitor App listener error:', e)
      }
    }
  }

  const handleSplashFinish = (isAuthenticated: boolean) => {
    if (isAuthenticated) {
      setScreen('chat_list')
      SyncService.syncAll()
    } else {
      setScreen('unauthenticated')
    }
  }

  const handleLogout = async () => {
    await StorageService.clearAuthSession()
    setScreen('unauthenticated')
  }

  // If running in browser as web application OR unauthenticated, render web children
  if (!isMobileShell || screen === 'unauthenticated') {
    return <>{children}</>
  }

  return (
    <div className="fixed inset-0 bg-background text-foreground z-50 overflow-hidden font-sans select-none">
      {screen === 'splash' && (
        <Splash onFinish={handleSplashFinish} />
      )}

      {screen === 'chat_list' && (
        <ConversationList
          onSelectConversation={(convo) => {
            setActiveConversation(convo)
            setScreen('chat_screen')
          }}
          onOpenProfile={() => setScreen('profile')}
        />
      )}

      {screen === 'chat_screen' && activeConversation && (
        <ChatScreen
          conversation={activeConversation}
          onBack={() => setScreen('chat_list')}
        />
      )}

      {screen === 'profile' && (
        <ProfileScreen
          onBack={() => setScreen('chat_list')}
          onLogout={handleLogout}
        />
      )}
    </div>
  )
}
