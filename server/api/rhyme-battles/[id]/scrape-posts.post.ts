import { eq } from 'drizzle-orm'
import { createError } from 'h3'
import * as v from 'valibot'
import { rhymeBattlesTable } from '~/server/database/schema'

const scrapePostsRouterParams = v.object({
  id: v.string('id is required'),
})

function validateRouterParams(data: unknown) {
  return v.safeParse(scrapePostsRouterParams, data)
}

export default defineEventHandler(
  async (event) => {
    const parsedRouterParams = await getValidatedRouterParams(event, validateRouterParams)

    if (!parsedRouterParams.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: parsedRouterParams.issues.map(issue => issue.message).join(', '),
      })
    }

    const db = await useDatabase(event)
    const battle = await db.query.rhymeBattlesTable.findFirst({
      where: eq(rhymeBattlesTable.id, parsedRouterParams.output.id),
    })
    if (!battle) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        message: `The rhyme battle id "${parsedRouterParams.output.id}" was not found.`,
      })
    }

    const instagramProfile = await db.query.instagramProfilesTable.findFirst({
      where: (profiles, { eq }) => (eq(profiles.rhymeBattleId, battle.id)),
    })
    if (!instagramProfile) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        message: `The instagram profile id "${parsedRouterParams.output.id}" was not found.`,
      })
    }

    await $fetch(`/api/instagram-profiles/${instagramProfile.id}/scrape-posts`, {
      method: 'POST',
    })
    return sendNoContent(event)
  },
)
