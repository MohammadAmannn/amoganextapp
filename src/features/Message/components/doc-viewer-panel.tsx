'use client'

import dynamic from 'next/dynamic'
import { X, Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
  fileName = 'file_upload.csv',
}: DocViewerPanelProps) {
  // Use path to the CSV in public/file_upload.csv
  const documents = [
    {
      uri: '/project.pdf',
      fileName: fileName,
      fileType: 'pdf',
    },
  ]

  return (
    <div className='animate-in fade-in flex h-full w-full flex-col overflow-hidden bg-card duration-200'>
      {/* Preview Header */}
      <div className='flex flex-none shrink-0 items-center justify-between border-b border-border bg-muted/10 p-4 select-none'>
        <div className='flex min-w-0 items-center gap-3'>
          <Button
            size='icon'
            variant='ghost'
            onClick={onBack}
            className='h-8.5 w-8.5 shrink-0 cursor-pointer rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground'
            title='Close Preview'
          >
            <X className='h-5 w-5' />
          </Button>
          <span className='truncate text-sm font-bold text-foreground'>
            {fileName}
          </span>
        </div>
        {/* Action buttons */}
        <div className='flex shrink-0 items-center gap-1.5'>
          <a
            href='/file_upload.csv'
            download={fileName}
            target='_blank'
            rel='noopener noreferrer'
          >
            <Button
              size='icon'
              variant='ghost'
              className='h-8.5 w-8.5 cursor-pointer rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground'
              title='Download Document'
            >
              <Download className='h-4.5 w-4.5' />
            </Button>
          </a>
        </div>
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
