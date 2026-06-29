import React from 'react'
import { useLinkBuilderStore } from '../store'
import { THEME_PRESETS } from '../themes'
import * as LucideIcons from 'lucide-react'
import { HelpCircle } from 'lucide-react'
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

export function PhonePreview() {
  const { config } = useLinkBuilderStore()
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

    /* Custom font classes styling */
    .font-sans { font-family: var(--font-open-sans), sans-serif; }
    .font-serif { font-family: Georgia, serif; }
    .font-mono { font-family: monospace; }
    .font-display { font-family: 'Outfit', 'Inter', sans-serif; }
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
    
    // Default custom socials styling
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
    <div className="flex flex-col items-center justify-center py-4 w-full h-full">
      <style>{animationStyles}</style>

      {/* iPhone Shell */}
      <div className="relative w-[280px] h-[570px] rounded-[40px] border-[8px] border-slate-900 bg-black shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col shrink-0 ring-1 ring-slate-800">
        
        {/* Dynamic Island / Notch */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-900 rounded-full z-30 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-800/80 mr-8" />
          <div className="w-1.5 h-1.5 rounded-full bg-slate-800/80" />
        </div>

        {/* Live Preview Content Canvas */}
        <div 
          className={`flex-grow w-full h-full overflow-y-auto no-scrollbar flex flex-col p-5 pt-12 pb-6 items-center select-none relative ${getBgClass()} ${getFontClass()}`}
          style={getBgStyle()}
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
          <h3 className={`text-base font-bold text-center w-full mb-1 shrink-0 truncate ${
            theme.preset === 'minimal-silk' ? 'text-stone-900' : 'text-white'
          }`}>
            {profile.name || 'Your Name'}
          </h3>
          
          <p className={`text-xs text-center w-full max-h-16 overflow-y-auto no-scrollbar shrink-0 mb-6 leading-relaxed px-1 ${
            theme.preset === 'minimal-silk' ? 'text-stone-500' : 'text-white/80'
          }`}>
            {profile.bio || 'Add a bio to tell users who you are.'}
          </p>

          {/* Links rendering */}
          <div className="w-full flex-grow flex flex-col gap-3.5 mb-6 overflow-y-auto no-scrollbar">
            {enabledLinks.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center text-center p-4 border border-dashed border-white/10 rounded-xl bg-white/5 text-xs text-white/40">
                No active links shown
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
                    className={`w-full py-3 px-4 flex items-center justify-center relative text-xs font-semibold text-center select-none cursor-pointer ${getButtonClass(link)}`}
                    style={customBtnStyle}
                  >
                    {LinkIcon && (
                      <LinkIcon className="h-4 w-4 absolute left-4 shrink-0" />
                    )}
                    <span className="truncate max-w-[80%]">{link.title || 'Link Title'}</span>
                  </a>
                )
              })
            )}
          </div>

          {/* Social icons row */}
          {enabledSocials.length > 0 && (
            <div className="w-full flex flex-wrap gap-2.5 items-center justify-center shrink-0 border-t border-white/10 pt-4 mt-auto">
              {enabledSocials.map((social) => {
                const SocialIcon = socialIcons[social.platform] || HelpCircle
                return (
                  <a
                    key={social.platform}
                    href={social.url}
                    target="_blank"
                    rel="noreferrer"
                    className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${getSocialIconClass()}`}
                    title={social.platform}
                  >
                    <SocialIcon className="h-4 w-4 shrink-0" />
                  </a>
                )
              })}
            </div>
          )}

        </div>
      </div>
      <p className="text-[10px] text-muted-foreground mt-3 text-center max-w-[200px]">
        Interactive Live Simulation frame. Changes reflect dynamically.
      </p>
    </div>
  )
}
