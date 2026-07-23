import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { StorageService } from '../services/storage/storageService'
import { Shield, Sparkles } from 'lucide-react'

interface SplashProps {
  onFinish: (isAuthenticated: boolean) => void
}

export function Splash({ onFinish }: SplashProps) {
  useEffect(() => {
    const checkAuth = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      const session = await StorageService.getAuthSession()
      onFinish(!!session.user)
    }
    checkAuth()
  }, [onFinish])

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-emerald-950 flex flex-col items-center justify-center text-white z-50 p-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex flex-col items-center gap-4 text-center"
      >
        <div className="h-20 w-20 rounded-3xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shadow-2xl backdrop-blur-xl">
          <Shield className="h-10 w-10 text-emerald-400" />
        </div>

        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            Amoga Mobile <Sparkles className="h-5 w-5 text-emerald-400 animate-pulse" />
          </h1>
          <p className="text-xs font-semibold text-zinc-400 mt-1">
            Mobile-First Hybrid Messaging Engine
          </p>
        </div>
      </motion.div>

      <div className="absolute bottom-8 flex items-center gap-2 text-[10px] font-bold text-zinc-500 tracking-wider uppercase">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
        Offline-First SQLite Architecture
      </div>
    </div>
  )
}
