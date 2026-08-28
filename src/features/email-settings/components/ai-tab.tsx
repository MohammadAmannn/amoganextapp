'use client'

import React, { useState } from 'react'
import { useEmailSettingsStore } from '../store'
import { AiAccount } from '../types'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sparkles, Plus, Trash2, Edit, Save, X, Lock, Bot, Eye, EyeOff } from 'lucide-react'

export const AI_MODELS = [
  { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
  { id: 'openai/gpt-4o', name: 'GPT-4o' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
  { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat' },
  { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B' },
]

export function AiTab() {
  const { config, addAiAccount, updateAiAccount, removeAiAccount } = useEmailSettingsStore()
  const aiAccounts = config.aiAccounts || []

  const [editingAccountId, setEditingAccountId] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState<any>(null)
  const [showKey, setShowKey] = useState(false)

  const openAddModal = () => {
    setShowKey(false)
    setEditingAccountId('new')
    setEditFormData({
      name: '',
      model: 'google/gemini-2.5-flash',
      apiKey: '',
      isEnabled: true,
    })
  }

  const openEditModal = (account: AiAccount) => {
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
        model: editFormData.model?.trim() || 'google/gemini-2.5-flash',
        apiKey: editFormData.apiKey?.trim() || '',
        isEnabled: editFormData.isEnabled ?? true,
      }
      if (editingAccountId === 'new') {
        addAiAccount(sanitizedData)
      } else {
        updateAiAccount(editingAccountId, sanitizedData)
      }
      closeEditModal()
    }
  }

  const handleEditFieldChange = (field: string, value: any) => {
    setEditFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  const getModelDisplayName = (modelId: string) => {
    const found = AI_MODELS.find((m) => m.id === modelId)
    return found ? found.name : modelId
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
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI API Credentials Manager
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Add edit and delete AI API Settings to manage OpenRouter models integration with AI Chat
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2 space-y-4">
        {aiAccounts.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-muted rounded-xl bg-muted/10">
            <p className="text-muted-foreground mb-4 text-sm">No AI API credentials added yet.</p>
            <Button
              onClick={openAddModal}
              variant="outline"
              className="gap-1 border-purple-500/30 text-purple-400 hover:bg-purple-500/10 text-xs"
            >
              <Plus className="h-4 w-4" /> Add your first AI API credential
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {aiAccounts.map((account) => (
                <div
                  key={account.id}
                  className={`border rounded-xl bg-background/50 overflow-hidden transition-all duration-200 shadow-sm ${
                    account.isEnabled ? 'border-muted' : 'border-muted-foreground/20 opacity-60'
                  }`}
                >
                  {/* Header Row */}
                  <div className="flex items-center justify-between p-3 gap-2 bg-muted/10">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="h-8 w-8 flex items-center justify-center shrink-0 rounded-lg bg-purple-500/10">
                        <Bot className="h-4.5 w-4.5 text-purple-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm truncate">
                          {account.name || getModelDisplayName(account.model)}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[320px]">
                          Model • {getModelDisplayName(account.model)} &nbsp;•&nbsp; Key • {maskApiKey(account.apiKey)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Enable/Disable Toggle */}
                      <Switch
                        checked={account.isEnabled}
                        onCheckedChange={(checked) =>
                          updateAiAccount(account.id, { isEnabled: checked })
                        }
                        title={account.isEnabled ? 'Disable Credential' : 'Enable Credential'}
                        className="scale-90"
                      />

                      {/* Edit Button */}
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
                        onClick={() => removeAiAccount(account.id)}
                        title="Delete Credential"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add AI Credential button */}
            <div className="pt-1">
              <Button
                onClick={openAddModal}
                size="sm"
                className="w-full gap-1 bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Plus className="h-4 w-4" />
                Add Your AI Credential
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
              <Sparkles className="h-5 w-5 text-purple-500" />
              {editingAccountId === 'new' ? 'Add AI API Credential' : 'Edit AI API Credential'}
            </DialogTitle>
            <DialogDescription>
              Configure OpenRouter API credentials and default model for AI Chat integration.
            </DialogDescription>
          </DialogHeader>

          {editFormData && (
            <div className="space-y-5 py-2">
              {/* Account Credentials */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
                  <Lock className="w-4 h-4 text-purple-400" />
                  Account Credentials
                </h3>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Connection Name (Optional)</Label>
                  <Input
                    placeholder="e.g. My OpenRouter Workspace"
                    value={editFormData.name || ''}
                    onChange={(e) => handleEditFieldChange('name', e.target.value)}
                    className="bg-background/80 h-9 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Select Model Field */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Select Model *</Label>
                    <Select
                      value={editFormData.model || 'google/gemini-2.5-flash'}
                      onValueChange={(val) => handleEditFieldChange('model', val)}
                    >
                      <SelectTrigger className="bg-background/80 h-9 text-xs">
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        {AI_MODELS.map((m) => (
                          <SelectItem key={m.id} value={m.id} className="text-xs">
                            {m.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* OpenRouter API Key Field */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">OpenRouter API Key *</Label>
                    <div className="relative">
                      <Input
                        type={showKey ? 'text' : 'password'}
                        placeholder="sk-or-v1-..."
                        value={editFormData.apiKey || ''}
                        onChange={(e) => handleEditFieldChange('apiKey', e.target.value)}
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
                  disabled={!editFormData.apiKey?.trim()}
                  className="gap-1 bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
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
