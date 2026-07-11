export type Email = {
  id: string
  name: string
  email: string
  subject: string
  preview: string
  date: Date
  read: boolean
  labels: string[]
}

export const emails: Email[] = [
  {
    id: '1',
    name: 'William Smith',
    email: 'williamsmith@example.com',
    subject: 'Meeting Tomorrow',
    preview:
      "Hi, let's have a meeting tomorrow to discuss the project. I've been reviewing the project details and have some ideas I'd like to share.",
    date: new Date('2024-10-22T09:00:00'),
    read: false,
    labels: ['meeting', 'work', 'important'],
  },
  {
    id: '2',
    name: 'Alice Smith',
    email: 'alicesmith@example.com',
    subject: 'Re: Project Update',
    preview:
      "Thank you for the project update. It looks great! I've gone through the report, and the progress is impressive. The team has done a fantastic job.",
    date: new Date('2024-10-21T14:30:00'),
    read: true,
    labels: ['work', 'important'],
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bobjohnson@example.com',
    subject: 'Weekend Plans',
    preview:
      "Any plans for the weekend? I was thinking of going hiking in the nearby mountains. It's been a while since we had some outdoor fun.",
    date: new Date('2024-06-15T11:00:00'),
    read: true,
    labels: ['personal'],
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emilydavis@example.com',
    subject: 'Re: Question about Budget',
    preview:
      "I have a question about the budget for the upcoming project. Can we schedule a call to discuss it? I want to make sure we're aligned on costs.",
    date: new Date('2024-05-10T08:45:00'),
    read: false,
    labels: ['work', 'budget'],
  },
  {
    id: '5',
    name: 'Michael Wilson',
    email: 'michaelwilson@example.com',
    subject: 'Important Announcement',
    preview:
      'I have an important announcement to make during our team meeting. Please make sure to attend. It will be about upcoming policy changes.',
    date: new Date('2024-04-20T16:00:00'),
    read: false,
    labels: ['meeting', 'work', 'important'],
  },
  {
    id: '6',
    name: 'Sarah Brown',
    email: 'sarahbrown@example.com',
    subject: 'Re: Feedback on Proposal',
    preview:
      "I've reviewed your proposal and have some feedback. Overall it's solid, but there are a few areas where I think we could strengthen our approach.",
    date: new Date('2024-03-28T10:15:00'),
    read: true,
    labels: ['work'],
  },
  {
    id: '7',
    name: 'David Lee',
    email: 'davidlee@example.com',
    subject: 'New Project Ideas',
    preview:
      'I have some new project ideas that I think align well with our Q3 goals. Would love to brainstorm together when you have a moment.',
    date: new Date('2024-03-15T13:30:00'),
    read: true,
    labels: ['work', 'important'],
  },
  {
    id: '8',
    name: 'Olivia Martinez',
    email: 'oliviamartinez@example.com',
    subject: 'Lunch Invitation',
    preview:
      'Would you like to grab lunch this Friday? There\'s a great new restaurant downtown I\'ve been wanting to try. My treat!',
    date: new Date('2024-03-01T09:00:00'),
    read: true,
    labels: ['personal'],
  },
  {
    id: '9',
    name: 'James Taylor',
    email: 'jamestaylor@example.com',
    subject: 'Sprint Retrospective Notes',
    preview:
      'Attached are the notes from our last sprint retrospective. There are some key action items we should address before the next sprint.',
    date: new Date('2024-02-20T15:45:00'),
    read: false,
    labels: ['work', 'meeting'],
  },
  {
    id: '10',
    name: 'Sophia Anderson',
    email: 'sophiaanderson@example.com',
    subject: 'Conference Registration',
    preview:
      'Just a reminder that early-bird registration for the annual tech conference closes next week. Let me know if you want me to register for you.',
    date: new Date('2024-02-10T11:20:00'),
    read: true,
    labels: ['work', 'important'],
  },
]
