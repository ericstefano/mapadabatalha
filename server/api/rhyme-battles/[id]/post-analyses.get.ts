import { sql } from 'drizzle-orm'
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
    const combinedAnalyses = await db.query.postAnalysesTable.findMany({
      where: (analyses, { eq }) => eq(analyses.rhymeBattleId, parsed.output.id),
      with: {
        instagramPost: true,
      },
      extras: table => ({
        totalCost: sql`${table.totalCost} 
        + (SELECT total_cost FROM post_identifications WHERE rhyme_battle_id = ${parsed.output.id})`.as('totalCost'),
      }),
    })

    const sortedAnalyses = combinedAnalyses.sort((a, b) =>
      b.instagramPost.timestamp.getTime() - a.instagramPost.timestamp.getTime(),
    )

    return { data: sortedAnalyses }
  },
)
