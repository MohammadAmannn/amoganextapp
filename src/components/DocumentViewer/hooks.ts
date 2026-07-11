import { useState, useEffect } from 'react'
import { FileText, FileVideo, FileImage, FileCode, File } from 'lucide-react'

export function getFileExtension(fileName: string, fileUrl?: string): string {
  if (fileName && fileName.includes('.')) {
    return fileName.split('.').pop()?.toLowerCase() || ''
  }
  if (fileUrl) {
    try {
      const url = new URL(fileUrl)
      const pathname = url.pathname
      return pathname.split('.').pop()?.toLowerCase() || ''
    } catch {}
  }
  return ''
}

export function getFileIconInfo(ext: string) {
  const extension = ext.toLowerCase()

  const pdfTypes = ['pdf']
  const wordTypes = ['doc', 'docx', 'rtf']
  const excelTypes = ['xls', 'xlsx', 'csv']
  const pptTypes = ['ppt', 'pptx']
  const imageTypes = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg', 'webp']
  const videoTypes = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv']
  const codeTypes = ['json', 'xml', 'html', 'js', 'ts', 'jsx', 'tsx', 'css', 'md', 'txt']

  if (pdfTypes.includes(extension)) {
    return {
      icon: FileText,
      colorClass: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20',
      label: 'PDF Document',
    }
  }
  if (wordTypes.includes(extension)) {
    return {
      icon: FileText,
      colorClass: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20',
      label: 'Word Document',
    }
  }
  if (excelTypes.includes(extension)) {
    return {
      icon: FileText, // We could use FileSpreadsheet, but FileText is safe and style classes specify the context
      colorClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      label: 'Spreadsheet',
    }
  }
  if (pptTypes.includes(extension)) {
    return {
      icon: FileText,
      colorClass: 'text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/20',
      label: 'Presentation',
    }
  }
  if (imageTypes.includes(extension)) {
    return {
      icon: FileImage,
      colorClass: 'text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/20',
      label: 'Image',
    }
  }
  if (videoTypes.includes(extension)) {
    return {
      icon: FileVideo,
      colorClass: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
      label: 'Video',
    }
  }
  if (codeTypes.includes(extension)) {
    return {
      icon: FileCode,
      colorClass: 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      label: 'Text File',
    }
  }

  return {
    icon: File,
    colorClass: 'text-slate-600 dark:text-slate-400 bg-slate-500/10 border-slate-500/20',
    label: 'Document',
  }
}

export function useDownloadFile() {
  const [isDownloading, setIsDownloading] = useState(false)

  const downloadFile = async (url: string, name: string) => {
    setIsDownloading(true)
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error('Network response was not ok')
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.setAttribute('download', name)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch (e) {
      window.open(url, '_blank')
    } finally {
      setIsDownloading(false)
    }
  }

  return { downloadFile, isDownloading }
}

export function useKeyDown(key: string, callback: () => void) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === key) {
        callback()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [key, callback])
}
