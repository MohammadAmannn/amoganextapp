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
      
      <div className="min-h-screen bg-white flex flex-col">
        {/* Main Content Area */}
        {!lastQuery && !loading ? (
          // Initial State - Centered Search
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
            <div className="w-full max-w-2xl space-y-8">
              {/* Heading */}
              <div className="text-center">
                <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-8">What would you like to know?</h1>
              </div>

              {/* Search Section */}
              <div className="space-y-4">
                <div className="relative">
                  <div className="relative flex items-center rounded-xl border border-gray-200 bg-white shadow-sm transition-all focus-within:border-gray-400 focus-within:shadow-md">
                    <Search className="absolute left-4 h-5 w-5 text-gray-400" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Search..."
                      className="w-full rounded-xl border-0 py-3.5 pl-11 pr-20 sm:pr-32 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 text-base"
                    />
                    <div className="absolute right-2 flex items-center gap-1 sm:gap-2">
                      <button className="hidden rounded-lg px-2 sm:px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50 sm:block">
                        <Globe className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="rounded-lg bg-black px-2 sm:px-4 py-1.5 text-xs sm:text-sm font-medium text-white transition-all hover:bg-gray-800 disabled:opacity-50 whitespace-nowrap"
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
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Wrench className="w-4 h-4" />
                      <span>{selectedTool.name}</span>
                    </button>

                    {/* Tools Dropdown */}
                    {showTools && (
                      <div className="absolute left-0 top-full mt-1.5 w-64 rounded-lg border border-gray-200 bg-white shadow-lg z-10">
                        <div className="p-2">
                          <p className="text-xs font-semibold text-gray-700 px-2 py-1">Select Search Tool</p>
                          {TOOLS.map((tool) => (
                            <button
                              key={tool.id}
                              onClick={() => handleToolSelect(tool)}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors flex items-center gap-3 ${
                                selectedTool.id === tool.id
                                  ? 'bg-black text-white'
                                  : 'hover:bg-gray-100 text-gray-900'
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
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm">
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
                        className="rounded-full border border-gray-200 px-3 sm:px-4 py-1.5 text-xs sm:text-sm text-gray-600 transition-all hover:border-gray-300 hover:bg-gray-50"
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
          <div className="flex flex-col px-4 py-6 sm:px-6 min-h-screen">
            <div className="mx-auto w-full max-w-4xl space-y-6 pb-32">
              {/* Loading State */}
              {loading && (
                <div className="space-y-4">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100"></div>
                  <div className="h-4 w-full animate-pulse rounded bg-gray-100"></div>
                  <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100"></div>
                  <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100"></div>
                </div>
              )}

              {/* Error Message Display */}
              {!loading && error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 text-red-500 text-lg font-bold">⚠️</div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-red-800 mb-1">Error</h3>
                      <p className="text-sm text-red-700 whitespace-pre-wrap">{error}</p>
                      <button
                        onClick={handleClearAll}
                        className="mt-3 text-sm text-red-600 hover:text-red-800 font-medium underline"
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
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Globe className="h-4 w-4" />
                    <span>Sources</span>
                    <span className="text-gray-300">•</span>
                    <span>{sources.length} results</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sources.slice(0, 4).map((source, index) => (
                      <a
                        key={index}
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-center gap-2 rounded-full border border-gray-200 px-3 sm:px-4 py-1.5 text-xs sm:text-sm text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50"
                      >
                        <span className="max-w-[100px] sm:max-w-[200px] truncate">{source.title || 'Source'}</span>
                        <ArrowUpRight className="h-3 w-3 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Images Section */}
              {!loading && !error && images.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Image className="h-4 w-4" />
                    <span>Related Images</span>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {images.slice(0, 4).map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt=""
                        className="h-24 w-36 sm:h-32 sm:w-48 flex-shrink-0 rounded-lg object-cover border border-gray-100"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Answer Section */}
              {!loading && answer && !error && (
                <div className="space-y-4">
                  <div className="prose prose-sm sm:prose-base prose-gray max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-900 break-words">
                    <ReactMarkdown>{answer}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sticky Follow-up Input - Properly Centered */}
        {lastQuery && (
          <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white shadow-lg flex justify-center">
            <div className="w-full max-w-2xl px-4 py-4 space-y-3">
              {/* Tool Display Badge */}
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm">
                  {selectedTool.icon}
                  <span>{selectedTool.name}</span>
                </div>
                <button
                  onClick={() => setShowTools(!showTools)}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Change</span>
                </button>
                <button
                  onClick={handleClearAll}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors ml-auto"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>New</span>
                </button>

                {/* Tools Dropdown in Sticky Footer */}
                {showTools && (
                  <div className="absolute left-4 bottom-full mb-1 w-64 rounded-lg border border-gray-200 bg-white shadow-lg z-10">
                    <div className="p-2">
                      <p className="text-xs font-semibold text-gray-700 px-2 py-1">Select Search Tool</p>
                      {TOOLS.map((tool) => (
                        <button
                          key={tool.id}
                          onClick={() => handleToolSelect(tool)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-colors flex items-center gap-3 ${
                            selectedTool.id === tool.id
                              ? 'bg-black text-white'
                              : 'hover:bg-gray-100 text-gray-900'
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
              <div className="relative flex items-center rounded-xl border border-gray-200 bg-white shadow-sm transition-all focus-within:border-gray-400 focus-within:shadow-md">
                <Search className="absolute left-4 h-5 w-5 text-gray-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFollowUp()}
                  placeholder="Ask a follow-up..."
                  className="w-full rounded-xl border-0 py-3.5 pl-11 pr-20 sm:pr-32 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 text-base"
                />
                <div className="absolute right-2 flex items-center gap-1 sm:gap-2">
                  <button className="hidden rounded-lg px-2 sm:px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50 sm:block">
                    <Globe className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleFollowUp}
                    disabled={loading}
                    className="rounded-lg bg-black px-2 sm:px-4 py-1.5 text-xs sm:text-sm font-medium text-white transition-all hover:bg-gray-800 disabled:opacity-50 whitespace-nowrap"
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