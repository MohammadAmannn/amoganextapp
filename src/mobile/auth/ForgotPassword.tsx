import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { KeyRound, Mail, ArrowLeft, Send } from 'lucide-react'

interface ForgotPasswordProps {
  onBack: () => void
}

export function ForgotPassword({ onBack }: ForgotPasswordProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter your email')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      })

      if (error) throw error

      toast.success('Password reset link sent to your email!')
      onBack()
    } catch (err: any) {
      toast.error(err.message || 'Failed to send reset link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground p-6 justify-between">
      <div className="pt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Sign In
        </button>

        <div className="space-y-2">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-4">
            <KeyRound className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Forgot Password</h2>
          <p className="text-xs text-muted-foreground">
            Enter your email and we'll send you a password reset link.
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-4 mt-8">
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

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-2 shadow-lg shadow-emerald-600/20 mt-2"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
