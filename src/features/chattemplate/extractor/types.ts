/**
 * @file types.ts
 * @description Type definitions for the Extract Text (OCR Image-to-PDF) feature module.
 */

export type OcrLanguage = 'eng' | 'hin' | 'spa' | 'fra' | 'deu'

export interface OcrLanguageOption {
  code: OcrLanguage
  label: string
  flag: string
}

export const SUPPORTED_OCR_LANGUAGES: OcrLanguageOption[] = [
  { code: 'eng', label: 'English', flag: '🇺🇸' },
  { code: 'hin', label: 'Hindi (हिंदी)', flag: '🇮🇳' },
  { code: 'spa', label: 'Spanish (Español)', flag: '🇪🇸' },
  { code: 'fra', label: 'French (Français)', flag: '🇫🇷' },
  { code: 'deu', label: 'German (Deutsch)', flag: '🇩🇪' },
]

export interface OcrWord {
  text: string
  confidence: number
  bbox: {
    x0: number
    y0: number
    x1: number
    y1: number
  }
}

export interface OcrResult {
  text: string
  confidence: number
  words: OcrWord[]
  lines: string[]
  language: OcrLanguage
  jsonPayload: Record<string, any>
}

export type ExtractorStage = 'ingest' | 'ocr_studio' | 'pdf_preview'

export interface TextExtractorModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete?: (result: {
    fileName: string
    fileSize: number
    publicUrl: string
    mimeType: string
    extractedText: string
    extractedJson: Record<string, any>
  }) => void
}
