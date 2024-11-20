import { createPlaywrightRouter, sleep } from 'crawlee'
import { INSTAGRAM_BASE_URL } from '~/constants'
import { sanitizeId } from '~/utils/id'
import { instagramPostsTable } from '../database/schema'

const DOWNLOAD_ASSETS_HANDLER_LABEL = 'DOWNLOAD_ASSETS'
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

interface DefaultHandlerDictionary {
  postIds: string[]
  profileId: string
  profileUsername: string
  battleId: string
}

interface AssetHandlerUserData {
  id: string
  battleId: string
}

export function useRouter({ db, storage }: UseRouterContext) {
  const router = createPlaywrightRouter()
  router.addDefaultHandler<DefaultHandlerDictionary>(async ({ page, crawler, request }) => {
    const { postIds, profileId, battleId } = request.userData
    const profilePictureLocator = page.locator(LOCATORS.PROFILE_PICTURE).or(page.locator(LOCATORS.ALT_PROFILE_PICTURE)).first()
    const profilePictureSrc = await profilePictureLocator.getAttribute('src')
    await crawler.addRequests([{
      url: profilePictureSrc!,
      skipNavigation: true,
      label: DOWNLOAD_ASSETS_HANDLER_LABEL,
      userData: {
        id: 'profile',
        battleId,
      },
    }])
    const postLocator = page.locator(LOCATORS.IMAGE_POST_ANCHOR)
    await postLocator.first().waitFor()
    const postElements = await postLocator.all()
    const posts = []
    for await (const element of postElements) {
      const href = await element.getAttribute('href')
      if (!href) { return }
      const id = href.replace(/.*\/(reel|p)\/([^/]+).*/, '$2')
      if (postIds.includes(id!)) { return }
      const img = element.locator(LOCATORS.IMAGE)
      const src = await img.getAttribute('src')
      const alt = await img.getAttribute('alt')
      await element.click()
      const description = await page.locator(LOCATORS.POST_DESCRIPTION).textContent({
        timeout: 500,
      }).catch(_error => '')
      const postQuantity = (await page.locator(LOCATORS.CAROUSEL_DOTS).all()).length || 1
      const timestamp = await page.locator(LOCATORS.TIMESTAMP).first().getAttribute('datetime')
      await sleep(200)
      await page.keyboard.press('Escape')
      const post = {
        id,
        href: `${INSTAGRAM_BASE_URL}${href}`,
        alt,
        timestamp: new Date(timestamp!),
        postQuantity,
        description,
        instagramProfileId: profileId,
        rhymeBattleId: battleId,
      }
      posts.push(post)
      await crawler.addRequests([{
        url: src!,
        skipNavigation: true,
        userData: {
          id,
          battleId,
        },
        label: DOWNLOAD_ASSETS_HANDLER_LABEL,
      }])
    }
    await db.insert(instagramPostsTable).values(posts)
  })

  router.addHandler<AssetHandlerUserData>(DOWNLOAD_ASSETS_HANDLER_LABEL, async ({ request, sendRequest }) => {
    if (request.skipNavigation) {
      const response = await sendRequest()
      const body = response.rawBody

      await storage.setItemRaw(`${request.userData.battleId}:${sanitizeId(request.userData.id)}.jpeg`, body)
    }
  })

  return router
}
