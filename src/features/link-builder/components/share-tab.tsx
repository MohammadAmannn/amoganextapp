import React, { useState, useEffect } from 'react'
import { useLinkBuilderStore } from '../store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Copy, QrCode, Download, Code, Globe, Save } from 'lucide-react'
import { LinkTreeConfig } from '../types'

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
    try {
      const response = await fetch(
        `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(shareUrl)}`
      )
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `${config.profile.name.toLowerCase().replace(/\s+/g, '_')}_qrcode.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(blobUrl)
      toast.success('QR Code downloaded successfully!')
    } catch (error) {
      toast.error('Failed to download QR code.')
    }
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
          <div className="flex gap-3 max-w-md items-end">
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
            <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 h-9 shrink-0">
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
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Public Link Tree URL</Label>
            <div className="flex gap-2">
              <Input
                readOnly
                value={shareUrl}
                className="bg-muted/30 font-mono text-xs flex-grow h-10 select-all"
              />
              <Button
                variant="secondary"
                className="h-10 shrink-0 gap-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20"
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

          {/* QR Code and Iframe integration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-muted/50 pt-6">
            
            {/* QR Code Section */}
            <div className="flex flex-col items-center p-4 border rounded-xl bg-background/30 gap-4">
              <span className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground w-full justify-center">
                <QrCode className="h-4 w-4 text-indigo-400" />
                QR Code Scanner
              </span>
              
              {shareUrl ? (
                <div className="p-3 bg-white rounded-lg border shadow-sm">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(shareUrl)}`}
                    alt="QR Code"
                    className="w-[150px] h-[150px] object-contain select-none"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="w-[150px] h-[150px] bg-muted/40 rounded flex items-center justify-center text-xs text-muted-foreground">
                  Generating QR...
                </div>
              )}

              <Button
                onClick={downloadQRCode}
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10"
              >
                <Download className="h-3.5 w-3.5" />
                Download PNG
              </Button>
            </div>

            {/* Embed Section */}
            <div className="space-y-4">
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
