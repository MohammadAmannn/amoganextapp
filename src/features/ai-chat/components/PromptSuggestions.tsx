import { Palette, Search, Code, FormInput, Sparkles } from 'lucide-react'

interface Suggestion {
  title: string
  description: string
  prompt: string
  tool: string
  icon: any
  color: string
}

interface PromptSuggestionsProps {
  onSelect: (prompt: string, tool: string) => void
  currentTool: string
}

const SUGGESTIONS: Suggestion[] = [
  {
    title: 'Design user profile card',
    description: 'Generates a rich, interactive UI card showing stats, avatar, and badges.',
    prompt: 'Design a beautiful user profile card with follower count, Location (San Francisco), custom badges and actions.',
    tool: 'ui-render',
    icon: Palette,
    color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30',
  },
  {
    title: 'Search latest Tech news',
    description: 'Searches the web for recent announcements in AI and technology.',
    prompt: 'What are the key announcements from the latest tech conferences and AI releases this month?',
    tool: 'web-search',
    icon: Search,
    color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30',
  },
  {
    title: 'Explain React 19 features',
    description: 'Deep dive into server actions, useActionState, and document metadata.',
    prompt: 'Explain the new features of React 19 with examples of Server Actions and the use() hook.',
    tool: 'chat',
    icon: Code,
    color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/20 border-sky-100 dark:border-sky-900/30',
  },
  {
    title: 'Create feedback form',
    description: 'Renders a beautiful form with textareas, star ratings, and submittable actions.',
    prompt: 'Build a premium user feedback form with input fields for name, email, rating select, message textarea, and a submit button.',
    tool: 'ui-render',
    icon: FormInput,
    color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30',
  },
]

export function PromptSuggestions({ onSelect, currentTool }: PromptSuggestionsProps) {
  // We can show all suggestions, or filter them based on the current tool. Let's show all but highlight the one matching the current tool
  return (
    <div className='flex h-full flex-col items-center justify-center gap-6 px-4 py-8 max-w-4xl mx-auto'>
      <div className='flex flex-col items-center text-center gap-2 max-w-lg'>
        <div className='p-3 rounded-2xl bg-primary/10 border border-primary/20 animate-bounce'>
          <Sparkles className='h-6 w-6 text-primary' />
        </div>
        <h1 className='text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-indigo-500 to-indigo-600 bg-clip-text text-transparent'>
          How can I help you today?
        </h1>
        <p className='text-sm sm:text-base text-muted-foreground'>
          Choose a starter prompt below or type your own question to start chatting or rendering beautiful UIs.
        </p>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-2'>
        {SUGGESTIONS.map((s, index) => {
          const Icon = s.icon
          const isMatchingTool = s.tool === currentTool

          return (
            <button
              key={index}
              onClick={() => onSelect(s.prompt, s.tool)}
              className={`group text-left p-4 rounded-2xl border bg-background hover:bg-muted/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between h-36 ${
                isMatchingTool 
                  ? 'border-primary shadow-sm ring-1 ring-primary/20' 
                  : 'border-border'
              }`}
            >
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <div className={`p-2 rounded-xl border ${s.color}`}>
                    <Icon className='h-4 w-4' />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    s.tool === 'ui-render'
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400'
                      : s.tool === 'web-search'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400'
                  }`}>
                    {s.tool === 'ui-render' ? 'Generative UI' : s.tool === 'web-search' ? 'Web Search' : 'Chat'}
                  </span>
                </div>
                <h3 className='font-semibold text-sm sm:text-base text-foreground leading-snug group-hover:text-primary transition-colors'>
                  {s.title}
                </h3>
                <p className='text-xs text-muted-foreground line-clamp-2 leading-normal'>
                  {s.description}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
