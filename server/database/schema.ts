import { relations } from 'drizzle-orm'
import { integer, pgTable, real, text, timestamp } from 'drizzle-orm/pg-core'

export const rhymeBattlesTable = pgTable('rhyme_battles', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  lat: real('lat').notNull(),
  lon: real('lon').notNull(),
  createdAt: timestamp('created_at', { mode: 'string', withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string', withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { mode: 'string', withTimezone: true }),
})

export const instagramProfilesTable = pgTable('instagram_profiles', {
  id: text('id').primaryKey(),
  rhymeBattleId: text('rhyme_battle_id').notNull(),
  username: text('username').notNull(),
  url: text('url').notNull(),
  createdAt: timestamp('created_at', { mode: 'string', withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string', withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { mode: 'string', withTimezone: true }),
})

export const instagramPostsTable = pgTable('instagram_posts', {
  id: text('id').primaryKey(),
  instagramProfileId: text('instagram_profile_id').notNull(),
  rhymeBattleId: text('rhyme_battle_id').notNull(),
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

export const postAnalysesTable = pgTable('post_analyses', {
  id: text('id').primaryKey(),
  instagramPostId: text('instagram_post_id').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { mode: 'string', withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'string', withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { mode: 'string', withTimezone: true }),
})

export const rhymeBattleRelations = relations(rhymeBattlesTable, ({ many }) => ({
  instagramProfiles: many(instagramProfilesTable),
  instagramPosts: many(instagramPostsTable),
  postAnalyses: many(postAnalysesTable),
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
  analyses: many(postAnalysesTable),
  // instagramProfile: one(instagramProfilesTable, {
  //   fields: [instagramPostsTable.instagramProfileId],
  //   references: [instagramProfilesTable.id],
  // }),

}))

// export const postAnalysesRelations = relations(postAnalysesTable, ({ one }) => ({
//   instagramPost: one(instagramPostsTable, {
//     fields: [postAnalysesTable.instagramPostId],
//     references: [instagramPostsTable.id],
//   }),
// }))
