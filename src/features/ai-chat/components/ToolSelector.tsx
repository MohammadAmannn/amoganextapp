import { ChevronDown } from 'lucide-react'

const TOOLS = [
    { id: 'chat', name: 'AI Chat', icon: '' },
    { id: 'web-search', name: 'Web Search', icon: '🌐' },
    { id: 'ui-render', name: 'UI Render', icon: '🎨' },
]

interface ToolSelectorProps {
    tool: string
    setTool: (id: string) => void
    showDropdown: boolean
    setShowDropdown: (show: boolean) => void
    setShowModelDropdown: (show: boolean) => void
    onToolChange?: () => void
}

export function ToolSelector({
    tool,
    setTool,
    showDropdown,
    setShowDropdown,
    setShowModelDropdown,
    onToolChange
}: ToolSelectorProps) {
    const currentTool = TOOLS.find(t => t.id === tool)

    return (
        <div className='relative'>
            <button
                onClick={(e) => {
                    e.stopPropagation()
                    setShowDropdown(!showDropdown)
                    setShowModelDropdown(false)
                }}
                className={`flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-muted transition-colors text-[10px] sm:text-xs min-w-[70px] sm:min-w-[100px] ${tool === 'web-search' ? 'bg-blue-50 border-blue-200' : ''
                    }`}
            >
                <span className='text-muted-foreground hidden sm:inline'>Tool:</span>
                <span className='font-medium flex items-center gap-0.5 sm:gap-1 whitespace-nowrap'>
                    <span>{currentTool?.icon}</span>
                    <span className="hidden sm:inline">{currentTool?.name}</span>
                    <span className="sm:hidden">
                        {currentTool?.name === 'AI Chat'
                            ? 'Chat'
                            : currentTool?.name === 'Web Search'
                                ? 'Web'
                                : 'UI'}
                    </span>
                </span>
                <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform flex-shrink-0 ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showDropdown && (
                <div className='absolute left-0 bottom-full mb-1 w-44 sm:w-48 rounded-lg border border-gray-200 bg-background shadow-lg z-20'>
                    <div className='p-1'>
                        {TOOLS.map((t) => (
                            <button
                                key={t.id}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setTool(t.id)
                                    setShowDropdown(false)
                                    if (onToolChange) onToolChange()
                                }}
                                className={`w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 rounded text-[11px] sm:text-sm transition-colors flex items-center gap-1.5 sm:gap-2 ${tool === t.id
                                        ? 'bg-primary text-primary-foreground'
                                        : 'hover:bg-muted'
                                    }`}
                            >
                                <span>{t.icon}</span>
                                <span>{t.name}</span>
                                {tool === t.id && (
                                    <span className="ml-auto text-xs">✓</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
