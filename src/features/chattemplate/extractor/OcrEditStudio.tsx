/**
 * @file OcrEditStudio.tsx
 * @description Interactive OCR edit studio featuring side-by-side image preview, text editor, multi-language selector, and copy controls.
 */

import React from 'react'
import {
  Copy,
  Check,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Globe,
  Loader2,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { OcrLanguage, SUPPORTED_OCR_LANGUAGES, OcrResult } from './types'
import { toast } from 'sonner'

interface OcrEditStudioProps {
  previewUrl: string
  selectedFile: File | null
  language: OcrLanguage
  progressPct: number
  progressText: string
  isProcessing: boolean
  ocrResult: OcrResult | null
  editedText: string
  onEditedTextChange: (text: string) => void
  onLanguageChange: (lang: OcrLanguage) => void
  onProceedToPdf: () => void
  onBackToIngest: () => void
}

export const OcrEditStudio: React.FC<OcrEditStudioProps> = ({
  previewUrl,
  selectedFile,
  language,
  progressPct,
  progressText,
  isProcessing,
  ocrResult,
  editedText,
  onEditedTextChange,
  onLanguageChange,
  onProceedToPdf,
  onBackToIngest,
}) => {
  const [copied, setCopied] = React.useState(false)

  const handleCopyText = () => {
    if (!editedText) return
    navigator.clipboard.writeText(editedText)
    setCopied(true)
    toast.success('Extracted JSON copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const currentLangObj = SUPPORTED_OCR_LANGUAGES.find((l) => l.code === language) || SUPPORTED_OCR_LANGUAGES[0]
  const isPdf = selectedFile?.type === 'application/pdf' || selectedFile?.name.toLowerCase().endsWith('.pdf')

  return (
    <div className='flex flex-col h-full overflow-hidden bg-background'>
      {/* Studio Header Toolbar */}
      <div className='flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5 bg-muted/20 shrink-0'>
        <div className='flex items-center gap-2'>
          <Button type='button' variant='ghost' size='xs' onClick={onBackToIngest}>
            ← Change File
          </Button>

          {/* Multi-Language Selector Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type='button' variant='outline' size='xs' className='gap-1.5 font-medium'>
                <Globe className='h-3.5 w-3.5 text-primary' />
                <span>{currentLangObj.flag} {currentLangObj.label}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='start' className='w-48'>
              {SUPPORTED_OCR_LANGUAGES.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => onLanguageChange(lang.code)}
                  className='cursor-pointer gap-2'
                >
                  <span>{lang.flag}</span>
                  <span className='font-medium'>{lang.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {ocrResult && !isProcessing && (
            <span className='inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400'>
              <Sparkles className='h-3 w-3' /> {ocrResult.confidence}% Accuracy
            </span>
          )}
        </div>

        <div className='flex items-center gap-2'>
          <Button
            type='button'
            variant='outline'
            size='xs'
            onClick={handleCopyText}
            disabled={!editedText || isProcessing}
            className='gap-1.5'
          >
            {copied ? <Check className='h-3.5 w-3.5 text-emerald-500' /> : <Copy className='h-3.5 w-3.5' />}
            <span>{copied ? 'Copied' : 'Copy JSON'}</span>
          </Button>

          <Button
            type='button'
            variant='outline'
            size='xs'
            onClick={() => onLanguageChange(language)}
            disabled={isProcessing}
            className='gap-1.5'
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>Re-scan</span>
          </Button>
        </div>
      </div>

      {/* Main Studio Body: Dual Panel */}
      <div className='grid grid-cols-1 md:grid-cols-2 flex-1 min-h-0 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-border'>
        {/* Left Panel: Original Document Image / PDF Preview */}
        <div className='flex flex-col items-center justify-center p-4 bg-muted/10 relative overflow-hidden group min-h-[220px] md:min-h-0'>
          {isPdf && previewUrl ? (
            <iframe
              src={previewUrl}
              title='PDF Preview'
              className='w-full h-full rounded-lg border bg-white shadow-xs min-h-[200px]'
            />
          ) : (
            <img
              src={previewUrl}
              alt='Document preview'
              className='max-h-full max-w-full object-contain rounded-lg shadow-xs transition-transform'
            />
          )}
        </div>

        {/* Right Panel: OCR Extracted Text Editor */}
        <div className='flex flex-col flex-1 min-h-0 p-4 bg-background relative'>
          <div className='flex items-center justify-between mb-2 shrink-0'>
            <label className='text-xs font-semibold text-foreground flex items-center gap-1.5'>
              <Sparkles className='h-3.5 w-3.5 text-primary' /> Extracted JSON Preview
            </label>
            <span className='text-[10px] text-muted-foreground'>
              {editedText.length} characters
            </span>
          </div>

          {isProcessing ? (
            <div className='flex-1 flex flex-col items-center justify-center p-6 text-center bg-muted/20 rounded-xl border border-dashed'>
              <Loader2 className='h-8 w-8 text-primary animate-spin mb-3' />
              <p className='text-sm font-medium text-foreground'>{progressText || 'Extracting JSON...'}</p>
              <div className='w-48 bg-muted rounded-full h-1.5 mt-3 overflow-hidden'>
                <div
                  className='bg-primary h-full transition-all duration-300'
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          ) : (
            <textarea
              value={editedText}
              onChange={(e) => onEditedTextChange(e.target.value)}
              placeholder='Extracted JSON payload will appear here...'
              className='flex-1 w-full resize-none rounded-xl border border-input bg-muted/20 p-3.5 text-sm font-mono leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 overflow-y-auto'
            />
          )}
        </div>
      </div>

      {/* Studio Footer CTA */}
      <div className='flex items-center justify-between border-t p-3 bg-card shrink-0'>
        <span className='text-xs text-muted-foreground hidden sm:inline'>
          Review and edit text above, then generate searchable PDF.
        </span>

        <Button
          type='button'
          size='default'
          disabled={!editedText.trim() || isProcessing}
          onClick={onProceedToPdf}
          className='gap-2 font-semibold ml-auto shadow-sm'
        >
          <span>Generate PDF & Preview</span>
          <ArrowRight className='h-4 w-4' />
        </Button>
      </div>
    </div>
  )
}
