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

function fallback404Handler (req, res, next) {
  res.status(404)
  res.type('txt').send('Nothing here')
}

/* This just exists for the health check */
function Server (manager, storage, opts) {
  var options = merge({
    authenticationMiddleware: undefined,
    builderVersion: undefined,
    resourceDir: undefined
  }, opts)

  var app = express()

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

  var server = app.listen(3030, function () {
    console.log('listening on port ' + server.address().port)
  })

}

module.exports = Server
