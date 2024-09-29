import { randomUUID } from 'node:crypto'
import * as v from 'valibot'
import { battleTable } from '~/server/database/schema'
import { useDatabase } from '~/server/utils/useDatabase'

const createBattleSchema = v.object({
  name: v.string('name is required'),
  instagram: v.string('instagram is required'),
  lat: v.number('lat is required'),
  lon: v.number('lon is required'),
})

function validateBattle(data: unknown) {
  return v.safeParse(createBattleSchema, data)
}

export default defineEventHandler(
  async (event) => {
    const parsed = await readValidatedBody(event, validateBattle)
    if (!parsed.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: parsed.issues.map(issue => issue.message).join(', '),
      })
    }
    const db = await useDatabase(event)
    const [{ id }] = await db.insert(battleTable)
      .values({
        id: randomUUID(),
        updatedAt: new Date(),
        createdAt: new Date(),
        ...parsed.output,
      })
      .returning({
        id: battleTable.id,
      })
    setResponseStatus(event, 200)
    return { ...parsed.output, id }
  },
)
