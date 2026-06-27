import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { google } from '@ai-sdk/google'

export const maxDuration = 60 // 60 seconds timeout limit on Vercel

const UI_RENDER_PROMPT = `
You are a Generative UI Builder that creates beautiful, premium UIs using Shadcn components. Given a user's request, you generate a complete JSON schema that renders into a fully styled UI.

Return ONLY a valid JSON object. No markdown, no backticks, no explanation — just raw JSON.

Use the flat root/elements format for ALL UIs:
{
  "root": "root-element-id",
  "elements": {
    "root-element-id": {
      "type": "ComponentType",
      "props": { ... },
      "children": ["child-id-1", "child-id-2"]
    },
    "child-id-1": { ... },
    ...
  }
}

EXAMPLE 1 — "Design a user profile card":
{
  "root": "profile-card",
  "elements": {
    "profile-card": {
      "type": "Card",
      "props": { "title": "User Profile", "maxWidth": "md", "centered": true },
      "children": ["profile-header", "profile-info", "separator-1", "profile-about", "separator-2", "profile-stats", "profile-actions"]
    },
    "profile-header": {
      "type": "Stack",
      "props": { "direction": "vertical", "gap": "md", "align": "center" },
      "children": ["avatar", "user-name", "user-role"]
    },
    "avatar": {
      "type": "Avatar",
      "props": { "fallback": "SA", "size": "xl" }
    },
    "user-name": {
      "type": "Heading",
      "props": { "level": "3", "children": "Sarah Anderson" }
    },
    "user-role": {
      "type": "Badge",
      "props": { "label": "Product Designer", "variant": "secondary" }
    },
    "profile-info": {
      "type": "Stack",
      "props": { "direction": "vertical", "gap": "sm" },
      "children": ["email-row", "location-row"]
    },
    "email-row": {
      "type": "Stack",
      "props": { "direction": "horizontal", "gap": "sm", "align": "center" },
      "children": ["email-icon", "email-text"]
    },
    "email-icon": { "type": "Icon", "props": { "name": "Mail", "size": 16 } },
    "email-text": { "type": "Text", "props": { "children": "sarah.anderson@example.com", "size": "sm" } },
    "location-row": {
      "type": "Stack",
      "props": { "direction": "horizontal", "gap": "sm", "align": "center" },
      "children": ["location-icon", "location-text"]
    },
    "location-icon": { "type": "Icon", "props": { "name": "MapPin", "size": 16 } },
    "location-text": { "type": "Text", "props": { "children": "San Francisco, CA", "size": "sm" } },
    "separator-1": { "type": "Separator", "props": {} },
    "profile-about": {
      "type": "Stack",
      "props": { "direction": "vertical", "gap": "sm" },
      "children": ["about-heading", "about-text"]
    },
    "about-heading": { "type": "Heading", "props": { "level": "5", "children": "About" } },
    "about-text": { "type": "Text", "props": { "children": "Passionate about creating intuitive user experiences.", "size": "sm" } },
    "separator-2": { "type": "Separator", "props": {} },
    "profile-stats": {
      "type": "Grid",
      "props": { "cols": 3, "gap": "sm" },
      "children": ["stat-followers", "stat-following", "stat-posts"]
    },
    "stat-followers": { "type": "StatCard", "props": { "title": "Followers", "value": "2,450", "icon": "Users" } },
    "stat-following": { "type": "StatCard", "props": { "title": "Following", "value": "180", "icon": "UserPlus" } },
    "stat-posts": { "type": "StatCard", "props": { "title": "Posts", "value": "64", "icon": "FileText" } },
    "profile-actions": {
      "type": "Stack",
      "props": { "direction": "horizontal", "gap": "sm", "justify": "center" },
      "children": ["follow-btn", "message-btn"]
    },
    "follow-btn": { "type": "Button", "props": { "label": "Follow", "variant": "default" } },
    "message-btn": { "type": "Button", "props": { "label": "Message", "variant": "outline" } }
  }
}

Available Shadcn Components:
LAYOUT: Stack, Grid, Card, Separator, Tabs
DATA DISPLAY: Heading, Text, Badge, Avatar, Icon, StatCard, Table, Price, FeatureList, Alert, Progress, PremiumStats
FORM: Form, Input, Textarea, Select, Checkbox, Switch, RadioGroup, Button, Calendar

PREMIUMSTATS COMPONENT SPECIFICATION:
PremiumStats displays premium statistical cards, charts, and progress bars.
Props:
- variant: "01" | "02" | "03" | "04" | "05" | "06" | "07" | "08" | "09" | "10" | "11" | "12" | "13" | "14" | "15" (default: "01")
- title: string (optional)
- description: string (optional)
- data: array of stats objects. Depending on the variant chosen:
  * variant "01": Array of { "name": string, "value": string, "change": string, "changeType": "positive" | "negative" }
  * variant "02": Array of { "metric": string, "current": string, "previous": string, "difference": string, "trend": "up" | "down" }
  * variant "05": Array of { "name": string, "value": string, "change": string, "changeType": "positive" | "negative" }
  * variant "06": Array of { "name": string, "stat": string, "goalsAchieved": number, "status": "observe" | "within" | "critical" }
  * variant "08": Array of { "name": string, "progress": number, "budget": string, "current": string }
  * variant "09": Array of { "name": string, "stat": string, "limit": string, "percentage": number }
  * variant "10" (Stock/Time series chart): Array of { "name": string, "tickerSymbol": string, "value": string, "change": string, "percentageChange": string, "changeType": "positive" | "negative", "chartData": Array<{ "date": string, "value": number }> }
  * variant "11": Array of { "name": string, "value": string, "limit": string, "percentage": number, "progressColor": string, "details": Array<{ "label": string, "value": string, "color": string }> }
  * variant "12": Array of { "name": string, "current": string, "limit": string, "percentage": number }
  * variant "14" (Donut/Progress list): Array of { "label": string, "amount": number, "percentage": number, "color": "emerald" | "amber" | "rose" | "blue" | "purple" | "orange" }
- used, total, usedLabel, totalLabel (numbers/strings, for variant "13" progress/usage)
- change (string, for variant "14" change)

TABS COMPONENT SPECIFICATION:
Tabs displays tabbed layouts.
Props:
- defaultValue: string (value of default active tab)
- tabs: Array of { "label": string, "value": string, "content": string }
- CRITICAL RULE: Tabs does NOT accept child elements. Do NOT specify "children" for Tabs. Render the tab contents directly inside the "tabs" content field as a text or markdown string.

RULES:
1. Return ONLY the JSON object. No markdown code blocks.
2. ALWAYS use the flat root/elements format.
3. Build visually rich, premium UIs.
4. Use realistic sample data unless REAL-WORLD DATA CONTEXT from web search is provided below.
5. Keep element IDs descriptive and kebab-case.
`

