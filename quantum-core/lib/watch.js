'use strict'
/*

  Watch
  =====

  Watches files for changes, triggering change events when inlined files are changed.

*/

const path = require('path')
const EventEmitter = require('events')
const util = require('util')

const Promise = require('bluebird')
const chokidar = require('chokidar')
const flatten = require('flatten')
const fs = Promise.promisifyAll(require('fs-extra'))

const { ParseError } = require('./parse')
const File = require('./File')
const fileOptions = require('./file-options')
const { defaultLoader, readAsFile } = require('./read')

/* Watches some glob specs for changes */
function Watcher (specs, options) {
  const self = this
  EventEmitter.call(this)

  this._options = {
    dest: options.dest || 'target',
    dir: options.dir || '.'
  }

  this._promise = Promise.all(specs)
    .filter((spec) => spec && spec.watch)
    .map((spec) => specToWatcherObj(self, spec, self._options))
    .then((watchers) => {
      self._watchers = watchers
    })
}

/* Takes a spec, and returns a chokidar watcher along with the spec */
function specToWatcherObj (watcherInstance, spec, options) {
  const dest = options.dest
  return new Promise((resolve, reject) => {
    const watcher = chokidar.watch(spec.files, {cwd: options.dir})
      .on('ready', () => {
        resolve({
          watcher: watcher,
          spec: spec
        })
      })
      .on('error', (err) => reject(err))
      .on('add', (path) => watcherInstance.emit('add', fileOptions.createFileUsingSpec(path, spec, dest)))
      .on('change', (path) => watcherInstance.emit('change', fileOptions.createFileUsingSpec(path, spec, dest)))
      .on('unlink', (path) => watcherInstance.emit('remove', fileOptions.createFileUsingSpec(path, spec, dest)))
  })
}

util.inherits(Watcher, EventEmitter)

Watcher.prototype.stop = function () {
  this._watchers.forEach((watcher) => watcher.watcher.close())
}
Watcher.prototype.files = function () {
  const dest = this._options.dest
  return Promise.all(this._watchers.map((watcher) => {
    const watched = watcher.watcher.getWatched()
    const spec = watcher.spec
    return Promise.all(flatten(Object.keys(watched).map((directory) => {
      return watched[directory].map((file) => {
        return path.join(directory, file)
      })
    }))).filter((filename) => {
      return fs.lstatAsync(filename).then((stat) => {
        return !stat.isDirectory()
      })
    }).map((filename) => fileOptions.createFileUsingSpec(filename, spec, dest))
  })).then(flatten)
}

/* Returns a promise that yields a Watcher for the specs provided */
function watcher (specs, options) {
  const err = fileOptions.validate(specs)
  if (err) {
    return Promise.reject(err)
  }
  const w = new Watcher(fileOptions.normalize(specs), options || {})
  return w._promise.then(() => w)
}

