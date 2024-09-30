import { randomUUID } from 'node:crypto'
import * as v from 'valibot'
import { rhymeBattleTable } from '~/server/database/schema'

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
    const [{ id }] = await db.insert(rhymeBattleTable)
      .values({
        id: randomUUID(),
        ...parsed.output,
      })
      .returning({
        id: rhymeBattleTable.id,
      })
    setResponseStatus(event, 200)
    return { ...parsed.output, id }
  },
)
