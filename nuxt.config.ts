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
    '@pinia/nuxt',
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
      { name: 'Inter', provider: 'google' },
    ],
  },

  runtimeConfig: {
    dbConnectionString: process.env.NUXT_DB_CONNECTION_STRING,
    instagramCookieString: process.env.NUXT_INSTAGRAM_COOKIE_STRING,
    public: {},
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
        // base: './server/storage/key_value_stores',
        base: './public/posts',
      },
    },
  },

  colorMode: {
    preference: 'system',
    classSuffix: '',
  },

  routeRules: {
    '/**': {
      headers: {
        // 'Content-Security-Policy': 'base-uri \'none\'; default-src \'none\'; connect-src \'self\' https:; font-src \'self\' https: data:; form-action \'self\'; frame-ancestors \'self\'; frame-src \'self\'; img-src \'self\' data:; manifest-src \'self\'; media-src \'self\'; object-src \'none\'; script-src-attr \'none\'; style-src \'self\' https: \'unsafe-inline\'; script-src \'self\' https: \'unsafe-inline\' \'strict-dynamic\' \'nonce-{{nonce}}\'; upgrade-insecure-requests; worker-src \'self\';',
        'Cross-Origin-Opener-Policy': 'same-origin',
        // 'Cross-Origin-Embedder-Policy': 'require-corp',
        'Cross-Origin-Resource-Policy': 'same-origin',
        'Referrer-Policy': 'no-referrer',
        'Strict-Transport-Security': 'max-age=15552000; includeSubDomains;',
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '0',
        // 'X-Powered-By': undefined, //
      },
    },
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
