import { useState } from 'react'
import { ArrowUp, Sliders, Zap, History, Plus,  } from 'lucide-react'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'

type Message = {
  role: 'user' | 'assistant'
  content: string
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

export function AiChat() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [model, setModel] = useState('')
  const [api, setApi] = useState('openrouter')
  const [messages, setMessages] = useState<Message[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const sendMessage = async () => {
    if (!input.trim() || loading || !model) return

    const userMessage = input.trim()

    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: userMessage,
      },
    ])

    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          model,
          api,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response')
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.text || 'No response received.',
        },
      ])
    } catch {
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
  }

  const currentModel = MODELS.find(m => m.id === model)

  const handleHistorySelect = (option: string) => {
    // Handle history option selection
    // TODO: Add your logic here for different history options
    switch (option) {
      case 'history':
        // Handle history
        break
      case 'my-prompts':
        // Handle my prompts
        break
      case 'prompts-history':
        // Handle prompts history
        break
      default:
        break
    }
    setShowHistory(false)
  }

  return (
    <>
      <AppHeader title='AI Chat' />

      <Main fixed>
        <div className='flex h-full flex-col'>
          {/* Chat messages area */}
          <div className='flex-1 overflow-y-auto p-4'>
            {messages.length === 0 ? (
              <div className='flex h-full flex-col items-center justify-center gap-4 px-4'>
                <h1 className='text-3xl sm:text-4xl font-bold'>🤖 AI Chat</h1>
                <p className='text-sm sm:text-base text-muted-foreground text-center'>
                  Ask a question about your data...
                </p>
              </div>
            ) : (
              <div className='mx-auto max-w-4xl space-y-4'>
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[80%] rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base whitespace-pre-wrap ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className='flex justify-start'>
                    <div className='rounded-xl bg-muted px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base'>
                      Thinking...
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Input area */}
          <div className='p-4 sm:p-6 bg-background'>
            <div className='mx-auto max-w-4xl space-y-3'>
              {/* Message input with send button */}
              <div className='relative'>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      void sendMessage()
                    }
                  }}
                  placeholder='Ask a question about your data...'
                  rows={2}
                  className='w-full rounded-xl border border-gray-300 bg-background px-4 py-3 text-sm sm:text-base outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none'
                />

                {/* Action buttons on top right of textarea */}
                <div className='absolute right-3 top-3 flex gap-2'>
                  {/* Attachment button */}
                  <button
                    className='p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground'
                    title='Attach file'
                  >
              
                  </button>

                  {/* Send button */}
                  <button
                    onClick={() => void sendMessage()}
                    disabled={loading || !input.trim() || !model}
                    className='p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                    title='Send message'
                  >
                    <ArrowUp className='w-5 h-5' />
                  </button>
                </div>
              </div>

              {/* Controls row - Filter, API, History, Add */}
              <div className='flex items-center justify-between gap-2'>
                <div className='flex items-center gap-2'>
                  {/* Selected Model Display */}
                  {model && currentModel && (
                    <div className='px-3 py-2 rounded-lg bg-muted text-sm text-foreground font-medium'>
                      ✓ {currentModel.name}
                    </div>
                  )}

                  {/* Filter button - opens model selector */}
                  <div className='relative'>
                    <button 
                      onClick={() => setShowFilters(!showFilters)}
                      className='p-2 rounded-lg border border-gray-300 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground'
                      title='Select AI Model'
                    >
                      <Sliders className='w-4 h-4' />
                    </button>

                    {/* Model dropdown modal */}
                    {showFilters && (
                      <div className='absolute left-0 bottom-full mb-2 w-48 rounded-lg border border-gray-300 bg-background shadow-lg z-10'>
                        <div className='p-3 border-b border-gray-300'>
                          <p className='text-xs font-semibold text-foreground mb-3'>Select Model</p>
                          {MODELS.map((m) => (
                            <button
                              key={m.id}
                              onClick={() => {
                                setModel(m.id)
                                setShowFilters(false)
                              }}
                              className={`w-full text-left px-3 py-2 rounded text-sm mb-1 transition-colors ${
                                model === m.id
                                  ? 'bg-primary text-primary-foreground'
                                  : 'hover:bg-muted text-foreground'
                              }`}
                            >
                              {m.name}
                            </button>
                          ))}
                        </div>
                        {model && currentModel && (
                          <div className='px-3 py-2 text-xs text-muted-foreground'>
                            Current: {currentModel.name}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* API selector button */}
                  <div className='relative'>
                    <button className='flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 hover:bg-muted transition-colors text-sm text-foreground'>
                      <Zap className='w-4 h-4' />
                      <span>API</span>
                    </button>

                    {/* Dropdown menu for API selection */}
                    <select
                      value={api}
                      onChange={(e) => setApi(e.target.value)}
                      className='absolute left-0 top-full mt-1 w-32 p-2 rounded-lg border border-gray-300 bg-background text-sm outline-none focus:ring-2 focus:ring-primary opacity-0 w-0 h-0 pointer-events-none'
                    >
                      {APIS.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  {/* History button with dropdown */}
                  <div className='relative'>
                    <button 
                      onClick={() => setShowHistory(!showHistory)}
                      className='flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-muted transition-colors text-sm text-foreground'
                    >
                      <History className='w-4 h-4' />
                      <span>History</span>
                    </button>

                    {/* History dropdown menu - appears upward */}
                    {showHistory && (
                      <div className='absolute right-0 bottom-full mb-2 w-48 rounded-lg border border-gray-300 bg-background shadow-lg z-10'>
                        <div className='p-3'>
                          {HISTORY_OPTIONS.map((option) => (
                            <button
                              key={option.id}
                              onClick={() => handleHistorySelect(option.id)}
                              className='w-full text-left px-3 py-2 rounded text-sm mb-1 hover:bg-muted text-foreground transition-colors last:mb-0'
                            >
                              {option.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Add/New button */}
                  <button className='p-2 rounded-lg border border-gray-300 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground'>
                    <Plus className='w-4 h-4' />
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