// watches quantum files and follows inline links
function watch (specs, handler, options) {
  const err = fileOptions.validate(specs)
  if (err) {
    return Promise.reject(err)
  }
  const normalisedSpecs = fileOptions.normalize(specs)
  const events = new EventEmitter()

  // Option resolving
  const opts = options || {}
  const dir = opts.dir || '.'
  const fileReader = opts.fileReader || readAsFile
  const loader = opts.loader || defaultLoader
  const buildConcurrency = opts.concurrency || 1
  const resolveRoot = path.resolve(opts.resolveRoot || process.cwd())

  // State that is maintained by watching for file changes
  const fileInfos = {}
  const affectedFiles = {}
  const affectedFilesInverse = {}

  function linkingLoader (filename, parentFilename) {
    if (parentFilename) {
      const file = path.relative(dir, filename)
      affectedFiles[file] = affectedFiles[file] || new Set()
      affectedFiles[file].add(parentFilename)

      affectedFilesInverse[parentFilename] = affectedFilesInverse[parentFilename] || new Set()
      affectedFilesInverse[parentFilename].add(file)
      watchFile(file)
    }
    return loader(filename, parentFilename)
  }

  function unlinkFile (filename) {
    delete affectedFiles[filename] // the files affected by changing the file `filename`

    // the files that affect the file `filename`
    if (affectedFilesInverse[filename]) {
      affectedFilesInverse[filename].forEach((affectorFilename) => {
        affectedFiles[affectorFilename].delete(filename)
        if (affectedFiles[affectorFilename].size === 0) {
          delete affectedFiles[affectorFilename]
        }
      })

      delete affectedFilesInverse[filename]
    }
  }

  const inlinedWatcher = chokidar.watch([], {cwd: dir})
  inlinedWatcher.on('change', (filename) => {
    const files = Array.from(getSourceFileObjs(filename))
    Promise.all(files.map((fileInfo) => handleFile(fileInfo, {rootCause: 'change', cause: 'change'})))
      .then(() => events.emit('change', filename))
      .catch(handleFileFailure)
  })

  inlinedWatcher.on('unlink', (filename) => {
    const files = Array.from(getSourceFileObjs(filename))
    unlinkFile(filename)
    Promise.all(files.map((fileInfo) => handleFile(fileInfo, {rootCause: 'delete', cause: 'change'})))
      .then(() => events.emit('delete', filename))
      .catch(handleFileFailure)
  })

  function watchFile (filename) {
    inlinedWatcher.add(filename)
  }

  function getSourceFileObjs (filename, collectorSet) {
    const results = collectorSet || new Set()
    if (affectedFiles[filename]) {
      affectedFiles[filename].forEach((affectedFilename) => {
        if (fileInfos[affectedFilename]) {
          results.add(fileInfos[affectedFilename])
        }
        getSourceFileObjs(affectedFilename, results)
      })
    }
    return results
  }

  function workHandler (work) {
    fileInfos[work.fileInfo.src] = work.fileInfo
    return fileReader(work.fileInfo, { loader: linkingLoader, resolveRoot })
      .then(file => handler(undefined, file, work.cause))
      .catch((err) => {
        if (err instanceof ParseError) {
          return handler(err, new File({info: work.fileInfo, content: undefined}), work.cause)
        } else {
          throw err
        }
      })
      .then((res) => work.resolve(res))
      .catch((err) => work.reject(err))
  }

  const workQueue = new WorkQueue(workHandler, {})

  function handleFile (fileInfo, cause) {
    return new Promise((resolve, reject) => {
      workQueue.add({fileInfo: fileInfo, cause: cause, resolve: resolve, reject: reject})
    })
  }

  function handleFileFailure (err) {
    events.emit('error', err)
  }

  function build () {
    return Promise.all(w.files())
      .map((fileInfo) => {
        return handleFile(fileInfo, {rootCause: 'build', cause: 'build'})
      }, {concurrency: buildConcurrency})
  }

  const w = new Watcher(normalisedSpecs, opts)

  w.on('add', (fileInfo) => {
    return handleFile(fileInfo, {rootCause: 'add', cause: 'add'})
      .then(() => events.emit('add', fileInfo.src))
      .catch(handleFileFailure)
  })

  w.on('change', (fileInfo) => {
    return handleFile(fileInfo, {rootCause: 'change', cause: 'change'})
      .then(() => events.emit('change', fileInfo.src))
      .catch(handleFileFailure)
  })

  w.on('remove', (fileInfo) => {
    unlinkFile(fileInfo.src)
    events.emit('delete', fileInfo.src)
  })

  return w._promise.then(() => ({build: build, events: events}))
}

function WorkQueue (handler, options) {
  this.concurrency = options.concurrency || 1
  this.handler = handler
  this.queue = []
  this.activeWorkerCount = 0
}

WorkQueue.prototype = {
  add: function (work) {
    const self = this
    function process () {
      if (self.queue.length > 0) {
        const work = self.queue.pop()
        self.handler(work).then(process)
      } else {
        self.activeWorkerCount--
      }
    }

    this.queue.push(work)

    // check if we can start up another concurrent piece of work
    if (this.activeWorkerCount < this.concurrency) {
      this.activeWorkerCount++
      process()
    }
  }
}

module.exports = {
  watch,
  watcher,
  Watcher
}
