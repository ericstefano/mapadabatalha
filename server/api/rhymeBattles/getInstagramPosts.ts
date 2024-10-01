import { type RequestOptions, toughCookieToBrowserPoolCookie } from 'crawlee'
import { eq } from 'drizzle-orm'
import * as v from 'valibot'
import { rhymeBattlesTable } from '~/server/database/schema'

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
    const battle = await db.query.rhymeBattlesTable.findFirst({
      where: eq(rhymeBattlesTable.id, parsed.output.id),
      with: {
        instagramPosts: true,
        instagramProfiles: true,
      },
    })
    if (!battle) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
      })
    }
    const storage = useStorage('images')
    const router = useRouter({ db, storage })
    const crawler = useCrawler({ requestHandler: router })
    const postIds = battle.instagramPosts.map(post => post.id)
    const sources: RequestOptions[] = battle.instagramProfiles.map<RequestOptions>(profile => ({
      url: profile.url,
      userData: {
        battleId: battle.id,
        profileId: profile.id,
        profileUsername: profile.username,
        postIds,
      },
    }))
    await crawler.run(sources)

    return await db.query.rhymeBattlesTable.findFirst({
      where: eq(rhymeBattlesTable.id, parsed.output.id),
      with: {
        instagramPosts: true,
      },
    }).then(battle => battle?.instagramPosts)
  },
  {maxAge: 60 * 60}
)
