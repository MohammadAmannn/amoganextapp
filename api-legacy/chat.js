import { generateText } from 'ai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'

export default async function handler(req, res) {
  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  })

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


// UI RENDER MODE

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
    "email-icon": {
      "type": "Icon",
      "props": { "name": "Mail", "size": 16 }
    },
    "email-text": {
      "type": "Text",
      "props": { "children": "sarah.anderson@example.com", "size": "sm" }
    },
    "location-row": {
      "type": "Stack",
      "props": { "direction": "horizontal", "gap": "sm", "align": "center" },
      "children": ["location-icon", "location-text"]
    },
    "location-icon": {
      "type": "Icon",
      "props": { "name": "MapPin", "size": 16 }
    },
    "location-text": {
      "type": "Text",
      "props": { "children": "San Francisco, CA", "size": "sm" }
    },
    "separator-1": {
      "type": "Separator",
      "props": {}
    },
    "profile-about": {
      "type": "Stack",
      "props": { "direction": "vertical", "gap": "sm" },
      "children": ["about-heading", "about-text"]
    },
    "about-heading": {
      "type": "Heading",
      "props": { "level": "5", "children": "About" }
    },
    "about-text": {
      "type": "Text",
      "props": { "children": "Passionate about creating intuitive user experiences and beautiful digital products. Coffee enthusiast.", "size": "sm" }
    },
    "separator-2": {
      "type": "Separator",
      "props": {}
    },
    "profile-stats": {
      "type": "Grid",
      "props": { "cols": 3, "gap": "sm" },
      "children": ["stat-followers", "stat-following", "stat-posts"]
    },
    "stat-followers": {
      "type": "StatCard",
      "props": { "title": "Followers", "value": "2,450", "icon": "Users" }
    },
    "stat-following": {
      "type": "StatCard",
      "props": { "title": "Following", "value": "180", "icon": "UserPlus" }
    },
    "stat-posts": {
      "type": "StatCard",
      "props": { "title": "Posts", "value": "64", "icon": "FileText" }
    },
    "profile-actions": {
      "type": "Stack",
      "props": { "direction": "horizontal", "gap": "sm", "justify": "center" },
      "children": ["follow-btn", "message-btn"]
    },
    "follow-btn": {
      "type": "Button",
      "props": { "label": "Follow", "variant": "default" }
    },
    "message-btn": {
      "type": "Button",
      "props": { "label": "Message", "variant": "outline" }
    }
  }
}

