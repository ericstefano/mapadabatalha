import * as v from 'valibot'

const rhymeBattleRouterParams = v.object({
  id: v.string('id is required'),
})

function validateRouterParams(data: unknown) {
  return v.safeParse(rhymeBattleRouterParams, data)
}
export default defineEventHandler(
  async (event) => {
    const parsed = await getValidatedRouterParams(event, validateRouterParams)
    if (!parsed.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: parsed.issues.map(issue => issue.message).join(', '),
      })
    }
    const db = await useDatabase(event)
    return db.query.postAnalysesTable.findMany({
      where: (analyses, { eq }) => eq(analyses.rhymeBattleId, parsed.output.id),
    })
  },
)
