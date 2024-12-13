import { useDatabase } from '~/server/utils/useDatabase'

export default defineEventHandler(
  async (event) => {
    const db = await useDatabase(event)
    const identifications = await db.query.postIndentificationsTable.findMany()
    return { data: identifications }
  },
)
