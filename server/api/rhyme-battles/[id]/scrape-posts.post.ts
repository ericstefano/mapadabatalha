import { SCRAPE_INSTAGRAM_PROFILE_POSTS_HANDLER_LABEL, useRouter } from '@/server/utils/useRouter'
import { eq } from 'drizzle-orm'
import { createError } from 'h3'
import * as v from 'valibot'
import { INSTAGRAM_BASE_URL } from '~/constants'
import { ERR_TOO_MANY_REDIRECTS } from '~/constants/errors'
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
      with: {
        instagramProfile: true,
      },
    })
    if (!battle) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
      })
    }

    return $fetch(`/api/instagram-profiles/${battle.instagramProfile?.id}/scrape-posts`, {
      method: 'POST',
    })
  },
)
