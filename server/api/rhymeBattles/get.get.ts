import { isNull } from 'drizzle-orm'
import * as v from 'valibot'
import { rhymeBattlesTable } from '~/server/database/schema'

const rhymeBatleQuerySchema = v.object({
  id: v.string('id is required'),
})

function validateQuery(data: unknown) {
  return v.safeParse(rhymeBatleQuerySchema, data)
}

export default defineEventHandler(
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
      where: isNull(rhymeBattlesTable.deletedAt),
      columns: {
        deletedAt: false,
      },
      with: {
        instagramProfiles: true,
      },
    })
    if (!battle) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
      })
    }
    return battle
  },
)
