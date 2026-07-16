import { ReactNode } from "react"

export type Email = {
  from: ReactNode
  id: string
  name: string
  email: string
  replyTo: string
  subject: string
  preview: string
  body: string
  date: Date
  read: boolean
  labels: string[]
  avatarInitials: string
  done?: boolean
  attachments?: { name: string; type: string; size: string }[]
  cc?: { name: string; email: string }[]
  bcc?: { name: string; email: string }[]
  important?: boolean
  actionItem?: boolean
}

export const emails: Email[] = [
  {
    id: '1',
    name: 'AI Researcher',
    email: 'research@openai.com',
    replyTo: 'research@openai.com',
    subject: 'Learn the architecture behind GPT models and master advanced prompt crafting to unlock ChatGPT\'s full potential.',
    preview: 'Learn the architecture behind GPT models and master advanced prompt crafting to unlock ChatGPT\'s full potential.',
    body: `<h3>Unlocking ChatGPT's Full Potential</h3>
<p>Understanding the transformer architecture is key to writing better prompts. Generative Pre-trained Transformers (GPT) rely on self-attention mechanisms to weigh the importance of different words in a sequence.</p>
<p>By learning how tokens are processed and how context windows are maintained, you can craft prompts that achieve significantly higher accuracy and lower latency.</p>
<p>Here are three advanced prompt techniques:</p>
<ol>
  <li><strong>Chain-of-Thought (CoT):</strong> Encouraging the model to explain its reasoning step-by-step.</li>
  <li><strong>Few-Shot Prompting:</strong> Providing clear input-output examples before the target instruction.</li>
  <li><strong>Role-Playing & Constraints:</strong> Strictly defining the assistant persona and output boundaries.</li>
</ol>`,
    date: new Date(Date.now() - 7 * 60 * 60 * 1000), // 7 hours ago
    read: false,
    labels: ['unread', 'inbox'],
    avatarInitials: 'AR',
    from: undefined
  },
  {
    id: '2',
    name: 'Roger Tung',
    email: 'roger.tung@webinar.com',
    replyTo: 'roger.tung@webinar.com',
    subject: 'Our SBA loans webinar is tomorrow — Join us ✉️',
    preview: 'Learn what SBA loans are and the different types available, how to qualify for SBA loans, SBA loan best practices, and live Q&A! Acquire.co...',
    body: `<h3>SBA Loans Webinar: Tomorrow at 10 AM EST</h3>
<p>Hey there,</p>
<p>Don't miss our live webinar tomorrow where we cover everything you need to know about SBA (Small Business Administration) loans. Whether you are looking to acquire a SaaS company or scale your existing storefront, SBA loans are one of the most cost-effective financing options available.</p>
<p><strong>What we will cover:</strong></p>
<ul>
  <li>SBA 7(a) vs 504: Which loan program is right for you?</li>
  <li>Underwriting criteria: How bank lenders evaluate your credit, debt service coverage, and equity injection.</li>
  <li>Best practices for speeding up the approval process from months to weeks.</li>
  <li>Live Q&A session with active SBA lenders.</li>
</ul>
<p>See you there!</p>`,
    date: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    read: false,
    labels: ['unread', 'inbox'],
    avatarInitials: 'RT',
    from: undefined
  },
  {
    id: '3',
    name: 'Eric at StackBlitz',
    email: 'eric@stackblitz.com',
    replyTo: 'eric@stackblitz.com',
    subject: 'Secure your spot at ViteConf',
    preview: 'Join us on October 3rd!',
    body: `<h3>ViteConf 2026 is almost here!</h3>
<p>Hi developer,</p>
<p>ViteConf returns on October 3rd, and you don't want to miss the massive updates coming to the frontend ecosystem. We have speakers from Vite core, React, Vue, Svelte, and leading meta-frameworks.</p>
<p>Get ready for hands-on workshops, keynotes on WebContainers, and interactive panel discussions.</p>
<p><a href="https://viteconf.org/register" style="color: #4f46e5; text-decoration: underline;">Secure your free ticket now</a></p>`,
    date: new Date(Date.now() - 9 * 60 * 60 * 1000), // 9 hours ago
    read: false,
    labels: ['unread', 'inbox'],
    avatarInitials: 'ES',
    from: undefined
  },
  {
    id: '4',
    name: 'Gymshark',
    email: 'newsletter@gymshark.com',
    replyTo: 'support@gymshark.com',
    subject: 'Switch to your autumnal gym fits 🍂',
    preview: 'Train in: cosy, layered, oversized...',
    body: `<h3>Autumn Collection drops now</h3>
<p>Level up your training session with our brand new range of oversized hoodies, ribbed seamless leggings, and thermal layers. Designed to keep you warm during early morning commutes without overheating during your workouts.</p>
<p>Use code <strong>AUTUMN15</strong> at checkout for 15% off your first purchase from the new range.</p>`,
    date: new Date(Date.now() - 9.5 * 60 * 60 * 1000), // 9.5 hours ago
    read: false,
    labels: ['unread', 'inbox'],
    avatarInitials: 'GS',
    from: undefined
  },
  {
    id: '5',
    name: 'Grammarly Insights',
    email: 'insights@grammarly.com',
    replyTo: 'no-reply@grammarly.com',
    subject: 'A week without words?',
    preview: 'There wasn\'t any writing activity last week.',
    body: `<h3>Your Grammarly Weekly Update</h3>
<p>Hi writer,</p>
<p>We noticed you didn't have any writing activity recorded last week. If you were taking a well-deserved break, we hope it was relaxing!</p>
<p>If you've been writing offline or on unsupported apps, make sure to enable the Grammarly browser extension or download the desktop client so we can keep helping you write your best work.</p>`,
    date: new Date(Date.now() - 10 * 60 * 60 * 1000), // 10 hours ago
    read: false,
    labels: ['unread', 'inbox'],
    avatarInitials: 'GI',
    from: undefined
  },
  {
    id: '6',
    name: 'Zapier',
    email: 'zapconnect@zapier.com',
    replyTo: 'contact@zapier.com',
    subject: '📣 Last chance! Only 2 days \'til ZapConnect',
    preview: 'We saved you a free seat. Claim it now!',
    body: `<h3>Don't miss ZapConnect 2026</h3>
<p>Automation is changing faster than ever. At ZapConnect, you'll learn directly from industry leaders on how to use AI and workflow builders to automate repetitive tasks and save hours every week.</p>
<p>We'll show you brand new features including multi-step AI agents, database integrations, and customized dashboard portals.</p>
<p><a href="https://zapier.com/zapconnect" style="color: #4f46e5; text-decoration: underline;">Confirm your attendance here</a></p>`,
    date: new Date(Date.now() - 10.5 * 60 * 60 * 1000), // 10.5 hours ago
    read: false,
    labels: ['unread', 'inbox'],
    avatarInitials: 'ZP',
    from: undefined
  },
  {
    id: '7',
    name: 'The Pragmatic Engineer',
    email: 'newsletter@pragmaticengineer.com',
    replyTo: 'support@pragmaticengineer.com',
    subject: 'Software engineers training software engineers',
    preview: 'What is it like to teach software engineers, full time? Reuven M. Lerner has done this for 15 years, and shares his hands-on learnings - includin...',
    body: `<h3>Inside Software Engineering Training</h3>
<p>What is it like to transition from building software to teaching engineers full time?</p>
<p>Reuven M. Lerner has run a corporate training business for over 15 years, teaching Python and data science to engineering teams at companies like Apple, Cisco, and Intel. In today's issue, Reuven shares his hands-on learnings, including:</p>
<ul>
  <li>Why traditional lecturing fails and how live coding keeps groups engaged.</li>
  <li>How corporate training budgets work and how to land your first consulting gig.</li>
  <li>Why training is a highly profitable, low-overhead business model for independent developers.</li>
</ul>`,
    date: new Date(Date.now() - 11 * 60 * 60 * 1000), // 11 hours ago
    read: false,
    labels: ['unread', 'inbox'],
    avatarInitials: 'PE',
    from: undefined
  },
  {
    id: '8',
    name: 'Andrew Gazdecki',
    email: 'support@acquire.com',
    replyTo: 'support@acquire.com',
    subject: 'New SaaS Startups For Sale 🔥',
    preview: 'eComm agency connecting stores with suppliers, international calling platform 📞, keyword rank tool for Amazon sellers, and more!...',
    body: `acquire_newsletter_mock`, // Specialized trigger to render the complex visual email from the screenshot
    date: new Date(Date.now() - 11.2 * 60 * 60 * 1000), // 11.2 hours ago
    read: false,
    labels: ['unread', 'inbox'],
    avatarInitials: 'AG',
    from: undefined
  }
]
