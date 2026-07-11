import { useState } from 'react'
import { shareFileLink } from '@/services/share.service'

export function useShareFile() {
  const [isSharing, setIsSharing] = useState(false)

  const shareFile = async (fileId: string, fileName: string) => {
    setIsSharing(true)
    try {
      await shareFileLink(fileId, fileName)
    } finally {
      setIsSharing(false)
    }
  }

  return { shareFile, isSharing }
}
export default useShareFile
