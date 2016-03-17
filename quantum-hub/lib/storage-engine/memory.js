/*
     ____                    __                      _
    / __ \__  ______ _____  / /___  ______ ___      (_)____
   / / / / / / / __ `/ __ \/ __/ / / / __ `__ \    / / ___/
  / /_/ / /_/ / /_/ / / / / /_/ /_/ / / / / / /   / (__  )
  \___\_\__,_/\__,_/_/ /_/\__/\__,_/_/ /_/ /_(_)_/ /____/
                                              /___/

  Memory Storage Engine
  =====================

  A storage engine implementation that uses memory for 'persistence'.

*/

var cluster = require('cluster')
var Promise = require('bluebird')
var fs = Promise.promisifyAll(require('fs-extra'))

module.exports = function (options) {
  if (!cluster.isMaster) return

  var db = {
    blob: {},
    entity: {}
  }

  return {
    /* write a blob to storage */
    putBlobStream: function (kind, id, stream) {
      return new Promise(function (resolve, reject) {
        var parts = []
        stream.on('data', function (chunk) {
          parts.push(chunk)
        })
        stream.on('end', function () {
          db.blob[kind + ':' + id] = Buffer.concat(parts)
          resolve()
        }).on('error', function (err) {
          reject(err)
        })
      })
    },
    /* read a blob from storage and dump it on the local disk */
    blobToDisk: function (kind, id, filename) {
      if (db.blob[kind + ':' + id]) {
        return fs.outputFileAsync(filename, db.blob[kind + ':' + id])
      } else {
        return Promise.reject(new Error('No such entry'))
      }
    },
    /* put something to storage */
    putBlob: function (kind, id, data) {
      db.blob[kind + ':' + id] = data
      return Promise.resolve()
    },
    /* get something to storage */
    getBlob: function (kind, id) {
      return Promise.resolve(db.blob[kind + ':' + id])
    },
    /* delete something from storage */
    deleteBlob: function (kind, id) {
      delete db.blob[kind + ':' + id]
      return Promise.resolve()
    },

    /* put something to storage */
    put: function (kind, id, data) {
      db.entity[kind] = db.entity[kind] || {}
      db.entity[kind][id] = data
      return Promise.resolve()
    },
    /* get something to storage */
    get: function (kind, id) {
      return Promise.resolve(db.entity[kind] ? db.entity[kind][id] : undefined)
    },
    /* delete something from storage */
    delete: function (kind, id) {
      if (db.entity[kind]) {
        delete db.entity[kind][id]
      }
      return Promise.resolve()
    },
    /* get all of a kind from storage */
    getAll: function (kind) {
      return new Promise.resolve(db.entity[kind] ? Object.keys(db.entity[kind]).map(function (k) {
        return {
          key: k,
          value: db.entity[kind][k]
        }
      }) : [])
    }

  }
}
