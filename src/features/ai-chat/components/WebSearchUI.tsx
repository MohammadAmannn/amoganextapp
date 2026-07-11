import { Globe, Image as ImageIcon, ExternalLink } from 'lucide-react'

interface Source {
  title: string
  url: string
  content?: string
}

interface WebSearchUIProps {
  sources: Source[]
  images?: string[]
  onImageClick: (url: string) => void
  loading?: boolean
}

// Extract clean domain name from URL
function getDomainName(urlStr: string): string {
  try {
    const url = new URL(urlStr)
    return url.hostname.replace('www.', '')
  } catch {
    return 'Source'
  }
}

export function WebSearchUI({
  sources,
  images = [],
  onImageClick,
  loading = false,
}: WebSearchUIProps) {
  if (loading) {
    return (
      <div className='flex flex-col gap-2 p-3 bg-muted/40 rounded-xl animate-pulse border border-border/50'>
        <div className='flex items-center gap-2 text-xs font-semibold text-muted-foreground'>
          <Globe className='h-3.5 w-3.5 animate-spin text-primary' />
          <span>Searching the web...</span>
        </div>
      </div>
    )
  }

  const hasSources = sources && sources.length > 0
  const hasImages = images && images.length > 0

  if (!hasSources && !hasImages) return null

  return (
    <div className='mt-4 space-y-4 border-t border-border/50 pt-4'>
      {/* Sources Section */}
      {hasSources && (
        <div className='space-y-2'>
          <div className='flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground/80'>
            <Globe className='h-3.5 w-3.5 text-primary' />
            <span>Sources ({sources.length})</span>
          </div>
          
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5'>
            {sources.map((source, index) => {
              const domain = getDomainName(source.url)
              const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain=${domain}`

              return (
                <a
                  key={index}
                  href={source.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='group flex flex-col justify-between p-2.5 rounded-xl border border-border bg-background hover:bg-muted/40 hover:shadow-md hover:border-primary/30 transition-all duration-200'
                >
                  <div className='space-y-1.5'>
                    <div className='flex items-center gap-1.5'>
                      <img
                        src={faviconUrl}
                        alt=''
                        className='w-3.5 h-3.5 rounded-sm bg-muted'
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = ''
                          ;(e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                      <span className='text-[10px] font-semibold text-muted-foreground truncate group-hover:text-primary transition-colors'>
                        {domain}
                      </span>
                    </div>
                    <h4 className='text-xs font-medium text-foreground line-clamp-2 leading-tight group-hover:text-foreground transition-colors'>
                      {source.title || 'Untitled Source'}
                    </h4>
                  </div>
                  <div className='flex items-center justify-end mt-2 pt-1 border-t border-border/40 text-[9px] text-muted-foreground group-hover:text-primary transition-colors gap-0.5'>
                    <span>View source</span>
                    <ExternalLink className='h-2.5 w-2.5' />
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      )}

      {/* Images Section */}
      {hasImages && (
        <div className='space-y-2'>
          <div className='flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground/80'>
            <ImageIcon className='h-3.5 w-3.5 text-primary' />
            <span>Related Images ({images.length})</span>
          </div>

          <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5'>
            {images.slice(0, 8).map((imageUrl, idx) => (
              <div
                key={idx}
                className='group relative aspect-video rounded-xl overflow-hidden cursor-pointer border border-border hover:shadow-lg hover:border-primary/30 transition-all duration-200 bg-muted/20'
                onClick={() => onImageClick(imageUrl)}
              >
                <img
                  src={imageUrl}
                  alt={`Search result ${idx + 1}`}
                  className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
                <div className='absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-200' />
              </div>
            ))}
          </div>

          {images.length > 8 && (
            <div className='text-[10px] text-muted-foreground text-right font-medium'>
              +{images.length - 8} more images available
            </div>
          )}
        </div>
      )}
    </div>
  )
}
