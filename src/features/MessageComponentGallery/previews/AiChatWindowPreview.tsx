'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Bot, Sparkles, X } from 'lucide-react'
import { MessageList } from '@/features/ai-chat/components/MessageList'
import { MessageInput } from '@/features/ai-chat/components/MessageInput'
import { ImageModal } from '@/features/ai-chat/components/ImageModal'
import { Message } from '@/features/ai-chat/types'
import { mockAiMessages } from '../mocks'
import { FileUploadProgress } from '@/features/Message/components/chat/file-upload-progress'
import { HeaderActions } from '@/features/Message/components/chat/header-actions'

export function AiChatWindowPreview({
  initialState = 'conversation',
  onClose,
}: {
  initialState?: 'conversation' | 'empty'
  onClose?: () => void
}) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [model, setModel] = useState('google/gemini-2.5-flash')
  const [api, setApi] = useState('openrouter')
  const [messages, setMessages] = useState<Message[]>(
    initialState === 'empty' ? [] : mockAiMessages
  )
  const [showModelDropdown, setShowModelDropdown] = useState(false)
  const [showToolsDropdown, setShowToolsDropdown] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [tool, setTool] = useState('chat')
  const [isListening, setIsListening] = useState(false)
  const [isSpeechSupported, setIsSpeechSupported] = useState(true)
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [aiUploadState, setAiUploadState] = useState<{
    fileName: string
    fileSize: number
    progress: number
    status: 'uploading' | 'completed' | 'error'
  } | null>(null)

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = useCallback(
    async (message?: string, overrideTool?: string) => {
      const textToSend = message || input.trim()
      if (!textToSend || loading) return

      const activeTool = overrideTool || tool

      setMessages((prev) => [...prev, { role: 'user', content: textToSend }])
      setInput('')
      setLoading(true)

      setTimeout(() => {
        let replyContent = ''
        let sources: { title: string; url: string }[] | undefined = undefined

        if (
          textToSend.toLowerCase().includes('react') ||
          textToSend.toLowerCase().includes('hook') ||
          textToSend.toLowerCase().includes('component')
        ) {
          replyContent = `Here is how you can implement that in React 19:

\`\`\`tsx
import React, { useTransition } from 'react';

export function ActionButton({ onAction }: { onAction: () => Promise<void> }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(async () => { await onAction(); })}
      disabled={isPending}
      className="rounded-lg bg-primary px-3 py-1.5 text-xs text-primary-foreground"
    >
      {isPending ? 'Processing...' : 'Run Action'}
    </button>
  );
}
\`\`\`

- Clean asynchronous transition handling
- Zero hydration mismatch issues.`
          sources = [
            { title: 'React 19 Official Documentation', url: 'https://react.dev' },
          ]
        } else {
          replyContent = `### AI Response for: "${textToSend}"\n\nI have analyzed your request using **Gemini 2.5 Flash**.\n\nKey takeaways:\n- Isolated component architecture\n- Mock JSON data verification completed\n- Responsive UI verified.`
          sources = [
            { title: 'Documentation & Reference', url: '#' },
          ]
        }

        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: replyContent,
            sources,
          },
        ])
        setLoading(false)
      }, 700)
    },
    [input, loading, tool]
  )

  const handleAiFileSelect = (file: File) => {
    setAiUploadState({
      fileName: file.name,
      fileSize: file.size,
      progress: 20,
      status: 'uploading',
    })

    const interval = setInterval(() => {
      setAiUploadState((prev) => {
        if (!prev) return null
        if (prev.progress >= 90) {
          clearInterval(interval)
          setTimeout(() => {
            void sendMessage(`[Attached File: ${file.name}]`, 'chat')
            setAiUploadState(null)
          }, 300)
          return { ...prev, progress: 100, status: 'completed' }
        }
        return { ...prev, progress: prev.progress + 30 }
      })
    }, 180)
  }

  const toggleVoice = () => {
    setIsListening(!isListening)
    toast.info(isListening ? 'Voice stopped' : 'Voice input active... (preview only)')
  }

  const handleSelectPrompt = useCallback(
    (promptText: string, toolId: string) => {
      setTool(toolId)
      setInput(promptText)
      void sendMessage(promptText, toolId)
    },
    [sendMessage]
  )

  const handleNewChat = useCallback(() => {
    setMessages([])
    setInput('')
    setTool('chat')
    toast.info('New chat session started')
  }, [])

  return (
    <div className='flex h-full w-full flex-col bg-background overflow-hidden'>
      {/* ── TOP HEADER (Exact match to real AiChatPanel) ───────────────────────── */}
      <div className='flex shrink-0 items-center justify-between border-b border-border bg-background px-4 py-3 select-none'>
        <div className='flex items-center gap-3 min-w-0'>
          <div className='flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl border border-indigo-200/40 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-600 dark:border-indigo-800/40 dark:text-indigo-400'>
            <Bot className='h-4 w-4' />
          </div>

          <div className='min-w-0'>
            <p className='flex items-center gap-1.5 truncate text-sm font-semibold text-foreground leading-tight'>
              AI Assistant
              <Sparkles className='h-3 w-3 text-indigo-400' />
            </p>
            <p className='truncate text-xs text-muted-foreground leading-tight'>
              Powered by AI · Ask anything
            </p>
          </div>
        </div>

        <div className='flex items-center gap-1 shrink-0'>
          <HeaderActions onDelete={handleNewChat} />
          {onClose && (
            <button
              type='button'
              onClick={onClose}
              className='p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ml-1 cursor-pointer'
              title='Close'
              aria-label='Close'
            >
              <X className='h-4.5 w-4.5' />
            </button>
          )}
        </div>
      </div>

      {/* ── MESSAGES LIST ────────────────────────────────────────────────────── */}
      <div className='min-h-0 flex-1 overflow-y-auto'>
        <MessageList
          messages={messages}
          loading={loading}
          tool={tool}
          onImageClick={(url) => {
            setSelectedImage(url)
            setShowImageModal(true)
          }}
          onSelectPrompt={handleSelectPrompt}
          messagesEndRef={messagesEndRef}
        />
      </div>

      {/* ── COMPOSER INPUT (Exact match to real AiChatPanel MessageInput) ────── */}
      <div className='shrink-0 border-t border-border bg-background'>
        {aiUploadState && (
          <div className='px-4 pt-3 pb-1'>
            <FileUploadProgress
              fileName={aiUploadState.fileName}
              fileSize={aiUploadState.fileSize}
              progress={aiUploadState.progress}
              status={aiUploadState.status}
              onCancel={() => setAiUploadState(null)}
            />
          </div>
        )}
        <MessageInput
          input={input}
          setInput={setInput}
          loading={loading}
          model={model}
          setModel={setModel}
          api={api}
          setApi={setApi}
          tool={tool}
          setTool={setTool}
          isListening={isListening}
          isSpeechSupported={isSpeechSupported}
          showModelDropdown={showModelDropdown}
          setShowModelDropdown={setShowModelDropdown}
          showToolsDropdown={showToolsDropdown}
          setShowToolsDropdown={setShowToolsDropdown}
          showHistory={showHistory}
          setShowHistory={setShowHistory}
          onSend={() => sendMessage()}
          onVoiceToggle={toggleVoice}
          onHistorySelect={() => setShowHistory(false)}
          onClearSources={() => {}}
          onNewChat={handleNewChat}
          onFileSelect={handleAiFileSelect}
          inputRef={inputRef}
        />
      </div>

      <ImageModal
        isOpen={showImageModal}
        imageUrl={selectedImage}
        onClose={() => {
          setShowImageModal(false)
          setSelectedImage(null)
        }}
      />
    </div>
  )
}
