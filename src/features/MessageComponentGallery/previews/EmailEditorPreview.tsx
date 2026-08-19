'use client'

import React, { useState } from 'react'
import { toast } from 'sonner'
import { EmailEditor } from '@/features/Message/components/emails/email-editor'

export function EmailEditorPreview() {
  return (
    <div className='flex w-full flex-col bg-background'>
      <EmailEditor
        recipientName='Jordan Lee'
        recipientEmail='jordan@demo.com'
        onSend={(content) => {
          toast.success('Reply sent successfully! (preview only)')
        }}
      />
    </div>
  )
}
