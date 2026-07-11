import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Bot, User, Sparkles } from 'lucide-react'
import { Message } from '../types'
import { WebSearchUI } from './WebSearchUI'

interface ChatMessageProps {
  message: Message
  onImageClick: (url: string) => void
  onOpenPreview?: () => void
  showPreviewBtn?: boolean
}

export function ChatMessage({
  message,
  onImageClick,
  onOpenPreview,
  showPreviewBtn = false,
}: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div
      className={`flex w-full gap-3 ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full border shadow-sm ${
          isUser
            ? 'bg-primary text-primary-foreground border-primary/20'
            : 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30'
        }`}
      >
        {isUser ? (
          <User className='w-4 h-4' />
        ) : (
          <Bot className='w-4 h-4' />
        )}
      </div>

      {/* Bubble Container */}
      <div className={`flex flex-col max-w-[85%] sm:max-w-[78%] gap-1.5`}>
        {/* Author Label */}
        <span className={`text-[10px] font-bold text-muted-foreground/80 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {isUser ? 'You' : 'AI Assistant'}
        </span>

        {/* Text/Markdown Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 text-sm sm:text-base border transition-shadow duration-200 ${
            isUser
              ? 'bg-primary text-primary-foreground border-primary/10 shadow-sm'
              : 'bg-card text-card-foreground border-border/80 shadow-sm'
          }`}
        >
          {isUser ? (
            <div className='whitespace-pre-wrap leading-relaxed'>{message.content}</div>
          ) : (
            <div className='prose prose-sm dark:prose-invert max-w-none leading-relaxed break-words prose-p:leading-relaxed prose-pre:bg-muted/80 prose-pre:border prose-pre:border-border/50 prose-pre:rounded-xl prose-code:text-primary dark:prose-code:text-indigo-400 prose-code:font-mono prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none'>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}

          {/* Quick Generative UI Open Action Button */}
          {!isUser && showPreviewBtn && onOpenPreview && (
            <div className='mt-3 flex justify-start'>
              <button
                onClick={onOpenPreview}
                className='flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:shadow-sm transition-all duration-200 cursor-pointer'
              >
                <Sparkles className='h-3.5 w-3.5' />
                <span>Open Preview Panel</span>
              </button>
            </div>
          )}
        </div>

        {/* Resources attached to assistant message */}
        {!isUser && (message.sources?.length || message.images?.length) && (
          <WebSearchUI
            sources={message.sources || []}
            images={message.images || []}
            onImageClick={onImageClick}
          />
        )}
      </div>
    </div>
  )
}
