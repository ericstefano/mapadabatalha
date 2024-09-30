import { isNull } from 'drizzle-orm'
import { rhymeBattleTable } from '~/server/database/schema'

export default defineEventHandler(
  async (event) => {
    const db = await useDatabase(event)
    const battles = await db.query.rhymeBattleTable.findMany({
      where: isNull(rhymeBattleTable.deletedAt),
    })
    if (!battles || !battles.length) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
      })
    }
    return battles
  },
)
