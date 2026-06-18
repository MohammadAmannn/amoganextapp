import { useState } from 'react'

import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

export function AiChat() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

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
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()

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

  return (
    <>
      <AppHeader title='AI Chat' />

      <Main fixed>
        <div className='flex h-full flex-col'>
          <div className='flex-1 overflow-y-auto p-4'>
            {messages.length === 0 ? (
              <div className='flex h-full items-center justify-center'>
                <div className='text-center'>
                  <h1 className='text-4xl font-bold'>🤖 AI Chat</h1>
                  <p className='mt-2 text-muted-foreground'>
                    Ask anything to Gemini AI
                  </p>
                </div>
              </div>
            ) : (
              <div className='mx-auto max-w-4xl space-y-4'>
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === 'user'
                        ? 'justify-end'
                        : 'justify-start'
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
                    <div className='rounded-xl bg-muted px-4 py-3'>
                      Thinking...
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className='border-t p-4'>
            <div className='mx-auto flex max-w-4xl gap-2'>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    void sendMessage()
                  }
                }}
                placeholder='Ask anything...'
                className='flex-1 rounded-lg border bg-background px-4 py-2 outline-none'
              />

              <button
                onClick={() => {
                  void sendMessage()
                }}
                disabled={loading}
                className='rounded-lg bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50'
              >
                {loading ? '...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </Main>
    </>
  )
}