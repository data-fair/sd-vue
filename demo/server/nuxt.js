const { Nuxt, Builder } = require('nuxt-edge')

const nuxtConfig = require('../nuxt.config.js')

module.exports = async () => {
  // Prepare nuxt for rendering and serving UI
  const nuxt = new Nuxt(nuxtConfig)
  await new Builder(nuxt).build()
  return nuxt.render
}
