import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuthStore } from '@/stores/auth-store'
import { createClient } from '@/lib/client'
import { getDisplayNameInitials } from '@/lib/utils'
import { User, Phone, Mail, Camera, Check } from 'lucide-react'
import { ProfileRepository } from '@/mobile/repositories/profile.repository'

interface MyProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MyProfileDialog({ open, onOpenChange }: MyProfileDialogProps) {
  const currentUser = useAuthStore((state) => state.auth.user)
  const setUser = useAuthStore((state) => state.auth.setUser)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  useEffect(() => {
    if (currentUser && open) {
      setName(currentUser.name || '')
      setEmail(currentUser.email || '')
      setAvatarUrl(currentUser.picture || '')
      fetchProfileData()
    }
  }, [currentUser, open])

  const fetchProfileData = async () => {
    if (!currentUser?.accountNo) return
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.accountNo)
        .maybeSingle()

      if (data) {
        setName(data.name || currentUser.name || '')
        setPhone(data.phone || '')
        setBio(data.bio || '')
        if (data.avatar || data.avatar_url) {
          setAvatarUrl(data.avatar || data.avatar_url)
        }
      }
    } catch (e) {
      console.warn('Failed to fetch profile:', e)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const file = files[0]

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'images')

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        const newUrl = data.publicUrl
        setAvatarUrl(newUrl)

        if (currentUser?.accountNo) {
          const supabase = createClient()
          await supabase.from('profiles').update({ avatar: newUrl, avatar_url: newUrl }).eq('id', currentUser.accountNo)
          setUser({ ...currentUser, picture: newUrl })

          await ProfileRepository.upsertProfile({
            id: currentUser.accountNo,
            name: name || currentUser.name,
            email: currentUser.email,
            avatar_url: newUrl,
          })
        }
      }
    } catch (err) {
      console.error('Avatar upload error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!currentUser?.accountNo) return
    setLoading(true)
    setSavedSuccess(false)
    try {
      const supabase = createClient()
      await supabase.from('profiles').update({
        name,
        phone,
        bio,
        updated_at: new Date().toISOString(),
      }).eq('id', currentUser.accountNo)

      setUser({
        ...currentUser,
        name,
        picture: avatarUrl,
      })

      await ProfileRepository.upsertProfile({
        id: currentUser.accountNo,
        name,
        email,
        phone,
        bio,
        avatar_url: avatarUrl,
      })

      setSavedSuccess(true)
      setTimeout(() => {
        setSavedSuccess(false)
        onOpenChange(false)
      }, 1000)
    } catch (err) {
      console.error('Profile update error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6 rounded-2xl border border-border shadow-xl bg-background">
        <DialogHeader className="pb-2 border-b border-border/60">
          <DialogTitle className="text-base font-extrabold tracking-tight">My Profile</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          <div className="relative group">
            <Avatar className="h-20 w-20 border-2 border-primary/30 shadow-md">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
                {getDisplayNameInitials(name || 'ME')}
              </AvatarFallback>
            </Avatar>
            <label className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-md cursor-pointer hover:scale-105 transition-transform">
              <Camera className="h-3.5 w-3.5" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </label>
          </div>

          <div className="w-full space-y-3 pt-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Display Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-9 rounded-xl text-xs h-9"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  disabled
                  value={email}
                  className="pl-9 rounded-xl text-xs h-9 bg-muted/40 text-muted-foreground"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-9 rounded-xl text-xs h-9"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Bio / Status
              </label>
              <Input
                placeholder="Available"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="rounded-xl text-xs h-9"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/60">
          {savedSuccess ? (
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
              <Check className="h-3.5 w-3.5" /> Saved!
            </span>
          ) : <div />}

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl text-xs h-9 font-bold">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading} className="rounded-xl text-xs h-9 font-bold bg-primary text-primary-foreground gap-1">
              <Check className="h-3.5 w-3.5" /> {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
