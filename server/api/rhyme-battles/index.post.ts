import { randomUUID } from 'node:crypto'
import * as v from 'valibot'
import { instagramProfilesTable, rhymeBattlesTable } from '~/server/database/schema'

const rhymeBattleBodySchema = v.object({
  name: v.string('name is required'),
  instagram: v.string('instagram is required'),
  lat: v.number('lat is required'),
  lon: v.number('lon is required'),
})

function validateBody(data: unknown) {
  return v.safeParse(rhymeBattleBodySchema, data)
}

export default defineEventHandler(
  async (event) => {
    const parsed = await readValidatedBody(event, validateBody)
    if (!parsed.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: parsed.issues.map(issue => issue.message).join(', '),
      })
    }
    const db = await useDatabase(event)
    const [battle] = await db.insert(rhymeBattlesTable)
      .values({
        id: randomUUID(),
        ...parsed.output,
      })
      .returning({
        id: rhymeBattlesTable.id,
        lat: rhymeBattlesTable.lat,
        lon: rhymeBattlesTable.lat,
        name: rhymeBattlesTable.name,
      })

    await db.insert(instagramProfilesTable).values({
      id: randomUUID(),
      username: parsed.output.instagram,
      rhymeBattleId: battle.id,
    }).returning()

    return battle
  },
)
