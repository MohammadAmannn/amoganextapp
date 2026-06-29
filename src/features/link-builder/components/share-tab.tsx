import React, { useState, useEffect, useRef } from 'react'
import { useLinkBuilderStore } from '../store'
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
        bh: config.theme.buttonShape
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
        buttonShape: data.t.bh || 'rounded'
      }
    }
  } catch (e) {
    console.error("Failed to decode config:", e)
    return null
  }
}

export function ShareTab() {
  const { config, saveProject, activeProjectId, projects } = useLinkBuilderStore()
  const [shareUrl, setShareUrl] = useState('')
  const [projName, setProjName] = useState('')
  const [shortenedUrl, setShortenedUrl] = useState('')
  const [isShortening, setIsShortening] = useState(false)
  const [expiresAt, setExpiresAt] = useState('')
  const [expirationDuration, setExpirationDuration] = useState(1)
  const shortenedResultRef = useRef<HTMLDivElement>(null)

  const handleShortenUrl = async () => {
    const hash = encodeConfig(config)
    if (!hash) {
      toast.error('Failed to encode profile. Please check your content.')
      return
    }

    const origin = window.location.origin
    setIsShortening(true)

    // Always use the client-side self-contained approach as it works
    // reliably on both local dev and production (Vercel).
    // Server-side storage (in-memory/file) is lost between serverless
    // cold starts, so server-generated short URLs break on production.
    const result = buildSelfContainedShortUrl(origin, hash, expirationDuration)
    setShortenedUrl(result.shortUrl)
    setExpiresAt(result.expiresAt)
    toast.success('Short link generated!')

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

                    <div className="flex flex-col items-center gap-3 pt-2 border-t border-amber-500/10">
                      <span className="text-[10px] font-semibold text-muted-foreground">Short Link QR Code</span>
                      <div className="p-3 bg-white rounded-lg border shadow-sm">
                        <QrCodeDisplay value={shortenedUrl} size={140} />
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
