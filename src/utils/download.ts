/**
 * @file download.ts
 * @description Universal 1-Click Cross-Origin File Downloader.
 * 
 * WHY IT EXISTS:
 * HTML5 <a href="..." download="..."> tags only work for same-origin URLs.
 * When downloading files stored on Supabase Storage (cross-origin), standard <a> links
 * cause the browser to navigate to the raw URL instead of downloading the file.
 * 
 * HOW IT WORKS:
 * Fetches raw file bytes -> creates a same-origin Blob URL -> triggers immediate 1-click file download.
 */

import { toast } from 'sonner'

export async function downloadFileFromUrl(url: string, fileName: string): Promise<void> {
  if (!url) return

  const cleanName = fileName || 'document.pdf'
  const toastId = toast.loading(`Preparing download for ${cleanName}...`)

  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const blob = await response.blob()
    const blobUrl = window.URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = blobUrl
    link.download = cleanName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000)
    toast.success('Download started!', { id: toastId })
  } catch (err) {
    console.warn('[downloadFileFromUrl] Fetch download failed, fallback to direct trigger:', err)
    toast.dismiss(toastId)
    // Fallback direct trigger if fetch is blocked
    const link = document.createElement('a')
    link.href = url
    link.download = cleanName
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}
