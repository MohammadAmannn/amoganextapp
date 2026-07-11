import React from 'react'
import { useLinkBuilderStore } from '../store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Sparkles } from 'lucide-react'

export function ProfileTab() {
  const { config, updateProfile } = useLinkBuilderStore()
  const { name, bio, avatarUrl } = config.profile

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateProfile({ name: e.target.value })
  }

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateProfile({ bio: e.target.value })
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateProfile({ avatarUrl: e.target.value })
  }

  // Get initials for fallback
  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?'
  }

  return (
    <Card className="border-muted bg-card/60 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-500" />
          Profile Customization
        </CardTitle>
        <CardDescription>
          Personalize your link tree profile heading, avatar picture, and bio description.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-6 p-4 rounded-xl border border-dashed border-muted bg-muted/30">
          <Avatar className="h-20 w-20 border-2 border-primary/20 shadow-md">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback className="bg-gradient-to-tr from-indigo-500 to-fuchsia-500 text-white text-xl font-bold">
              {getInitials(name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <h4 className="font-semibold text-lg">{name || 'Your Name'}</h4>
            <p className="text-xs text-muted-foreground line-clamp-2 max-w-[320px]">
              {bio || 'Write a short bio description...'}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="avatar-url" className="font-semibold">Avatar Image URL</Label>
            <Input
              id="avatar-url"
              placeholder="e.g. https://images.unsplash.com/photo-1534528741775-53994a69daeb"
              value={avatarUrl || ''}
              onChange={handleAvatarChange}
              className="bg-background/80"
            />
            <p className="text-xs text-muted-foreground">
              Provide a public image link or leave blank to display your display initials.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-name" className="font-semibold">Display Name</Label>
            <Input
              id="profile-name"
              placeholder="e.g. Jane Doe"
              value={name}
              onChange={handleNameChange}
              maxLength={40}
              className="bg-background/80"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-bio" className="font-semibold">Bio</Label>
            <Textarea
              id="profile-bio"
              placeholder="Tell the world about yourself..."
              value={bio}
              onChange={handleBioChange}
              maxLength={160}
              rows={4}
              className="bg-background/80 resize-none"
            />
            <div className="text-right text-xs text-muted-foreground">
              {bio.length}/160 characters
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
