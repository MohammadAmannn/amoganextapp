import { Email as BaseEmail } from '../data/emails'

export type Email = BaseEmail

export interface EmailAttachment {
  id: string
  name: string
  type: string
  size: string
  url?: string
}

export interface EmailRecipient {
  name: string
  email: string
}

export interface EmailFormData {
  to: string | string[]
  from?: string
  subject: string
  body: string
  attachments?: EmailAttachment[]
}

export interface EmailViewProps {
  email: Email
  onBack: () => void
  onDelete: (id: string) => void
  onStartChat?: () => void
  onPreviewAttachment?: (attachment: { name: string; url?: string }) => void
}
