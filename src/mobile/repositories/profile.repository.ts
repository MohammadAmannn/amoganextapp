import { sqliteManager } from '../database/sqlite/connection'
import { MobileUser, MobileProfile } from '../types'

export class UserRepository {
  public static async upsertUser(user: MobileUser): Promise<void> {
    const sql = `
      INSERT INTO users (id, email, name, avatar_url, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `
    await sqliteManager.run(sql, [
      user.id,
      user.email,
      user.name,
      user.avatar_url || null,
      new Date().toISOString(),
    ])
  }

  public static async getUserById(id: string): Promise<MobileUser | null> {
    const rows = await sqliteManager.query<MobileUser>('SELECT * FROM users WHERE id = ?', [id])
    return rows[0] || null
  }
}

export class ProfileRepository {
  public static async upsertProfile(profile: MobileProfile): Promise<void> {
    const sql = `
      INSERT INTO profiles (id, name, email, avatar_url, phone, bio, status, last_seen, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    await sqliteManager.run(sql, [
      profile.id,
      profile.name,
      profile.email,
      profile.avatar_url || null,
      profile.phone || null,
      profile.bio || null,
      profile.status || 'offline',
      profile.last_seen || null,
      new Date().toISOString(),
    ])
  }

  public static async getProfileById(id: string): Promise<MobileProfile | null> {
    const rows = await sqliteManager.query<MobileProfile>('SELECT * FROM profiles WHERE id = ?', [id])
    return rows[0] || null
  }
}
