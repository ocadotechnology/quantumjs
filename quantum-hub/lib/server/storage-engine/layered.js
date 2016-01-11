/*
     ____                    __                      _
    / __ \__  ______ _____  / /___  ______ ___      (_)____
   / / / / / / / __ `/ __ \/ __/ / / / __ `__ \    / / ___/
  / /_/ / /_/ / /_/ / / / / /_/ /_/ / / / / / /   / (__  )
  \___\_\__,_/\__,_/_/ /_/\__/\__,_/_/ /_/ /_(_)_/ /____/
                                              /___/

  Layered storage Engine
  ======================

  A layered storage engine that writes to all layers, and reads from the first
  (the idea being that the top level is a cache, the next is local disk or something, and
  last is some reliable persistence (a database))

*/

var cluster = require('cluster')

// handles the caching logic
function getAndUpdate (storageEngines, methods) {
  var enginesToTry = storageEngines.slice()
  var enginesTried = []

  function populateTriedEngines (blob) {
    return Promise.all(enginesTried.map(function (engine) {
      methods.set(engine, blob)
    })).then(function () {
      return blob
    }).catch(function (err) {
      // we don't want to return this error - since it doesn't really matter if
      // one of the engine sets failed when reading - they are only there to improve
      // the state of the cache
      console.warn(err)
      return blob
    })
  }

  function tryNextEngine () {
    if (enginesToTry.length > 0) {
      var currentEngine = enginesToTry.shift()
      enginesTried.push(currentEngine)
      return methods.get(currentEngine)
        .then(populateTriedEngines)
        .catch(tryNextEngine)
    } else {
      return Promise.resolve(undefined)
    }
  }

  return tryNextEngine()
}

module.exports = function (storageEngines) {
  if (!cluster.isMaster) return

  return {
    /* write a blob to storage */
    putBlobStream: function (kind, id, stream) {
      return Promise.all(storageEngines.map(function (se) {
        return se.putBlobStream(kind, id, stream)
      }))
    },
    /* read a blob from storage and dump it on the local disk */
    blobToDisk: function (kind, id, filename) {
      return Promise.all(storageEngines.map(function (se) {
        return se.blobToDisk(kind, id, filename)
      }))
    },
    /* put something to storage */
    putBlob: function (kind, id, data) {
      return Promise.all(storageEngines.map(function (se) {
        return se.putBlob(kind, id, data)
      }))
    },
    /* get something from storage */
    getBlob: function (kind, id) {
      return getAndUpdate(storageEngines, {
        get: function (engine) {
          return engine.getBlob(kind, id)
        },
        set: function (engine, blob) {
          return engine.putBlob(kind, id, blob)
        }
      })
    },

    /* put something to storage */
    put: function (kind, id, data) {
      return Promise.all(storageEngines.map(function (se) {
        return se.putBlob(kind, id, data)
      }))
    },
    /* get something from storage */
    get: function (kind, id) {
      return getAndUpdate(storageEngines, {
        get: function (engine) {
          return engine.get(kind, id)
        },
        set: function (engine, blob) {
          return engine.put(kind, id, blob)
        }
      })
    },
    /* delete something from storage */
    delete: function (kind, id) {
      return Promise.all(storageEngines.map(function (se) {
        return se.delete(kind, id)
      }))
    },
    /* get all of a kind from storage */
    getAll: function (kind) {
      return Promise.all(storageEngines.map(function (se) {
        return se.getAll(kind)
      }))
    }
  }
}
