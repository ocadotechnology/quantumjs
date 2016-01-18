var Promise = require('bluebird')
var cluster = require('cluster')

// adds a faster caching layer using a secondary storage engine (which doesn't have)
// to persist data anywhere if it doesn't want to.
// also keeps a in memory cache of entity entries for extra fast lookup
module.exports = function (baseStorageEngine, cacheStorageEngine, entityTimeout) {
  if (!cluster.isMaster) return

  // store for the entity methods
  var store = {}

  return {
    /* write a blob to storage */
    putBlobStream: baseStorageEngine.putBlobStream,
    /* read a blob from storage and dump it on the local disk */
    blobToDisk: baseStorageEngine.blobToDisk,
    /* put something to storage */
    putBlob: function (kind, id, data) {
      return Promise.all([
        cacheStorageEngine.putBlob(kind, id, data),
        baseStorageEngine.putBlob(kind, id, data)
      ])
    },
    /* get something from storage */
    getBlob: function (kind, id) {
      return cacheStorageEngine.getBlob(kind, id)
        .then(function (data) {
          if (data === undefined) {
            return baseStorageEngine.getBlob(kind, id)
              .then(function (d) {
                if (d) {
                  cacheStorageEngine.putBlob(kind, id, d)
                }
                return d
              })
          } else {
            return data
          }
        }, function (data) {
          return baseStorageEngine.getBlob(kind, id)
        })
    },
    /* put something to storage */
    put: function (kind, id, data, options) {
      var key = 'single:' + kind + ':' + id
      store[key] = {
        datestamp: Date.now(),
        data: data
      }
      return baseStorageEngine.put(kind, id, data)
    },
    /* get something from storage */
    get: function (kind, id, options) {
      var key = 'single:' + kind + ':' + id
      if ((options && options.skipCache) || store[key] === undefined || store[key].datestamp <= Date.now() - entityTimeout) {
        return baseStorageEngine.get(kind, id)
          .then(function (d) {
            store[key] = {
              datestamp: Date.now(),
              data: d
            }
            return d
          })
      } else {
        return Promise.resolve(store[key].data)
      }
    },
    /* delete something from storage */
    delete: function (kind, id, options) {
      store['all:' + kind] = undefined
      store['single:' + kind + ':' + id] = undefined
      return baseStorageEngine.delete(kind, id, data)
    },
    /* get all of a kind from storage */
    getAll: function (kind, options) {
      var key = 'all:' + kind
      if ((options && options.skipCache) || store[key] === undefined || store[key].datestamp <= Date.now() - entityTimeout) {
        return baseStorageEngine.getAll(kind)
          .then(function (d) {
            store[key] = {
              datestamp: Date.now(),
              data: d
            }
            return d
          })
      } else {
        return Promise.resolve(store[key].data)
      }
    }
  }
}
