import { Bot } from 'lucide-react'
import { Message } from '../types'
import { ChatMessage } from './ChatMessage'
import { PromptSuggestions } from './PromptSuggestions'

interface MessageListProps {
  messages: Message[]
  loading: boolean
  tool: string
  onImageClick: (url: string) => void
  onSelectPrompt: (prompt: string, tool: string) => void
  onOpenPreview?: () => void
  messagesEndRef: React.RefObject<HTMLDivElement | null>
}

export function MessageList({
  messages,
  loading,
  tool,
  onImageClick,
  onSelectPrompt,
  onOpenPreview,
  messagesEndRef,
}: MessageListProps) {
  // Empty State - show Prompt Suggestions
  if (messages.length === 0) {
    return (
      <PromptSuggestions
        onSelect={onSelectPrompt}
        currentTool={tool}
      />
    )
  }

  // Find the index of the last assistant message that succeeded in rendering UI
  // which will have a specific text indicating success
  const lastUiMsgIndex = [...messages]
    .reverse()
    .findIndex(
      (msg) =>
        msg.role === 'assistant' &&
        msg.content.includes('UI generated successfully!')
    )
  
  // Convert back to absolute index in the original array
  const showPreviewBtnIndex = lastUiMsgIndex !== -1 
    ? messages.length - 1 - lastUiMsgIndex 
    : -1

  return (
    <div className='mx-auto max-w-4xl space-y-6 py-6 px-1 sm:px-4'>
      {messages.map((message, index) => (
        <ChatMessage
          key={index}
          message={message}
          onImageClick={onImageClick}
          onOpenPreview={onOpenPreview}
          showPreviewBtn={index === showPreviewBtnIndex}
        />
      ))}

      {/* Loading state */}
      {loading && (
        <div className='flex justify-start gap-3 w-full'>
          <div className='flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full border border-indigo-100 dark:border-indigo-900/30 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 shadow-sm'>
            <Bot className='w-4 h-4' />
          </div>
          <div className='flex flex-col gap-1.5 max-w-[85%] sm:max-w-[78%]'>
            <span className='text-[10px] font-bold text-muted-foreground/80 px-1'>
              AI Assistant
            </span>
            <div className='rounded-2xl px-4 py-3 bg-card text-muted-foreground border border-border/80 shadow-sm flex items-center gap-2'>
              <div className='flex gap-1.5 items-center'>
                <span className='w-1.5 h-1.5 bg-primary/70 rounded-full animate-bounce' style={{ animationDelay: '0ms' }}></span>
                <span className='w-1.5 h-1.5 bg-primary/70 rounded-full animate-bounce' style={{ animationDelay: '150ms' }}></span>
                <span className='w-1.5 h-1.5 bg-primary/70 rounded-full animate-bounce' style={{ animationDelay: '300ms' }}></span>
              </div>
              <span className='text-xs font-medium'>
                {tool === 'web-search' 
                  ? 'Searching the web...' 
                  : tool === 'ui-render' 
                    ? 'Generating UI components...' 
                    : 'Thinking...'}
              </span>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} className='h-2' />
    </div>
  )
}
