 'use client'

import React, { useState } from 'react'
import { useEmailSettingsStore } from '../store'
import { ChatAccount } from '../types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { MessageSquare, Plus, Trash2, Edit, Save, X, Lock, Server, Eye, EyeOff } from 'lucide-react'

export function ChatTab() {
  const { config, addChatAccount, updateChatAccount, removeChatAccount } = useEmailSettingsStore()
  const chatAccounts = config.chatAccounts || []

  const [editingAccountId, setEditingAccountId] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState<any>(null)
  const [showKey, setShowKey] = useState(false)

  const openAddModal = () => {
    setShowKey(false)
    setEditingAccountId('new')
    setEditFormData({
      name: '',
      supabaseUrl: '',
      supabaseAnonKey: '',
      isEnabled: true,
    })
  }

  const openEditModal = (account: ChatAccount) => {
    setShowKey(false)
    setEditingAccountId(account.id)
    setEditFormData({ ...account })
  }

  const closeEditModal = () => {
    setEditingAccountId(null)
    setEditFormData(null)
  }

  const saveEdit = () => {
    if (editingAccountId && editFormData) {
      const sanitizedData = {
        ...editFormData,
        name: editFormData.name?.trim() || '',
        supabaseUrl: editFormData.supabaseUrl
          ?.trim()
          .replace(/\/rest\/v1\/?$/i, '')
          .replace(/\/auth\/v1\/?$/i, '')
          .replace(/\/storage\/v1\/?$/i, '')
          .replace(/\/+$/, ''),
        supabaseAnonKey: editFormData.supabaseAnonKey?.trim() || '',
        isEnabled: editFormData.isEnabled ?? true,
      }
      if (editingAccountId === 'new') {
        addChatAccount(sanitizedData)
      } else {
        updateChatAccount(editingAccountId, sanitizedData)
      }
      closeEditModal()
    }
  }

  const handleEditFieldChange = (field: string, value: any) => {
    setEditFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  // Helper to format/mask project URL for security & clean UI
  const formatDisplayUrl = (url: string) => {
    if (!url) return 'Custom Supabase Project'
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`)
      return parsed.hostname
    } catch {
      return url.length > 28 ? `${url.substring(0, 24)}...` : url
    }
  }

  const maskApiKey = (key: string) => {
    if (!key) return 'No API Key'
    if (key.length <= 10) return '••••••••••'
    return `${key.slice(0, 7)}...${key.slice(-4)}`
  }

  return (
    <Card className="border-muted bg-card/60 backdrop-blur-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-xl flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-emerald-500" />
            Chat Credentials Manager
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Add edit and delete Supabase Settings to connect your custom database with real-time Chat
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2 space-y-4">
        {chatAccounts.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-muted rounded-xl bg-muted/10">
            <p className="text-muted-foreground mb-4 text-sm">No Chat Supabase credentials added yet.</p>
            <Button
              onClick={openAddModal}
              variant="outline"
              className="gap-1 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-xs cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add your first Chat Supabase credential
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {chatAccounts.map((account) => (
                <div
                  key={account.id}
                  className={`border rounded-xl bg-background/50 overflow-hidden transition-all duration-200 shadow-sm ${
                    account.isEnabled ? 'border-muted' : 'border-muted-foreground/20 opacity-60'
                  }`}
                >
                  {/* Header Row */}
                  <div className="flex items-center justify-between p-3 gap-2 bg-muted/10">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="h-8 w-8 flex items-center justify-center shrink-0 rounded-lg bg-emerald-500/10">
                        <MessageSquare className="h-4.5 w-4.5 text-emerald-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm truncate">
                          {account.name || formatDisplayUrl(account.supabaseUrl)}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[320px]">
                          URL • {formatDisplayUrl(account.supabaseUrl)} &nbsp;•&nbsp; Key • {maskApiKey(account.supabaseAnonKey)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Enable/Disable Toggle */}
                      <Switch
                        checked={account.isEnabled}
                        onCheckedChange={(checked) =>
                          updateChatAccount(account.id, { isEnabled: checked })
                        }
                        title={account.isEnabled ? 'Disable Credential' : 'Enable Credential'}
                        className="scale-90"
                      />

                      {/* Edit Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 shrink-0 cursor-pointer"
                        onClick={() => openEditModal(account)}
                        title="Edit Credential"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      {/* Delete */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-500/10 shrink-0 cursor-pointer"
                        onClick={() => removeChatAccount(account.id)}
                        title="Delete Credential"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Chat Credential button */}
            <div className="pt-1">
              <Button
                onClick={openAddModal}
                size="sm"
                className="w-full gap-1 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Add Your Chat Credential
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
              <MessageSquare className="h-5 w-5 text-emerald-500" />
              {editingAccountId === 'new' ? 'Add Chat Supabase Credential' : 'Edit Chat Supabase Credential'}
            </DialogTitle>
            <DialogDescription>
              Configure custom Supabase project credentials for real-time chat, contacts, and messaging.
            </DialogDescription>
          </DialogHeader>

          {editFormData && (
            <div className="space-y-5 py-2">
              {/* Account Credentials */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  Account Credentials
                </h3>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Connection Name (Optional)</Label>
                  <Input
                    placeholder="e.g. My Production Chat DB"
                    value={editFormData.name || ''}
                    onChange={(e) => handleEditFieldChange('name', e.target.value)}
                    className="bg-background/80 h-9 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Supabase URL */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold flex items-center gap-1">
                      <Server className="h-3.5 w-3.5 text-muted-foreground" />
                      Supabase Project URL *
                    </Label>
                    <Input
                      placeholder="https://xyz.supabase.co"
                      value={editFormData.supabaseUrl || ''}
                      onChange={(e) => handleEditFieldChange('supabaseUrl', e.target.value)}
                      className="bg-background/80 h-9 text-sm font-mono text-xs"
                    />
                  </div>

                  {/* Supabase Anon Key */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold flex items-center gap-1">
                      <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                      Supabase Anon / Publishable Key *
                    </Label>
                    <div className="relative">
                      <Input
                        type={showKey ? 'text' : 'password'}
                        placeholder="sb_publishable_... or eyJhbGciOi..."
                        value={editFormData.supabaseAnonKey || ''}
                        onChange={(e) => handleEditFieldChange('supabaseAnonKey', e.target.value)}
                        className="bg-background/80 h-9 text-sm font-mono text-xs pr-9"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={closeEditModal}
                  className="gap-1 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  onClick={saveEdit}
                  disabled={!editFormData.supabaseUrl?.trim() || !editFormData.supabaseAnonKey?.trim()}
                  className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  {editingAccountId === 'new' ? 'Add Credential' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
