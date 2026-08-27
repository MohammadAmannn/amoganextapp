import fs from 'fs'
import path from 'path'
import { jsPDF } from 'jspdf'

/**
 * Enhanced PDF generator with pagination, code blocks, tables, and styled callout boxes.
 */
function createStyledDoc(title, subtitle, author = 'Amoga Engineering Team') {
  const doc = new jsPDF({
    unit: 'pt',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 40
  const contentWidth = pageWidth - margin * 2
  let y = margin

  function checkPageBreak(spaceNeeded) {
    if (y + spaceNeeded > pageHeight - 50) {
      doc.addPage()
      y = margin + 20
      drawHeaderFooter()
    }
  }

  function drawHeaderFooter() {
    const pageNum = doc.internal.getCurrentPageInfo().pageNumber
    doc.saveGraphicsState()
    
    // Header
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(140, 150, 165)
    doc.text(title, margin, 25)
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.5)
    doc.line(margin, 30, pageWidth - margin, 30)

    // Footer
    doc.line(margin, pageHeight - 30, pageWidth - margin, pageHeight - 30)
    doc.text('AmogDS Platform Architecture Guide', margin, pageHeight - 18)
    doc.text(`Page ${pageNum}`, pageWidth - margin - 35, pageHeight - 18)
    doc.restoreGraphicsState()
  }

  // Draw Cover / Banner
  function drawCover() {
    doc.setFillColor(30, 41, 59) // Slate-800
    doc.roundedRect(margin, y, contentWidth, 90, 6, 6, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.setTextColor(255, 255, 255)
    doc.text(title, margin + 18, y + 35)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(203, 213, 225)
    doc.text(subtitle, margin + 18, y + 55)

    doc.setFontSize(8.5)
    doc.setTextColor(148, 163, 184)
    doc.text(`Author: ${author}  |  Version: 1.0.2  |  Date: ${new Date().toLocaleDateString()}`, margin + 18, y + 74)

    y += 110
  }

  function renderMarkdown(mdContent) {
    drawCover()

    const lines = mdContent.split('\n')
    let inCodeBlock = false
    let codeBuffer = []
    let inTable = false
    let tableRows = []

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i]
      const trimmed = rawLine.trim()

      // Handle Code Block start/end
      if (trimmed.startsWith('```')) {
        if (inCodeBlock) {
          // Flush code block
          checkPageBreak(codeBuffer.length * 12 + 18)
          doc.setFillColor(241, 245, 249) // Slate-100
          doc.setDrawColor(203, 213, 225)
          doc.setLineWidth(0.5)
          const boxHeight = codeBuffer.length * 11.5 + 14
          doc.roundedRect(margin, y, contentWidth, boxHeight, 4, 4, 'FD')

          doc.setFont('courier', 'normal')
          doc.setFontSize(8)
          doc.setTextColor(30, 41, 59)

          let codeY = y + 11
          for (const cLine of codeBuffer) {
            doc.text(cLine.substring(0, 95), margin + 10, codeY)
            codeY += 11.5
          }

          y += boxHeight + 10
          codeBuffer = []
          inCodeBlock = false
        } else {
          inCodeBlock = true
          codeBuffer = []
        }
        continue
      }

      if (inCodeBlock) {
        codeBuffer.push(rawLine)
        continue
      }

      // Handle Tables
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        inTable = true
        if (!trimmed.includes('---')) {
          const cells = trimmed.split('|').slice(1, -1).map(c => c.trim())
          tableRows.push(cells)
        }
        continue
      } else if (inTable) {
        // Flush table
        inTable = false
        if (tableRows.length > 0) {
          const numCols = tableRows[0].length
          const colWidth = contentWidth / numCols
          const rowHeight = 16

          checkPageBreak(tableRows.length * rowHeight + 15)

          tableRows.forEach((row, rIdx) => {
            checkPageBreak(rowHeight)
            if (rIdx === 0) {
              doc.setFillColor(241, 245, 249)
              doc.rect(margin, y, contentWidth, rowHeight, 'F')
              doc.setFont('helvetica', 'bold')
              doc.setFontSize(8.5)
              doc.setTextColor(15, 23, 42)
            } else {
              doc.setFont('helvetica', 'normal')
              doc.setFontSize(8)
              doc.setTextColor(51, 65, 85)
            }

            doc.setDrawColor(226, 232, 240)
            doc.setLineWidth(0.5)
            doc.rect(margin, y, contentWidth, rowHeight, 'S')

            row.forEach((cell, cIdx) => {
              const cellX = margin + cIdx * colWidth + 5
              doc.text(cell.substring(0, 45), cellX, y + 11)
            })

            y += rowHeight
          })

          y += 8
          tableRows = []
        }
      }

      if (trimmed === '' || trimmed === '---') {
        if (trimmed === '---') {
          checkPageBreak(12)
          doc.setDrawColor(226, 232, 240)
          doc.setLineWidth(0.5)
          doc.line(margin, y + 4, pageWidth - margin, y + 4)
          y += 12
        } else {
          y += 4
        }
        continue
      }

      // Heading 1 (#)
      if (trimmed.startsWith('# ')) {
        const text = trimmed.replace('# ', '')
        checkPageBreak(30)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(14)
        doc.setTextColor(30, 41, 59)
        doc.text(text, margin, y + 14)
        y += 24
        continue
      }

      // Heading 2 (##)
      if (trimmed.startsWith('## ')) {
        const text = trimmed.replace('## ', '')
        checkPageBreak(25)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(12)
        doc.setTextColor(67, 56, 202) // Indigo-700
        doc.text(text, margin, y + 12)
        y += 20
        continue
      }

      // Heading 3 (###)
      if (trimmed.startsWith('### ')) {
        const text = trimmed.replace('### ', '')
        checkPageBreak(20)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10)
        doc.setTextColor(51, 65, 85)
        doc.text(text, margin, y + 10)
        y += 16
        continue
      }

      // Bullet List (- or *)
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const text = trimmed.substring(2)
        const wrapped = doc.splitTextToSize(text, contentWidth - 16)
        checkPageBreak(wrapped.length * 12 + 4)
        
        doc.setFillColor(79, 70, 229)
        doc.circle(margin + 4, y + 6, 2, 'F')

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8.5)
        doc.setTextColor(51, 65, 85)
        doc.text(wrapped, margin + 14, y + 8)
        y += wrapped.length * 12 + 2
        continue
      }

      // Numbered List
      if (/^\d+\.\s/.test(trimmed)) {
        const text = trimmed.replace(/^\d+\.\s/, '')
        const num = trimmed.match(/^\d+\./)[0]
        const wrapped = doc.splitTextToSize(text, contentWidth - 18)
        checkPageBreak(wrapped.length * 12 + 4)

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(8.5)
        doc.setTextColor(79, 70, 229)
        doc.text(num, margin + 2, y + 8)

        doc.setFont('helvetica', 'normal')
        doc.setTextColor(51, 65, 85)
        doc.text(wrapped, margin + 18, y + 8)
        y += wrapped.length * 12 + 2
        continue
      }

      // Regular Paragraph
      const cleanText = trimmed.replace(/\*\*(.*?)\*\*/g, '$1').replace(/`(.*?)`/g, '$1')
      const wrapped = doc.splitTextToSize(cleanText, contentWidth)
      checkPageBreak(wrapped.length * 12 + 4)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(51, 65, 85)
      doc.text(wrapped, margin, y + 8)
      y += wrapped.length * 12 + 3
    }

    // Apply header & footer across all pages
    const totalPages = doc.internal.getNumberOfPages()
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p)
      drawHeaderFooter()
    }
  }

  return { doc, renderMarkdown }
}

