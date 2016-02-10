/*
     ____                    __                      _
    / __ \__  ______ _____  / /___  ______ ___      (_)____
   / / / / / / / __ `/ __ \/ __/ / / / __ `__ \    / / ___/
  / /_/ / /_/ / /_/ / / / / /_/ /_/ / / / / / /   / (__  )
  \___\_\__,_/\__,_/_/ /_/\__/\__,_/_/ /_/ /_(_)_/ /____/
                                              /___/

  Layered Storage Engine
  ======================

  A storage engine implementation that combines two other storage
  engines - one that is faster that doesn't have to be reliable
  and one that is reliable (and might be slower)

*/

var Promise = require('bluebird')
var cluster = require('cluster')

module.exports = function (cacheStorageEngine, persistentStorageEngine) {
  if (!cluster.isMaster) return

  var retryOptions = {
    retries: 100, // after 100 retries we can be fairly sure that the cache is down, so retrying doesn't matter anyway
    minTimeout: 1 * 1000,
    maxTimeout: 60 * 1000,
    randomize: true,
  }

  function removeBlobFromCacheWithRetries (kind, id) {
    var operation = retry.operation(retryOptions)

    operation.attempt(function () {
      cacheStorageEngine.deleteBlob(kind, id)
        .catch(function (err) {
          operation.retry(err)
        })
    })
  }

  function removeEntityFromCacheWithRetries (kind, id) {
    var operation = retry.operation(retryOptions)

    operation.attempt(function () {
      cacheStorageEngine.delete(kind, id)
        .catch(function (err) {
          operation.retry(err)
        })
    })
  }

  return {
    /* write a blob to storage */
    putBlobStream: function (kind, id, stream) {
      var cachePromiseThatAlwaysSucceeds = cacheStorageEngine.putBlobStream(kind, id, stream)
        .catch(function () {
          // if this fails and the cache is acually up, then the cache will be in an invalid state
          // in this case we need to make sure the entry in the cache is nuked next time the cache
          // is available
          removeBlobFromCacheWithRetries(kind, id)
        })

      return persistentStorageEngine.putBlobStream(kind, id, stream)
        .then(function () {
          return cachePromiseThatAlwaysSucceeds
        })
    },
    /* read a blob from storage and dump it on the local disk */
    blobToDisk: function (kind, id, stream) {
      return cacheStorageEngine.blobToDisk(kind, id, stream)
        .catch(function () {
          return persistentStorageEngine.blobToDisk(kind, id, stream)
        })
    },
    /* put something to storage */
    putBlob: function (kind, id, data) {
      var cachePromiseThatAlwaysSucceeds = cacheStorageEngine.putBlob(kind, id, data)
        .catch(function () {
          // if this fails and the cache is acually up, then the cache will be in an invalid state
          // in this case we need to make sure the entry in the cache is nuked next time the cache
          // is available
          removeEntityFromCacheWithRetries(kind, id)
        })

      return persistentStorageEngine.putBlob(kind, id, data)
        .then(function () {
          return cachePromiseThatAlwaysSucceeds
        })
    },
    /* get something from storage */
    getBlob: function (kind, id) {
      return cacheStorageEngine.getBlob(kind, id)
        .then(function (data) {
          if (data === undefined) {
            return persistentStorageEngine.getBlob(kind, id)
              .then(function (d) {
                if (d !== undefined) {
                  cacheStorageEngine.putBlob(kind, id, d)
                }
                return d
              })
          } else {
            return data
          }
        }, function (data) {
          return persistentStorageEngine.getBlob(kind, id)
        })
    },
    /* deletes a blob */
    deleteBlob: function (kind, id) {
      var cachePromiseThatAlwaysSucceeds = cacheStorageEngine.delete(kind, id)
        .catch(function () {
          // if this fails and the cache is acually up, then the cache will be in an invalid state
          // in this case we need to make sure the entry in the cache is nuked next time the cache
          // is available
          removeEntityFromCacheWithRetries(kind, id)
        })

      return persistentStorageEngine.delete(kind, id)
        .then(function () {
          return cachePromiseThatAlwaysSucceeds
        })
    },
    /* put something to storage */
    put: function (kind, id, data) {
      var cachePromiseThatAlwaysSucceeds = cacheStorageEngine.put(kind, id, data)
        .catch(function () {
          // if this fails and the cache is acually up, then the cache will be in an invalid state
          // in this case we need to make sure the entry in the cache is nuked next time the cache
          // is available
          removeEntityFromCacheWithRetries(kind, id)
        })

      return persistentStorageEngine.put(kind, id, data)
        .then(function () {
          return cachePromiseThatAlwaysSucceeds
        })
    },
    /* get something from storage */
    get: function (kind, id) {
      return cacheStorageEngine.get(kind, id)
        .then(function (data) {
          if (data === undefined) {
            return persistentStorageEngine.get(kind, id)
              .then(function (d) {
                if (d !== undefined) {
                  cacheStorageEngine.put(kind, id, d)
                }
                return d
              })
          } else {
            return data
          }
        }, function (data) {
          return persistentStorageEngine.get(kind, id)
        })
    },
    /* delete something from storage */
    delete: function (kind, id, options) {
      var cachePromiseThatAlwaysSucceeds = cacheStorageEngine.delete(kind, id, data)
        .catch(function () {}) // probably doesn't matter if it fails (if the cache is down?)

      return persistentStorageEngine.delete(kind, id, data)
        .then(function () {
          return cachePromiseThatAlwaysSucceeds
        })
    },
    /* get all of a kind from storage */
    getAll: function (kind, options) {
      return cacheStorageEngine.getAll(kind)
        .then(function (data) {
          if (data === undefined || data.length === 0) {
            return persistentStorageEngine.getAll(kind)
              .then(function (entities) {
                return Promise.all(entities.map(function(e) {
                  return cacheStorageEngine.put(kind, e.key, e.value)
                })).then(function () {
                  return entities
                }).catch (function (err) {
                  // doesn't really matter if this fails - just carry on without putting to the cache
                  console.log(err)
                  return entities
                })
              })
          } else {
            return data
          }
        }, function (err) {
          return persistentStorageEngine.getAll(kind, id)
        })
    }
  }
}
