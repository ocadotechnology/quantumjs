/*
     ____                    __                      _
    / __ \__  ______ _____  / /___  ______ ___      (_)____
   / / / / / / / __ `/ __ \/ __/ / / / __ `__ \    / / ___/
  / /_/ / /_/ / /_/ / / / / /_/ /_/ / / / / / /   / (__  )
  \___\_\__,_/\__,_/_/ /_/\__/\__,_/_/ /_/ /_(_)_/ /____/
                                              /___/

  Watch
  =====

  Watches files for changes, triggering change events when inlined files are changed.

*/

var path = require('path')
var EventEmitter = require('events')
var util = require('util')

var Promise = require('bluebird')
var chokidar = require('chokidar')
var flatten = require('flatten')
var fs = Promise.promisifyAll(require('fs-extra'))

var read = require('./read')
var Page = require('./page')
var fileOptions = require('./file-options')

/* Watches some glob specs for changes */
function Watcher (specs, options) {
  var self = this
  EventEmitter.call(this)

  this._options = {
    dest: options.dest || 'target',
    dir: options.dir || '.'
  }

  this._promise = Promise.all(specs)
    .filter(function (spec) { return spec && spec.watch })
    .map(function (spec) { return specToWatcherObj(self, spec, self._options) })
    .then(function (watchers) { self._watchers = watchers })
}

/* Takes a spec, and returns a chokidar watcher along with the spec */
function specToWatcherObj (watcherInstance, spec, options) {
  var dest = options.dest
  return new Promise(function (resolve, reject) {
    var watcher = chokidar.watch(spec.files, {cwd: options.dir})
      .on('ready', function () {
        resolve({
          watcher: watcher,
          spec: spec
        })
      })
      .on('error', function (err) { reject(err) })
      .on('add', function (path) { watcherInstance.emit('add', fileOptions.createFileUsingSpec(path, spec, dest))})
      .on('change', function (path) { watcherInstance.emit('change', fileOptions.createFileUsingSpec(path, spec, dest))})
      .on('unlink', function (path) { watcherInstance.emit('remove', fileOptions.createFileUsingSpec(path, spec, dest))})
  })
}

util.inherits(Watcher, EventEmitter)

Watcher.prototype.stop = function () {
  this._watchers.forEach(function (watcher) {
    watcher.watcher.close()
  })
}
Watcher.prototype.files = function () {
  var dest = this._options.dest
  return Promise.all(this._watchers.map(function (watcher) {
    var watched = watcher.watcher.getWatched()
    var spec = watcher.spec
    return Promise.all(flatten(Object.keys(watched).map(function (directory) {
      return watched[directory].map(function (file) {
        return path.join(directory, file)
      })
    }))).filter(function (filename) {
      return fs.lstatAsync(filename).then(function (stat) {
        return !stat.isDirectory()
      })
    }).map(function (filename) {
      return fileOptions.createFileUsingSpec(filename, spec, dest)
    })
  })).then(flatten)
}

/* Returns a promise that yields a Watcher for the specs provided */
function watcher (specs, options) {
  if (!fileOptions.validate(specs)) return Promise.reject(new Error('invalid specs argument'))
  var w = new Watcher(fileOptions.normalize(specs), options || {})
  return w._promise.then(function () { return w })
}

function defaultLoader (filename, parentFilename) {
  return fs.readFileAsync(filename, 'utf-8')
}

