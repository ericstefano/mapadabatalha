import {
  asc,
  eq,
  min,
  sql,
} from 'drizzle-orm'
import { instagramPostsTable, instagramProfilesTable, postAnalysesTable, rhymeBattlesTable } from '../database/schema'
import { useDatabase } from '../utils/useDatabase'

export default defineEventHandler(async (event) => {
  const db = await useDatabase(event)

  const [leastAnalyzedRhymeBattleWithProfile] = await db
    .select({
      rhymeBattle: {
        id: rhymeBattlesTable.id,
        name: rhymeBattlesTable.name,
        lat: rhymeBattlesTable.lat,
        lon: rhymeBattlesTable.lon,
      },
      profile: {
        id: instagramProfilesTable.id,
        username: instagramProfilesTable.username,
      },
      stats: {
        totalPosts: sql<number>`COUNT(DISTINCT ${instagramPostsTable.id})`.as('total_posts'),
        analyzedPosts: sql<number>`COUNT(DISTINCT CASE WHEN ${postAnalysesTable.id} IS NOT NULL THEN ${instagramPostsTable.id} END)`.as('analyzed_posts'),
        oldestAnalysisTimestamp: min(postAnalysesTable.createdAt).as('oldest_analysis'),
      },
    })
    .from(rhymeBattlesTable)
    .leftJoin(instagramProfilesTable, eq(rhymeBattlesTable.id, instagramProfilesTable.rhymeBattleId))
    .leftJoin(instagramPostsTable, eq(rhymeBattlesTable.id, instagramPostsTable.rhymeBattleId))
    .leftJoin(postAnalysesTable, eq(instagramPostsTable.id, postAnalysesTable.instagramPostId))
    .groupBy(
      rhymeBattlesTable.id,
      rhymeBattlesTable.name,
      rhymeBattlesTable.lat,
      rhymeBattlesTable.lon,
      instagramProfilesTable.id,
      instagramProfilesTable.username,
    )
    .orderBy(
      asc(sql`total_posts`),
      asc(sql`analyzed_posts`),
      asc(sql`oldest_analysis`),
    )
    .limit(1)
  await $fetch(`/api/instagram-profiles/${leastAnalyzedRhymeBattleWithProfile.profile?.id}/scrape-posts`, { method: 'POST' })
  await $fetch(`/api/instagram-profiles/${leastAnalyzedRhymeBattleWithProfile.profile?.id}/identify-posts`, { method: 'POST' })
  await $fetch(`/api/instagram-profiles/${leastAnalyzedRhymeBattleWithProfile.profile?.id}/analyse-posts`, { method: 'POST' })
  return {
    success: true,
  }
})
