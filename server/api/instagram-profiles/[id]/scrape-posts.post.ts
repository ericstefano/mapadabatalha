import { GET_FROM_RESPONSE_HANDLER_LABEl, useRouter } from '@/server/utils/useRouter'
import { createError } from 'h3'
import * as v from 'valibot'
import { INSTAGRAM_BASE_URL } from '~/constants'
import { ERR_TOO_MANY_REDIRECTS } from '~/constants/errors'
import { useCrawler } from '~/server/utils/useCrawler'
import { useDatabase } from '~/server/utils/useDatabase'
import { useRequestQueue } from '~/server/utils/useRequestQueue'

const scrapePostsRouterParams = v.object({
  id: v.string('id is required'),
})

function validateRouterParams(data: unknown) {
  return v.safeParse(scrapePostsRouterParams, data)
}

const scrapePostsQueryParams = v.object({
  scrollSecs: v.optional(v.pipe(v.string(), v.transform(Number), v.integer()), '1'),
})

function validateQueryParams(data: unknown) {
  return v.safeParse(scrapePostsQueryParams, data)
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

    const parsedQueryParams = await getValidatedQuery(event, validateQueryParams)
    if (!parsedQueryParams.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: parsedQueryParams.issues.map(issue => issue.message).join(', '),
      })
    }

    const db = await useDatabase(event)

    const instagramProfile = await db.query.instagramProfilesTable.findFirst({
      where: (profiles, { eq }) => (eq(profiles.id, parsedRouterParams.output.id)),
    })
    if (!instagramProfile) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        message: `The instagram profile id "${parsedRouterParams.output.id}" was not found.`,
      })
    }

    const instagramPosts = await db.query.instagramPostsTable.findMany({ columns: { id: true } })

    const postIds = instagramPosts.map(post => post.id)

    const requestQueue = await useRequestQueue({
      queueIdOrName: `${crypto.getRandomValues(new Uint32Array(1))[0]}`, // Bugs when not generating a queue with an unique ID
    })

    const { instagramPassword, instagramAccount } = useRuntimeConfig(event)
    if (!instagramAccount) {
      throw new Error('Missing \'NUXT_INSTAGRAM_ACCOUNT \' in .env')
    }
    if (!instagramPassword) {
      throw new Error('Missing \'NUXT_INSTAGRAM_PASSWORD \' in .env')
    }

    await requestQueue.addRequest({
      url: INSTAGRAM_BASE_URL,
      label: GET_FROM_RESPONSE_HANDLER_LABEl,
      userData: {
        account: instagramAccount,
        password: instagramPassword,
        profileId: instagramProfile.id,
        battleId: instagramProfile.rhymeBattleId,
        profileUsername: instagramProfile.username,
        scrollSecs: parsedQueryParams.output.scrollSecs,
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
