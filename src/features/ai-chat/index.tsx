/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-console */
import { useState, useRef, useEffect, useCallback } from 'react'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { ImageModal } from './components/ImageModal'
import { MessageInput } from './components/MessageInput'
import { MessageList } from './components/MessageList'
import { SchemaEditor } from './json-render/SchemaEditor'
import {
  Message,
  SpeechRecognition,
  SpeechRecognitionEvent,
  SpeechRecognitionErrorEvent,
} from './types'

// Tavily API Key - used via /api/chat server route for web-search tool
const TAVILY_API_KEY = process.env.NEXT_PUBLIC_TAVILY_API_KEY ?? ''

export function AiChat() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [model, setModel] = useState('google/gemini-2.5-flash')
  const [api, setApi] = useState('openrouter')
  const [messages, setMessages] = useState<Message[]>([])
  const [showModelDropdown, setShowModelDropdown] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showToolsDropdown, setShowToolsDropdown] = useState(false)
  const [tool, setTool] = useState('chat')
  const [isListening, setIsListening] = useState(false)
  const [isSpeechSupported, setIsSpeechSupported] = useState(true)
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [uiSchema, setUiSchema] = useState<any>(null)
  const [showSchemaEditor, setShowSchemaEditor] = useState(false)
  const [activeMobileTab, setActiveMobileTab] = useState<'chat' | 'preview'>('chat')

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const accumulatedTranscriptRef = useRef<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showModelDropdown) setShowModelDropdown(false)
      if (showToolsDropdown) setShowToolsDropdown(false)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showModelDropdown, showToolsDropdown])

  // Define sendMessage using useCallback
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
            const tavilyResponse = await fetch(
              'https://api.tavily.com/search',
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
            imageUrls = tavilyData.images || []

            const context = searchResults
              .map(
                (item: any) =>
                  `Title: ${item.title}\nContent: ${item.content}\nURL: ${item.url}`
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
          }
        }

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: finalPrompt, model, api, tool: activeTool }),
        })

        const data = await response.json()
        if (!response.ok)
          throw new Error(data.error || 'Failed to get response')

        if (activeTool === 'ui-render') {
          try {
            // Strip markdown block format if present
            let cleanedText = data.text.trim();
            if (cleanedText.startsWith('```')) {
              cleanedText = cleanedText.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '');
            }
            const schema = JSON.parse(cleanedText)
            setUiSchema(schema)
            setShowSchemaEditor(true)
            setActiveMobileTab('preview') // Auto-switch to preview tab on mobile view

            setMessages((prev) => [
              ...prev,
              {
                role: 'assistant',
                content: '🎨 UI generated successfully! View and refine it in the preview panel.',
              },
            ])

            return
          } catch (err) {
            console.error('Invalid JSON:', data.text)

            setMessages((prev) => [
              ...prev,
              {
                role: 'assistant',
                content: 'Failed to generate valid UI schema. Please try again.',
              },
            ])

            return
          }
        }

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
    },
    [input, loading, model, api, tool]
  )

  // Initialize speech recognition safely
  useEffect(() => {
    try {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition
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
        const displayText = (
          accumulatedTranscriptRef.current + interimTranscript
        ).trim()
        if (displayText) setInput(displayText)
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        if (event.error === 'not-allowed') {
          alert('Please allow microphone access to use voice input')
        }
      }

      recognition.onend = () => setIsListening(false)
      recognitionRef.current = recognition
    } catch (error) {
      console.error('Failed to initialize speech recognition:', error)
      setIsSpeechSupported(false)
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.abort()
    }
  }, [])

  const toggleVoiceInput = () => {
    if (!isSpeechSupported) {
      alert('Speech recognition is not supported in your browser.')
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      accumulatedTranscriptRef.current = ''
      setIsListening(false)
      setTimeout(() => inputRef.current?.focus(), 100)
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

  const handleHistorySelect = () => {
    setShowHistory(false)
  }

  const handleImageClick = (url: string) => {
    setSelectedImage(url)
    setShowImageModal(true)
  }

  const handleClearSources = () => {
    // Sources are cleared via message resets or state changes
  }

  const handleSchemaAction = (action: string, params?: any) => {
    console.log(`Schema action: ${action}`, params)
    if (action === 'submit') {
      alert('Form submitted!')
    }
  }

  const handleCloseSchemaEditor = () => {
    setShowSchemaEditor(false)
    setUiSchema(null)
    setActiveMobileTab('chat')
  }

  const handleSelectPrompt = useCallback((promptText: string, toolId: string) => {
    setTool(toolId)
    setInput(promptText)
    sendMessage(promptText, toolId)
  }, [sendMessage])

  const handleOpenPreview = useCallback(() => {
    if (uiSchema) {
      setShowSchemaEditor(true)
      setActiveMobileTab('preview')
    }
  }, [uiSchema])

  return (
    <>
      <AppHeader title='AI Chat' />
      <Main fixed className='p-0'>
        {/* Mobile Tab Swapper Header (Visible only when UI Schema is rendering & screen is mobile) */}
        {uiSchema && showSchemaEditor && (
          <div className='flex lg:hidden border-b border-border bg-background justify-around p-1.5 shrink-0 z-10'>
            <button
              onClick={() => setActiveMobileTab('chat')}
              className={`flex-1 py-2 text-center text-xs font-bold rounded-xl transition-all duration-200 ${
                activeMobileTab === 'chat'
                  ? 'bg-muted text-primary shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Chat View
            </button>
            <button
              onClick={() => setActiveMobileTab('preview')}
              className={`flex-1 py-2 text-center text-xs font-bold rounded-xl transition-all duration-200 ${
                activeMobileTab === 'preview'
                  ? 'bg-muted text-primary shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              UI Preview
            </button>
          </div>
        )}

        <div className='flex h-[calc(100vh-56px)] w-full overflow-hidden flex-col lg:flex-row'>
          {/* Left panel: Chat History & Input */}
          <div
            className={`flex flex-col h-full border-r border-border transition-all duration-300 ${
              uiSchema && showSchemaEditor 
                ? 'w-full lg:w-5/12' 
                : 'w-full max-w-3xl mx-auto'
            } ${
              uiSchema && showSchemaEditor && activeMobileTab !== 'chat' 
                ? 'hidden lg:flex' 
                : 'flex'
            }`}
          >
            {/* Chat messages area */}
            <div className='flex-1 overflow-y-auto px-4 py-4'>
              <MessageList
                messages={messages}
                loading={loading}
                tool={tool}
                onImageClick={handleImageClick}
                onSelectPrompt={handleSelectPrompt}
                onOpenPreview={handleOpenPreview}
                messagesEndRef={messagesEndRef}
              />
            </div>

            {/* Input area */}
            <div className='p-4 border-t border-border bg-background'>
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
                onVoiceToggle={toggleVoiceInput}
                onHistorySelect={handleHistorySelect}
                onClearSources={handleClearSources}
                inputRef={inputRef}
              />
            </div>
          </div>

          {/* Right panel: UI Schema Preview / Editor */}
          {uiSchema && showSchemaEditor && (
            <div
              className={`w-full lg:w-7/12 h-full bg-muted/10 overflow-y-auto p-4 lg:p-6 border-t lg:border-t-0 lg:border-l border-border flex flex-col ${
                activeMobileTab !== 'preview' ? 'hidden lg:flex' : 'flex'
              }`}
            >
              <div className='flex-1 bg-background rounded-xl border border-border shadow-sm overflow-hidden flex flex-col p-4 lg:p-6'>
                <SchemaEditor
                  schema={uiSchema}
                  onSchemaChange={(newSchema) => setUiSchema(newSchema)}
                  onAction={handleSchemaAction}
                  onClose={handleCloseSchemaEditor}
                />
              </div>
            </div>
          )}
        </div>

        {/* Image Modal */}
        <ImageModal
          isOpen={showImageModal}
          imageUrl={selectedImage}
          onClose={() => {
            setShowImageModal(false)
            setSelectedImage(null)
          }}
        />
      </Main>
    </>
  )
}
