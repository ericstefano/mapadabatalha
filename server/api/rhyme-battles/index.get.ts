import { useDatabase } from '~/server/utils/useDatabase'

export default defineEventHandler(
  async (event) => {
    const db = await useDatabase(event)
    const battles = await db.query.rhymeBattlesTable.findMany()
    return { data: battles }
  },
)
