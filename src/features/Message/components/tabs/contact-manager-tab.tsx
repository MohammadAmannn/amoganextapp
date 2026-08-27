'use client'

import React, { useState } from 'react'
import { Contact } from '@/features/chattemplate/contacts/types/contact.types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Users, Plus, Trash2, Edit2, MessageSquare, Search, Loader2, UserPlus, X } from 'lucide-react'
import { toast } from 'sonner'
import { getDisplayNameInitials } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import {
  createContact,
  updateContactNickname,
  deleteContact,
} from '@/features/chattemplate/contacts/repositories/contact-repository'

interface MsgContactTabProps {
  contacts: Contact[]
  onRefresh: () => void
  onSelectContact?: (contact: Contact) => void
  onClose?: () => void
}

export function MsgContactTab({ contacts, onRefresh, onSelectContact, onClose }: MsgContactTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null)

  // Form states for Add Contact
  const [addEmail, setAddEmail] = useState('')
  const [addNickname, setAddNickname] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  // Form states for Edit Contact
  const [editNickname, setEditNickname] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const currentUser = useAuthStore((state: any) => state.auth.user)

  const filteredContacts = contacts.filter((c) => {
    const q = searchQuery.toLowerCase()
    return (
      c.fullName.toLowerCase().includes(q) ||
      (c.company && c.company.toLowerCase().includes(q)) ||
      c.email.toLowerCase().includes(q) ||
      (c.mobile && c.mobile.includes(q))
    )
  })

  // Handle Add Contact Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addEmail.trim()) {
      toast.error('Please enter a valid email address.')
      return
    }

    const userId = currentUser?.accountNo || currentUser?.id
    if (!userId) {
      toast.error('You must be logged in to add contacts.')
      return
    }

    setIsAdding(true)
    try {
      const result = await createContact(userId, addEmail.trim(), addNickname.trim() || undefined)
      if (!result.success) {
        toast.error(result.error || 'Failed to add contact.')
        return
      }
      toast.success('Contact added successfully!')
      setAddEmail('')
      setAddNickname('')
      setIsAddOpen(false)
      onRefresh()
    } catch (err) {
      console.error(err)
      toast.error('An error occurred while adding contact.')
    } finally {
      setIsAdding(false)
    }
  }

  // Open Edit Popup
  const handleOpenEdit = (contact: Contact) => {
    setEditingContact(contact)
    setEditNickname(contact.nickname || contact.fullName)
  }

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingContact || !editNickname.trim()) {
      toast.error('Please enter a nickname.')
      return
    }
    setIsSaving(true)
    try {
      const success = await updateContactNickname(
        editingContact.id,
        editingContact.ownerId,
        editNickname.trim()
      )
      if (!success) throw new Error('Failed to update nickname')
      toast.success('Nickname updated successfully!')
      setEditingContact(null)
      onRefresh()
    } catch (err) {
      console.error(err)
      toast.error('Failed to update contact nickname.')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle Delete Submit
  const handleDeleteConfirm = async () => {
    if (!deletingContact) return
    setIsDeleting(true)
    try {
      const success = await deleteContact(deletingContact.id, deletingContact.ownerId)
      if (!success) throw new Error('Failed to delete contact')
      toast.success('Contact deleted successfully!')
      setDeletingContact(null)
      onRefresh()
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete contact.')
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
              <Users className='h-5 w-5 text-indigo-500 shrink-0' />
              <span className='truncate'>Contact Manager</span>
            </CardTitle>
            <CardDescription className='truncate'>
              Manage your saved contacts and start direct chat conversations.
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
        {contacts.length === 0 ? (
          <div className='text-center py-12 border-2 border-dashed border-muted rounded-xl bg-muted/10'>
            <p className='text-muted-foreground mb-4 text-sm'>No contacts added yet.</p>
            <Button
              onClick={() => setIsAddOpen(true)}
              variant='outline'
              className='gap-1 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10'
            >
              <Plus className='h-4 w-4' /> Add your first contact
            </Button>
          </div>
        ) : (
          <>
            {/* Search Input */}
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60' />
              <Input
                placeholder='Search contacts by name or email...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-9 rounded-xl border-border/80 bg-background/60 focus-visible:ring-primary h-9 text-sm'
              />
            </div>

            {filteredContacts.length === 0 ? (
              <div className='text-center py-8 border border-dashed border-muted rounded-xl bg-muted/5'>
                <p className='text-sm text-muted-foreground'>No contacts match your search.</p>
              </div>
            ) : (
              <div className='space-y-3'>
                {filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className={`border rounded-xl bg-background/50 overflow-hidden transition-all duration-200 shadow-sm ${
                      contact.status === 'Active' ? 'border-muted' : 'border-muted-foreground/20 opacity-60'
                    }`}
                  >
                    {/* Header Row */}
                    <div className='flex items-center justify-between p-3 gap-2 bg-muted/10'>
                      <div className='flex items-center gap-3 min-w-0 flex-1'>
                        <Avatar className='h-8 w-8 shrink-0 rounded-lg border border-border/60'>
                          <AvatarFallback className='rounded-lg text-xs font-bold bg-indigo-500/10 text-indigo-500'>
                            {getDisplayNameInitials(contact.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className='min-w-0 flex-1'>
                          <p className='font-semibold text-sm truncate'>{contact.nickname || contact.fullName}</p>
                          <p className='text-xs text-muted-foreground truncate'>{contact.email}</p>
                        </div>
                      </div>

                      <div className='flex items-center gap-1 shrink-0'>
                        {/* Chat Icon - left of toggle */}
                        {onSelectContact && (
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-7 w-7 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-500/10 shrink-0'
                            onClick={() => onSelectContact(contact)}
                            title='Start Chat'
                          >
                            <MessageSquare className='h-4 w-4' />
                          </Button>
                        )}

                        {/* Enable/Disable Toggle */}
                        <Switch
                          checked={contact.status === 'Active'}
                          onCheckedChange={() => {}}
                          title={contact.status === 'Active' ? 'Active' : 'Inactive'}
                          className='scale-90 pointer-events-none'
                        />

                        {/* Edit Button */}
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 shrink-0'
                          onClick={() => handleOpenEdit(contact)}
                          title='Edit Contact'
                        >
                          <Edit2 className='h-4 w-4' />
                        </Button>

                        {/* Delete Button */}
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-500/10 shrink-0'
                          onClick={() => setDeletingContact(contact)}
                          title='Delete Contact'
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Contact Button below cards */}
            <div className='pt-2'>
              <Button
                onClick={() => setIsAddOpen(true)}
                size='sm'
                className='w-full gap-1 bg-indigo-600 hover:bg-indigo-700 text-white'
              >
                <Plus className='h-4 w-4' />
                Add New Contact
              </Button>
            </div>
          </>
        )}
      </CardContent>

      {/* Add Contact Popup Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className='sm:max-w-[480px] rounded-2xl border border-border shadow-2xl bg-card'>
          <DialogHeader>
            <DialogTitle className='text-lg font-bold flex items-center gap-2'>
              <UserPlus className='h-5 w-5 text-indigo-500' />
              Add New Contact
            </DialogTitle>
            <DialogDescription className='text-xs text-muted-foreground'>
              Enter the email address and optional nickname of the contact you'd like to add.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className='space-y-4 py-2'>
            <div className='space-y-1.5'>
              <Label htmlFor='addEmail' className='text-xs font-semibold'>
                Email Address <span className='text-rose-500'>*</span>
              </Label>
              <Input
                id='addEmail'
                type='email'
                placeholder='name@example.com'
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
                className='rounded-xl border-border/80 h-10 text-sm'
                required
              />
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='addNickname' className='text-xs font-semibold'>
                Display Nickname <span className='text-muted-foreground/60 font-normal'>(Optional)</span>
              </Label>
              <Input
                id='addNickname'
                placeholder='e.g. John Office'
                value={addNickname}
                onChange={(e) => setAddNickname(e.target.value)}
                className='rounded-xl border-border/80 h-10 text-sm'
              />
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
                disabled={isAdding}
              >
                {isAdding ? (
                  <>
                    <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />
                    Adding...
                  </>
                ) : (
                  'Add Contact'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Contact Dialog */}
      <Dialog open={!!editingContact} onOpenChange={(open) => !open && setEditingContact(null)}>
        <DialogContent className='sm:max-w-[425px] rounded-2xl border border-border shadow-2xl bg-card'>
          <DialogHeader>
            <DialogTitle className='text-lg font-bold flex items-center gap-2'>
              <Edit2 className='h-4 w-4 text-indigo-500' />
              Edit Contact
            </DialogTitle>
            <DialogDescription className='text-xs text-muted-foreground'>
              Update the contact display nickname and save changes.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className='space-y-4 py-2'>
            <div className='space-y-1.5'>
              <Label htmlFor='editNickname' className='text-xs font-semibold'>
                Nickname / Custom Name <span className='text-rose-500'>*</span>
              </Label>
              <Input
                id='editNickname'
                value={editNickname}
                onChange={(e) => setEditNickname(e.target.value)}
                placeholder='Enter nickname'
                className='rounded-xl border-border/80 h-10 text-sm'
                required
              />
            </div>
            <DialogFooter className='pt-4 gap-2 sm:gap-0 border-t border-border/50 mt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setEditingContact(null)}
                className='rounded-xl h-10 text-xs'
              >
                Cancel
              </Button>
              <Button
                type='submit'
                className='rounded-xl h-10 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white'
                disabled={isSaving}
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

      {/* Delete Contact Confirm Dialog */}
      <Dialog open={!!deletingContact} onOpenChange={(open) => !open && setDeletingContact(null)}>
        <DialogContent className='sm:max-w-[400px] rounded-2xl border border-border shadow-2xl bg-card'>
          <DialogHeader>
            <DialogTitle className='text-lg font-bold text-rose-600'>Delete Contact</DialogTitle>
            <DialogDescription className='text-xs text-muted-foreground mt-1'>
              Are you sure you want to delete <strong>{deletingContact?.fullName}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='pt-4 gap-2 sm:gap-0 border-t border-border/50 mt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setDeletingContact(null)}
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
                'Delete Contact'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export function ContactManagerTab(props: MsgContactTabProps) {
  return <MsgContactTab {...props} />
}

export default MsgContactTab
