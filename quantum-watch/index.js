var Promise = require('bluebird')
var gaze = require('gaze')
var quantum = require('quantum-js')
var merge = require('merge')
var fs = Promise.promisifyAll(require('fs'))
var minimatch = require('minimatch')
var EventEmitter = require('events').EventEmitter
var path = require('path')
var debounce = require('debounce')
var resolveFiles = require('./resolve-files')

function createWatcher (globPatterns, customLoader) {
  console.log(globPatterns)
  var watcher = resolveFiles.watch(globPatterns, {dest: 'target'})

  watcher.events.on('change', function (filename) {
    loader.emit('change', loader.getAffectedFiles(filename))
  })

  return watcher.promise

// return new Promise(function (resolve, reject) {
//   gaze(globString, function (watcher) {
//     var loader = new WatcherLoader(globPatterns, Promise.promisifyAll(this), customLoader)
//
//     this.on('changed', function (filename) {
//       loader.emit('change', loader.getAffectedFiles(filename))
//     })
//
//     this.on('added', function (filename) {
//       loader.emit('change', loader.getAffectedFiles(filename))
//     })
//
//     // XXX: handle removed case
//
//     resolve(loader)
//   })
// })
}

function WatcherLoader (globPatterns, watcher, loader) {
  EventEmitter.call(this)

  this.fileLoader = loader || function (filename, inlineParent) {
      return fs.readFileAsync(filename, 'utf-8')
  }

  this.globPatterns = globPatterns
  this.watcher = watcher
  this.links = {}
  this.watching = {}
  this.toWatch = {}

}

WatcherLoader.prototype = merge(new EventEmitter, {
  getAffectedFiles: function (filename) {
    if (filename in this.links) {
      var self = this
      var res = [filename]
      Object.keys(this.links[filename]).map(function (filename) {
        res = res.concat(self.getAffectedFiles(filename))
      })
      return res
    } else {
      return [filename]
    }
  },
  loader: function (filename, inlineParent) {
    if (inlineParent) {
      var fname = path.resolve(filename)

      this.links[fname] = this.links[fname] || {}
      this.links[fname][path.resolve(inlineParent)] = true
    }

    if (!(filename in this.watching) && !minimatch(filename, this.globString)) {
      this.toWatch[filename] = true
    }

    return this.fileLoader(filename, inlineParent)
  },
  updateWatches: function () {
    var self = this
    return this.watcher.addAsync(Object.keys(this.toWatch))
      .then(function () {
        Object.keys(self.toWatch).forEach(function (filename) {
          self.watching[filename] = true
        })
        self.toWatch = {}
      })
  }
})

function watch (globPatterns, options, renderer) {
  var opts = merge({}, options)

  return createWatcher(globPatterns, opts.loader).then(function (loader) {
    opts.loader = function (filename, inlineParent) {
      return loader.loader(filename, inlineParent)
    }

    function matchesGlob (fileObj) {
      console.log('check if glob matches:', fileObj)
      if (path.isAbsolute(filename) && !path.isAbsolute(globString)) {
        return minimatch(path.relative(options.dir || process.cwd(), filename), globString)
      } else {
        return minimatch(filename, globString)
      }
    }

    function build (fileObjs) {
      // only rebuild those that match the original glob
      return Promise.all(fileObjs)
        .filter(matchesGlob)
        .map(function (filename) {
          return quantum.read.single(filename, opts).then(renderer)
        })
        .then(function (objs) {
          return loader.updateWatches().then(function () { return objs })
        })
    }

    var debouncedBuild = debounce(build, 5)

    loader.on('change', debouncedBuild)

    // return a function that allows manual triggering of a full build
    return function () {
      return resolveFiles(globPatterns).then(build)
    }
  })

}

module.exports = watch
