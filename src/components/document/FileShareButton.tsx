'use client'

import React from 'react'
import { Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useShareFile } from '@/hooks/useShareFile'
import { cn } from '@/lib/utils'

interface FileShareButtonProps {
  fileId: string
  fileName: string
  className?: string
}

export function FileShareButton({ fileId, fileName, className }: FileShareButtonProps) {
  const { shareFile, isSharing } = useShareFile()

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={(e) => {
        e.stopPropagation()
        shareFile(fileId, fileName)
      }}
      disabled={isSharing}
      aria-label={`Share ${fileName}`}
      title="Share link"
      className={cn(
        "h-7 w-7 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-150 cursor-pointer shrink-0 flex items-center justify-center",
        className
      )}
    >
      <Share2 className="h-3.5 w-3.5" />
    </Button>
  )
}
export default FileShareButton
