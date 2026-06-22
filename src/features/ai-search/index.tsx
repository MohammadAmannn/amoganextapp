/* eslint-disable preserve-caught-error */
import { useState } from 'react'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import { Search, Globe, Image, ArrowUpRight, Wrench, Code, BarChart3, FileText, X} from 'lucide-react'
import { AppHeader } from '@/components/layout/app-header'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const TAVILY_API_KEY = import.meta.env.VITE_TAVILY_API_KEY

type Tool = {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  systemPrompt?: string
}

const TOOLS: Tool[] = [
  {
    id: 'web-search',
    name: 'Web Search',
    icon: <Globe className="w-4 h-4" />,
    description: 'Search the web for real-time information',
    systemPrompt: 'You are an AI Search Assistant. Give comprehensive answers using the search results provided. Use headings, bullet points when useful, and always cite your sources.'
  },
  {
    id: 'code-assistant',
    name: 'Code Assistant',
    icon: <Code className="w-4 h-4" />,
    description: 'Help with coding and programming',
    systemPrompt: 'You are a Code Assistant. Help write, debug, and explain code. Use code blocks with syntax highlighting when providing code examples. Consider best practices and explain your solutions clearly.'
  },
  {
    id: 'data-analysis',
    name: 'Data Analysis',
    icon: <BarChart3 className="w-4 h-4" />,
    description: 'Analyze data and generate insights',
    systemPrompt: 'You are a Data Analysis Assistant. Provide detailed analysis of data, identify trends, patterns, and generate meaningful insights. Use clear explanations and suggest data visualization approaches.'
  },
  {
    id: 'document-reader',
    name: 'Document Reader',
    icon: <FileText className="w-4 h-4" />,
    description: 'Read and analyze documents',
    systemPrompt: 'You are a Document Analysis Assistant. Carefully read and analyze documents provided. Summarize key points, extract important information, and answer questions about the content.'
  },
  {
    id: 'general-search',
    name: 'General Search',
    icon: <Search className="w-4 h-4" />,
    description: 'General purpose web search and Q&A',
    systemPrompt: 'You are an AI Search Assistant. Answer questions using the search results provided. Be thorough, accurate, and cite your sources when using information from search results.'
  }
]

