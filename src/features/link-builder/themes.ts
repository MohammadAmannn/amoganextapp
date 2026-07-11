export interface ThemePreset {
  id: string
  name: string
  classBg: string
  classButton: string
  classText: string
  classSubtext: string
  classIcon: string
  fontFamily: string
  buttonStyle: 'solid' | 'outline' | 'glass' | 'neon' | 'brutalism'
  buttonShape: 'square' | 'rounded' | 'pill'
}

export const THEME_PRESETS: Record<string, ThemePreset> = {
  'aura-flow': {
    id: 'aura-flow',
    name: 'Aura Flow (Glassmorphism)',
    classBg: 'bg-gradient-to-tr from-violet-600 via-indigo-700 to-fuchsia-600',
    classButton: 'backdrop-blur-md bg-white/15 hover:bg-white/25 border border-white/20 text-white shadow-xl transition-all duration-300',
    classText: 'text-white font-bold',
    classSubtext: 'text-white/80',
    classIcon: 'bg-white/15 hover:bg-white/25 border border-white/10 text-white shadow-md',
    fontFamily: 'font-sans',
    buttonStyle: 'glass',
    buttonShape: 'rounded'
  },
  'sunset-horizon': {
    id: 'sunset-horizon',
    name: 'Sunset Horizon',
    classBg: 'bg-gradient-to-b from-amber-500 via-orange-600 to-rose-600',
    classButton: 'bg-white text-orange-950 hover:bg-orange-50/90 shadow-lg hover:shadow-orange-900/20 active:scale-95 transition-all duration-300',
    classText: 'text-white font-black',
    classSubtext: 'text-amber-100/90',
    classIcon: 'bg-white/20 hover:bg-white/30 text-white border-0 shadow-sm',
    fontFamily: 'font-sans',
    buttonStyle: 'solid',
    buttonShape: 'pill'
  },
  'midnight-glow': {
    id: 'midnight-glow',
    name: 'Midnight Glow',
    classBg: 'bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.25),rgba(255,255,255,0))]',
    classButton: 'bg-slate-900/80 border border-violet-500/50 text-violet-200 shadow-[0_0_15px_rgba(139,92,246,0.15)] hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:border-violet-400 hover:text-violet-100 transition-all duration-300',
    classText: 'text-violet-100 font-medium',
    classSubtext: 'text-slate-400',
    classIcon: 'bg-slate-900 border border-violet-500/30 text-violet-300 hover:text-violet-100 hover:border-violet-400 shadow-sm',
    fontFamily: 'font-mono',
    buttonStyle: 'neon',
    buttonShape: 'rounded'
  },
  'cyber-neo': {
    id: 'cyber-neo',
    name: 'Cyber Neo (Neo-brutalism)',
    classBg: 'bg-yellow-300 pattern-isometric-dots',
    classButton: 'bg-white text-black border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] transition-all',
    classText: 'text-black font-extrabold',
    classSubtext: 'text-black/80 font-bold',
    classIcon: 'bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-100',
    fontFamily: 'font-mono',
    buttonStyle: 'brutalism',
    buttonShape: 'square'
  },
  'minimal-silk': {
    id: 'minimal-silk',
    name: 'Minimal Silk',
    classBg: 'bg-stone-100',
    classButton: 'bg-transparent border border-stone-800 text-stone-900 hover:bg-stone-900 hover:text-white transition-all duration-300',
    classText: 'text-stone-900 font-semibold',
    classSubtext: 'text-stone-500',
    classIcon: 'border border-stone-300 text-stone-700 hover:border-stone-800 hover:text-stone-900 shadow-none',
    fontFamily: 'font-serif',
    buttonStyle: 'outline',
    buttonShape: 'pill'
  }
}
