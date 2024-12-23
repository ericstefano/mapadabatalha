import type { POST_ANALYSIS_ERRORS } from '~/constants/errors'
import { relations } from 'drizzle-orm'
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const rhymeBattlesTable = sqliteTable('rhyme_battles', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  lat: real('lat').notNull(),
  lon: real('lon').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const instagramProfilesTable = sqliteTable('instagram_profiles', {
  id: text('id').primaryKey(),
  rhymeBattleId: text('rhyme_battle_id').notNull().references(() => rhymeBattlesTable.id, { onDelete: 'cascade' }),
  username: text('username').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const instagramPostsTable = sqliteTable('instagram_posts', {
  id: text('id').primaryKey(),
  rhymeBattleId: text('rhyme_battle_id').notNull().references(() => rhymeBattlesTable.id, { onDelete: 'cascade' }),
  instagramProfileId: text('instagram_profile_id').notNull().references(() => instagramProfilesTable.id, { onDelete: 'cascade' }),
  href: text('href').notNull(),
  alt: text('alt'),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const postAnalysesTable = sqliteTable('post_analyses', {
  id: text('id').primaryKey(),
  rhymeBattleId: text('rhyme_battle_id').notNull().references(() => rhymeBattlesTable.id, { onDelete: 'cascade' }),
  instagramPostId: text('instagram_post_id').unique().notNull(),
  model: text('model').notNull(),
  provider: text('provider').notNull(),
  nativeTokensPrompt: integer('native_tokens_prompt'),
  nativeTokensCompletion: integer('native_tokens_completion'),
  totalCost: integer('total_cost'),
  generationTime: integer('generation_time'),
  latency: integer('latency'),
  rawContent: text('raw_content'),
  parsedContent: text('parsed_content'),
  errors: text('errors', { mode: 'json' }).$type<Partial<Record<keyof typeof POST_ANALYSIS_ERRORS, true>>>(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const postIndentificationsTable = sqliteTable('post_identifications', {
  id: text('id').primaryKey(),
  rhymeBattleId: text('rhyme_battle_id').notNull().references(() => rhymeBattlesTable.id, { onDelete: 'cascade' }),
  instagramPostId: text('instagram_post_id').unique().notNull(),
  model: text('model').notNull(),
  provider: text('provider').notNull(),
  nativeTokensPrompt: integer('native_tokens_prompt'),
  nativeTokensCompletion: integer('native_tokens_completion'),
  totalCost: integer('total_cost'),
  generationTime: integer('generation_time'),
  latency: integer('latency'),
  rawContent: text('raw_content'),
  parsedContent: text('parsed_content'),
  error: integer('error', { mode: 'boolean' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const rhymeBattleRelations = relations(rhymeBattlesTable, ({ one, many }) => ({
  instagramProfile: one(instagramProfilesTable),
  instagramPosts: many(instagramPostsTable),
}))

export const instagramProfilesRelations = relations(instagramProfilesTable, ({ one, many }) => ({
  rhymeBattle: one(rhymeBattlesTable, {
    fields: [instagramProfilesTable.rhymeBattleId],
    references: [rhymeBattlesTable.id],
  }),
  posts: many(instagramPostsTable),
}))

export const instagramPostsRelations = relations(instagramPostsTable, ({ one, many }) => ({
  rhymeBattle: one(rhymeBattlesTable, {
    fields: [instagramPostsTable.rhymeBattleId],
    references: [rhymeBattlesTable.id],
  }),
  instagramProfile: one(instagramProfilesTable, {
    fields: [instagramPostsTable.instagramProfileId],
    references: [instagramProfilesTable.id],
  }),
  analyses: many(postAnalysesTable),
}))

export const postAnalysesRelations = relations(postAnalysesTable, ({ one }) => ({
  instagramPost: one(instagramPostsTable, {
    fields: [postAnalysesTable.instagramPostId],
    references: [instagramPostsTable.id],
  }),
}))
