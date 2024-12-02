import type { PointFeature } from 'supercluster'
import type { rhymeBattlesTable } from '~/server/database/schema'
import { useDatabase } from '~/server/utils/useDatabase'

export default defineEventHandler(
  async (event) => {
    const db = await useDatabase(event)
    const battles = await db.query.rhymeBattlesTable.findMany()
    return { data: battles.map<PointFeature<Partial<typeof rhymeBattlesTable.$inferSelect>>>(value => ({
      type: 'Feature',
      properties: {
        name: value.name,
      },
      geometry: {
        type: 'Point',
        coordinates: [
          value.lon,
          value.lat,
        ],
      },
      id: value.id,
    })),
    }
  },
)
