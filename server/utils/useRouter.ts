import type { useDatabase } from './useDatabase'
import { createPlaywrightRouter } from 'crawlee'
import { INSTAGRAM_BASE_URL } from '~/constants'
import { sanitizeId } from '~/utils/id'
import { instagramPostsTable } from '../database/schema'

export const LOGIN_HANDLER_LABEL = 'LOGIN'
export const GET_FROM_RESPONSE_HANDLER_LABEl = 'GET_FROM_RESPONSE'
export const SCROLL_PAGE_IN_TIME_HANDLER_LABEL = 'SCROLL_PAGE_IN_TIME'
export const SCRAPE_INSTAGRAM_PROFILE_POSTS_HANDLER_LABEL = 'SCRAPE_POSTS'
export const DOWNLOAD_ASSET_HANDLER_LABEL = 'DOWNLOAD_ASSET'
export const GET_PROFILE_PICTURE_HANDLER_LABEL = 'GET_PROFILE_PICTURE'
const LOCATORS = {
  IMAGE_POST_ANCHOR: 'a[href*="/p/"]',
  IMAGE: 'img',
  TIMESTAMP: 'span time',
  CAROUSEL_DOTS: 'article ._acnb',
  POST_DESCRIPTION: 'li h1',
  PROFILE_PICTURE: 'canvas + span img',
  ALT_PROFILE_PICTURE: 'div a img',
}
interface UseRouterContext {
  db: Awaited<ReturnType<typeof useDatabase>>
  storage: ReturnType<typeof useStorage>
}

interface StateDictionary {
  posts: (typeof instagramPostsTable.$inferSelect & { src: string })[]
}

export function useRouter({ db, storage }: UseRouterContext) {
  const router = createPlaywrightRouter()

  router.addHandler(GET_FROM_RESPONSE_HANDLER_LABEl, async ({ page, request, crawler, infiniteScroll, useState }) => {
    const { account, password, postIds, profileUsername, profileId, battleId, scrollSecs = 1 } = request.userData
    const state = await useState<StateDictionary>()
    await page.locator('input[name="username"]').waitFor()
    await page.locator('input[name="username"]').fill(account)
    await page.locator('input[name="password"]').fill(password)
    await page.locator('button > div', {
      hasText: 'Entrar',
    }).first().click()
    try {
      await page.locator('div[role="button"]', {
        hasText: /ignorar/i,
      }).first().waitFor({
        timeout: 2999,
      })
      await page.locator('div[role="button"]', {
        hasText: /ignorar/i,
      }).first().click({
        timeout: 1,
      })
    }
    catch {}

    try {
      await page.locator('div[role="button"]', {
        hasText: /agora/i,
      }).waitFor({
        timeout: 2999,
      })
      await page.locator('div[role="button"]', {
        hasText: /agora/i,
      }).click({
        timeout: 1,
      })
    }
    catch {}

    await page.goto(`${INSTAGRAM_BASE_URL}/${profileUsername}`)
    const postLocator = page.locator(LOCATORS.IMAGE_POST_ANCHOR)
    await postLocator.first().waitFor()

    await infiniteScroll({
      timeoutSecs: scrollSecs,
    })

    const parsed = state.posts.map(post => ({
      ...post,
      rhymeBattleId: battleId,
      instagramProfileId: profileId,
    }))

    const filtered = parsed.filter(
      post => !postIds.includes(post.id),
    )

    for await (const post of filtered) {
      await crawler.addRequests([{
        url: post.src,
        skipNavigation: true,
        userData: {
          id: post.id,
          battleId: post.rhymeBattleId,
        },
        label: DOWNLOAD_ASSET_HANDLER_LABEL,
      }])
    }

    await db.insert(instagramPostsTable).values(filtered)
  })

  router.addHandler(DOWNLOAD_ASSET_HANDLER_LABEL, async ({ request, sendRequest }) => {
    if (request.skipNavigation) {
      const response = await sendRequest()
      const body = response.rawBody
      await storage.setItemRaw(`${request.userData.battleId}:${sanitizeId(request.userData.id)}.jpeg`, body)
    }
  })

  return router
}
