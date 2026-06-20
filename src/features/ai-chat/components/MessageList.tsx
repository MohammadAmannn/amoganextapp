/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import { Globe, Image } from 'lucide-react'
import { Message } from '../types'

interface MessageListProps {
  messages: Message[]
  loading: boolean
  tool: string
  sources: any[]
  images: string[]
  onImageClick: (url: string) => void
  messagesEndRef: React.RefObject<HTMLDivElement | null>
}

export function MessageList({ 
  messages, 
  loading, 
  tool, 
  sources, 
  images, 
  onImageClick,
  messagesEndRef 
}: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className='flex h-full flex-col items-center justify-center gap-4 px-4'>
        <h1 className='text-3xl sm:text-4xl font-bold'> AI Chat</h1>
        <p className='text-sm sm:text-base text-muted-foreground text-center'>
          {tool === 'chat' 
            ? 'Ask a question about your data...' 
            : 'Search the web with AI...'}
        </p>
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-4xl space-y-4 py-4'>
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[85%] sm:max-w-[80%] rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base whitespace-pre-wrap ${
              message.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted'
            }`}
          >
            <div>{message.content}</div>

            {/* Display images if available */}
            {message.role === 'assistant' && message.images && message.images.length > 0 && (
              <div className='mt-3 border-t pt-2'>
                <div className='mb-2 flex items-center gap-1 text-xs font-medium text-muted-foreground'>
                  <Image className='h-3 w-3' />
                  Related Images
                </div>
                <div className='grid grid-cols-2 sm:grid-cols-3 gap-2'>
                  {message.images.slice(0, 6).map((imageUrl, idx) => (
                    <div
                      key={idx}
                      className='relative aspect-square rounded-md overflow-hidden cursor-pointer border hover:shadow-lg transition-shadow'
                      onClick={() => onImageClick(imageUrl)}
                    >
                      <img
                        src={imageUrl}
                        alt={`Search result ${idx + 1}`}
                        className='w-full h-full object-cover hover:scale-105 transition-transform duration-200'
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    </div>
                  ))}
                </div>
                {message.images.length > 6 && (
                  <div className='mt-1 text-xs text-muted-foreground'>
                    +{message.images.length - 6} more images
                  </div>
                )}
              </div>
            )}

            {message.role === 'assistant' &&
              message.sources &&
              message.sources.length > 0 && (
                <div className='mt-3 border-t pt-2'>
                  <div className='mb-2 flex items-center gap-1 text-xs font-medium text-muted-foreground'>
                    <Globe className='h-3 w-3' />
                    Sources
                  </div>
                  <div className='flex flex-wrap gap-2'>
                    {message.sources.slice(0, 5).map((source, idx) => (
                      <a
                        key={idx}
                        href={source.url}
                        target='_blank'
                        rel='noreferrer'
                        className='rounded-md border px-2 py-1 text-xs hover:bg-muted'
                      >
                        {source.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      ))}

      {loading && (
        <div className='flex justify-start'>
          <div className='rounded-xl bg-muted px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base'>
            {tool === 'web-search' ? 'Searching the web...' : 'Thinking...'}
          </div>
        </div>
      )}

      {/* Sources and Images display for current web search results */}
      {tool === 'web-search' && !loading && (sources.length > 0 || images.length > 0) && (
        <div className='mx-auto max-w-4xl mt-4 space-y-3'>
          {images.length > 0 && (
            <div>
              <div className='text-xs font-medium mb-2 text-muted-foreground flex items-center gap-1'>
                <Image className='h-3 w-3' />
                Web Search Images ({images.length})
              </div>
              <div className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
                {images.slice(0, 8).map((imageUrl, index) => (
                  <div
                    key={index}
                    className='relative aspect-square rounded-md overflow-hidden cursor-pointer border hover:shadow-lg transition-shadow'
                    onClick={() => onImageClick(imageUrl)}
                  >
                    <img
                      src={imageUrl}
                      alt={`Search result ${index + 1}`}
                      className='w-full h-full object-cover hover:scale-105 transition-transform duration-200'
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  </div>
                ))}
              </div>
              {images.length > 8 && (
                <div className='mt-1 text-xs text-muted-foreground'>
                  +{images.length - 8} more images
                </div>
              )}
            </div>
          )}

          {sources.length > 0 && (
            <div>
              <div className='text-xs font-medium mb-2 text-muted-foreground flex items-center gap-1'>
                <Globe className='h-3 w-3' />
                Web Search Sources ({sources.length})
              </div>
              <div className='flex flex-wrap gap-2'>
                {sources.slice(0, 5).map((source, index) => (
                  <a
                    key={index}
                    href={source.url}
                    target='_blank'
                    rel='noreferrer'
                    className='rounded border px-2 py-1 text-xs hover:bg-muted transition-colors'
                  >
                    {source.title || 'Source'}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  )
}
