import type { H3Event } from 'h3'
import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import * as schema from '../database/schema'

async function createPostgresDb() {
  const { Pool } = pg
  const { dbConnectionString } = useRuntimeConfig()
  if (!dbConnectionString)
    throw new Error('Missing \'NUXT_DB_CONNECTION_STRING\' in .env')
  const pool = new Pool({ connectionString: dbConnectionString, max: 100 })
  await pool.connect()
  return drizzle(pool, { schema })
}

export async function useDatabase(event: H3Event) {
  if (event.context.db)
    return event.context.db
  const db = await createPostgresDb()
  event.context.db = db
  return db
}

declare module 'h3' {
  interface H3EventContext {
    db: Awaited<ReturnType<typeof createPostgresDb>> | undefined
  }
}
