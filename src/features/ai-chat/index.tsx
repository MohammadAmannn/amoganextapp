import { useState } from 'react'
import { Send, ChevronDown, Bot } from 'lucide-react'

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

export function AiChat() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [model, setModel] = useState('')
  const [messages, setMessages] = useState<Message[]>([])

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

  return (
    <>
      <AppHeader title='AI Chat' />

      <Main fixed>
        <div className='flex h-full flex-col'>
          <div className='flex-1 overflow-y-auto p-4'>
            {messages.length === 0 ? (
              <div className='flex h-full flex-col items-center justify-center gap-4 px-4'>
                <h1 className='text-3xl sm:text-4xl font-bold'>🤖 AI Chat</h1>
                <p className='text-sm sm:text-base text-muted-foreground text-center'>
                  Select a model and start chatting
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

          <div className='border-t p-3 sm:p-4'>
            <div className='mx-auto max-w-4xl'>
              <div className='flex flex-col sm:flex-row gap-2'>
                <div className='flex gap-2'>
                  {/* Model selector on the left */}
                  <div className='relative flex-1 sm:flex-none'>
                    <select
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className={`w-full sm:w-40 md:w-50 h-10 appearance-none rounded-lg border bg-background px-3 sm:px-4 pr-7 sm:pr-8 text-xs sm:text-sm outline-none transition-colors hover:bg-muted/50 focus:ring-2 focus:ring-primary ${
                        !model ? 'text-muted-foreground' : ''
                      }`}
                    >
                      <option value='' className='text-muted-foreground'>
                        Select Model
                      </option>
                      {MODELS.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className='absolute right-2 sm:right-2.5 top-1/2 h-3 w-3 sm:h-4 sm:w-4 -translate-y-1/2 pointer-events-none text-muted-foreground' />
                  </div>

                  {/* Mobile model indicator */}
                  {model && (
                    <div className='flex items-center sm:hidden text-xs text-muted-foreground px-1'>
                      <Bot className='h-3 w-3 mr-1' />
                      <span className='truncate max-w-20'>
                        {currentModel?.name}
                      </span>
                    </div>
                  )}
                </div>

                <div className='flex gap-2 flex-1'>
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        void sendMessage()
                      }
                    }}
                    placeholder='Ask anything...'
                    className='flex-1 min-w-0 rounded-lg border bg-background px-3 sm:px-4 py-2 text-sm sm:text-base outline-none focus:ring-2 focus:ring-primary'
                  />

                  <button
                    onClick={() => void sendMessage()}
                    disabled={loading || !input.trim() || !model}
                    className='flex items-center gap-1 sm:gap-2 rounded-lg bg-primary px-3 sm:px-6 py-2 text-sm sm:text-base text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap'
                  >
                    {loading ? (
                      <span className='flex items-center gap-1'>
                        <span className='animate-pulse'>...</span>
                      </span>
                    ) : (
                      <>
                        <Send className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
                        <span className='hidden sm:inline'>Send</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Status message below */}
              <div className='mt-2 text-xs sm:text-sm text-muted-foreground'>
                {model ? (
                  <div className='hidden sm:block'>
                    Active model: <span className='font-medium'>{currentModel?.name}</span>
                  </div>
                ) : (
                  <span className='text-yellow-600'>
                    ⚠️ Please select a model to start chatting
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Main>
    </>
  )
}