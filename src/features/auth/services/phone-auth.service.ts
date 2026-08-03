import { createClient } from '@/lib/supabase/client'
import { Session, User } from '@supabase/supabase-js'

export interface PhoneAuthOptions {
  phone: string
  metadata?: {
    full_name?: string
    first_name?: string
    last_name?: string
    email?: string
    mobile?: string
  }
}

export interface SendOtpResult {
  success: boolean
  message?: string
  error?: string
}

export interface VerifyOtpResult {
  success: boolean
  session?: Session | null
  user?: User | null
  error?: string
}

/**
 * Normalizes country code and phone number into E.164 standard (+[country][number]).
 * Example: countryCode="+1", number="555 0199" => "+15550199"
 */
export function formatE164(countryCode: string, phoneNumber: string): string {
  const cleanCountry = countryCode.trim().startsWith('+')
    ? countryCode.trim()
    : `+${countryCode.trim()}`
  const digitsOnly = phoneNumber.replace(/\D/g, '')
  return `${cleanCountry}${digitsOnly}`
}

/**
 * Validates E.164 formatted phone number.
 */
export function isValidE164(phone: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(phone)
}

/**
 * Sends a 6-digit SMS OTP via Supabase Auth (signInWithOtp) using Vonage SMS Provider.
 * Real SMS OTP verification ONLY - fallback OTP removed.
 */
export async function sendPhoneOtp({
  phone,
  metadata,
}: PhoneAuthOptions): Promise<SendOtpResult> {
  if (!isValidE164(phone)) {
    return {
      success: false,
      error: 'Please enter a valid phone number in E.164 format (e.g. +14155552671).',
    }
  }

  try {
    const supabase = createClient()

    const fullName = metadata?.full_name || `${metadata?.first_name || ''} ${metadata?.last_name || ''}`.trim()

    const { data, error } = await supabase.auth.signInWithOtp({
      phone,
      options: {
        channel: 'sms',
        shouldCreateUser: true,
        data: {
          ...metadata,
          full_name: fullName || phone,
          display_name: fullName || phone,
          name: fullName || phone,
          mobile: phone,
        },
      },
    })

    if (error) {
      console.error('[PhoneAuthService] Supabase Auth / Vonage SMS error:', error)
      return {
        success: false,
        error: error.message || 'Failed to send SMS OTP. Please check your Vonage SMS setup in Supabase Dashboard.',
      }
    }

    return {
      success: true,
      message: `OTP sent successfully to ${phone}.`,
    }
  } catch (err: any) {
    console.error('[PhoneAuthService] Unexpected error sending OTP:', err)
    return {
      success: false,
      error: err?.message || 'An unexpected error occurred while sending OTP.',
    }
  }
}

/**
 * Verifies SMS OTP code via Supabase Auth (verifyOtp).
 * Real SMS OTP verification ONLY - fallback OTP removed.
 */
export async function verifyPhoneOtp(
  phone: string,
  token: string
): Promise<VerifyOtpResult> {
  if (!phone || !token) {
    return {
      success: false,
      error: 'Phone number and verification code are required.',
    }
  }

  try {
    const supabase = createClient()

    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token: token.trim(),
      type: 'sms',
    })

    if (error) {
      console.error('[PhoneAuthService] Supabase verifyOtp error:', error)
      return {
        success: false,
        error: error.message || 'Invalid or expired SMS OTP code.',
      }
    }

    return {
      success: true,
      session: data.session,
      user: data.user,
    }
  } catch (err: any) {
    console.error('[PhoneAuthService] Unexpected error verifying OTP:', err)
    return {
      success: false,
      error: err?.message || 'Failed to verify OTP code.',
    }
  }
}

/**
 * Sign Up with Phone and Password.
 */
export async function signUpWithPhonePassword(
  phone: string,
  password: string,
  metadata?: Record<string, any>
) {
  const supabase = createClient()
  return await supabase.auth.signUp({
    phone,
    password,
    options: {
      data: {
        ...metadata,
        mobile: phone,
      },
    },
  })
}

/**
 * Sign In with Phone and Password.
 */
export async function signInWithPhonePassword(phone: string, password: string) {
  const supabase = createClient()
  return await supabase.auth.signInWithPassword({
    phone,
    password,
  })
}
