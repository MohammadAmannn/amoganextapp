import { Capacitor } from '@capacitor/core'

/**
 * Robust Platform Detection Utilities
 * Safely determines if running inside a Capacitor native shell (Android/iOS) or standard web browser.
 * Works reliably even when loading remote server.url (e.g. https://amoganextapp.vercel.app).
 */

export function isCapacitor(): boolean {
  if (typeof window === 'undefined') return false
  const win = window as any
  return (
    Capacitor.isNativePlatform() ||
    Boolean(win.Capacitor && win.Capacitor.isNativePlatform && win.Capacitor.isNativePlatform()) ||
    Boolean(win.Capacitor && win.Capacitor.platform && win.Capacitor.platform !== 'web') ||
    (typeof navigator !== 'undefined' && /Capacitor/i.test(navigator.userAgent))
  )
}

export function isAndroid(): boolean {
  if (typeof window === 'undefined') return false
  const win = window as any
  const platform = win.Capacitor?.getPlatform ? win.Capacitor.getPlatform() : Capacitor.getPlatform()
  return platform === 'android' || /Android/i.test(navigator.userAgent)
}

export function isIOS(): boolean {
  if (typeof window === 'undefined') return false
  const win = window as any
  const platform = win.Capacitor?.getPlatform ? win.Capacitor.getPlatform() : Capacitor.getPlatform()
  return platform === 'ios' || /iPhone|iPad|iPod/i.test(navigator.userAgent)
}

export function isWeb(): boolean {
  return !isCapacitor()
}

export function getPlatformName(): 'android' | 'ios' | 'web' {
  if (isAndroid()) return 'android'
  if (isIOS()) return 'ios'
  return 'web'
}
