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
  api for working on the storage entites needed for quantumhub.

*/

module.exports = function (engine, options) {
  return {
    /* stores a projects credentials */
    putProjectCredentials: function (id, secrets) {
      return engine.put('ProjectCredential', id, secrets)
    },

    /* gets a single project's credentials by its id */
    getProjectCredentials: function (id) {
      return engine.get('ProjectCredential', id)
    },

    /* stores a single project's details (quantum.json) */
    putProject: function (id, details) {
      return engine.put('Project', id, details)
    },

    /* deletes a single projects details */
    deleteProject: function (id, details) {
      return engine.delete('Project', id)
        .then(function () {
          return engine.delete('ProjectCredential')
        })
    },

    /* gets a single project by its id (quantum.json) */
    getProject: function (id) {
      return engine.get('Project', id)
    },

    /* returns a list of all the projects registered (quantum.json) */
    getProjects: function () {
      return engine.getAll('Project')
    },

    /* stores a single projects details */
    putBuildLog: function (id, details) {
      return engine.put('BuildLog', id, details)
    },

    /* deletes a single projects details */
    deleteBuildLog: function (id, details) {
      return engine.delete('BuildLog', id)
    },

    /* gets a single project by its id */
    getBuildLog: function (id) {
      return engine.get('BuildLog', id)
    },

    /* returns a list of all the projects registered */
    getBuildLogs: function () {
      return engine.getAll('BuildLog')
    },

    /* streams a site archive to storage */
    putSiteArchiveStream: function (projectId, revision, stream) {
      return engine.putBlobStream('SiteArchive', projectId + '/' + revision + '.zip', stream)
    },

    /* streams a site archive from storage to disk */
    siteArchiveToDisk: function (projectId, revision, targetFilename) {
      return engine.blobToDisk('SiteArchive', projectId + '/' + revision + '.zip', targetFilename)
    },

    /* gets the revision details for a projectId */
    putRevisionDetails: function (projectId, revision, details) {
      return engine.put('RevisionDetails', projectId + ':' + revision, details)
    },

    /* gets the revision details for a projectId */
    getRevisionDetails: function (projectId, revision) {
      return engine.get('RevisionDetails', projectId + ':' + revision)
    },

    /* gets the latest revision details for a projectId */
    putLatestRevision: function (projectId, details) {
      return engine.put('LatestRevision', projectId, details)
    },

    /* gets the latest revision details for a projectId */
    getLatestRevision: function (projectId) {
      return engine.get('LatestRevision', projectId)
    },

    /* gets the latest revision details all projects */
    getLatestRevisions: function () {
      return engine.getAll('LatestRevision')
    },

    /* stores info about when a build was created */
    putBuildInfo: function (projectId, revision, details) {
      return engine.put('BuildInfo', projectId + ':' + revision + ':' + options.builderVersion, details)
    },

    /* gets info about when a build was created */
    getBuildInfo: function (projectId, revision) {
      return engine.get('BuildInfo', projectId + ':' + revision + ':' + options.builderVersion)
    },

    /* gets the active revision details for a projectId */
    putActiveBuild: function (projectId, details) {
      return engine.put('ActiveBuild', projectId, details)
    },

    /* gets the active revision details for a projectId */
    getActiveBuild: function (projectId) {
      return engine.get('ActiveBuild', projectId)
    },

    /* gets the active revision details for all projects */
    getActiveBuilds: function () {
      return engine.getAll('ActiveBuild')
    },

    /* puts a static file */
    putStaticFile: function (projectId, revision, builderVersion, filename, data) {
      return engine.putBlob('StaticFile', projectId + '/' + revision + '/' + builderVersion + '/' + filename, data)
    },

    /* gets a static file. returns undefined if it doesn't exist */
    getStaticFile: function (projectId, revision, builderVersion, filename) {
      return engine.getBlob('StaticFile', projectId + '/' + revision + '/' + builderVersion + '/' + filename)
    }

  }
}
