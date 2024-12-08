import process from 'node:process'
import { APP_DESCRIPTION } from './constants/index'

export default defineNuxtConfig({
  modules: [
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/fonts',
    '@nuxt/eslint',
    '@nuxt/test-utils/module',
    '@nuxtjs/tailwindcss',
    'shadcn-nuxt',
    '@nuxtjs/color-mode',
    '@vueuse/nuxt',
  ],

  ssr: true,

  shadcn: {
    prefix: '',
    componentDir: './components/Shadcn',
  },

  fonts: {
    defaults: {
      weights: [300, 400, 500, 600, 700],
      styles: ['normal', 'italic'],
      subsets: [
        'latin-ext',
        'latin',
      ],
    },
    families: [
      { name: 'Mulish', provider: 'google' },
    ],
  },

  runtimeConfig: {
    instagramCookieString: process.env.NUXT_INSTAGRAM_COOKIE_STRING,
    tursoConnectionUrl: process.env.NUXT_TURSO_CONNECTION_URL,
    tursoAuthToken: process.env.NUXT_TURSO_AUTH_TOKEN,
    openRouterAuthToken: process.env.NUXT_OPEN_ROUTER_AUTH_TOKEN,
    instagramAccount: process.env.NUXT_INSTAGRAM_ACCOUNT,
    instagramPassword: process.env.NUXT_INSTAGRAM_PASSWORD,
    apifyToken: process.env.NUXT_APIFY_TOKEN,
    public: {
      maptilerToken: process.env.NUXT_PUBLIC_MAPTILER_TOKEN, // Maybe create a proxy endpoint in /server since this key is needed in frontend and will be exposed
    },
  },

  app: {
    rootId: 'app', // Hide __nuxt id
    rootTag: 'main',

    head: {
      viewport: 'width=device-width,initial-scale=1',
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
        { rel: 'icon', href: '/nuxt.svg', type: 'image/svg+xml' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: APP_DESCRIPTION },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      ],
    },
  },

  experimental: {
    // when using generate, payload js assets included in sw precache manifest
    // but missing on offline, disabling extraction it until fixed
    payloadExtraction: false,
    renderJsonPayloads: true,
    typedPages: true,
  },

  nitro: {
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
    storage: {
      images: {
        driver: 'fs',
        base: './public/',
      },
    },
    experimental: {
      tasks: true,
    },
    scheduledTasks: {
      '* * * * *': ['scheduled:test'],
    },
  },

  colorMode: {
    preference: 'system',
    classSuffix: '',
  },

  components: true,

  devtools: {
    enabled: true,
  },

  eslint: {
    config: {
      standalone: false,
    },
  },

  icon: {
    mode: 'svg',
  },

  compatibilityDate: '2024-08-17',
})
