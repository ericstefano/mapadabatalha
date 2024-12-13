import type { ScrapedInstagramPost } from '~/types/apify'
import { DOWNLOAD_ASSET_HANDLER_LABEL, useRouter } from '@/server/utils/useRouter'
import { parseISO } from 'date-fns'
import { createError } from 'h3'
import * as v from 'valibot'
import { instagramPostsTable } from '~/server/database/schema'
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

    // const requestQueue = await useRequestQueue({
    //   queueIdOrName: `${crypto.getRandomValues(new Uint32Array(1))[0]}`, // Bugs when not generating a queue with an unique ID
    // })

    // const { instagramPassword, instagramAccount } = useRuntimeConfig(event)
    // if (!instagramAccount) {
    //   throw new Error('Missing \'NUXT_INSTAGRAM_ACCOUNT \' in .env')
    // }
    // if (!instagramPassword) {
    //   throw new Error('Missing \'NUXT_INSTAGRAM_PASSWORD \' in .env')
    // }

    // await requestQueue.addRequest({
    //   url: INSTAGRAM_BASE_URL,
    //   label: GET_FROM_RESPONSE_HANDLER_LABEl,
    //   userData: {
    //     account: instagramAccount,
    //     password: instagramPassword,
    //     profileId: instagramProfile.id,
    //     battleId: instagramProfile.rhymeBattleId,
    //     profileUsername: instagramProfile.username,
    //     scrollSecs: parsedQueryParams.output.scrollSecs,
    //     postIds,
    //   },
    // })

    // const storage = useStorage('images')
    // const requestHandler = useRouter({ db, storage })
    // const crawler = useCrawler({ requestHandler, requestQueue })

    // try {
    //   await crawler.run()
    // }
    // catch (error) {
    //   if (!(error instanceof Error)) {
    //     throw createError({
    //       statusCode: 500,
    //       statusMessage: 'Internal Server Error',
    //       message: 'Unknown error.',
    //     })
    //   }

    //   if (error.message.includes(ERR_TOO_MANY_REDIRECTS)) {
    //     throw createError({
    //       statusCode: 401,
    //       statusMessage: 'Unauthorized',
    //       message: `${error.message}: the cookies may be expired or the page doesn't exist.`,
    //     })
    //   }

    //   throw createError({
    //     statusCode: 500,
    //     statusMessage: 'Internal Server Error',
    //     message: error.message,
    //   })
    // }

    const { apifyToken } = useRuntimeConfig()
    const response = await $fetch<ScrapedInstagramPost[]>('https://api.apify.com/v2/acts/apify~instagram-post-scraper/run-sync-get-dataset-items', {
      method: 'POST',
      params: {
        token: apifyToken,
      },
      body: {
        username: [instagramProfile.username],
        resultsLimit: 8,
      },
    })
    const mapped = response.map<typeof instagramPostsTable.$inferInsert & Pick<ScrapedInstagramPost, 'displayUrl'> | undefined>((post) => {
      if (post.type !== 'Image')
        return undefined
      return {
        href: post.url,
        alt: post.alt || post.caption,
        id: post.shortCode,
        displayUrl: post.displayUrl,
        timestamp: parseISO(post.timestamp),
        rhymeBattleId: instagramProfile.rhymeBattleId,
        instagramProfileId: instagramProfile.id,
      }
    })
      .filter(item => item !== undefined && !postIds.includes(item.id))
      .filter(item => item !== undefined)
    const storage = useStorage('images')
    const requestHandler = useRouter({ db, storage })
    const requestQueue = await useRequestQueue({
      queueIdOrName: `${crypto.getRandomValues(new Uint32Array(1))[0]}`, // Bugs when not generating a queue with an unique ID
    })
    for await (const post of mapped) {
      await requestQueue.addRequest({
        skipNavigation: true,
        url: post.displayUrl,
        label: DOWNLOAD_ASSET_HANDLER_LABEL,
        userData: {
          id: post.id,
          battleId: post.rhymeBattleId,
        },
      })
    }
    
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

      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        message: error.message,
      })
    }
    await db.insert(instagramPostsTable).values(mapped)
    return sendNoContent(event)
  },
)
