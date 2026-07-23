import { isCapacitor } from '@/lib/platform'

export class StorageService {
  public static async setItem(key: string, value: string): Promise<void> {
    if (isCapacitor()) {
      try {
        const { Preferences } = await import('@capacitor/preferences')
        await Preferences.set({ key, value })
        return
      } catch (e) {
        console.warn('[StorageService] Preferences error, fallback to sessionStorage:', e)
      }
    }
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`mobile_${key}`, value)
    }
  }

  public static async getItem(key: string): Promise<string | null> {
    if (isCapacitor()) {
      try {
        const { Preferences } = await import('@capacitor/preferences')
        const { value } = await Preferences.get({ key })
        return value
      } catch (e) {
        console.warn('[StorageService] Preferences error, fallback to sessionStorage:', e)
      }
    }
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(`mobile_${key}`)
    }
    return null
  }

  public static async removeItem(key: string): Promise<void> {
    if (isCapacitor()) {
      try {
        const { Preferences } = await import('@capacitor/preferences')
        await Preferences.remove({ key })
        return
      } catch (e) {
        console.warn('[StorageService] Preferences error, fallback to sessionStorage:', e)
      }
    }
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(`mobile_${key}`)
    }
  }

  public static async setAuthSession(token: string, refreshToken: string, user: any): Promise<void> {
    await this.setItem('auth_token', token)
    await this.setItem('refresh_token', refreshToken)
    await this.setItem('user_session', JSON.stringify(user))
  }

  public static async getAuthSession(): Promise<{ token: string | null; refreshToken: string | null; user: any | null }> {
    const token = await this.getItem('auth_token')
    const refreshToken = await this.getItem('refresh_token')
    const userStr = await this.getItem('user_session')
    return {
      token,
      refreshToken,
      user: userStr ? JSON.parse(userStr) : null,
    }
  }

  public static async clearAuthSession(): Promise<void> {
    await this.removeItem('auth_token')
    await this.removeItem('refresh_token')
    await this.removeItem('user_session')
  }
}
