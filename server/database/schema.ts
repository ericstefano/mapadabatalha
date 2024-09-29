import { pgTable, real, text, timestamp } from 'drizzle-orm/pg-core'

export const battleTable = pgTable('battle', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  instagram: text('instagram').notNull(),
  lat: real('lat').notNull(),
  lon: real('lon').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
  deletedAt: timestamp('deletedAt'),
})
