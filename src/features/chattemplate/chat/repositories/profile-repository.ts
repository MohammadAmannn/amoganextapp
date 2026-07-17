import { Profile } from '../types/chat.types'
import * as profilesApi from '../api/profiles.api'

export async function ensureProfileExists(user: {
  accountNo: string
  email: string
  name?: string
  picture?: string
}): Promise<Profile | null> {
  return profilesApi.ensureProfileExists(user)
}

export async function getProfileByEmail(email: string): Promise<Profile | null> {
  return profilesApi.getProfileByEmail(email)
}

export async function getAllProfiles(): Promise<Profile[]> {
  return profilesApi.getAllProfiles()
}

export async function getOrCreateProfileForContact(email: string, name: string): Promise<Profile | null> {
  return profilesApi.getOrCreateProfileForContact(email, name)
}
