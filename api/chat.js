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
    } = req.body

    if (!message) {
      return res.status(400).json({
        error: 'Message is required',
      })
    }

    const result = await generateText({
      model: openrouter.chat(model),
      prompt: message,
        maxTokens: 512,

    })

    return res.status(200).json({
      text: result.text,
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