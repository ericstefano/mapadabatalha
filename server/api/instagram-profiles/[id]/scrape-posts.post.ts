import { SCRAPE_INSTAGRAM_PROFILE_POSTS_HANDLER_LABEL, useRouter } from '@/server/utils/useRouter'
import { createError } from 'h3'
import * as v from 'valibot'
import { INSTAGRAM_BASE_URL } from '~/constants'
import { ERR_TOO_MANY_REDIRECTS } from '~/constants/errors'

const scrapePostsRouterParams = v.object({
  id: v.string('id is required'),
})

function validateRouterParams(data: unknown) {
  return v.safeParse(scrapePostsRouterParams, data)
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

    const instagramProfile = await db.query.instagramProfilesTable.findFirst({
      where: (profiles, { eq }) => (eq(profiles.id, parsed.output.id)),
    })
    if (!instagramProfile) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        message: `The instagram profile id "${parsed.output.id}" was not found.`,
      })
    }

    const instagramPosts = await db.query.instagramPostsTable.findMany({
      where: (posts, { eq }) => eq(posts.instagramProfileId, parsed.output.id),
    })

    const postIds = instagramPosts.map(post => post.id)

    const requestQueue = await useRequestQueue({
      queueIdOrName: `${crypto.getRandomValues(new Uint32Array(1))[0]}`, // Bugs when not generating a queue with an unique ID
    })

    requestQueue.addRequest({
      url: `${INSTAGRAM_BASE_URL}/${instagramProfile.username}`,
      label: SCRAPE_INSTAGRAM_PROFILE_POSTS_HANDLER_LABEL,
      userData: {
        battleId: instagramProfile.rhymeBattleId,
        profileId: instagramProfile.id,
        profileUsername: instagramProfile.username,
        postIds,
      },
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
