/**
 * @file hooks.ts
 * @description React hooks for Extract Text (OCR) flow management.
 */

import { useState, useCallback } from 'react'
import { ExtractorStage, OcrLanguage, OcrResult } from './types'
import { ocrService } from './ocr.service'
import { generateOcrPdf } from './pdf-builder'
import { toast } from 'sonner'

export function useOcrExtractor() {
  const [stage, setStage] = useState<ExtractorStage>('ingest')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [language, setLanguage] = useState<OcrLanguage>('eng')
  
  const [progressPct, setProgressPct] = useState<number>(0)
  const [progressText, setProgressText] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState<boolean>(false)

  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null)
  const [editedText, setEditedText] = useState<string>('')

  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string>('')
  const [isUploading, setIsUploading] = useState<boolean>(false)

  // Ingest image or PDF file
  const handleFileSelect = useCallback(async (file: File) => {
    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    // Automatically transition to studio and run OCR
    setStage('ocr_studio')
    setIsProcessing(true)
    setProgressPct(5)
    setProgressText('Preparing document...')

    try {
      const result = await ocrService.recognizeFile(file, 'eng', (pct, statusText) => {
        setProgressPct(pct)
        setProgressText(statusText)
      })
      setOcrResult(result)
      setEditedText(JSON.stringify(result.jsonPayload, null, 2))
      toast.success('Text extracted successfully!')
    } catch (err: any) {
      toast.error('Failed to extract text from document')
      console.error('[useOcrExtractor] OCR error:', err)
    } finally {
      setIsProcessing(false)
    }
  }, [])

  // Re-run OCR with a different language selection
  const handleLanguageChange = useCallback(
    async (newLang: OcrLanguage) => {
      setLanguage(newLang)
      if (!selectedFile) return

      setIsProcessing(true)
      setProgressPct(5)
      setProgressText(`Loading ${newLang.toUpperCase()} OCR dictionary...`)

      try {
        const result = await ocrService.recognizeFile(selectedFile, newLang, (pct, statusText) => {
          setProgressPct(pct)
          setProgressText(statusText)
        })
        setOcrResult(result)
        setEditedText(JSON.stringify(result.jsonPayload, null, 2))
        toast.success(`Text re-extracted in ${newLang.toUpperCase()}`)
      } catch (err: any) {
        toast.error('Failed to re-extract text')
        console.error('[useOcrExtractor] Re-run error:', err)
      } finally {
        setIsProcessing(false)
      }
    },
    [selectedFile]
  )

  // Compile PDF from original file and edited OCR text
  const handleProceedToPdfPreview = useCallback(async () => {
    if (!selectedFile || !editedText) {
      toast.error('No document text available to compile PDF')
      return
    }

    setIsProcessing(true)
    try {
      const timestamp = new Date().toISOString().slice(0, 10)
      const defaultName = `Extracted_Text_${timestamp}.pdf`
      
      const { pdfFile: generatedFile, blobUrl } = await generateOcrPdf({
        imageFileOrUrl: selectedFile,
        extractedText: editedText,
        fileName: defaultName,
      })

      setPdfFile(generatedFile)
      setPdfUrl(blobUrl)
      setStage('pdf_preview')
    } catch (err: any) {
      toast.error('Failed to generate PDF')
      console.error('[useOcrExtractor] PDF build error:', err)
    } finally {
      setIsProcessing(false)
    }
  }, [selectedFile, editedText])

  // Upload generated PDF to Supabase Storage and trigger chat dispatch
  const handleConfirmSend = useCallback(
    async (
      onComplete?: (result: {
        fileName: string
        fileSize: number
        publicUrl: string
        mimeType: string
        extractedText: string
        extractedJson: Record<string, any>
      }) => void,
      customFileName?: string
    ) => {
      if (!pdfFile) return

      setIsUploading(true)
      try {
        const finalFile = customFileName
          ? new File([pdfFile], customFileName, { type: 'application/pdf' })
          : pdfFile

        const formData = new FormData()
        formData.append('file', finalFile)
        formData.append('folder', 'documents')

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errText = await response.text()
          throw new Error(`Upload failed (${response.status}): ${errText}`)
        }

        const data = await response.json()
        if (!data.success || !data.publicUrl) {
          throw new Error(data.error || 'Invalid upload response')
        }

        toast.success('Document sent successfully!')
        if (onComplete) {
          onComplete({
            fileName: data.fileName || finalFile.name,
            fileSize: data.fileSize || finalFile.size,
            publicUrl: data.publicUrl,
            mimeType: 'application/pdf',
            extractedText: editedText,
            extractedJson: ocrResult?.jsonPayload || {},
          })
        }
      } catch (err: any) {
        toast.error('Failed to upload and send PDF')
        console.error('[useOcrExtractor] Upload error:', err)
      } finally {
        setIsUploading(false)
      }
    },
    [pdfFile, editedText, ocrResult]
  )

  const reset = useCallback(() => {
    setStage('ingest')
    setSelectedFile(null)
    setPreviewUrl('')
    setOcrResult(null)
    setEditedText('')
    setPdfFile(null)
    setPdfUrl('')
    setIsProcessing(false)
    setIsUploading(false)
  }, [])

  return {
    stage,
    setStage,
    selectedFile,
    previewUrl,
    language,
    progressPct,
    progressText,
    isProcessing,
    ocrResult,
    editedText,
    setEditedText,
    pdfFile,
    pdfUrl,
    isUploading,
    handleFileSelect,
    handleLanguageChange,
    handleProceedToPdfPreview,
    handleConfirmSend,
    reset,
  }
}
