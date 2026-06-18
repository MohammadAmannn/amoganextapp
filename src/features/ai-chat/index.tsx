import { useState } from 'react'
import { Bot, History, Link2, Plus } from 'lucide-react'

import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import models from '@/data/models.json'
import apis from '@/data/apis.json'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

export function AiChat() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedApi, setSelectedApi] = useState('')

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
          model: selectedModel,
          api: selectedApi,
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

  const getModelName = (id: string) => {
    const model = models.find((m) => m.id === id)
    return model?.name || 'Select a model'
  }

  return (
    <>
      <AppHeader title='AI Chat' />

      <Main fixed>
        <div className='flex h-full flex-col rounded-lg border'>
          <div className='flex-1 overflow-y-auto p-4'>
            {messages.length === 0 ? (
              <div className='flex h-full flex-col items-center justify-center'>
                <h1 className='text-4xl font-bold'>🤖 AI Chat</h1>
                <p className='mt-2 text-muted-foreground'>
                  Select a model and start chatting
                </p>
                <div className='mt-4 rounded-md border px-4 py-2 text-sm'>
                  Model: {selectedModel ? getModelName(selectedModel) : 'None selected'}
                </div>
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
                  disabled={loading || !selectedModel}
                  className='rounded-lg bg-primary px-6 py-2 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors'
                >
                  {loading ? '...' : 'Send'}
                </button>
              </div>

              <div className='mt-3 flex items-center justify-between'>
                <div className='flex items-center gap-2 flex-wrap'>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className='w-50'>
                      <Bot className='h-4 w-4 mr-2' />
                      <SelectValue placeholder='Select Model' />
                    </SelectTrigger>
                    <SelectContent side='top' align='start' className='max-h-75'>
                      {models.map((model) => (
                        <SelectItem key={model.id} value={model.id} className='cursor-pointer'>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedApi} onValueChange={setSelectedApi}>
                    <SelectTrigger className='w-45'>
                      <Link2 className='h-4 w-4 mr-2' />
                      <SelectValue placeholder='Select API' />
                    </SelectTrigger>
                    <SelectContent side='top' align='start' className='max-h-75'>
                      {apis.map((api) => (
                        <SelectItem key={api.id} value={api.id} className='cursor-pointer'>
                          {api.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='flex items-center gap-2'>
                  <Button variant='outline' size='sm'>
                    <History className='mr-2 h-4 w-4' />
                    History
                  </Button>
                  <Button variant='outline' size='icon'>
                    <Plus className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Main>
    </>
  )
}