export default function AiSearch() {
  const [query, setQuery] = useState('')
  const [lastQuery, setLastQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [answer, setAnswer] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sources, setSources] = useState<any[]>([])
  const [images, setImages] = useState<string[]>([])
  const [error, setError] = useState<string>('')
  const [selectedTool, setSelectedTool] = useState<Tool>(TOOLS[0])
  const [showTools, setShowTools] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    setAnswer('')
    setSources([])
    setImages([])
    setError('')
    setLastQuery(query)

    try {
      // Tavily API Call for web search
      let tavilyRes;
      let context = ''
      
      try {
        tavilyRes = await axios.post(
          'https://api.tavily.com/search',
          {
            api_key: TAVILY_API_KEY,
            query,
            search_depth: 'advanced',
            max_results: 10,
            include_images: true,
          }
        )
        
        const results = tavilyRes.data.results || []
        setSources(results)
        setImages(tavilyRes.data.images || [])

        if (results.length === 0) {
          setAnswer('No search results found for your query. Please try a different search term.')
          setLoading(false)
          return
        }

        context = results
          .map(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (item: any) =>
              `Title: ${item.title}\nContent: ${item.content}\nURL: ${item.url}`
          )
          .join('\n\n')
      } catch (tavilyError) {
        if (axios.isAxiosError(tavilyError)) {
          if (tavilyError.response?.status === 401 || tavilyError.response?.status === 403) {
            throw new Error('Tavily API key is invalid or expired. Please check your API key.')
          } else if (tavilyError.response?.status === 429) {
            throw new Error('Tavily API rate limit exceeded. Please try again later.')
          } else if (tavilyError.code === 'ECONNABORTED' || tavilyError.code === 'ETIMEDOUT') {
            throw new Error('Tavily API request timed out. Please check your internet connection.')
          } else {
            throw new Error(`Tavily search failed: ${tavilyError.message || 'Unknown error'}`)
          }
        }
        throw new Error('Failed to connect to Tavily search service.')
      }

      // Build the prompt based on selected tool
      const toolSystemPrompt = selectedTool.systemPrompt
      const prompt = selectedTool.id === 'web-search' || selectedTool.id === 'general-search'
        ? `
${toolSystemPrompt}

Question:
${query}

Search Results:
${context}

Instructions:
- Give a comprehensive answer.
- Use headings.
- Use bullet points when useful.
- Summarize key findings.
- Mention important facts only.
`
        : selectedTool.id === 'code-assistant'
        ? `
${toolSystemPrompt}

Question:
${query}

Search Results (for reference):
${context}

Instructions:
- Provide clear code solutions.
- Use proper syntax highlighting.
- Explain your approach.
- Consider edge cases.
`
        : selectedTool.id === 'data-analysis'
        ? `
${toolSystemPrompt}

Question:
${query}

Reference Information:
${context}

Instructions:
- Analyze the data thoroughly.
- Identify patterns and trends.
- Provide actionable insights.
- Suggest visualizations if applicable.
`
        : `
${toolSystemPrompt}

Query:
${query}

Source Information:
${context}

Please provide a detailed analysis and answer.
`

      // Gemini API Call
      let geminiRes;
      try {
        geminiRes = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }
        )
      } catch (geminiError) {
        if (axios.isAxiosError(geminiError)) {
          if (geminiError.response?.status === 400) {
            throw new Error('Invalid request to Gemini API. Please check your query.')
          } else if (geminiError.response?.status === 401 || geminiError.response?.status === 403) {
            throw new Error('Gemini API key is invalid or expired. Please check your API key.')
          } else if (geminiError.response?.status === 429) {
            throw new Error('Gemini API rate limit exceeded. Please try again later.')
          } else if (geminiError.response?.status === 500 || geminiError.response?.status === 503) {
            throw new Error('Gemini API is currently experiencing issues. Please try again later.')
          } else if (geminiError.code === 'ECONNABORTED' || geminiError.code === 'ETIMEDOUT') {
            throw new Error('Gemini API request timed out. Please check your internet connection.')
          } else {
            throw new Error(`AI generation failed: ${geminiError.message || 'Unknown error'}`)
          }
        }
        throw new Error('Failed to connect to Gemini AI service.')
      }

      const generatedText =
        geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text || ''

      if (!generatedText) {
        throw new Error('No response generated from AI. Please try again.')
      }

      setAnswer(generatedText)
      setError('')
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Search Error:', error)
      
      let errorMessage = 'Failed to generate response. '
      if (error instanceof Error) {
        errorMessage += error.message
      } else if (typeof error === 'string') {
        errorMessage += error
      } else {
        errorMessage += 'An unexpected error occurred. Please try again.'
      }
      
      setError(errorMessage)
      setAnswer(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleFollowUp = async () => {
    if (!query.trim()) return
    await handleSearch()
  }

  const handleToolSelect = (tool: Tool) => {
    setSelectedTool(tool)
    setShowTools(false)
  }

  const handleClearAll = () => {
    setQuery('')
    setLastQuery('')
    setAnswer('')
    setSources([])
    setImages([])
    setError('')
    setSelectedTool(TOOLS[0])
  }

  return (
    <>
      <AppHeader title="AI Search" />
      
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        {/* Main Content Area */}
        {!lastQuery && !loading ? (
          // Initial State - Centered Search
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
            <div className="w-full max-w-2xl space-y-8">
              {/* Heading */}
              <div className="text-center">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-8">What would you like to know?</h1>
              </div>

              {/* Search Section */}
              <div className="space-y-4">
                <div className="relative">
                  <div className="relative flex items-center rounded-xl border border-border bg-card shadow-sm transition-all focus-within:border-primary/50 focus-within:shadow-md">
                    <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Search..."
                      className="w-full rounded-xl border-0 py-3.5 pl-11 pr-20 sm:pr-32 text-foreground placeholder:text-muted-foreground bg-transparent focus:outline-none focus:ring-0 text-base"
                    />
                    <div className="absolute right-2 flex items-center gap-1 sm:gap-2">
                      <button className="hidden rounded-lg px-2 sm:px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted sm:block">
                        <Globe className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="rounded-lg bg-primary px-2 sm:px-4 py-1.5 text-xs sm:text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 whitespace-nowrap"
                      >
                        {loading ? 'Searching...' : 'Search'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tools Selection Below Input */}
                <div className="space-y-2">
                  <div className="relative">
                    <button
                      onClick={() => setShowTools(!showTools)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      <Wrench className="w-4 h-4" />
                      <span>{selectedTool.name}</span>
                    </button>

                    {/* Tools Dropdown */}
                    {showTools && (
                      <div className="absolute left-0 top-full mt-1.5 w-64 rounded-lg border border-border bg-popover shadow-lg z-10 text-popover-foreground">
                        <div className="p-2">
                          <p className="text-xs font-semibold text-muted-foreground px-2 py-1">Select Search Tool</p>
                          {TOOLS.map((tool) => (
                            <button
                              key={tool.id}
                              onClick={() => handleToolSelect(tool)}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors flex items-center gap-3 ${
                                selectedTool.id === tool.id
                                  ? 'bg-primary text-primary-foreground'
                                  : 'hover:bg-muted text-foreground'
                              }`}
                            >
                              <span className="flex-shrink-0">{tool.icon}</span>
                              <div className="flex-1">
                                <div className="font-medium">{tool.name}</div>
                                <div className="text-xs opacity-70">{tool.description}</div>
                              </div>
                              {selectedTool.id === tool.id && (
                                <span className="text-sm">✓</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Selected Tool Badge */}
                  {selectedTool && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-sm">
                      {selectedTool.icon}
                      <span>{selectedTool.name} mode active</span>
                    </div>
                  )}
                </div>

                {/* Suggested Chips */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {['Weather in India', 'Latest technology news', 'AI trends 2026', 'Stock market'].map(
                    (suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          setQuery(suggestion)
                          setTimeout(() => {
                            handleSearch()
                          }, 0)
                        }}
                        className="rounded-full border border-border px-3 sm:px-4 py-1.5 text-xs sm:text-sm text-foreground transition-all hover:bg-muted"
                      >
                        {suggestion}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Results State
          <div className="flex flex-col px-4 py-6 sm:px-6 min-h-screen bg-background">
            <div className="mx-auto w-full max-w-4xl space-y-6 pb-32">
              {/* Loading State */}
              {loading && (
                <div className="space-y-4">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted"></div>
                  <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
                  <div className="h-4 w-2/3 animate-pulse rounded bg-muted"></div>
                  <div className="h-4 w-1/2 animate-pulse rounded bg-muted"></div>
                </div>
              )}

              {/* Error Message Display */}
              {!loading && error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-destructive">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 text-lg font-bold">⚠️</div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold mb-1">Error</h3>
                      <p className="text-sm whitespace-pre-wrap">{error}</p>
                      <button
                        onClick={handleClearAll}
                        className="mt-3 text-sm text-destructive hover:underline font-medium"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Sources Section */}
              {!loading && !error && sources.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                    <Globe className="h-4 w-4" />
                    <span>Sources</span>
                    <span className="text-border">•</span>
                    <span>{sources.length} results</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sources.slice(0, 4).map((source, index) => (
                      <a
                        key={index}
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-center gap-2 rounded-full border border-border px-3 sm:px-4 py-1.5 text-xs sm:text-sm text-foreground transition-all hover:bg-muted"
                      >
                        <span className="max-w-[100px] sm:max-w-[200px] truncate">{source.title || 'Source'}</span>
                        <ArrowUpRight className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Images Section */}
              {!loading && !error && images.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                    <Image className="h-4 w-4" />
                    <span>Related Images</span>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {images.slice(0, 4).map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt=""
                        className="h-24 w-36 sm:h-32 sm:w-48 flex-shrink-0 rounded-lg object-cover border border-border bg-muted"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Answer Section */}
              {!loading && answer && !error && (
                <div className="space-y-4 text-foreground">
                  <div className="prose prose-sm sm:prose-base max-w-none text-foreground break-words prose-p:leading-relaxed">
                    <ReactMarkdown>{answer}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sticky Follow-up Input - Properly Centered */}
        {lastQuery && (
          <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-lg flex justify-center z-10">
            <div className="w-full max-w-2xl px-4 py-4 space-y-3">
              {/* Tool Display Badge */}
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm">
                  {selectedTool.icon}
                  <span>{selectedTool.name}</span>
                </div>
                <button
                  onClick={() => setShowTools(!showTools)}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-lg border border-border text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Change</span>
                </button>
                <button
                  onClick={handleClearAll}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-lg border border-border text-sm text-foreground hover:bg-muted transition-colors ml-auto"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>New</span>
                </button>

                {/* Tools Dropdown in Sticky Footer */}
                {showTools && (
                  <div className="absolute left-4 bottom-full mb-1 w-64 rounded-lg border border-border bg-popover text-popover-foreground shadow-lg z-10">
                    <div className="p-2">
                      <p className="text-xs font-semibold text-muted-foreground px-2 py-1">Select Search Tool</p>
                      {TOOLS.map((tool) => (
                        <button
                          key={tool.id}
                          onClick={() => handleToolSelect(tool)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors flex items-center gap-3 ${
                            selectedTool.id === tool.id
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted text-foreground'
                          }`}
                        >
                          <span className="flex-shrink-0">{tool.icon}</span>
                          <div className="flex-1">
                            <div className="font-medium">{tool.name}</div>
                            <div className="text-xs opacity-70">{tool.description}</div>
                          </div>
                          {selectedTool.id === tool.id && (
                            <span className="text-sm">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Search Input */}
              <div className="relative flex items-center rounded-xl border border-border bg-card shadow-sm transition-all focus-within:border-primary/50 focus-within:shadow-md">
                <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFollowUp()}
                  placeholder="Ask a follow-up..."
                  className="w-full rounded-xl border-0 py-3.5 pl-11 pr-20 sm:pr-32 text-foreground placeholder:text-muted-foreground bg-transparent focus:outline-none focus:ring-0 text-base"
                />
                <div className="absolute right-2 flex items-center gap-1 sm:gap-2">
                  <button className="hidden rounded-lg px-2 sm:px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted sm:block">
                    <Globe className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleFollowUp}
                    disabled={loading}
                    className="rounded-lg bg-primary px-2 sm:px-4 py-1.5 text-xs sm:text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 whitespace-nowrap"
                  >
                    {loading ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}