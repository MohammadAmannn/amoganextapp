import { useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { UserPlus, Mail, Lock, User, ArrowLeft, ArrowRight } from 'lucide-react'

interface SignupProps {
  onSuccess: () => void
  onNavigateLogin: () => void
}

export function Signup({ onSuccess, onNavigateLogin }: SignupProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      })

      if (error) throw error

      toast.success('Account created! Please verify your email or log in.')
      onSuccess()
    } catch (err: any) {
      toast.error(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground p-6 justify-between">
      <div className="pt-4">
        <button
          onClick={onNavigateLogin}
          className="flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Sign In
        </button>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="space-y-2"
        >
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-4">
            <UserPlus className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Create Account</h2>
          <p className="text-xs text-muted-foreground">
            Sign up to get started with mobile-first messaging.
          </p>
        </motion.div>

        <form onSubmit={handleSignup} className="space-y-4 mt-6">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Aman"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 rounded-xl h-11 text-xs"
              />
            </div>
          </div>

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
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Create password"
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
            {loading ? 'Creating...' : 'Register Account'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <div className="pb-6 text-center">
        <p className="text-xs text-muted-foreground">
          Already have an account?{' '}
          <button
            onClick={onNavigateLogin}
            className="font-bold text-emerald-500 hover:underline"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  )
}
