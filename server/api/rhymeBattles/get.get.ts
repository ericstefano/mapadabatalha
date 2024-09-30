import { isNull } from 'drizzle-orm'
import * as v from 'valibot'
import { rhymeBattleTable } from '~/server/database/schema'

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
    const battle = await db.query.rhymeBattleTable.findFirst({
      where: isNull(rhymeBattleTable.deletedAt),
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
