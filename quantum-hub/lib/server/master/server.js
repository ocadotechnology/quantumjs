/*
     ____                    __                      _
    / __ \__  ______ _____  / /___  ______ ___      (_)____
   / / / / / / / __ `/ __ \/ __/ / / / __ `__ \    / / ___/
  / /_/ / /_/ / /_/ / / / / /_/ /_/ / / / / / /   / (__  )
  \___\_\__,_/\__,_/_/ /_/\__/\__,_/_/ /_/ /_(_)_/ /____/
                                              /___/

  Server
  ======

  Runs the http server for the hub.

*/

var express = require('express')
var api = require('./rest-api')
var serve = require('./serve')
var merge = require('merge')
var https = require('https')
var fs = require('fs')

function fallback404Handler (req, res, next) {
  res.status(404)
  res.type('txt').send('Nothing here')
}

/* This just exists for the health check */
function Server (manager, storage, opts) {
  var options = merge({
    authenticationMiddleware: undefined,
    builderVersion: undefined,
    resourceDir: undefined,
    port: 3030,
    redirectorPort: 3020,
    ssl: undefined
  }, opts)

  var app = express()

  if (options.setupApp) {
    options.setupApp(app)
  }

  app.use('/api/v1/', api(manager, storage, {
    builderVersion: options.builderVersion,
    authenticationMiddleware: options.authenticationMiddleware
  }))

  var contentRouter = express.Router()

  // protect the content using the passed in middleware
  if (options.authenticationMiddleware) {
    contentRouter.use(options.authenticationMiddleware)
  }

  if (options.resourceDir) {
    contentRouter.use('/resources', express.static(options.resourceDir, { maxAge: 31557600 }))
  }

  contentRouter.use(serve(storage, {
    builderVersion: options.builderVersion
  }))

  app.use('/', contentRouter)

  app.use(fallback404Handler)

  if (options.ssl) {
    https.createServer({
      cert: fs.readFileSync(options.ssl.certFilename),
      key: fs.readFileSync(options.ssl.keyFilename)
    }, app).listen(options.port)

    var redirectServer = http.createServer(function (req, res) {
      res.writeHead(301, {
        Location: 'https://' + req.headers.host + req.url
      })
      res.end()
    }).listen(3020, function () {
      var host = redirectServer.address().address
      var port = redirectServer.address().port
      console.info('http redirector service listening at http://%s:%s', host, port)
    })
  } else {
    var server = app.listen(options.port, function () {
      console.log('listening on port ' + server.address().port)
    })
  }

}

module.exports = Server
