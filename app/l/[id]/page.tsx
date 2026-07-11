'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { decodeConfig } from '@/features/link-builder/components/share-tab'
import { LinkTreeConfig } from '@/features/link-builder/types'
import { colorThemes } from '@/context/color-theme-provider'
import * as LucideIcons from 'lucide-react'
import { HelpCircle, AlertTriangle, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  FaGithub, 
  FaLinkedin, 
  FaTwitter, 
  FaInstagram, 
  FaYoutube, 
  FaFacebook, 
  FaWhatsapp, 
  FaEnvelope, 
  FaPhone 
} from 'react-icons/fa'

const socialIcons: Record<string, any> = {
  github: FaGithub,
  linkedin: FaLinkedin,
  twitter: FaTwitter,
  instagram: FaInstagram,
  youtube: FaYoutube,
  facebook: FaFacebook,
  whatsapp: FaWhatsapp,
  email: FaEnvelope,
  phone: FaPhone
}

export default function PublicLinkTreePage() {
  const params = useParams()
  const router = useRouter()
  const [config, setConfig] = useState<LinkTreeConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    if (params?.id) {
      const decoded = decodeConfig(params.id as string)
      if (decoded) {
        setConfig(decoded)
        setError(false)
      } else {
        setError(true)
      }
      setLoading(false)
    }
  }, [params])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mb-4" />
        <p className="text-sm font-semibold text-slate-400">Loading custom page...</p>
      </div>
    )
  }

  if (isExpired) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6 text-center">
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 mb-4 animate-pulse">
          <AlertTriangle className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-bold mb-2">This Link Has Expired</h2>
        <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">
          The temporary shortened URL you are trying to visit has expired. Shortened links are set to expire after 1 hour.
        </p>
        <button
          onClick={() => router.push('/link-builder')}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg cursor-pointer"
        >
          Build Your Own Link Tree
        </button>
      </div>
    )
  }

  if (error || !config) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-6 text-center">
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 mb-4 animate-pulse">
          <AlertTriangle className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-bold mb-2">Invalid Link Tree URL</h2>
        <p className="text-sm text-slate-400 max-w-sm mb-6">
          The link tree configuration appears to be broken, incomplete, or corrupted. Please generate a new URL.
        </p>
        <button
          onClick={() => router.push('/link-builder')}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg cursor-pointer"
        >
          Build Your Own Link Tree
        </button>
      </div>
    )
  }

  const { profile, links, socials, theme } = config

  // Resolve light/dark modes
  let isDark = false
  if (theme.appTheme === 'dark') {
    isDark = true
  } else if (theme.appTheme === 'light') {
    isDark = false
  } else if (typeof window !== 'undefined') {
    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  // Construct custom properties based on selected color theme
  const colorThemeName = theme.appColorTheme || 'zinc'
  const colorThemeObj = colorThemes.find(t => t.name === colorThemeName) || colorThemes[0]
  const tokens = isDark ? colorThemeObj.tokens.dark : colorThemeObj.tokens.light

  const styleObj: React.CSSProperties = {}
  for (const [prop, value] of Object.entries(tokens)) {
    (styleObj as any)[prop] = value
  }

  // Styles Injection for button micro-animations
  const animationStyles = `
    @keyframes p-bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }
    @keyframes p-pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.02); opacity: 0.95; }
    }
    @keyframes p-wiggle {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(-2deg); }
      75% { transform: rotate(2deg); }
    }
    @keyframes p-glow {
      0%, 100% { box-shadow: 0 0 4px rgba(255, 255, 255, 0.15); }
      50% { box-shadow: 0 0 12px rgba(255, 255, 255, 0.5); }
    }
    @keyframes p-shake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-3px); }
      40%, 80% { transform: translateX(3px); }
    }

    .anim-bounce { animation: p-bounce 1.6s infinite ease-in-out; }
    .anim-pulse { animation: p-pulse 2s infinite ease-in-out; }
    .anim-wiggle { animation: p-wiggle 1.2s infinite ease-in-out; }
    .anim-glow { animation: p-glow 2s infinite ease-in-out; }
    .anim-shake { animation: p-shake 0.8s infinite ease-in-out; }
  `

  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?'
  }

  const enabledLinks = links.filter((l) => l.isEnabled)
  const enabledSocials = socials.filter((s) => s.isEnabled && s.url)

  return (
    <div 
      style={styleObj}
      className={cn(
        "min-h-screen w-full flex flex-col items-center justify-between p-6 md:p-12 relative overflow-hidden select-none bg-background text-foreground transition-colors duration-300",
        isDark ? "dark" : ""
      )}
    >
      <style>{animationStyles}</style>

      {/* Main Container */}
      <div className="w-full max-w-md flex flex-col items-center flex-grow pt-8 md:pt-16 pb-12">
        
        {/* Avatar Picture */}
        <div className="w-24 h-24 rounded-full border-4 border-white/20 shadow-lg overflow-hidden shrink-0 flex items-center justify-center bg-gradient-to-tr from-indigo-500 to-fuchsia-500 text-white font-black text-3xl mb-4">
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
        <h1 className="text-2xl font-black text-center w-full mb-2 shrink-0 px-2 leading-tight text-foreground">
          {profile.name || 'Your Name'}
        </h1>
        
        <p className="text-sm text-center w-full max-w-xs shrink-0 mb-10 leading-relaxed px-4 text-muted-foreground">
          {profile.bio || 'Digital Creator'}
        </p>

        {/* Links list rendering */}
        <div className="w-full flex flex-col gap-4 mb-10 max-w-sm">
          {enabledLinks.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-xl bg-card text-sm text-muted-foreground">
              No active links listed
            </div>
          ) : (
            enabledLinks.map((link) => {
              const LinkIcon = link.icon ? ((LucideIcons as any)[link.icon] || LucideIcons.Link2) : null

              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    "w-full py-4 px-6 flex items-center justify-center relative text-sm font-bold text-center select-none cursor-pointer bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-sm rounded-xl",
                    link.animation && link.animation !== 'none' && `anim-${link.animation}`
                  )}
                >
                  {LinkIcon && (
                    <LinkIcon className="h-5 w-5 absolute left-5 shrink-0" />
                  )}
                  <span className="truncate max-w-[85%]">{link.title || 'Link Title'}</span>
                </a>
              )
            })
          )}
        </div>

        {/* Social icons row */}
        {enabledSocials.length > 0 && (
          <div className="w-full max-w-xs flex flex-wrap gap-4 items-center justify-center shrink-0 border-t border-border pt-6 mt-auto">
            {enabledSocials.map((social) => {
              const SocialIcon = socialIcons[social.platform] || HelpCircle
              return (
                <a
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 shadow-md bg-muted hover:bg-muted/80 text-muted-foreground transition-all border border-border/10"
                  title={social.platform}
                >
                  <SocialIcon className="h-5 w-5 shrink-0" />
                </a>
              )
            })}
          </div>
        )}

      </div>

      {/* Floating growth hacking branding badge */}
      <a
        href="/link-builder"
        className="mt-8 py-2 px-4 rounded-full flex items-center gap-1.5 text-[10px] font-bold shadow-md border hover:scale-105 transition-all select-none bg-muted text-muted-foreground border-border"
      >
        <Sparkles className="h-3 w-3 text-indigo-500 animate-spin-slow" />
        Create your own Link Tree
      </a>

    </div>
  )
}
