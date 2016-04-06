/*
     ____                    __                      _
    / __ \__  ______ _____  / /___  ______ ___      (_)____
   / / / / / / / __ `/ __ \/ __/ / / / __ `__ \    / / ___/
  / /_/ / /_/ / /_/ / / / / /_/ /_/ / / / / / /   / (__  )
  \___\_\__,_/\__,_/_/ /_/\__/\__,_/_/ /_/ /_(_)_/ /____/
                                              /___/

  Worker
  ======

  Handles the bulding of a site in a different process to avoid blocking
  on the normal http server.

*/

var cluster = require('cluster')
var cli = require('quantum-cli')
var BuildLogger = require('./build-logger')
var Promise = require('bluebird')
var fs = Promise.promisifyAll(require('fs-extra'))
var path = require('path')

function buildLoggerLogger (logger, eventEmitter) {
  var startTimes = {}
  eventEmitter
    .on('pagesstart', function (evt) {
      logger.info('Rebuilding ' + evt.filenames.length + ' pages.')
    })
    .on('pagestart', function (evt) {
      logger.info('Starting ' + evt.filename)
      startTimes[evt.filename] = Date.now()
    })
    .on('pagefinish', function (evt) {
      logger.info('Finished ' + evt.filename + '. Took ' + (Date.now() - startTimes[evt.filename]) + ' ms.')
    })
    .on('pagesfinish', function (evt) {
      logger.info('Finished builing ' + evt.filenames.length + ' pages.')
    })
}

function Worker (options) {
  console.log('New worker started')

  cluster.worker.on('message', function (msg) {
    console.log('New build started', msg)
    var buildLogger = new BuildLogger(msg.buildId)

    fs.readJsonAsync(path.join(msg.sourceDir, 'quantum.json')).then(function (quantumJson) {
      var pages = quantumJson.pages || '**/*.um'
      var base = quantumJson.base || '.'
      var customPipelineConfig = quantumJson

      var build = cli.compiler.build({
        dir: msg.sourceDir,
        dest: msg.buildDir,
        resourceDir: undefined,
        pipeline: options.pipeline,
        config: quantumJson,
        isLocal: false, // we are building for the server
        pages: pages,
        base: base,
        customPipelineConfig: customPipelineConfig
      })
      cli.utils.verboseLogger(build.events)
      buildLoggerLogger(buildLogger, build.events)

      return build.promise.then(function () {
        process.send({
          type: 'build-finished',
          quantumJson: quantumJson,
          buildId: msg.buildId,
          projectId: msg.projectId,
          outputDir: msg.buildDir,
          buildLog: buildLogger.export()
        })
      })
    })

  })
}

module.exports = Worker
