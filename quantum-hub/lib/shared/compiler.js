var Promise = require('bluebird')
var fs = Promise.promisifyAll(require('fs-extra'))
var path = require('path')
var EventEmitter = require('events').EventEmitter
var merge = require('merge')
var quantum = require('quantum-js')
var quantumwatch = require('quantum-watch')

// resolves the options against the defaults
function resolveOptions (options) {
  return merge({
    dir: process.cwd(),
    pipeline: undefined,
    resourceDir: undefined,
    dest: path.join(process.cwd(), 'target'),
    config: {
      pages: '**/*.um',
      base: '.',
      description: '',
      projectId: undefined
    }
  }, options)
}

// builds the pages supplied as {filename, content} objects and logs to an event emitter
function buildPages (objs, eventEmitter, options) {
  var compile = options.pipeline(options.config, {isLocal: options.isLocal })

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
        .then(function () {
          eventEmitter.emit('pagefinish', { filename: obj.filename })
          return obj.filename
        })
    }, {concurrency: 1})
    .then(function (filenames) {
      eventEmitter.emit('pagesfinish', { filenames: filenames })
      eventEmitter.emit('finish', { })
    })
}

// one-off build for the docs in the directory specified
function build (opts) {
  var options = resolveOptions(opts)

  var eventEmitter = new EventEmitter

  var promise = quantum.read(path.join(options.dir, options.config.pages), {base: path.join(options.dir, options.config.base)})
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

  var promise = quantumwatch(options.config.pages, {base: options.config.base}, function (objs) {
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
