import React, { useState, useEffect, useRef } from 'react'
import { useLinkMakerStore } from '../store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Copy, QrCode, Download, Code, Globe, Save } from 'lucide-react'
import { LinkTreeConfig } from '../types'
import { QrCodeDisplay, downloadQrCode } from '@/components/qr-code-display'
import { buildSelfContainedShortUrl } from '@/lib/short-url-client'

// Compact serialization helper
export function encodeConfig(config: LinkTreeConfig): string {
  try {
    const strippedConfig = {
      p: {
        n: config.profile.name,
        b: config.profile.bio,
        a: config.profile.avatarUrl
      },
      l: config.links.map(l => ({
        t: l.title,
        u: l.url,
        i: l.icon,
        b: l.bg,
        tc: l.text,
        a: l.animation,
        e: l.isEnabled
      })),
      s: config.socials.map(s => ({
        p: s.platform,
        u: s.url,
        e: s.isEnabled
      })),
      t: {
        p: config.theme.preset,
        c: config.theme.customBg,
        f: config.theme.fontFamily,
        bs: config.theme.buttonStyle,
        bh: config.theme.buttonShape,
        at: config.theme.appTheme,
        act: config.theme.appColorTheme
      }
    }
    const json = JSON.stringify(strippedConfig)
    const bytes = new TextEncoder().encode(json)
    const binString = Array.from(bytes, (b) => String.fromCharCode(b)).join('')
    return btoa(binString)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '') // URL safe base64
  } catch (e) {
    console.error(e)
    return ''
  }
}

export function decodeConfig(encoded: string): LinkTreeConfig | null {
  try {
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/')
    while (base64.length % 4) {
      base64 += '='
    }
    const binString = atob(base64)
    const bytes = Uint8Array.from(binString, (c) => c.charCodeAt(0))
    const json = new TextDecoder().decode(bytes)
    const data = JSON.parse(json)
    
    return {
      profile: {
        name: data.p.n || '',
        bio: data.p.b || '',
        avatarUrl: data.p.a || ''
      },
      links: (data.l || []).map((l: any) => ({
        id: `link-${Math.random()}`,
        title: l.t || '',
        url: l.u || '',
        icon: l.i,
        bg: l.b,
        text: l.tc,
        animation: l.a,
        isEnabled: l.e !== false
      })),
      socials: (data.s || []).map((s: any) => ({
        platform: s.p,
        url: s.u,
        isEnabled: s.e !== false
      })),
      theme: {
        preset: data.t.p || 'aura-flow',
        customBg: data.t.c,
        fontFamily: data.t.f || 'font-sans',
        buttonStyle: data.t.bs || 'solid',
        buttonShape: data.t.bh || 'rounded',
        appTheme: data.t.at || 'system',
        appColorTheme: data.t.act || 'zinc'
      }
    }
  } catch (e) {
    console.error("Failed to decode config:", e)
    return null
  }
}

