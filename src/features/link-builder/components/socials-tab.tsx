import React from 'react'
import { useLinkBuilderStore } from '../store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import * as LucideIcons from 'lucide-react'
import { Share2 } from 'lucide-react'
import { 
  FaGithub, 
  FaLinkedin, 
  FaTwitter, 
  FaInstagram, 
  FaYoutube, 
  FaFacebook, 
  FaWhatsapp, 
  FaEnvelope, 
  FaPhone 
} from 'react-icons/fa'

const SOCIAL_PLATFORMS = [
  { platform: 'github', label: 'GitHub', icon: FaGithub, placeholder: 'https://github.com/yourusername' },
  { platform: 'linkedin', label: 'LinkedIn', icon: FaLinkedin, placeholder: 'https://linkedin.com/in/yourusername' },
  { platform: 'twitter', label: 'Twitter / X', icon: FaTwitter, placeholder: 'https://twitter.com/yourusername' },
  { platform: 'instagram', label: 'Instagram', icon: FaInstagram, placeholder: 'https://instagram.com/yourusername' },
  { platform: 'youtube', label: 'YouTube', icon: FaYoutube, placeholder: 'https://youtube.com/c/yourchannel' },
  { platform: 'facebook', label: 'Facebook', icon: FaFacebook, placeholder: 'https://facebook.com/yourprofile' },
  { platform: 'whatsapp', label: 'WhatsApp', icon: FaWhatsapp, placeholder: 'https://wa.me/1234567890' },
  { platform: 'email', label: 'Email Address', icon: FaEnvelope, placeholder: 'mailto:you@example.com' },
  { platform: 'phone', label: 'Phone Number', icon: FaPhone, placeholder: 'tel:+1234567890' }
]

export function SocialsTab() {
  const { config, updateSocial } = useLinkBuilderStore()
  const { socials } = config

  const handleSocialChange = (platform: string, url: string, isEnabled: boolean) => {
    updateSocial(platform, url, isEnabled)
  }

  return (
    <Card className="border-muted bg-card/60 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Share2 className="h-5 w-5 text-indigo-500" />
          Direct Social Handles
        </CardTitle>
        <CardDescription>
          Provide links to your main social channels. These will display as a neat row of icons at the bottom of your card page.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SOCIAL_PLATFORMS.map(({ platform, label, icon: IconComponent, placeholder }) => {
            const currentItem = socials.find((s) => s.platform === platform) || {
              url: '',
              isEnabled: false
            }

            return (
              <div 
                key={platform} 
                className={`p-3 rounded-xl border transition-all duration-200 bg-background/40 ${
                  currentItem.isEnabled ? 'border-indigo-500/30 ring-1 ring-indigo-500/10' : 'border-muted'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-2 font-semibold text-sm">
                    <IconComponent className={`h-4.5 w-4.5 ${currentItem.isEnabled ? 'text-indigo-400' : 'text-muted-foreground'}`} />
                    {label}
                  </span>
                  <Switch
                    checked={currentItem.isEnabled}
                    onCheckedChange={(checked) => handleSocialChange(platform, currentItem.url, checked)}
                    title={`Toggle ${label}`}
                    className="scale-90"
                  />
                </div>
                <Input
                  placeholder={placeholder}
                  value={currentItem.url}
                  onChange={(e) => handleSocialChange(platform, e.target.value, currentItem.isEnabled)}
                  disabled={!currentItem.isEnabled}
                  className="bg-background/80 h-9 text-xs"
                />
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
