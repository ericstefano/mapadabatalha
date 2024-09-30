import { eq } from 'drizzle-orm'
import * as v from 'valibot'
import { instagramPostsTable, rhymeBattleTable } from '~/server/database/schema'

const instagramPostsQuerySchema = v.object({
  id: v.string('id is required'),
})

function validateQuery(data: unknown) {
  return v.safeParse(instagramPostsQuerySchema, data)
}

export default defineCachedEventHandler(
  async (event) => {
    const parsed = await getValidatedQuery(event, validateQuery)
    if (!parsed.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: parsed.issues.map(issue => issue.message).join(', '),
      })
    }
    const db = await useDatabase(event)
    const battle = await db.query.rhymeBattleTable.findFirst({
      where: eq(rhymeBattleTable.id, parsed.output.id),
    })
    if (!battle) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
      })
    }
    const storedPosts = await db.query.instagramPostsTable.findMany({
      columns: {
        id: true,
      },
      where: eq(instagramPostsTable.rhymeBattleId, battle.id),
    })
    const postIds = storedPosts.map(post => post.id)
    const router = useRouter({ profile: battle.instagram, rhymeBattleId: battle.id, postIds, db })
    const crawler = await useCrawler({ profile: battle.instagram, requestHandler: router })
    await crawler.run()
    return db.query.instagramPostsTable.findMany({
      columns: {
        rhymeBattleId: false,
      },
      where: eq(instagramPostsTable.rhymeBattleId, battle.id),
    })
  },
  { maxAge: 60 * 60 },
)
