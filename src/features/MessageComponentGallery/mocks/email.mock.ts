/**
 * Mock data for Message Component Gallery
 * Email mocks
 */
import { Email } from '@/features/Message/data/emails'

export const mockEmails: Email[] = [
  {
    id: 'demo-email-001',
    name: 'Jordan Lee',
    email: 'jordan@demo.com',
    replyTo: 'jordan@demo.com',
    subject: 'Q3 Project Update — Action Required',
    preview: 'Hi team, here is the latest update on the Q3 deliverables. Please review by Friday.',
    body: `<h3>Q3 Project Update</h3>
<p>Hi team,</p>
<p>Here is the latest update on the Q3 deliverables. We are currently at <strong>85% completion</strong> for the primary milestones.</p>
<ul>
  <li><strong>Dashboard redesign:</strong> Completed ✅</li>
  <li><strong>API integration:</strong> In progress 🔄</li>
  <li><strong>QA testing:</strong> Starts Monday 📅</li>
</ul>
<p>Please review and reply with any blockers by Friday.</p>
<p>Best,<br />Jordan</p>`,
    date: new Date(Date.now() - 45 * 60 * 1000),
    read: false,
    labels: ['unread', 'inbox', 'important'],
    avatarInitials: 'JL',
    from: undefined,
    attachments: [
      { id: 'att-001', name: 'Q3-Update.pdf', type: 'application/pdf', size: '2.4 MB' },
    ],
  },
  {
    id: 'demo-email-002',
    name: 'Sam Rivera',
    email: 'sam@demo.com',
    replyTo: 'sam@demo.com',
    subject: 'Meeting Notes — Component Architecture Review',
    preview: 'Attached are the notes from today\'s architecture review session.',
    body: `<h3>Meeting Notes — Component Architecture Review</h3>
<p>Hi,</p>
<p>Attached are the notes from today's session. Key decisions:</p>
<ol>
  <li>Adopt container/presentational pattern for all Message Page components</li>
  <li>All state management through Zustand — no local Context</li>
  <li>Mock data layer for dev/preview environment</li>
</ol>
<p>Next meeting: Thursday 3 PM.</p>`,
    date: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
    read: true,
    labels: ['inbox', 'work'],
    avatarInitials: 'SR',
    from: undefined,
    attachments: [
      { id: 'att-002', name: 'arch-notes.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: '128 KB' },
    ],
  },
  {
    id: 'demo-email-003',
    name: 'Morgan Zhang',
    email: 'morgan@demo.com',
    replyTo: 'morgan@demo.com',
    subject: 'Welcome to the Dev Preview Environment 🚀',
    preview: 'This is a preview-only email used to demonstrate the EmailCardItem and EmailView components.',
    body: `<h3>Welcome to the Dev Preview Environment</h3>
<p>This email is mock data used exclusively for the component gallery preview. No real data is displayed here.</p>
<p>Components showcased:</p>
<ul>
  <li>EmailCardItem — sidebar list item</li>
  <li>EmailView — full email reader</li>
  <li>EmailDetail — detail panel</li>
</ul>`,
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    read: false,
    labels: ['unread', 'inbox'],
    avatarInitials: 'MZ',
    from: undefined,
  },
  {
    id: 'demo-email-004',
    name: 'Casey Park',
    email: 'casey@demo.com',
    replyTo: 'casey@demo.com',
    subject: 'Invoice #INV-2026-0047 — Payment Confirmed',
    preview: 'Your payment has been confirmed. Receipt attached.',
    body: `<h3>Payment Confirmation</h3>
<p>Hi,</p>
<p>This is to confirm that your payment of <strong>$1,200.00</strong> for Invoice #INV-2026-0047 has been received.</p>
<p>Receipt is attached. Thank you for your prompt payment.</p>`,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    read: true,
    labels: ['inbox', 'finance'],
    avatarInitials: 'CP',
    from: undefined,
    done: true,
    attachments: [
      { id: 'att-003', name: 'receipt-INV-2026-0047.pdf', type: 'application/pdf', size: '84 KB' },
    ],
  },
]
