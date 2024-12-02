import { randomUUID } from 'node:crypto'
import * as v from 'valibot'
import { instagramProfilesTable, rhymeBattlesTable } from '~/server/database/schema'
import { base64ToBuffer } from '~/utils/file'

const rhymeBattleBodySchema = v.object({
  name: v.string('name is required'),
  instagram: v.string('instagram is required'),
  lat: v.number('lat is required'),
  lon: v.number('lon is required'),
  image: v.string('image is required'),
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
    const storage = useStorage('images')
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

    await storage.setItemRaw(`${battle.id}:profile.jpeg`, base64ToBuffer(parsed.output.image))
    return battle
  },
)
