import type { PlaywrightRequestHandler, RequestProvider } from 'crawlee'
import type { PostEdge } from '~/types/instagram'
import { CriticalError, PlaywrightCrawler } from 'crawlee'
import { fromUnixTime } from 'date-fns'
import { chromium } from 'playwright'
import { INSTAGRAM_BASE_URL } from '~/constants'
import { ERR_TOO_MANY_REDIRECTS } from '~/constants/errors'
import { hasProperty } from '~/utils/object'
import { randomBetween } from '~/utils/random'

interface UseCrawlerParams {
  requestHandler: PlaywrightRequestHandler
  requestQueue?: RequestProvider
}

export function useCrawler({ requestHandler, requestQueue }: UseCrawlerParams) {
  const crawler = new PlaywrightCrawler({
    requestHandler,
    requestQueue,
    maxRequestRetries: 0,
    maxConcurrency: 1,
    launchContext: {
      launcher: chromium,
      launchOptions: {
        headless: false,
        geolocation: {
          longitude: -44.013373,
          latitude: -19.7989266,
          accuracy: randomBetween(3, 37),
        },
        locale: 'pt-BR',
        colorScheme: 'dark',
        screen: {
          width: 1920,
          height: 1080,
        },
      },
    },
    persistCookiesPerSession: true,
    async failedRequestHandler(_, error) {
      if (error.message.includes(ERR_TOO_MANY_REDIRECTS)) {
        throw new CriticalError(ERR_TOO_MANY_REDIRECTS)
      }
      throw new CriticalError(error.message)
    },
    preNavigationHooks: [
      async ({ blockRequests, page, useState }) => {
        const state = await useState()
        state.posts = []
        page.on('response', async (response) => {
          const url = response.url()
          if (!url.includes('query'))
            return
          const body = await response.json()
          if (!hasProperty(body, 'data'))
            return
          if (!hasProperty(body.data, 'xdt_api__v1__feed__user_timeline_graphql_connection'))
            return
          if (!hasProperty(body.data.xdt_api__v1__feed__user_timeline_graphql_connection, 'edges'))
            return

          const edges: PostEdge[] = body.data.xdt_api__v1__feed__user_timeline_graphql_connection.edges
          const parsed = edges.map((post) => {
            return {
              id: post.node.code,
              src: post.node.image_versions2.candidates.at(0)?.url || '',
              timestamp: fromUnixTime(post.node.taken_at),
              href: `${INSTAGRAM_BASE_URL}/p/${post.node.code}`,
              alt: post.node.accessibility_caption,
            }
          })
          state.posts = [...state.posts, ...parsed]
          // const cookies = useInstagramCookies()
          // await page.context().addCookies(cookies)
        })
        await blockRequests({
          urlPatterns: [
            '.mp4',
            '.woff2',
            '*reels*',

            '.webp',
            '.png',
            '.wasm',
            '.jpg',
            '.jpeg',
            '.avif',
            '.svg',

            // 'gtm.js',
            // 'www.googletagmanager.com',
            // 'pixel.admaxium.com',
          ],
        })
      },
    ],
  })
  return crawler
}
