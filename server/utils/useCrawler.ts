import type { PlaywrightRequestHandler } from 'crawlee'
import { BrowserName, DeviceCategory, PlaywrightCrawler } from 'crawlee'
import { useInstagramCookies } from './useInstagramCookies'

interface UseCrawlerParams {
  requestHandler: PlaywrightRequestHandler
}

export function useCrawler({ requestHandler }: UseCrawlerParams) {
  const crawler = new PlaywrightCrawler({
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
        const cookies = useInstagramCookies()
        await page.context().addCookies(cookies)
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
