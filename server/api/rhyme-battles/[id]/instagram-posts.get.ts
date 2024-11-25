import { eq, sql } from 'drizzle-orm'
import { createError } from 'h3'
import * as v from 'valibot'
import { instagramPostsTable, rhymeBattlesTable } from '~/server/database/schema'

const instagramPostsRouterParams = v.object({
  id: v.string('id is required'),
})

function validateRouterParams(data: unknown) {
  return v.safeParse(instagramPostsRouterParams, data)
}

const instagramPostsQueryParams = v.object({
  page: v.pipe(v.optional(v.string('page is required'), '1'), v.transform(Number), v.number('page must be a number'), v.integer('page must be an integer')),
  perPage: v.pipe(v.optional(v.string('limit is required'), '4'), v.transform(Number), v.number('limit must be a number'), v.integer('limit must be an integer')),
})

function validateQueryParams(data: unknown) {
  return v.safeParse(instagramPostsQueryParams, data)
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
    })
    if (!battle) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        message: `The rhyme battle id "${parsedRouterParams.output.id}" was not found.`,
      })
    }

    const [countResult] = await db.select({
      count: sql`count(*)`.mapWith(Number).as('count'),
    }).from(instagramPostsTable).where(eq(instagramPostsTable.rhymeBattleId, parsedRouterParams.output.id))

    const totalPages = Math.ceil(countResult.count / parsedQueryParams.output.perPage)
    if (totalPages !== 0 && parsedQueryParams.output.page > totalPages) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: '\'page\' is greater than total pages',
      })
    }

    const data = await db.query.instagramPostsTable.findMany({
      orderBy: (battles, { desc }) => [desc(battles.timestamp)],
      where: (posts, { eq }) => eq(posts.rhymeBattleId, parsedRouterParams.output.id),
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
