import { toast } from 'sonner'

export function generateSecureFileUrl(fileId: string): string {
  if (typeof window === 'undefined') {
    return `/files/document/${fileId}`
  }
  return `${window.location.origin}/files/document/${fileId}`
}

export async function shareFileLink(fileId: string, fileName: string): Promise<void> {
  const shareUrl = generateSecureFileUrl(fileId)

  if (navigator.share) {
    try {
      await navigator.share({
        title: `Share: ${fileName}`,
        text: `Check out this file: ${fileName}`,
        url: shareUrl,
      })
      toast.success('Share link sent.')
      return
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return // User dismissed share dialog
      }
    }
  }

  // Fallback to Clipboard API
  try {
    await navigator.clipboard.writeText(shareUrl)
    toast.success('Share link copied.')
  } catch (err) {
    const textarea = document.createElement('textarea')
    textarea.value = shareUrl
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    try {
      document.execCommand('copy')
      toast.success('Share link copied.')
    } catch {
      toast.error('Failed to copy share link.')
    }
    document.body.removeChild(textarea)
  }
}
