import { isCapacitor } from '@/lib/platform'
import { CREATE_TABLES_SQL } from './schema'

class SQLiteManager {
  private static instance: SQLiteManager
  private dbConnection: any = null
  private isInitialized = false
  private webStore: Map<string, any[]> = new Map()

  private constructor() {}

  public static getInstance(): SQLiteManager {
    if (!SQLiteManager.instance) {
      SQLiteManager.instance = new SQLiteManager()
    }
    return SQLiteManager.instance
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    if (isCapacitor()) {
      try {
        const { SQLiteConnection, CapacitorSQLite } = await import('@capacitor-community/sqlite')
        const sqlite = new SQLiteConnection(CapacitorSQLite)
        const isConn = await sqlite.isConnection('mobile_db', false)

        if (isConn.result) {
          this.dbConnection = await sqlite.retrieveConnection('mobile_db', false)
        } else {
          this.dbConnection = await sqlite.createConnection(
            'mobile_db',
            false,
            'no-encryption',
            1,
            false
          )
        }

        await this.dbConnection.open()
        await this.dbConnection.execute(CREATE_TABLES_SQL)
        this.isInitialized = true
        console.log('[SQLiteManager] Native SQLite Database Initialized successfully.')
        return
      } catch (err) {
        console.warn('[SQLiteManager] Native SQLite initialization failed, falling back to Web Storage:', err)
      }
    }

    // Web / Fallback Initialization
    this.initWebStorage()
    this.isInitialized = true
    console.log('[SQLiteManager] Web SQLite Fallback Initialized.')
  }

  private initWebStorage() {
    if (typeof window === 'undefined') return
    const tables = ['users', 'profiles', 'conversations', 'messages', 'contacts', 'pending_messages', 'pending_uploads', 'settings']
    tables.forEach((t) => {
      const stored = localStorage.getItem(`sqlite_web_${t}`)
      this.webStore.set(t, stored ? JSON.parse(stored) : [])
    })
  }

  private saveWebTable(table: string) {
    if (typeof window === 'undefined') return
    const data = this.webStore.get(table) || []
    localStorage.setItem(`sqlite_web_${table}`, JSON.stringify(data))
  }

  public async run(sql: string, params: any[] = []): Promise<void> {
    await this.initialize()

    if (this.dbConnection && isCapacitor()) {
      await this.dbConnection.run(sql, params)
      return
    }

    // Web Fallback Query Engine
    const trimmed = sql.trim().toUpperCase()
    if (trimmed.startsWith('INSERT INTO')) {
      const match = sql.match(/INSERT INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i)
      if (match) {
        const tableName = match[1]
        const columns = match[2].split(',').map((c) => c.trim())
        const row: any = {}
        columns.forEach((col, idx) => {
          row[col] = params[idx] !== undefined ? params[idx] : null
        })
        const tableData = this.webStore.get(tableName) || []
        const existingIdx = tableData.findIndex((r) => r.id === row.id)
        if (existingIdx !== -1) {
          tableData[existingIdx] = row
        } else {
          tableData.push(row)
        }
        this.webStore.set(tableName, tableData)
        this.saveWebTable(tableName)
      }
    } else if (trimmed.startsWith('DELETE FROM')) {
      const match = sql.match(/DELETE FROM\s+(\w+)\s+WHERE\s+(\w+)\s*=\s*\?/i)
      if (match) {
        const tableName = match[1]
        const key = match[2]
        const val = params[0]
        const tableData = (this.webStore.get(tableName) || []).filter((r) => r[key] !== val)
        this.webStore.set(tableName, tableData)
        this.saveWebTable(tableName)
      }
    }
  }

  public async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    await this.initialize()

    if (this.dbConnection && isCapacitor()) {
      const res = await this.dbConnection.query(sql, params)
      return res.values || []
    }

    // Web Fallback Query Engine
    const match = sql.match(/SELECT\s+.*?\s+FROM\s+(\w+)/i)
    if (match) {
      const tableName = match[1]
      const rows = this.webStore.get(tableName) || []
      if (sql.includes('WHERE')) {
        const whereMatch = sql.match(/WHERE\s+(\w+)\s*=\s*\?/i)
        if (whereMatch) {
          const key = whereMatch[1]
          const val = params[0]
          return rows.filter((r) => r[key] === val) as any
        }
      }
      return rows as any
    }

    return []
  }

  public async execute(sql: string): Promise<void> {
    await this.initialize()
    if (this.dbConnection && isCapacitor()) {
      await this.dbConnection.execute(sql)
    }
  }
}

export const sqliteManager = SQLiteManager.getInstance()
