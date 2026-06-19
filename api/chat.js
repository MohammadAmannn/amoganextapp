import { generateText } from 'ai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
    })
  }

  try {
    const {
      message,
      model = 'google/gemini-2.5-flash',
      tool = 'chat',
    } = req.body

    if (!message) {
      return res.status(400).json({
        error: 'Message is required',
      })
    }

    let prompt = message
    let sources = []

    if (tool === 'chat') {
  prompt = `
You are a helpful AI assistant.

User:
${message}
`
}

    // WEB SEARCH MODE
    if (tool === 'web-search') {
      try {
        const tavilyResponse = await fetch(
          'https://api.tavily.com/search',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              api_key: process.env.TAVILY_API_KEY,
              query: message,
              search_depth: 'advanced',
              max_results: 8,
              include_answer: false,
              include_images: false,
            }),
          }
        )

        const tavilyData = await tavilyResponse.json()

        sources = tavilyData.results || []

        const context = sources
          .map(
            (item) =>
              `Title: ${item.title}
Content: ${item.content}
URL: ${item.url}`
          )
          .join('\n\n')

prompt = `
You are an advanced AI search assistant similar to Perplexity and Morphic.

User Question:
${message}

Search Results:
${context}

Instructions:
- Use the provided search results.
- Give a comprehensive answer.
- Use markdown headings.
- Use bullet points when useful.
- Mention important facts only.
- Cite sources naturally.
- If search results conflict, explain the differences.
- Do not invent facts.
`
      } catch (searchError) {
        console.error('Tavily Error:', searchError)

        prompt = `
User Question:
${message}

Note:
Web search failed. Answer using your own knowledge.
`
      }
    }

    const result = await generateText({
      model: openrouter.chat(model),
      prompt,
      maxOutputTokens: 1024,
    })

    return res.status(200).json({
      text: result.text,
      tool,
      sources,
    })
  } catch (error) {
    console.error('OpenRouter Error:', error)

    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : 'Unknown error',
    })
  }
}