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
    /* stores a projects credentials */
    putProjectCredentials: function (id, secrets, opts) {
      return engine.put('ProjectCredential', id, secrets, opts)
    },

    /* gets a single project's credentials by its id */
    getProjectCredentials: function (id, opts) {
      return engine.get('ProjectCredential', id, opts)
    },

    /* stores a single project's details (quantum.json) */
    putProject: function (id, details, opts) {
      return engine.put('Project', id, details, opts)
    },

    /* deletes a single projects details */
    deleteProject: function (id, details, opts) {
      return engine.delete('Project', id, opts)
        .then(function () {
          return engine.delete('ProjectCredential', opts)
        })
    },

    /* gets a single project by its id (quantum.json) */
    getProject: function (id, opts) {
      return engine.get('Project', id, opts)
    },

    /* returns a list of all the projects registered (quantum.json) */
    getProjects: function (opts) {
      return engine.getAll('Project', opts)
    },

    /* stores a single projects details */
    putBuildLog: function (id, details, opts) {
      return engine.put('BuildLog', id, details, opts)
    },

    /* deletes a single projects details */
    deleteBuildLog: function (id, details, opts) {
      return engine.delete('BuildLog', id, opts)
    },

    /* gets a single project by its id */
    getBuildLog: function (id, opts) {
      return engine.get('BuildLog', id, opts)
    },

    /* returns a list of all the projects registered */
    getBuildLogs: function (opts) {
      return engine.getAll('BuildLog', opts)
    },

    /* streams a site archive to storage */
    putSiteArchiveStream: function (projectId, revision, stream, opts) {
      return engine.putBlobStream('SiteArchive', projectId + '/' + revision + '.zip', stream, opts)
    },

    /* streams a site archive from storage to disk */
    siteArchiveToDisk: function (projectId, revision, targetFilename, opts) {
      return engine.blobToDisk('SiteArchive', projectId + '/' + revision + '.zip', targetFilename, opts)
    },

    /* gets the revision details for a projectId */
    putRevisionDetails: function (projectId, revision, details, opts) {
      return engine.put('RevisionDetails', projectId + ':' + revision, details, opts)
    },

    /* gets the revision details for a projectId */
    getRevisionDetails: function (projectId, revision, opts) {
      return engine.get('RevisionDetails', projectId + ':' + revision, opts)
    },

    /* gets the latest revision details for a projectId */
    putLatestRevision: function (projectId, details, opts) {
      return engine.put('LatestRevision', projectId, details, opts)
    },

    /* gets the latest revision details for a projectId */
    getLatestRevision: function (projectId, opts) {
      return engine.get('LatestRevision', projectId, opts)
    },

    /* gets the latest revision details all projects */
    getLatestRevisions: function (opts) {
      return engine.getAll('LatestRevision', opts)
    },

    /* stores info about when a build was created */
    putBuildInfo: function (projectId, revision, details, opts) {
      return engine.put('BuildInfo', projectId + ':' + revision + ':' + options.builderVersion, details, opts)
    },

    /* gets info about when a build was created */
    getBuildInfo: function (projectId, revision, opts) {
      return engine.get('BuildInfo', projectId + ':' + revision + ':' + options.builderVersion, opts)
    },

    /* gets the active revision details for a projectId */
    putActiveBuild: function (projectId, details, opts) {
      return engine.put('ActiveBuild', projectId, details, opts)
    },

    /* gets the active revision details for a projectId */
    getActiveBuild: function (projectId, opts) {
      return engine.get('ActiveBuild', projectId, opts)
    },

    /* gets the active revision details for all projects */
    getActiveBuilds: function (opts) {
      return engine.getAll('ActiveBuild', opts)
    },

    /* puts a static file */
    putStaticFile: function (projectId, revision, builderVersion, filename, data, opts) {
      return engine.putBlob('StaticFile', projectId + '/' + revision + '/' + builderVersion + '/' + filename, data, opts)
    },

    /* gets a static file. returns undefined if it doesn't exist */
    getStaticFile: function (projectId, revision, builderVersion, filename, opts) {
      return engine.getBlob('StaticFile', projectId + '/' + revision + '/' + builderVersion + '/' + filename, opts)
    }

  }
}
