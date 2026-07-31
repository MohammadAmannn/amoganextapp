'use client'

import dynamic from 'next/dynamic'
import { X, Download, Loader2, ArrowLeft, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HeaderActions } from '../chat/header-actions'

const DynamicDocViewer = dynamic(
  () =>
    import('@cyntler/react-doc-viewer').then((mod) => {
      return function WrappedDocViewer({ documents }: { documents: any[] }) {
        return (
          <mod.default
            documents={documents}
            pluginRenderers={mod.DocViewerRenderers}
            theme={{
              primary: '#10b981', // Emerald primary to match application theme
              secondary: '#ffffff',
              tertiary: '#f3f4f6',
              textPrimary: '#1f2937',
              textSecondary: '#6b7280',
            }}
            config={{
              header: {
                disableHeader: true,
                disableFileName: true,
                retainURLParams: false,
              },
            }}
            style={{ height: '100%' }}
          />
        )
      }
    }),
  {
    ssr: false,
    loading: () => (
      <div className='animate-in fade-in flex h-full w-full flex-col items-center justify-center space-y-3 bg-background duration-200'>
        <Loader2 className='h-6 w-6 animate-spin text-primary' />
        <p className='animate-pulse text-xs font-semibold text-muted-foreground'>
          Loading document preview...
        </p>
      </div>
    ),
  }
)

interface DocViewerPanelProps {
  onBack: () => void
  fileName?: string
}

export function DocViewerPanel({
  onBack,
  fileName = 'demo.pdf',
}: DocViewerPanelProps) {
  // Use path to the PDF in public
  const documents = [
    {
      uri: '/project.pdf',
      fileName: fileName,
      fileType: 'pdf',
    },
  ]

  return (
    <div className='fixed inset-0 z-50 flex h-full w-full flex-col bg-background overflow-hidden animate-in fade-in duration-200 md:relative md:z-auto'>
      {/* Preview Header formatted like chat header with file icon */}
      <div className='flex flex-none shrink-0 items-center justify-between border-b border-border bg-background px-4 py-3 select-none gap-3'>
        <div className='flex min-w-0 items-center gap-3 flex-1'>
          <button
            onClick={onBack}
            className='-ml-1 flex md:hidden h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
            title='Close'
          >
            <X className='h-5 w-5' />
          </button>

          <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-200/40 bg-gradient-to-br from-red-500/20 to-rose-500/20 text-red-600 dark:border-red-800/40 dark:text-red-400'>
            <FileText className='h-4.5 w-4.5' />
          </div>

          <div className='min-w-0 flex-1'>
            <p className='truncate text-sm font-semibold text-foreground'>
              {fileName}
            </p>
            <p className='truncate text-xs text-muted-foreground'>
              Document Specification · PDF File · July 30, 2026
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <HeaderActions
          onDelete={onBack}
          onDownload={() => {
            const link = document.createElement('a')
            link.href = '/project.pdf'
            link.download = fileName
            link.click()
          }}
        />
      </div>

      {/* Doc Viewer Container */}
      <div className='relative h-full min-h-0 w-full flex-1 overflow-hidden bg-background'>
        <div className='doc-viewer-wrapper h-full w-full'>
          <DynamicDocViewer documents={documents} />
        </div>
      </div>
    </div>
  )
}
