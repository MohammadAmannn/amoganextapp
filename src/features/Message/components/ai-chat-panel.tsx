'use client'

/* eslint-disable no-console */
import { useState, useRef, useEffect, useCallback } from 'react'
import { ArrowLeft, Bot, Sparkles } from 'lucide-react'
import { MessageList } from '@/features/ai-chat/components/MessageList'
import { MessageInput } from '@/features/ai-chat/components/MessageInput'
import { ImageModal } from '@/features/ai-chat/components/ImageModal'
import { Message } from '@/features/ai-chat/types'

const TAVILY_API_KEY = process.env.NEXT_PUBLIC_TAVILY_API_KEY ?? ''

const INITIAL_PROMPT =
  'Explain the new features of React 19 with examples of Server Actions and the use() hook.'

interface AiChatPanelProps {
  onBack: () => void
}

export function AiChatPanel({ onBack }: AiChatPanelProps) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [model, setModel] = useState('google/gemini-2.5-flash')
  const [api, setApi] = useState('openrouter')
  const [messages, setMessages] = useState<Message[]>([])
  const [showModelDropdown, setShowModelDropdown] = useState(false)
  const [showToolsDropdown, setShowToolsDropdown] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [tool, setTool] = useState('chat')
  const [isListening, setIsListening] = useState(false)
  const [isSpeechSupported, setIsSpeechSupported] = useState(true)
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const recognitionRef = useRef<any>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const accumulatedTranscriptRef = useRef<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const initialSentRef = useRef(false)

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Speech recognition init
  useEffect(() => {
    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition
      if (!SpeechRecognition) {
        setIsSpeechSupported(false)
        return
      }
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'
      recognition.onresult = (event: any) => {
        let interim = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            accumulatedTranscriptRef.current += transcript + ' '
          } else {
            interim += transcript
          }
        }
        const display = (accumulatedTranscriptRef.current + interim).trim()
        if (display) setInput(display)
      }
      recognition.onerror = (event: any) => {
        console.error('Speech error:', event.error)
        setIsListening(false)
      }
      recognition.onend = () => setIsListening(false)
      recognitionRef.current = recognition
    } catch {
      setIsSpeechSupported(false)
    }
    return () => {
      if (recognitionRef.current) recognitionRef.current.abort()
    }
  }, [])

  const sendMessage = useCallback(
    async (message?: string, overrideTool?: string) => {
      const textToSend = message || input.trim()
      if (!textToSend || loading || !model) return

      const activeTool = overrideTool || tool

      setMessages((prev) => [...prev, { role: 'user', content: textToSend }])
      setInput('')
      setLoading(true)

      try {
        let finalPrompt = textToSend
        let searchResults: any[] = []
        let imageUrls: string[] = []

        if (activeTool === 'web-search') {
          try {
            const tavilyResponse = await fetch('https://api.tavily.com/search', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                api_key: TAVILY_API_KEY,
                query: textToSend,
                search_depth: 'advanced',
                max_results: 8,
                include_images: true,
              }),
            })
            const tavilyData = await tavilyResponse.json()
            searchResults = tavilyData.results || []
            imageUrls = tavilyData.images || []
            const context = searchResults
              .map(
                (item: any) =>
                  `Title: ${item.title}\nContent: ${item.content}\nURL: ${item.url}`
              )
              .join('\n\n')
            finalPrompt = `You are an AI Search Assistant.\n\nQuestion:\n${textToSend}\n\nSearch Results:\n${context}\n\nInstructions:\n- Use the search results to provide accurate information.\n- Give a complete and comprehensive answer.\n- Mention important facts and key details.\n- Use headings and bullet points when useful for readability.\n- Cite sources where appropriate.`
          } catch (err) {
            console.error('Tavily error:', err)
          }
        }

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: finalPrompt, model, api, tool: activeTool }),
        })

        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Failed to get response')

        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.text || 'No response received.',
            sources: searchResults.map((result: any) => ({
              title: result.title || 'Source',
              url: result.url || '#',
            })),
            images: imageUrls.length > 0 ? imageUrls : undefined,
          },
        ])
      } catch (error) {
        console.error('Error sending message:', error)
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Something went wrong. Please try again.' },
        ])
      } finally {
        setLoading(false)
      }
    },
    [input, loading, model, api, tool]
  )

  // Auto-send initial prompt on mount (once only)
  useEffect(() => {
    if (!initialSentRef.current) {
      initialSentRef.current = true
      void sendMessage(INITIAL_PROMPT, 'chat')
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleVoice = () => {
    if (!isSpeechSupported) return
    if (isListening) {
      recognitionRef.current?.stop()
      accumulatedTranscriptRef.current = ''
      setIsListening(false)
    } else {
      try {
        if (recognitionRef.current) {
          accumulatedTranscriptRef.current = ''
          setInput('')
          recognitionRef.current.start()
          setIsListening(true)
        }
      } catch (err) {
        console.error('Voice error:', err)
      }
    }
  }

  const handleSelectPrompt = useCallback(
    (promptText: string, toolId: string) => {
      setTool(toolId)
      setInput(promptText)
      void sendMessage(promptText, toolId)
    },
    [sendMessage]
  )

  return (
    <div className='flex h-full flex-col overflow-hidden'>
      {/* Header */}
      <div className='flex shrink-0 items-center gap-3 border-b border-border bg-background px-4 py-3'>
        <button
          onClick={onBack}
          className='flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden'
          title='Back'
        >
          <ArrowLeft className='h-4 w-4' />
        </button>

        <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-indigo-200/40 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-600 dark:border-indigo-800/40 dark:text-indigo-400'>
          <Bot className='h-4.5 w-4.5' />
        </div>

        <div className='min-w-0 flex-1'>
          <p className='flex items-center gap-1.5 truncate text-sm font-semibold text-foreground'>
            AI Assistant
            <Sparkles className='h-3 w-3 text-indigo-400' />
          </p>
          <p className='truncate text-xs text-muted-foreground'>
            Powered by AI · Ask anything
          </p>
        </div>
      </div>

      {/* Messages */}
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

      {/* Input */}
      <div className='shrink-0 border-t border-border bg-background'>
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
