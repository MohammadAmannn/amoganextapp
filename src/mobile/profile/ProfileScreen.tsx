import { useState, useEffect } from 'react'
import { isCapacitor } from '@/lib/platform'
import { ProfileRepository } from '../repositories/profile.repository'
import { StorageService } from '../services/storage/storageService'
import { SyncService } from '../services/sync/syncService'
import { MobileProfile } from '../types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { Camera, User, Phone, Mail, Edit2, Check, ArrowLeft, LogOut } from 'lucide-react'

interface ProfileScreenProps {
  onBack?: () => void
  onLogout?: () => void
}

export function ProfileScreen({ onBack, onLogout }: ProfileScreenProps) {
  const [profile, setProfile] = useState<MobileProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const session = await StorageService.getAuthSession()
    if (!session.user) return
    const userId = session.user.id || session.user.accountNo

    // 1. Read from SQLite local cache first
    let cached = await ProfileRepository.getProfileById(userId)
    if (cached) {
      setProfile(cached)
      setName(cached.name)
      setPhone(cached.phone || '')
      setBio(cached.bio || '')
    }

    // 2. Fetch latest profile from server if online
    if (await SyncService.isOnline()) {
      try {
        const res = await fetch(`/api/profiles/${userId}`)
        if (res.ok) {
          const serverProfile = await res.json()
          const updated: MobileProfile = {
            id: serverProfile.id,
            name: serverProfile.name,
            email: serverProfile.email,
            avatar_url: serverProfile.avatar || serverProfile.avatar_url,
            phone: serverProfile.phone || '',
            bio: serverProfile.bio || '',
            status: serverProfile.status || 'online',
          }
          await ProfileRepository.upsertProfile(updated)
          setProfile(updated)
          setName(updated.name)
          setPhone(updated.phone || '')
          setBio(updated.bio || '')
        }
      } catch (e) {
        console.warn('[ProfileScreen] Server fetch failed, using local SQLite profile:', e)
      }
    }
  }

  const handleAvatarPick = async () => {
    try {
      let fileBlob: Blob | null = null

      if (isCapacitor()) {
        const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera')
        const image = await Camera.getPhoto({
          quality: 80,
          allowEditing: true,
          resultType: CameraResultType.Base64,
          source: CameraSource.Prompt,
        })

        if (image.base64String) {
          const byteCharacters = atob(image.base64String)
          const byteNumbers = new Array(byteCharacters.length)
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i)
          }
          const byteArray = new Uint8Array(byteNumbers)
          fileBlob = new Blob([byteArray], { type: `image/${image.format}` })
        }
      }

      if (fileBlob && profile) {
        toast.info('Uploading new avatar...')
        const formData = new FormData()
        formData.append('file', fileBlob, `avatar-${Date.now()}.jpg`)
        formData.append('folder', 'images')

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (res.ok) {
          const data = await res.json()
          const newAvatar = data.publicUrl

          const updatedProfile = { ...profile, avatar_url: newAvatar }
          await ProfileRepository.upsertProfile(updatedProfile)
          setProfile(updatedProfile)

          // Update server profile
          await fetch(`/api/profiles/${profile.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ avatar: newAvatar }),
          })

          toast.success('Avatar updated successfully!')
        }
      }
    } catch (err: any) {
      console.error('[ProfileScreen] Avatar error:', err)
    }
  }

  const handleSaveProfile = async () => {
    if (!profile) return
    setLoading(true)

    try {
      const updated: MobileProfile = {
        ...profile,
        name,
        phone,
        bio,
      }

      // 1. Save immediately to SQLite
      await ProfileRepository.upsertProfile(updated)
      setProfile(updated)

      // 2. Sync to server if online
      if (await SyncService.isOnline()) {
        await fetch(`/api/profiles/${profile.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, phone, bio }),
        })
      }

      toast.success('Profile updated!')
      setIsEditing(false)
    } catch (e) {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/95 backdrop-blur">
        {onBack ? (
          <button onClick={onBack} className="p-2 rounded-full hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </button>
        ) : <div />}
        <h2 className="text-sm font-extrabold tracking-tight">Profile</h2>
        {isEditing ? (
          <button
            onClick={handleSaveProfile}
            disabled={loading}
            className="text-xs font-bold text-emerald-500 hover:underline flex items-center gap-1"
          >
            <Check className="h-4 w-4" /> Done
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs font-bold text-emerald-500 hover:underline flex items-center gap-1"
          >
            <Edit2 className="h-3.5 w-3.5" /> Edit
          </button>
        )}
      </div>

      {/* Profile Body */}
      <div className="flex-1 p-6 space-y-6 max-w-md mx-auto w-full">
        {/* Avatar Card */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <Avatar className="h-24 w-24 border-2 border-emerald-500/30 shadow-xl">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="text-xl font-bold bg-emerald-500/10 text-emerald-500">
                {profile?.name?.substring(0, 2).toUpperCase() || 'ME'}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={handleAvatarPick}
              className="absolute bottom-0 right-0 p-2 rounded-full bg-emerald-600 text-white shadow-lg border-2 border-background hover:bg-emerald-700 transition-transform active:scale-95"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-black">{profile?.name || 'User'}</h3>
            <p className="text-xs text-muted-foreground">{profile?.email}</p>
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-4 pt-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Display Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                disabled={!isEditing}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 rounded-xl h-11 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                disabled={!isEditing}
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-10 rounded-xl h-11 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Bio / Status
            </label>
            <Input
              disabled={!isEditing}
              placeholder="Available"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="rounded-xl h-11 text-xs"
            />
          </div>
        </div>

        {onLogout && (
          <div className="pt-6">
            <Button
              variant="destructive"
              onClick={onLogout}
              className="w-full h-11 rounded-xl font-bold text-xs gap-2"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
