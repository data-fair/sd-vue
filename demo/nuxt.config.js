const config = require('./config')
const URL = require('url').URL

module.exports = {
  dev: process.env.NODE_ENV === 'development',
  srcDir: 'public/',
  build: {
    extractCSS: true,
    vendor: ['babel-polyfill'],
    // Use babel polyfill, not runtime transform to support Array.includes and other methods
    // cf https://github.com/nuxt/nuxt.js/issues/93
    babel: {
      presets: [
        ['vue-app', {useBuiltIns: true, targets: { ie: 11, uglify: true }}]
      ]
    }
  },
  plugins: [
    {src: '~plugins/vuetify'},
    {src: '~plugins/session', ssr: false}
  ],
  router: {
    base: new URL(config.publicUrl + '/').pathname
  },
  env: config,
  modules: ['@nuxtjs/axios'],
  axios: {
    browserBaseURL: config.publicUrl + '/',
    baseURL: `http://localhost:8080/`
  },
  head: {
    title: 'Simple Directory - Nuxt recipe',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ],
    link: [
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Nunito:300,400,500,700,400italic|Material+Icons' }
    ]
  }
}
