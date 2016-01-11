/*
     ____                    __                      _
    / __ \__  ______ _____  / /___  ______ ___      (_)____
   / / / / / / / __ `/ __ \/ __/ / / / __ `__ \    / / ___/
  / /_/ / /_/ / /_/ / / / / /_/ /_/ / / / / / /   / (__  )
  \___\_\__,_/\__,_/_/ /_/\__/\__,_/_/ /_/ /_(_)_/ /____/
                                              /___/

  Rest Api
  ========

  The rest api for interacting with the hub. This handles things like creation of
  new projects, publishing new revisions, triggering updates to new revisions.

*/

var express = require('express')
var crypto = require('crypto')
var bodyParser = require('body-parser')
var path = require('path')
var merge = require('merge')

function secretAuthenticationMiddleware (storage, options) {
  return function (req, res, next) {
    var key = req.query.key
    var projectId = req.query.projectId

    if (key) {
      storage.getProjectCredentials(projectId).then(function (details) {
        if (details && details.key === key) {
          next()
        } else {
          res.status(401).json({error: 'key provided is not valid'})
        }
      }).catch(function (err) {
        console.error(err)
        res.status(500).json({error: err.toString()})
      })
    } else {
      if (options.authenticationMiddleware) {
        options.authenticationMiddleware(req, res, next)
      } else {
        next()
      }
    }
  }
}

module.exports = function (manager, storage, opts) {
  var options = merge({
    builderVersion: undefined,
    authenticationMiddleware: undefined
  }, opts)

  var router = express.Router()

  router.use(secretAuthenticationMiddleware(storage, {
    authenticationMiddleware: options.authenticationMiddleware
  }))

  var jsonParser = bodyParser.json()

  router.get('/projects', function (req, res) {
    storage.getProjects().then(function (projects) {
      res.json(projects)
    })
  })

  router.post('/projects', jsonParser, function (req, res) {
    crypto.randomBytes(48, function (ex, buf) {
      var projectId = req.body.projectId
      var key = buf.toString('hex')

      if (projectId) {
        storage.getProjectCredentials(projectId).then(function (details) {
          if (details) {
            res.status(409).json({error: "project with id '" + projectId + "' already exists"})
          } else {
            return storage.putProjectCredentials(projectId, { key: key })
              .then(function () {
                return storage.putProject(projectId, { projectId: projectId, name: undefined, description: undefined })
              })
              .then(function () {
                res.json({
                  secret: key
                })
              })
          }
        }).catch(function (err) {
          res.status(500).json({error: err.toString()})
          throw err
        })
      } else {
        res.status(400).json({error: 'no projectId supplied'})
      }

    })
  })

  router.get('/projects/:id', function (req, res) {
    var projectId = req.params.id
    storage.getProject(projectId).then(function (projects) {
      res.json(projects)
    })
  })

  router.post('/projects/:id', function (req, res) {
    var projectId = req.params.id
    var key = req.query.key

    if (key) {
      console.log('receiving publish for ' + projectId)

      storage.getProjectCredentials(projectId).then(function (details) {
        if (details) {
          if (details.key === key) {
            storage.getLatestRevision(projectId).then(function (revisionDetails) {
              var revision = revisionDetails === undefined ? 1 : Number(revisionDetails.latestRevision) + 1
              storage.putSiteArchiveStream(projectId, revision, req)
                .then(function () {
                  return storage.putLatestRevision(projectId, {
                    projectId: projectId,
                    latestRevision: revision,
                    datestamp: Date.now()
                  })
                })
                .then(function () {
                  return storage.putRevisionDetails(projectId, revision, {
                    projectId: projectId,
                    revision: revision,
                    datestamp: Date.now()
                  })
                })
                .then(function () {
                  console.log('finished receiving snapshot publish for ' + projectId)
                  res.status(200).json({revision: revision}).end()
                })
                .catch(function (err) {
                  console.error('failed to store snapshot publish for ' + projectId)
                  console.error(err)
                  res.status(500).json({error: err.toString()})
                  throw err
                })
            })

          } else {
            console.log('incorrect key supplied')
            res.status(400).json({error: 'incorrect key'})
          }
        } else {
          console.log('unknown project ' + projectId)
          res.status(400).json({error: "unknown project '" + projectId + "'"})
        }

      }).catch(function (err) {
        console.log('unknown project ' + projectId)
        res.status(400).json({error: "unknown project '" + projectId + "'"})
        throw err
      })

    } else {
      console.log('no key parameter specified')
      res.status(400).json({ error: 'no key parameter specified' })
    }

  })

  router.get('/projects/:id/revision', function (req, res) {
    var projectId = req.params.id
    storage.getActiveBuild(projectId).then(function (revision) {
      res.json(revision)
    })
  })

  router.get('/revisions', function (req, res) {
    storage.getActiveBuilds().then(function (revisions) {
      res.json(revisions)
    }).catch(function (err) {
      console.error(err)
      res.status(500).json({error: err.toString()})
    })
  })

  router.get('/revisions/latest', function (req, res) {
    storage.getLatestRevisions().then(function (revisions) {
      res.json(revisions)
    }).catch(function (err) {
      console.error(err)
      res.status(500).json({error: err.toString()})
    })
  })

  function maybeBuildRevision (projectId, revision) {
    return storage.getBuildInfo(projectId, revision).then(function (details) {
      if (details === undefined) {
        console.log('building revision ' + revision + ' for ' + projectId + ' to revision ')

        var start = Date.now()
        return manager.buildRevision(projectId, revision).then(function () {
          return storage.putBuildInfo(projectId, revision, {
            projectId: projectId,
            revision: revision,
            builderVersion: options.builderVersion,
            buildStartTime: start,
            buildFinishTime: Date.now()
          })
        })
      } else {
        console.log('not building revision ' + revision + ' for ' + projectId + ' - it has already been built')
      }
    })
  }

  router.post('/projects/:id/revision', jsonParser, function (req, res) {
    var projectId = req.params.id
    var revision = Number(req.body.revision)

    console.log('got set revision request for ' + projectId + ' to set the revision to ' + revision)

    return storage.getLatestRevision(projectId).then(function (latest) {
      if (revision <= latest.latestRevision) {
        return maybeBuildRevision(projectId, revision)
          .then(function () {
            console.log('set revision request for ' + projectId + ' to revision ' + revision)
            return storage.putActiveBuild(projectId, {
              projectId: projectId,
              revision: revision,
              builderVersion: options.builderVersion
            })
          })
          .then(function () {
            res.status(200).end()
          })
          .catch(function (err) {
            console.error(err)
            res.status(500).json({error: err.toString()})
            throw err
          })
      } else {
        var err = 'Revision "' + revision + '" does not exist for project "' + projectId + '". The latest revision available is "' + latest.latestRevision + '".'
        console.error(err)
        res.status(400).json({
          error: err.toString()
        })
      }
    })

  })

  return router
}
