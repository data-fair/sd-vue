const fr = require('vuetify/es5/locale/fr').default
const en = require('vuetify/es5/locale/en').default

module.exports = {
  telemetry: false,
  dev: process.env.NODE_ENV === 'development',
  srcDir: 'public/',
  build: {
    transpile: [/@koumoul/, 'src'] // Necessary for "à la carte" import of vuetify components
  },
  plugins: [
    { src: '~plugins/session-init', ssr: true },
    { src: '~plugins/session-loop', ssr: false },
    { src: '~plugins/vuetify', ssr: false }
  ],
  router: {
    base: '/'
  },
  env: { directoryUrl: 'http://localhost:5676/simple-directory' },
  modules: ['@nuxtjs/axios', 'cookie-universal-nuxt', ['@nuxtjs/i18n', {
    seo: false,
    locales: ['en', 'fr'],
    defaultLocale: 'en',
    vueI18nLoader: true,
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_lang'
    },
    vueI18n: {
      fallbackLocale: 'en'
    }
  }]],
  buildModules: [ '@nuxtjs/vuetify' ],
  vuetify: {
    theme: {
      themes:
      {
        light: {
          primary: '#1E88E5', // blue.darken1
          secondary: '#42A5F5', // blue.lighten1,
          accent: '#FF9800', // orange.base
          error: 'FF5252', // red.accent2
          info: '#2196F3', // blue.base
          success: '#4CAF50', // green.base
          warning: '#E91E63', // pink.base
          admin: '#E53935' // red.darken1
        }
      }
    },
    lang: {
      locales: { fr, en },
      current: 'en'
    }
  },
  axios: {
    baseURL: `http://localhost:5676/`
  },
  head: {
    title: 'Simple Directory - Nuxt / Vuetify demo',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ],
    link: [
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Nunito:300,400,500,700,400italic|Material+Icons' }
    ]
  }
}
