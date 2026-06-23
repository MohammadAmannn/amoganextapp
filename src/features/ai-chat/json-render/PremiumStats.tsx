/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import * as Icons from 'lucide-react'
import {
  Area,
  AreaChart,
  XAxis,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  Cell,
  Pie,
  PieChart
} from 'recharts'

interface PremiumStatsProps {
  variant?: string
  title?: string
  description?: string
  data?: any[]
  // Variant 11 / 12 specific
  buttonLabel?: string
  upgradeUrl?: string
  // Variant 13 specific
  used?: number
  total?: number
  usedLabel?: string
  totalLabel?: string
  segments?: Array<{ label: string; value: number; color: string }>
  // Variant 14 specific
  change?: string
}

const colorClasses: Record<string, string> = {
  emerald: "bg-emerald-500 dark:bg-emerald-400",
  amber: "bg-amber-500 dark:bg-amber-400",
  rose: "bg-rose-500 dark:bg-rose-400",
  blue: "bg-blue-500 dark:bg-blue-400",
  purple: "bg-purple-500 dark:bg-purple-400",
  orange: "bg-orange-500 dark:bg-orange-400",
  gray: "bg-gray-500 dark:bg-gray-400",
  muted: "bg-muted"
}

// Fallback data generators if data isn't supplied
const getFallbackData = (variant: string) => {
  switch (variant) {
    case '01':
    case '03':
    case '04':
      return [
        { name: "Profit", value: "$287,654.00", change: "+8.32%", changeType: "positive" },
        { name: "Late payments", value: "$9,435.00", change: "-12.64%", changeType: "negative" },
        { name: "Pending orders", value: "$173,229.00", change: "+2.87%", changeType: "positive" },
        { name: "Operating costs", value: "$52,891.00", change: "-5.73%", changeType: "negative" }
      ]
    case '02':
      return [
        { metric: "Active Users", current: "128,456", previous: "115,789", difference: "10.9%", trend: "up" },
        { metric: "Conversion Rate", current: "5.32%", previous: "6.18%", difference: "0.86%", trend: "down" },
        { metric: "Avg. Session Duration", current: "3m 42s", previous: "3m 15s", difference: "13.8%", trend: "up" }
      ]
    case '05':
      return [
        { name: "Monthly recurring revenue", value: "$34.1K", change: "+6.1%", changeType: "positive", href: "#" },
        { name: "Users", value: "500.1K", change: "+19.2%", changeType: "positive", href: "#" },
        { name: "User growth", value: "11.3%", change: "-1.2%", changeType: "negative", href: "#" }
      ]
    case '06':
      return [
        { name: 'Europe', stat: '$10,023', goalsAchieved: 3, status: 'observe', href: '#' },
        { name: 'North America', stat: '$14,092', goalsAchieved: 5, status: 'within', href: '#' },
        { name: 'Asia', stat: '$113,232', goalsAchieved: 1, status: 'critical', href: '#' }
      ]
    case '07':
      return [
        { name: 'Workspaces', capacity: 20, current: 1, allowed: 5, fill: 'hsl(var(--primary))' },
        { name: 'Dashboards', capacity: 10, current: 2, allowed: 20, fill: 'var(--chart-2)' },
        { name: 'Chart widgets', capacity: 30, current: 15, allowed: 50, fill: 'var(--chart-3)' },
        { name: 'Storage', capacity: 50, current: 25, allowed: 100, fill: 'var(--chart-4)' }
      ]
    case '08':
      return [
        { name: "HR", progress: 25, budget: "$1,000", current: "$250", href: "#", fill: "var(--chart-1)" },
        { name: "Marketing", progress: 55, budget: "$1,000", current: "$550", href: "#", fill: "var(--chart-2)" },
        { name: "Finance", progress: 85, budget: "$1,000", current: "$850", href: "#", fill: "var(--chart-3)" },
        { name: "Engineering", progress: 70, budget: "$2,000", current: "$1,400", href: "#", fill: "var(--chart-4)" }
      ]
    case '09':
      return [
        { name: "Requests", stat: "996", limit: "10,000", percentage: 9.96 },
        { name: "Credits", stat: "$672", limit: "$1,000", percentage: 67.2 },
        { name: "Storage", stat: "1.85", limit: "10GB", percentage: 18.5 },
        { name: "API Calls", stat: "4,328", limit: "5,000", percentage: 86.56 }
      ]
    case '10':
      return [
        {
          name: "Alpha Corp", tickerSymbol: "ACP", value: "$168.59", change: "+15.86", percentageChange: "+10.4%", changeType: "positive",
          chartData: [
            { date: "Nov 24", value: 142.87 }, { date: "Nov 25", value: 151.43 }, { date: "Nov 26", value: 157.28 },
            { date: "Nov 27", value: 162.94 }, { date: "Nov 28", value: 148.37 }, { date: "Nov 29", value: 139.56 },
            { date: "Nov 30", value: 145.83 }, { date: "Dec 01", value: 138.29 }, { date: "Dec 02", value: 129.64 }
          ]
        },
        {
          name: "Beta Solutions", tickerSymbol: "BTS", value: "$78.54", change: "+4.65", percentageChange: "+6.3%", changeType: "positive",
          chartData: [
            { date: "Nov 24", value: 65.32 }, { date: "Nov 25", value: 59.78 }, { date: "Nov 26", value: 64.21 },
            { date: "Nov 27", value: 57.46 }, { date: "Nov 28", value: 49.82 }, { date: "Nov 29", value: 55.63 },
            { date: "Nov 30", value: 61.27 }, { date: "Dec 01", value: 68.94 }, { date: "Dec 02", value: 74.56 }
          ]
        }
      ]
    case '11':
      return [
        {
          name: "Commands", value: "13.8M", limit: "Unlimited", percentage: 67, progressColor: "bg-blue-500",
          details: [
            { label: "Writes", value: "11,276,493", color: "bg-emerald-500" },
            { label: "Reads", value: "2,548,921", color: "bg-blue-500" }
          ],
          actionLabel: "Upgrade"
        },
        {
          name: "Bandwidth", value: "141 GB", limit: "150 GB", percentage: 94, progressColor: "bg-orange-500",
          warningMessage: "Excessive bandwidth charges may apply.",
          actionLabel: "Upgrade"
        }
      ]
    case '12':
      return [
        { name: "ISR Reads", current: "358K", limit: "1M", percentage: 35.8 },
        { name: "Edge Requests", current: "317K", limit: "1M", percentage: 31.7 },
        { name: "Fast Origin Transfer", current: "3.07 GB", limit: "10 GB", percentage: 30.7 },
        { name: "Speed Insights Data Points", current: "791", limit: "10K", percentage: 7.9 }
      ]
    case '14':
      return [
        { label: "Compute", amount: 450, percentage: 52.3, color: "emerald" },
        { label: "Storage", amount: 285, percentage: 33.1, color: "amber" },
        { label: "Bandwidth", amount: 125, percentage: 14.6, color: "rose" }
      ]
    case '15':
      return [
        { label: "After 1 year", value: "$2,400", percentage: "+8.2%" },
        { label: "After 5 years", value: "$14,800", percentage: "+24.6%" },
        { label: "After 10 years", value: "$38,500", percentage: "+52.1%" }
      ]
    default:
      return []
  }
}