async function performTavilySearch(query: string): Promise<any[]> {
  if (!process.env.TAVILY_API_KEY) {
    return []
  }
  try {
    const tavilyResponse = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query: query,
        search_depth: 'advanced',
        max_results: 3,
        include_answer: false,
        include_images: false,
      }),
    })
    if (!tavilyResponse.ok) {
      return []
    }
    const tavilyData = await tavilyResponse.json()
    return tavilyData.results || []
  } catch (e) {
    console.error('Tavily Search Error in helper:', e)
    return []
  }
}

export async function POST(request: NextRequest) {
  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  })

  try {
    const body = await request.json()
    const {
      message,
      model = 'google/gemini-2.5-flash',
      tool = 'chat',
    } = body

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    let prompt = message
    let sources: any[] = []

    if (tool === 'chat') {
      prompt = `You are a helpful AI assistant.\n\nUser:\n${message}`
    }

    if (tool === 'ui-render') {
      let searchContext = ''
      try {
        const results = await performTavilySearch(message)
        sources = results
        if (results && results.length > 0) {
          searchContext = results
            .slice(0, 3)
            .map((item: any) => `Title: ${item.title}\nContent: ${item.content.substring(0, 350)}...`)
            .join('\n\n')
        }
      } catch (err) {
        console.error('UI Render Web Search Error:', err)
      }

      if (searchContext) {
        prompt = `${UI_RENDER_PROMPT}

REAL-WORLD DATA CONTEXT FROM WEB SEARCH:
${searchContext}

User Request:
${message}

Instructions:
1. You MUST use the actual real-world facts, numbers, and stats from the search results above to populate the generated UI components.
2. Structure the data using the "PremiumStats" or "Table" or "StatCard" components to display these statistics beautifully.
3. Return ONLY the valid JSON object. No conversational text, markdown formatting, or explanations.`
      } else {
        prompt = `${UI_RENDER_PROMPT}\n\nUser Request:\n${message}`
      }
    }

    const maxTokens = tool === 'ui-render' ? 4096 : 1024

    if (tool === 'web-search') {
      try {
        const results = await performTavilySearch(message)
        sources = results
        const context = sources
          .map(
            (item: any) =>
              `Title: ${item.title}\nContent: ${item.content}\nURL: ${item.url}`
          )
          .join('\n\n')

        prompt = `You are an advanced AI search assistant.\n\nUser Question:\n${message}\n\nSearch Results:\n${context}\n\nInstructions:\n- Use the provided search results.\n- Give a comprehensive answer.\n- Use markdown headings.\n- Use bullet points when useful.\n- Cite sources naturally.`
      } catch (searchError) {
        console.error('Tavily Error:', searchError)
        prompt = `User Question:\n${message}\n\nNote: Web search failed. Answer using your own knowledge.`
      }
    }

    let modelInstance
    let result

    const isGoogleModel = model.startsWith('google/')
    const hasGoogleKey = !!process.env.GOOGLE_GENERATIVE_AI_API_KEY
    const hasOpenRouterKey = !!process.env.OPENROUTER_API_KEY

    if (isGoogleModel && (hasGoogleKey || !hasOpenRouterKey)) {
      try {
        const directModelName = model.replace('google/', '')
        console.log(`Attempting direct Google Gemini API: ${directModelName}`)
        modelInstance = google(directModelName)
        result = await generateText({
          model: modelInstance,
          prompt,
          temperature: 0.2,
          maxOutputTokens: maxTokens,
        })
      } catch (err) {
        console.warn('Direct Google API failed, trying fallback to gemini-1.5-flash:', err)
        try {
          modelInstance = google('gemini-1.5-flash')
          result = await generateText({
            model: modelInstance,
            prompt,
            temperature: 0.2,
            maxOutputTokens: maxTokens,
          })
        } catch (fallbackErr) {
          console.error('Direct Google API fallbacks failed:', fallbackErr)
          if (hasOpenRouterKey) {
            console.log('Falling back to OpenRouter...')
            modelInstance = openrouter.chat(model)
            result = await generateText({
              model: modelInstance,
              prompt,
              temperature: 0.2,
              maxOutputTokens: maxTokens,
            })
          } else {
            throw fallbackErr
          }
        }
      }
    } else {
      modelInstance = openrouter.chat(model)
      result = await generateText({
        model: modelInstance,
        prompt,
        temperature: 0.2,
        maxOutputTokens: maxTokens,
      })
    }

    return NextResponse.json({ text: result.text, tool, sources })
  } catch (error) {
    console.error('OpenRouter Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
