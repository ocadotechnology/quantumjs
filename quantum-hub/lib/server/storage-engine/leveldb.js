/*
     ____                    __                      _
    / __ \__  ______ _____  / /___  ______ ___      (_)____
   / / / / / / / __ `/ __ \/ __/ / / / __ `__ \    / / ___/
  / /_/ / /_/ / /_/ / / / / /_/ /_/ / / / / / /   / (__  )
  \___\_\__,_/\__,_/_/ /_/\__/\__,_/_/ /_/ /_(_)_/ /____/
                                              /___/

  LevelDB Storage Engine
  ======================

  A storage engine implementation that uses leveldb for persistence.

*/

var cluster = require('cluster')
var levelup = require('levelup')
var sublevel = require('level-sublevel')
var Promise = require('bluebird')
var fs = Promise.promisifyAll(require('fs-extra'))

module.exports = function (options) {
  if (!cluster.isMaster) return

  var db = sublevel(levelup(options))
  var jsondb = Promise.promisifyAll(db.sublevel('json'))
  var blobdb = Promise.promisifyAll(db.sublevel('blob'))

  return {
    /* write a blob to storage */
    putBlobStream: function (kind, id, stream) {
      return new Promise(function (resolve, reject) {
        var parts = []
        stream.on('data', function (chunk) {
          parts.push(chunk)
        })
        stream.on('end', function () {
          blobdb.putAsync(kind + ':' + id, Buffer.concat(parts), {valueEncoding: 'binary'})
            .then(function () {
              resolve()
            }).catch(function (err) {
            reject(err)
          })
        }).on('error', function (err) {
          reject(err)
        })
      })
    },
    /* read a blob from storage and dump it on the local disk */
    blobToDisk: function (kind, id, filename) {
      return blobdb.getAsync(kind + ':' + id, {valueEncoding: 'binary'}).then(function (buffer) {
        return fs.outputFileAsync(filename, buffer)
      })
    },
    /* put something to storage */
    putBlob: function (kind, id, data) {
      return blobdb.putAsync(kind + ':' + id, data, {valueEncoding: 'binary'})
    },
    /* get something to storage */
    getBlob: function (kind, id) {
      return blobdb.getAsync(kind + ':' + id, {valueEncoding: 'binary'})
        .catch(function (err) {
          if (err.notFound) {
            return undefined
          } else {
            throw err
          }
        })
    },
    /* delete something from storage */
    deleteBlob: function (kind, id) {
      return blobdb.delAsync(kind + ':' + id)
    },

    /* put something to storage */
    put: function (kind, id, data) {
      return jsondb.putAsync(kind + ':' + id, data, {valueEncoding: 'json'})
    },
    /* get something to storage */
    get: function (kind, id) {
      return jsondb.getAsync(kind + ':' + id, {valueEncoding: 'json'})
        .catch(function (err) {
          if (err.notFound) {
            return undefined
          } else {
            throw err
          }
        })
    },
    /* delete something from storage */
    delete: function (kind, id) {
      return jsondb.delAsync(kind + ':' + id)
    },
    /* get all of a kind from storage */
    getAll: function (kind) {
      return new Promise(function (resolve, reject) {
        var parts = []
        jsondb.createReadStream({
          gte: kind + ':' + '\x00',
          lte: kind + ':' + '\xFF',
          keys: false,
          valueEncoding: 'json'
        }).on('data', function (data) {
          parts.push(data)
        }).on('end', function () {
          resolve(parts)
        }).on('error', function (err) {
          reject(err)
        })
      })
    }

  }
}
