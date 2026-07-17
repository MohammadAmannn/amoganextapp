import React, { useState } from 'react'
import { useEmailSettingsStore } from '../store'
import { EmailAccount } from '../types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Mail, Plus, Trash2, Edit, Save, X, Lock, Server, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const PRESET_SERVERS: Record<string, Partial<EmailAccount>> = {
  gmail: {
    incomingServer: 'imap.gmail.com',
    incomingPort: 993,
    outgoingServer: 'smtp.gmail.com',
    outgoingPort: 587,
    useSSL: true,
    useTLS: true,
  },
  outlook: {
    incomingServer: 'outlook.office365.com',
    incomingPort: 993,
    outgoingServer: 'smtp-mail.outlook.com',
    outgoingPort: 587,
    useSSL: true,
    useTLS: true,
  },
  yahoo: {
    incomingServer: 'imap.mail.yahoo.com',
    incomingPort: 993,
    outgoingServer: 'smtp.mail.yahoo.com',
    outgoingPort: 465,
    useSSL: true,
    useTLS: false,
  },
}

export function LinksTab() {
  const { config, addAccount, updateAccount, removeAccount } = useEmailSettingsStore()
  const { accounts } = config
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState<any>(null)
  const [preset, setPreset] = useState<string>('')

  const handlePresetSelect = (presetName: string) => {
    setPreset(presetName)
    const presetConfig = PRESET_SERVERS[presetName]
    if (presetConfig) {
      setEditFormData((prev: any) => ({
        ...prev,
        ...presetConfig,
      }))
    }
  }

  const openAddModal = () => {
    setPreset('')
    setEditingAccountId('new')
    setEditFormData({
      email: '',
      password: '',
      protocol: 'IMAP',
      incomingServer: '',
      incomingPort: 993,
      outgoingServer: '',
      outgoingPort: 587,
      useSSL: true,
      useTLS: false,
      isEnabled: true,
    })
  }

  const openEditModal = (account: EmailAccount) => {
    setPreset('')
    setEditingAccountId(account.id)
    setEditFormData({ ...account })
  }

  const closeEditModal = () => {
    setEditingAccountId(null)
    setEditFormData(null)
  }

  const saveEdit = () => {
    if (editingAccountId && editFormData) {
      if (editingAccountId === 'new') {
        addAccount(editFormData)
      } else {
        updateAccount(editingAccountId, editFormData)
      }
      closeEditModal()
    }
  }

  const handleEditFieldChange = (field: string, value: any) => {
    setEditFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="border-muted bg-card/60 backdrop-blur-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-xl flex items-center gap-2">
            <Mail className="h-5 w-5 text-indigo-500" />
            Email Accounts Manager
          </CardTitle>
          <CardDescription>
            Add, edit, configure incoming/outgoing servers, and manage authentication for your emails.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {accounts.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-muted rounded-xl bg-muted/10">
            <p className="text-muted-foreground mb-4">No email accounts added yet.</p>
            <Button onClick={openAddModal} variant="outline" className="gap-1 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10">
              <Plus className="h-4 w-4" /> Add your first account
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {accounts.map((account) => (
                <div 
                  key={account.id} 
                  className={`border rounded-xl bg-background/50 overflow-hidden transition-all duration-200 shadow-sm ${
                    account.isEnabled ? 'border-muted' : 'border-muted-foreground/20 opacity-60'
                  }`}
                >
                  {/* Header Row */}
                  <div className="flex items-center justify-between p-3 gap-2 bg-muted/10">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="h-8 w-8 flex items-center justify-center shrink-0 rounded-lg bg-indigo-500/10">
                        <Mail className="h-4.5 w-4.5 text-indigo-450" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm truncate">{account.email || 'Untitled Account'}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[280px]">
                          {account.protocol} • {account.incomingServer || 'No server configured'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Enable/Disable Toggle */}
                      <Switch
                        checked={account.isEnabled}
                        onCheckedChange={(checked) => updateAccount(account.id, { isEnabled: checked })}
                        title={account.isEnabled ? "Disable Account" : "Enable Account"}
                        className="scale-90"
                      />

                      {/* Edit Button - Opens Modal */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 shrink-0"
                        onClick={() => openEditModal(account)}
                        title="Edit Account"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      {/* Delete */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-500/10 shrink-0"
                        onClick={() => removeAccount(account.id)}
                        title="Delete Account"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Add Account button */}
            <div className="pt-2">
              <Button 
                onClick={openAddModal} 
                size="sm" 
                className="w-full gap-1 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Plus className="h-4 w-4" />
                Add Email Account
              </Button>
            </div>
          </>
        )}
      </CardContent>

      {/* Edit/Add Modal/Dialog */}
      <Dialog open={!!editingAccountId} onOpenChange={(open) => !open && closeEditModal()}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-indigo-500" />
              {editingAccountId === 'new' ? 'Add Email Account' : 'Edit Email Account'}
            </DialogTitle>
            <DialogDescription>
              Configure provider presets or input custom email credentials and server properties.
            </DialogDescription>
          </DialogHeader>

          {editFormData && (
            <div className="space-y-6 py-4">
              {/* Preset Servers (only for add or edit if wanted) */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Select Provider Preset (Optional)</Label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.keys(PRESET_SERVERS).map((key) => (
                    <Button
                      key={key}
                      variant="outline"
                      type="button"
                      onClick={() => handlePresetSelect(key)}
                      className={cn(
                        "h-9 text-xs transition-all",
                        preset === key 
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 font-semibold'
                          : 'hover:bg-muted/50'
                      )}
                    >
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Email & Password */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                  <Lock className="w-4 h-4 text-indigo-400" />
                  Account Credentials
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Email Address *</Label>
                    <Input
                      type="email"
                      placeholder="your.email@example.com"
                      value={editFormData.email || ''}
                      onChange={(e) => handleEditFieldChange('email', e.target.value)}
                      className="bg-background/80 h-9 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Password / App Password *</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={editFormData.password || ''}
                      onChange={(e) => handleEditFieldChange('password', e.target.value)}
                      className="bg-background/80 h-9 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Protocol Selection */}
              <div className="space-y-3">
                <Label className="text-xs font-semibold">Email Protocol</Label>
                <div className="grid grid-cols-2 gap-3">
                  {['IMAP', 'POP3'].map((proto) => (
                    <button
                      key={proto}
                      type="button"
                      onClick={() => handleEditFieldChange('protocol', proto)}
                      className={cn(
                        "p-3 rounded-lg border-2 text-left transition-all cursor-pointer",
                        editFormData.protocol === proto
                          ? 'border-indigo-500 bg-indigo-500/5 text-indigo-400'
                          : 'border-muted hover:border-muted-foreground/30 hover:bg-muted/10'
                      )}
                    >
                      <div className="font-semibold text-sm">{proto}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {proto === 'IMAP' ? 'Sync folders, fast' : 'Download and local storage'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Incoming Server */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                  <Server className="w-4 h-4 text-indigo-400" />
                  Incoming Server ({editFormData.protocol})
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label className="text-xs font-semibold">Server Address *</Label>
                    <Input
                      placeholder="imap.example.com"
                      value={editFormData.incomingServer || ''}
                      onChange={(e) => handleEditFieldChange('incomingServer', e.target.value)}
                      className="bg-background/80 h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Port *</Label>
                    <Input
                      type="number"
                      placeholder="993"
                      value={editFormData.incomingPort || ''}
                      onChange={(e) => handleEditFieldChange('incomingPort', parseInt(e.target.value) || 0)}
                      className="bg-background/80 h-9 text-sm"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editFormData.useSSL}
                      onCheckedChange={(checked) => handleEditFieldChange('useSSL', checked)}
                      id="use-ssl"
                    />
                    <Label htmlFor="use-ssl" className="text-xs font-medium text-muted-foreground cursor-pointer">Use SSL/TLS</Label>
                  </div>
                  
                  {editFormData.protocol === 'IMAP' && (
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={editFormData.useTLS}
                        onCheckedChange={(checked) => handleEditFieldChange('useTLS', checked)}
                        id="use-tls"
                      />
                      <Label htmlFor="use-tls" className="text-xs font-medium text-muted-foreground cursor-pointer">Use STARTTLS</Label>
                    </div>
                  )}
                </div>
              </div>

              {/* Outgoing Server */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                  <Server className="w-4 h-4 text-indigo-400" />
                  Outgoing Server (SMTP)
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label className="text-xs font-semibold">Server Address *</Label>
                    <Input
                      placeholder="smtp.example.com"
                      value={editFormData.outgoingServer || ''}
                      onChange={(e) => handleEditFieldChange('outgoingServer', e.target.value)}
                      className="bg-background/80 h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Port *</Label>
                    <Input
                      type="number"
                      placeholder="587"
                      value={editFormData.outgoingPort || ''}
                      onChange={(e) => handleEditFieldChange('outgoingPort', parseInt(e.target.value) || 0)}
                      className="bg-background/80 h-9 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={closeEditModal}
                  className="gap-1"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  onClick={saveEdit}
                  disabled={!editFormData.email}
                  className="gap-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Save className="h-4 w-4" />
                  {editingAccountId === 'new' ? 'Add Account' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
