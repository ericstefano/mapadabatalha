export default defineEventHandler(
  async (event) => {
    const db = await useDatabase(event)
    const profiles = await db.query.instagramProfilesTable.findMany()
    return { data: profiles }
  },
)
