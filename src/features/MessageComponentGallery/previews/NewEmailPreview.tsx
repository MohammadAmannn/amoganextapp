'use client'

import React, { useState } from 'react'
import { toast } from 'sonner'
import { NewEmail } from '@/features/Message/components/emails/new-email'

export function NewEmailPreview() {
  const [key, setKey] = useState(0)

  return (
    <div className='flex h-full w-full flex-col overflow-y-auto bg-background'>
      <NewEmail
        key={key}
        onCancel={() => toast.info('Cancel compose clicked (preview only)')}
        onSend={(data) => {
          toast.success(`Email sent to ${data.to || 'recipients'}! (preview only)`)
        }}
        onSaveDraft={(data) => {
          toast.success(`Draft saved: "${data.subject || 'Untitled'}" (preview only)`)
        }}
        onPreviewAttachment={(attachment) => {
          toast.info(`Previewing attachment: ${attachment.name}`)
        }}
      />
    </div>
  )
}
