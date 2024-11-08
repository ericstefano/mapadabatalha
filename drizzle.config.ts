import process from 'node:process'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'turso',
  schema: './server/database/schema.ts',
  out: './server/database/migrations',
  dbCredentials: {
    url: process.env.NUXT_TURSO_CONNECTION_URL!,
    authToken: process.env.NUXT_TURSO_AUTH_TOKEN,
  },
  strict: true,
  verbose: true,
})
