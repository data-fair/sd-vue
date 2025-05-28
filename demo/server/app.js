const express = require('express')
const http = require('http')
const eventToPromise = require('event-to-promise')
const { createProxyMiddleware } = require('http-proxy-middleware')
const session = require('@data-fair/sd-express')({ directoryUrl: 'http://localhost:8080' })

const app = express()
const server = http.createServer(app)

app.use('/simple-directory', createProxyMiddleware({ target: 'http://localhost:8080', pathRewrite: { '^/simple-directory': '' } }))

// This route is protected by authentication
app.get('/api/protected', session.auth, (req, res) => {
  if (!req.user) return res.status(401).send('User is not authenticated and this resource is protected.')
  res.send('Success!!')
})

 export const run = async() => {
  // Serve UI resources
  app.use(await require('./nuxt')())
  server.listen(5676)
  await eventToPromise(server, 'listening')
  return app
}

 export const stop = async() => {
  server.close()
  await eventToPromise(server, 'close')
}
