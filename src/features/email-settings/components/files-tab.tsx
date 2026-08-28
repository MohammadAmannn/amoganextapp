'use client'

import React, { useState } from 'react'
import { useEmailSettingsStore } from '../store'
import { SupabaseAccount } from '../types'
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
import { Database, Plus, Trash2, Edit, Save, X, Lock, Server, Eye, EyeOff } from 'lucide-react'

export function FilesTab() {
  const { config, addStorageAccount, updateStorageAccount, removeStorageAccount } = useEmailSettingsStore()
  const storageAccounts = config.storageAccounts || []

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
      bucketName: 'chat-files',
      defaultFolder: 'Chat',
      isEnabled: true,
    })
  }

  const openEditModal = (account: SupabaseAccount) => {
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
        supabaseUrl: editFormData.supabaseUrl
          ?.trim()
          .replace(/\/rest\/v1\/?$/i, '')
          .replace(/\/auth\/v1\/?$/i, '')
          .replace(/\/storage\/v1\/?$/i, '')
          .replace(/\/+$/, ''),
        supabaseAnonKey: editFormData.supabaseAnonKey?.trim(),
        bucketName: editFormData.bucketName?.trim() || 'chat-files',
      }
      if (editingAccountId === 'new') {
        addStorageAccount(sanitizedData)
      } else {
        updateStorageAccount(editingAccountId, sanitizedData)
      }
      closeEditModal()
    }
  }

  const handleEditFieldChange = (field: string, value: any) => {
    setEditFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  // Helper to format/mask project URL for security & clean UI
  const formatDisplayUrl = (url: string) => {
    if (!url) return 'Custom Supabase Storage'
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`)
      return parsed.hostname
    } catch {
      return url.length > 28 ? `${url.substring(0, 24)}...` : url
    }
  }

  return (
    <Card className="border-muted bg-card/60 backdrop-blur-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-xl flex items-center gap-2">
            <Database className="h-5 w-5 text-indigo-500" />
            Supabase Credentials Manager
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Add edit and delete files Settings to manage Apps integration with Files Storage
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2 space-y-4">
        {storageAccounts.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-muted rounded-xl bg-muted/10">
            <p className="text-muted-foreground mb-4 text-sm">No Supabase credentials added yet.</p>
            <Button onClick={openAddModal} variant="outline" className="gap-1 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 text-xs">
              <Plus className="h-4 w-4" /> Add your first Supabase credential
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {storageAccounts.map((account) => (
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
                        <Database className="h-4.5 w-4.5 text-indigo-450" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm truncate">
                          {account.name || formatDisplayUrl(account.supabaseUrl)}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[320px]">
                          Bucket • {account.bucketName || 'chat-files'} &nbsp;•&nbsp; {formatDisplayUrl(account.supabaseUrl)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Enable/Disable Toggle */}
                      <Switch
                        checked={account.isEnabled}
                        onCheckedChange={(checked) => updateStorageAccount(account.id, { isEnabled: checked })}
                        title={account.isEnabled ? "Disable Credential" : "Enable Credential"}
                        className="scale-90"
                      />

                      {/* Edit Button - Opens Modal */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 shrink-0"
                        onClick={() => openEditModal(account)}
                        title="Edit Credential"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      {/* Delete */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-500/10 shrink-0"
                        onClick={() => removeStorageAccount(account.id)}
                        title="Delete Credential"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Supabase Credential button */}
            <div className="pt-1">
              <Button
                onClick={openAddModal}
                size="sm"
                className="w-full gap-1 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Plus className="h-4 w-4" />
                Add Your Supabase Credential
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
              <Database className="h-5 w-5 text-indigo-500" />
              {editingAccountId === 'new' ? 'Add Supabase Credential' : 'Edit Supabase Credential'}
            </DialogTitle>
            <DialogDescription>
              Input custom Supabase credentials and storage bucket properties.
            </DialogDescription>
          </DialogHeader>

          {editFormData && (
            <div className="space-y-5 py-2">
              {/* Account Credentials */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                  <Lock className="w-4 h-4 text-indigo-400" />
                  Account Credentials
                </h3>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Connection Name (Optional)</Label>
                  <Input
                    placeholder="e.g. My Storage Workspace"
                    value={editFormData.name || ''}
                    onChange={(e) => handleEditFieldChange('name', e.target.value)}
                    className="bg-background/80 h-9 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Supabase Project URL *</Label>
                    <Input
                      type="url"
                      placeholder="https://xyz.supabase.co"
                      value={editFormData.supabaseUrl || ''}
                      onChange={(e) => handleEditFieldChange('supabaseUrl', e.target.value)}
                      className="bg-background/80 h-9 text-sm font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold">Publishable / Anon Key *</Label>
                    </div>
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
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Storage Bucket Settings */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                  <Server className="w-4 h-4 text-indigo-400" />
                  Storage Settings
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Bucket Name *</Label>
                    <Input
                      placeholder="chat-files"
                      value={editFormData.bucketName || ''}
                      onChange={(e) => handleEditFieldChange('bucketName', e.target.value)}
                      className="bg-background/80 h-9 text-sm font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Default Folder Path</Label>
                    <Input
                      placeholder="Chat"
                      value={editFormData.defaultFolder || ''}
                      onChange={(e) => handleEditFieldChange('defaultFolder', e.target.value)}
                      className="bg-background/80 h-9 text-sm font-mono text-xs"
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
                  disabled={!editFormData.supabaseUrl || !editFormData.supabaseAnonKey}
                  className="gap-1 bg-blue-600 hover:bg-blue-700 text-white"
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
