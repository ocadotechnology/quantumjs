/*
     ____                    __                      _
    / __ \__  ______ _____  / /___  ______ ___      (_)____
   / / / / / / / __ `/ __ \/ __/ / / / __ `__ \    / / ___/
  / /_/ / /_/ / /_/ / / / / /_/ /_/ / / / / / /   / (__  )
  \___\_\__,_/\__,_/_/ /_/\__/\__,_/_/ /_/ /_(_)_/ /____/
                                              /___/

  Client
  ======

  This file has the code for the quantum hub client library. This library
  lets documentation be built locally, and be published to a central hub.

*/

var Promise = require('bluebird')
var path = require('path')
var yazl = require('yazl')
var globby = require('globby')
var fs = Promise.promisifyAll(require('fs-extra'))
var request = require('request')
var requestAsync = Promise.promisify(request)
var merge = require('merge')
var liveserver = require('live-server')

var compiler = require('./compiler')
var utils = require('./utils')

function logBuildEvents (eventEmitter, options) {
  if (!options.quiet) {
    if (options.progress) {
      utils.progressBarLogger(eventEmitter)
    } else {
      utils.verboseLogger(eventEmitter)
    }
  }
}

function checkOptions (options, requirements) {
  var rs = Object.keys(requirements)
  for (var i=0; i<rs.length; i++) {
    var r = requirements[rs[i]]
    if (!options[r]) {
      return Promise.reject(new Error('Missing option "' + r + '"'))
    }
  }
}

// initialises a new project
function init (options) {
  var optionCheckResult = checkOptions(options, ['dir'])
  if (optionCheckResult) return optionCheckResult

  var quantumJsonFilename = path.join(options.dir, 'quantum.json')

  return fs.statAsync(quantumJsonFilename).then(function () {
    return true
  }).catch(function () {
    return false
  }).then(function (exists) {
    if (exists) {
      throw new Error('A project already exists in ' + options.dir)
    }

    var suggestedProjectId = path.basename(path.resolve(options.dir))
      .split('-')
      .map(function (part) {
        return part[0].toUpperCase() + part.slice(1).toLowerCase()
      }).join(' ')

    return fs.outputJsonAsync(quantumJsonFilename, {
      name: suggestedProjectId,
      description: '<description of project>',
      pages: '**/*.um',
      files: '**/*.um',
      base: '.'
    })
  })
}

// posts the project to the central server
function publish (options) {
  var optionCheckResult = checkOptions(options, ['dir', 'host', 'key', 'projectId', 'files'])
  if (optionCheckResult) return optionCheckResult

  return globby(options.files || [], {cwd: options.dir, nodir: true})
    .then(function (files) {
      return ['quantum.json'].concat(files)
    })
    .then(function (files) {
      return new Promise(function (resolve, reject) {
        var zipfile = new yazl.ZipFile()

        files.forEach(function (filename) {
          zipfile.addFile(path.join(options.dir, filename), filename)
        })

        zipfile.outputStream.pipe(request.post({
          url: options.host + '/api/v1/projects/' + options.projectId + '?key=' + options.key,
          agentOptions: {
            ca: options.ca
          }
        }, function (err, res, body) {
          if (err) {
            reject(err)
          } else {
            if (res.statusCode === 200) {
              resolve(JSON.parse(body))
            } else {
              try {
                reject(JSON.parse(body).error)
              } catch (err) {
                reject(body)
              }
            }
          }
        }))
        zipfile.end()
      })
    })
}

function startServer (options) {
  liveserver.start({
    port: options.port,
    host: '0.0.0.0',
    root: options.root,
    open: false,
    wait: 0
  })
}

function copyResources (options) {
  if (options.resourceDir) {
    return fs.copyAsync(options.resourceDir, path.join(options.dest, 'resources'))
  } else {
    return Promise.resolve()
  }
}

/* Builds the microsite locally */
function build (opts) {
  var options = merge({
    dir: process.cwd(),
    pipeline: undefined,
    pages: '**/*.um',
    base: '.',
    dest: path.join(process.cwd(), 'target'),
    isLocal: true,
    customPipelineConfig: {},
    buildConcurrency: 1,
    quiet: false,
    progress: false
  }, opts)

  var buildResult = compiler.build(options)
  logBuildEvents(buildResult.events, options)

  return buildResult.promise.then(function () {
    return copyResources(options)
  })
}

/* Builds and watches the microsite locally */
function watch (opts) {
  var options = merge({
    dir: process.cwd(),
    pipeline: undefined,
    resourceDir: undefined,
    pages: '**/*.um',
    base: '.',
    dest: path.join(process.cwd(), 'target'),
    isLocal: true,
    customPipelineConfig: {},
    buildConcurrency: 1,
    port: 8000,
    quiet: false,
    progress: false
  }, opts)

  var watchResult = compiler.watch(options)

  watchResult.events.on('start', function (evt) {
    logBuildEvents(evt.events, options)
  })

  return watchResult.promise
    .then(function () {
      return copyResources(options)
    })
    .then(function () {
      startServer({
        port: options.port,
        root: options.dest
      })

    })
}

module.exports = {
  init: init,
  publish: publish,
  build: build,
  watch: watch
}