export function ShareTab() {
  const { config, saveProject, activeProjectId, projects, setShortUrl, activeShortUrl, activeShortUrlSuffix, activeExpiresAt } = useLinkMakerStore()
  const [shareUrl, setShareUrl] = useState('')
  const [projName, setProjName] = useState('')
  const [shortenedUrl, setShortenedUrl] = useState('')
  const [isShortening, setIsShortening] = useState(false)
  const [expiresAt, setExpiresAt] = useState('')
  const [expirationDuration, setExpirationDuration] = useState(1)
  const shortenedResultRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (activeShortUrl) {
      setShortenedUrl(activeShortUrl)
    } else {
      setShortenedUrl('')
    }
    if (activeExpiresAt) {
      setExpiresAt(activeExpiresAt)
    } else {
      setExpiresAt('')
    }
  }, [activeShortUrl, activeExpiresAt])

  const handleShare = async (platform: string) => {
    console.log('🚀 handleShare triggered for platform:', platform)
    console.log('🔗 shortenedUrl:', shortenedUrl, 'activeShortUrlSuffix:', activeShortUrlSuffix)

    if (!shortenedUrl) {
      toast.error('No shortened URL found.')
      return
    }

    // Extract suffix dynamically from shortenedUrl if missing (e.g. for existing projects)
    let suffix = activeShortUrlSuffix
    if (!suffix) {
      const parts = shortenedUrl.split('/go/')
      if (parts[1]) {
        suffix = parts[1].split('?')[0]
      }
    }

    console.log('📦 Extracted link suffix for DB:', suffix)

    if (!suffix) {
      toast.error('Could not extract shortened link ID.')
      return
    }

    try {
      const response = await fetch('/api/analytics/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          linkId: suffix,
          platform: platform,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Failed to log share to database API:', response.status, errorText)
      } else {
        console.log('✅ Share logged successfully to database')
      }
    } catch (e) {
      console.error('❌ Exception logging share event:', e)
    }

    const trackingUrl = `${shortenedUrl}${shortenedUrl.includes('?') ? '&' : '?'}ref=${platform}`
    let shareUrl = ''

    if (platform === 'whatsapp') {
      shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out my customized Link Tree profile: ${trackingUrl}`)}`
    } else if (platform === 'linkedin') {
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(trackingUrl)}`
    } else if (platform === 'twitter') {
      shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(trackingUrl)}&text=${encodeURIComponent('Check out my custom Link Tree!')}`
    } else if (platform === 'gmail') {
      shareUrl = `mailto:?subject=${encodeURIComponent("My Link Tree Profile")}&body=${encodeURIComponent(`Hey, check out my custom Link Tree profile here:\n\n${trackingUrl}`)}`
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer')
      toast.success(`Opening ${platform.charAt(0).toUpperCase() + platform.slice(1)} to share!`)
    }
  }

  const handleShortenUrl = async () => {
    const hash = encodeConfig(config)
    if (!hash) {
      toast.error('Failed to encode profile. Please check your content.')
      return
    }

    const origin = window.location.origin
    setIsShortening(true)
    let apiSucceeded = false

    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: shareUrl || `${origin}/l/${hash}`,
          durationHours: expirationDuration,
        }),
      })

      const data = await response.json()
      if (response.ok && data.shortUrl) {
        setShortenedUrl(data.shortUrl)
        setExpiresAt(data.expiresAt)
        
        const suffix = data.shortUrl.split('/go/')[1] || ''
        setShortUrl(data.shortUrl, suffix, data.expiresAt)

        apiSucceeded = true
        toast.success('URL shortened successfully!')
      }
    } catch (error) {
      console.error('API shorten failed, using client fallback:', error)
    }

    if (!apiSucceeded) {
      // Self-contained fallback that encodes the state in the URL
      const result = buildSelfContainedShortUrl(origin, hash, expirationDuration)
      setShortenedUrl(result.shortUrl)
      setExpiresAt(result.expiresAt)
      
      const suffix = result.shortUrl.split('/go/')[1] || ''
      setShortUrl(result.shortUrl, suffix, result.expiresAt)

      toast.success('Short link generated!')
    }

    setIsShortening(false)

    setTimeout(() => {
      shortenedResultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 150)
  }

  const downloadShortQRCode = async () => {
    if (!shortenedUrl) return
    await downloadQrCode(
      shortenedUrl,
      `${config.profile.name.toLowerCase().replace(/\s+/g, '_')}_short_qrcode.png`
    )
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = encodeConfig(config)
      const url = `${window.location.origin}/l/${hash}`
      setShareUrl(url)
    }
  }, [config])

  useEffect(() => {
    if (activeProjectId) {
      const currentProj = projects.find(p => p.id === activeProjectId)
      if (currentProj) {
        setProjName(currentProj.name)
      }
    } else {
      setProjName('')
    }
  }, [activeProjectId, projects])

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text)
    toast.success(message)
  }

  const downloadQRCode = async () => {
    if (!shareUrl) return
    await downloadQrCode(
      shareUrl,
      `${config.profile.name.toLowerCase().replace(/\s+/g, '_')}_qrcode.png`
    )
  }

  const handleSave = () => {
    const finalName = projName.trim() || 'My Link Tree'
    const newId = saveProject(finalName)
    toast.success(`Project "${finalName}" saved to dashboard workspace.`)
  }

  const iframeCode = `<iframe src="${shareUrl}" width="100%" height="700" style="border:none;border-radius:12px;"></iframe>`

  return (
    <div className="space-y-6">
      {/* Save Project Section */}
      <Card className="border-muted bg-card/60 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Save className="h-5 w-5 text-indigo-500" />
            Save Profile Workspace
          </CardTitle>
          <CardDescription>
            Save this Link Tree layout locally in your dashboard so you can switch between designs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 max-w-md sm:items-end">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="proj-name" className="text-xs font-semibold">Workspace Name</Label>
              <Input
                id="proj-name"
                placeholder="e.g. Personal Links, Portfolio Page"
                value={projName}
                onChange={(e) => setProjName(e.target.value)}
                className="bg-background/80 h-9"
              />
            </div>
            <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 h-9 shrink-0 w-full sm:w-auto">
              <Save className="h-4 w-4" />
              Save Layout
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Share Links Card */}
      <Card className="border-muted bg-card/60 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="h-5 w-5 text-indigo-500" />
            Publish & Share Link Tree
          </CardTitle>
          <CardDescription>
            Copy the public URL, generate visual QR Codes, or generate embed snippets.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Share Link */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Public Link Tree URL</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  readOnly
                  value={shareUrl}
                  className="bg-muted/30 font-mono text-xs flex-grow h-10 select-all min-w-0"
                />
                <Button
                  variant="secondary"
                  className="h-10 shrink-0 gap-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 w-full sm:w-auto"
                  onClick={() => copyToClipboard(shareUrl, 'Link copied to clipboard!')}
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                This link is self-contained. Anyone opening it will see your custom styles and links instantly.
              </p>
            </div>

            {/* Public Link QR Code */}
            <div className="flex flex-col items-center gap-3 p-4 border rounded-xl bg-background/30 max-w-sm mx-auto">
              <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1.5 justify-center">
                <QrCode className="h-3.5 w-3.5 text-indigo-400" />
                Public Link QR Code
              </span>
              {shareUrl ? (
                <div className="p-3 bg-white rounded-lg border shadow-sm">
                  <QrCodeDisplay value={shareUrl} size={140} />
                </div>
              ) : (
                <div className="w-[140px] h-[140px] bg-muted/40 rounded flex items-center justify-center text-xs text-muted-foreground">
                  Generating QR...
                </div>
              )}
              <Button
                onClick={downloadQRCode}
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 h-8"
              >
                <Download className="h-3 w-3" />
                Download Public QR
              </Button>
            </div>
          </div>

          {/* Shorten URL Section */}
          <div className="space-y-4 border-t border-muted/50 pt-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                Shorten URL (Temporary Link)
              </Label>
              <p className="text-[10px] text-muted-foreground">
                Generate a shorter link that redirects to your full profile configuration. Set a self-destruction timer below.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <div className="w-full sm:w-48 shrink-0">
                  <Select
                    value={String(expirationDuration)}
                    onValueChange={(val) => setExpirationDuration(Number(val))}
                  >
                    <SelectTrigger className="h-10 text-xs bg-background/80">
                      <SelectValue placeholder="Expiration timer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Expire in 1 Hour (Default)</SelectItem>
                      <SelectItem value="3">Expire in 3 Hours</SelectItem>
                      <SelectItem value="12">Expire in 12 Hours</SelectItem>
                      <SelectItem value="24">Expire in 24 Hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleShortenUrl}
                  disabled={isShortening}
                  className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5 h-10 shrink-0 text-xs w-full sm:w-auto sm:flex-initial"
                >
                  {isShortening ? 'Shortening...' : 'Shorten URL'}
                </Button>
              </div>
            </div>

            {(shortenedUrl || isShortening) && (
              <div
                ref={shortenedResultRef}
                className="space-y-3 p-4 border border-amber-500/20 bg-amber-500/5 rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                {isShortening ? (
                  <p className="text-xs text-muted-foreground text-center py-4">Generating short link...</p>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Shortened Link</Label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          readOnly
                          value={shortenedUrl}
                          className="bg-background/80 font-mono text-xs flex-grow h-9 select-all border-amber-500/30 min-w-0"
                        />
                        <Button
                          variant="secondary"
                          className="h-9 shrink-0 gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 text-xs w-full sm:w-auto"
                          onClick={() => copyToClipboard(shortenedUrl, 'Shortened link copied to clipboard!')}
                        >
                          <Copy className="h-3.5 w-3.5" />
                          Copy
                        </Button>
                      </div>
                      {expiresAt && (
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <span>Expires on:</span>
                          <span className="font-semibold text-amber-500">{new Date(expiresAt).toLocaleString()}</span>
                        </p>
                      )}
                    </div>

                    {/* Share Tracking Channels */}
                    <div className="space-y-2 pt-2.5 border-t border-amber-500/10">
                      <Label className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block text-left">Share Tracking Link</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1.5 text-xs justify-center hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20"
                          onClick={() => handleShare('whatsapp')}
                        >
                          <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.458L0 24zm12.01-1.9c1.782.001 3.524-.48 5.042-1.391l.362-.215 3.75.983-.999-3.657.235-.374c.999-1.588 1.525-3.435 1.524-5.337.002-5.61-4.516-10.174-10.063-10.174-2.688 0-5.212 1.048-7.113 2.952C2.96 5.228 1.91 7.753 1.91 10.442c-.001 1.905.528 3.753 1.531 5.339l.256.402-.996 3.639 3.731-.977.377.224c1.478.877 3.167 1.339 4.79 1.341z" />
                          </svg>
                          WhatsApp
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1.5 text-xs justify-center hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/20"
                          onClick={() => handleShare('linkedin')}
                        >
                          <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.761-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                          </svg>
                          LinkedIn
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1.5 text-xs justify-center hover:bg-sky-500/10 hover:text-sky-400 hover:border-sky-500/20"
                          onClick={() => handleShare('twitter')}
                        >
                          <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                          Twitter
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1.5 text-xs justify-center hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
                          onClick={() => handleShare('gmail')}
                        >
                          <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-1.29 1.454-2.032 2.514-1.302L12 11.24l9.486-7.085C22.545 3.425 24 4.167 24 5.457z" />
                          </svg>
                          Gmail
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-3 pt-2 border-t border-amber-500/10">
                      <span className="text-[10px] font-semibold text-muted-foreground">Short Link QR Code</span>
                      <div className="p-3 bg-white rounded-lg border shadow-sm">
                        <QrCodeDisplay value={`${shortenedUrl}${shortenedUrl.includes('?') ? '&' : '?'}qr=1`} size={140} />
                      </div>
                      <Button
                        onClick={downloadShortQRCode}
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-xs border-amber-500/30 text-amber-500 hover:bg-amber-500/10 h-8"
                      >
                        <Download className="h-3 w-3" />
                        Download Short QR
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Embed Section */}
          <div className="border-t border-muted/50 pt-6">
            <div className="space-y-4 max-w-xl mx-auto">
              <span className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground">
                <Code className="h-4 w-4 text-indigo-400" />
                Embed Code (Iframe)
              </span>
              <p className="text-xs text-muted-foreground">
                Copy this HTML code to embed your personalized link tree directly inside your blog or web application.
              </p>
              <textarea
                readOnly
                value={iframeCode}
                rows={3}
                className="w-full text-[10px] font-mono p-3 bg-muted/30 border rounded-xl resize-none select-all"
              />
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs"
                onClick={() => copyToClipboard(iframeCode, 'Iframe embed code copied!')}
              >
                <Copy className="h-3.5 w-3.5" />
                Copy Embed Code
              </Button>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}