EXAMPLE 2 — "Give me Order Trends  Orders, Pending Orders. Pending Payments. Orders Returns comparison with orders":
{
  "root": "dashboard-layout",
  "elements": {
    "dashboard-layout": {
      "type": "Stack",
      "props": { "direction": "vertical", "gap": "lg" },
      "children": ["header-section", "stats-section", "details-grid"]
    },
    "header-section": {
      "type": "Stack",
      "props": { "direction": "vertical", "gap": "xs" },
      "children": ["dashboard-title", "dashboard-desc"]
    },
    "dashboard-title": {
      "type": "Heading",
      "props": { "level": "3", "children": "Order Performance & Operations Dashboard" }
    },
    "dashboard-desc": {
      "type": "Text",
      "props": { "children": "Real-time updates on orders, pending payments, and returns.", "size": "sm", "className": "text-muted-foreground" }
    },
    "stats-section": {
      "type": "PremiumStats",
      "props": {
        "variant": "10",
        "title": "Weekly Order Trends vs Returns",
        "data": [
          {
            "name": "Total Orders",
            "tickerSymbol": "ORD",
            "value": "24,892",
            "change": "+2,431",
            "percentageChange": "+10.8%",
            "changeType": "positive",
            "chartData": [
              { "date": "Nov 24", "value": 140 },
              { "date": "Nov 25", "value": 151 },
              { "date": "Nov 26", "value": 157 },
              { "date": "Nov 27", "value": 162 },
              { "date": "Nov 28", "value": 148 },
              { "date": "Nov 29", "value": 168 }
            ]
          },
          {
            "name": "Orders Returns",
            "tickerSymbol": "RET",
            "value": "412",
            "change": "-48",
            "percentageChange": "-10.4%",
            "changeType": "negative",
            "chartData": [
              { "date": "Nov 24", "value": 15 },
              { "date": "Nov 25", "value": 12 },
              { "date": "Nov 26", "value": 9 },
              { "date": "Nov 27", "value": 14 },
              { "date": "Nov 28", "value": 8 },
              { "date": "Nov 29", "value": 7 }
            ]
          }
        ]
      }
    },
    "details-grid": {
      "type": "Grid",
      "props": { "cols": 2, "gap": "md" },
      "children": ["pending-payments-card", "detailed-breakdown-card"]
    },
    "pending-payments-card": {
      "type": "PremiumStats",
      "props": {
        "variant": "04",
        "title": "Payments & Orders Status",
        "data": [
          {
            "name": "Pending Orders",
            "stat": "1,435",
            "change": "+2.87%",
            "changeType": "positive"
          },
          {
            "name": "Pending Payments",
            "stat": "$12,435.00",
            "change": "-1.24%",
            "changeType": "negative"
          }
        ]
      }
    },
    "detailed-breakdown-card": {
      "type": "PremiumStats",
      "props": {
        "variant": "15",
        "title": "Returns & Orders Detailed Comparison",
        "data": [
          {
            "label": "Gross Sales Orders",
            "value": "24,892",
            "percentage": "+10.8%"
          },
          {
            "label": "Total Returns Requested",
            "value": "412",
            "percentage": "-10.4%"
          },
          {
            "label": "Net Valid Orders",
            "value": "24,480",
            "percentage": "+11.2%"
          }
        ]
      }
    }
  }
}

Available Shadcn Components (use as many as appropriate):

LAYOUT:
- Stack (direction "vertical"|"horizontal", gap "xs"|"sm"|"md"|"lg"|"xl", align "start"|"center"|"end"|"stretch", justify "start"|"center"|"end"|"between")
- Grid (cols 1-6, gap "xs"|"sm"|"md"|"lg"|"xl")
- Card (title, description, maxWidth "xs"|"sm"|"md"|"lg"|"xl"|"2xl"|"3xl"|"4xl"|"5xl"|"full", centered boolean)
- Separator (orientation "horizontal"|"vertical")
- Tabs (tabs [{label, value, content}], defaultValue)

