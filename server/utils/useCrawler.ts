import type { PlaywrightRequestHandler } from 'crawlee'
import { BrowserName, DeviceCategory, PlaywrightCrawler, RequestList } from 'crawlee'
import { INSTAGRAM_BASE_URL } from '~/constants'
import { useInstagramCookies } from './useInstagramCookies'

interface UseCrawlerParams {
  profile: string
  requestHandler: PlaywrightRequestHandler
}

export async function useCrawler({ profile, requestHandler }: UseCrawlerParams) {
  const crawler = new PlaywrightCrawler({
    requestList: await RequestList.open({
      sources: [`${INSTAGRAM_BASE_URL}/${profile}/`],
    }),
    requestHandler,
    maxRequestRetries: 0,
    browserPoolOptions: {
      fingerprintOptions: {
        fingerprintGeneratorOptions: {
          browsers: [BrowserName.chrome, BrowserName.firefox],
          devices: [DeviceCategory.desktop],
          locales: ['pt-BR'],
        },
      },
    },

    preNavigationHooks: [
      async ({ blockRequests, page }) => {
        page.setDefaultTimeout(5000)
        await page.context().addCookies(useInstagramCookies())
        await blockRequests({
          urlPatterns: [
            '.mp4',
            '.webp',
            '.png',
            '.woff2',
            'gtm.js',
            'www.googletagmanager.com',
            'pixel.admaxium.com',
          ],
        })
      },
    ],
    headless: true,
  })
  return crawler
}
