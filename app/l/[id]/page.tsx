'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { decodeConfig } from '@/features/link-builder/components/share-tab'
import { LinkTreeConfig } from '@/features/link-builder/types'
import { THEME_PRESETS } from '@/features/link-builder/themes'
import * as LucideIcons from 'lucide-react'
import { HelpCircle, AlertTriangle, Sparkles } from 'lucide-react'
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
  console.log("Received ID:", params.id)

  const decoded = decodeConfig(params.id as string)

  console.log("Decoded Config:", decoded)

  if (decoded) {
    setConfig(decoded)
    setError(false)

    // ...
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
  const activeTheme = theme.preset !== 'custom' ? THEME_PRESETS[theme.preset] : null

  // Styles Injection
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

    .font-sans { font-family: system-ui, -apple-system, sans-serif; }
    .font-serif { font-family: Georgia, Cambria, serif; }
    .font-mono { font-family: ui-monospace, monospace; }
    .font-display { font-family: 'Outfit', 'Inter', system-ui, sans-serif; }
  `

  // Get font family class name
  const getFontClass = () => {
    if (activeTheme) return activeTheme.fontFamily
    return theme.fontFamily || 'font-sans'
  }

  // Get background style
  const getBgStyle = (): React.CSSProperties => {
    if (theme.preset === 'custom' && theme.customBg) {
      if (theme.customBg.includes('gradient') || theme.customBg.includes('var(')) {
        return { background: theme.customBg }
      }
      return { backgroundColor: theme.customBg }
    }
    return {}
  }

  // Get background CSS class
  const getBgClass = () => {
    if (theme.preset !== 'custom' && activeTheme) {
      return activeTheme.classBg
    }
    return ''
  }

  // Get button CSS classes
  const getButtonClass = (link: any) => {
    let base = ''
    
    if (theme.preset !== 'custom' && activeTheme) {
      base = activeTheme.classButton
    } else {
      // Build custom overrides
      const shape = theme.buttonShape === 'pill' ? 'rounded-full' : theme.buttonShape === 'square' ? 'rounded-none' : 'rounded-xl'
      
      let style = 'bg-white text-black hover:bg-neutral-100 shadow-sm border border-transparent'
      if (theme.buttonStyle === 'outline') {
        style = 'bg-transparent border border-white text-white hover:bg-white/10'
      } else if (theme.buttonStyle === 'glass') {
        style = 'backdrop-blur-md bg-white/10 border border-white/20 text-white hover:bg-white/20'
      } else if (theme.buttonStyle === 'neon') {
        style = 'bg-black/80 border border-indigo-500 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.15)] hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:border-indigo-400'
      } else if (theme.buttonStyle === 'brutalism') {
        style = 'bg-white text-black border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]'
      }
      
      base = `${style} ${shape} transition-all duration-200`
    }

    // Apply animation wrapper class
    if (link.animation && link.animation !== 'none') {
      base += ` anim-${link.animation}`
    }

    return base
  }

  // Get social icon CSS classes
  const getSocialIconClass = () => {
    if (theme.preset !== 'custom' && activeTheme) {
      return activeTheme.classIcon
    }
    
    let style = 'bg-white/10 hover:bg-white/20 text-white border border-white/10 shadow-sm'
    if (theme.buttonStyle === 'brutalism') {
      style = 'bg-white text-black border border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-neutral-100'
    } else if (theme.buttonStyle === 'neon') {
      style = 'bg-slate-900 border border-indigo-500/30 text-indigo-300 hover:border-indigo-400 hover:text-indigo-100'
    }
    
    return `${style} transition-all duration-200`
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

  const enabledLinks = links.filter((l) => l.isEnabled)
  const enabledSocials = socials.filter((s) => s.isEnabled && s.url)

  return (
    <div 
      className={`min-h-screen w-full flex flex-col items-center justify-between p-6 md:p-12 relative overflow-hidden select-none ${getBgClass()} ${getFontClass()}`}
      style={getBgStyle()}
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
        <h1 className={`text-2xl font-black text-center w-full mb-2 shrink-0 px-2 leading-tight ${
          theme.preset === 'minimal-silk' ? 'text-stone-900' : 'text-white'
        }`}>
          {profile.name || 'Your Name'}
        </h1>
        
        <p className={`text-sm text-center w-full max-w-xs shrink-0 mb-10 leading-relaxed px-4 ${
          theme.preset === 'minimal-silk' ? 'text-stone-600' : 'text-white/85'
        }`}>
          {profile.bio || 'Digital Creator'}
        </p>

        {/* Links list rendering */}
        <div className="w-full flex flex-col gap-4 mb-10 max-w-sm">
          {enabledLinks.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/10 rounded-xl bg-white/5 text-sm text-white/40">
              No active links listed
            </div>
          ) : (
            enabledLinks.map((link) => {
              const LinkIcon = link.icon ? ((LucideIcons as any)[link.icon] || LucideIcons.Link2) : null
              const customBtnStyle: React.CSSProperties = {}
              
              if (theme.preset === 'custom') {
                if (link.bg) customBtnStyle.backgroundColor = link.bg
                if (link.text) customBtnStyle.color = link.text
              }

              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className={`w-full py-4 px-6 flex items-center justify-center relative text-sm font-bold text-center select-none cursor-pointer ${getButtonClass(link)}`}
                  style={customBtnStyle}
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
          <div className="w-full max-w-xs flex flex-wrap gap-4 items-center justify-center shrink-0 border-t border-white/10 pt-6 mt-auto">
            {enabledSocials.map((social) => {
              const SocialIcon = socialIcons[social.platform] || HelpCircle
              return (
                <a
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 shadow-md ${getSocialIconClass()}`}
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
        className={`mt-8 py-2 px-4 rounded-full flex items-center gap-1.5 text-[10px] font-bold shadow-md border hover:scale-105 transition-all select-none ${
          theme.preset === 'minimal-silk' 
            ? 'bg-stone-900 text-stone-100 border-stone-800' 
            : 'bg-white text-stone-900 border-white/10'
        }`}
      >
        <Sparkles className="h-3 w-3 text-indigo-500 animate-spin-slow" />
        Create your own Link Tree
      </a>

    </div>
  )
}
