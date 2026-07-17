import { Contact } from '../api/contacts.types'
import {
  getContacts as apiGetContacts,
  createContact as apiCreateContact,
  updateContact as apiUpdateContact,
  deleteContact as apiDeleteContact
} from '../api/contacts.api'

export async function getUserContacts(userId: string): Promise<Contact[]> {
  return apiGetContacts(userId)
}

export async function createContact(
  ownerId: string,
  contactEmail: string,
  nickname?: string
): Promise<{ success: boolean; error?: string }> {
  return apiCreateContact(ownerId, contactEmail, nickname)
}

export async function updateContactNickname(
  contactId: string,
  ownerId: string,
  nickname: string
): Promise<boolean> {
  return apiUpdateContact(contactId, ownerId, nickname)
}

export async function deleteContact(contactId: string, ownerId: string): Promise<boolean> {
  return apiDeleteContact(contactId, ownerId)
}