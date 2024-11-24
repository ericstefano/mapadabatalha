export default defineEventHandler(
  async (event) => {
    const db = await useDatabase(event)
    const posts = await db.query.instagramPostsTable.findMany()
    return { data: posts }
  },
)
