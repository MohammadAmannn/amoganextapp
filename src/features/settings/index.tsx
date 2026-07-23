import { useState, useEffect } from 'react'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuthStore } from '@/stores/auth-store'
import { createClient } from '@/lib/client'
import { getDisplayNameInitials } from '@/lib/utils'
import { User, Mail, Phone, Camera, Check, Shield, Sparkles } from 'lucide-react'
import { ProfileRepository } from '@/mobile/repositories/profile.repository'

export function Settings() {
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
    if (currentUser) {
      setName(currentUser.name || '')
      setEmail(currentUser.email || '')
      setAvatarUrl(currentUser.picture || '')
      loadProfileData()
    }
  }, [currentUser])

  const loadProfileData = async () => {
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
      console.warn('[ProfilePage] Failed to fetch profile from Supabase:', e)
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
          
          // Sync to SQLite local cache
          await ProfileRepository.upsertProfile({
            id: currentUser.accountNo,
            name: name || currentUser.name,
            email: currentUser.email,
            avatar_url: newUrl,
          })
        }
      }
    } catch (err) {
      console.error('[ProfilePage] Avatar upload error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
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

      // Update auth store
      setUser({
        ...currentUser,
        name,
        picture: avatarUrl,
      })

      // Sync to SQLite local repository
      await ProfileRepository.upsertProfile({
        id: currentUser.accountNo,
        name,
        email,
        phone,
        bio,
        avatar_url: avatarUrl,
      })

      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 3000)
    } catch (err) {
      console.error('[ProfilePage] Save profile error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <AppHeader title='My Profile & Settings' />

      <Main fixed className='overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto'>
        <div className='space-y-6'>
          {/* Header Card */}
          <div className='flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl border border-border/80 bg-card shadow-xs'>
            <div className='relative group'>
              <Avatar className='h-24 w-24 border-2 border-primary/20 shadow-md'>
                <AvatarImage src={avatarUrl} alt={name} />
                <AvatarFallback className='text-xl font-bold bg-primary/10 text-primary'>
                  {getDisplayNameInitials(name || 'ME')}
                </AvatarFallback>
              </Avatar>
              <label className='absolute bottom-0 right-0 p-2.5 rounded-full bg-primary text-primary-foreground shadow-lg cursor-pointer hover:scale-105 transition-transform'>
                <Camera className='h-4 w-4' />
                <input type='file' accept='image/*' className='hidden' onChange={handleAvatarUpload} />
              </label>
            </div>

            <div className='flex-1 text-center sm:text-left space-y-1'>
              <h2 className='text-xl font-extrabold tracking-tight text-foreground flex items-center justify-center sm:justify-start gap-2'>
                {name || 'User Profile'}
                <Sparkles className='h-4 w-4 text-emerald-500' />
              </h2>
              <p className='text-xs text-muted-foreground font-medium'>{email}</p>
              <div className='flex items-center justify-center sm:justify-start gap-2 pt-1'>
                <span className='inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold border border-emerald-500/20'>
                  <Shield className='h-3 w-3' /> Verified Account
                </span>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <form onSubmit={handleSaveProfile} className='p-6 rounded-2xl border border-border/80 bg-card shadow-xs space-y-6'>
            <h3 className='text-sm font-extrabold text-foreground tracking-tight border-b border-border/60 pb-3'>
              Personal Details
            </h3>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div className='space-y-1.5'>
                <label className='text-xs font-bold text-muted-foreground uppercase tracking-wider'>
                  Display Name
                </label>
                <div className='relative'>
                  <User className='absolute left-3 top-3 h-4 w-4 text-muted-foreground/70' />
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder='Enter display name'
                    className='pl-9 rounded-xl text-xs h-10'
                  />
                </div>
              </div>

              <div className='space-y-1.5'>
                <label className='text-xs font-bold text-muted-foreground uppercase tracking-wider'>
                  Email Address
                </label>
                <div className='relative'>
                  <Mail className='absolute left-3 top-3 h-4 w-4 text-muted-foreground/70' />
                  <Input
                    disabled
                    value={email}
                    className='pl-9 rounded-xl text-xs h-10 bg-muted/40 text-muted-foreground'
                  />
                </div>
              </div>

              <div className='space-y-1.5 sm:col-span-2'>
                <label className='text-xs font-bold text-muted-foreground uppercase tracking-wider'>
                  Phone Number
                </label>
                <div className='relative'>
                  <Phone className='absolute left-3 top-3 h-4 w-4 text-muted-foreground/70' />
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder='+1 (555) 000-0000'
                    className='pl-9 rounded-xl text-xs h-10'
                  />
                </div>
              </div>

              <div className='space-y-1.5 sm:col-span-2'>
                <label className='text-xs font-bold text-muted-foreground uppercase tracking-wider'>
                  Bio / About
                </label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder='Write a short bio...'
                  rows={3}
                  className='rounded-xl text-xs resize-none'
                />
              </div>
            </div>

            <div className='flex items-center justify-between pt-4 border-t border-border/60'>
              {savedSuccess ? (
                <span className='text-xs font-bold text-emerald-500 flex items-center gap-1.5 animate-in fade-in'>
                  <Check className='h-4 w-4' /> Profile updated successfully!
                </span>
              ) : <div />}

              <Button
                type='submit'
                disabled={loading}
                className='rounded-xl font-bold text-xs h-10 px-6 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md gap-2'
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </Main>
    </>
  )
}
