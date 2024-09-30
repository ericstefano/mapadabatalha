import { integer, pgTable, real, text, timestamp } from 'drizzle-orm/pg-core'

export const rhymeBattleTable = pgTable('rhyme_battle', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  instagram: text('instagram').notNull(),
  lat: real('lat').notNull(),
  lon: real('lon').notNull(),
  createdAt: timestamp('created_at', { mode: 'string', withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string', withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { mode: 'string', withTimezone: true }),
})

export const instagramPostsTable = pgTable('instagram_posts', {
  id: text('id').notNull().primaryKey(),
  rhymeBattleId: text('battle_id').notNull().references(() => rhymeBattleTable.id, { onDelete: 'cascade' }),
  href: text('href').notNull(),
  src: text('src').notNull(),
  alt: text('alt').notNull(),
  timestamp: timestamp('timestamp', { mode: 'string', withTimezone: true }).notNull(),
  postQuantity: integer('post_quantity').notNull(),
  description: text('description').notNull(),
  createdAt: timestamp('created_at', { mode: 'string', withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string', withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { mode: 'string', withTimezone: true }),
})
