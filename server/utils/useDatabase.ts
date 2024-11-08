import type { H3Event } from 'h3'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from '../database/schema'

async function createSQLiteDatabase() {
  const { tursoConnectionUrl, tursoAuthToken } = useRuntimeConfig()
  if (!tursoConnectionUrl)
    throw new Error('Missing \'NUXT_TURSO_CONNECTION_URL\' in .env')
  if (!tursoAuthToken)
    throw new Error('Missing \'NUXT_TURSO_AUTH_TOKEN\' in .env')

  return drizzle({
    connection: {
      url: tursoConnectionUrl,
      authToken: tursoAuthToken,
    },
    schema,
  })
}

export async function useDatabase(event: H3Event) {
  if (event.context.db)
    return event.context.db
  const db = await createSQLiteDatabase()
  event.context.db = db
  return db
}

declare module 'h3' {
  interface H3EventContext {
    db: Awaited<ReturnType<typeof createSQLiteDatabase>> | undefined
  }
}
