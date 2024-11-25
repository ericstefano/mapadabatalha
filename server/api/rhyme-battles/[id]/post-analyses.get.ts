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
      // with: {
      //   postIdentifications: true
      // },
      extras: table => ({
        totalCost: sql`${table.totalCost} 
        + (SELECT total_cost FROM post_identifications WHERE rhyme_battle_id = ${parsed.output.id})`.as('totalCost'),
        // nativeTokensPrompt: sql`${table.nativeTokensPrompt}
        // + (SELECT native_tokens_prompt FROM post_identifications WHERE rhyme_battle_id = ${parsed.output.id})`.as('nativeTokensPrompt'),
        // nativeTokensCompletion: sql`${table.nativeTokensCompletion}
        // + (SELECT native_tokens_completion FROM post_identifications WHERE rhyme_battle_id = ${parsed.output.id})`.as('nativeTokensCompletion'),
        // generationTime: sql`${table.generationTime}
        // + (SELECT generation_time FROM post_identifications WHERE rhyme_battle_id = ${parsed.output.id})`.as('generationTime'),
        // latency: sql`${table.latency}
        // + (SELECT latency FROM post_identifications WHERE rhyme_battle_id = ${parsed.output.id})`.as('latency'),
      }),
    })
    return { data: combinedAnalyses }
  },
)
