import type { DeviceCategory, PlaywrightRequestHandler, RequestProvider } from 'crawlee'
import { BrowserName, CriticalError, OperatingSystemsName, PlaywrightCrawler } from 'crawlee'
import { ERR_TOO_MANY_REDIRECTS } from '~/constants/errors'
import { useInstagramCookies } from './useInstagramCookies'

interface UseCrawlerParams {
  requestHandler: PlaywrightRequestHandler
  requestQueue?: RequestProvider
}

export function useCrawler({ requestHandler, requestQueue }: UseCrawlerParams) {
  const crawler = new PlaywrightCrawler({
    requestHandler,
    requestQueue,
    maxRequestRetries: 0,
    browserPoolOptions: {
      fingerprintOptions: {
        fingerprintGeneratorOptions: {
          browsers: [BrowserName.firefox],
          devices: ['desktop' as DeviceCategory],
          locales: ['pt-BR'],
          operatingSystems: [OperatingSystemsName.windows, OperatingSystemsName.macos, OperatingSystemsName.linux, OperatingSystemsName.android],
        },
      },
    },
    async failedRequestHandler(_, error) {
      if (error.message.includes(ERR_TOO_MANY_REDIRECTS)) {
        throw new CriticalError(ERR_TOO_MANY_REDIRECTS)
      }
      throw new CriticalError(error.message)
    },
    preNavigationHooks: [
      async ({ blockRequests, page }) => {
        page.setDefaultTimeout(5000)
        const cookies = useInstagramCookies()
        await page.context().addCookies(cookies)
        await blockRequests({
          urlPatterns: [
            '.mp4',
            '.webp',
            '.jpg',
            '.png',
            '.wasm',
            '.woff2',
            'gtm.js',
            'www.googletagmanager.com',
            'pixel.admaxium.com',
            '*reels*'
          ],
        })
      },
    ],
    headless: true,
  })
  return crawler
}