// watches quantum files and follows inline links
function watch (specs, options, handler) {
  if (!fileOptions.validate(specs)) return Promise.reject(new Error('invalid specs argument'))
  var normalisedSpecs = fileOptions.normalize(specs)
  var events = new EventEmitter

  // Option resolving
  var opts = options || {}
  var dir = opts.dir || '.'
  var loader = opts.loader || defaultLoader
  var buildConcurrency = opts.concurrency || 1

  // State that is maintained by watching for file changes
  var fileObjs = {}
  var affectedFiles = {}
  var affectedFilesInverse = {}

  function linkingLoader (filename, parentFilename) {
    if (parentFilename) {
      affectedFiles[filename] = affectedFiles[filename] || new Set
      affectedFiles[filename].add(parentFilename)

      affectedFilesInverse[parentFilename] = affectedFilesInverse[parentFilename] || new Set
      affectedFilesInverse[parentFilename].add(filename)
      watchFile(filename)
    }
    return loader(filename, parentFilename)
  }

  function unlinkFile (filename) {
    delete affectedFiles[filename] // the files affected by changing the file `filename`

    // the files that affect the file `filename`
    if (affectedFilesInverse[filename]) {
      affectedFilesInverse[filename].forEach(function (affectorFilename) {
        affectedFiles[affectorFilename].delete(filename)
        if (affectedFiles[affectorFilename].size === 0) {
          delete affectedFiles[affectorFilename]
        }
      })

      delete affectedFilesInverse[filename]
    }
  }

  var inlinedWatcher = chokidar.watch([], {cwd: dir})
  inlinedWatcher.on('change', function (filename) {
    Promise.all(Array.from(getSourceFileObjs(filename)).map(function (fileObj) {
      return handleFile(fileObj, {rootCause: 'change', cause: 'change'})
    })).then(function () {
      events.emit('change', filename)
    }).catch(handleFileFailure)
  })

  inlinedWatcher.on('unlink', function (filename) {
    var files = Array.from(getSourceFileObjs(filename))
    unlinkFile(filename)
    Promise.all(files.map(function (fileObj) {
      return handleFile(fileObj, {rootCause: 'delete', cause: 'change'})
    })).then(function () {
      events.emit('delete', filename)
    }).catch(handleFileFailure)
  })

  function watchFile (filename) {
    inlinedWatcher.add(filename)
  }

  function getSourceFileObjs (filename, collectorSet) {
    var results = collectorSet || new Set
    if (affectedFiles[filename]) {
      affectedFiles[filename].forEach(function (affectedFilename) {
        if (fileObjs[affectedFilename]) {
          results.add(fileObjs[affectedFilename])
        }
        getSourceFileObjs(affectedFilename, results)
      })
    }
    return results
  }

  function workHandler (work) {
    fileObjs[work.file.src] = work.file
    return read(work.file.src, {loader: linkingLoader})
      .then(function (content) {
        var page = new Page({file: work.file, content: content})
        return handler(page, work.cause)
      })
      .then(function (res) {work.resolve(res)})
      .catch(function (err) {work.reject(err)})
  }

  var workQueue = new WorkQueue(workHandler, {})

  function handleFile (file, cause) {
    return new Promise(function (resolve, reject) {
      workQueue.add({file: file, cause: cause, resolve: resolve, reject: reject})
    })
  }

  function handleFileFailure (err) {
    events.emit('error', err)
  }

  function build () {
    return Promise.all(w.files())
      .map(function (fileObj) {
        return handleFile(fileObj, {rootCause: 'build', cause: 'build'})
      }, {concurrency: buildConcurrency})
  }

  var w = new Watcher(normalisedSpecs, opts)

  w.on('add', function (fileObj) {
    return handleFile(fileObj, {rootCause: 'add', cause: 'add'})
      .then(function () {
        events.emit('add', fileObj.src)
      }).catch(handleFileFailure)
  })

  w.on('change', function (fileObj) {
    return handleFile(fileObj, {rootCause: 'change', cause: 'change'})
      .then(function () {
        events.emit('change', fileObj.src)
      }).catch(handleFileFailure)
  })

  w.on('remove', function (fileObj) {
    unlinkFile(fileObj.src)
    events.emit('delete', fileObj.src)
  })

  return w._promise.then(function () { return {build: build, events: events} })
}

function WorkQueue (handler, options) {
  this.concurrency = options.concurrency || 1
  this.handler = handler
  this.queue = []
  this.activeWorkerCount = 0
}

WorkQueue.prototype = {
  add: function (work) {
    this.queue.push(work)

    // check if we can start up another concurrent piece or work
    if (this.activeWorkerCount < this.concurrency) {
      var self = this
      function process () {
        if (self.queue.length > 0) {
          var work = self.queue.pop()
          self.handler(work).then(process)
        } else {
          self.activeWorkerCount--
        }
      }
      this.activeWorkerCount++
      process()
    }
  }
}

module.exports = watch
module.exports.watcher = watcher
