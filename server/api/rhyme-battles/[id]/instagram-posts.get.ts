import type { RequestOptions } from 'crawlee'
import consola from 'consola'
import { eq, sql } from 'drizzle-orm'
import * as v from 'valibot'
import { INSTAGRAM_BASE_URL } from '~/constants'
import { instagramPostsTable, rhymeBattlesTable } from '~/server/database/schema'

const rhymeBattleRouterParams = v.object({
  id: v.string('id is required'),
})

function validateRouterParams(data: unknown) {
  return v.safeParse(rhymeBattleRouterParams, data)
}

const rhymeBattleQueryParams = v.object({
  page: v.pipe(v.optional(v.string('page is required'), '1'), v.transform(Number), v.number('page must be a number'), v.integer('page must be an integer')),
  perPage: v.pipe(v.optional(v.string('limit is required'), '4'), v.transform(Number), v.number('limit must be a number'), v.integer('limit must be an integer')),
})

function validateQueryParams(data: unknown) {
  return v.safeParse(rhymeBattleQueryParams, data)
}

export default defineCachedEventHandler(
  async (event) => {
    const parsedRouterParams = await getValidatedRouterParams(event, validateRouterParams)
    const parsedQueryParams = await getValidatedQuery(event, validateQueryParams)

    if (!parsedRouterParams.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: parsedRouterParams.issues.map(issue => issue.message).join(', '),
      })
    }
    if (!parsedQueryParams.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: parsedQueryParams.issues.map(issue => issue.message).join(', '),
      })
    }

    const db = await useDatabase(event)
    const battle = await db.query.rhymeBattlesTable.findFirst({
      where: eq(rhymeBattlesTable.id, parsedRouterParams.output.id),
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
      url: `${INSTAGRAM_BASE_URL}/${profile.username}`,
      userData: {
        battleId: battle.id,
        profileId: profile.id,
        profileUsername: profile.username,
        postIds,
      },
    }))
    try {
      await crawler.run(sources)
    }
    catch (e) {
      consola.log(Object.values(e))
      consola.error(e)
    }

    const [countResult] = await db.select({
      count: sql`count(*)`.mapWith(Number).as('count'),
    }).from(instagramPostsTable).where(eq(instagramPostsTable.rhymeBattleId, parsedRouterParams.output.id))

    const totalPages = Math.ceil(countResult.count / parsedQueryParams.output.perPage) || 1
    if (parsedQueryParams.output.page > totalPages) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: '\'page\' is greater than total pages',
      })
    }

    const data = await db.query.instagramPostsTable.findMany({
      where: eq(instagramPostsTable.rhymeBattleId, parsedRouterParams.output.id),
      limit: parsedQueryParams.output.perPage,
      offset: (parsedQueryParams.output.page - 1) * parsedQueryParams.output.perPage,
    })

    return {
      data,
      page: parsedQueryParams.output.page,
      perPage: parsedQueryParams.output.perPage,
      total: countResult.count,
      totalPages,
    }
  },
  // { maxAge: 60 * 60 },
)
