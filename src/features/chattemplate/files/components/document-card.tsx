import { FileCard } from './file-card'

interface DocumentCardProps {
  fileUrl: string
  fileName: string
  fileSize?: number
  onPreview?: () => void
  messageId?: string
  processingStatus?: 'pending' | 'processing' | 'completed' | 'failed' | null
}

export function DocumentCard({ fileUrl, fileName, fileSize, onPreview, messageId, processingStatus }: DocumentCardProps) {
  return (
    <div className="w-full max-w-[240px] sm:max-w-[280px] select-none">
      <FileCard
        fileUrl={fileUrl}
        fileName={fileName}
        fileSize={fileSize}
        onPreview={onPreview}
        messageId={messageId}
        processingStatus={processingStatus}
        className="border-0 p-0 hover:bg-transparent bg-transparent shadow-none gap-2"
      />
    </div>
  )
}

export default DocumentCard
