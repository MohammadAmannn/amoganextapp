import React, { useState, useEffect, useCallback } from 'react'
import { useLinkMakerStore } from '../store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  BarChart3,
  QrCode,
  Globe2,
  MousePointerClick,
  Laptop,
  Smartphone,
  RefreshCw,
  Compass,
  ExternalLink,
  Copy,
  Calendar,
  AlertCircle,
  Share2
} from 'lucide-react'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer
} from "recharts"

interface AnalyticsData {
  totalClicks: number
  qrClicks: number
  nonQrClicks: number
  totalShares: number
  sharesByPlatform: Array<{ name: string; value: number }>
  timeseries: Array<{ date: string; rawDate: string; clicks: number }>
  referrers: Array<{ name: string; value: number }>
  countries: Array<{ name: string; value: number }>
  cities: Array<{ name: string; value: number }>
  devices: Array<{ name: string; value: number }>
  os: Array<{ name: string; value: number }>
  browsers: Array<{ name: string; value: number }>
}

export function AnalyticsTab() {
  const { activeShortUrlSuffix, activeShortUrl } = useLinkMakerStore()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async (silent = false) => {
    if (!activeShortUrlSuffix) return
    if (!silent) setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/analytics?linkId=${activeShortUrlSuffix}`)
      if (!res.ok) {
        throw new Error('Failed to load analytics data')
      }
      const json = await res.json()
      setData(json)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      if (!silent) setLoading(false)
    }
  }, [activeShortUrlSuffix])

  useEffect(() => {
    if (activeShortUrlSuffix) {
      fetchAnalytics()
    } else {
      setData(null)
    }
  }, [activeShortUrlSuffix, fetchAnalytics])

  const handleCopyLink = () => {
    if (!activeShortUrl) return
    navigator.clipboard.writeText(activeShortUrl)
    toast.success('Link copied to clipboard!')
  }

  const handleRefresh = () => {
    fetchAnalytics()
    toast.success('Analytics updated!')
  }

  // Render placeholder if no shortened link is generated yet
  if (!activeShortUrlSuffix) {
    return (
      <Card className="border-muted bg-card/60 backdrop-blur-md text-center p-8">
        <CardHeader className="flex flex-col items-center">
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 mb-4 animate-bounce">
            <BarChart3 className="h-10 w-10" />
          </div>
          <CardTitle className="text-xl">Analytics is Disabled</CardTitle>
          <CardDescription className="max-w-md mx-auto mt-2 text-sm">
            To view detailed tracking reports, you must first shorten your Link Tree URL and share it.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <p className="text-xs text-muted-foreground max-w-sm">
            Head over to the <strong>Publish</strong> tab, choose an expiration timer, and click <strong>Shorten URL</strong>.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className="border-muted bg-card/60 backdrop-blur-md p-16 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <p className="text-sm font-semibold text-muted-foreground">Loading link analytics...</p>
        </div>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card className="border-destructive/20 bg-destructive/5 backdrop-blur-md p-8 text-center border">
        <CardHeader className="flex flex-col items-center">
          <AlertCircle className="h-10 w-10 text-destructive mb-3" />
          <CardTitle>Error Loading Analytics</CardTitle>
          <CardDescription className="mt-1">{error || 'Unable to load click logs.'}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => fetchAnalytics()} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" /> Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Handle case where link is shortened but there are 0 clicks yet
  if (data.totalClicks === 0) {
    return (
      <div className="space-y-6">
        <Card className="border-muted bg-card/60 backdrop-blur-md p-8 text-center">
          <CardHeader className="flex flex-col items-center">
            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-500 mb-4 animate-pulse">
              <MousePointerClick className="h-10 w-10" />
            </div>
            <CardTitle>No clicks detected yet</CardTitle>
            <CardDescription className="max-w-md mx-auto mt-2 text-sm">
              Your shortened tracking link is active and ready to collect data. Share it with your audience to begin gathering analytics!
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 max-w-lg mx-auto">
            <div className="w-full space-y-2 border p-4 rounded-xl bg-background/50">
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block text-left">Your Tracking Link</span>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={activeShortUrl || ''}
                  className="bg-transparent font-mono text-xs flex-grow h-9 select-all focus:outline-none min-w-0"
                />
                <Button size="sm" variant="secondary" onClick={handleCopyLink} className="h-9 gap-1 text-xs">
                  <Copy className="h-3 w-3" /> Copy
                </Button>
                <a href={activeShortUrl || ''} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline" className="h-9 gap-1 text-xs">
                    <ExternalLink className="h-3 w-3" /> Visit Link
                  </Button>
                </a>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => fetchAnalytics()} variant="default" className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                <RefreshCw className="h-4 w-4" /> Check Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate percentage helper
  const getPercentage = (value: number) => {
    return data.totalClicks > 0 ? Math.round((value / data.totalClicks) * 100) : 0
  }

  return (
    <div className="space-y-6">
      {/* Header and Quick Refresh */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-card/40 border border-muted p-4 rounded-xl backdrop-blur-md">
        <div className="min-w-0">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Active Link Tracking</span>
          <h3 className="font-mono text-xs truncate max-w-md mt-1">{activeShortUrl}</h3>
        </div>
        <div className="flex gap-2 w-full sm:w-auto shrink-0">
          <Button variant="outline" size="sm" onClick={handleCopyLink} className="gap-1.5 text-xs w-full sm:w-auto">
            <Copy className="h-3.5 w-3.5" /> Copy
          </Button>
          <Button variant="default" size="sm" onClick={handleRefresh} className="gap-1.5 text-xs w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh Data
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-muted bg-card/60 backdrop-blur-md">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">Total Clicks</p>
              <h4 className="text-2xl font-bold font-display">{data.totalClicks}</h4>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <MousePointerClick className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted bg-card/60 backdrop-blur-md">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">QR Code Scans</p>
              <h4 className="text-2xl font-bold font-display">
                {data.qrClicks}
                <span className="text-xs font-normal text-muted-foreground ml-1.5">
                  ({getPercentage(data.qrClicks)}%)
                </span>
              </h4>
            </div>
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
              <QrCode className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted bg-card/60 backdrop-blur-md">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">Direct/Web Clicks</p>
              <h4 className="text-2xl font-bold font-display">
                {data.nonQrClicks}
                <span className="text-xs font-normal text-muted-foreground ml-1.5">
                  ({getPercentage(data.nonQrClicks)}%)
                </span>
              </h4>
            </div>
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
              <Globe2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted bg-card/60 backdrop-blur-md">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">Total Shares</p>
              <h4 className="text-2xl font-bold font-display">{data.totalShares}</h4>
            </div>
            <div className="p-3 bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-xl">
              <Share2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clicks Over Time Chart */}
      <Card className="border-muted bg-card/60 backdrop-blur-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4.5 w-4.5 text-emerald-400" />
            Clicks Over Time
          </CardTitle>
          <CardDescription>Visualizing clicks received per day</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <ChartContainer
            config={{
              clicks: {
                label: "Clicks",
                color: "hsl(var(--primary))",
              },
            }}
            className="h-[250px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data.timeseries}
                margin={{ left: -10, right: 10, top: 10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="rgb(16, 185, 129)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="rgb(16, 185, 129)" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted/40" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="text-[10px] fill-muted-foreground"
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="text-[10px] fill-muted-foreground"
                />
                <ChartTooltip
                  cursor={{ stroke: 'rgba(16, 185, 129, 0.2)', strokeWidth: 1 }}
                  content={<ChartTooltipContent />}
                />
                <Area
                  dataKey="clicks"
                  type="monotone"
                  stroke="rgb(16, 185, 129)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorClicks)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Grid of breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Referrers */}
        <Card className="border-muted bg-card/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Compass className="h-4.5 w-4.5 text-emerald-400" />
              Referrers (Opened from)
            </CardTitle>
            <CardDescription>Top traffic sources directing to your tree</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[320px] overflow-y-auto pr-2 no-scrollbar">
            {data.referrers.map((ref) => {
              const pct = getPercentage(ref.value)
              return (
                <div key={ref.name} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold">{ref.name}</span>
                    <span className="text-muted-foreground font-mono">{ref.value} clicks ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full bg-muted/60 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Share Channels */}
        <Card className="border-muted bg-card/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Share2 className="h-4.5 w-4.5 text-emerald-400" />
              Share Channels (Shared on)
            </CardTitle>
            <CardDescription>Platforms where your tracking link was shared</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[320px] overflow-y-auto pr-2 no-scrollbar">
            {data.totalShares === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-10">No share records logged yet.</p>
            ) : (
              data.sharesByPlatform.map((share) => {
                const pct = data.totalShares > 0 ? Math.round((share.value / data.totalShares) * 100) : 0
                return (
                  <div key={share.name} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold">{share.name}</span>
                      <span className="text-muted-foreground font-mono">{share.value} shares ({pct}%)</span>
                    </div>
                    <div className="h-2 w-full bg-muted/60 rounded-full overflow-hidden">
                      <div className="h-full bg-pink-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* Countries */}
        <Card className="border-muted bg-card/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe2 className="h-4.5 w-4.5 text-emerald-400" />
              Top Locations
            </CardTitle>
            <CardDescription>Geographic distribution of visitors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[320px] overflow-y-auto pr-2 no-scrollbar">
            {data.countries.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-10">No location data recorded.</p>
            ) : (
              data.countries.map((country) => {
                const pct = getPercentage(country.value)
                return (
                  <div key={country.name} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold">{country.name}</span>
                      <span className="text-muted-foreground font-mono">{country.value} ({pct}%)</span>
                    </div>
                    <div className="h-2 w-full bg-muted/60 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* Devices */}
        <Card className="border-muted bg-card/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Smartphone className="h-4.5 w-4.5 text-emerald-400" />
              Devices
            </CardTitle>
            <CardDescription>Visitor device categorization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[320px] overflow-y-auto pr-2 no-scrollbar">
            {data.devices.map((dev) => {
              const pct = getPercentage(dev.value)
              return (
                <div key={dev.name} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold capitalize">{dev.name}</span>
                    <span className="text-muted-foreground font-mono">{dev.value} ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full bg-muted/60 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* System & Browsers */}
        <Card className="border-muted bg-card/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Laptop className="h-4.5 w-4.5 text-emerald-400" />
              Operating Systems
            </CardTitle>
            <CardDescription>OS platforms utilized by visitors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[320px] overflow-y-auto pr-2 no-scrollbar">
            {data.os.map((sys) => {
              const pct = getPercentage(sys.value)
              return (
                <div key={sys.name} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold">{sys.name}</span>
                    <span className="text-muted-foreground font-mono">{sys.value} ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full bg-muted/60 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
