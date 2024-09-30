import { createPlaywrightRouter, sleep } from 'crawlee'
import { INSTAGRAM_BASE_URL } from '~/constants'
import { instagramPostsTable } from '../database/schema'

export const DOWNLOAD_ASSETS_HANDLER_LABEL = 'DOWNLOAD_ASSETS'
export const IMAGE_POST_ANCHOR_LOCATOR = 'a[href^="/p/"]'
export const IMAGE_LOCATOR = 'img.xu96u03'
export const TIMESTAMP_LOCATOR = 'span time'
export const CAROUSEL_DOTS_LOCATOR = 'article ._acnb'
export const POST_DESCRIPTION_LOCATOR = 'li h1'
export const PROFILE_PICTURE_LOCATOR = 'canvas + span img'
export const ALT_PROFILE_PICTURE_LOCATOR = 'div a img'

interface UseRouterParams {
  profile: string
  rhymeBattleId: string
  postIds: string[]
  db: Awaited<ReturnType<typeof useDatabase>>
}

export function useRouter({ profile, rhymeBattleId, postIds, db }: UseRouterParams) {
  const router = createPlaywrightRouter()
  router.addDefaultHandler(async ({ page, crawler }) => {
    const profilePictureLocator = page.locator(PROFILE_PICTURE_LOCATOR).or(page.locator(ALT_PROFILE_PICTURE_LOCATOR)).first()
    const profilePictureSrc = await profilePictureLocator.getAttribute('src')
    await crawler.addRequests([{
      url: profilePictureSrc!,
      skipNavigation: true,
      label: DOWNLOAD_ASSETS_HANDLER_LABEL,
      userData: {
        id: 'profile',
      },
    }])
    const postLocator = page.locator(IMAGE_POST_ANCHOR_LOCATOR)
    await postLocator.first().waitFor()
    const postElements = await postLocator.all()
    const posts = []
    for await (const element of postElements) {
      const href = await element.getAttribute('href')
      const id = href?.replace(/\/reel\/|\/p\/|\//g, '')
      if (postIds.includes(id!)) { return }
      const img = element.locator(IMAGE_LOCATOR)
      const src = await img.getAttribute('src')
      const alt = await img.getAttribute('alt')
      await element.click()
      const description = await page.locator(POST_DESCRIPTION_LOCATOR).textContent({
        timeout: 500,
      }).catch(_error => '')
      const postQuantity = (await page.locator(CAROUSEL_DOTS_LOCATOR).all()).length || 1
      const timestamp = await page.locator(TIMESTAMP_LOCATOR).first().getAttribute('datetime')
      await sleep(200)
      await page.keyboard.press('Escape')
      const post = {
        id,
        href: `${INSTAGRAM_BASE_URL}${href}`,
        src,
        alt,
        timestamp,
        postQuantity,
        description,
        rhymeBattleId,
      }
      posts.push(post)
      await crawler.addRequests([{
        url: src!,
        skipNavigation: true,
        userData: {
          id,
        },
        label: DOWNLOAD_ASSETS_HANDLER_LABEL,
      }])
    }
    await db.insert(instagramPostsTable).values(posts)
  })

  router.addHandler(DOWNLOAD_ASSETS_HANDLER_LABEL, async ({ request, sendRequest, getKeyValueStore }) => {
    const imageStore = await getKeyValueStore(`${profile}/images`)
    if (request.skipNavigation) {
      const response = await sendRequest()
      const body = response.rawBody
      const contentType = response.headers['content-type']
      return imageStore.setValue(request.userData.id, body, {
        contentType,
      })
    }
  })

  return router
}
