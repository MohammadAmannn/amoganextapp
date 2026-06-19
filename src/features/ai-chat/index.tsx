/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-console */
import { useState, useRef, useEffect, useCallback } from 'react'
import { ArrowUp, Sliders, Zap, History, Plus, Mic, Globe, Wrench, Image, X } from 'lucide-react'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'

type Message = {
  role: 'user' | 'assistant'
  content: string
  sources?: {
    title: string
    url: string
  }[]
  images?: string[]
}

const MODELS = [
  { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
  { id: 'openai/gpt-4o', name: 'GPT-4o' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat' },
  { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B' },
]

const APIS = [
  { id: 'openrouter', name: 'OpenRouter' },
  { id: 'openai', name: 'OpenAI' },
  { id: 'anthropic', name: 'Anthropic' },
  { id: 'google', name: 'Google AI' },
]

const HISTORY_OPTIONS = [
  { id: 'history', name: 'History' },
  { id: 'my-prompts', name: 'My Prompts' },
  { id: 'prompts-history', name: 'Prompts History' },
]

// Tavily API Key from environment variables
const TAVILY_API_KEY = import.meta.env.VITE_TAVILY_API_KEY

// Define types for Web Speech API
interface SpeechRecognitionEvent {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent {
  error: string
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

// Extend Window interface
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

export function AiChat() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [model, setModel] = useState('google/gemini-2.5-flash')
  const [api, setApi] = useState('openrouter')
  const [messages, setMessages] = useState<Message[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showTools, setShowTools] = useState(false)
  const [webSearchEnabled, setWebSearchEnabled] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeechSupported, setIsSpeechSupported] = useState(true)
  const [sources, setSources] = useState<any[]>([])
  const [images, setImages] = useState<string[]>([]) // State for images
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const accumulatedTranscriptRef = useRef<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Define sendMessage using useCallback
  const sendMessage = useCallback(async (message?: string) => {
    const textToSend = message || input.trim()

    if (!textToSend || loading || !model) return

    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: textToSend,
      },
    ])

    setInput('')
    setLoading(true)
    setSources([])
    setImages([]) // Clear previous images

    try {
      let finalPrompt = textToSend
      let searchResults: any[] = []
      let imageUrls: string[] = []

      // If web search is enabled, fetch from Tavily
      if (webSearchEnabled) {
        try {
          const tavilyResponse = await fetch(
            'https://api.tavily.com/search',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                api_key: TAVILY_API_KEY,
                query: textToSend,
                search_depth: 'advanced',
                max_results: 8,
                include_images: true,
              }),
            }
          )

          const tavilyData = await tavilyResponse.json()
          searchResults = tavilyData.results || []
          imageUrls = tavilyData.images || [] // Extract images from response

          // Set sources and images for display
          setSources(searchResults)
          setImages(imageUrls)

          const context = searchResults
            .map(
              (item: any) =>
                `Title: ${item.title}
Content: ${item.content}
URL: ${item.url}`
            )
            .join('\n\n')

          finalPrompt = `
You are an AI Search Assistant.

Question:
${textToSend}

Search Results:
${context}

Instructions:
- Use the search results to provide accurate information.
- Give a complete and comprehensive answer.
- Mention important facts and key details.
- Use headings and bullet points when useful for readability.
- Cite sources where appropriate.`
        } catch (error) {
          console.error('Tavily Error:', error)
          // Continue without search results if Tavily fails
        }
      }

      // Send to chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: finalPrompt,
          model,
          api,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response')
      }

      // Add assistant message with sources and images
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
        {
          role: 'assistant',
          content: 'Something went wrong. Please try again.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }, [input, loading, model, api, webSearchEnabled])

  // Initialize speech recognition
  useEffect(() => {
    // Check if browser supports SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setIsSpeechSupported(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript

        if (event.results[i].isFinal) {
          accumulatedTranscriptRef.current += transcript + ' '
        } else {
          interimTranscript += transcript
        }
      }

      const displayText = (accumulatedTranscriptRef.current + interimTranscript).trim()

      if (displayText) {
        setInput(displayText)
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)

      if (event.error === 'not-allowed') {
        alert('Please allow microphone access to use voice input')
      } else if (event.error === 'no-speech') {
        setIsListening(false)
      }
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [])

  const toggleVoiceInput = () => {
    if (!isSpeechSupported) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.')
      return
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      accumulatedTranscriptRef.current = ''
      setIsListening(false)
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    } else {
      try {
        if (recognitionRef.current) {
          accumulatedTranscriptRef.current = ''
          setInput('')
          recognitionRef.current.start()
          setIsListening(true)
        }
      } catch (error) {
        console.error('Failed to start speech recognition:', error)
        alert('Failed to start voice input. Please try again.')
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleHistorySelect = (option: string) => {
    switch (option) {
      case 'history':
        break
      case 'my-prompts':
        break
      case 'prompts-history':
        break
      default:
        break
    }
    setShowHistory(false)
  }

  const currentModel = MODELS.find(m => m.id === model)

  return (
    <>
      <AppHeader title='AI Chat' />

      <Main fixed className='p-0'>
        <div className='flex h-screen flex-col'>
          {/* Chat messages area - scrollable with no extra padding */}
          <div className='flex-1 overflow-y-auto px-4'>
            {messages.length === 0 ? (
              <div className='flex h-full flex-col items-center justify-center gap-4 px-4'>
                <h1 className='text-3xl sm:text-4xl font-bold'>🤖 AI Chat</h1>
                <p className='text-sm sm:text-base text-muted-foreground text-center'>
                  Ask a question about your data...
                </p>
              </div>
            ) : (
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
                                onClick={() => {
                                  setSelectedImage(imageUrl)
                                  setShowImageModal(true)
                                }}
                              >
                                <img
                                  src={imageUrl}
                                  alt={`Search result ${idx + 1}`}
                                  className='w-full h-full object-cover hover:scale-105 transition-transform duration-200'
                                  onError={(e) => {
                                    // Hide broken images
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
                      {webSearchEnabled ? 'Searching the web...' : 'Thinking...'}
                    </div>
                  </div>
                )}

                {/* Sources and Images display for current web search results */}
                {webSearchEnabled && !loading && (sources.length > 0 || images.length > 0) && (
                  <div className='mx-auto max-w-4xl mt-4 space-y-3'>
                    {/* Images display */}
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
                              onClick={() => {
                                setSelectedImage(imageUrl)
                                setShowImageModal(true)
                              }}
                            >
                              <img
                                src={imageUrl}
                                alt={`Search result ${index + 1}`}
                                className='w-full h-full object-cover hover:scale-105 transition-transform duration-200'
                                onError={(e) => {
                                  // Hide broken images
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

                    {/* Sources display */}
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
            )}
          </div>

          {/* Image Modal */}
          {showImageModal && selectedImage && (
            <div
              className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm'
              onClick={() => {
                setShowImageModal(false)
                setSelectedImage(null)
              }}
            >
              <div className='relative max-w-4xl max-h-[90vh] p-4'>
                <button
                  onClick={() => {
                    setShowImageModal(false)
                    setSelectedImage(null)
                  }}
                  className='absolute top-2 right-2 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors'
                >
                  <X className='w-6 h-6' />
                </button>
                <img
                  src={selectedImage}
                  alt='Enlarged view'
                  className='max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl'
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}

          {/* Input area - Completely at bottom with zero gaps */}
          <div className='bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 pt-1.5 pb-1.5 sm:px-6'>
            <div className='mx-auto max-w-4xl'>
              {/* Message input with send button */}
              <div className='relative rounded-2xl border-2 border-gray-200 bg-background shadow-sm hover:border-gray-300 transition-colors focus-within:border-primary'>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    isListening 
                      ? '🎤 Listening... Speak now' 
                      : loading 
                        ? webSearchEnabled ? 'Searching...' : 'Thinking...' 
                        : 'Ask a question about your data...'
                  }
                  rows={1}
                  className={`w-full rounded-xl border-0 px-4 py-2 pr-24 text-sm sm:text-base resize-none outline-none focus:ring-0 ${
                    isListening
                      ? 'bg-red-50 dark:bg-red-950/20'
                      : 'bg-transparent'
                  } ${loading ? 'opacity-50' : ''}`}
                  disabled={loading}
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                />

                {/* Action buttons on the right side */}
                <div className='absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5'>
                  {/* Voice Input button */}
                  {isSpeechSupported && (
                    <button
                      onClick={toggleVoiceInput}
                      disabled={loading || !model}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isListening
                          ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      title={isListening ? 'Stop recording' : 'Start voice input'}
                    >
                      <Mic className='w-4 h-4' />
                    </button>
                  )}

                  {/* Send button */}
                  <button
                    onClick={() => sendMessage()}
                    disabled={loading || !input.trim() || !model}
                    className='p-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                    title='Send message'
                  >
                    <ArrowUp className='w-4 h-4' />
                  </button>
                </div>

                {/* Voice input status indicator */}
                {isListening && (
                  <div className='absolute -bottom-5 left-4 flex items-center gap-2'>
                    <div className='flex gap-1'>
                      <span className='w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce' style={{ animationDelay: '0ms' }}></span>
                      <span className='w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce' style={{ animationDelay: '150ms' }}></span>
                      <span className='w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce' style={{ animationDelay: '300ms' }}></span>
                    </div>
                    <span className='text-xs text-red-500 font-medium'>Listening...</span>
                  </div>
                )}
              </div>

              {/* Controls row - Model, API, History, Add - Minimal spacing */}
              <div className='flex items-center justify-between gap-1.5 mt-1'>
                <div className='flex items-center gap-1 flex-wrap'>
                  {/* Selected Model Display */}
                  {model && currentModel && (
                    <>
                      <div className='px-2 py-0.5 rounded-lg bg-muted/80 text-xs text-foreground font-medium whitespace-nowrap'>
                        {currentModel.name}
                      </div>

                      {webSearchEnabled && (
                        <div className='px-2 py-0.5 rounded-lg bg-blue-100 text-blue-700 text-xs font-medium whitespace-nowrap flex items-center gap-1'>
                          <Globe className='h-3 w-3' />
                          Web Search
                        </div>
                      )}
                    </>
                  )}

                  {/* Filter button - opens model selector */}
                  <div className='relative'>
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className='p-1 rounded-lg border border-gray-200 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground'
                      title='Select AI Model'
                    >
                      <Sliders className='w-3.5 h-3.5' />
                    </button>

                    {/* Model dropdown modal */}
                    {showFilters && (
                      <div className='absolute left-0 bottom-full mb-1.5 w-56 rounded-lg border border-gray-200 bg-background shadow-lg z-10'>
                        <div className='p-2'>
                          <p className='text-xs font-semibold text-foreground px-2 py-1'>Select Model</p>
                          {MODELS.map((m) => (
                            <button
                              key={m.id}
                              onClick={() => {
                                setModel(m.id)
                                setShowFilters(false)
                              }}
                              className={`w-full text-left px-3 py-2 rounded text-sm mb-0.5 transition-colors ${
                                model === m.id
                                  ? 'bg-primary text-primary-foreground'
                                  : 'hover:bg-muted text-foreground'
                              }`}
                            >
                              {m.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* API selector */}
                  <div className='relative'>
                    <button className='flex items-center gap-1 px-2 py-0.5 rounded-lg border border-gray-200 hover:bg-muted transition-colors text-xs text-foreground whitespace-nowrap'>
                      <Zap className='w-3.5 h-3.5' />
                      <span className='hidden sm:inline'>API</span>
                      <span className='sm:hidden'>{APIS.find(a => a.id === api)?.name || 'API'}</span>
                    </button>
                    <select
                      value={api}
                      onChange={(e) => setApi(e.target.value)}
                      className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                    >
                      {APIS.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tools button with dropdown */}
                  <div className='relative'>
                    <button
                      onClick={() => setShowTools(!showTools)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border border-gray-200 hover:bg-muted transition-colors text-xs ${
                        webSearchEnabled ? 'bg-blue-50 border-blue-200 text-blue-700' : ''
                      }`}
                    >
                      <Wrench className='w-3.5 h-3.5' />
                      <span>Tools {webSearchEnabled && '•'}</span>
                    </button>

                    {showTools && (
                      <div className='absolute left-0 bottom-full mb-1.5 w-52 rounded-lg border border-gray-200 bg-background shadow-lg z-10'>
                        <div className='p-2'>
                          <button
                            onClick={() => {
                              setWebSearchEnabled(!webSearchEnabled)
                              setShowTools(false)
                              // Clear sources and images when toggling off
                              if (webSearchEnabled) {
                                setSources([])
                                setImages([])
                              }
                            }}
                            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors flex items-center justify-between ${
                              webSearchEnabled
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-muted'
                            }`}
                          >
                            <span>🌐 Web Search</span>
                            {webSearchEnabled && <span className="text-xs">✓</span>}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className='flex items-center gap-1'>
                  {/* History button with dropdown */}
                  <div className='relative'>
                    <button
                      onClick={() => setShowHistory(!showHistory)}
                      className='flex items-center gap-1 px-2 py-0.5 rounded-lg border border-gray-200 hover:bg-muted transition-colors text-xs text-foreground whitespace-nowrap'
                    >
                      <History className='w-3.5 h-3.5' />
                      <span>History</span>
                    </button>

                    {/* History dropdown menu */}
                    {showHistory && (
                      <div className='absolute right-0 bottom-full mb-1.5 w-48 rounded-lg border border-gray-200 bg-background shadow-lg z-10'>
                        <div className='p-2'>
                          {HISTORY_OPTIONS.map((option) => (
                            <button
                              key={option.id}
                              onClick={() => handleHistorySelect(option.id)}
                              className='w-full text-left px-3 py-2 rounded text-sm mb-0.5 hover:bg-muted text-foreground transition-colors last:mb-0'
                            >
                              {option.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Add/New button */}
                  <button className='p-1 rounded-lg border border-gray-200 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground'>
                    <Plus className='w-3.5 h-3.5' />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Main>
    </>
  )
}