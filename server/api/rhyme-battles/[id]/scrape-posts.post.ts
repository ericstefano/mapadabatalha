import { useRouter } from '@/server/utils/useRouter'
import { eq } from 'drizzle-orm'
import { createError } from 'h3'
import * as v from 'valibot'
import { INSTAGRAM_BASE_URL } from '~/constants'
import { ERR_TOO_MANY_REDIRECTS } from '~/constants/errors'
import { rhymeBattlesTable } from '~/server/database/schema'

const rhymeBattleRouterParams = v.object({
  id: v.string('id is required'),
})

function validateRouterParams(data: unknown) {
  return v.safeParse(rhymeBattleRouterParams, data)
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
        instagramPosts: true,
        instagramProfiles: true,
      },
    })
    if (!battle) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
      })
    }

    const postIds = battle.instagramPosts.map(post => post.id)
    const requestQueue = await useRequestQueue({
      queueIdOrName: `${crypto.getRandomValues(new Uint32Array(1))[0]}`, // Bugs when not generating a queue with an unique ID
    })
    battle.instagramProfiles.forEach((profile) => {
      requestQueue.addRequest({
        url: `${INSTAGRAM_BASE_URL}/${profile.username}`,
        userData: {
          battleId: battle.id,
          profileId: profile.id,
          profileUsername: profile.username,
          postIds,
        },
      })
    })
    const storage = useStorage('images')
    const requestHandler = useRouter({ db, storage })
    const crawler = useCrawler({ requestHandler, requestQueue })

    try {
      await crawler.run()
    }
    catch (error) {
      if (!(error instanceof Error)) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Internal Server Error',
          message: 'Unknown error.',
        })
      }

      if (error.message.includes(ERR_TOO_MANY_REDIRECTS)) {
        throw createError({
          statusCode: 401,
          statusMessage: 'Unauthorized',
          message: `${error.message}: the cookies may be expired or the page doesn't exist.`,
        })
      }

      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        message: error.message,
      })
    }
    return sendNoContent(event)
  },
)
