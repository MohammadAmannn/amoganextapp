'use client'

import React from 'react'

export interface CountryCode {
  code: string
  country: string
  flag: string
  label: string
}

export const COUNTRY_CODES: CountryCode[] = [
  { code: '+1', country: 'US/CA', flag: '🇺🇸', label: 'United States / Canada (+1)' },
  { code: '+91', country: 'IN', flag: '🇮🇳', label: 'India (+91)' },
  { code: '+44', country: 'UK', flag: '🇬🇧', label: 'United Kingdom (+44)' },
  { code: '+61', country: 'AU', flag: '🇦🇺', label: 'Australia (+61)' },
  { code: '+49', country: 'DE', flag: '🇩🇪', label: 'Germany (+49)' },
  { code: '+33', country: 'FR', flag: '🇫🇷', label: 'France (+33)' },
  { code: '+81', country: 'JP', flag: '🇯🇵', label: 'Japan (+81)' },
  { code: '+971', country: 'AE', flag: '🇦🇪', label: 'United Arab Emirates (+971)' },
  { code: '+65', country: 'SG', flag: '🇸🇬', label: 'Singapore (+65)' },
  { code: '+55', country: 'BR', flag: '🇧🇷', label: 'Brazil (+55)' },
  { code: '+52', country: 'MX', flag: '🇲🇽', label: 'Mexico (+52)' },
  { code: '+41', country: 'CH', flag: '🇨🇭', label: 'Switzerland (+41)' },
  { code: '+39', country: 'IT', flag: '🇮🇹', label: 'Italy (+39)' },
  { code: '+34', country: 'ES', flag: '🇪🇸', label: 'Spain (+34)' },
  { code: '+86', country: 'CN', flag: '🇨🇳', label: 'China (+86)' },
  { code: '+92', country: 'PK', flag: '🇵🇰', label: 'Pakistan (+92)' },
  { code: '+880', country: 'BD', flag: '🇧🇩', label: 'Bangladesh (+880)' },
  { code: '+234', country: 'NG', flag: '🇳🇬', label: 'Nigeria (+234)' },
  { code: '+27', country: 'ZA', flag: '🇿🇦', label: 'South Africa (+27)' },
  { code: '+966', country: 'SA', flag: '🇸🇦', label: 'Saudi Arabia (+966)' },
]

interface CountryCodeSelectProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

export function CountryCodeSelect({
  value,
  onChange,
  disabled = false,
  className = '',
}: CountryCodeSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      aria-label='Country Code'
      className={`h-9 rounded-md border border-input bg-background px-2 py-1 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary shrink-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 transition-colors shadow-xs ${className}`}
    >
      {COUNTRY_CODES.map((item) => (
        <option key={`${item.country}-${item.code}`} value={item.code}>
          {item.flag} {item.code}
        </option>
      ))}
    </select>
  )
}
