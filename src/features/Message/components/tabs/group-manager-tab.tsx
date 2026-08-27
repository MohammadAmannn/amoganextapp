'use client'

import React, { useState } from 'react'
import { Group } from '@/features/chattemplate/groups/types/group.types'
import { Contact } from '@/features/chattemplate/contacts/types/contact.types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Users2,
  Plus,
  Trash2,
  Edit2,
  MessageSquare,
  Search,
  Loader2,
  Check,
  ChevronsUpDown,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { getDisplayNameInitials, cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import { createGroupConversation } from '@/features/chattemplate/chat/repositories/conversation-repository'
import { getProfileByEmail } from '@/features/chattemplate/chat/repositories/profile-repository'

interface MsgGroupTabProps {
  groups: Group[]
  contacts: Contact[]
  onRefresh: () => void
  onSelectGroup?: (group: Group) => void
  onClose?: () => void
}

export function MsgGroupTab({ groups, contacts, onRefresh, onSelectGroup, onClose }: MsgGroupTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [deletingGroup, setDeletingGroup] = useState<Group | null>(null)

  // Add Group Form state
  const [addGroupName, setAddGroupName] = useState('')
  const [addEmail, setAddEmail] = useState('')
  const [addDescription, setAddDescription] = useState('')
  const [addGroupImage, setAddGroupImage] = useState('')
  const [addSelectedEmails, setAddSelectedEmails] = useState<string[]>([])
  const [addStatus, setAddStatus] = useState<'Active' | 'Inactive'>('Active')
  const [addPopoverOpen, setAddPopoverOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  // Edit Group Form state
  const [editGroupName, setEditGroupName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editGroupImage, setEditGroupImage] = useState('')
  const [editSelectedUsers, setEditSelectedUsers] = useState<string[]>([])
  const [editStatus, setEditStatus] = useState<'Active' | 'Inactive'>('Active')
  const [editPopoverOpen, setEditPopoverOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const currentUser = useAuthStore((state: any) => state.auth.user)

  const filteredGroups = groups.filter((g) => {
    const q = searchQuery.toLowerCase()
    return (
      g.groupName.toLowerCase().includes(q) ||
      (g.description && g.description.toLowerCase().includes(q))
    )
  })

  // Toggle user for Add
  const handleToggleAddUser = (email: string) => {
    setAddSelectedEmails((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    )
  }

  // Toggle user for Edit
  const handleToggleEditUser = (userName: string) => {
    setEditSelectedUsers((prev) =>
      prev.includes(userName) ? prev.filter((u) => u !== userName) : [...prev, userName]
    )
  }

  // Handle Add Group Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) {
      toast.error('You must be logged in to create a group.')
      return
    }
    if (!addGroupName.trim() || addSelectedEmails.length === 0) {
      toast.error('Please enter a group name and select at least one member.')
      return
    }
    if (!addEmail.trim() || !addEmail.includes('@')) {
      toast.error('Please enter a valid group email address.')
      return
    }

    setIsAdding(true)
    const imageUrl =
      addGroupImage.trim() ||
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=150&q=80'

    try {
      const memberIds: string[] = []
      for (const email of addSelectedEmails) {
        const profile = await getProfileByEmail(email)
        if (profile) memberIds.push(profile.id)
      }

      await createGroupConversation(
        addGroupName.trim(),
        imageUrl,
        memberIds,
        currentUser.accountNo || currentUser.id
      )

      try {
        await fetch('/api/groups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            groupName: addGroupName.trim(),
            description: addDescription.trim(),
            groupImage: imageUrl,
            users: [currentUser.email, ...addSelectedEmails].filter(Boolean),
            status: addStatus,
            email: addEmail.trim().toLowerCase(),
            userUuid: currentUser.accountNo || currentUser.id,
          }),
        })
      } catch (err) {
        console.error('Failed to sync group to backend:', err)
      }

      toast.success('Group created successfully!')
      setAddGroupName('')
      setAddEmail('')
      setAddDescription('')
      setAddGroupImage('')
      setAddSelectedEmails([])
      setAddStatus('Active')
      setIsAddOpen(false)
      onRefresh()
    } catch (err) {
      console.error(err)
      toast.error('Failed to create group.')
    } finally {
      setIsAdding(false)
    }
  }

  // Open Edit Popup
  const handleOpenEdit = (group: Group) => {
    setEditingGroup(group)
    setEditGroupName(group.groupName)
    setEditEmail(group.email || '')
    setEditDescription(group.description || '')
    setEditGroupImage(group.groupImage || '')
    setEditSelectedUsers(group.users || [])
    setEditStatus(group.status)
    setEditPopoverOpen(false)
  }

  // Handle Edit Group Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingGroup) return
    if (!editGroupName.trim() || editSelectedUsers.length === 0) {
      toast.error('Please enter a group name and select at least one member.')
      return
    }

    setIsSaving(true)
    try {
      const userUuid = currentUser?.accountNo || currentUser?.id
      const response = await fetch(`/api/groups/${editingGroup.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupName: editGroupName.trim(),
          description: editDescription.trim(),
          groupImage:
            editGroupImage.trim() ||
            'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=150&q=80',
          users: editSelectedUsers,
          status: editStatus,
          email: editEmail.trim().toLowerCase() || editingGroup.email,
          user_uuid: userUuid || editingGroup.userUuid,
        }),
      })

      if (!response.ok) throw new Error('Failed to update group')

      toast.success('Group updated successfully!')
      setEditingGroup(null)
      onRefresh()
    } catch (err) {
      console.error(err)
      toast.error('Failed to update group.')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle Delete Confirm
  const handleDeleteConfirm = async () => {
    if (!deletingGroup) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/groups/${deletingGroup.id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete group')
      toast.success('Group deleted successfully!')
      setDeletingGroup(null)
      onRefresh()
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete group.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className='w-full max-w-3xl mx-auto border-border/80 bg-card/60 backdrop-blur-md shadow-md rounded-2xl'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
        <div className='flex items-center gap-3 min-w-0 flex-1'>
          <div className='space-y-1 min-w-0'>
            <CardTitle className='text-xl flex items-center gap-2'>
              <Users2 className='h-5 w-5 text-indigo-500 shrink-0' />
              <span className='truncate'>Groups Manager</span>
            </CardTitle>
            <CardDescription className='truncate'>
              Manage your group channels and start team conversations.
            </CardDescription>
          </div>
        </div>

        {onClose && (
          <Button
            size='icon'
            variant='ghost'
            onClick={onClose}
            className='h-8 w-8 rounded-lg md:hidden border border-border bg-muted/60 text-foreground hover:bg-muted shrink-0 cursor-pointer'
            title='Close view'
          >
            <X className='h-4 w-4' />
          </Button>
        )}
      </CardHeader>

      <CardContent className='space-y-4'>
        {groups.length === 0 ? (
          <div className='text-center py-12 border-2 border-dashed border-muted rounded-xl bg-muted/10'>
            <p className='text-muted-foreground mb-4 text-sm'>No groups created yet.</p>
            <Button
              onClick={() => setIsAddOpen(true)}
              variant='outline'
              className='gap-1 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10'
            >
              <Plus className='h-4 w-4' /> Create your first group
            </Button>
          </div>
        ) : (
          <>
            {/* Search Input */}
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60' />
              <Input
                placeholder='Search groups...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-9 rounded-xl border-border/80 bg-background/60 focus-visible:ring-primary h-9 text-sm'
              />
            </div>

            {filteredGroups.length === 0 ? (
              <div className='text-center py-8 border border-dashed border-muted rounded-xl bg-muted/5'>
                <p className='text-sm text-muted-foreground'>No groups match your search.</p>
              </div>
            ) : (
              <div className='space-y-3'>
                {filteredGroups.map((group) => (
                  <div
                    key={group.id}
                    className={`border rounded-xl bg-background/50 overflow-hidden transition-all duration-200 shadow-sm ${
                      group.status === 'Active' ? 'border-muted' : 'border-muted-foreground/20 opacity-60'
                    }`}
                  >
                    {/* Header Row */}
                    <div className='flex items-center justify-between p-3 gap-2 bg-muted/10'>
                      <div className='flex items-center gap-3 min-w-0 flex-1'>
                        <Avatar className='h-8 w-8 shrink-0 rounded-lg border border-border/60'>
                          <AvatarImage src={group.groupImage} alt={group.groupName} />
                          <AvatarFallback className='rounded-lg text-xs font-bold bg-indigo-500/10 text-indigo-500'>
                            {getDisplayNameInitials(group.groupName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className='min-w-0 flex-1'>
                          <p className='font-semibold text-sm truncate'>{group.groupName}</p>
                          <p className='text-xs text-muted-foreground truncate'>
                            {group.users?.length || 0} member{group.users?.length === 1 ? '' : 's'}
                            {group.email ? ` • ${group.email}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className='flex items-center gap-1 shrink-0'>
                        {/* Chat Icon - left of toggle */}
                        {onSelectGroup && (
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-7 w-7 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-500/10 shrink-0'
                            onClick={() => onSelectGroup(group)}
                            title='Start Group Chat'
                          >
                            <MessageSquare className='h-4 w-4' />
                          </Button>
                        )}

                        {/* Status Toggle */}
                        <Switch
                          checked={group.status === 'Active'}
                          onCheckedChange={() => {}}
                          title={group.status === 'Active' ? 'Active' : 'Inactive'}
                          className='scale-90 pointer-events-none'
                        />

                        {/* Edit Button */}
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 shrink-0'
                          onClick={() => handleOpenEdit(group)}
                          title='Edit Group'
                        >
                          <Edit2 className='h-4 w-4' />
                        </Button>

                        {/* Delete Button */}
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-500/10 shrink-0'
                          onClick={() => setDeletingGroup(group)}
                          title='Delete Group'
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Group Button below cards */}
            <div className='pt-2'>
              <Button
                onClick={() => setIsAddOpen(true)}
                size='sm'
                className='w-full gap-1 bg-indigo-600 hover:bg-indigo-700 text-white'
              >
                <Plus className='h-4 w-4' />
                Add New Group
              </Button>
            </div>
          </>
        )}
      </CardContent>

      {/* Add Group Popup Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className='sm:max-w-[500px] max-h-[90vh] overflow-y-auto rounded-2xl border border-border shadow-2xl bg-card'>
          <DialogHeader>
            <DialogTitle className='text-lg font-bold flex items-center gap-2'>
              <Users2 className='h-5 w-5 text-indigo-500' />
              Create New Group
            </DialogTitle>
            <DialogDescription className='text-xs text-muted-foreground'>
              Configure details and select members for the new group channel.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className='space-y-4 py-2'>
            <div className='space-y-1.5'>
              <Label htmlFor='addGroupName' className='text-xs font-semibold'>
                Group Name <span className='text-rose-500'>*</span>
              </Label>
              <Input
                id='addGroupName'
                placeholder='e.g. Marketing Team'
                value={addGroupName}
                onChange={(e) => setAddGroupName(e.target.value)}
                className='rounded-xl border-border/80 h-10 text-sm'
                required
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='addEmail' className='text-xs font-semibold'>
                Group Email <span className='text-rose-500'>*</span>
              </Label>
              <Input
                id='addEmail'
                type='email'
                placeholder='e.g. marketing@example.com'
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
                className='rounded-xl border-border/80 h-10 text-sm'
                required
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='addDescription' className='text-xs font-semibold'>
                Description
              </Label>
              <Textarea
                id='addDescription'
                placeholder='Brief description of this group...'
                value={addDescription}
                onChange={(e) => setAddDescription(e.target.value)}
                className='rounded-xl border-border/80 text-sm min-h-[70px] resize-none'
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='addGroupImage' className='text-xs font-semibold'>
                Group Image URL <span className='text-muted-foreground/60 font-normal'>(Optional)</span>
              </Label>
              <Input
                id='addGroupImage'
                placeholder='https://... (blank for default)'
                value={addGroupImage}
                onChange={(e) => setAddGroupImage(e.target.value)}
                className='rounded-xl border-border/80 h-10 text-sm'
              />
            </div>

            {/* Select Members */}
            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>
                Select Members <span className='text-rose-500'>*</span>
              </Label>
              {addSelectedEmails.length > 0 && (
                <div className='flex flex-wrap gap-1.5 p-2 border border-border/60 bg-muted/10 rounded-xl mb-2 items-center'>
                  {addSelectedEmails.map((email) => {
                    const contact = contacts.find((c) => c.email === email)
                    const label = contact ? contact.fullName : email
                    return (
                      <Badge
                        key={email}
                        variant='secondary'
                        className='bg-background text-xs font-medium pl-2 pr-1 py-0.5 rounded-md border flex items-center gap-1'
                      >
                        <span>{label}</span>
                        <button
                          type='button'
                          onClick={() => handleToggleAddUser(email)}
                          className='h-3.5 w-3.5 rounded-full flex items-center justify-center hover:bg-muted-foreground/20 text-muted-foreground'
                        >
                          <X className='h-3 w-3' />
                        </button>
                      </Badge>
                    )
                  })}
                </div>
              )}

              <Popover open={addPopoverOpen} onOpenChange={setAddPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    role='combobox'
                    className='w-full justify-between rounded-xl h-10 border-border/80 text-xs text-muted-foreground font-normal'
                  >
                    <span className='truncate'>
                      {addSelectedEmails.length === 0
                        ? 'Select group members...'
                        : `${addSelectedEmails.length} member(s) selected`}
                    </span>
                    <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-[350px] sm:w-[420px] p-0 rounded-2xl border shadow-xl bg-card' align='start'>
                  <Command className='rounded-2xl'>
                    <CommandInput placeholder='Search contacts...' className='h-10 text-xs border-0' />
                    <CommandList className='max-h-[200px] p-1.5'>
                      <CommandEmpty className='text-xs text-muted-foreground py-4 text-center'>
                        No contacts found.
                      </CommandEmpty>
                      <CommandGroup>
                        {contacts.map((contact) => {
                          const isSelected = addSelectedEmails.includes(contact.email)
                          return (
                            <CommandItem
                              key={contact.id}
                              value={contact.fullName}
                              onSelect={() => handleToggleAddUser(contact.email)}
                              className='flex items-center justify-between p-2 rounded-xl cursor-pointer text-xs font-semibold'
                            >
                              <div className='flex items-center gap-2.5 min-w-0'>
                                <Avatar className='h-7 w-7 border rounded-lg shrink-0'>
                                  <AvatarFallback className='rounded-lg text-[9px] font-bold bg-indigo-500/10 text-indigo-500'>
                                    {getDisplayNameInitials(contact.fullName)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className='truncate'>{contact.fullName}</span>
                              </div>
                              <div
                                className={cn(
                                  'h-4 w-4 rounded-md border flex items-center justify-center',
                                  isSelected
                                    ? 'bg-indigo-600 border-indigo-600 text-white'
                                    : 'bg-transparent'
                                )}
                              >
                                {isSelected && <Check className='h-3 w-3 stroke-[3]' />}
                              </div>
                            </CommandItem>
                          )
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='addStatus' className='text-xs font-semibold'>
                Group Status <span className='text-rose-500'>*</span>
              </Label>
              <Select
                value={addStatus}
                onValueChange={(val: 'Active' | 'Inactive') => setAddStatus(val)}
              >
                <SelectTrigger id='addStatus' className='rounded-xl border-border/80 h-10 text-sm'>
                  <SelectValue placeholder='Select status' />
                </SelectTrigger>
                <SelectContent className='rounded-xl'>
                  <SelectItem value='Active'>Active</SelectItem>
                  <SelectItem value='Inactive'>Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className='pt-4 gap-2 sm:gap-0 border-t border-border/50 mt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setIsAddOpen(false)}
                className='rounded-xl h-10 text-xs'
              >
                Cancel
              </Button>
              <Button
                type='submit'
                className='rounded-xl h-10 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white'
                disabled={isAdding || addSelectedEmails.length === 0}
              >
                {isAdding ? (
                  <>
                    <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />
                    Creating...
                  </>
                ) : (
                  'Create Group'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Group Popup Dialog */}
      <Dialog open={!!editingGroup} onOpenChange={(open) => !open && setEditingGroup(null)}>
        <DialogContent className='sm:max-w-[500px] max-h-[90vh] overflow-y-auto rounded-2xl border border-border shadow-2xl bg-card'>
          <DialogHeader>
            <DialogTitle className='text-lg font-bold flex items-center gap-2'>
              <Edit2 className='h-4 w-4 text-indigo-500' />
              Edit Group
            </DialogTitle>
            <DialogDescription className='text-xs text-muted-foreground'>
              Update group info and roster.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className='space-y-4 py-2'>
            <div className='space-y-1.5'>
              <Label htmlFor='editGroupName' className='text-xs font-semibold'>
                Group Name <span className='text-rose-500'>*</span>
              </Label>
              <Input
                id='editGroupName'
                value={editGroupName}
                onChange={(e) => setEditGroupName(e.target.value)}
                className='rounded-xl border-border/80 h-10 text-sm'
                required
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='editEmail' className='text-xs font-semibold'>
                Group Email <span className='text-rose-500'>*</span>
              </Label>
              <Input
                id='editEmail'
                type='email'
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className='rounded-xl border-border/80 h-10 text-sm'
                required
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='editDescription' className='text-xs font-semibold'>
                Description
              </Label>
              <Textarea
                id='editDescription'
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className='rounded-xl border-border/80 text-sm min-h-[70px] resize-none'
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='editGroupImage' className='text-xs font-semibold'>
                Group Image URL
              </Label>
              <Input
                id='editGroupImage'
                value={editGroupImage}
                onChange={(e) => setEditGroupImage(e.target.value)}
                className='rounded-xl border-border/80 h-10 text-sm'
              />
            </div>

            {/* Select Members for Edit */}
            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>Group Members *</Label>
              {editSelectedUsers.length > 0 && (
                <div className='flex flex-wrap gap-1.5 p-2 border border-border/60 bg-muted/10 rounded-xl mb-2 items-center'>
                  {editSelectedUsers.map((userName) => (
                    <Badge
                      key={userName}
                      variant='secondary'
                      className='bg-background text-xs font-medium pl-2 pr-1 py-0.5 rounded-md border flex items-center gap-1'
                    >
                      <span>{userName}</span>
                      <button
                        type='button'
                        onClick={() => handleToggleEditUser(userName)}
                        className='h-3.5 w-3.5 rounded-full flex items-center justify-center hover:bg-muted-foreground/20 text-muted-foreground'
                      >
                        <X className='h-3 w-3' />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              <Popover open={editPopoverOpen} onOpenChange={setEditPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    role='combobox'
                    className='w-full justify-between rounded-xl h-10 border-border/80 text-xs text-muted-foreground font-normal'
                  >
                    <span className='truncate'>
                      {editSelectedUsers.length === 0
                        ? 'Select group members...'
                        : `${editSelectedUsers.length} member(s) selected`}
                    </span>
                    <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-[350px] sm:w-[420px] p-0 rounded-2xl border shadow-xl bg-card' align='start'>
                  <Command className='rounded-2xl'>
                    <CommandInput placeholder='Search contacts...' className='h-10 text-xs border-0' />
                    <CommandList className='max-h-[200px] p-1.5'>
                      <CommandEmpty className='text-xs text-muted-foreground py-4 text-center'>
                        No contacts found.
                      </CommandEmpty>
                      <CommandGroup>
                        {contacts.map((contact) => {
                          const isSelected = editSelectedUsers.includes(contact.fullName)
                          return (
                            <CommandItem
                              key={contact.id}
                              value={contact.fullName}
                              onSelect={() => handleToggleEditUser(contact.fullName)}
                              className='flex items-center justify-between p-2 rounded-xl cursor-pointer text-xs font-semibold'
                            >
                              <div className='flex items-center gap-2.5 min-w-0'>
                                <Avatar className='h-7 w-7 border rounded-lg shrink-0'>
                                  <AvatarFallback className='rounded-lg text-[9px] font-bold bg-indigo-500/10 text-indigo-500'>
                                    {getDisplayNameInitials(contact.fullName)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className='truncate'>{contact.fullName}</span>
                              </div>
                              <div
                                className={cn(
                                  'h-4 w-4 rounded-md border flex items-center justify-center',
                                  isSelected
                                    ? 'bg-indigo-600 border-indigo-600 text-white'
                                    : 'bg-transparent'
                                )}
                              >
                                {isSelected && <Check className='h-3 w-3 stroke-[3]' />}
                              </div>
                            </CommandItem>
                          )
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='editStatus' className='text-xs font-semibold'>
                Group Status <span className='text-rose-500'>*</span>
              </Label>
              <Select
                value={editStatus}
                onValueChange={(val: 'Active' | 'Inactive') => setEditStatus(val)}
              >
                <SelectTrigger id='editStatus' className='rounded-xl border-border/80 h-10 text-sm'>
                  <SelectValue placeholder='Select status' />
                </SelectTrigger>
                <SelectContent className='rounded-xl'>
                  <SelectItem value='Active'>Active</SelectItem>
                  <SelectItem value='Inactive'>Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className='pt-4 gap-2 sm:gap-0 border-t border-border/50 mt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setEditingGroup(null)}
                className='rounded-xl h-10 text-xs'
              >
                Cancel
              </Button>
              <Button
                type='submit'
                className='rounded-xl h-10 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white'
                disabled={isSaving || editSelectedUsers.length === 0}
              >
                {isSaving ? (
                  <>
                    <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Group Confirm Dialog */}
      <Dialog open={!!deletingGroup} onOpenChange={(open) => !open && setDeletingGroup(null)}>
        <DialogContent className='sm:max-w-[400px] rounded-2xl border border-border shadow-2xl bg-card'>
          <DialogHeader>
            <DialogTitle className='text-lg font-bold text-rose-600'>Delete Group</DialogTitle>
            <DialogDescription className='text-xs text-muted-foreground mt-1'>
              Are you sure you want to delete group <strong>{deletingGroup?.groupName}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='pt-4 gap-2 sm:gap-0 border-t border-border/50 mt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setDeletingGroup(null)}
              className='rounded-xl h-10 text-xs'
            >
              Cancel
            </Button>
            <Button
              type='button'
              variant='destructive'
              onClick={handleDeleteConfirm}
              className='rounded-xl h-10 text-xs font-semibold'
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />
                  Deleting...
                </>
              ) : (
                'Delete Group'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export function GroupManagerTab(props: MsgGroupTabProps) {
  return <MsgGroupTab {...props} />
}

export default MsgGroupTab
