'use client'

import React, { useState } from 'react'
import { ArrowLeft, Mail, Plus } from 'lucide-react'
import { Main } from '@/components/layout/main'
import { AppHeader } from '@/components/layout/app-header'
import { ComingSoon } from '@/components/coming-soon'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

import { emails as initialEmails, Email } from './data/emails'
import { EmailList } from './components/email-list'
import { EmailView } from './components/email-view'
import { NewEmail } from './components/new-email'

export default function EmailFeature() {
  const [emails, setEmails] = useState<Email[]>(initialEmails)
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(
    initialEmails.find((e) => e.id === '8') || initialEmails[0] || null
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [mode, setMode] = useState<'inbox' | 'done'>('inbox')
  const [activeTab, setActiveTab] = useState('inbox')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isComposing, setIsComposing] = useState(false)

  // Action handlers
  const handleSelectEmail = (email: Email) => {
    setSelectedEmail(email)
    
    // Mark as read
    if (!email.read) {
      setEmails((prev) =>
        prev.map((e) => (e.id === email.id ? { ...e, read: true } : e))
      )
    }
  }

  const handleSendReply = (content: string) => {
    toast.success(`Reply sent to ${selectedEmail?.email}`)
    console.log(`Reply content:`, content)
  }

  const handleDelete = (id: string) => {
    setEmails((prev) => prev.filter((e) => e.id !== id))
    toast.success('Email moved to trash')
    if (selectedEmail?.id === id) {
      setSelectedEmail(null)
    }
  }

  const handleArchive = (id: string) => {
    setEmails((prev) =>
      prev.map((e) => (e.id === id ? { ...e, done: true } : e))
    )
    toast.success('Email archived')
    if (selectedEmail?.id === id) {
      setSelectedEmail(null)
    }
  }

  return (
    <>
      <AppHeader title='Email' />

      <Main fixed className='flex flex-1 flex-col p-4 sm:p-6 pt-3 sm:pt-3 bg-background overflow-hidden min-h-0'>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className='flex flex-1 flex-col overflow-hidden space-y-4 min-h-0'
        >
          {/* Custom Tabs Navigation (matches notifications and inbox tabs style) */}
          <div className='w-full overflow-x-auto pb-2 shrink-0 border-b border-border px-4 sm:px-0 sticky top-0 bg-background z-10 flex items-center gap-4'>
            <TabsList className='h-auto gap-6 border-0 bg-transparent p-0 shadow-none rounded-none'>
              <TabsTrigger
                value='inbox'
                className='h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none'
              >
                Inbox
              </TabsTrigger>
              <TabsTrigger
                value='favourite'
                className='h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none'
              >
                Favourite
              </TabsTrigger>
              <TabsTrigger
                value='archive'
                className='h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none'
              >
                Archive
              </TabsTrigger>
              <TabsTrigger
                value='history'
                className='h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none'
              >
                History
              </TabsTrigger>
            </TabsList>

            {/* Compose/New Email Button */}
            <button
              onClick={() => setIsComposing(true)}
              className='ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white  hover:text-black font-semibold text-xs transition-all select-none cursor-pointer active:scale-95 shrink-0 shadow-sm border border-transparent'
              title='Compose New Email'
            >
              <Mail className='h-3.5 w-3.5' />
              <span>New</span>
              <Plus className='h-3 w-3' />
            </button>
          </div>

          {isComposing ? (
            <div className='flex-grow flex flex-col h-full overflow-hidden border border-border rounded-xl bg-background shadow-xs mt-0'>
              <NewEmail
                onCancel={() => setIsComposing(false)}
                onSend={(emailData) => {
                  toast.success("Email sent successfully!")
                  // Optionally add to emails list
                  const newEmail: Email = {
                    id: String(Date.now()),
                    from: undefined,
                    name: "Main Account",
                    email: "user@example.com",
                    replyTo: "user@example.com",
                    subject: emailData.subject || "(No Subject)",
                    preview: emailData.body ? emailData.body.replace(/<[^>]*>/g, '').substring(0, 100) : "(No Content)",
                    body: emailData.body || "",
                    date: new Date(),
                    read: true,
                    labels: ['sent'],
                    avatarInitials: "MA",
                    done: true
                  }
                  setEmails((prev) => [newEmail, ...prev])
                  setIsComposing(false)
                }}
                onSaveDraft={(emailData) => {
                  toast.success("Draft saved successfully!")
                  setIsComposing(false)
                }}
              />
            </div>
          ) : (
            <>
              <TabsContent
                value='inbox'
                className='flex-1 overflow-hidden flex flex-row mt-0 focus-visible:outline-none border border-border rounded-xl bg-background shadow-xs'
              >
                {/* Responsive split screen */}
                <div className='flex flex-1 h-full overflow-hidden w-full'>
                  {/* Left Column: Email List */}
                  <div
                    className={cn(
                      'shrink-0 h-full flex flex-col overflow-hidden transition-all duration-300 ease-in-out',
                      selectedEmail && 'hidden md:block',
                      isSidebarCollapsed ? 'w-20' : 'w-full md:w-[350px] lg:w-[400px]'
                    )}
                  >
                    <EmailList
                      emails={emails}
                      selectedEmailId={selectedEmail?.id ?? null}
                      onSelectEmail={handleSelectEmail}
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                      mode={mode}
                      setMode={setMode}
                      isCollapsed={isSidebarCollapsed}
                      onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    />
                  </div>

                  {/* Right Column: Email Detail */}
                  <div
                    className={cn(
                      'flex-grow flex flex-col h-full overflow-hidden relative',
                      !selectedEmail && 'hidden md:block'
                    )}
                  >
                    {/* Back button visible only on mobile when email is selected */}
                    {selectedEmail && (
                      <button
                        onClick={() => setSelectedEmail(null)}
                        className='md:hidden absolute left-4 top-3 z-50 p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors border bg-background shrink-0'
                      >
                        <ArrowLeft className='h-4 w-4' />
                      </button>
                    )}

                    {selectedEmail ? (
                      <EmailView
                        email={selectedEmail}
                        onBack={() => setSelectedEmail(null)}
                        onDelete={handleDelete}
                      />
                    ) : (
                      <div className='flex h-full flex-col items-center justify-center bg-background text-muted-foreground p-8'>
                        <p className='text-sm'>Select an email to view its content</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Other Tabs content */}
              <TabsContent
                value='favourite'
                className='flex-1 flex items-center justify-center border border-dashed rounded-xl focus-visible:outline-none bg-muted/5 min-h-[400px] mt-0'
              >
                <ComingSoon />
              </TabsContent>

              <TabsContent
                value='archive'
                className='flex-1 flex items-center justify-center border border-dashed rounded-xl focus-visible:outline-none bg-muted/5 min-h-[400px] mt-0'
              >
                <ComingSoon />
              </TabsContent>

              <TabsContent
                value='history'
                className='flex-1 flex items-center justify-center border border-dashed rounded-xl focus-visible:outline-none bg-muted/5 min-h-[400px] mt-0'
              >
                <ComingSoon />
              </TabsContent>
            </>
          )}
        </Tabs>
      </Main>
    </>
  )
}