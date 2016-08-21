var should = require('chai').should()
var Promise = require('bluebird')
var fs = Promise.promisifyAll(require('fs-extra'))
var chokidar = require('chokidar')
var EventEmitter = require('events')
var util = require('util')

var quantum = require('..')
var watch = quantum.watch
var File = quantum.File
var Page = quantum.Page

describe('watcher', function () {
  it('should watch the right files for change', function () {
    return watch.watcher('target/test/watch-test/*').then(function (watcher) {
      watcher.files().then(function (files) {
        files.should.eql([
          new File({
            'base': 'target/test/watch-test',
            'dest': 'target/index.css',
            'resolved': 'index.css',
            'src': 'target/test/watch-test/index.css',
            'watch': true
          }),
          new File({
            'base': 'target/test/watch-test',
            'dest': 'target/index.um',
            'resolved': 'index.um',
            'src': 'target/test/watch-test/index.um',
            'watch': true
          }),
          new File({
            'base': 'target/test/watch-test',
            'dest': 'target/index1.um',
            'resolved': 'index1.um',
            'src': 'target/test/watch-test/index1.um',
            'watch': true
          })
        ])

        watcher.stop()
      })
    })
  })

  it('should watch the right files for change (negative globs)', function () {
    return watch.watcher({
      files: ['target/test/watch-test/*', '!**/*.um'],
      base: 'target/test/watch-test',
      watch: true
    }, {dest: 'target2'}).then(function (watcher) {
      return watcher.files().then(function (files) {
        files.should.eql([
          new File({
            'base': 'target/test/watch-test',
            'dest': 'target2/index.css',
            'resolved': 'index.css',
            'src': 'target/test/watch-test/index.css',
            'watch': true
          })
        ])
        watcher.stop()
      })
    })
  })

  it('should use the dest directory from the spec', function () {
    return watch.watcher({
      files: ['target/test/watch-test/*', '!**/*.um'],
      base: 'target/test/watch-test',
      watch: true,
      dest: 'subtarget'
    }, {dest: 'target2'}).then(function (watcher) {
      return watcher.files().then(function (files) {
        files.should.eql([
          new File({
            'base': 'target/test/watch-test',
            'dest': 'target2/subtarget/index.css',
            'resolved': 'index.css',
            'src': 'target/test/watch-test/index.css',
            'watch': true
          })
        ])
        watcher.stop()
      })
    })
  })

  it('should watch the right files for change (multiple simple specs)', function () {
    return watch.watcher(['target/test/files1/*.um', 'target/test/files2/*.um'], {dest: 'target2'}).then(function (watcher) {
      return watcher.files().then(function (files) {
        files.should.eql([
          new File({
            'base': 'target/test/files1',
            'dest': 'target2/a.um',
            'resolved': 'a.um',
            'src': 'target/test/files1/a.um',
            'watch': true
          }),
          new File({
            'base': 'target/test/files1',
            'dest': 'target2/b.um',
            'resolved': 'b.um',
            'src': 'target/test/files1/b.um',
            'watch': true
          }),
          new File({
            'base': 'target/test/files2',
            'dest': 'target2/e.um',
            'resolved': 'e.um',
            'src': 'target/test/files2/e.um',
            'watch': true
          }),
          new File({
            'base': 'target/test/files2',
            'dest': 'target2/z.um',
            'resolved': 'z.um',
            'src': 'target/test/files2/z.um',
            'watch': true
          })
        ])
        watcher.stop()
      })
    })
  })

  it('should watch the right files for change (multiple full specs)', function () {
    return watch.watcher([{
      files: 'target/test/files1/*.um',
      base: 'target/test/files1',
      watch: true
    }, {
      files: 'target/test/files2/*.um',
      base: 'target/test',
      watch: true
    }], {dest: 'target2'}).then(function (watcher) {
      return watcher.files().then(function (files) {
        return files.should.eql([
          new File({
            'base': 'target/test/files1',
            'dest': 'target2/a.um',
            'resolved': 'a.um',
            'src': 'target/test/files1/a.um',
            'watch': true
          }),
          new File({
            'base': 'target/test/files1',
            'dest': 'target2/b.um',
            'resolved': 'b.um',
            'src': 'target/test/files1/b.um',
            'watch': true
          }),
          new File({
            'base': 'target/test',
            'dest': 'target2/files2/e.um',
            'resolved': 'files2/e.um',
            'src': 'target/test/files2/e.um',
            'watch': true
          }),
          new File({
            'base': 'target/test',
            'dest': 'target2/files2/z.um',
            'resolved': 'files2/z.um',
            'src': 'target/test/files2/z.um',
            'watch': true
          })
        ])
        watcher.stop()
      })
    })
  })

  it('should watch the right files for change (multiple full specs with negative globs)', function () {
    return watch.watcher([{
      files: ['target/test/files1/*.um', '!target/test/files1/b.um'],
      base: 'target/test/files1',
      watch: true
    }, {
      files: ['target/test/files2/*.um', '!target/test/files2/z.um'],
      base: 'target/test',
      watch: true
    }], {dest: 'target2'}).then(function (watcher) {
      return watcher.files().then(function (files) {
        files.should.eql([
          new File({
            'base': 'target/test/files1',
            'dest': 'target2/a.um',
            'resolved': 'a.um',
            'src': 'target/test/files1/a.um',
            'watch': true
          }),
          new File({
            'base': 'target/test',
            'dest': 'target2/files2/e.um',
            'resolved': 'files2/e.um',
            'src': 'target/test/files2/e.um',
            'watch': true
          })
        ])
        watcher.stop()
      })
    })
  })

  it('should only watch specs with watch: true', function () {
    return watch.watcher([{
      files: 'target/test/files1/*.um',
      base: 'target/test/files1',
      watch: true
    }, {
      files: 'target/test/files2/*.um',
      base: 'target/test',
      watch: false
    }], {dest: 'target2'}).then(function (watcher) {
      return watcher.files().then(function (files) {
        files.should.eql([
          new File({
            'base': 'target/test/files1',
            'dest': 'target2/a.um',
            'resolved': 'a.um',
            'src': 'target/test/files1/a.um',
            'watch': true
          }),
          new File({
            'base': 'target/test/files1',
            'dest': 'target2/b.um',
            'resolved': 'b.um',
            'src': 'target/test/files1/b.um',
            'watch': true
          })
        ])
        watcher.stop()
      })
    })
  })

  it('should emit an event when a file is added', function (done) {
    watch.watcher({
      files: 'target/test/watch-change-test/**/*.add',
      base: 'target/test/watch-change-test',
      watch: true
    }, {dest: 'target2'}).then(function (watcher) {
      watcher.on('add', function (obj) {
        obj.should.eql(new File({
          src: 'target/test/watch-change-test/subdir/index.add',
          resolved: 'subdir/index.add',
          base: 'target/test/watch-change-test',
          dest: 'target2/subdir/index.add',
          watch: true
        }))
        watcher.stop()
        done()
      })

      fs.outputFileAsync('target/test/watch-change-test/subdir/index.add', 'Content 2')
    })
  })

  it('should emit an event when a file changes', function (done) {
    watch.watcher({
      files: 'target/test/watch-change-test/*.um',
      base: 'target/test/watch-change-test',
      watch: true
    }, {dest: 'target2'}).then(function (watcher) {
      watcher.on('change', function (obj) {
        obj.should.eql(new File({
          src: 'target/test/watch-change-test/index.um',
          resolved: 'index.um',
          base: 'target/test/watch-change-test',
          dest: 'target2/index.um',
          watch: true
        }))
        watcher.stop()
        done()
      })

      fs.writeFileAsync('target/test/watch-change-test/index.um', 'Content 2')
    })
  })

  it('should emit an event when a file is removed', function (done) {
    fs.outputFileAsync('target/test/watch-change-test/subdir/index.remove', 'Content 2').then(function () {
      watch.watcher({
        files: 'target/test/watch-change-test/**/*.remove',
        base: 'target/test/watch-change-test',
        watch: true
      }, {dest: 'target2'}).then(function (watcher) {
        watcher.on('remove', function (obj) {
          obj.should.eql(new File({
            src: 'target/test/watch-change-test/subdir/index.remove',
            resolved: 'subdir/index.remove',
            base: 'target/test/watch-change-test',
            dest: 'target2/subdir/index.remove',
            watch: true
          }))
          watcher.stop()
          done()
        })

        fs.removeAsync('target/test/watch-change-test/subdir/index.remove')
      })
    })
  })

  it('should yield an error when an invalid spec is passed in', function (done) {
    watch.watcher({
      files: {},
      base: 'target/test/watch-change-inline-test',
      watch: true
    }, {dest: 'target2'}).catch(function (err) {
      done()
    })
  })

  it('should yield an error when an invalid spec is passed in 2', function (done) {
    watch.watcher({}, {dest: 'target2'}).catch(function (err) {
      done()
    })
  })

  describe('chokidar error tests', function () {
    var cwatch = chokidar.watch

    function FakeChokidarWatch () {
      EventEmitter.call(this)
    }
    util.inherits(FakeChokidarWatch, EventEmitter)
    var fcw = new FakeChokidarWatch()

    before(function () {
      chokidar.watch = function (files, options) {
        return fcw
      }
    })

    after(function () {
      chokidar.watch = cwatch
    })

    it('should yield an error when chokidar emits an error', function (done) {
      var err = new Error('some error')

      watch.watcher(['target/**.um'], {dest: 'target2'}).catch(function (err) {
        err.should.equal(err)
        done()
      })

      // This timeout is needed to make sure the promise in watch.watcher is evaluated
      // before this gets called
      setTimeout(function () { fcw.emit('error', err) }, 0)
    })
  })
})

