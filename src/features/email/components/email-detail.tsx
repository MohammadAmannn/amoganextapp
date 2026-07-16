import React from 'react'
import {
  Archive,
  Trash2,
  AlertOctagon,
  Clock,
  CornerUpLeft,
  CornerUpRight,
  MoreVertical,
  ReplyAll,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Email } from '../data/emails'
import { EmailEditor } from './email-editor'

interface EmailDetailProps {
  email: Email | null
  onSendReply: (content: string) => void
  onDelete: (id: string) => void
  onArchive: (id: string) => void
}

export function EmailDetail({
  email,
  onSendReply,
  onDelete,
  onArchive,
}: EmailDetailProps) {
  if (!email) {
    return (
      <div className='flex h-full flex-col items-center justify-center bg-background text-muted-foreground p-8'>
        <p className='text-sm'>Select an email to view its content</p>
      </div>
    )
  }

  const renderEmailBody = () => {
    if (email.body === 'acquire_newsletter_mock') {
      return (
        <div className='w-full max-w-2xl mx-auto rounded-xl overflow-hidden bg-[#0A0D14] text-white border border-slate-800 shadow-xl my-4 font-sans select-none'>
          {/* Brand/Header */}
          <div className='flex items-center justify-between px-6 py-5 border-b border-slate-800/80 bg-slate-950/40'>
            <div className='flex items-center gap-2'>
              <div className='w-5 h-5 flex items-center justify-center bg-white text-[#0A0D14] font-bold rounded-sm text-[11px] shrink-0'>
                ▲
              </div>
              <span className='font-bold text-sm tracking-wide text-slate-100'>acquire.com</span>
            </div>
            <div className='text-[10px] uppercase font-bold tracking-wider text-slate-400'>
              Deal Alert
            </div>
          </div>

          {/* Hero Section */}
          <div className='p-6 text-center border-b border-slate-800/40 bg-gradient-to-b from-[#0F1320] to-[#0A0D14]'>
            <span className='inline-block px-3 py-1 text-[11px] font-extrabold tracking-wider bg-indigo-500/10 text-indigo-400 rounded-full mb-3 uppercase border border-indigo-500/20'>
              Our top picks
            </span>
            <h1 className='text-3xl font-black text-white leading-tight tracking-tight mb-2'>
              Startups For Sale
            </h1>
            <p className='text-xs text-slate-400 max-w-md mx-auto'>
              Hand-curated, vetted software companies ready for acquisition. Full financials and metrics verified.
            </p>
          </div>

          {/* Graphical Mock Card Section */}
          <div className='px-6 py-4'>
            <div className='rounded-lg bg-gradient-to-br from-indigo-950/40 to-slate-900/60 border border-slate-800 p-5 relative overflow-hidden flex flex-col md:flex-row gap-4 items-center justify-between'>
              {/* Left mini card visual */}
              <div className='w-full md:w-1/2 p-4 rounded bg-slate-950/60 border border-slate-800/60 shadow-inner flex flex-col gap-2 relative z-10 shrink-0'>
                <div className='flex items-center gap-1.5 border-b border-slate-800/50 pb-2 mb-1'>
                  <div className='w-2 h-2 rounded-full bg-red-500' />
                  <div className='w-2 h-2 rounded-full bg-yellow-500' />
                  <div className='w-2 h-2 rounded-full bg-green-500' />
                  <span className='text-[9px] text-slate-500 font-mono ml-1'>acquire-deal-dashboard</span>
                </div>
                <div className='h-20 w-full rounded bg-slate-900/80 border border-slate-800/40 relative flex items-center justify-center overflow-hidden'>
                  {/* Mock dashboard content representation */}
                  <div className='absolute inset-0 bg-indigo-500/5 flex flex-col justify-between p-2'>
                    <div className='flex justify-between items-center'>
                      <div className='w-8 h-2 rounded bg-indigo-400/20' />
                      <div className='w-12 h-3 rounded bg-indigo-500/20' />
                    </div>
                    <div className='h-8 w-full flex items-end gap-1'>
                      <div className='w-full h-[30%] bg-indigo-500/30 rounded-t-sm' />
                      <div className='w-full h-[60%] bg-indigo-500/30 rounded-t-sm' />
                      <div className='w-full h-[45%] bg-indigo-500/40 rounded-t-sm' />
                      <div className='w-full h-[85%] bg-indigo-500/60 rounded-t-sm' />
                      <div className='w-full h-[70%] bg-indigo-500/80 rounded-t-sm' />
                    </div>
                  </div>
                </div>
                <div className='text-[10px] font-bold text-slate-300 truncate mt-1'>
                  SaaS metrics & verified charts
                </div>
              </div>

              {/* Right promo copy */}
              <div className='flex flex-col justify-center text-center md:text-left z-10'>
                <span className='text-[10px] font-bold tracking-wider text-indigo-400 uppercase mb-1'>
                  Latest Insight
                </span>
                <p className='text-xs font-semibold text-slate-200 leading-snug max-w-[200px] mb-2'>
                  How deal schedules drive buyer interest
                </p>
                <div className='text-[10px] text-slate-400 flex items-center justify-center md:justify-start gap-1'>
                  <span>Read our blog post</span>
                  <span className='text-indigo-400'>→</span>
                </div>
              </div>

              {/* Simulated pointer arrow drawn via decorative element */}
              <div className='absolute right-12 top-2 text-[26px] opacity-15 hidden md:block select-none text-indigo-400 pointer-events-none'>
                ✍️
              </div>
            </div>
          </div>

          {/* Deal Details */}
          <div className='px-6 py-6 space-y-4 border-t border-slate-800/40'>
            <div className='border-l-2 border-indigo-500 pl-3'>
              <h3 className='text-base font-extrabold text-white tracking-wide'>
                $400k+ TTM Revenue
              </h3>
              <p className='text-xs text-slate-300 leading-relaxed mt-1'>
                Cost-effective international calling solution connecting people without the need for expensive phone plans. Perfect fit for remote-first teams and business clients.
              </p>
            </div>

            {/* Financial Details Table */}
            <div className='rounded-lg bg-slate-950/40 border border-slate-800/80 overflow-hidden'>
              <div className='grid grid-cols-2 border-b border-slate-800/80'>
                <div className='px-4 py-3 text-xs text-slate-400 font-medium'>
                  TTM Revenue
                </div>
                <div className='px-4 py-3 text-xs text-white font-bold text-right'>
                  $461,000
                </div>
              </div>
              <div className='grid grid-cols-2 border-b border-slate-800/80'>
                <div className='px-4 py-3 text-xs text-slate-400 font-medium'>
                  TTM Profit
                </div>
                <div className='px-4 py-3 text-xs text-white font-bold text-right'>
                  $13,000
                </div>
              </div>
              <div className='grid grid-cols-2 border-b border-slate-800/80'>
                <div className='px-4 py-3 text-xs text-slate-400 font-medium'>
                  Tech Stack
                </div>
                <div className='px-4 py-3 text-xs text-indigo-300 font-semibold text-right'>
                  SQL, Node.js, React
                </div>
              </div>
              <div className='grid grid-cols-2 bg-indigo-500/5'>
                <div className='px-4 py-3.5 text-xs text-indigo-200 font-medium'>
                  Asking Price
                </div>
                <div className='px-4 py-3.5 text-xs text-white font-black text-right'>
                  $515,000
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className='pt-2 flex justify-center'>
              <button className='w-full py-2.5 rounded bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 transition-colors uppercase tracking-wider shadow-md shadow-indigo-600/10'>
                View Acquisition Listing
              </button>
            </div>
          </div>

          {/* Footer branding */}
          <div className='px-6 py-4 bg-slate-950/60 border-t border-slate-800/80 text-center text-[10px] text-slate-500'>
            © 2026 Acquire.com. All rights reserved. 101 California St, San Francisco, CA.
          </div>
        </div>
      )
    }

    return (
      <div
        className='prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed space-y-4'
        dangerouslySetInnerHTML={{ __html: email.body }}
      />
    )
  }

  return (
    <div className='flex h-full flex-col bg-background overflow-hidden'>
      {/* Top Toolbar */}
      <div className='flex items-center justify-between px-4 py-2 border-b border-border shrink-0 bg-background'>
        {/* Left Actions */}
        <div className='flex items-center gap-1'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => onArchive(email.id)}
            className='h-8 w-8 text-muted-foreground hover:text-foreground'
            title='Archive'
          >
            <Archive className='h-4 w-4' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => onDelete(email.id)}
            className='h-8 w-8 text-muted-foreground hover:text-foreground'
            title='Delete'
          >
            <Trash2 className='h-4 w-4' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8 text-muted-foreground hover:text-foreground'
            title='Spam'
          >
            <AlertOctagon className='h-4 w-4' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8 text-muted-foreground hover:text-foreground'
            title='Snooze'
          >
            <Clock className='h-4 w-4' />
          </Button>
        </div>

        {/* Right Actions */}
        <div className='flex items-center gap-1'>
          <Button variant='ghost' size='icon' className='h-8 w-8 text-muted-foreground hover:text-foreground' title='Reply'>
            <CornerUpLeft className='h-4 w-4' />
          </Button>
          <Button variant='ghost' size='icon' className='h-8 w-8 text-muted-foreground hover:text-foreground' title='Reply All'>
            <ReplyAll className='h-4 w-4' />
          </Button>
          <Button variant='ghost' size='icon' className='h-8 w-8 text-muted-foreground hover:text-foreground' title='Forward'>
            <CornerUpRight className='h-4 w-4' />
          </Button>
          <div className='h-4 w-px bg-border mx-1' />
          <Button variant='ghost' size='icon' className='h-8 w-8 text-muted-foreground hover:text-foreground' title='More Options'>
            <MoreVertical className='h-4 w-4' />
          </Button>
        </div>
      </div>

      {/* Info Area */}
      <div className='px-6 py-4 border-b border-border/80 flex items-start gap-4 shrink-0 bg-background/50'>
        <Avatar className='h-10 w-10 border shadow-xs'>
          <AvatarFallback className='bg-primary/10 text-primary text-xs font-bold'>
            {email.avatarInitials}
          </AvatarFallback>
        </Avatar>
        
        <div className='flex-1 min-w-0'>
          <h3 className='text-sm font-bold text-foreground truncate'>
            {email.name}
          </h3>
          <p className='text-xs font-semibold text-foreground/80 leading-snug line-clamp-1 mt-0.5'>
            {email.subject}
          </p>
          <p className='text-[11px] text-muted-foreground mt-1'>
            Reply-To: <span className='font-mono'>{email.replyTo}</span>
          </p>
        </div>

        <div className='text-[10px] text-muted-foreground whitespace-nowrap pt-1 shrink-0'>
          Sep 24, 2024, 11:49:40 PM
        </div>
      </div>

      {/* Scrollable Email Body content */}
      <ScrollArea className='flex-1 p-6 bg-muted/5'>
        {/* Subheader representing the inner mail frame info */}
        <div className='flex items-center gap-3 border-b border-border/40 pb-4 mb-6 shrink-0'>
          <Avatar className='h-8 w-8 border'>
            <AvatarFallback className='bg-indigo-500/10 text-indigo-500 text-[10px] font-bold'>
              {email.avatarInitials}
            </AvatarFallback>
          </Avatar>
          <div className='min-w-0'>
            <p className='text-xs font-semibold text-foreground truncate'>
              {email.email}
            </p>
          </div>
          <span className='text-[10px] text-muted-foreground ml-auto whitespace-nowrap'>
            about 11 hours ago
          </span>
        </div>

        {renderEmailBody()}
      </ScrollArea>

      {/* Reply editor */}
      <EmailEditor
        recipientName={email.name}
        recipientEmail={email.replyTo}
        onSend={onSendReply}
      />
    </div>
  )
}