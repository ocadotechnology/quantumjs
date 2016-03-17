var Promise = require('bluebird')
var request = require('supertest')
var express = require('express')
var should = require('chai').should()
var restApi = require('../../../lib/server/rest-api')
var memoryStorageEngine = require('../../../lib/storage-engine/memory')
var storage = require('../../../lib/server/storage')


var stubManager = {
  buildRevision: function () {
    return Promise.resolve()
  }
}

function failingStorageEngine () {
  function fail () {
    return Promise.reject(new Error('something went wrong'))
  }
  return {
    putBlobStream: fail,
    blobToDisk: fail,
    putBlob: fail,
    getBlob: fail,
    deleteBlob: fail,
    put: fail,
    get: fail,
    delete: fail,
    getAll: fail
  }
}

function getApp (storageEngine, opts) {
  var builderVersion = '0.1.0'
  var app = express()
  var user = 'bob'
  app.use('/', restApi(stubManager, storage(storageEngine || memoryStorageEngine(), builderVersion), {
    builderVersion: builderVersion,
    keyGenerator: opts ? opts.keyGenerator : undefined,
    getUserId: function () {
      return user ? Promise.resolve(user) : Promise.reject(new Error('user resolving went wrong'))
    }
  }))
  app.setUser = function (u) {
    user = u
  }
  return app
}

function createProject (app, projectId, public) {
  return new Promise(function (resolve, reject) {
    request(app)
      .post('/projects')
      .set('Accept', 'application/json')
      .send({projectId: projectId, public: public})
      .end(function (err, res) {
        err ? reject(err) : resolve(res.body)
      })
  })
}

function createKey (app, projectId) {
  return new Promise(function (resolve, reject) {
    request(app)
      .post('/projects/' + projectId + '/create-key')
      .set('Accept', 'application/json')
      .end(function (err, res) {
        err ? reject(err) : resolve(res.body.key)
      })
  })
}

function deleteKey (app, projectId, key) {
  return new Promise(function (resolve, reject) {
    request(app)
      .delete('/projects/' + projectId + '/keys/' + key)
      .set('Accept', 'application/json')
      .end(function (err, res) {
        err ? reject(err) : resolve()
      })
  })
}

function addUser (app, projectId, userId) {
  return new Promise(function (resolve, reject) {
    request(app)
      .post('/projects/' + projectId + '/add-user')
      .send({ userId: userId })
      .set('Accept', 'application/json')
      .end(function (err, res) {
        err ? reject(err) : resolve()
      })
  })
}

function deleteUser (app, projectId, userId) {
  return new Promise(function (resolve, reject) {
    request(app)
      .delete('/projects/' + projectId + '/users/' + encodeURIComponent(userId))
      .set('Accept', 'application/json')
      .end(function (err, res) {
        err ? reject(err) : resolve()
      })
  })
}

function setProjectPublicity (app, projectId, public) {
  return new Promise(function (resolve, reject) {
    request(app)
      .put('/projects/' + projectId + '/public')
      .set('Accept', 'application/json')
      .send({public: public})
      .end(function (err, res) {
        err ? reject(err) : resolve()
      })
  })
}

function createProjectWithKey(app, projectId) {
  return createProject(app, projectId).then(function (key){
    return createKey(app, projectId)
  })
}

function getProject(app, projectId) {
  return new Promise(function (resolve, reject) {
    request(app)
      .get('/projects/' + projectId)
      .set('Accept', 'application/json')
      .end(function (err, res) {
        err ? reject(err) : resolve(res.body)
      })
  })
}

module.exports = {
  getApp: getApp,
  createProject: createProject,
  createKey: createKey,
  deleteKey: deleteKey,
  addUser: addUser,
  deleteUser: deleteUser,
  createProjectWithKey: createProjectWithKey,
  getProject: getProject,
  failingStorageEngine: failingStorageEngine
}
