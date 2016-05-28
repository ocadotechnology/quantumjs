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
var globby = require('globby')
var chokidar = require('chokidar')
var flatten = require('flatten')
var fs = Promise.promisifyAll(require('fs-extra'))

var read = require('./read')

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
      .on('add', function (path) { watcherInstance.emit('add', fileToObj(path, spec, dest))})
      .on('change', function (path) { watcherInstance.emit('change', fileToObj(path, spec, dest))})
      .on('unlink', function (path) { watcherInstance.emit('remove', fileToObj(path, spec, dest))})
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
  return flatten(this._watchers.map(function (watcher) {
    var watched = watcher.watcher.getWatched()
    var spec = watcher.spec
    return flatten(Object.keys(watched).map(function (directory) {
      return watched[directory].map(function (file) {
        return fileToObj(path.join(directory, file), spec, dest)
      })
    }))
  }))
}

/* Converts a filename (and spec) to an object with relevant details copied over from the spec */
function fileToObj (file, spec, dest) {
  var base = spec.base
  var watch = spec.watch
  var destForObj = spec.dest ? path.join(dest, spec.dest) : dest
  var resolved = path.relative(base, file)
  return {
    src: file,
    resolved: resolved,
    base: base,
    dest: path.join(destForObj, resolved),
    watch: watch === undefined ? true : watch
  }
}

function isString (str) {
  return typeof str === 'string' || str instanceof String
}

/* Checks the specs passed in look like a valid specs list */
function validateSpecs (specs) {
  return validateSpec(specs) || (Array.isArray(specs) && specs.every(validateSpec))
}

/* Checks the spec passed in look like a valid spec */
function validateSpec (spec) {
  return spec !== undefined && (
  isString(spec) ||
  isString(spec.files) ||
  (Array.isArray(spec.files) && spec.files.every(isString)))
}

/* Makes sure the list argument is of the right shape */
function normaliseSpecList (specs) {
  var arrayedSpecs = Array.isArray(specs) ? specs : [specs]
  var objectifiedSpecs = arrayedSpecs.map(toObjectSpecDescription)
  return objectifiedSpecs
}

/* Makes sure a single object in the list argument is of the right shape */
function toObjectSpecDescription (item) {
  if (isString(item)) {
    return {
      files: [item],
      base: inferBase(item),
      watch: true
    }
  } else {
    return {
      files: Array.isArray(item.files) ? item.files : [item.files],
      base: item.base,
      watch: item.watch,
      dest: item.dest
    }
  }
}

/* Infers a sensible base directory for a glob string */
function inferBase (globString) {
  var end = globString.indexOf('*')
  return globString.slice(0, end - 1)
}

/* Resolves a list of specs into a list of file-objects */
function resolve (specs, opts) {
  if (!validateSpecs(specs)) return Promise.reject(new Error('invalid specs argument'))
  var options = opts || {}
  var dir = options.dir || '.'
  var dest = options.dest || 'target'
  return Promise.all(normaliseSpecList(specs))
    .map(function (spec) {
      return Promise.resolve(globby(spec.files, {cwd: dir, nodir: true}))
        .map(function (file) {
          return fileToObj(file, spec, dest)
        })
    }).then(flatten)
}

/* Returns a promise that yields a Watcher for the specs provided */
function watcher (specs, options) {
  if (!validateSpecs(specs)) return Promise.reject(new Error('invalid specs argument'))
  var w = new Watcher(normaliseSpecList(specs), options || {})
  return w._promise.then(function () { return w })
}

function defaultLoader (filename, parentFilename) {
  return fs.readFileAsync(filename, 'utf-8')
}

// watches quantum files and follows inline links
function watch (specs, options, handler) {
  if (!validateSpecs(specs)) return Promise.reject(new Error('invalid specs argument'))
  var normalisedSpecs = normaliseSpecList(specs)
  var events = new EventEmitter

  // Option resolving
  var opts = options || {}
  var dir = opts.dir || '.'
  var loader = opts.loader || defaultLoader
  var buildConcurrency = opts.buildConcurrency || 1

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

  function handleFile (fileObj, watchTriggered) {
    fileObjs[fileObj.src] = fileObj
    return read.single(fileObj.src, {loader: linkingLoader})
      .then(function (parsedObj) {
        parsedObj.file = fileObj
        return handler(parsedObj, watchTriggered)
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

module.exports = watch
module.exports.resolve = resolve
module.exports.watcher = watcher
