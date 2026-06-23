/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Stack } from './Stack'
import {
  Select as SelectComponent,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar as AvatarUI, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Calendar } from '@/components/ui/calendar'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import * as Icons from 'lucide-react'
import { PremiumStats } from './PremiumStats'

// Registry mapping component types to React components
export const registry = {
  PremiumStats: (props: any) => <PremiumStats {...props} />,
  Form: ({ children, onSubmit, ...props }: any) => (
    <form
      className="space-y-4 w-full"
      onSubmit={(e) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const data = Object.fromEntries(formData.entries())
        
        toast.success('Form Submitted Successfully!', {
          description: (
            <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4 overflow-x-auto">
              <code className="text-white text-xs">{JSON.stringify(data, null, 2)}</code>
            </pre>
          ),
        })

        if (onSubmit) onSubmit(data)
      }}
      {...props}
    >
      {children}
    </form>
  ),
  Select: ({ label, placeholder, options = [], value, onValueChange, ...props }: any) => {
    const parsedOptions = Array.isArray(options)
      ? options.map((opt: any) =>
          typeof opt === 'string' ? { label: opt, value: opt } : opt
        )
      : []

    return (
      <div className="space-y-2">
        {label && <label className="text-sm font-medium">{label}{props.required && <span className="text-destructive ml-1">*</span>}</label>}
        <SelectComponent value={value} onValueChange={onValueChange} {...props}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={placeholder || 'Select an option'} />
          </SelectTrigger>
          <SelectContent>
            {parsedOptions.map((opt: any, index: number) => (
              <SelectItem key={opt.value || index} value={opt.value}>
                {opt.label || opt.value}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectComponent>
      </div>
    )
  },
  Grid: ({ children, cols = 1, gap = 'md', className, ...props }: any) => {
    const gapMap = {
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
    }
    const colsMap = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4',
      5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-5',
      6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
    }
    return (
      <div
        className={`grid ${colsMap[cols as keyof typeof colsMap] || 'grid-cols-1'} ${gapMap[gap as keyof typeof gapMap] || 'gap-4'} ${className || ''}`}
        {...props}
      >
        {children}
      </div>
    )
  },
  StatCard: ({ title, value, description, icon, className }: any) => {
    const IconComponent = icon && (Icons as any)[icon] ? (Icons as any)[icon] : null
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          {IconComponent && <IconComponent className="h-4 w-4 text-muted-foreground" />}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        </CardContent>
      </Card>
    )
  },
  Table: ({ headers = [], rows = [], className }: any) => (
    <div className={`w-full overflow-auto rounded-lg border border-border bg-card ${className || ''}`}>
      <table className="w-full text-sm">
        <thead className="bg-muted/50 border-b border-border text-muted-foreground text-left font-medium">
          <tr>
            {headers.map((h: string, idx: number) => (
              <th key={idx} className="p-3 font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row: any[], rIdx: number) => (
            <tr key={rIdx} className="hover:bg-muted/30 transition-colors">
              {row.map((cell: any, cIdx: number) => (
                <td key={cIdx} className="p-3">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
  Avatar: ({ src, fallback, size = 'md', className }: any) => {
    const sizeMap = {
      sm: 'h-8 w-8 text-xs',
      md: 'h-12 w-12 text-sm',
      lg: 'h-20 w-20 text-lg',
      xl: 'h-24 w-24 text-xl',
    }
    return (
      <AvatarUI className={`${sizeMap[size as keyof typeof sizeMap] || sizeMap.md} ${className || ''}`}>
        {src && <AvatarImage src={src} />}
        <AvatarFallback className="font-semibold bg-primary/10 text-primary">{fallback || 'U'}</AvatarFallback>
      </AvatarUI>
    )
  },
  Icon: ({ name, className, size = 18 }: any) => {
    const IconComponent = name && (Icons as any)[name] ? (Icons as any)[name] : Icons.HelpCircle
    return <IconComponent className={className} size={size} />
  },
  Stack: ({ children, ...props }: any) => <Stack {...props}>{children}</Stack>,
  Card: ({ children, title, description, className, maxWidth, centered }: any) => {
    const widthClass = maxWidth ? {
      xs: 'max-w-xs',
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
      '3xl': 'max-w-3xl',
      '4xl': 'max-w-4xl',
      '5xl': 'max-w-5xl',
      full: 'max-w-full',
    }[maxWidth as string] || '' : ''

    return (
      <Card className={`${widthClass} ${centered ? 'mx-auto' : ''} ${className || ''}`}>
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    )
  },
  Input: ({ label, required, ...props }: any) => (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}{required && <span className="text-destructive ml-1">*</span>}</label>}
      <Input required={required} {...props} />
    </div>
  ),
  Textarea: ({ label, required, ...props }: any) => (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}{required && <span className="text-destructive ml-1">*</span>}</label>}
      <Textarea required={required} {...props} />
    </div>
  ),
  Button: ({ label, type = 'button', ...props }: any) => <Button type={type} {...props}>{label}</Button>,
  Checkbox: ({ label, checked, required, name, ...props }: any) => (
    <div className="flex items-center space-x-2">
      <Checkbox id={name || label} name={name} required={required} checked={checked} {...props} />
      {label && <label htmlFor={name || label} className="text-sm cursor-pointer">{label}{required && <span className="text-destructive ml-1">*</span>}</label>}
    </div>
  ),
  Badge: ({ label, ...props }: any) => <Badge {...props}>{label}</Badge>,
  Alert: ({ children, title, description, variant }: any) => (
    <Alert variant={variant}>
      {title && <AlertTitle>{title}</AlertTitle>}
      {description && <AlertDescription>{description}</AlertDescription>}
      {children}
    </Alert>
  ),
  Separator: (props: any) => <Separator {...props} />,
  Progress: ({ value = 0, label }: any) => (
    <div className="space-y-2">
      {label && <div className="flex justify-between text-sm"><span className="font-medium">{label}</span><span className="text-muted-foreground">{value}%</span></div>}
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
    </div>
  ),
  Heading: ({ level = '2', children }: any) => {
    const HeadingTag = `h${level}` as any
    const sizeMap = {
      '1': 'text-4xl font-bold',
      '2': 'text-3xl font-semibold',
      '3': 'text-2xl font-semibold',
      '4': 'text-xl font-medium',
      '5': 'text-lg font-medium',
      '6': 'text-base font-medium',
    }
    return <HeadingTag className={sizeMap[level as keyof typeof sizeMap]}>{children}</HeadingTag>
  },
  Text: ({ children, size = 'base', className }: any) => {
    const sizeMap = {
      sm: 'text-sm text-muted-foreground',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
    }
    return <p className={`${(sizeMap as any)[size] || sizeMap.base} ${className || ''}`}>{children}</p>
  },
  Price: ({ amount, period }: any) => (
    <div className="flex items-baseline gap-1">
      <span className="text-3xl font-bold">{amount}</span>
      {period && <span className="text-sm text-muted-foreground">{period}</span>}
    </div>
  ),
  FeatureList: ({ features }: any) => (
    <ul className="space-y-2">
      {features.map((feature: string, index: number) => (
        <li key={index} className="flex items-center gap-2 text-sm">
          <span className="text-green-500">✓</span>
          {feature}
        </li>
      ))}
    </ul>
  ),
  Tabs: ({ tabs, defaultValue, className }: any) => {
    if (!tabs || !Array.isArray(tabs) || tabs.length === 0) return null
    const defaultTab = defaultValue || tabs[0].value
    return (
      <Tabs defaultValue={defaultTab} className={className || 'w-full'}>
        <TabsList className="w-full justify-start">
          {tabs.map((tab: any, index: number) => (
            <TabsTrigger key={index} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab: any, index: number) => (
          <TabsContent key={index} value={tab.value} className="mt-4">
            {typeof tab.content === 'string' ? (
              <p>{tab.content}</p>
            ) : (
              tab.content
            )}
          </TabsContent>
        ))}
      </Tabs>
    )
  },
  Calendar: ({ mode = 'single', selected, onSelect, className, ...props }: any) => (
    <div className={`p-3 border rounded-md inline-block bg-card ${className || ''}`}>
      <Calendar
        mode={mode}
        selected={selected}
        onSelect={onSelect}
        className="rounded-md"
        {...props}
      />
    </div>
  ),
  Switch: ({ label, checked, onCheckedChange, required, name, ...props }: any) => (
    <div className="flex items-center space-x-2">
      <Switch id={name || label} name={name} required={required} checked={checked} onCheckedChange={onCheckedChange} {...props} />
      {label && <label htmlFor={name || label} className="text-sm cursor-pointer">{label}{required && <span className="text-destructive ml-1">*</span>}</label>}
    </div>
  ),
  RadioGroup: ({ options, value, onValueChange, className, name, required, ...props }: any) => {
    if (!options || !Array.isArray(options)) return null
    return (
      <RadioGroup name={name} required={required} value={value} onValueChange={onValueChange} className={className || 'space-y-2'} {...props}>
        {options.map((opt: any, index: number) => {
          const optValue = typeof opt === 'string' ? opt : opt.value
          const optLabel = typeof opt === 'string' ? opt : opt.label
          return (
            <div key={optValue || index} className="flex items-center space-x-2">
              <RadioGroupItem value={optValue} id={`radio-${name || ''}-${index}`} />
              <label htmlFor={`radio-${name || ''}-${index}`} className="text-sm cursor-pointer">{optLabel}</label>
            </div>
          )
        })}
      </RadioGroup>
    )
  },
}
