import { useState } from 'react'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import { Search, Globe, Image, ArrowUpRight} from 'lucide-react'
import { AppHeader } from '@/components/layout/app-header'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const TAVILY_API_KEY = import.meta.env.VITE_TAVILY_API_KEY

export default function AiSearch() {
  const [query, setQuery] = useState('')
  const [lastQuery, setLastQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [answer, setAnswer] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sources, setSources] = useState<any[]>([])
  const [images, setImages] = useState<string[]>([])

  const handleSearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    setAnswer('')
    setSources([])
    setImages([])
    setLastQuery(query)

    try {
      const tavilyRes = await axios.post(
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

      const context = results
        .map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (item: any) =>
            `Title: ${item.title}\nContent: ${item.content}\nURL: ${item.url}`
        )
        .join('\n\n')

      const prompt = `
You are an AI Search Assistant.

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

      const geminiRes = await axios.post(
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

      const generatedText =
        geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text || ''

      setAnswer(generatedText)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
      setAnswer('Failed to generate response.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <AppHeader title="AI Search" />
      
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
          {/* Search Input - Always visible */}
          <div className="mb-8">
            <div className="relative">
              <div className="relative flex items-center rounded-xl border border-gray-200 bg-white shadow-sm transition-all focus-within:border-gray-400 focus-within:shadow-md">
                <Search className="absolute left-4 h-5 w-5 text-gray-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={lastQuery ? "Ask a follow-up..." : "What would you like to know?"}
                  className="w-full rounded-xl border-0 py-3.5 pl-11 pr-32 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0"
                />
                <div className="absolute right-2 flex items-center gap-2">
                  <button className="hidden rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50 sm:block">
                    <Globe className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="rounded-lg bg-black px-4 py-1.5 text-sm font-medium text-white transition-all hover:bg-gray-800 disabled:opacity-50"
                  >
                    {loading ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </div>
              {!lastQuery && !loading && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {['Weather in India', 'Latest technology news', 'AI trends 2026', 'Stock market'].map(
                    (suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          setQuery(suggestion)
                          handleSearch()
                        }}
                        className="rounded-full border border-gray-200 px-4 py-1.5 text-sm text-gray-600 transition-all hover:border-gray-300 hover:bg-gray-50"
                      >
                        {suggestion}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Results Area */}
          {(lastQuery || loading) && (
            <div className="space-y-6">
              {/* Loading State */}
              {loading && (
                <div className="space-y-4">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100"></div>
                  <div className="h-4 w-full animate-pulse rounded bg-gray-100"></div>
                  <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100"></div>
                  <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100"></div>
                </div>
              )}

              {/* Sources Section - Top */}
              {!loading && sources.length > 0 && (
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
                        className="group flex items-center gap-2 rounded-full border border-gray-200 px-4 py-1.5 text-sm text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50"
                      >
                        <span className="max-w-[200px] truncate">{source.title || 'Source'}</span>
                        <ArrowUpRight className="h-3 w-3 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Images Section */}
              {!loading && images.length > 0 && (
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
                        className="h-32 w-48 flex-shrink-0 rounded-lg object-cover border border-gray-100"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Answer Section */}
              {!loading && answer && (
                <div className="space-y-4">
                  <div className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-900">
                    <ReactMarkdown>{answer}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}