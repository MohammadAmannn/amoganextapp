import React, { useState } from 'react'
import { Copy, Check, ExternalLink, Terminal, Shield, CheckCircle2, AlertTriangle, FileCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RouteInfo } from '../data/routes-data'
import Link from 'next/link'

interface RouteDetailProps {
  route: RouteInfo | null
}

export const RouteDetail: React.FC<RouteDetailProps> = ({ route }) => {
  const [copiedPath, setCopiedPath] = useState(false)
  const [copiedFile, setCopiedFile] = useState(false)

  if (!route) {
    return (
      <div className='h-full flex flex-col items-center justify-center border border-dashed border-border/80 rounded-xl bg-muted/5 min-h-[400px] p-6 text-center text-muted-foreground'>
        <Terminal className='h-10 w-10 text-muted-foreground/40 mb-3 animate-pulse' />
        <h4 className='font-bold text-sm text-foreground mb-1'>Select a Route</h4>
        <p className='text-xs max-w-[260px] leading-relaxed'>
          Choose any route from the explorer list on the left to view documentation, parameters, file mappings, and test endpoints.
        </p>
      </div>
    )
  }

  const copyToClipboard = (text: string, type: 'path' | 'file') => {
    navigator.clipboard.writeText(text)
    if (type === 'path') {
      setCopiedPath(true)
      setTimeout(() => setCopiedPath(false), 2000)
    } else {
      setCopiedFile(true)
      setTimeout(() => setCopiedFile(false), 2000)
    }
  }

  const getStatusColor = (status: RouteInfo['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
      case 'Under Development':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
      default:
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
    }
  }

  return (
    <div className='flex flex-col h-full bg-card border border-border rounded-xl shadow-xs overflow-hidden'>
      {/* Header Info */}
      <div className='p-5 border-b border-border bg-muted/10 flex flex-col gap-4'>
        <div className='flex items-start justify-between gap-4'>
          <div className='flex flex-col gap-1'>
            <span className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider'>
              {route.category} Route
            </span>
            <h2 className='text-xl font-bold tracking-tight text-foreground'>{route.name}</h2>
          </div>
          <div className='flex gap-2 shrink-0'>
            <Badge className={`text-xs px-2 py-0.5 rounded-md font-semibold ${getStatusColor(route.status)}`}>
              {route.status}
            </Badge>
          </div>
        </div>

        {/* Path Display Bar */}
        <div className='flex items-center justify-between gap-3 bg-background border border-border/80 rounded-lg p-2.5 pl-3'>
          <div className='flex items-center gap-2 min-w-0 flex-1'>
            <Badge variant='outline' className='text-[10px] font-bold py-0 h-5 px-1.5 rounded bg-muted/40 uppercase font-mono'>
              PAGE
            </Badge>
            <span className='text-xs font-mono font-bold text-primary truncate select-all'>
              {route.path}
            </span>
          </div>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => copyToClipboard(route.path, 'path')}
            className='h-7 w-7 text-muted-foreground hover:text-foreground'
            title='Copy Route Path'
          >
            {copiedPath ? <Check className='h-3.5 w-3.5 text-emerald-500' /> : <Copy className='h-3.5 w-3.5' />}
          </Button>
        </div>
      </div>

      {/* Main Details Body */}
      <div className='flex-1 overflow-y-auto p-5 space-y-6 no-scrollbar'>
        {/* Description Section */}
        <div className='space-y-2'>
          <h3 className='text-xs font-bold text-muted-foreground uppercase tracking-wider'>Description</h3>
          <p className='text-sm text-foreground/95 leading-relaxed bg-muted/20 border border-border/40 rounded-xl p-4.5'>
            {route.description}
          </p>
        </div>

        {/* Metadata Details Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          {/* Code File Mapping */}
          <div className='border border-border/70 rounded-xl p-4 space-y-2.5 bg-muted/5'>
            <div className='flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider'>
              <FileCode className='h-3.5 w-3.5 text-primary' />
              <span>Source File Mapping</span>
            </div>
            <div className='flex items-center justify-between gap-2 pl-0.5'>
              <code className='text-[10px] sm:text-xs font-mono text-foreground break-all select-all font-semibold'>
                {route.file}
              </code>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => copyToClipboard(route.file, 'file')}
                className='h-7 w-7 text-muted-foreground hover:text-foreground shrink-0'
                title='Copy File Path'
              >
                {copiedFile ? <Check className='h-3.5 w-3.5 text-emerald-500' /> : <Copy className='h-3.5 w-3.5' />}
              </Button>
            </div>
          </div>

          {/* Access Control & Security */}
          <div className='border border-border/70 rounded-xl p-4 space-y-2.5 bg-muted/5'>
            <div className='flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider'>
              <Shield className='h-3.5 w-3.5 text-primary' />
              <span>Authentication Level</span>
            </div>
            <div className='flex items-center gap-2 pl-0.5'>
              {route.auth === 'Public' ? (
                <CheckCircle2 className='h-4 w-4 text-emerald-500 shrink-0' />
              ) : (
                <AlertTriangle className='h-4 w-4 text-blue-500 shrink-0' />
              )}
              <span className='text-xs font-semibold text-foreground capitalize'>
                {route.auth === 'Public' ? 'Anonymous / Guest Access allowed' : `${route.auth} session required`}
              </span>
            </div>
          </div>
        </div>

        {/* HTTP Methods & Headers Documentation */}
        <div className='space-y-2.5'>
          <h3 className='text-xs font-bold text-muted-foreground uppercase tracking-wider'>Allowed Methods & Options</h3>
          <div className='flex flex-wrap gap-2'>
            {route.methods.map((m) => (
              <Badge key={m} variant='secondary' className='text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase'>
                {m}
              </Badge>
            ))}
            <Badge variant='outline' className='text-[10px] px-2 py-0.5 rounded font-medium'>
              Cache-Control: private, no-store
            </Badge>
            <Badge variant='outline' className='text-[10px] px-2 py-0.5 rounded font-medium'>
              Content-Type: text/html
            </Badge>
          </div>
        </div>
      </div>

      {/* Footer Navigation Action */}
      <div className='p-4 border-t border-border bg-muted/10 shrink-0 flex items-center justify-end'>
        <Link href={route.path} passHref legacyBehavior>
          <Button size='sm' className='h-9 gap-1.5 shadow-sm px-4' asChild>
            <a>
              <span>Test Route</span>
              <ExternalLink className='h-3.5 w-3.5' />
            </a>
          </Button>
        </Link>
      </div>
    </div>
  )
}
