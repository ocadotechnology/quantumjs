/*
     ____                    __                      _
    / __ \__  ______ _____  / /___  ______ ___      (_)____
   / / / / / / / __ `/ __ \/ __/ / / / __ `__ \    / / ___/
  / /_/ / /_/ / /_/ / / / / /_/ /_/ / / / / / /   / (__  )
  \___\_\__,_/\__,_/_/ /_/\__/\__,_/_/ /_/ /_(_)_/ /____/
                                              /___/

  Serve
  =====

  This serves up files from the storage engine provided over http.

*/

var express = require('express')
var router = express.Router()
var mime = require('mime')
var url = require('url')
var parseUrl = require('parseurl')
var escapeHtml = require('escape-html')
var merge = require('merge')

function collapseLeadingSlashes (str) {
  for (var i = 0; i < str.length; i++) {
    if (str[i] !== '/') {
      break
    }
  }

  return i > 1
    ? '/' + str.substr(i)
    : str
}

function redirectTrailingSlash (req, res) {
  // get original URL
  var originalUrl = parseUrl.original(req)

  // append trailing slash
  originalUrl.path = null
  originalUrl.pathname = collapseLeadingSlashes(originalUrl.pathname + '/')

  // reformat the URL
  var loc = url.format(originalUrl)
  var msg = 'Redirecting to <a href="' + escapeHtml(loc) + '">' + escapeHtml(loc) + '</a>\n'

  // send redirect response
  res.statusCode = 303
  res.setHeader('Content-Type', 'text/html; charset=UTF-8')
  res.setHeader('Content-Length', Buffer.byteLength(msg))
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Location', loc)
  res.end(msg)
}

function endsWith (string, searchString) {
  var position = string.length - searchString.length
  var i = string.indexOf(searchString, position)
  return i !== -1 && i === position
}

// serves content from storage
module.exports = function (storage, opts) {
  var options = merge({}, opts)

  var supportedFileTypes = [
    '.html',
    '.js',
    '.css',
    '.png',
    '.jpg',
    '.gif',
    '.json'
  ]

  function serveRoot404(req, res, next) {
    return storage.getProject('root').then(function (rootProject) {
      if(rootProject.buildId) {
        return storage.getStaticFile('root', rootProject.buildId, '404/index.html')
          .then(function (content) {
            if (content) {
              res.status(404).type('text/html').send(content)
            } else {
              console.error("couldn't find " + ['root', rootProject.buildId, '404/index.html'].join('/'))
              next()
            }
          })
      } else {
        console.error("couldn't find buildId for the root project, this probably means that the root project has not yet been published")
        next()
      }
    })
  }

  router.use(function (req, res, next) {
    var resolvedPath = req.path.slice(1)

    // maybe adds the trailing slash
    var parts = resolvedPath.split('/')
    var last = parts[parts.length - 1]

    var isDir = !supportedFileTypes.some(function (type) { return endsWith(last, type) })
    if (isDir && resolvedPath.length > 0 && resolvedPath[resolvedPath.length - 1] !== '/') {
      redirectTrailingSlash(req, res)
    } else {
      // extract the projectId from the url
      var projectId = parts[0] === 'docs' ? parts[1] : 'root'
      var adjustedPath = parts[0] === 'docs' ? parts.slice(2).join('/') : resolvedPath

      storage.getProject(projectId).then(function (project) {
        if (project) {
          var buildId = project.buildId
          if (buildId) {
            var filename = isDir ? adjustedPath + 'index.html' : adjustedPath
            storage.getStaticFile(projectId, buildId, filename)
              .then(function (content) {
                if (content) {
                  res.status(200).type(mime.lookup(filename)).send(content)
                } else {
                  console.log("couldn't find " + [projectId, buildId, filename].join('/') + ', serving 404 page')
                  serveRoot404(req, res, next)
                }
              })
            } else {
              serveRoot404(req, res, next)
            }
        } else {
          console.log('couldnt get active build details for project ' + projectId)
          next()
        }
      })
    }

  })

  return router
}
