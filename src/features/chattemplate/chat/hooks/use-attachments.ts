import { useState, useCallback } from 'react'
import { uploadAttachment } from '@/features/chattemplate/files/managers/attachment-uploader'

export interface UploadState {
  id: string
  file: File
  progress: number
  status: 'uploading' | 'success' | 'error'
  folder: 'images' | 'videos' | 'documents' | 'audio'
  xhr?: XMLHttpRequest
}

export function useAttachments() {
  const [uploads, setUploads] = useState<UploadState[]>([])

  const startUpload = useCallback((
    file: File,
    senderEmailOrOptions: string | { senderEmail?: string; receiverEmail?: string },
    receiverEmailOrOnSuccess?: string | ((url: string, fileDetails: { name: string; size: number; type: string; duration?: number }) => void),
    onSuccessOrOnError?: ((url: string, fileDetails: { name: string; size: number; type: string; duration?: number }) => void) | ((err: Error) => void),
    onErrorOrDuration?: ((err: Error) => void) | number,
    durationParam?: number
  ) => {
    let senderEmail = ''
    let receiverEmail = ''
    let onSuccess: (url: string, fileDetails: { name: string; size: number; type: string; duration?: number }) => void
    let onError: ((err: Error) => void) | undefined
    let duration: number | undefined

    if (typeof senderEmailOrOptions === 'object' && senderEmailOrOptions !== null) {
      senderEmail = senderEmailOrOptions.senderEmail || ''
      receiverEmail = senderEmailOrOptions.receiverEmail || ''
      onSuccess = receiverEmailOrOnSuccess as any
      onError = onSuccessOrOnError as any
      duration = onErrorOrDuration as number
    } else if (typeof receiverEmailOrOnSuccess === 'string') {
      senderEmail = senderEmailOrOptions as string
      receiverEmail = receiverEmailOrOnSuccess
      onSuccess = onSuccessOrOnError as any
      onError = onErrorOrDuration as any
      duration = durationParam
    } else {
      senderEmail = senderEmailOrOptions as string
      onSuccess = receiverEmailOrOnSuccess as any
      onError = onSuccessOrOnError as any
      duration = onErrorOrDuration as number
    }

    const uploadId = crypto.randomUUID()
    const newUpload: UploadState = {
      id: uploadId,
      file,
      progress: 0,
      status: 'uploading',
      folder: 'documents',
    }

    setUploads((prev) => [...prev, newUpload])

    try {
      const { xhr, promise } = uploadAttachment(
        file,
        { senderEmail, receiverEmail },
        (percent) => {
          setUploads((prev) =>
            prev.map((u) => (u.id === uploadId ? { ...u, progress: percent } : u))
          )
        }
      )

      setUploads((prev) =>
        prev.map((u) => (u.id === uploadId ? { ...u, xhr } : u))
      )

      promise
        .then((url) => {
          setUploads((prev) =>
            prev.map((u) => (u.id === uploadId ? { ...u, progress: 100, status: 'success' } : u))
          )
          if (onSuccess) onSuccess(url, { name: file.name, size: file.size, type: file.type, duration })
          
          setTimeout(() => {
            setUploads((prev) => prev.filter((u) => u.id !== uploadId))
          }, 1000)
        })
        .catch((err) => {
          console.error('Attachment upload failed:', err)
          setUploads((prev) =>
            prev.map((u) => (u.id === uploadId ? { ...u, status: 'error' } : u))
          )
          if (onError) onError(err)
        })
    } catch (err) {
      console.error('Attachment upload failed:', err)
      setUploads((prev) =>
        prev.map((u) => (u.id === uploadId ? { ...u, status: 'error' } : u))
      )
      if (onError && err instanceof Error) onError(err)
    }
  }, [])

  const cancelUpload = useCallback((id: string) => {
    setUploads((prev) => {
      const upload = prev.find((u) => u.id === id)
      if (upload && upload.xhr) {
        upload.xhr.abort()
      }
      return prev.filter((u) => u.id !== id)
    })
  }, [])

  return {
    uploads,
    setUploads,
    startUpload,
    cancelUpload,
  }
}
export default useAttachments
