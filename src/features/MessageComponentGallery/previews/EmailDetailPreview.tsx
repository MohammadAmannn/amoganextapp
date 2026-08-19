'use client'

import React, { useState } from 'react'
import { toast } from 'sonner'
import { EmailDetail } from '@/features/Message/components/emails/email-detail'
import { mockEmails } from '../mocks'

export function EmailDetailPreview() {
  const defaultEmail = mockEmails[0]

  return (
    <div className='flex h-full w-full flex-col overflow-y-auto bg-background'>
      <EmailDetail
        email={defaultEmail}
        onSendReply={(content) => toast.success(`Reply sent: "${content.slice(0, 30)}..."`)}
        onDelete={(id) => toast.success(`Email ${id} deleted`)}
        onArchive={(id) => toast.success(`Email ${id} archived`)}
        onBack={() => toast.info('Closed email detail (preview only)')}
      />
    </div>
  )
}
