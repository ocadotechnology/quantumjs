/*
     ____                    __                      _
    / __ \__  ______ _____  / /___  ______ ___      (_)____
   / / / / / / / __ `/ __ \/ __/ / / / __ `__ \    / / ___/
  / /_/ / /_/ / /_/ / / / / /_/ /_/ / / / / / /   / (__  )
  \___\_\__,_/\__,_/_/ /_/\__/\__,_/_/ /_/ /_(_)_/ /____/
                                              /___/

  Manager
  =======

  This handles the interaction with the cluster. It ensures that new workers are forked
  when old ones die - it sends and reveives messages to and from the workers, and coordinates
  the building of a micro site.

*/

var cluster = require('cluster')
var os = require('os')
var path = require('path')
var Promise = require('bluebird')
var zip = Promise.promisify(require('extract-zip'))
var uuid = require('uuid')
var globby = require('globby')
var fs = Promise.promisifyAll(require('fs-extra'))
var merge = require('merge')

var BuildLogger = require('../misc/build-logger')
var Server = require('./server')
var Storage = require('./storage')
var layeredStorageEngine = require('../storage-engine/layered')

function Manager (opts) {
  console.log('master started')

  var options = merge({
    authenticationMiddleware: undefined,
    setupApp: undefined,
    builderVersion: '0.0.0',
    resourceDir: undefined,
    port: 3030,
    ssl: undefined,
    storageEngine: undefined,
    cacheStorageEngine: undefined
  }, opts)

  this.options = options

  var storageEngine = layeredStorageEngine(options.cacheStorageEngine, options.storageEngine)

  this.storage = new Storage(storageEngine, {
    builderVersion: options.builderVersion
  })

  var server = new Server(this, this.storage, {
    authenticationMiddleware: options.authenticationMiddleware,
    builderVersion: options.builderVersion,
    resourceDir: options.resourceDir,
    setupApp: options.setupApp,
    ssl: options.ssl,
    port: options.port
  })

  cluster.on('fork', function (worker) {
    console.log('New worker starting up')
  })

  cluster.on('online', function (worker) {
    console.log('New worker online: ' + worker.process.pid)
  })

  // restart workers when they die
  cluster.on('exit', function (worker, code, signal) {
    console.log('worker ' + worker.process.pid + ' died')
    console.log('Starting up a new worker in its place')
    cluster.fork()
  })

  // start up some workers
  var workerCount = os.cpus().length
  for (var i = 0; i < workerCount; i++) {
    cluster.fork()
  }
}

function randomWorker () {
  var keys = Object.keys(cluster.workers)
  var key = keys[Math.floor(Math.random() * keys.length)]
  return cluster.workers[key]
}

function extractArchive (archiveFilename, target) {
  return zip(archiveFilename, {dir: target})
    .then(function () {
      console.log('finished extracting')
      return target
    })
}

function buildSite (buildId, projectId, revision, sourceDir, buildDir) {
  return new Promise(function (resolve, reject) {
    var worker = randomWorker()
    console.log('build ' + buildId + ' sent to worker started')
    worker.send({ type: 'build', buildId: buildId, projectId: projectId, revision: revision, sourceDir: sourceDir, buildDir: buildDir })
    var handler = function (msg) {
      if (msg.buildId === buildId && msg.type === 'build-finished') {
        console.log('build ' + buildId + ' finished')
        console.log('storing build log for ' + buildId)
        resolve({buildLog: msg.buildLog})
        worker.removeListener('message', handler)
      }
    }
    worker.on('message', handler)
    worker.on('exit', function () {
      reject(new Error('Worker died when processing build'))
    })
  })
}

function publish (storage, projectId, buildDir, revision, builderVersion) {
  return globby(path.join(buildDir, '**', '*'), {nodir: true})
    .then(function (paths) {
      return Promise.all(paths)
        .map(function (filename) {
          return fs.readFileAsync(filename)
            .then(function (data) {
              var shortenedFilename = path.relative(buildDir, filename)
              console.log('Storing ' + projectId + '/' + revision + '/' + builderVersion + '/' + shortenedFilename)
              return storage.putStaticFile(projectId, revision, builderVersion, shortenedFilename, data)
            })
        }, {concurrency: 5})
    })
}

function cleanUp (buildId) {
  return fs.remove(path.join('target', buildId))
}

Manager.prototype = {
  // kicks off a new build for a project
  buildRevision: function (projectId, revision) {
    var self = this

    var buildId = uuid.v4()
    var archiveFilename = path.join('target', buildId, 'package.zip')
    var sourceDir = path.join('target', buildId, 'source')
    var buildDir = path.join('target', buildId, 'build')

    var buildLogger = new BuildLogger(buildId)

    buildLogger.info('starting build')
    buildLogger.info('copying archive to disk')
    return this.storage.siteArchiveToDisk(projectId, revision, archiveFilename)
      .then(function () {
        buildLogger.info('extracting archive')
        return extractArchive(archiveFilename, sourceDir)
      })
      .then(function () {
        buildLogger.info('building pages')
        return buildSite(buildId, projectId, revision, sourceDir, buildDir)
      })
      .then(function (res) {
        buildLogger.import(res.buildLog)
      })
      .then(function () {
        buildLogger.info('publishing the pages')
        return publish(self.storage, projectId, buildDir, revision, self.options.builderVersion)
      })
      .then(function () {
        buildLogger.info('cleaning up the build directory')
        return cleanUp(buildId)
      })
      .then(function () {
        buildLogger.info('finished build')
      })
      .catch(function (err) {
        buildLogger.error(err)
        buildLogger.info('something went wrong. cleaning up.')
        cleanUp(buildId)
        throw err
      })
      .then(function () {
        buildLogger.info('storing build log')
        return self.storage.putBuildLog(buildId, buildLogger.toJson())
      })
  }
}

module.exports = Manager
