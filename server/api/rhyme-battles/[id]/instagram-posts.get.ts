import { eq, sql } from 'drizzle-orm'
import { createError } from 'h3'
import * as v from 'valibot'
import { INSTAGRAM_BASE_URL } from '~/constants'
import { ERR_TOO_MANY_REDIRECTS } from '~/constants/errors'
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

export default defineEventHandler(
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

    const postIds = battle.instagramPosts.map(post => post.id)
    const requestQueue = await useRequestQueue({
      queueIdOrName: `${crypto.getRandomValues(new Uint32Array(1))[0]}`, // Bugging out without generating a queue with unique ID
    })
    battle.instagramProfiles.forEach((profile) => {
      requestQueue.addRequest({
        url: `${INSTAGRAM_BASE_URL}/${profile.username}`,
        userData: {
          battleId: battle.id,
          profileId: profile.id,
          profileUsername: profile.username,
          postIds,
        },
      })
    })
    const storage = useStorage('images')
    const requestHandler = useRouter({ db, storage })
    const crawler = useCrawler({ requestHandler, requestQueue })

    try {
      await crawler.run()
    }
    catch (error) {
      if (error instanceof Error) {
        if (error.message.includes(ERR_TOO_MANY_REDIRECTS)) {
          throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
            message: `${error.message}: the cookies may be expired or the page doesn't exist.`,
          })
        }

        throw createError({
          statusCode: 500,
          statusMessage: 'Internal Server Error',
          message: error.message,
        })
      }

      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        message: 'Unknown error.',
      })
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
)
