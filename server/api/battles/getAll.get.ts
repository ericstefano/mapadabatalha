import { isNull } from 'drizzle-orm'
import { battleTable } from '~/server/database/schema'
import { useDatabase } from '~/server/utils/useDatabase'

export default defineEventHandler(
  async (event) => {
    const db = await useDatabase(event)
    return await db.query.battleTable.findMany({
      where: isNull(battleTable.deletedAt),
    })
  },
)
