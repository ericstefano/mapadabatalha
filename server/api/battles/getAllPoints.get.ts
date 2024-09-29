import type { PointFeature } from 'supercluster'
import { isNull } from 'drizzle-orm'
import { battleTable } from '~/server/database/schema'
import { useDatabase } from '~/server/utils/useDatabase'

export default defineEventHandler(
  async (event) => {
    const db = await useDatabase(event)
    const battles = await db.query.battleTable.findMany({
      where: isNull(battleTable.deletedAt),
    })
    return battles.map<PointFeature<Partial<typeof battleTable.$inferSelect>>>(value => ({
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
