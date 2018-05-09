const fs = require('fs')
const { Nuxt, Builder } = require('nuxt')

const nuxtConfig = require('../nuxt.config.js')
const alreadyBuilt = fs.existsSync('.nuxt/dist')

module.exports = async () => {
  // Prepare nuxt for rendering and serving UI
  const nuxt = new Nuxt(nuxtConfig)
  if (nuxtConfig.dev) new Builder(nuxt).build()
  else if (!alreadyBuilt && process.env.NODE_ENV !== 'test') await new Builder(nuxt).build()
  return nuxt.render
}
