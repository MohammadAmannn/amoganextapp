import { useState } from 'react'
import { Send, ChevronDown } from 'lucide-react'

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
  const [model, setModel] = useState('') // Start with empty string
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
              <div className='flex h-full flex-col items-center justify-center gap-4'>
                <h1 className='text-4xl font-bold'>🤖 AI Chat</h1>
                <p className='text-muted-foreground'>Start chatting with AI</p>
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
                      className={`max-w-[80%] rounded-xl px-4 py-3 whitespace-pre-wrap ${
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
                    <div className='rounded-xl bg-muted px-4 py-3'>Thinking...</div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className='border-t p-4'>
            <div className='mx-auto max-w-4xl'>
              <div className='flex gap-2'>
                {/* Model selector on the left with "Select Model" default */}
                <div className='relative flex-shrink-0'>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className={`h-10 appearance-none rounded-lg border bg-background px-4 pr-8 text-sm outline-none transition-colors hover:bg-muted/50 focus:ring-2 focus:ring-primary ${
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
                  <ChevronDown className='absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none text-muted-foreground' />
                </div>

                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      void sendMessage()
                    }
                  }}
                  placeholder='Ask anything...'
                  className='flex-1 rounded-lg border bg-background px-4 py-2 outline-none focus:ring-2 focus:ring-primary'
                />

                <button
                  onClick={() => void sendMessage()}
                  disabled={loading || !input.trim() || !model}
                  className='flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {loading ? (
                    '...'
                  ) : (
                    <>
                      <Send className='h-4 w-4' />
                      Send
                    </>
                  )}
                </button>
              </div>

              {/* Show current model below */}
              <div className='mt-2 text-xs text-muted-foreground'>
                {model ? (
                  <>Active model: <span className='font-medium'>{currentModel?.name}</span></>
                ) : (
                  <span className='text-yellow-600'>⚠️ Please select a model to start chatting</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Main>
    </>
  )
}