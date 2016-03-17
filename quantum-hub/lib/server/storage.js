/*
     ____                    __                      _
    / __ \__  ______ _____  / /___  ______ ___      (_)____
   / / / / / / / __ `/ __ \/ __/ / / / __ `__ \    / / ___/
  / /_/ / /_/ / /_/ / / / / /_/ /_/ / / / / / /   / (__  )
  \___\_\__,_/\__,_/_/ /_/\__/\__,_/_/ /_/ /_(_)_/ /____/
                                              /___/

  Storage
  =======

  The storage library for the hub server. This expects a storage
  engine to be passed in - the storage engine will actually do the
  storage to something persistent - this just provides a convenient
  api for working on the storage entities needed for quantumhub.

*/

module.exports = function (engine, options) {
  return {
    /* Project data */

    putProject: function (id, details, opts) {
      return engine.put('Project', id, details, opts)
    },

    getProject: function (id, opts) {
      return engine.get('Project', id, opts)
    },

    getProjects: function (opts) {
      return engine.getAll('Project', opts).map(function (obj) {
        return obj.value
      })
    },

    /* User data */

    putUser: function (id, details, opts) {
      return engine.put('User', id, details, opts)
    },

    getUser: function (id, opts) {
      return engine.get('User', id, opts)
    },

    getUsers: function (opts) {
      return engine.getAll('User', opts).map(function (obj) {
        return obj.value
      })
    },

    /* Uploaded site archives */

    putArchiveStream: function (projectId, stream, opts) {
      return engine.putBlobStream('Archive', projectId + '.zip', stream, opts)
    },

    archiveStreamToDisk: function (projectId, targetFilename, opts) {
      return engine.blobToDisk('Archive', projectId + '.zip', targetFilename, opts)
    },

    /* Static file storage */

    putStaticFile: function (projectId, buildId, filename, data, opts) {
      return engine.putBlob('StaticFile', projectId + '/' + buildId + '/' + filename, data, opts)
    },

    getStaticFile: function (projectId, buildId, filename, opts) {
      return engine.getBlob('StaticFile', projectId + '/' + buildId + '/' + filename, opts)
    },

    /* Helper functions */

    isValidKeyForProject: function (projectId, key) {
      var storage = this
      return storage.getProject(projectId).then(function (project) {
        if (project.projectKeys.indexOf(key) !== -1) {
          return true
        } else {
          return Promise.all(project.users.map(storage.getUser))
            .map(function (users) {
              return users.some(function (user) {
                return user.keys.indexOf(key) !== -1
              })
            })
        }
      })
    }

  }
}