DATA DISPLAY:
- Heading (level "1"-"6", children string)
- Text (children string, size "sm"|"base"|"lg"|"xl")
- Badge (label, variant "default"|"secondary"|"destructive"|"outline")
- Avatar (src, fallback, size "sm"|"md"|"lg"|"xl")
- Icon (name — any Lucide icon like "Mail", "MapPin", "Users", "DollarSign", "Calendar", "Clock", "Star", "Heart", "Settings", "Bell", "Phone", "Globe", "Briefcase", "Shield", "Activity", "BarChart", "TrendingUp", "Award", size number)
- StatCard (title, value, description, icon — Lucide icon name)
- PremiumStats (A component mimicking pre-built premium stats dashboard layout components. Highly recommended for stats grids/dashboards!)
  Props:
    * variant: string "01" through "15" (describes visual presentation style: "01" simple list, "02" borders, "03" cards, "04" badges, "05" view details links, "06" status, "07" circular progress radial, "08" circular progress with links, "09" progress lines, "10" charts/graphs, "11" progress bars with settings button, "12" donut pie charts usage grid, "13" segmented bar, "14" usage color code breakdown, "15" projections value list)
    * title: optional string (Title of block)
    * description: optional string (Description/subtitle)
    * data: Array of item objects depending on the chosen variant:
        - variant "01"-"05": [{ name: string, value: string, change: string, changeType: "positive"|"negative" }]
        - variant "06": [{ name: string, stat: string, goalsAchieved: number, status: "within"|"observe"|"critical", href?: string }]
        - variant "07": [{ name: string, capacity: number, current: string|number, allowed: string|number }]
        - variant "08": [{ name: string, progress: number, current: string, budget: string }]
        - variant "09": [{ name: string, stat: string, limit: string, percentage: number }]
        - variant "10" (Chart): [{ name: string, tickerSymbol?: string, value: string, change: string, percentageChange?: string, changeType: "positive"|"negative", chartData: [{ date: string, value: number }] }]
        - variant "11": [{ name: string, value: string, limit: string, percentage: number, progressColor: "bg-blue-500"|"bg-emerald-500"|"bg-orange-500", warningMessage?: string, status?: string }]
        - variant "12": [{ name: string, current: string, limit: string, percentage: number }]
        - variant "14": [{ label: string, amount: number, percentage: number, color: "emerald"|"amber"|"rose" }]
        - variant "15": [{ label: string, value: string, percentage: string }]
    * change: optional string (Variant 14 specific change percentage)
    * used: number (Variant 13 specific used amount)
    * total: number (Variant 13 specific total limit)
    * usedLabel: string (Variant 13 specific used unit, e.g. "MB")
    * totalLabel: string (Variant 13 specific total unit, e.g. "GB")
    * segments: Array<{ label: string, value: number, color: string }> (Variant 13 specific segments)
- Table (headers string[], rows any[][])
- Price (amount, period)
- FeatureList (features string[])
- Alert (title, description, variant "default"|"destructive")
- Progress (value 0-100, label)

FORM:
- Allowed Component Types and Props:
- Form (props: className) -> Wrap your form elements in this. It captures and validates submissions!
- Input (props: label, placeholder, name, required (boolean), type "text"|"email"|"password"|"number")
- Textarea (props: label, placeholder, name, required (boolean))
- Select (props: label, placeholder, name, required (boolean), options [array of strings or {label, value}])
- Checkbox (props: label, name, required (boolean), checked)
- Switch (props: label, name, required (boolean), checked)
- RadioGroup (props: name, required (boolean), options [array])
- Button (props: label, variant "default"|"destructive"|"outline"|"secondary"|"ghost"|"link", size "default"|"sm"|"lg"|"icon", className, type "submit"|"button") -> Use type="submit" for form buttons!
- Calendar (mode "single"|"multiple"|"range")

RULES:
1. Return ONLY the JSON object. No markdown code blocks.
2. ALWAYS use the flat root/elements format. Do NOT use nested Form/fields format.
3. Build visually rich, premium UIs. Use Cards, Avatars, Badges, Icons, Grids, PremiumStats, Separators, etc. to make it look professional.
4. Use realistic sample data.
5. Use a variety of components — don't just create simple forms. Think like a UI designer.
6. Use Icons with proper Lucide names to enhance visual appeal.
7. Use Stacks for layout control — horizontal for rows, vertical for columns.
8. Keep element IDs descriptive and kebab-case.
9. IMPORTANT: When the user asks for analytics, statistics, charts, trends, or usage metrics, ALWAYS prioritize using PremiumStats (especially variants like "10" for charts, "02" for border grids, and "14" for usage breakdown) to leverage our built-in dashboards.
`

    // CHAT MODE

    if (tool === 'chat') {
  prompt = `
You are a helpful AI assistant.

User:
${message}
`


}



// ui render mode
if (tool === 'ui-render') {
  prompt = `
${UI_RENDER_PROMPT}

User Request:
${message}
`
}

    // Determine maxOutputTokens based on tool
    const maxTokens = tool === 'ui-render' ? 4096 : 1024


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
        temperature: 0.2,
      maxOutputTokens: maxTokens,
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