import * as usersApi from '../api/users.api'

/**
 * Looks up a user's permanent business UUID from the `users` table using their auth UUID.
 */
export async function resolveBusinessId(authUserId: string): Promise<string | null> {
  return usersApi.resolveBusinessId(authUserId)
}

/**
 * Looks up or creates a Pending user record by email.
 */
export async function getOrCreatePendingUser(
  email: string,
  name: string
): Promise<{ id: string; status: string } | null> {
  return usersApi.getOrCreatePendingUser(email, name)
}

/**
 * Looks up a user's business ID by email.
 */
export async function getUserByEmail(email: string): Promise<{ id: string; name: string; email: string; avatar?: string } | null> {
  return usersApi.getUserByEmail(email)
}

/**
 * Ensures a user record exists for the given auth user.
 */
export async function ensureUserExists(authUser: {
  authUserId: string
  email: string
  name?: string
  picture?: string
}): Promise<string | null> {
  return usersApi.ensureUserExists(authUser)
}
