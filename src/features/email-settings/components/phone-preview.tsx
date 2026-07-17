import React from 'react'
import { useEmailSettingsStore } from '../store'
import { Mail } from 'lucide-react'
import { useTheme } from '@/context/theme-provider'
import { colorThemes } from '@/context/color-theme-provider'
import { cn } from '@/lib/utils'

interface PhonePreviewProps {
  compact?: boolean
}

export function PhonePreview({ compact = false }: PhonePreviewProps) {
  const { config } = useEmailSettingsStore()
  const { profile, accounts, theme } = config
  const { resolvedTheme } = useTheme()

  // Determine whether preview should be dark or light
  let isDark = resolvedTheme === 'dark'
  if (theme.appTheme === 'dark') isDark = true
  if (theme.appTheme === 'light') isDark = false

  // Load custom color theme CSS variables to override locally inside the mockup
  const colorThemeName = theme.appColorTheme || 'zinc'
  const colorThemeObj = colorThemes.find(t => t.name === colorThemeName) || colorThemes[0]
  const tokens = isDark ? colorThemeObj.tokens.dark : colorThemeObj.tokens.light

  const styleObj: React.CSSProperties = {}
  for (const [prop, value] of Object.entries(tokens)) {
    (styleObj as any)[prop] = value
  }

  // Get initials for profile picture fallback
  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?'
  }

  const enabledAccounts = accounts.filter((acc) => acc.isEnabled)

  const shellWidth = compact ? 'w-[260px]' : 'w-[280px]'
  const shellHeight = compact ? 'h-[520px]' : 'h-[560px]'

  return (
    <div className={`flex flex-col items-center w-full shrink-0 ${compact ? 'py-2' : 'py-4'}`}>
      {/* iPhone Shell */}
      <div className={`relative ${shellWidth} ${shellHeight} rounded-[40px] border-[8px] border-slate-900 bg-black shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col shrink-0 ring-1 ring-slate-800 mt-2`}>
        
        {/* Dynamic Island / Notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-900 rounded-full z-30 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-800/80 mr-8" />
          <div className="w-1.5 h-1.5 rounded-full bg-slate-800/80" />
        </div>

        {/* Live Preview Content Canvas */}
        <div 
          style={styleObj}
          className={cn(
            "flex-grow w-full h-full overflow-y-auto no-scrollbar flex flex-col p-5 pt-16 pb-6 items-center select-none relative bg-background text-foreground transition-colors duration-300",
            isDark ? 'dark' : ''
          )}
        >
          {/* Avatar Picture */}
          <div className="w-18 h-18 rounded-full border-2 border-white/20 shadow-md overflow-hidden shrink-0 flex items-center justify-center bg-gradient-to-tr from-indigo-500 to-fuchsia-500 text-white font-black text-xl mb-3">
            {profile.avatarUrl ? (
              <img 
                src={profile.avatarUrl} 
                alt={profile.name} 
                className="w-full h-full object-cover" 
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none'
                }}
              />
            ) : (
              <span>{getInitials(profile.name)}</span>
            )}
          </div>

          {/* User Profile Title & Bio */}
          <h3 className="text-base font-bold text-center w-full mb-1 shrink-0 truncate text-foreground">
            {profile.name || 'Your Name'}
          </h3>
          
          <p className="text-xs text-center w-full max-h-16 overflow-y-auto no-scrollbar shrink-0 mb-6 leading-relaxed px-1 text-muted-foreground">
            {profile.bio || 'Add a bio to tell users who you are.'}
          </p>

          {/* Connected Email Accounts list rendering */}
          <div className="w-full flex-grow flex flex-col gap-3.5 mb-6 overflow-y-auto no-scrollbar">
            {enabledAccounts.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center text-center p-4 border border-dashed border-border rounded-xl bg-card text-xs text-muted-foreground">
                No active email accounts
              </div>
            ) : (
              enabledAccounts.map((account) => {
                return (
                  <div
                    key={account.id}
                    className="w-full py-3 px-4 flex items-center justify-center relative text-xs font-bold text-center select-none bg-primary text-primary-foreground shadow-sm rounded-xl"
                  >
                    <Mail className="h-4 w-4 absolute left-4 shrink-0" />
                    <span className="truncate max-w-[80%]">{account.email}</span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
      {!compact && (
        <p className="text-[10px] text-muted-foreground mt-4 text-center max-w-[200px]">
          Interactive Live Simulation frame. Changes reflect dynamically.
        </p>
      )}
    </div>
  )
}
