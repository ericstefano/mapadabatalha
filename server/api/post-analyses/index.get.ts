import { useDatabase } from '~/server/utils/useDatabase'

export default defineEventHandler(
  async (event) => {
    const db = await useDatabase(event)
    const analyses = await db.query.postAnalysesTable.findMany()
    return { data: analyses }
  },
)
