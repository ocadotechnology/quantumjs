/*
     ____                    __                      _
    / __ \__  ______ _____  / /___  ______ ___      (_)____
   / / / / / / / __ `/ __ \/ __/ / / / __ `__ \    / / ___/
  / /_/ / /_/ / /_/ / / / / /_/ /_/ / / / / / /   / (__  )
  \___\_\__,_/\__,_/_/ /_/\__/\__,_/_/ /_/ /_(_)_/ /____/
                                              /___/

  Google Storage Engine
  =====================

  A storage engine implementation that makes use of cloud storage
  and datastore for persistence.

*/

var cluster = require('cluster')
var Promise = require('bluebird')
var gcloud = require('gcloud')
var stream = require('stream')
var streamifier = require('streamifier')
var fs = Promise.promisifyAll(require('fs-extra'))
var path = require('path')

var scopes = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/devstorage.read_write',
  'https://www.googleapis.com/auth/datastore'
]

module.exports = function (options) {
  if (!cluster.isMaster) return

  var cloud = gcloud({
    projectId: options.projectId,
    keyFilename: options.credentialsFile
  })

  var bucket = cloud.storage().bucket(options.bucket)
  var dataset = Promise.promisifyAll(cloud.datastore.dataset())

  var api = {
    /* write a blob to storage */
    putBlobStream: function (kind, id, stream) {
      return new Promise(function (resolve, reject) {
        var writeStream = bucket.file(kind + '/' + id).createWriteStream()
        return stream
          .on('error', function (err) {
            reject(err)
          })
          .on('end', function () {
            resolve()
          })
          .pipe(writeStream)
      })
    },
    /* read a blob from storage and dump it on the local disk */
    blobToDisk: function (kind, id, filename) {
      return fs.ensureDirAsync(path.dirname(filename))
        .then(function () {
          return new Promise(function (resolve, reject) {
            bucket.file(kind + '/' + id).download({destination: filename}, function (err) {
              err ? reject(err) : resolve()
            })
          })
        })
    },
    /* put something to storage */
    putBlob: function (kind, id, data) {
      return api.putBlobStream(kind, id, streamifier.createReadStream(data))
    },
    /* get something to storage */
    getBlob: function (kind, id) {
      return new Promise(function (resolve, reject) {
        var file = bucket.file(kind + '/' + id)
        return file.exists(function (err, exists) {
          if (err) {
            reject(err)
          } else {
            if (exists) {
              file.download(function (err, content) {
                err ? reject(err) : resolve(content)
              })
            } else {
              resolve(undefined)
            }
          }
        })
      })
    },

    /* put something to storage */
    put: function (kind, id, data) {
      return dataset.saveAsync({
        key: dataset.key([kind, id]),
        data: {
          data: JSON.stringify(data)
        }
      })
    },
    /* get something from storage */
    get: function (kind, id) {
      return dataset.getAsync(dataset.key([kind, id]))
        .then(function (entity) {
          if (entity && entity.data && entity.data.data) {
            return JSON.parse(entity.data.data)
          } else {
            return undefined
          }
        })
    },
    /* delete something from storage */
    delete: function (kind, id) {
      return dataset.deleteAsync(dataset.key([kind, id]))
    },
    /* get all of a kind from storage */
    getAll: function (kind) {
      return dataset.runQueryAsync(dataset.createQuery(kind))
        .map(function (entity) {
          return JSON.parse(entity.data.data)
        })
    }
  }

  return api
}