async function main() {
  console.log('Generating PDF Developer Guides...')

  // Guide 1: AmogDS Universal Developer Guide
  const guide1Md = fs.readFileSync(path.join(process.cwd(), 'AMOGDS_UNIVERSAL_DEVELOPER_GUIDE.md'), 'utf-8')
  const g1 = createStyledDoc(
    'AmogDS — Universal Platform Architecture Guide',
    'How to Consume AmogDS in React Web, Next.js, React Native & Node.js Backends'
  )
  g1.renderMarkdown(guide1Md)
  const g1Path = path.join(process.cwd(), 'AMOGDS_UNIVERSAL_DEVELOPER_GUIDE.pdf')
  g1.doc.save(g1Path)
  console.log(`✓ Generated: ${g1Path}`)

  // Guide 2: AmogaNext Integration & Sync Guide
  const guide2Md = fs.readFileSync(path.join(process.cwd(), 'AMOGANEXT_ARCHITECTURE_AND_SYNC_GUIDE.md'), 'utf-8')
  const g2 = createStyledDoc(
    'AmogaNext & AmogDS — Integration & Sync Guide',
    'Real-World Consumer Architecture, Feature Contribution & Automated Synchronization'
  )
  g2.renderMarkdown(guide2Md)
  const g2Path = path.join(process.cwd(), 'AMOGANEXT_ARCHITECTURE_AND_SYNC_GUIDE.pdf')
  g2.doc.save(g2Path)
  console.log(`✓ Generated: ${g2Path}`)

  console.log('All PDF Guides generated successfully!')
}

main().catch(err => {
  console.error('Failed to generate PDF guides:', err)
  process.exit(1)
})
