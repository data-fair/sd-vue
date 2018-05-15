const config = require('../config')
const express = require('express')
const http = require('http')
const eventToPromise = require('event-to-promise')
const session = require('simple-directory-client-express')(config)

const app = express()
const server = http.createServer(app)

// This route is protected by authentication
app.get('/api/protected', session.auth, (req, res) => {
  if (!req.user) return res.status(401).send('User is not authenticated and this resource is protected.')
  res.send('Success!!')
})
// This will expose login/logout routes
app.use('/api/session', session.router)

exports.run = async() => {
  // Serve UI resources
  const nuxt = await require('./nuxt')()
  // Pages can be used as callback urls for the login
  app.use(session.loginCallback)
  // Define req.user without crypto check, just as info
  app.use(session.decode)
  app.use(nuxt)
  server.listen(8080)
  await eventToPromise(server, 'listening')
  return app
}

exports.stop = async() => {
  server.close()
  await eventToPromise(server, 'close')
}
