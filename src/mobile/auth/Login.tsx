import { useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { StorageService } from '../services/storage/storageService'
import { ProfileRepository } from '../repositories/profile.repository'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { LogIn, UserPlus, Lock, Mail, ArrowRight } from 'lucide-react'

interface LoginProps {
  onSuccess: () => void
  onNavigateSignup: () => void
  onNavigateForgot: () => void
}

export function Login({ onSuccess, onNavigateSignup, onNavigateForgot }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please enter email and password')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.session) {
        const userObj = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || email.split('@')[0],
          avatar_url: data.user.user_metadata?.avatar_url,
        }

        await StorageService.setAuthSession(
          data.session.access_token,
          data.session.refresh_token,
          userObj
        )

        await ProfileRepository.upsertProfile({
          id: userObj.id,
          name: userObj.name,
          email: userObj.email || '',
          avatar_url: userObj.avatar_url,
        })

        toast.success('Successfully logged in!')
        onSuccess()
      }
    } catch (err: any) {
      toast.error(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground p-6 justify-between">
      <div className="pt-8">
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="space-y-2"
        >
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-4">
            <LogIn className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Welcome Back</h2>
          <p className="text-xs text-muted-foreground">
            Sign in to continue to your mobile messaging workspace.
          </p>
        </motion.div>

        <form onSubmit={handleLogin} className="space-y-4 mt-8">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 rounded-xl h-11 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={onNavigateForgot}
                className="text-xs font-semibold text-emerald-500 hover:underline"
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 rounded-xl h-11 text-xs"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-2 shadow-lg shadow-emerald-600/20 mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <div className="pb-6 text-center">
        <p className="text-xs text-muted-foreground">
          Don't have an account?{' '}
          <button
            onClick={onNavigateSignup}
            className="font-bold text-emerald-500 hover:underline"
          >
            Create Account
          </button>
        </p>
      </div>
    </div>
  )
}
