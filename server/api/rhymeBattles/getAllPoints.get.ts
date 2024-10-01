import type { PointFeature } from 'supercluster'
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
    return battles.map<PointFeature<Partial<typeof rhymeBattlesTable.$inferSelect>>>(value => ({
      type: 'Feature',
      properties: {
        name: value.name,
        instagramProfiles: value.instagramProfiles,
      },
      geometry: {
        type: 'Point',
        coordinates: [
          value.lon,
          value.lat,
        ],
      },
      id: value.id,
    }))
  },
)
