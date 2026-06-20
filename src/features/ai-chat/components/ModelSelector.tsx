import { ChevronDown } from 'lucide-react'

const MODELS = [
  { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
  { id: 'openai/gpt-4o', name: 'GPT-4o' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat' },
  { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B' },
]

interface ModelSelectorProps {
  model: string
  setModel: (id: string) => void
  showDropdown: boolean
  setShowDropdown: (show: boolean) => void
  setShowToolsDropdown: (show: boolean) => void
}

export function ModelSelector({ 
  model, 
  setModel, 
  showDropdown, 
  setShowDropdown,
  setShowToolsDropdown 
}: ModelSelectorProps) {
  const currentModel = MODELS.find(m => m.id === model)

  return (
    <div className='relative'>
      <button
        onClick={(e) => {
          e.stopPropagation()
          setShowDropdown(!showDropdown)
          setShowToolsDropdown(false)
        }}
        className='flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-muted transition-colors text-[10px] sm:text-xs'
      >
        <span className='text-muted-foreground hidden xs:inline'>Model:</span>
        <span className='font-medium truncate max-w-[60px] xs:max-w-[80px] sm:max-w-none'>
          {currentModel?.name || 'Select Model'}
        </span>
        <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform flex-shrink-0 ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      {showDropdown && (
        <div className='absolute left-0 bottom-full mb-1 w-52 sm:w-56 max-h-[60vh] overflow-y-auto rounded-lg border border-gray-200 bg-background shadow-lg z-20'>
          <div className='p-1'>
            {MODELS.map((m) => (
              <button
                key={m.id}
                onClick={(e) => {
                  e.stopPropagation()
                  setModel(m.id)
                  setShowDropdown(false)
                }}
                className={`w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 rounded text-[11px] sm:text-sm transition-colors ${
                  model === m.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                <span className="truncate block">{m.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
