var Promise = require('bluebird')
var fs = Promise.promisifyAll(require('fs-extra'))
var path = require('path')
var EventEmitter = require('events').EventEmitter
var merge = require('merge')
var quantum = require('quantum-js')
var quantumWatch = require('quantum-watch')

// resolves the options against the defaults
function resolveOptions (options) {
  return merge({
    dir: process.cwd(),
    pipeline: undefined,
    pages: '**/*.um',
    base: '.',
    dest: path.join(process.cwd(), 'target'),
    isLocal: false,
    customPipelineConfig: {},
    buildConcurrency: 1
  }, options)
}

// builds the pages supplied as {filename, content} objects and logs to an event emitter
function buildPages (objs, eventEmitter, options) {
  var compile = options.pipeline(options.customPipelineConfig, { isLocal: options.isLocal })

  eventEmitter.emit('start', {})

  var filenames = objs.map(function (obj) { return obj.filename })
  eventEmitter.emit('pagesstart', {filenames: filenames})

  return Promise.all(objs)
    .map(function (obj) {
      eventEmitter.emit('pagestart', { filename: obj.filename })
      return compile(obj)
        .then(function (res) {
          return Array.isArray(res) ? res : [res]
        })
        .map(quantum.write(options.dest))
        .then(function (pages) {
          eventEmitter.emit('pagefinish', { filename: obj.filename, outputCount: pages.length })
          return obj.filename
        })
    }, {concurrency: options.buildConcurrency})
    .then(function (filenames) {
      eventEmitter.emit('pagesfinish', { filenames: filenames })
      eventEmitter.emit('finish', {})
    })
}

// one-off build for the docs in the directory specified
function build (opts) {
  var options = resolveOptions(opts)

  var eventEmitter = new EventEmitter

  var promise = quantum.read(path.join(options.dir, options.pages), {base: options.base ? path.join(options.dir, options.base) : options.dir})
    .then(function (objs) {
      return buildPages(objs, eventEmitter, options)
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

  var quantumWatchOptions = {
    base: options.base ? path.join(options.dir, options.base) : options.dir,
    dir: options.dir
  }

  var promise = quantumWatch(path.join(options.dir, options.pages), quantumWatchOptions, function (objs) {
    var eventEmitter = new EventEmitter
    watchEventEmitter.emit('start', { events: eventEmitter })
    return buildPages(objs, eventEmitter, options)
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
