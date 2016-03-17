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

  Welcome to error handling land.

*/

var Promise = require('bluebird')
var express = require('express')
var crypto = require('crypto')
var bodyParser = require('body-parser')
var path = require('path')
var merge = require('merge')
var _ = require('lodash')

function createKey () {
  return new Promise(function (resolve, reject) {
    crypto.randomBytes(48, function (err, buf) {
      err ? reject(err) : resolve(buf.toString('hex'))
    })
  })
}

module.exports = function (manager, storage, opts) {
  var options = merge({
    builderVersion: undefined,
    authenticationMiddleware: undefined,
    getUserId: undefined,
  }, opts)

  function emit (id, data) {
    // XXX: do something with this
    console.log(id, data)
  }

  function secretAuthenticationMiddleware (storage, options) {
    return function (req, res, next) {
      var key = req.query.key
      var projectId = req.query.projectId

      if (key && projectId) {
        storage.isValidKeyForProject(projectId, key).then(function (ok) {
          if(ok) {
            emit('key_valid_for_project', {severity: 'INFO', message: 'Valid key provided for project', projectId: projectId})
            next()
          } else {
            emit('key_not_valid_for_project', {severity: 'WARN', message: 'User error: invalid key provided for project', projectId: projectId})
            res.status(401).json({error: 'key provided is not valid'})
          }
        }).catch(function (err) {
          emit('key_validation_failed', {severity: 'ERROR', message: 'Key validation failed', projectId: projectId, err: err})
          res.status(500).json({error: 'Key validation failed'})
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

  var router = express.Router()

  router.use(secretAuthenticationMiddleware(storage, {
    authenticationMiddleware: options.authenticationMiddleware
  }))

  var jsonParser = bodyParser.json()

  router.post('/projects', jsonParser, function (req, res) {
    options.getUserId(req).then(function (userId) {
      var projectId = req.body.projectId
      var isPublic = req.body.public !== undefined ? req.body.public : true

      if (projectId) {
        storage.getProject(projectId).then(function (details) {
          if (details) {
            emit('rest_create_project_error_failure', { severity: 'WARN', message: 'User error: Project already exists.', projectId: projectId, userId: userId})
            res.status(409).json({error: "Project with id '" + projectId + "' already exists"})
          } else {
            return storage
              .putProject(projectId, {
                projectId: projectId,
                users: [userId],
                keys: [],
                quantumJson: {},
                builderVersion: undefined,
                public: isPublic,
                buildId: undefined,
                buildLog: undefined
              })
              .then(function () {
                emit('rest_create_project_success', { severity: 'INFO', message: 'Project created', projectId: projectId, userId: userId})
                res.status(200).json({success: true})
              })
          }
        }).catch(function (err) {
          emit('rest_create_project_error_failure', { severity: 'ERROR', message: 'Unable to create project, due to database failure', error: err, projectId: projectId, userId: userId})
          res.status(500).json({error: 'Unable to create project, due to database failure'})
        })
      } else {
        emit('rest_create_project_error_no_project_id', { severity: 'WARN', message: 'User error: No projectId supplied when creating project.', userId: userId })
        res.status(400).json({error: 'No projectId supplied'})
      }
    }).catch(function (err) {
      emit('rest_create_project_error_unknown_user', { severity: 'ERROR', message: 'Unable to determine user when creating project', error: err })
      res.status(500).json({error: 'Unable to determine user'})
    })
  })

  router.get('/projects', function (req, res) {
    options.getUserId(req).then(function (userId) {
      storage.getProjects().then(function (projects) {
        emit('rest_get_projects_sucess', { severity: 'INFO', message: 'Get projects success', userId: userId})
        res.status(200).json(projects.filter(function(project){
          return project.public || (project.users.indexOf(userId) !== -1)
        }).map(function (project) {
          if (project.users.indexOf(userId) === -1) {
            return _.omit(project, 'keys')
          } else {
            return project
          }
        }))
      }).catch(function (err) {
        emit('rest_get_projects_failure', { severity: 'ERROR', message: 'Unable to get projects. The database may be unreachable.', error: err})
        res.status(500).json({ error: 'Unable to get projects. The database may be unreachable.' })
      })
    }).catch(function (err) {
      emit('rest_create_project_error_unknown_user', { severity: 'ERROR', message: 'Unable to determine users', error: err })
      res.status(500).json({error: 'Unable to determine user'})
    })
  })

  router.get('/projects/:id', function (req, res) {
    var projectId = req.params.id
    options.getUserId(req).then(function (userId) {
      storage.getProject(projectId).then(function (project) {
        emit('rest_get_project_success', { severity: 'INFO', message: 'Get project', projectId: projectId, userId: userId})
        if (project.users.indexOf(userId) === -1) {
          res.status(200).json(_.omit(project, 'keys'))
        } else {
          res.status(200).json(project)
        }
      }).catch(function (err) {
        emit('rest_get_project_failure', { severity: 'ERROR', message: 'Unable to get project. The database may be unreachable.', error: err, projectId: projectId, userId: userId})
        res.status(500).json({ error: 'Unable to get project. The database may be unreachable.' })
      })
    }).catch(function (err) {
      emit('rest_get_project_error_unknown_user', { severity: 'ERROR', message: 'Unable to determine user', error: err })
      res.status(500).json({error: 'Unable to determine user'})
    })
  })

  router.post('/projects/:id/create-key', function (req, res) {
    var projectId = req.params.id
    options.getUserId(req).then(function (userId) {
      storage.getProject(projectId).then(function (project) {
        if (project) {
          if (project.users.indexOf(userId) !== -1) {
            createKey().then(function (key) {
              project.keys.push(key)
              storage.putProject(projectId, project).then(function () {
                emit('rest_create_project_key_success', { severity: 'INFO', message: 'Created project key', projectId: projectId, userId: userId})
                res.status(200).json({key: key})
              }).catch(function (err) {
                emit('rest_create_project_key_failure', { severity: 'ERROR', message: 'Unable to update project. The database may be unreachable.', error: err, projectId: projectId, userId: userId})
                res.status(500).json({error: 'Unable to update project. The database may be unreachable.'})
              })
            }).catch(function (err) {
              emit('rest_create_project_key_generate_failure', { severity: 'ERROR', message: 'No user supplied', error: err, projectId: projectId, userId: userId})
              res.status(500).json({error: 'Unable to generate a key'})
            })
          } else {
            emit('rest_create_project_key_unauthorized', { severity: 'WARN', message: 'Unable to create a key - you are not a member of this project', projectId: projectId, userId: userId})
            res.status(403).json({error: 'Unable to create a key - you are not a member of this project'})
          }
        } else {
          emit('rest_create_project_key_no_such_project', { severity: 'WARN', message: 'Unable to create a key - project does not exist', projectId: projectId, userId: userId})
          res.status(400).json({error: 'Unable to create a key - project does not exist'})
        }
      }).catch(function (err) {
        emit('rest_create_project_key_failure', { severity: 'ERROR', message: 'Unable to check project details. The database may be unreachable.', error: err, projectId: projectId, userId: userId})
        res.status(500).json({ error: 'Unable to check project details. The database may be unreachable.' })
      })
    }).catch(function (err) {
      emit('rest_create_project_key_error_unknown_user', { severity: 'ERROR', message: 'Unable to determine user', error: err })
      res.status(500).json({error: 'Unable to determine user'})
    })
  })

  router.delete('/projects/:id/keys/:key', function (req, res) {
    var projectId = req.params.id
    var key = req.params.key
    options.getUserId(req).then(function (userId) {
      storage.getProject(projectId).then(function (project) {
        if (project) {
          if (project.users.indexOf(userId) !== -1) {
            if (project.keys.indexOf(key) !== -1) {
              project.keys = project.keys.filter(function (k) { return k !== key })
              storage.putProject(projectId, project).then(function () {
                emit('rest_delete_project_key_success', { severity: 'INFO', message: 'Deleted project key', projectId: projectId, userId: userId})
                res.status(200).json({success: true})
              }).catch(function (err) {
                emit('rest_delete_project_key_failure', { severity: 'ERROR', message: 'Unable to update project. The database may be unreachable.', error: err, projectId: projectId, userId: userId})
                res.status(500).json({error: 'Unable to update project. The database may be unreachable.'})
              })
            } else {
              emit('rest_delete_project_key_failure', { severity: 'WARN', message: 'User error: key does not exist', projectId: projectId, userId: userId})
              res.status(400).json({error: 'The key "' + key + '" does not exist, and so can not be deleted'})
            }
          } else {
            emit('rest_delete_project_key_unauthorized', { severity: 'WARN', message: 'Unable to delete a key - you are not a member of this project', projectId: projectId, userId: userId})
            res.status(403).json({error: 'Unable to create a key - you are not a member of this project'})
          }
        } else {
          emit('rest_delete_project_key_no_such_project', { severity: 'WARN', message: 'Unable to delete the key - project does not exist', projectId: projectId, userId: userId})
          res.status(400).json({error: 'Unable to create a key - project does not exist'})
        }
      }).catch(function (err) {
        emit('rest_delete_project_key_failure', { severity: 'ERROR', message: 'Unable to check project details. The database may be unreachable.', error: err, projectId: projectId, userId: userId})
        res.status(500).json({ error: 'Unable to check project details. The database may be unreachable.' })
      })
    }).catch(function (err) {
      emit('rest_delete_project_key_error_unknown_user', { severity: 'ERROR', message: 'Unable to determine user', error: err })
      res.status(500).json({error: 'Unable to determine user'})
    })
  })

  router.post('/projects/:id/add-user', jsonParser, function (req, res) {
    var projectId = req.params.id
    var newUserId = req.body.userId
    options.getUserId(req).then(function (userId) {
      storage.getProject(projectId).then(function (project) {
        if (project) {
          if (project.users.indexOf(userId) !== -1) {
            if (newUserId) {
              if (project.users.indexOf(newUserId) === -1) {
                project.users.push(newUserId)
                storage.putProject(projectId, project).then(function () {
                  emit('rest_add_project_user_success', { severity: 'INFO', message: 'Added project user', projectId: projectId, userId: userId, newUserId: newUserId})
                  res.status(200).json({success: true})
                }).catch(function (err) {
                  emit('rest_add_project_user_failure', { severity: 'ERROR', message: 'Unable to update project. The database may be unreachable.', error: err, projectId: projectId, userId: userId, newUserId: newUserId})
                  res.status(500).json({error: 'Unable to update project. The database may be unreachable.'})
                })
              } else {
                emit('rest_add_project_user_already_exists', { severity: 'WARN', message: 'User error: User is already a member of the project', projectId: projectId, userId: userId, newUserId: newUserId})
                res.status(400).json({error: 'User is already a member of the project'})
              }
            } else {
              emit('rest_add_project_user_no_user_supplied', { severity: 'ERROR', message: 'User error: No userId supplied', projectId: projectId, userId: userId})
              res.status(400).json({error: 'No userId supplied'})
            }
          } else {
            emit('rest_add_project_user_unauthorized', { severity: 'WARN', message: 'Unable to add a user - you are not a member of this project', projectId: projectId, userId: userId})
            res.status(403).json({error: 'Unable to add the user - you are not a member of this project'})
          }
        } else {
          emit('rest_add_project_user_no_such_project', { severity: 'WARN', message: 'Unable to add a user - project does not exist', projectId: projectId, userId: userId})
          res.status(400).json({error: 'Unable to add the user - project does not exist'})
        }
      }).catch(function (err) {
        emit('rest_add_project_user_failure', { severity: 'ERROR', message: 'Unable to check project details. The database may be unreachable.', error: err, projectId: projectId, userId: userId})
        res.status(500).json({ error: 'Unable to check project details. The database may be unreachable.' })
      })
    }).catch(function (err) {
      emit('rest_add_project_user_error_unknown_user', { severity: 'ERROR', message: 'Unable to determine user', error: err })
      res.status(500).json({error: 'Unable to determine user'})
    })
  })

  router.delete('/projects/:id/users/:user', function (req, res) {
    var projectId = req.params.id
    var userIdToBeRemoved = req.params.user
    options.getUserId(req).then(function (userId) {
      storage.getProject(projectId).then(function (project) {
        if (project) {
          if (project.users.indexOf(userId) !== -1) {
            if (project.users.indexOf(userIdToBeRemoved) !== -1) {
              project.users = project.users.filter(function (id) { return id !== userIdToBeRemoved })
              storage.putProject(projectId, project).then(function () {
                emit('rest_delete_project_user_success', { severity: 'INFO', message: 'Deleted project user', projectId: projectId, userId: userId, userIdToBeRemoved: userIdToBeRemoved})
                res.status(200).json({success: true})
              }).catch(function (err) {
                emit('rest_delete_project_user_failure', { severity: 'ERROR', message: 'Unable to update project. The database may be unreachable.', error: err, projectId: projectId, userId: userId, userIdToBeRemoved: userIdToBeRemoved})
                res.status(500).json({error: 'Unable to update project. The database may be unreachable.'})
              })
            } else {
              emit('rest_delete_project_user_failure', { severity: 'WARN', message: 'User error: user does not exist', projectId: projectId, userId: userId, userIdToBeRemoved: userIdToBeRemoved})
              res.status(400).json({error: 'The user "' + userIdToBeRemoved + '" does not exist, and so can not be deleted'})
            }
          } else {
            emit('rest_delete_project_user_unauthorized', { severity: 'WARN', message: 'Unable to delete a user - you are not a member of this project', projectId: projectId, userId: userId, userIdToBeRemoved: userIdToBeRemoved})
            res.status(403).json({error: 'Unable to create a user - you are not a member of this project'})
          }
        } else {
          emit('rest_delete_project_user_no_such_project', { severity: 'WARN', message: 'Unable to delete the user - project does not exist', projectId: projectId, userId: userId, userIdToBeRemoved: userIdToBeRemoved})
          res.status(400).json({error: 'Unable to create a user - project does not exist'})
        }
      }).catch(function (err) {
        emit('rest_delete_project_user_failure', { severity: 'ERROR', message: 'Unable to check project details. The database may be unreachable.', error: err, projectId: projectId, userId: userId, userIdToBeRemoved: userIdToBeRemoved})
        res.status(500).json({ error: 'Unable to check project details. The database may be unreachable.' })
      })
    }).catch(function (err) {
      emit('rest_delete_project_user_error_unknown_user', { severity: 'ERROR', message: 'Unable to determine user', error: err, userIdToBeRemoved: userIdToBeRemoved, projectId: projectId })
      res.status(500).json({error: 'Unable to determine user'})
    })
  })

  router.put('/projects/:id/public', jsonParser, function (req, res) {
    var projectId = req.params.id
    var public = req.body.public
    options.getUserId(req).then(function (userId) {
      storage.getProject(projectId).then(function (project) {
        if (project) {
          if (project.users.indexOf(userId) !== -1) {
            if (public !== undefined) {
              if (project.public !== public) {
                project.public = public
                storage.putProject(projectId, project).then(function () {
                  emit('rest_set_project_publicity_success', { severity: 'INFO', message: 'Set project publicity', projectId: projectId, userId: userId, public: public})
                  res.status(200).json({success: true})
                }).catch(function (err) {
                  emit('rest_set_project_publicity_failure', { severity: 'ERROR', message: 'Unable to update project. The database may be unreachable.', error: err, projectId: projectId, userId: userId, public: public})
                  res.status(500).json({error: 'Unable to update project. The database may be unreachable.'})
                })
              } else {
                emit('rest_set_project_publicity_success_no_change', { severity: 'INFO', message: 'Set project publicity (no change)', projectId: projectId, userId: userId, public: public})
                res.status(200).json({success: true})
              }
            } else {
              emit('rest_set_project_publicity_no_publicity_supplied', { severity: 'ERROR', message: 'User error: No public field supplied', projectId: projectId, userId: userId})
              res.status(400).json({error: 'No public field supplied'})
            }
          } else {
            emit('rest_set_project_publicity_unauthorized', { severity: 'WARN', message: 'Unable to add a user - you are not a member of this project', projectId: projectId, userId: userId})
            res.status(403).json({error: 'Unable to set the publicity - you are not a member of this project'})
          }
        } else {
          emit('rest_set_project_publicity_no_such_project', { severity: 'WARN', message: 'Unable to add a user - project does not exist', projectId: projectId, userId: userId})
          res.status(400).json({error: 'Unable to set the publicity - project does not exist'})
        }
      }).catch(function (err) {
        emit('rest_set_project_publicity_failure', { severity: 'ERROR', message: 'Unable to check project details. The database may be unreachable.', error: err, projectId: projectId, userId: userId})
        res.status(500).json({ error: 'Unable to check project details. The database may be unreachable.' })
      })
    }).catch(function (err) {
      emit('rest_set_project_publicity_error_unknown_user', { severity: 'ERROR', message: 'Unable to determine user', error: err })
      res.status(500).json({error: 'Unable to determine user'})
    })
  })

  router.get('/user', function (req, res) {
    options.getUserId(req).then(function (userId) {
      storage.getUser(userId).then(function (user) {
        res.status(200).json(user || {keys: []})
      }).catch(function (err) {
        emit('rest_get_user_failure', { severity: 'ERROR', message: 'Unable to get user. The database may be unreachable.', error: err})
        res.status(500).json({ error: 'Unable to get user. The database may be unreachable.' })
      })
    }).catch(function (err) {
      emit('rest_get_user_error_unknown_user', { severity: 'ERROR', message: 'Unable to determine user', error: err })
      res.status(500).json({error: 'Unable to determine user'})
    })
  })

  //
  // router.post('/projects/:id', function (req, res) {
  //   var projectId = req.params.id
  //
  //   storage.getLatestRevision(projectId).then(function (revisionDetails) {
  //     var revision = revisionDetails === undefined ? 1 : Number(revisionDetails.latestRevision) + 1
  //     storage.putRevisionSourceArchiveStream(projectId, revision, req)
  //       .then(function () {
  //         return storage.putLatestRevision(projectId, {
  //           projectId: projectId,
  //           latestRevision: revision,
  //           datestamp: Date.now()
  //         })
  //       })
  //       .then(function () {
  //         return storage.putRevisionDetails(projectId, revision, {
  //           projectId: projectId,
  //           revision: revision,
  //           datestamp: Date.now()
  //         })
  //       })
  //       .then(function () {
  //         console.log('finished receiving snapshot publish for ' + projectId)
  //         res.status(200).json({revision: revision}).end()
  //       })
  //       .catch(function (err) {
  //         console.error('failed to store snapshot publish for ' + projectId)
  //         console.error(err)
  //         res.status(500).json({error: err.toString()})
  //         throw err
  //       })
  //   })
  // })
  //
  // function maybeBuildRevision (projectId, revision) {
  //   return storage.getBuildInfo(projectId, revision).then(function (details) {
  //     if (details === undefined) {
  //       console.log('building revision ' + revision + ' for ' + projectId + ' to revision ')
  //       var start = Date.now()
  //       return manager.buildRevision(projectId, revision).then(function (res) {
  //         return storage.putBuildInfo(projectId, revision, {
  //           projectId: projectId,
  //           revision: revision,
  //           builderVersion: options.builderVersion,
  //           buildStartTime: start,
  //           buildFinishTime: Date.now(),
  //           buildId: res.buildId,
  //           buildLog: res.buildLog,
  //           quantumJson: quantumJson
  //         }).then(function () {
  //           return res.quantumJson
  //         })
  //       })
  //     } else {
  //       console.log('not building revision ' + revision + ' for ' + projectId + ' - it has already been built')
  //       return details.quantumJson
  //     }
  //   })
  // }
  //
  // router.put('/projects/:id', jsonParser, function (req, res) {
  //   var projectId = req.params.id
  //   var revision = Number(req.body.revision.active)
  //
  //   console.log('got set revision request for ' + projectId + ' to set the revision to ' + revision)
  //
  //   return storage.getLatestRevision(projectId).then(function (latest) {
  //     if (revision <= latest.latestRevision) {
  //       return maybeBuildRevision(projectId, revision)
  //         .then(function (quantumJson) {
  //           console.log('set revision request for ' + projectId + ' to revision ' + revision)
  //           return storage.putActiveRevision(projectId, {
  //             projectId: projectId,
  //             revision: revision,
  //             builderVersion: options.builderVersion,
  //             quantumJson: quantumJson
  //           })
  //         })
  //         .then(function () {
  //           res.status(200).end()
  //         })
  //         .catch(function (err) {
  //           console.error(err)
  //           if (err.response && err.response.body) console.log(err.response.body)
  //           res.status(500).json({error: err.toString()})
  //           throw err
  //         })
  //     } else {
  //       var err = 'Revision "' + revision + '" does not exist for project "' + projectId + '". The latest revision available is "' + latest.latestRevision + '".'
  //       console.error(err)
  //       res.status(400).json({
  //         error: err.toString()
  //       })
  //     }
  //   })
  // })
  //
  // router.get('/builds/:id', function (req, res) {
  //   var id = req.params.id
  //   storage.getBuildInfo(id)
  //     .then(function (details) {
  //       if (details) {
  //         res.json(details)
  //       } else {
  //         res.status(404).json({error: 'Build with id ' + id + ' not found'})
  //       }
  //     })
  //     .catch(function (err) {
  //       console.error(err)
  //       res.status(500).json({error: err.toString()})
  //     })
  // })
  //
  // router.get('/revision/:projectId/:revision', function (req, res) {
  //   var id = req.params.projectId
  //   var revision = req.params.revision
  //   storage.getRevisionDetails(id, revision)
  //     .then(function (details) {
  //       if (details) {
  //         res.json(details)
  //       } else {
  //         res.status(404).json({error: 'Build with id ' + id + ' not found'})
  //       }
  //     })
  //     .catch(function (err) {
  //       console.error(err)
  //       res.status(500).json({error: err.toString()})
  //     })
  // })

  return router
}
