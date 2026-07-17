import { Group } from '../api/groups.types'
import {
  getGroups as apiGetGroups,
  saveGroup as apiSaveGroup,
  deleteGroup as apiDeleteGroup
} from '../api/groups.api'

export async function getGroups(): Promise<Group[]> {
  return apiGetGroups()
}

export async function saveGroup(group: Omit<Group, 'id'> & { id?: string }): Promise<Group | null> {
  return apiSaveGroup(group)
}

export async function deleteGroup(id: string): Promise<boolean> {
  return apiDeleteGroup(id)
}