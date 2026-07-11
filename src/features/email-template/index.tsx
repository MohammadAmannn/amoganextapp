'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { ComingSoon } from '@/components/coming-soon'
import { toast } from 'sonner'
import {
  Mail,
  Plus,
  Trash2,
  Save,
  Copy,
  Send,
  Eye,
  Code,
  Sparkles,
  Info,
  Layers,
  Palette
} from 'lucide-react'
import { compileEmailHtml, EmailTemplate } from '@/lib/email-compiler'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const DEFAULT_TEMPLATE: EmailTemplate = {
  name: 'New Email Template',
  subject: 'Verify your email address 🚀',
  headerLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=60',
  headerText: 'MailMind Outreach',
  bodyContent: 'Hi {{name}},\n\nThank you for signing up. Please verify your account by clicking the button below. Your activation code is: {{otp_code}}\n\nIf you did not make this request, please ignore this email.',
  buttonText: 'Verify Account',
  buttonUrl: 'https://mailmind.io/activate',
  footerText: 'MailMind Inc. 123 Tech Square, Suite 500, San Francisco, CA.\nTo unsubscribe, click here.',
  primaryColor: '#4f46e5',
  bgColor: '#f9fafb',
  textColor: '#1f2937',
}

export default function EmailTemplateFeature() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate>(DEFAULT_TEMPLATE)
  const [loading, setLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [activeMainTab, setActiveMainTab] = useState('new')

  // Variables test state
  const [testVariables, setTestVariables] = useState<Record<string, string>>({
    name: 'Mohd Aman',
    otp_code: '458921',
  })

  // Test Email dispatch states
  const [sendModalOpen, setSendModalOpen] = useState(false)
  const [testEmailAddress, setTestEmailAddress] = useState('')
  const [sendingTest, setSendingTest] = useState(false)

  // Load templates from API on mount
  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/email-templates')
      if (res.ok) {
        const data = await res.json()
        setTemplates(data)
        if (data.length > 0) {
          setSelectedTemplateId(data[0].id)
          setEditingTemplate(data[0])
        }
      }
    } catch (e) {
      console.error(e)
      toast.error('Failed to load templates.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  // Handle template selection
  const handleSelectTemplate = (id: string) => {
    const selected = templates.find((t) => t.id === id)
    if (selected) {
      setSelectedTemplateId(id)
      setEditingTemplate(selected)
    }
  }

  // Create new template preset
  const handleCreateNew = () => {
    setSelectedTemplateId(null)
    setEditingTemplate({
      ...DEFAULT_TEMPLATE,
      name: `Template ${templates.length + 1}`
    })
    toast.success('Ready to design a new template!')
  }

  // Save current template to Supabase/Fallback API
  const handleSave = async () => {
    setSaveLoading(true)
    try {
      const method = selectedTemplateId ? 'PUT' : 'POST'
      const url = selectedTemplateId 
        ? `/api/email-templates/${selectedTemplateId}` 
        : '/api/email-templates'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingTemplate),
      })

      if (response.ok) {
        const saved = await response.json()
        toast.success(`Template "${editingTemplate.name}" saved successfully!`)
        
        // Refresh local list
        if (selectedTemplateId) {
          setTemplates(prev => prev.map(t => t.id === saved.id ? saved : t))
        } else {
          setTemplates(prev => [saved, ...prev])
          setSelectedTemplateId(saved.id)
        }
      } else {
        const err = await response.json()
        throw new Error(err.error || 'Failed to save')
      }
    } catch (e) {
      console.error(e)
      toast.error(e instanceof Error ? e.message : 'Failed to save template.')
    } finally {
      setSaveLoading(false)
    }
  }

  // Delete template
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      const response = await fetch(`/api/email-templates/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Template deleted')
        setTemplates(prev => prev.filter(t => t.id !== id))
        if (selectedTemplateId === id) {
          setSelectedTemplateId(null)
          setEditingTemplate(DEFAULT_TEMPLATE)
        }
      } else {
        throw new Error('Failed to delete')
      }
    } catch (err) {
      console.error(err)
      toast.error('Could not delete template.')
    }
  }

  // Update specific fields of the editing template
  const updateField = (key: keyof EmailTemplate, value: string) => {
    setEditingTemplate((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  // Auto-detect template placeholders like {{name}}
  const detectedVariables = useMemo(() => {
    const text = editingTemplate.bodyContent || ''
    const regex = /{{([a-zA-Z0-9_-]+)}}/g
    const found: string[] = []
    let match
    while ((match = regex.exec(text)) !== null) {
      if (!found.includes(match[1])) {
        found.push(match[1])
      }
    }
    return found
  }, [editingTemplate.bodyContent])

  // Sync missing test variables state
  useEffect(() => {
    detectedVariables.forEach((v) => {
      if (testVariables[v] === undefined) {
        setTestVariables((prev) => ({
          ...prev,
          [v]: `[${v}]`,
        }))
      }
    })
  }, [detectedVariables, testVariables])

  // Compile final HTML using active configurations and variable replacements
  const compiledHtml = useMemo(() => {
    return compileEmailHtml(editingTemplate, testVariables)
  }, [editingTemplate, testVariables])

  // Copy HTML to clipboard
  const handleCopyHtml = () => {
    navigator.clipboard.writeText(compiledHtml)
    toast.success('Email responsive HTML copied to clipboard!')
  }

  // Send NodeMailer test email dispatch
  const handleSendTestEmail = async () => {
    if (!testEmailAddress) {
      toast.error('Please specify a recipient email address')
      return
    }

    setSendingTest(true)
    try {
      const response = await fetch('/api/email/send-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: testEmailAddress,
          subject: editingTemplate.subject || 'MailMind Test Outreach',
          html: compiledHtml,
        }),
      })

      const result = await response.json()
      if (response.ok && result.success) {
        if (result.mocked) {
          toast.warning(result.message, { duration: 6000 })
        } else {
          toast.success(result.message)
        }
        setSendModalOpen(false)
      } else {
        throw new Error(result.error || 'Failed to dispatch email')
      }
    } catch (e) {
      console.error(e)
      toast.error(e instanceof Error ? e.message : 'Error sending test email')
    } finally {
      setSendingTest(false)
    }
  }

  return (
    <div className="flex h-full flex-col w-full overflow-hidden bg-background text-foreground">
      <AppHeader title="Email Template Builder" />

      <Main fixed className="flex flex-grow flex-1 min-h-0 overflow-hidden p-3 sm:p-4 md:p-6 pt-3">
        <Tabs
          value={activeMainTab}
          onValueChange={setActiveMainTab}
          className='flex flex-1 flex-col overflow-hidden space-y-4'
        >
          <div className='w-full overflow-x-auto pb-2 shrink-0 border-b border-border'>
            <TabsList className='h-auto gap-6 border-0 bg-transparent p-0 shadow-none rounded-none'>
              <TabsTrigger
                value='new'
                className='h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none text-sm'
              >
                New
              </TabsTrigger>
              <TabsTrigger
                value='important'
                className='h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none text-sm'
              >
                Important
              </TabsTrigger>
              <TabsTrigger
                value='flow'
                className='h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none text-sm'
              >
                Flow
              </TabsTrigger>
              <TabsTrigger
                value='read'
                className='h-auto rounded-none border-0 border-b-2 border-transparent bg-transparent px-0 pt-0 pb-2 shadow-none hover:bg-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:shadow-none dark:data-[state=active]:border-x-transparent dark:data-[state=active]:border-t-transparent dark:data-[state=active]:border-b-primary dark:data-[state=active]:bg-transparent dark:data-[state=active]:shadow-none text-sm'
              >
                Read
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value='new'
            className='flex-1 overflow-hidden flex flex-col mt-0 focus-visible:outline-none'
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 w-full h-full overflow-hidden">
          
          {/* Left panel: Templates List and Layout parameters */}
          <div className="lg:col-span-7 flex flex-col h-full min-h-0 overflow-hidden space-y-4">
            
            {/* Template Selector Widget */}
            <Card className="border-muted bg-card/60 backdrop-blur-md shrink-0">
              <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-indigo-500" />
                  <span className="text-sm font-semibold">Active Templates</span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
                  <select
                    className="h-9 px-3 text-xs bg-background border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary min-w-[160px] flex-grow"
                    value={selectedTemplateId || ''}
                    onChange={(e) => handleSelectTemplate(e.target.value)}
                  >
                    <option value="" disabled>Select template...</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                  <Button size="sm" variant="secondary" onClick={handleCreateNew} className="gap-1 shadow-sm h-9">
                    <Plus className="h-3.5 w-3.5" />
                    New
                  </Button>
                  {selectedTemplateId && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => handleDelete(selectedTemplateId, e)}
                      className="h-9"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Design configuration form */}
            <Card className="border-muted bg-card/60 backdrop-blur-md flex-1 overflow-y-auto no-scrollbar min-h-0">
              <CardHeader className="pb-3 border-b border-muted/50">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Layers className="h-4.5 w-4.5 text-indigo-500" />
                  Outreach Editor Controls
                </CardTitle>
                <CardDescription className="text-xs">Adjust typography, styling, header title, CTA buttons, and signatures.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-6">
                
                {/* General Group */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="t-name" className="text-xs font-semibold">Template Name</Label>
                      <Input
                        id="t-name"
                        value={editingTemplate.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        className="bg-background/80 h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="t-subject" className="text-xs font-semibold">Email Subject Line</Label>
                      <Input
                        id="t-subject"
                        value={editingTemplate.subject}
                        onChange={(e) => updateField('subject', e.target.value)}
                        className="bg-background/80 h-9 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Colors Customization Group */}
                <div className="space-y-3 pt-3 border-t border-muted/40">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Palette className="h-3.5 w-3.5" />
                    Branding & Styling
                  </span>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-semibold text-muted-foreground">Button Accent</Label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={editingTemplate.primaryColor}
                          onChange={(e) => updateField('primaryColor', e.target.value)}
                          className="h-8 w-8 cursor-pointer rounded-lg border bg-transparent"
                        />
                        <span className="text-[10px] font-mono uppercase">{editingTemplate.primaryColor}</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-semibold text-muted-foreground">Email Background</Label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={editingTemplate.bgColor}
                          onChange={(e) => updateField('bgColor', e.target.value)}
                          className="h-8 w-8 cursor-pointer rounded-lg border bg-transparent"
                        />
                        <span className="text-[10px] font-mono uppercase">{editingTemplate.bgColor}</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-semibold text-muted-foreground">Text Base</Label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={editingTemplate.textColor}
                          onChange={(e) => updateField('textColor', e.target.value)}
                          className="h-8 w-8 cursor-pointer rounded-lg border bg-transparent"
                        />
                        <span className="text-[10px] font-mono uppercase">{editingTemplate.textColor}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Header Group */}
                <div className="space-y-4 pt-3 border-t border-muted/40">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Header Banner</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="t-logo" className="text-xs font-semibold">Logo Image URL</Label>
                      <Input
                        id="t-logo"
                        value={editingTemplate.headerLogo || ''}
                        onChange={(e) => updateField('headerLogo', e.target.value)}
                        placeholder="https://example.com/logo.png"
                        className="bg-background/80 h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="t-header" className="text-xs font-semibold">Header Banner Text</Label>
                      <Input
                        id="t-header"
                        value={editingTemplate.headerText || ''}
                        onChange={(e) => updateField('headerText', e.target.value)}
                        className="bg-background/80 h-9 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Email Body Content */}
                <div className="space-y-2 pt-3 border-t border-muted/40">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="t-body" className="text-xs font-semibold">Main Body Content</Label>
                    <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-indigo-400" />
                      Add placeholders: {"{{variable_name}}"}
                    </span>
                  </div>
                  <Textarea
                    id="t-body"
                    rows={8}
                    value={editingTemplate.bodyContent}
                    onChange={(e) => updateField('bodyContent', e.target.value)}
                    className="bg-background/80 text-xs leading-relaxed"
                  />
                </div>

                {/* Call to Action Button */}
                <div className="space-y-4 pt-3 border-t border-muted/40">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Call to Action (CTA Button)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="t-btn-text" className="text-xs font-semibold">Button Label</Label>
                      <Input
                        id="t-btn-text"
                        value={editingTemplate.buttonText || ''}
                        onChange={(e) => updateField('buttonText', e.target.value)}
                        placeholder="e.g. Verify Email, Visit Portal"
                        className="bg-background/80 h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="t-btn-url" className="text-xs font-semibold">Button Target Link</Label>
                      <Input
                        id="t-btn-url"
                        value={editingTemplate.buttonUrl || ''}
                        onChange={(e) => updateField('buttonUrl', e.target.value)}
                        placeholder="https://..."
                        className="bg-background/80 h-9 text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Section */}
                <div className="space-y-2 pt-3 border-t border-muted/40">
                  <Label htmlFor="t-footer" className="text-xs font-semibold">Footer Signature & Notices</Label>
                  <Textarea
                    id="t-footer"
                    rows={3}
                    value={editingTemplate.footerText || ''}
                    onChange={(e) => updateField('footerText', e.target.value)}
                    className="bg-background/80 text-xs"
                  />
                </div>

              </CardContent>
            </Card>
          </div>

          {/* Right Panel: Live Visual & Code Preview */}
          <div className="lg:col-span-5 flex flex-col h-full min-h-0 overflow-hidden">
            <Tabs defaultValue="preview" className="flex flex-col h-full min-h-0 overflow-hidden">
              
              <div className="flex justify-between items-center mb-2 shrink-0">
                <TabsList className="bg-muted/40 border border-muted h-9 p-0.5">
                  <TabsTrigger value="preview" className="h-8 text-xs gap-1.5">
                    <Eye className="h-3.5 w-3.5" />
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="html" className="h-8 text-xs gap-1.5">
                    <Code className="h-3.5 w-3.5" />
                    HTML
                  </TabsTrigger>
                </TabsList>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyHtml}
                    className="h-8 gap-1.5 text-xs"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy HTML
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setTestEmailAddress('')
                      setSendModalOpen(true)
                    }}
                    className="h-8 gap-1.5 text-xs text-indigo-400 border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Send Test
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={handleSave}
                    disabled={saveLoading}
                    className="h-8 gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {saveLoading ? 'Saving...' : 'Save Template'}
                  </Button>
                </div>
              </div>

              {/* Variable Testing Section */}
              {detectedVariables.length > 0 && (
                <div className="bg-indigo-500/5 border border-indigo-500/10 p-3 rounded-xl mb-3 shrink-0">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <Info className="h-3.5 w-3.5" />
                    Interactive Variables Preview
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    {detectedVariables.map((v) => (
                      <div key={v} className="space-y-1">
                        <Label className="text-[9px] font-semibold text-muted-foreground uppercase">{"{{"}{v}{"}}"}</Label>
                        <Input
                          value={testVariables[v] || ''}
                          onChange={(e) => setTestVariables(prev => ({ ...prev, [v]: e.target.value }))}
                          className="h-7 text-[10px] bg-background/50"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab Contents: Rendered Preview or code */}
              <div className="flex-1 min-h-0 border rounded-2xl overflow-hidden bg-white shadow-inner flex flex-col">
                <TabsContent value="preview" className="flex-1 m-0 focus-visible:outline-none flex flex-col h-full">
                  <iframe
                    title="Email preview renderer"
                    srcDoc={compiledHtml}
                    className="w-full h-full flex-grow border-none"
                    sandbox="allow-popups allow-popups-to-escape-sandbox"
                  />
                </TabsContent>
                <TabsContent value="html" className="flex-1 m-0 focus-visible:outline-none flex flex-col h-full overflow-hidden">
                  <textarea
                    readOnly
                    value={compiledHtml}
                    className="w-full h-full font-mono text-[10px] p-4 bg-slate-950 text-slate-100 resize-none select-all focus:outline-none leading-relaxed flex-grow"
                  />
                </TabsContent>
              </div>

            </Tabs>
          </div>

        </div>
        </TabsContent>

        <TabsContent
          value='important'
          className='flex-1 flex items-center justify-center border border-dashed rounded-xl focus-visible:outline-none bg-muted/5 min-h-[400px] mt-0'
        >
          <ComingSoon />
        </TabsContent>

        <TabsContent
          value='flow'
          className='flex-1 flex items-center justify-center border border-dashed rounded-xl focus-visible:outline-none bg-muted/5 min-h-[400px] mt-0'
        >
          <ComingSoon />
        </TabsContent>

        <TabsContent
          value='read'
          className='flex-1 flex items-center justify-center border border-dashed rounded-xl focus-visible:outline-none bg-muted/5 min-h-[400px] mt-0'
        >
          <ComingSoon />
        </TabsContent>
        </Tabs>
      </Main>

      {/* Dispatch Test Email Dialog Modal */}
      <Dialog open={sendModalOpen} onOpenChange={setSendModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Test Email</DialogTitle>
            <DialogDescription>
              Dispatch this compiled template via NodeMailer. Make sure your SMTP credentials are set in .env.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="test-email" className="text-xs font-semibold">Recipient Email Address</Label>
              <Input
                id="test-email"
                type="email"
                placeholder="e.g. name@domain.com"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="text-[10px] text-muted-foreground bg-muted/40 p-3 rounded-lg flex gap-2">
              <Info className="h-4 w-4 shrink-0 text-indigo-400" />
              <span>
                If SMTP is not configured, the API will output mock execution logs and simulate a successful dispatch.
              </span>
            </div>
          </div>
          <DialogFooter className="sm:justify-end gap-2">
            <Button variant="outline" onClick={() => setSendModalOpen(false)} size="sm">
              Cancel
            </Button>
            <Button
              onClick={handleSendTestEmail}
              disabled={sendingTest}
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
              size="sm"
            >
              <Send className="h-3.5 w-3.5" />
              {sendingTest ? 'Sending...' : 'Send Test Mail'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}