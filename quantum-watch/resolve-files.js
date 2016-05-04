var Promise = require('bluebird')
var path = require('path')
var globby = require('globby')
var EventEmitter = require('events')
var gaze = require('gaze')

/*
  Finds all files that match a set of globs - see the tests for all the possible
  arguments that can be passed in
*/
module.exports = function (list, options) {
  var dir = options.dir || '.'
  var dest = options.dest
  return resolveMultipleGlobs(dir, normaliseList(list), dest)
}

module.exports.watch = function (list, options) {
  var dir = options.dir || '.'
  var dest = options.dest
  var events = new EventEmitter
  return {
    events: events,
    promise: watchMultipleGlobs(dir, normaliseList(list), dest, events)
  }
}

/* Makes sure the list argument is of the right shape */
function normaliseList (list) {
  var arrayedList = Array.isArray(list) ? list : [list]
  var objectifiedList = arrayedList.map(toObjectGlobDescription)
  return objectifiedList
}

/* Makes sure a single object in the list argument is of the right shape */
function toObjectGlobDescription (item) {
  if (typeof item === 'string') {
    return {
      files: item,
      base: extractBase(item)
    }
  } else {
    return item
  }
}

/* Infers a sensible base directory for a glob string */
function extractBase (globString) {
  var end = globString.indexOf('*')
  return globString.slice(0, end - 1)
}

/* Does the same as resolveGlobs but for an array of {globs, base} objects */
function resolveMultipleGlobs (dir, list, dest) {
  var res = []

  return Promise.all(list)
    .map(function (obj) {
      var base = obj.base ? path.join(dir, obj.base) : dir
      var destForObj = obj.dest ? path.join(dest, obj.dest) : dest
      var watch = obj.watch !== undefined ? obj.watch : true

      return resolveGlobs(dir, obj.files, base, destForObj, watch)
        .map(function (r) {
          res.push(r)
        })
    })
    .then(function () {
      return res
    })
}

/*
  Gets a list of files for an array of globs which should be specified relative to dir
  The base should also be specified relative to dir, and is used to resolve relative
  filenames for each of the files found
*/
function resolveGlobs (dir, globs, base, dest, watch) {
  var globsArray = Array.isArray(globs) ? globs : [globs]

  var resolvedGlobs = globsArray.map(function (f) {
    return path.join(dir, f)
  })

  return Promise.resolve(globby(resolvedGlobs, {cwd: dir, nodir: true})
    .then(function (files) {
      return Promise.resolve(files).map(function (file) {
        var resolved = path.relative(base, file)

        return {
          src: file,
          resolved: resolved,
          base: base,
          dest: path.join(dest, resolved),
          watch: watch
        }

      })
    }))
}

/* Same as resolveMultipleGlobs but emits events when there is a change */
function watchMultipleGlobs (dir, list, dest, eventEmitter, eventEmitter) {
  return Promise.all(list)
    .map(function (obj) {
      var base = obj.base ? path.join(dir, obj.base) : dir
      var destForObj = obj.dest ? path.join(dest, obj.dest) : dest
      var watch = obj.watch !== undefined ? obj.watch : true

      return watchGlobs(dir, obj.files, base, destForObj, watch, eventEmitter)
        .map(function (r) {
          res.push(r)
        })
    })
}

/* Same as resolveGlobs but for watching */
function watchGlobs (dir, globs, base, dest, watch, eventEmitter) {
  var globsArray = Array.isArray(globs) ? globs : globs !== undefined ? [globs] : []

  var resolvedGlobs = globsArray.map(function (f) {
    return path.join(dir, f)
  })

  return new Promise(function (resolve, reject) {
    gaze(resolvedGlobs, {cwd: dir /*, nodir: true */}, function (err, watcher) {
      if (err) {
        reject(err)
      } else {
        this.on('changed', function (file) {
          console.log(filepath + ' was changed')
          var resolved = path.relative(base, file)
          eventEmitter.emit('change', {
            src: file,
            resolved: resolved,
            base: base,
            dest: path.join(dest, resolved),
            watch: watch
          })
        })
        resolve()
      }
    })
  })

}
