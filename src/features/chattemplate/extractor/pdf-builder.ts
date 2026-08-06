/**
 * @file pdf-builder.ts
 * @description Generates a clean PDF document containing only the original document/image (with zero extra OCR pages appended).
 */

import { PDFDocument } from 'pdf-lib'

export interface GenerateOcrPdfOptions {
  imageFileOrUrl: File | Blob | string
  extractedText: string
  fileName?: string
}

export async function generateOcrPdf({
  imageFileOrUrl,
  fileName = 'Extracted_Text.pdf',
}: GenerateOcrPdfOptions): Promise<{ pdfBytes: Uint8Array; pdfFile: File; blobUrl: string }> {
  // A. If already a PDF file, return the original PDF directly without altering pages
  if (
    imageFileOrUrl instanceof File &&
    (imageFileOrUrl.type === 'application/pdf' || imageFileOrUrl.name.toLowerCase().endsWith('.pdf'))
  ) {
    const pdfBytes = new Uint8Array(await imageFileOrUrl.arrayBuffer())
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    const blobUrl = URL.createObjectURL(blob)
    return { pdfBytes, pdfFile: imageFileOrUrl, blobUrl }
  }

  // B. If an image file (PNG / JPG / WEBP), embed image into a clean 1-page PDF
  const pdfDoc = await PDFDocument.create()
  const pageWidth = 595.28
  const pageHeight = 841.89
  const margin = 20

  try {
    let imageBytes: ArrayBuffer
    if (typeof imageFileOrUrl === 'string') {
      const res = await fetch(imageFileOrUrl)
      imageBytes = await res.arrayBuffer()
    } else {
      imageBytes = await imageFileOrUrl.arrayBuffer()
    }

    let embeddedImage
    const uint8 = new Uint8Array(imageBytes)
    const isPng = uint8[0] === 0x89 && uint8[1] === 0x50

    if (isPng) {
      embeddedImage = await pdfDoc.embedPng(imageBytes)
    } else {
      embeddedImage = await pdfDoc.embedJpg(imageBytes)
    }

    const imgDims = embeddedImage.scaleToFit(pageWidth - margin * 2, pageHeight - margin * 2)
    const imgPage = pdfDoc.addPage([pageWidth, pageHeight])

    const imgX = (pageWidth - imgDims.width) / 2
    const imgY = (pageHeight - imgDims.height) / 2

    imgPage.drawImage(embeddedImage, {
      x: imgX,
      y: imgY,
      width: imgDims.width,
      height: imgDims.height,
    })
  } catch (err) {
    console.warn('[pdf-builder] Image embedding failed:', err)
  }

  const pdfBytes = await pdfDoc.save()
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
  const blobUrl = URL.createObjectURL(blob)
  const pdfFile = new File([blob], fileName, { type: 'application/pdf' })

  return { pdfBytes, pdfFile, blobUrl }
}
