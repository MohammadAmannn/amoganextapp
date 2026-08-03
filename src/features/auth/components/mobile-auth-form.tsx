'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Send, CheckCircle2, ShieldCheck, Smartphone } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { ensureProfileExists } from '@/features/chattemplate/chat/repositories/profile-repository'
import { handleAuthRedirect } from '@/services/auth-redirect.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CountryCodeSelect } from './country-code-select'
import {
  sendPhoneOtp,
  verifyPhoneOtp,
  formatE164,
  isValidE164,
} from '../services/phone-auth.service'

interface MobileAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  redirectTo?: string
}

export function MobileAuthForm({ redirectTo, className, ...props }: MobileAuthFormProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [countryCode, setCountryCode] = useState('+1')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otpInput, setOtpInput] = useState('')

  const [isOtpSent, setIsOtpSent] = useState(false)
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const router = useRouter()
  const { setUser, setAccessToken } = useAuthStore((state) => state.auth)

  // Resend cooldown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [resendCooldown])

  const getFullPhoneNumber = () => formatE164(countryCode, phoneNumber)

  const handleGetOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    const fullPhone = getFullPhoneNumber()

    if (!phoneNumber.trim() || !isValidE164(fullPhone)) {
      toast.error('Please enter a valid phone number (7 to 15 digits).')
      return
    }

    setIsSendingOtp(true)
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim() || undefined

      const result = await sendPhoneOtp({
        phone: fullPhone,
        metadata: {
          first_name: firstName.trim() || undefined,
          last_name: lastName.trim() || undefined,
          full_name: fullName,
          email: email.trim() || undefined,
          mobile: fullPhone,
        },
      })

      if (!result.success) {
        toast.error(result.error || 'Failed to send OTP code via Vonage/Supabase.')
        return
      }

      setIsOtpSent(true)
      setResendCooldown(30) // 30-second cooldown

      toast.success(` SMS OTP has been sent via Vonage to ${fullPhone}`)
    } catch (err: any) {
      toast.error(err?.message || 'An unexpected error occurred while sending OTP.')
    } finally {
      setIsSendingOtp(false)
    }
  }

  const handleVerifyAndLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    const fullPhone = getFullPhoneNumber()

    if (!phoneNumber.trim()) {
      toast.error('Please enter your Mobile Number.')
      return
    }
    if (!isOtpSent) {
      toast.error('Please click "Get OTP" first to receive your verification code.')
      return
    }
    if (!otpInput.trim() || otpInput.trim().length < 6) {
      toast.error('Please enter the 6-digit OTP code.')
      return
    }

    setIsVerifying(true)
    try {
      const verifyResult = await verifyPhoneOtp(fullPhone, otpInput.trim())

      if (!verifyResult.success) {
        toast.error(verifyResult.error || 'Invalid OTP code. Please check and try again.')
        setIsVerifying(false)
        return
      }

      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim() || `User ${phoneNumber.slice(-4)}`
      const sessionUser = verifyResult.user
      const sessionToken = verifyResult.session?.access_token

      const userId = sessionUser?.id || `usr_phone_${Date.now()}`
      const userEmail = sessionUser?.email || email.trim() || `${fullPhone.replace('+', '')}@phone.auth`

      const userObj = {
        id: userId,
        accountNo: userId,
        email: userEmail,
        name: fullName,
        mobile: fullPhone,
        role: ['user'],
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
      }

      // 1. Update Supabase Auth user record metadata & email (updates Supabase Dashboard Authentication -> Users table)
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const updatePayload: Record<string, any> = {
          data: {
            full_name: fullName,
            display_name: fullName,
            name: fullName,
            first_name: firstName.trim() || undefined,
            last_name: lastName.trim() || undefined,
            mobile: fullPhone,
          },
        }
        if (email.trim()) {
          updatePayload.email = email.trim()
        }
        await supabase.auth.updateUser(updatePayload)
      } catch (authErr) {
        console.warn('[MobileAuthForm] Note updating auth user metadata:', authErr)
      }

      // 2. Set user state & accessToken in Zustand store + cookies
      setUser(userObj)
      setAccessToken(sessionToken || `mobile_session_${Date.now()}`)

      // 3. Ensure user profile exists in Supabase DB
      await ensureProfileExists(userObj)

      toast.success(`Welcome, ${fullName}! Phone authentication verified successfully.`)

      // 3. Redirect to destination or dashboard
      handleAuthRedirect(router, redirectTo || '/')
    } catch (err: any) {
      console.error('[MobileAuthForm] Verification error:', err)
      toast.error(err?.message || 'Failed to complete mobile sign up.')
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className={`w-full max-w-full space-y-4 overflow-hidden ${className || ''}`} {...props}>
      <form onSubmit={handleVerifyAndLogin} className='space-y-3.5 w-full'>
        {/* First Name & Last Name (Responsive 1-col on tiny screens, 2-col on sm) */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 w-full'>
          <div className='space-y-1.5 min-w-0'>
            <Label htmlFor='firstName' className='text-xs font-medium'>
              First Name
            </Label>
            <Input
              id='firstName'
              type='text'
              placeholder='John'
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={isVerifying}
              className='h-9 text-xs'
            />
          </div>
          <div className='space-y-1.5 min-w-0'>
            <Label htmlFor='lastName' className='text-xs font-medium'>
              Last Name
            </Label>
            <Input
              id='lastName'
              type='text'
              placeholder='Doe'
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={isVerifying}
              className='h-9 text-xs'
            />
          </div>
        </div>

        {/* Optional Email */}
        <div className='space-y-1.5 w-full min-w-0'>
          <Label htmlFor='mobileEmail' className='text-xs font-medium'>
            Email <span className='text-muted-foreground font-normal'>(Optional)</span>
          </Label>
          <Input
            id='mobileEmail'
            type='email'
            placeholder='name@example.com'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isVerifying}
            className='h-9 text-xs'
          />
        </div>

        {/* Mobile Number & Get OTP Controls (100% Mobile Responsive Layout) */}
        <div className='space-y-1.5 w-full min-w-0'>
          <div className='flex items-center justify-between gap-1'>
            <Label htmlFor='mobileNo' className='text-xs font-medium flex items-center gap-1.5 truncate'>
              <Smartphone className='h-3.5 w-3.5 text-muted-foreground shrink-0' />
              <span>Mobile Number <span className='text-destructive'>*</span></span>
            </Label>
            {phoneNumber.trim() && (
              <span className='text-[10px] text-muted-foreground font-mono truncate max-w-[130px] sm:max-w-none'>
                {getFullPhoneNumber()}
              </span>
            )}
          </div>

          <div className='flex flex-col xs:flex-row sm:flex-row gap-2 w-full min-w-0 items-stretch sm:items-center'>
            <div className='flex flex-1 items-center gap-1.5 min-w-0 w-full'>
              <CountryCodeSelect
                value={countryCode}
                onChange={setCountryCode}
                disabled={isVerifying || isSendingOtp}
                className='w-[90px] sm:w-[95px]'
              />
              <Input
                id='mobileNo'
                type='tel'
                inputMode='tel'
                placeholder='(555) 000-0000'
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isVerifying}
                className='flex-1 min-w-0 h-9 text-xs'
                required
              />
            </div>
            <Button
              type='button'
              variant='outline'
              onClick={() => handleGetOtp()}
              disabled={isSendingOtp || isVerifying || !phoneNumber.trim() || resendCooldown > 0}
              className='w-full sm:w-auto shrink-0 gap-1.5 text-xs font-medium h-9 px-3 min-w-[85px] border-primary/20 hover:bg-primary/5 hover:border-primary/40'
            >
              {isSendingOtp ? (
                <Loader2 className='h-3.5 w-3.5 animate-spin' />
              ) : (
                <Send className='h-3.5 w-3.5 text-primary' />
              )}
              {resendCooldown > 0
                ? `${resendCooldown}s`
                : isOtpSent
                ? 'Resend OTP'
                : 'Get OTP'}
            </Button>
          </div>
        </div>

        {/* Enter OTP Field */}
        <div className='space-y-1.5 w-full min-w-0 pt-1'>
          <div className='flex items-center justify-between gap-1'>
            <Label htmlFor='otpInput' className='text-xs font-medium'>
              Enter 6-Digit OTP <span className='text-destructive'>*</span>
            </Label>
            {isOtpSent && (
              <span className='text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 shrink-0'>
                <CheckCircle2 className='h-3 w-3' /> Sent via Vonage SMS
              </span>
            )}
          </div>
          <Input
            id='otpInput'
            type='text'
            inputMode='numeric'
            pattern='[0-9]*'
            autoComplete='one-time-code'
            maxLength={6}
            placeholder='000000'
            value={otpInput}
            onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
            disabled={isVerifying}
            className='h-10 tracking-[0.35em] font-mono text-center text-base font-bold bg-muted/20 focus:bg-background transition-colors'
            required
          />
        </div>

        {/* Verify & Sign In Action Button */}
        <Button
          type='submit'
          className='w-full gap-2 mt-3 h-10 text-xs sm:text-sm font-semibold shadow-xs transition-all active:scale-[0.99]'
          disabled={isVerifying || !phoneNumber.trim() || !otpInput.trim()}
        >
          {isVerifying ? (
            <>
              <Loader2 className='h-4 w-4 animate-spin' />
              Verifying OTP...
            </>
          ) : (
            <>
              <ShieldCheck className='h-4 w-4' />
              Verify & Sign In
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
