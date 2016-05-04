var Promise = require('bluebird')
var fs = Promise.promisifyAll(require('fs-extra'))
var path = require('path')
var EventEmitter = require('events').EventEmitter
var merge = require('merge')
var quantum = require('quantum-js')
var quantumWatch = require('quantum-watch')

var utils = require('./utils')

// resolves the options against the defaults
function resolveOptions (options) {
  return merge({
    dir: process.cwd(),
    pipeline: undefined,
    pages: { files: ['**/*.um'], base: ''},
    dest: path.join(process.cwd(), 'target'),
    isLocal: false,
    customPipelineConfig: {},
    buildConcurrency: 1
  }, options)
}

// one-off build for the docs in the directory specified
function build (opts) {
  var options = resolveOptions(opts)
  var eventEmitter = new EventEmitter
  var compile = options.pipeline(options.customPipelineConfig, { isLocal: options.isLocal })

  eventEmitter.emit('start', {})

  var promise = utils.resolveFiles(options.pages, options)
    .then(function (sourceObjs) {
      console.log(sourceObjs)
      var filenames = sourceObjs.map(function (obj) { return obj.resolved })
      eventEmitter.emit('pagesstart', {filenames: filenames})
      return sourceObjs
    })
    .map(function (sourceObj) {
      eventEmitter.emit('pagestart', { filename: sourceObj.resolved })
      return quantum.read.single(sourceObj.src, { base: sourceObj.base })
        .then(compile)
        .then(function () {
          eventEmitter.emit('pagefinish', { filename: sourceObj.resolved, outputCount: pages.length })
          return sourceObj.resolved
        })
    }, options.buildConcurrency)
    .then(function (filenames) {
      eventEmitter.emit('pagesfinish', { filenames: filenames })
      eventEmitter.emit('finish', {})
    })

  return {
    promise: promise,
    events: eventEmitter
  }
}

// build, then watch for changes in the directory specified and rebuild on change
function watch (opts) {
  var options = resolveOptions(opts)
  var watchEventEmitter = new EventEmitter
  var compile = options.pipeline(options.customPipelineConfig, { isLocal: options.isLocal })

  var quantumWatchOptions = {
    base: options.base ? path.join(options.dir, options.base) : options.dir,
    dir: options.dir
  }

  var promise = quantumWatch(path.join(options.dir, options.pages), quantumWatchOptions, function (obj) {
    var eventEmitter = new EventEmitter
    watchEventEmitter.emit('start', { events: eventEmitter })
    return compile(obj)
  }).then(function (build) {
    return build()
  })

  return {
    promise: promise,
    events: watchEventEmitter
  }
}

module.exports = {
  build: build,
  watch: watch
}
