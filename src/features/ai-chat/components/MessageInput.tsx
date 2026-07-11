import { ArrowUp, Mic, History, Plus } from 'lucide-react'
import { ModelSelector } from './ModelSelector'
import { ToolSelector } from './ToolSelector'

const APIS = [
  { id: 'openrouter', name: 'OpenRouter' },
]

const HISTORY_OPTIONS = [
  { id: 'history', name: 'History' },
  { id: 'my-prompts', name: 'My Prompts' },
  { id: 'prompts-history', name: 'Prompts History' },
]

interface MessageInputProps {
  input: string
  setInput: (value: string) => void
  loading: boolean
  model: string
  setModel: (id: string) => void
  api: string
  setApi: (id: string) => void
  tool: string
  setTool: (id: string) => void
  isListening: boolean
  isSpeechSupported: boolean
  showModelDropdown: boolean
  setShowModelDropdown: (show: boolean) => void
  showToolsDropdown: boolean
  setShowToolsDropdown: (show: boolean) => void
  showHistory: boolean
  setShowHistory: (show: boolean) => void
  onSend: () => void
  onVoiceToggle: () => void
  onHistorySelect: (option: string) => void
  onClearSources: () => void
  inputRef: React.RefObject<HTMLTextAreaElement | null>
}

export function MessageInput({
  input,
  setInput,
  loading,
  model,
  setModel,
  api,
  setApi,
  tool,
  setTool,
  isListening,
  isSpeechSupported,
  showModelDropdown,
  setShowModelDropdown,
  showToolsDropdown,
  setShowToolsDropdown,
  showHistory,
  setShowHistory,
  onSend,
  onVoiceToggle,
  onHistorySelect,
  onClearSources,
  inputRef,
}: MessageInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div className='bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 pt-1.5 pb-1.5 sm:px-6'>
      <div className='mx-auto max-w-4xl'>
        {/* Message input with send button */}
        <div className='relative rounded-2xl border border-border/80 bg-background shadow-sm hover:border-border transition-colors focus-within:border-primary'>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening 
                ? '🎤 Listening... Speak now' 
                : loading 
                  ? tool === 'web-search' ? 'Searching...' : 'Thinking...' 
                  : tool === 'chat'
                    ? 'Ask a question about your data...'
                    : 'Search the web...'
            }
            rows={1}
            className={`w-full rounded-xl border-0 px-4 py-2 pr-24 text-sm sm:text-base resize-none outline-none focus:ring-0 text-foreground ${
              isListening
                ? 'bg-red-50 dark:bg-red-950/20'
                : 'bg-transparent'
            } ${loading ? 'opacity-50' : ''}`}
            disabled={loading}
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />

          {/* Action buttons on the right side */}
          <div className='absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5'>
            {isSpeechSupported && (
              <button
                onClick={onVoiceToggle}
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

            <button
              onClick={onSend}
              disabled={loading || !input.trim() || !model}
              className='p-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              title='Send message'
            >
              <ArrowUp className='w-4 h-4' />
            </button>
          </div>

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

        {/* Controls row */}
        <div className='flex items-center justify-between gap-1 mt-1 flex-wrap sm:flex-nowrap'>
          <div className='flex items-center gap-1 flex-wrap sm:flex-nowrap'>
            <ModelSelector
              model={model}
              setModel={setModel}
              showDropdown={showModelDropdown}
              setShowDropdown={setShowModelDropdown}
              setShowToolsDropdown={setShowToolsDropdown}
            />

            <ToolSelector
              tool={tool}
              setTool={(id) => {
                setTool(id)
                if (id === 'chat') onClearSources()
              }}
              showDropdown={showToolsDropdown}
              setShowDropdown={setShowToolsDropdown}
              setShowModelDropdown={setShowModelDropdown}
            />

            {/* API selector */}
            <div className='relative flex-shrink-0'>
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
          </div>

          <div className='flex items-center gap-1 flex-shrink-0'>
            {/* History button */}
            <div className='relative'>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className='flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-lg border border-border/80 hover:bg-muted transition-colors text-[10px] sm:text-xs text-foreground whitespace-nowrap'
              >
                <History className='w-3 h-3 sm:w-3.5 sm:h-3.5' />
                <span className='hidden xs:inline'>History</span>
              </button>

              {showHistory && (
                <div className='absolute right-0 bottom-full mb-1 w-44 sm:w-48 rounded-lg border border-border bg-background shadow-lg z-20 text-foreground'>
                  <div className='p-1'>
                    {HISTORY_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => onHistorySelect(option.id)}
                        className='w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 rounded text-[11px] sm:text-sm hover:bg-muted transition-colors text-foreground'
                      >
                        {option.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button className='p-1 rounded-lg border border-border/80 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground'>
              <Plus className='w-3 h-3 sm:w-3.5 sm:h-3.5' />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
