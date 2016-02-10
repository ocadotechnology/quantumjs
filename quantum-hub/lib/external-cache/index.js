/*
     ____                    __                      _
    / __ \__  ______ _____  / /___  ______ ___      (_)____
   / / / / / / / __ `/ __ \/ __/ / / / __ `__ \    / / ___/
  / /_/ / /_/ / /_/ / / / / /_/ /_/ / / / / / /   / (__  )
  \___\_\__,_/\__,_/_/ /_/\__/\__,_/_/ /_/ /_(_)_/ /____/
                                              /___/

  External Cache
  ==============

  When running as a cluster, quantum-hub can point at a single cache instance to avoid
  caches getting out of sync in each instance. Without this, requests have to go to
  the persistent backing store, could be much slower, depending on the backing store used.

*/

var merge = require('merge')
var express = require('express')
var bodyParser = require('body-parser')
var Promise = require('bluebird')
var levelDbStorageEngine = require('../server/storage-engine/leveldb')

module.exports = function (opts) {
  var options = merge({
    port: 3040,
    storageEngine: undefined, // the local storage engine used for the cache
    events: undefined
  }, opts)

  if (options.storageEngine === undefined) throw new Error('options.storageEngine should not be undefined')

  function emit (type, msg) {
    if (options.events) {
      options.events.emit(type, msg)
      options.events.emit("all", {type: type, msg: msg})
    }
  }

  var app = express()

  function jsonRespond (eventName, res, promise) {
    return promise.then(function (r) {
      emit(eventName + '-success')
      res.json(r)
    }).catch(function (err) {
      emit(eventName + '-failure')
      res.status(500).json({error: err.stack})
    })
  }

  app.put('/blob/:kind/:key', function (req, res) {
    emit('request', {url: req.path})
    var kind = req.params.kind
    var key = req.params.key
    jsonRespond('put-blob', res, options.storageEngine.putBlobStream(kind, key, req))
  })

  app.get('/blob/:kind/:key', function (req, res) {
    emit('request', {url: req.path})
    var kind = req.params.kind
    var key = req.params.key
    options.storageEngine.getBlob(kind, key)
      .then(function (blob) {
        res.end(blob)
      })
      .catch(function () {
        res.status(500).json({
          error: err.stack
        })
      })
  })

  app.delete('/blob/:kind/:key', function (req, res) {
    emit('request', {url: req.path})
    var kind = req.params.kind
    var key = req.params.key
    jsonRespond('delete-blob', res, options.storageEngine.deleteBlob(kind, key))
  })

  app.put('/entity/:kind/:key', bodyParser.json(), function (req, res) {
    emit('request', {url: req.path})
    var kind = req.params.kind
    var key = req.params.key
    var value = req.body
    jsonRespond('put-entity', res, options.storageEngine.put(kind, key, value))
  })

  app.get('/entity/:kind/:key', bodyParser.json(), function (req, res) {
    emit('request', {url: req.path})
    var kind = req.params.kind
    var key = req.params.key
    jsonRespond('get-entity', res, options.storageEngine.get(kind, key))
  })

  app.delete('/entity/:kind/:key', bodyParser.json(), function (req, res) {
    emit('request', {url: req.path})
    var kind = req.params.kind
    var key = req.params.key
    jsonRespond('delete-entity', res, options.storageEngine.delete(kind, key))
  })

  app.get('/entity/:kind', bodyParser.json(), function (req, res) {
    emit('request', {url: req.path})
    var kind = req.params.kind
    jsonRespond('get-entities', res, options.storageEngine.getAll(kind))
  })

  return new Promise(function (resolve, reject) {
    var server = app.listen(options.port, function () {
      emit('server-started', {port: options.port})
      resolve({
        stop: function () {
          return new Promise(function (resolve, reject) {
            server.close(function () {
              resolve()
            })
          })
        }
      })
    })
  })

}
