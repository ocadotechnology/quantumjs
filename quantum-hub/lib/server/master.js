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
var unzip = Promise.promisify(require('extract-zip'))
var uuid = require('uuid')
var globby = require('globby')
var fs = Promise.promisifyAll(require('fs-extra'))
var merge = require('merge')

var BuildLogger = require('./build-logger')
var Server = require('./server')
var Storage = require('./storage')

function Manager (opts) {
  console.log('master started')

  var options = merge({
    authenticationMiddleware: undefined,
    setupApp: undefined,
    builderVersion: '0.0.0',
    resourceDir: undefined,
    port: 3030,
    ssl: undefined,
    storageEngine: undefined
  }, opts)

  this.options = options

  this.storage = new Storage(options.storageEngine, {
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

function extractArchive (buildLogger, archiveFilename, target) {
  buildLogger.info('Extracting archive ' + archiveFilename)
  return unzip(archiveFilename, {dir: target})
    .then(function () {
      buildLogger.info('Finished extracting archive ' + archiveFilename)
      return target
    })
}

function buildSite (buildId, projectId, sourceDir, buildDir) {
  return new Promise(function (resolve, reject) {
    var worker = randomWorker()
    console.log('Build ' + buildId + ' sent to worker started')
    worker.send({ type: 'build', buildId: buildId, projectId: projectId, sourceDir: sourceDir, buildDir: buildDir })
    var handler = function (msg) {
      if (msg.buildId === buildId && msg.type === 'build-finished') {
        console.log('Build ' + buildId + ' finished')
        console.log('Storing build log for ' + buildId)
        resolve({buildLog: msg.buildLog, quantumJson: msg.quantumJson})
        worker.removeListener('message', handler)
      }
    }
    worker.on('message', handler)
    worker.on('exit', function () {
      reject(new Error('Worker died when processing build'))
    })
  })
}

function storeBuild (storage, buildId, projectId, buildDir) {
  return globby(path.join(buildDir, '**', '*'), {nodir: true})
    .then(function (paths) {
      return Promise.all(paths)
        .map(function (filename) {
          return fs.readFileAsync(filename)
            .then(function (data) {
              var shortenedFilename = path.relative(buildDir, filename)
              console.log('Storing ' + projectId + '/' + buildId + '/' + shortenedFilename)
              return storage.putStaticFile(projectId, buildId, shortenedFilename, data)
            })
        }, {concurrency: 5})
    })
}

function cleanUp (buildId) {
  return fs.remove(path.join('target', buildId))
}

Manager.prototype = {
  // kicks off a new build for a project
  buildProject: function (projectId) {
    var storage = this.storage

    var buildId = uuid.v4()
    var archiveFilename = path.join('target', buildId, 'package.zip')
    var sourceDir = path.join('target', buildId, 'source')
    var tempDestDir = path.join('target', buildId, 'build')

    var buildLogger = new BuildLogger(buildId)

    buildLogger.info('Starting build')
    buildLogger.info('Copying archive to disk')
    return this.storage.revisionSourceArchiveToDisk(projectId, archiveFilename)
      .then(function () {
        return extractArchive(buildLogger, archiveFilename, sourceDir)
      })
      .then(function () {
        buildLogger.info('Building site')
        return buildSite(buildId, projectId, sourceDir, tempDestDir)
      })
      .then(function (res) {
        buildLogger.import(res.buildLog)
        buildLogger.info('Storing the build')
        return storeBuild(storage, buildId, projectId, tempDestDir)
          .then(function () {
            buildLogger.info('Cleaning up the build directory')
            return cleanUp(buildId)
          })
          .then(function () {
            buildLogger.info('Finished build')
            return {
              quantumJson: res.quantumJson,
              buildLog: res.buildLog,
              buildId: buildId
            }
          })
      })
      .catch(function (err) {
        buildLogger.error(err)
        buildLogger.info('Something went wrong. cleaning up.')
        cleanUp(buildId)
        throw err
      })
  }
}

module.exports = Manager
