var Promise      = require('bluebird')
var glob         = Promise.promisify(require('glob'))
var gaze         = require('gaze')
var quantum      = require('quantum-js')
var merge        = require('merge')
var fs           = Promise.promisifyAll(require('fs'))
var minimatch    = require('minimatch')
var EventEmitter = require('events').EventEmitter
var path         = require('path')
var debounce     = require('debounce')

function createWatcher(globString, customLoader) {
  return new Promise(function (resolve, reject) {
    gaze(globString, function (watcher) {
      var loader = new WatcherLoader(globString, Promise.promisifyAll(this), customLoader)

      this.on('changed', function (filename) {
        loader.emit('change', loader.getAffectedFiles(filename))
      })

      this.on('added', function (filename) {
        loader.emit('change', loader.getAffectedFiles(filename))
      })

      resolve(loader)
    })
  })
}

function WatcherLoader(globString, watcher, loader) {
  EventEmitter.call(this)


  this.fileLoader = loader || function (filename, inlineParent) {
    return fs.readFileAsync(filename, 'utf-8')
  }

  this.globString = globString
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
      Object.keys(this.links[filename]).map(function(filename) {
        res = res.concat(self.getAffectedFiles(filename))
      })
      return res
    } else {
      return [filename]
    }
  },
  loader: function (filename, inlineParent) {
    if(inlineParent) {
      var fname = path.resolve(filename)

      this.links[fname] = this.links[fname] || {}
      this.links[fname][path.resolve(inlineParent)] = true
    }

    if(!(filename in this.watching) && !minimatch(filename, this.globString)) {
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


function watch (globString, options, renderer, initialDone) {

  var opts = merge({}, options)

  return createWatcher(globString, opts.loader).then(function (loader) {

    opts.loader = function (filename, inlineParent) { return loader.loader(filename, inlineParent) }

    function build (filenames) {
      // only rebuild those that match the original glob
      return Promise.all(filenames.filter(function (filename) {
        if(path.isAbsolute(filename)) {
          return minimatch(path.relative(process.cwd(), filename), globString)
        } else {
          return minimatch(filename, globString)
        }
      })).map(function (filename) {
        return quantum.read.single(filename, opts)
      })
      .then(function (objs) {
        return loader.updateWatches().then(function () { return objs })
      }).then(function (objs) {
        if (objs.length > 0) {
          return renderer(objs)
        }
      })
    }

    var debouncedBuild = debounce(build, 5)


    loader.on('change', debouncedBuild)

    // return a function that allows manual triggering of a full build
    return function () {
      return glob(globString).then(build)
    }
  })

}

module.exports = watch