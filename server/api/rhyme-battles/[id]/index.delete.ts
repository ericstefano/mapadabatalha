import { eq } from 'drizzle-orm'
import * as v from 'valibot'
import { rhymeBattlesTable } from '~/server/database/schema'
import { useDatabase } from '~/server/utils/useDatabase'

const rhymeBattleRouterParams = v.object({
  id: v.string('id is required'),
})

function validateRouterParams(data: unknown) {
  return v.safeParse(rhymeBattleRouterParams, data)
}

export default defineEventHandler(
  async (event) => {
    const parsed = await getValidatedRouterParams(event, validateRouterParams)
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
    })
    if (!battle) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        message: `The rhyme battle id "${parsed.output.id}" was not found.`,
      })
    }
    await db.delete(rhymeBattlesTable).where(eq(rhymeBattlesTable.id, parsed.output.id))
    return {
      success: true,
    }
  },
)
