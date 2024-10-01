import { isNull } from 'drizzle-orm'
import { rhymeBattlesTable } from '~/server/database/schema'

export default defineEventHandler(
  async (event) => {
    const db = await useDatabase(event)
    const battles = await db.query.rhymeBattlesTable.findMany({
      where: isNull(rhymeBattlesTable.deletedAt),
      with: {
        instagramProfiles: true,
      },
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
