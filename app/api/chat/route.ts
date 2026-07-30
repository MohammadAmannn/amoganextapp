import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { generateText } from 'ai'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message, model } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const openRouterApiKey = process.env.OPENROUTER_API_KEY
    if (!openRouterApiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key is not configured' },
        { status: 500 }
      )
    }

    // Initialize OpenRouter provider
    const openrouter = createOpenRouter({
      apiKey: openRouterApiKey,
    })

    // Generate response using Vercel AI SDK
    const { text } = await generateText({
      model: openrouter.chat(model || 'google/gemini-2.5-flash'),
      prompt: message,
    })

    return NextResponse.json({ text })
  } catch (error: any) {
    console.error('Error in /api/chat:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to generate response' },
      { status: 500 }
    )
  }
}
