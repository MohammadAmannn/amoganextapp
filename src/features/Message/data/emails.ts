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
  attachments?: { id?: string; name: string; type: string; size: string; url?: string }[]
  cc?: { name: string; email: string }[]
  bcc?: { name: string; email: string }[]
  important?: boolean
  actionItem?: boolean
  isChat?: boolean
  chatData?: {
    name: string
    avatar: string
    membersCount: number
    onlineCount: number
    messages: { id: string; sender: string; content: string; time: Date; isOwn: boolean; avatarInitials: string }[]
  }
}

export const emails: Email[] = [
  // ── Mail Cards ──────────────────────────────────────────────────────────────
  {
    id: '1',
    name: 'AI Researcher',
    email: 'research@openai.com',
    replyTo: 'research@openai.com',
    subject: 'Mastering Advanced Prompt Engineering with GPT',
    preview: 'Learn the architecture behind GPT models and master advanced prompt crafting to unlock ChatGPT\'s full potential.',
    body: `<h3>Unlocking ChatGPT's Full Potential</h3>
<p>Understanding the transformer architecture is key to writing better prompts. Generative Pre-trained Transformers (GPT) rely on self-attention mechanisms to weigh the importance of different words in a sequence.</p>
<p>By learning how tokens are processed and how context windows are maintained, you can craft prompts that achieve significantly higher accuracy and lower latency.</p>
<p>Here are three advanced prompt techniques:</p>
<ol>
  <li><strong>Chain-of-Thought (CoT):</strong> Encouraging the model to explain its reasoning step-by-step.</li>
  <li><strong>Few-Shot Prompting:</strong> Providing clear input-output examples before the target instruction.</li>
  <li><strong>Role-Playing &amp; Constraints:</strong> Strictly defining the assistant persona and output boundaries.</li>
</ol>`,
    date: new Date(Date.now() - 7 * 60 * 60 * 1000),
    read: false,
    labels: ['unread', 'inbox'],
    avatarInitials: 'AR',
    from: undefined,
  },
  {
    id: '2',
    name: 'Andrew Gazdecki',
    email: 'support@acquire.com',
    replyTo: 'support@acquire.com',
    subject: 'New SaaS Startups For Sale 🔥',
    preview: 'eComm agency connecting stores with suppliers, international calling platform, keyword rank tool for Amazon sellers, and more!',
    body: `<h3>New SaaS Listings This Week</h3>
<p>Hi there,</p>
<p>Here are this week's hottest SaaS startups available on Acquire.com:</p>
<ul>
  <li><strong>eComm Supplier Hub</strong> — connects stores with suppliers globally. ARR $42k.</li>
  <li><strong>CallBridge Pro</strong> — international calling platform with 2,400 active users. ARR $68k.</li>
  <li><strong>RankTrackr</strong> — keyword rank tool for Amazon sellers. ARR $120k.</li>
</ul>
<p>Browse all listings on Acquire.com</p>`,
    date: new Date(Date.now() - 11.2 * 60 * 60 * 1000),
    read: false,
    labels: ['unread', 'inbox'],
    avatarInitials: 'AG',
    from: undefined,
  },

  // ── Chat Cards ───────────────────────────────────────────────────────────────
  {
    id: 'chat-1',
    name: 'DB Alerts',
    email: 'db.alerts@internal.com',
    replyTo: 'db.alerts@internal.com',
    subject: 'DB Alerts Group',
    preview: 'Connection pool exceeded threshold',
    body: '',
    date: new Date(Date.now() - 17 * 60 * 1000),
    read: false,
    labels: ['chat'],
    avatarInitials: 'DA',
    from: undefined,
    isChat: true,
    chatData: {
      name: 'DB Alerts',
      avatar: 'DA',
      membersCount: 3,
      onlineCount: 1,
      messages: [
        {
          id: '1',
          sender: 'Rahul Sharma',
          content: '⚠️ Connection pool exceeded threshold on prod-db-01',
          time: new Date(Date.now() - 60 * 60 * 1000),
          isOwn: false,
          avatarInitials: 'RS',
        },
        {
          id: '2',
          sender: 'Priya Dev',
          content: 'Scaling up replicas now, monitoring closely.',
          time: new Date(Date.now() - 57 * 60 * 1000),
          isOwn: false,
          avatarInitials: 'PD',
        },
        {
          id: '3',
          sender: 'You',
          content: 'Acknowledged. Will check query performance logs.',
          time: new Date(Date.now() - 55 * 60 * 1000),
          isOwn: true,
          avatarInitials: 'YU',
        },
        {
          id: '4',
          sender: 'Rahul Sharma',
          content: 'Pool usage is back under 70%, but latency is still a bit high.',
          time: new Date(Date.now() - 52 * 60 * 1000),
          isOwn: false,
          avatarInitials: 'RS',
        },
        {
          id: '5',
          sender: 'Priya Dev',
          content: 'Adding 2 more read replicas in ap-south-1 to spread load.',
          time: new Date(Date.now() - 50 * 60 * 1000),
          isOwn: false,
          avatarInitials: 'PD',
        },
        {
          id: '6',
          sender: 'You',
          content: 'Sounds good. Ping me once they are up, I will re-run the load test.',
          time: new Date(Date.now() - 48 * 60 * 1000),
          isOwn: true,
          avatarInitials: 'YU',
        },
        {
          id: '7',
          sender: 'Rahul Sharma',
          content: 'Found a slow query in the reporting service, missing an index on orders.created_at.',
          time: new Date(Date.now() - 45 * 60 * 1000),
          isOwn: false,
          avatarInitials: 'RS',
        },
        {
          id: '8',
          sender: 'You',
          content: 'Nice catch. Let\'s add it in the next migration, I\'ll open a PR.',
          time: new Date(Date.now() - 43 * 60 * 1000),
          isOwn: true,
          avatarInitials: 'YU',
        },
        {
          id: '9',
          sender: 'Priya Dev',
          content: 'Replicas are live. CPU on primary already dropped by ~30%.',
          time: new Date(Date.now() - 40 * 60 * 1000),
          isOwn: false,
          avatarInitials: 'PD',
        },
        {
          id: '10',
          sender: 'You',
          content: 'Running the load test now, give me a few minutes.',
          time: new Date(Date.now() - 38 * 60 * 1000),
          isOwn: true,
          avatarInitials: 'YU',
        },
        {
          id: '11',
          sender: 'Rahul Sharma',
          content: 'PR is up: #482 — adds index on orders.created_at + updates query planner hints.',
          time: new Date(Date.now() - 35 * 60 * 1000),
          isOwn: false,
          avatarInitials: 'RS',
        },
        {
          id: '12',
          sender: 'You',
          content: 'Reviewing now.',
          time: new Date(Date.now() - 33 * 60 * 1000),
          isOwn: true,
          avatarInitials: 'YU',
        },
        {
          id: '13',
          sender: 'Priya Dev',
          content: 'Load test results?',
          time: new Date(Date.now() - 30 * 60 * 1000),
          isOwn: false,
          avatarInitials: 'PD',
        },
        {
          id: '14',
          sender: 'You',
          content: 'p95 latency down from 820ms to 260ms. Pool usage stable at ~45%.',
          time: new Date(Date.now() - 28 * 60 * 1000),
          isOwn: true,
          avatarInitials: 'YU',
        },
        {
          id: '15',
          sender: 'Rahul Sharma',
          content: '🎉 That\'s a big improvement. Merging the PR.',
          time: new Date(Date.now() - 25 * 60 * 1000),
          isOwn: false,
          avatarInitials: 'RS',
        },
        {
          id: '16',
          sender: 'Priya Dev',
          content: 'I\'ll keep an eye on the dashboards for the next hour just in case.',
          time: new Date(Date.now() - 22 * 60 * 1000),
          isOwn: false,
          avatarInitials: 'PD',
        },
        {
          id: '17',
          sender: 'You',
          content: 'Appreciate it. Let\'s also set up an alert for pool usage > 80% so we catch this earlier next time.',
          time: new Date(Date.now() - 20 * 60 * 1000),
          isOwn: true,
          avatarInitials: 'YU',
        },
        {
          id: '18',
          sender: 'Rahul Sharma',
          content: 'Already on it, adding a Grafana alert rule now.',
          time: new Date(Date.now() - 17 * 60 * 1000),
          isOwn: false,
          avatarInitials: 'RS',
        },
        {
          id: '19',
          sender: 'Priya Dev',
          content: 'All green on prod-db-01 and prod-db-02 now.',
          time: new Date(Date.now() - 12 * 60 * 1000),
          isOwn: false,
          avatarInitials: 'PD',
        },
        {
          id: '20',
          sender: 'You',
          content: 'Great teamwork today 🙌',
          time: new Date(Date.now() - 5 * 60 * 1000),
          isOwn: true,
          avatarInitials: 'YU',
        },
      ],
    },
  },
  {
    id: 'chat-2',
    name: 'Dev Team',
    email: 'devteam@internal.com',
    replyTo: 'devteam@internal.com',
    subject: 'Dev Team Chat',
    preview: 'Sprint review is at 4 PM today',
    body: '',
    date: new Date(Date.now() - 45 * 60 * 1000),
    read: true,
    labels: ['chat'],
    avatarInitials: 'DT',
    from: undefined,
    isChat: true,
    chatData: {
      name: 'Dev Team',
      avatar: 'DT',
      membersCount: 6,
      onlineCount: 4,
      messages: [
        {
          id: '1',
          sender: 'Amir Khan',
          content: 'Sprint review is at 4 PM today, don\'t forget to update your tasks.',
          time: new Date(Date.now() - 90 * 60 * 1000),
          isOwn: false,
          avatarInitials: 'AK',
        },
        {
          id: '2',
          sender: 'You',
          content: 'Got it, will have the demo ready by then.',
          time: new Date(Date.now() - 87 * 60 * 1000),
          isOwn: true,
          avatarInitials: 'YU',
        },
        {
          id: '3',
          sender: 'Sara M',
          content: 'Same here! Feature branch is merged ✅',
          time: new Date(Date.now() - 84 * 60 * 1000),
          isOwn: false,
          avatarInitials: 'SM',
        },
        {
          id: '4',
          sender: 'Amir Khan',
          content: 'Nice. Can someone update the sprint board with the merged tickets?',
          time: new Date(Date.now() - 80 * 60 * 1000),
          isOwn: false,
          avatarInitials: 'AK',
        },
        {
          id: '5',
          sender: 'Sara M',
          content: 'On it, moving them to Done now.',
          time: new Date(Date.now() - 78 * 60 * 1000),
          isOwn: false,
          avatarInitials: 'SM',
        },
        {
          id: '6',
          sender: 'You',
          content: 'Quick heads up — the staging env is a bit slow right now, might affect the demo.',
          time: new Date(Date.now() - 75 * 60 * 1000),
          isOwn: true,
          avatarInitials: 'YU',
        },
        {
          id: '7',
          sender: 'Devansh P',
          content: 'Yeah noticed that too, redeploying staging now to clear it.',
          time: new Date(Date.now() - 72 * 60 * 1000),
          isOwn: false,
          avatarInitials: 'DP',
        },
        {
          id: '8',
          sender: 'Amir Khan',
          content: 'Thanks Devansh. Let us know when it\'s stable.',
          time: new Date(Date.now() - 70 * 60 * 1000),
          isOwn: false,
          avatarInitials: 'AK',
        },
        {
          id: '9',
          sender: 'Devansh P',
          content: 'Staging redeployed, response times look normal now.',
          time: new Date(Date.now() - 65 * 60 * 1000),
          isOwn: false,
          avatarInitials: 'DP',
        },
        {
          id: '10',
          sender: 'You',
          content: 'Confirmed on my end too, all good.',
          time: new Date(Date.now() - 63 * 60 * 1000),
          isOwn: true,
          avatarInitials: 'YU',
        },
        {
          id: '11',
          sender: 'Sara M',
          content: 'Board is updated. 8 tickets moved to Done, 2 still in review.',
          time: new Date(Date.now() - 60 * 60 * 1000),
          isOwn: false,
          avatarInitials: 'SM',
        },
        {
          id: '12',
          sender: 'Rhea K',
          content: 'I\'ll review the remaining 2 PRs before the call.',
          time: new Date(Date.now() - 55 * 60 * 1000),
          isOwn: false,
          avatarInitials: 'RK',
        },
        {
          id: '13',
          sender: 'Amir Khan',
          content: 'Appreciate it Rhea. Anyone blocked on anything for tomorrow\'s sprint?',
          time: new Date(Date.now() - 50 * 60 * 1000),
          isOwn: false,
          avatarInitials: 'AK',
        },
        {
          id: '14',
          sender: 'You',
          content: 'Nope, all clear from my side.',
          time: new Date(Date.now() - 47 * 60 * 1000),
          isOwn: true,
          avatarInitials: 'YU',
        },
        {
          id: '15',
          sender: 'Devansh P',
          content: 'Same, all clear.',
          time: new Date(Date.now() - 45 * 60 * 1000),
          isOwn: false,
          avatarInitials: 'DP',
        },
        {
          id: '16',
          sender: 'Rhea K',
          content: 'Reviewed both PRs, left a couple of small comments, should be quick fixes.',
          time: new Date(Date.now() - 40 * 60 * 1000),
          isOwn: false,
          avatarInitials: 'RK',
        },
        {
          id: '17',
          sender: 'Sara M',
          content: 'Thanks Rhea, will address those in 10 mins.',
          time: new Date(Date.now() - 37 * 60 * 1000),
          isOwn: false,
          avatarInitials: 'SM',
        },
        {
          id: '18',
          sender: 'Amir Khan',
          content: 'Great, see everyone at 4 PM for the sprint review then 👍',
          time: new Date(Date.now() - 32 * 60 * 1000),
          isOwn: false,
          avatarInitials: 'AK',
        },
        {
          id: '19',
          sender: 'You',
          content: 'See you all there.',
          time: new Date(Date.now() - 30 * 60 * 1000),
          isOwn: true,
          avatarInitials: 'YU',
        },
      ],
    },
  },
]