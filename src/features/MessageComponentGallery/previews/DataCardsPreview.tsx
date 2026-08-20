'use client'

import React, { useState } from 'react'
import {
  Plug,
  Check,
  CreditCard,
  Wifi,
  ShoppingBag,
  Star,
  UserPlus,
  Calendar,
  Clock,
  MapPin,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  MoreVertical,
  Sliders,
  CheckCircle2,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'

/** 1. Card 19 - Integration Card */
export function IntegrationCardPreview() {
  const [isConnected, setIsConnected] = useState(true)

  return (
    <div className="w-full max-w-sm mx-auto">
      <Card className="border-border/80 shadow-xs hover:shadow-sm transition-all">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200/40 dark:border-indigo-900/40">
                <Plug className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold">Slack Integration</CardTitle>
                <CardDescription className="text-[11px]">Sync alerts & daily notifications</CardDescription>
              </div>
            </div>
            <Switch
              checked={isConnected}
              onCheckedChange={setIsConnected}
              className="cursor-pointer"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Automatically post real-time system alerts, user feedback, and deployment status updates directly to your Slack #general channel.
          </p>
        </CardContent>
        <CardFooter className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
          <Badge
            className={
              isConnected
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200/50 dark:text-emerald-400 text-[10px] font-bold'
                : 'bg-muted text-muted-foreground text-[10px] font-bold'
            }
          >
            {isConnected ? '● Connected' : 'Disconnected'}
          </Badge>
          <Button variant="ghost" size="sm" className="h-7 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 p-0 font-semibold cursor-pointer">
            Configure settings →
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

/** 2. Card 18 - Credit Card */
export function CreditCardPreview() {
  return (
    <div className="w-full max-w-sm mx-auto select-none">
      <div className="relative h-48 w-full rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-5 text-white shadow-lg border border-indigo-500/30 flex flex-col justify-between overflow-hidden">
        {/* Decorative background glow circles */}
        <div className="absolute -right-10 -bottom-10 h-36 w-36 rounded-full bg-indigo-500/20 blur-2xl" />
        <div className="absolute -left-10 -top-10 h-36 w-36 rounded-full bg-purple-500/20 blur-2xl" />

        {/* Top Row: Chip & Contactless */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-7 w-9 rounded-md bg-gradient-to-tr from-amber-300 via-amber-200 to-amber-400 border border-amber-400/80 shadow-2xs flex items-center justify-center">
              <div className="h-4 w-6 rounded-xs border border-amber-600/40" />
            </div>
            <Wifi className="h-4 w-4 text-slate-300 rotate-90" />
          </div>
          <span className="font-extrabold text-sm tracking-widest text-indigo-200 italic">VISA</span>
        </div>

        {/* Middle: Number */}
        <div className="relative z-10 tracking-widest font-mono text-lg font-bold text-slate-100 py-2">
          4242 •••• •••• 8892
        </div>

        {/* Bottom Row: Name & Expiry */}
        <div className="flex items-center justify-between relative z-10 text-xs">
          <div>
            <p className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Card Holder</p>
            <p className="font-bold tracking-wide text-slate-100 uppercase">ALEX M. JOHNSON</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Expires</p>
            <p className="font-bold tracking-wide text-slate-100">12 / 28</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/** 3. Card 17 - Ecommerce Product Variant Card */
export function EcommerceProductCardPreview() {
  const [selectedSize, setSelectedSize] = useState('US 9')
  const [selectedColor, setSelectedColor] = useState('black')

  return (
    <div className="w-full max-w-sm mx-auto">
      <Card className="border-border/80 shadow-xs overflow-hidden">
        <div className="relative h-44 w-full bg-muted/30 flex items-center justify-center border-b border-border/40 p-4">
          <Badge className="absolute top-3 left-3 bg-rose-500 text-white text-[10px] font-bold uppercase">
            20% OFF
          </Badge>
          <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500/10 to-indigo-500/20 text-indigo-600">
            <ShoppingBag className="h-16 w-16 opacity-80" />
          </div>
        </div>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold">Air Max Pulse 3D</CardTitle>
            <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
              <Star className="h-3.5 w-3.5 fill-amber-500" />
              <span>4.9</span>
            </div>
          </div>
          <CardDescription className="text-xs">Premium lightweight running shoes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-foreground">$189.00</span>
            <span className="text-xs text-muted-foreground line-through">$235.00</span>
          </div>

          {/* Variants: Color */}
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground block mb-1.5">Color Variant</span>
            <div className="flex items-center gap-2">
              {[
                { id: 'black', class: 'bg-slate-900' },
                { id: 'blue', class: 'bg-indigo-600' },
                { id: 'white', class: 'bg-slate-100 border border-slate-300' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedColor(c.id)}
                  className={`h-5 w-5 rounded-full ${c.class} cursor-pointer transition-transform ${
                    selectedColor === c.id ? 'ring-2 ring-primary ring-offset-2 scale-110' : ''
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Variants: Size */}
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground block mb-1.5">Select Size</span>
            <div className="flex gap-1.5">
              {['US 8', 'US 9', 'US 10', 'US 11'].map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSelectedSize(sz)}
                  className={`flex-1 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    selectedSize === sz
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border/80 bg-background text-muted-foreground hover:border-border'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <Button className="w-full h-9 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-2xs">
            Add to Cart
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

/** 4. Card 11 - Assign Task Card */
export function AssignTaskCardPreview() {
  const [assignedUser, setAssignedUser] = useState('Sarah Chen')

  return (
    <div className="w-full max-w-sm mx-auto">
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Badge className="bg-purple-500/10 text-purple-600 border-purple-200/50 text-[10px] font-bold">
              Task Assignment
            </Badge>
            <span className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">High Priority</span>
          </div>
          <CardTitle className="text-sm font-bold mt-2">Design System Audit & Token Migration</CardTitle>
          <CardDescription className="text-xs">Audit existing primitives and update tokens to Tailwind v4.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Assignee selector */}
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1.5">Assignee</label>
            <div className="flex items-center justify-between p-2 rounded-xl border border-border/80 bg-background">
              <div className="flex items-center gap-2.5">
                <Avatar className="h-7 w-7">
                  <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" />
                  <AvatarFallback>SC</AvatarFallback>
                </Avatar>
                <span className="text-xs font-semibold text-foreground">{assignedUser}</span>
              </div>
              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-muted-foreground">
                Change
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-purple-600" />
              <span>Due: Aug 28, 2026</span>
            </span>
            <span className="font-semibold text-foreground">3 Days Remaining</span>
          </div>
        </CardContent>
        <CardFooter className="pt-2 border-t border-border/60">
          <Button className="w-full h-9 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-2xs gap-1.5">
            <UserPlus className="h-3.5 w-3.5" /> Assign Task Now
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

/** 5. Card 10 - Appointment Card */
export function AppointmentCardPreview() {
  return (
    <div className="w-full max-w-sm mx-auto">
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Badge className="bg-teal-500/10 text-teal-600 border-teal-200/50 text-[10px] font-bold">
              Upcoming Medical Sync
            </Badge>
            <Badge variant="outline" className="text-[9px] font-medium">Confirmed</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3.5">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border border-border">
              <AvatarImage src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120" />
              <AvatarFallback>EW</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="text-sm font-bold text-foreground">Dr. Emily Watson</h4>
              <p className="text-xs text-muted-foreground">Senior Cardiologist • General Health</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-muted/20 border border-border/60 space-y-1.5 text-xs">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Calendar className="h-3.5 w-3.5 text-teal-600 shrink-0" />
              <span>Thursday, August 24, 2026</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-teal-600 shrink-0" />
              <span>10:30 AM – 11:15 AM (45 mins)</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-teal-600 shrink-0" />
              <span>Room 402, Building B • Medical Plaza</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-2 border-t border-border/60 flex gap-2">
          <Button variant="outline" className="flex-1 h-8 text-xs font-semibold border-border">
            Reschedule
          </Button>
          <Button className="flex-1 h-8 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white cursor-pointer shadow-2xs">
            Join Telehealth
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

/** 6. Card 06 - Statistics Card */
export function StatisticsCardPreview() {
  return (
    <div className="w-full max-w-sm mx-auto">
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Monthly Active Revenue
            </CardTitle>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-foreground">$128,450.00</span>
            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200/50 text-[10px] font-bold">
              +18.4%
            </Badge>
          </div>
          <CardDescription className="text-[11px] text-muted-foreground mt-0.5">
            Compared to $108,520.00 last month
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          {/* Mini Sparkline Visualization */}
          <div className="h-12 w-full flex items-end gap-1.5 pt-2">
            {[40, 55, 35, 60, 75, 65, 85, 90, 80, 95, 100].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/40 rounded-t-xs transition-colors"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </CardContent>
        <CardFooter className="pt-2 border-t border-border/60 flex justify-between text-xs text-muted-foreground">
          <span>Target: $140,000</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">91.7% Achieved</span>
        </CardFooter>
      </Card>
    </div>
  )
}

/** 7. Data Cards Suite Overview */
export function DataCardsPreview() {
  return (
    <div className="w-full h-full min-h-0 flex-1 flex flex-col bg-background p-4 md:p-6 overflow-y-auto font-sans select-none scrollbar-thin">
      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <IntegrationCardPreview />
        <CreditCardPreview />
        <EcommerceProductCardPreview />
        <AssignTaskCardPreview />
        <AppointmentCardPreview />
        <StatisticsCardPreview />
      </div>
    </div>
  )
}

export default DataCardsPreview
