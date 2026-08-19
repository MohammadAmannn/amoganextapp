'use client'

import React from 'react'
import { toast } from 'sonner'
import { EmailView } from '@/features/Message/components/emails/email-view'
import { mockEmails } from '../mocks'

export function MailViewPreview() {
  const defaultEmail = mockEmails[0]

  return (
    <div className='flex h-full w-full flex-col overflow-hidden bg-background'>
      <EmailView
        email={defaultEmail}
        onBack={() => toast.info('Back clicked (preview only)')}
        onDelete={(id) => toast.success(`Email ${id} deleted (preview only)`)}
        onStartChat={() => toast.info('Starting chat with sender (preview only)')}
        onPreviewAttachment={(attachment) =>
          toast.info(`Previewing attachment: ${attachment.name}`)
        }
      />
    </div>
  )
}