export function PremiumStats({
  variant = '01',
  title,
  description,
  data: customData,
  buttonLabel = "Upgrade",
  upgradeUrl = "#",
  used = 8300,
  total = 15,
  usedLabel = "MB",
  totalLabel = "GB",
  segments,
  change = "+12.5%"
}: PremiumStatsProps) {
  const data = customData || getFallbackData(variant)

  // Double check variant layout fallback
  const normalizedVariant = variant.padStart(2, '0')

  // Render helper for single items trends
  const renderTrendBadge = (trend: string, change: string) => {
    const isUp = trend === 'up' || change.startsWith('+')
    return (
      <Badge
        variant="outline"
        className={cn(
          "tabular-nums inline-flex items-center px-1.5 ps-2.5 py-0.5 text-xs font-medium",
          isUp
            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-900/50"
            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-900/50"
        )}
      >
        {isUp ? (
          <Icons.TrendingUp className="mr-0.5 -ml-1 h-3.5 w-3.5 shrink-0 text-green-500" />
        ) : (
          <Icons.TrendingDown className="mr-0.5 -ml-1 h-3.5 w-3.5 shrink-0 text-red-500" />
        )}
        {change}
      </Badge>
    )
  }

  const renderTrendText = (trend: string | undefined, change: string) => {
    const isPositive = trend === 'positive' || trend === 'up' || change.startsWith('+')
    return (
      <span
        className={cn(
          "text-xs font-medium tabular-nums",
          isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
        )}
      >
        {change}
      </span>
    )
  }

  // 1. Stats with Trending (No card border in items, custom grid)
  if (normalizedVariant === '01') {
    return (
      <div className="w-full">
        {title && <h3 className="text-lg font-semibold mb-4 text-foreground">{title}</h3>}
        {description && <p className="text-sm text-muted-foreground mb-6">{description}</p>}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-px rounded-xl bg-border overflow-hidden border">
          {data.map((stat: any, index: number) => (
            <Card key={stat.name || index} className="rounded-none border-0 py-0 shadow-none">
              <CardContent className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 p-4 sm:p-6 bg-background">
                <div className="text-sm font-medium text-muted-foreground">
                  {stat.name}
                </div>
                {renderTrendText(stat.changeType, stat.change)}
                <div className="tabular-nums w-full flex-none text-3xl font-semibold tracking-tight text-foreground">
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // 2. Stats with Borders
  if (normalizedVariant === '02') {
    return (
      <div className="w-full">
        {title && <h3 className="text-lg font-semibold mb-4 text-foreground">{title}</h3>}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-px bg-border overflow-hidden rounded-lg">
          {data.map((item: any, idx: number) => (
            <Card key={item.metric || idx} className="rounded-none border-0 shadow-none py-0 bg-background">
              <CardContent className="p-4 sm:p-6">
                <CardTitle className="text-base font-normal text-muted-foreground">
                  {item.metric || item.name}
                </CardTitle>
                <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2 md:block lg:flex">
                  <div className="tabular-nums flex items-baseline text-2xl font-bold text-foreground">
                    {item.current || item.value}
                    {item.previous && (
                      <span className="tabular-nums ml-2 text-xs font-normal text-muted-foreground">
                        from {item.previous}
                      </span>
                    )}
                  </div>
                  {renderTrendBadge(item.trend, item.difference || item.change)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // 3. Stats with Card Layout
  if (normalizedVariant === '03') {
    return (
      <div className="w-full">
        {title && <h3 className="text-lg font-semibold mb-4 text-foreground">{title}</h3>}
        <dl className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4 w-full">
          {data.map((item: any, index: number) => (
            <Card key={item.name || index} className="p-6 py-4 shadow-none border-0 bg-muted/40">
              <CardContent className="p-0">
                <dt className="text-sm font-medium text-muted-foreground">{item.name}</dt>
                <dd className="mt-2 flex items-baseline justify-between">
                  <span className="tabular-nums text-3xl font-semibold text-foreground">
                    {item.stat || item.value}
                  </span>
                  {renderTrendText(item.changeType, item.change)}
                </dd>
              </CardContent>
            </Card>
          ))}
        </dl>
      </div>
    )
  }

  // 4. Stats with Badges
  if (normalizedVariant === '04') {
    return (
      <div className="w-full">
        {title && <h3 className="text-lg font-semibold mb-4 text-foreground">{title}</h3>}
        <dl className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4 w-full">
          {data.map((item: any, index: number) => (
            <Card key={item.name || index} className="p-6 py-4 w-full shadow-none border-0 bg-muted/40">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <dt className="text-sm font-medium text-muted-foreground truncate mr-2">{item.name}</dt>
                  {renderTrendBadge(item.changeType || 'up', item.change)}
                </div>
                <dd className="tabular-nums text-3xl font-semibold text-foreground mt-3">
                  {item.stat || item.value}
                </dd>
              </CardContent>
            </Card>
          ))}
        </dl>
      </div>
    )
  }

  // 5. Stats with Links
  if (normalizedVariant === '05') {
    return (
      <div className="w-full">
        {title && <h3 className="text-lg font-semibold mb-4 text-foreground">{title}</h3>}
        <dl className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4 w-full">
          {data.map((item: any, index: number) => (
            <Card key={item.name || index} className="p-0 gap-0 shadow-none border-0 bg-muted/40 flex flex-col justify-between">
              <CardContent className="p-6 pb-4">
                <dd className="flex items-start justify-between space-x-2">
                  <span className="truncate text-sm text-muted-foreground">{item.name}</span>
                  {renderTrendText(item.changeType, item.change)}
                </dd>
                <dd className="tabular-nums mt-2 text-3xl font-semibold text-foreground">
                  {item.value || item.stat}
                </dd>
              </CardContent>
              <CardFooter className="flex justify-end border-t border-border p-0 bg-muted/50 rounded-b-xl">
                <a
                  href={item.href || "#"}
                  className="px-6 py-3 text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1"
                >
                  View more <Icons.ChevronRight className="h-3 w-3" />
                </a>
              </CardFooter>
            </Card>
          ))}
        </dl>
      </div>
    )
  }

  // 6. Stats with Status
  if (normalizedVariant === '06') {
    return (
      <div className="w-full">
        {title && <h3 className="text-lg font-semibold mb-4 text-foreground">{title}</h3>}
        <dl className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4 w-full">
          {data.map((item: any, idx: number) => {
            const statusColor = item.status === 'within'
              ? 'bg-emerald-500'
              : item.status === 'observe'
                ? 'bg-yellow-500'
                : 'bg-red-500'

            const textColor = item.status === 'within'
              ? 'text-emerald-700 dark:text-emerald-400'
              : item.status === 'observe'
                ? 'text-yellow-700 dark:text-yellow-400'
                : 'text-red-700 dark:text-red-400'

            return (
              <Card key={item.name || idx} className="relative p-6 shadow-none border-0 bg-muted/40">
                <CardContent className="p-0">
                  <dt className="text-sm font-medium text-muted-foreground truncate">
                    {item.name}
                  </dt>
                  <dd className="text-3xl font-bold text-foreground tabular-nums mt-1">
                    {item.stat || item.value}
                  </dd>
                  <div className="group relative mt-6 flex items-center space-x-4 rounded-lg bg-muted/50 p-3 hover:bg-muted/80 transition-colors">
                    <div className="flex w-full items-center justify-between truncate">
                      <div className="flex items-center space-x-3">
                        <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white", statusColor)}>
                          {item.status === 'within' ? (
                            <Icons.Check className="size-4 shrink-0" />
                          ) : item.status === 'observe' ? (
                            <Icons.Eye className="size-4 shrink-0" />
                          ) : (
                            <Icons.AlertTriangle className="size-4 shrink-0" />
                          )}
                        </span>
                        <div>
                          <p className="text-xs text-muted-foreground font-medium">
                            {item.goalsAchieved || 0}/5 goals achieved
                          </p>
                          <p className={cn("text-xs font-semibold capitalize mt-0.5", textColor)}>
                            {item.status}
                          </p>
                        </div>
                      </div>
                      <Icons.ChevronRight className="size-4 shrink-0 text-muted-foreground/60" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </dl>
      </div>
    )
  }

  // 7. Stats with Circular Progress
  if (normalizedVariant === '07') {
    const radialConfig = {
      capacity: {
        label: 'Capacity',
        color: 'hsl(var(--primary))',
      },
    } satisfies ChartConfig

    return (
      <div className="w-full">
        {title && <h2 className="text-lg font-semibold text-foreground">{title}</h2>}
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        <dl className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
          {data.map((item: any, idx: number) => {
            const percentage = item.capacity || Math.round((item.current / item.allowed) * 100) || 0
            const displayPercentage = isNaN(percentage) ? 0 : Math.min(percentage, 100)

            return (
              <Card key={item.name || idx} className="p-4 shadow-none border-0 bg-muted/40">
                <CardContent className="flex items-center space-x-4 p-0">
                  <div className="relative flex items-center justify-center shrink-0">
                    <ChartContainer
                      config={radialConfig}
                      className="h-[75px] w-[75px]"
                    >
                      <RadialBarChart
                        data={[{ ...item, capacity: displayPercentage }]}
                        innerRadius={26}
                        outerRadius={36}
                        barSize={5}
                        startAngle={90}
                        endAngle={-270}
                      >
                        <PolarAngleAxis
                          type="number"
                          domain={[0, 100]}
                          angleAxisId={0}
                          tick={false}
                          axisLine={false}
                        />
                        <RadialBar
                          dataKey="capacity"
                          background
                          cornerRadius={10}
                          fill={item.fill || "hsl(var(--primary))"}
                          angleAxisId={0}
                        />
                      </RadialBarChart>
                    </ChartContainer>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-semibold text-foreground">
                        {displayPercentage}%
                      </span>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-sm font-semibold text-foreground truncate">
                      {item.name}
                    </dt>
                    <dd className="text-xs text-muted-foreground mt-0.5">
                      {item.current} of {item.allowed} used
                    </dd>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </dl>
      </div>
    )
  }

  // 8. Stats with Circular Progress and Links
  if (normalizedVariant === '08') {
    const radialConfig = {
      progress: {
        label: "Progress",
        color: "hsl(var(--primary))",
      },
    } satisfies ChartConfig

    return (
      <div className="w-full">
        {title && <h3 className="text-lg font-semibold mb-4 text-foreground">{title}</h3>}
        <dl className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 w-full">
          {data.map((item: any, idx: number) => {
            const percentage = item.progress || 0
            return (
              <Card key={item.name || idx} className="p-0 gap-0 shadow-none border-0 bg-muted/40 flex flex-col justify-between">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative flex items-center justify-center shrink-0">
                      <ChartContainer config={radialConfig} className="h-[70px] w-[70px]">
                        <RadialBarChart
                          data={[item]}
                          innerRadius={24}
                          outerRadius={34}
                          barSize={5}
                          startAngle={90}
                          endAngle={-270}
                        >
                          <PolarAngleAxis
                            type="number"
                            domain={[0, 100]}
                            angleAxisId={0}
                            tick={false}
                            axisLine={false}
                          />
                          <RadialBar
                            dataKey="progress"
                            background
                            cornerRadius={10}
                            fill={item.fill || "hsl(var(--primary))"}
                            angleAxisId={0}
                          />
                        </RadialBarChart>
                      </ChartContainer>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-semibold text-foreground">{percentage}%</span>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <dd className="text-sm font-bold text-foreground truncate">
                        {item.current} / {item.budget}
                      </dd>
                      <dt className="text-xs text-muted-foreground truncate mt-0.5">
                        {item.name}
                      </dt>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-end border-t border-border p-0 bg-muted/40 rounded-b-xl">
                  <a
                    href={item.href || "#"}
                    className="text-xs font-semibold text-primary px-4 py-2 hover:text-primary/85 flex items-center gap-1"
                  >
                    View details <Icons.ArrowRight className="h-3 w-3" />
                  </a>
                </CardFooter>
              </Card>
            )
          })}
        </dl>
      </div>
    )
  }

  // 9. Stats with Progress
  if (normalizedVariant === '09') {
    return (
      <div className="w-full">
        {title && <h3 className="text-lg font-semibold mb-4 text-foreground">{title}</h3>}
        <dl className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 w-full">
          {data.map((item: any, idx: number) => (
            <Card key={item.name || idx} className="py-4 shadow-none border-0 bg-muted/40">
              <CardContent className="p-4">
                <dt className="text-sm text-muted-foreground truncate">{item.name}</dt>
                <dd className="tabular-nums text-2xl font-bold text-foreground mt-1">{item.stat || item.value}</dd>
                <Progress value={item.percentage} className="mt-4 h-1.5" />
                <dd className="mt-2 flex items-center justify-between text-xs font-medium">
                  <span className="text-primary">{item.percentage}%</span>
                  <span className="text-muted-foreground">
                    of {item.limit}
                  </span>
                </dd>
              </CardContent>
            </Card>
          ))}
        </dl>
      </div>
    )
  }

  // 10. Stats with Area Chart
  if (normalizedVariant === '10') {
    return (
      <div className="w-full">
        {title && <h3 className="text-lg font-semibold mb-4 text-foreground">{title}</h3>}
        <dl className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4 w-full">
          {data.map((item: any, idx: number) => {
            const sanitizedName = (item.name || `stat-${idx}`).replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "_").toLowerCase()
            const gradientId = `gradient-${sanitizedName}`
            const hasPositiveChange = item.changeType === 'positive' || !item.change?.startsWith('-')
            const strokeColor = hasPositiveChange ? "hsl(142.1 76.2% 36.3%)" : "hsl(0 72.2% 50.6%)"

            const defaultPoints = [
              { date: "Day 1", value: 10 }, { date: "Day 2", value: 15 }, { date: "Day 3", value: 13 },
              { date: "Day 4", value: 20 }, { date: "Day 5", value: 18 }, { date: "Day 6", value: 25 },
              { date: "Day 7", value: 24 }, { date: "Day 8", value: 30 }
            ]

            const points = item.chartData || defaultPoints

            return (
              <Card key={item.name || idx} className="p-0 shadow-none border-0 bg-muted/40 flex flex-col justify-between overflow-hidden">
                <CardContent className="p-4 pb-0">
                  <div>
                    <dt className="text-sm font-semibold text-foreground flex items-center justify-between">
                      <span>{item.name}</span>
                      {item.tickerSymbol && (
                        <span className="font-normal text-xs text-muted-foreground">({item.tickerSymbol})</span>
                      )}
                    </dt>
                    <div className="flex items-baseline justify-between mt-2">
                      <dd className={cn(
                        hasPositiveChange ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
                        "text-xl font-bold"
                      )}>
                        {item.value}
                      </dd>
                      <dd className="flex items-center space-x-1 text-xs">
                        <span className="font-medium text-foreground">{item.change}</span>
                        <span className={cn(
                          hasPositiveChange ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                        )}>
                          ({item.percentageChange || item.change})
                        </span>
                      </dd>
                    </div>
                  </div>

                  <div className="mt-4 h-16 w-full overflow-hidden">
                    <ChartContainer
                      className="w-full h-full"
                      config={{
                        val: {
                          label: item.name,
                          color: strokeColor,
                        },
                      }}
                    >
                      <AreaChart data={points}>
                        <defs>
                          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" hide />
                        <Area
                          dataKey="value"
                          stroke={strokeColor}
                          fill={`url(#${gradientId})`}
                          fillOpacity={0.3}
                          strokeWidth={1.5}
                          type="monotone"
                        />
                      </AreaChart>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </dl>
      </div>
    )
  }

  // 11. Stats Dashboard with Progress Bars
  if (normalizedVariant === '11') {
    return (
      <div className="w-full">
        {title && <h3 className="text-lg font-semibold mb-4 text-foreground">{title}</h3>}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          {data.map((item: any, idx: number) => {
            const hasMultipleSegments = item.details && item.details.length > 0;
            return (
              <Card key={item.name || idx} className="relative overflow-hidden shadow-none border-0 bg-muted/40 pb-10 flex flex-col justify-between">
                <CardContent className="p-4">
                  <h5 className="text-xs font-bold leading-none tracking-wide text-muted-foreground uppercase">
                    {item.name}
                  </h5>

                  <div className="mt-3 flex items-baseline gap-1.5">
                    <div className="text-lg font-bold leading-none text-foreground tabular-nums">
                      {item.value}
                    </div>
                    <div className="text-xs leading-none text-muted-foreground">/ {item.limit}</div>
                  </div>

                  <div className="mt-4">
                    {/* Render custom multi segment progress bar or simple bar */}
                    {hasMultipleSegments ? (
                      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        {item.details.map((detail: any, detailIdx: number) => {
                          // Simple layout calculation for segments
                          const detailVal = parseInt(detail.value.replace(/,/g, "")) || 0
                          const totalVal = item.details.reduce((sum: number, curr: any) => sum + (parseInt(curr.value.replace(/,/g, "")) || 0), 0)
                          const pct = totalVal > 0 ? (detailVal / totalVal) * 100 : 0
                          // Running index calculation
                          let prevPct = 0
                          for (let i = 0; i < detailIdx; i++) {
                            const prevVal = parseInt(item.details[i].value.replace(/,/g, "")) || 0
                            prevPct += totalVal > 0 ? (prevVal / totalVal) * 100 : 0
                          }
                          return (
                            <div
                              key={detailIdx}
                              className={cn("absolute left-0 h-full origin-left", colorClasses[detail.color.replace('bg-', '')] || "bg-primary")}
                              style={{
                                width: `${pct}%`,
                                transform: `translateX(${prevPct}%)`
                              }}
                            />
                          )
                        })}
                      </div>
                    ) : (
                      <Progress value={item.percentage} className="h-1.5" />
                    )}

                    {item.details && (
                      <div className="mt-4 space-y-2">
                        {item.details.map((detail: any, detailIdx: number) => (
                          <div
                            key={detailIdx}
                            className="flex w-full items-center text-xs leading-none text-muted-foreground"
                          >
                            <div className={cn("mr-1.5 h-2 w-2 rounded-full shrink-0", colorClasses[detail.color.replace('bg-', '')] || "bg-primary")} />
                            <div className="truncate mr-1">{detail.label}</div>
                            <div className="h-[2px] flex-1 border-b border-dotted border-border" />
                            <div className="ml-1.5 tabular-nums font-medium text-foreground">{detail.value}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {item.status && (
                      <div className="pt-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        {item.status}
                      </div>
                    )}

                    {item.warningMessage && (
                      <div className="pt-3 text-xs text-amber-600 dark:text-amber-400">
                        {item.warningMessage}
                      </div>
                    )}
                  </div>
                </CardContent>

                <div className="absolute bottom-0 left-0 right-0">
                  <a
                    href={upgradeUrl}
                    className="h-8 w-full border-t border-border flex items-center justify-start px-4 text-xs font-semibold text-blue-500 hover:text-blue-600 bg-muted/40 rounded-b-xl hover:bg-muted/60 transition-colors gap-1"
                  >
                    <Icons.Settings className="h-3 w-3" />
                    {item.actionLabel || buttonLabel}
                  </a>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  // 12. Stats Usage Dashboard (Card with list of donut chart progress bars)
  if (normalizedVariant === '12') {
    const backgroundData = [{ name: "background", value: 100 }]

    return (
      <Card className="w-full max-w-md shadow-none border-0 bg-transparent p-0 overflow-hidden">
        <CardHeader className="px-5 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex flex-col min-w-0">
              <h3 className="text-sm font-semibold truncate text-foreground">{title || "Last 30 days"}</h3>
              {description && (
                <p className="text-xs text-muted-foreground font-medium mt-0.5 truncate">
                  {description}
                </p>
              )}
            </div>
            <a href={upgradeUrl}>
              <Badge className="cursor-pointer hover:bg-primary/95 text-xs px-2.5 py-0.5">{buttonLabel}</Badge>
            </a>
          </div>
        </CardHeader>

        <CardContent className="p-3">
          <div className="space-y-1">
            {data.map((item: any, index: number) => {
              const pct = Math.max(0, Math.min(100, item.percentage || 0))
              const foregroundData = [
                { name: "used", value: pct },
                { name: "empty", value: 100 - pct }
              ]

              return (
                <div
                  key={item.name || index}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-muted/50",
                    index % 2 === 1 ? "bg-muted/15" : ""
                  )}
                >
                  {/* Small inline donut chart */}
                  <div className="w-6 h-6 shrink-0 relative flex items-center justify-center">
                    <ChartContainer
                      config={{
                        used: { label: "Used", color: "hsl(var(--primary))" }
                      }}
                      className="w-full h-full aspect-square"
                    >
                      <PieChart>
                        <Pie
                          data={backgroundData}
                          dataKey="value"
                          cx="50%"
                          cy="50%"
                          innerRadius={6}
                          outerRadius={9}
                          isAnimationActive={false}
                        >
                          <Cell fill="hsl(var(--muted))" opacity={0.6} />
                        </Pie>
                        <Pie
                          data={foregroundData}
                          dataKey="value"
                          cx="50%"
                          cy="50%"
                          innerRadius={6}
                          outerRadius={9}
                          startAngle={90}
                          endAngle={-270}
                        >
                          <Cell fill="hsl(var(--primary))" />
                          <Cell fill="transparent" />
                        </Pie>
                      </PieChart>
                    </ChartContainer>
                  </div>
                  <span className="text-sm flex-1 truncate font-medium text-foreground">{item.name}</span>
                  <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                    {item.current} / <span className="text-foreground">{item.limit}</span>
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    )
  }

  // 13. Stats with Segmented Progress
  if (normalizedVariant === '13') {
    const activeSegments = segments || [
      { label: "Used", value: used, color: "bg-blue-500" }
    ]
    const totalMB = total * 1000
    const freeValue = totalMB - used

    return (
      <Card className="w-full max-w-4xl shadow-none border-0 bg-transparent p-0">
        <CardContent className="p-6">
          <p className="mb-4 text-sm font-medium text-muted-foreground">
            {title || "Storage"}{" "}
            <span className="font-bold tabular-nums text-foreground">
              {used.toLocaleString()}{" "}{usedLabel}
            </span>{" "}
            of {total} {totalLabel}
          </p>

          <div className="mb-5 flex h-3 w-full overflow-hidden rounded-full bg-muted">
            {activeSegments.map((segment, index) => {
              const percentage = (segment.value / totalMB) * 100
              const colorBg = colorClasses[segment.color.replace('bg-', '')] || "bg-primary"
              return (
                <div
                  key={segment.label || index}
                  className={cn("h-full", colorBg)}
                  style={{ width: `${percentage}%` }}
                />
              )
            })}
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {activeSegments.map((segment, index) => {
              const colorBg = colorClasses[segment.color.replace('bg-', '')] || "bg-primary"
              return (
                <div key={segment.label || index} className="flex items-center gap-2">
                  <span className={cn("size-2.5 shrink-0 rounded-xs", colorBg)} />
                  <span className="text-xs font-medium text-muted-foreground truncate">{segment.label}</span>
                  <span className="text-xs font-semibold tabular-nums text-foreground">
                    {segment.value} {usedLabel}
                  </span>
                </div>
              )
            })}
            <div className="flex items-center gap-2">
              <span className="size-2.5 shrink-0 rounded-xs bg-muted" />
              <span className="text-xs font-medium text-muted-foreground">Free</span>
              <span className="text-xs font-semibold tabular-nums text-foreground">
                {Math.max(0, freeValue)} {usedLabel}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // 14. Stats with Usage Breakdown
  if (normalizedVariant === '14') {
    const totalAmount = data.reduce((sum: number, curr: any) => sum + (curr.amount || 0), 0)

    return (
      <Card className="w-full max-w-sm shadow-none border-0 bg-transparent p-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">{title || "Usage"}</h3>
            {change && renderTrendBadge('up', change)}
          </div>

          <p className="mt-3 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-foreground">{title === 'Usage' || !title ? `$${totalAmount}` : totalAmount}</span>
            {description && <span className="text-xs font-medium text-muted-foreground">{description}</span>}
          </p>

          <div className="mt-5">
            <p className="text-xs font-semibold text-foreground">Resource breakdown</p>
            <div className="mt-2.5 flex items-center gap-0.5">
              {data.map((item: any, index: number) => {
                const colorBg = colorClasses[item.color] || "bg-primary"
                return (
                  <div
                    key={index}
                    className={cn(colorBg, "h-1.5 rounded-xs")}
                    style={{ width: `${item.percentage}%` }}
                  />
                )
              })}
            </div>
          </div>

          <ul className="mt-5 space-y-2.5">
            {data.map((item: any, index: number) => {
              const colorBg = colorClasses[item.color] || "bg-primary"
              return (
                <li key={index} className="flex items-center gap-2 text-xs">
                  <span className={cn(colorBg, "size-2.5 rounded-xs shrink-0")} />
                  <span className="text-muted-foreground flex-1 truncate font-medium">{item.label}</span>
                  <span className="text-foreground font-semibold tabular-nums">
                    {item.amount.toLocaleString()} ({item.percentage}%)
                  </span>
                </li>
              )
            })}
          </ul>

          <p className="mt-6 text-xs text-muted-foreground">
            Configure limits in{" "}
            <a href="#" className="text-primary font-semibold hover:underline">
              resource settings.
            </a>
          </p>
        </CardContent>
      </Card>
    )
  }

  // 15. Stats with Value Breakdown
  if (normalizedVariant === '15') {
    return (
      <Card className="w-full max-w-sm shadow-none border-0 bg-transparent p-0">
        <h3 className="text-sm font-bold text-foreground mb-4">
          {title || "Value breakdown"}
        </h3>
        <ul className="divide-y divide-border text-sm">
          {data.map((item: any, index: number) => (
            <li key={index} className="flex items-center justify-between py-3">
              <span className="text-muted-foreground text-xs font-medium truncate mr-2">{item.label}</span>
              <span className="flex items-center gap-2.5 tabular-nums shrink-0">
                <span className="font-bold text-foreground text-sm">
                  {item.value}
                </span>
                <span className="h-4 w-px bg-border" />
                {renderTrendBadge(item.percentage.startsWith('+') ? 'up' : 'down', item.percentage)}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    )
  }

  // Default fallback if variant doesn't match
  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle>{title || "Stats"}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {data.map((item: any, index: number) => (
            <div key={index} className="p-3 border rounded-lg">
              <div className="text-xs text-muted-foreground">{item.name || item.metric}</div>
              <div className="text-lg font-bold">{item.value || item.stat || item.current}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