describe('watch', function () {
  it('should watch inline files', function (done) {
    var specs = {
      files: 'target/test/watch-change-inline-test/index.um',
      base: 'target/test/watch-change-inline-test',
      watch: true
    }

    var options = {dest: 'target2'}

    var handler = function (err, parsed, details) {
      if (details.cause === 'change') {
        parsed.should.eql(new Page({
          file: new File({
            src: 'target/test/watch-change-inline-test/index.um',
            resolved: 'index.um',
            base: 'target/test/watch-change-inline-test',
            dest: 'target2/index.um',
            watch: true
          }),
          content: {
            content: ['Content 1', 'Content 3']
          },
          meta: {}
        }))
        done()
      }
    }

    watch(specs, options, handler).then(function (res) {
      res.build().then(function () {
        fs.writeFileAsync('target/test/watch-change-inline-test/inlined.um', 'Content 3')
      })
    })
  })

  it('should watch with the default options', function (done) {
    var specs = {
      files: 'target/test/watch-change-inline-default-test/index.um',
      base: 'target/test/watch-change-inline-default-test',
      watch: true
    }

    var handler = function (err, parsed, details) {
      if (details.cause === 'change') {
        parsed.should.eql(new Page({
          file: new File({
            src: 'target/test/watch-change-inline-default-test/index.um',
            resolved: 'index.um',
            base: 'target/test/watch-change-inline-default-test',
            dest: 'target/index.um',
            watch: true
          }),
          content: {
            content: ['Content 1', 'Content 3']
          },
          meta: {}
        }))
        done()
      }
    }

    watch(specs, undefined, handler).then(function (res) {
      res.build().then(function () {
        fs.writeFileAsync('target/test/watch-change-inline-default-test/inlined.um', 'Content 3')
      })
    })
  })

  it('should watch inline files several levels deep', function (done) {
    var specs = {
      files: 'target/test/watch-change-deep-inline-test/index.um',
      base: 'target/test/watch-change-deep-inline-test',
      watch: true
    }

    var options = {dest: 'target2'}

    var handler = function (err, parsed, details) {
      if (details.cause === 'change') {
        parsed.should.eql(new Page({
          file: new File({
            src: 'target/test/watch-change-deep-inline-test/index.um',
            resolved: 'index.um',
            base: 'target/test/watch-change-deep-inline-test',
            dest: 'target2/index.um',
            watch: true
          }),
          content: {
            content: ['Content 1', 'Content 3']
          },
          meta: {}
        }))
        done()
      }
    }

    watch(specs, options, handler).then(function (res) {
      res.build().then(function () {
        fs.writeFileAsync('target/test/watch-change-deep-inline-test/inlined-2.um', 'Content 3')
      })
    })
  })

  it('a change in the base file should result in the handler being called', function (done) {
    var specs = {
      files: 'target/test/watch-change-base-inline-test/index.um',
      base: 'target/test/watch-change-base-inline-test',
      watch: true
    }

    var options = {dest: 'target2'}

    var handler = function (err, parsed, details) {
      if (details.cause === 'change') {
        parsed.should.eql(new Page({
          file: new File({
            src: 'target/test/watch-change-base-inline-test/index.um',
            resolved: 'index.um',
            base: 'target/test/watch-change-base-inline-test',
            dest: 'target2/index.um',
            watch: true
          }),
          content: {
            content: ['Content 0', 'Content 2']
          },
          meta: {}
        }))
        done()
      }
    }

    watch(specs, options, handler).then(function (res) {
      res.build().then(function () {
        fs.writeFileAsync('target/test/watch-change-base-inline-test/index.um', 'Content 0\n@inline inlined.um')
      })
    })
  })

  it('a file being removed should result in the handler being called', function (done) {
    var specs = {
      files: 'target/test/watch-change-remove-inline-test/index.um',
      base: 'target/test/watch-change-remove-inline-test',
      watch: true
    }

    var options = {dest: 'target2'}

    var handler = function (err, parsed, details) {
      if (details.cause === 'change') {
        parsed.should.eql(new Page({
          file: new File({
            src: 'target/test/watch-change-remove-inline-test/index.um',
            resolved: 'index.um',
            base: 'target/test/watch-change-remove-inline-test',
            dest: 'target2/index.um',
            watch: true
          }),
          content: {
            content: ['Content 1']
          },
          meta: {}
        }))
        done()
      }
    }

    watch(specs, options, handler).then(function (res) {
      res.build().then(function () {
        fs.removeAsync('target/test/watch-change-remove-inline-test/inlined.um')
      })
    })
  })

  it('should not error when a base file is removed, then a previously linked file is changed', function (done) {
    var specs = {
      files: 'target/test/watch-change-base-delete-inline-test/index*.um',
      base: 'target/test/watch-change-base-delete-inline-test',
      watch: true
    }

    var options = {dest: 'target2'}

    var errors = []
    var complete = false

    var handler = function (err, parsed, details) {
      if (details.cause === 'change') {
        errors.should.eql([]) // expect there to be no errors
        if (!complete) {
          complete = true
          done()
        }
      }
    }

    watch(specs, options, handler).then(function (res) {
      res.events.on('error', function (err) {
        errors.push(err)
      })

      res.events.on('delete', function (filename) {
        filename.should.equal('target/test/watch-change-base-delete-inline-test/index.um')
        fs.writeFileAsync('target/test/watch-change-base-delete-inline-test/inlined.um', 'Content 3')
      })

      res.build()
        .then(function () {
          fs.removeAsync('target/test/watch-change-base-delete-inline-test/index.um')
        })
    })
  })

  it('should not error when the middle file in a chain is deleted, and the leaf is changed', function (done) {
    var specs = [
      {
        files: 'target/test/watch-change-middle-delete-inline-test/index.um',
        base: 'target/test/watch-change-middle-delete-inline-test',
        watch: true
      },
      {
        files: 'target/test/watch-change-middle-delete-inline-test/inlined-2.um',
        base: 'target/test/watch-change-middle-delete-inline-test',
        watch: true
      }
    ]

    var options = {dest: 'target2'}

    var errors = []

    var handler = function (err, parsed, details) {
      if (details.rootCause === 'change') {
        errors.should.eql([]) // expect there to be no errors
        done()
      }
    }

    watch(specs, options, handler).then(function (res) {
      res.events.on('error', function (err) {
        errors.push(err)
      })

      res.events.on('delete', function (filename) {
        filename.should.equal('target/test/watch-change-middle-delete-inline-test/inlined.um')
        fs.writeFileAsync('target/test/watch-change-middle-delete-inline-test/inlined-2.um', 'Content 3')
      })

      res.build()
        .then(function () {
          fs.removeAsync('target/test/watch-change-middle-delete-inline-test/inlined.um')
        })
    })
  })

  it('should watch non quantum inline files', function (done) {
    var specs = {
      files: 'target/test/watch-change-non-quantum-inline-test/index.um',
      base: 'target/test/watch-change-non-quantum-inline-test',
      watch: true
    }

    var options = {dest: 'target2'}

    var handler = function (err, parsed, details) {
      if (details.cause === 'change') {
        parsed.should.eql(new Page({
          file: new File({
            src: 'target/test/watch-change-non-quantum-inline-test/index.um',
            resolved: 'index.um',
            base: 'target/test/watch-change-non-quantum-inline-test',
            dest: 'target2/index.um',
            watch: true
          }),
          content: {
            content: ['Content 1', 'Content 3']
          },
          meta: {}
        }))
        done()
      }
    }

    watch(specs, options, handler).then(function (res) {
      res.build().then(function () {
        fs.writeFileAsync('target/test/watch-change-non-quantum-inline-test/inlined.txt', 'Content 3')
      })
    })
  })

  it('should yield an error when an invalid spec is passed in', function (done) {
    watch({
      files: {},
      base: 'target/test/watch-change-inline-test',
      watch: true
    }, {dest: 'target2'}, function () {}).catch(function (err) {
      done()
    })
  })

  it('should yield an error when an invalid spec is passed in 2', function (done) {
    watch({}, {dest: 'target2'}, function () {}).catch(function (err) {
      done()
    })
  })

  it('should emit an error when the the file handler returns an error', function (done) {
    var specs = {
      files: 'target/test/watch-change-error-test/index.um',
      base: 'target/test/watch-change-error-test',
      watch: true
    }

    var options = {dest: 'target2'}

    var error = new Error('some error')

    var handler = function (err, parsed, details) {
      if (details.cause === 'change') {
        return Promise.reject(error)
      } else {
        return Promise.resolve()
      }
    }

    watch(specs, options, handler).then(function (res) {
      res.events.on('error', function (err) {
        err.should.equal(error)
        done()
      })

      res.build().then(function () {
        fs.writeFileAsync('target/test/watch-change-error-test/inlined.um', 'Content 3')
      })
    })
  })
})
