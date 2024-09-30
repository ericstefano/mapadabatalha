import type { PointFeature } from 'supercluster'
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
    return battles.map<PointFeature<Partial<typeof rhymeBattleTable.$inferSelect>>>(value => ({
      type: 'Feature',
      properties: {
        name: value.name,
        instagram: value.instagram,
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
