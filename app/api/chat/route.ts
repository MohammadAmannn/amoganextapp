import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message, model = 'google/gemini-2.5-flash', api = 'openrouter', tool = 'chat' } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message field is required and must be a string.' },
        { status: 400 }
      )
    }

    let systemPrompt = ''
    if (tool === 'ui-render') {
      systemPrompt = `You are an expert UI component designer. Your task is to generate valid JSON schema representing UI layouts using standard primitive components. Respond ONLY with a valid raw JSON object. Do not wrap in markdown syntax or code blocks.`
    }

    const openrouterKey = process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY
    const googleKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
    const openaiKey = process.env.OPENAI_API_KEY
    const anthropicKey = process.env.ANTHROPIC_API_KEY

    // 1. Try OpenRouter if requested or key available
    if ((api === 'openrouter' || openrouterKey) && openrouterKey) {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openrouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://amoganextapp.vercel.app',
          'X-Title': 'Amoga Next App',
        },
        body: JSON.stringify({
          model: model || 'google/gemini-2.5-flash',
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: message },
          ],
        }),
      })

      if (!response.ok) {
        const errData = await response.text()
        console.error('[API Chat] OpenRouter error:', errData)
        return NextResponse.json(
          { error: `OpenRouter error (${response.status}): ${errData}` },
          { status: response.status }
        )
      }

      const data = await response.json()
      const text = data?.choices?.[0]?.message?.content || ''
      return NextResponse.json({ text })
    }

    // 2. Fallback: Try Google Gemini direct API
    if (googleKey) {
      const geminiModel = model.includes('flash') ? 'gemini-1.5-flash' : 'gemini-1.5-pro'
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${googleKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              ...(systemPrompt ? [{ role: 'user', parts: [{ text: systemPrompt }] }] : []),
              { role: 'user', parts: [{ text: message }] },
            ],
          }),
        }
      )

      if (!response.ok) {
        const errData = await response.text()
        console.error('[API Chat] Google Gemini error:', errData)
        return NextResponse.json(
          { error: `Google Gemini error (${response.status}): ${errData}` },
          { status: response.status }
        )
      }

      const data = await response.json()
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
      return NextResponse.json({ text })
    }

    // 3. Fallback: Try OpenAI direct API
    if (openaiKey) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: message },
          ],
        }),
      })

      if (!response.ok) {
        const errData = await response.text()
        return NextResponse.json(
          { error: `OpenAI error (${response.status}): ${errData}` },
          { status: response.status }
        )
      }

      const data = await response.json()
      const text = data?.choices?.[0]?.message?.content || ''
      return NextResponse.json({ text })
    }

    // 4. Fallback: Try Anthropic direct API
    if (anthropicKey) {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          messages: [{ role: 'user', content: message }],
        }),
      })

      if (!response.ok) {
        const errData = await response.text()
        return NextResponse.json(
          { error: `Anthropic error (${response.status}): ${errData}` },
          { status: response.status }
        )
      }

      const data = await response.json()
      const text = data?.content?.[0]?.text || ''
      return NextResponse.json({ text })
    }

    return NextResponse.json(
      {
        error:
          'No AI API Key found. Please add OPENROUTER_API_KEY, GOOGLE_API_KEY, or OPENAI_API_KEY to your environment variables in Vercel.',
      },
      { status: 500 }
    )
  } catch (err: any) {
    console.error('[API Chat] Internal error:', err)
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
