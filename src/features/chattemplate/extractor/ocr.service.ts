/**
 * @file ocr.service.ts
 * @description Pure JavaScript / WebAssembly client-side OCR & PDF extraction service powered by Tesseract.js & pdfjs-dist.
 */

import { createWorker } from 'tesseract.js'
import { OcrLanguage, OcrResult, OcrWord } from './types'

class OcrService {
  private static instance: OcrService

  private constructor() {}

  public static getInstance(): OcrService {
    if (!OcrService.instance) {
      OcrService.instance = new OcrService()
    }
    return OcrService.instance
  }

  /**
   * Main entrypoint for processing any file (Image or PDF).
   */
  public async recognizeFile(
    file: File | Blob,
    language: OcrLanguage = 'eng',
    onProgress?: (progress: number, statusText: string) => void
  ): Promise<OcrResult> {
    const isPdf =
      file.type === 'application/pdf' ||
      ((file as File).name && (file as File).name.toLowerCase().endsWith('.pdf'))

    if (isPdf) {
      return this.recognizePdf(file, language, onProgress)
    }
    return this.recognizeImage(file, language, onProgress)
  }

  /**
   * Extracts text from PDF files using pdfjs-dist with Tesseract OCR fallback for scanned pages.
   */
  public async recognizePdf(
    file: File | Blob,
    language: OcrLanguage = 'eng',
    onProgress?: (progress: number, statusText: string) => void
  ): Promise<OcrResult> {
    if (typeof window === 'undefined') {
      throw new Error('PDF extraction is only available in browser environment')
    }

    if (onProgress) onProgress(10, 'Reading PDF document structure...')
    try {
      const pdfjsLib = await import('pdfjs-dist')
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
      }

      const arrayBuffer = await file.arrayBuffer()
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) })
      const pdfDoc = await loadingTask.promise

      let fullText = ''
      const allWords: OcrWord[] = []
      const allLines: string[] = []

      const numPages = pdfDoc.numPages
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        if (onProgress) {
          const pct = Math.round((pageNum / numPages) * 60) + 10
          onProgress(pct, `Extracting page ${pageNum} of ${numPages}...`)
        }

        const page = await pdfDoc.getPage(pageNum)
        const textContent = await page.getTextContent()

        let pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim()

        // If page has no embedded text (scanned image PDF), render to canvas and run OCR
        if (!pageText || pageText.length < 15) {
          if (onProgress) onProgress(40, `Running OCR scan on PDF page ${pageNum}...`)
          const viewport = page.getViewport({ scale: 2.0 })
          const canvas = document.createElement('canvas')
          const context = canvas.getContext('2d')
          canvas.width = viewport.width
          canvas.height = viewport.height

          if (context) {
            await page.render({ canvasContext: context, viewport }).promise
            const ocrPageResult = await this.recognizeImage(canvas, language)
            pageText = ocrPageResult.text
            if (ocrPageResult.words) {
              allWords.push(...ocrPageResult.words)
            }
          }
        }

        if (pageText) {
          fullText += (fullText ? '\n\n' : '') + pageText
          allLines.push(...pageText.split('\n'))
        }
      }

      const jsonPayload = {
        meta: {
          engine: 'pdfjs-dist + Tesseract.js OCR',
          language,
          confidence: 95,
          pageCount: numPages,
          extractedAt: new Date().toISOString(),
        },
        lines: allLines,
        rawText: fullText.trim(),
      }

      if (onProgress) onProgress(100, 'PDF Extraction Complete!')

      return {
        text: fullText.trim(),
        confidence: 95,
        words: allWords,
        lines: allLines,
        language,
        jsonPayload,
      }
    } catch (pdfErr) {
      console.warn('[OcrService] pdfjs-dist parsing failed, falling back to direct image OCR:', pdfErr)
      return this.recognizeImage(file, language, onProgress)
    }
  }

  /**
   * Performs optical character recognition on an image URL, Blob, or Canvas via Tesseract.js.
   */
  public async recognizeImage(
    imageSource: string | File | Blob | HTMLCanvasElement,
    language: OcrLanguage = 'eng',
    onProgress?: (progress: number, statusText: string) => void
  ): Promise<OcrResult> {
    if (onProgress) onProgress(15, 'Initializing Tesseract engine...')

    const worker = await createWorker(language, 1, {
      logger: (m) => {
        if (m.status === 'recognizing text' && m.progress) {
          const pct = Math.min(95, Math.round(m.progress * 100))
          if (onProgress) onProgress(pct, `Recognizing text (${pct}%)...`)
        }
      },
    })

    try {
      if (onProgress) onProgress(30, 'Analyzing image layout...')
      const ret = await worker.recognize(imageSource)
      if (onProgress) onProgress(95, 'Structuring text data...')

      const rawText = ret.data.text.trim()
      const confidence = Math.round(ret.data.confidence || 0)
      const retData = ret.data as any
      const lines = retData.lines ? retData.lines.map((l: any) => l.text.trim()).filter(Boolean) : rawText.split('\n')

      const words: OcrWord[] = []
      if (retData.words) {
        for (const w of retData.words) {
          words.push({
            text: w.text,
            confidence: Math.round(w.confidence || 0),
            bbox: {
              x0: w.bbox.x0,
              y0: w.bbox.y0,
              x1: w.bbox.x1,
              y1: w.bbox.y1,
            },
          })
        }
      }

      const jsonPayload = {
        meta: {
          engine: 'Tesseract.js / WebAssembly OCR',
          language,
          confidence,
          pageCount: 1,
          extractedAt: new Date().toISOString(),
        },
        lines,
        rawText,
      }

      await worker.terminate()
      if (onProgress) onProgress(100, 'OCR Extraction Complete!')

      return {
        text: rawText,
        confidence,
        words,
        lines,
        language,
        jsonPayload,
      }
    } catch (err) {
      await worker.terminate()
      console.error('[OcrService] Image recognition failed:', err)
      throw err
    }
  }
}

export const ocrService = OcrService.getInstance()
