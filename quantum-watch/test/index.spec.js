var watch = require('..')
var should = require('chai').should()
var Promise = require('bluebird')
var fs = Promise.promisifyAll(require('fs-extra'))

describe('resolve', function () {
  before(function () {
    return fs.removeAsync('target/test').then(function () {
      return fs.copyAsync('test/files', 'target/test')
    })
  })

  var expectedList1 = [
    {
      src: 'target/test/files1/a.um',
      resolved: 'a.um',
      base: 'target/test/files1',
      dest: 'target/a.um',
      watch: true
    },
    {
      src: 'target/test/files1/b.um',
      resolved: 'b.um',
      base: 'target/test/files1',
      dest: 'target/b.um',
      watch: true
    },
    {
      src: 'target/test/files1/c/d.um',
      resolved: 'c/d.um',
      base: 'target/test/files1',
      dest: 'target/c/d.um',
      watch: true
    }
  ]

  var expectedList2 = [
    {
      src: 'target/test/files2/e.um',
      resolved: 'e.um',
      base: 'target/test/files2',
      dest: 'target/e.um',
      watch: true
    }
  ]

  var expectedList3 = [
    {
      src: 'target/test/files2/e.um',
      resolved: 'e.um',
      base: 'target/test/files2',
      dest: 'target/e.um',
      watch: true
    },
    {
      src: 'target/test/files2/z.um',
      resolved: 'z.um',
      base: 'target/test/files2',
      dest: 'target/z.um',
      watch: true
    }
  ]

  var expectedList = expectedList1.concat(expectedList2)

  it('full options (with negative query)', function () {
    var list = [
      {
        files: 'target/test/files1/**/*',
        base: 'target/test/files1'
      },
      {
        files: ['target/test/files2/**/*', '!**/z.um'],
        base: 'target/test/files2'
      }
    ]

    var options = {
      dir: '.',
      dest: 'target'
    }

    return watch.resolve(list, options).then(function (files) {
      files.should.eql(expectedList)
    })
  })

  it('single object', function () {
    var list = {
      files: 'target/test/files1/**/*',
      base: 'target/test/files1'
    }

    var options = {
      dir: '.',
      dest: 'target'
    }

    return watch.resolve(list, options).then(function (files) {
      files.should.eql(expectedList1)
    })
  })

  it('single object (using default options)', function () {
    var list = {
      files: 'target/test/files1/**/*',
      base: 'target/test/files1'
    }

    return watch.resolve(list).then(function (files) {
      files.should.eql(expectedList1)
    })
  })

  it('single object with array files list', function () {
    var list = {
      files: ['target/test/files1/**/*'],
      base: 'target/test/files1'
    }

    var options = {
      dir: '.',
      dest: 'target'
    }

    return watch.resolve(list, options).then(function (files) {
      files.should.eql(expectedList1)
    })
  })

  it('array of globs', function () {
    var list = ['target/test/files1/**/*', 'target/test/files2/**/*']

    var options = {
      dir: '.',
      dest: 'target'
    }

    return watch.resolve(list, options).then(function (files) {
      files.should.eql(expectedList1.concat(expectedList3))
    })
  })

  it('single glob', function () {
    var list = 'target/test/files1/**/*'

    var options = {
      dir: '.',
      dest: 'target'
    }

    return watch.resolve(list, options).then(function (files) {
      files.should.eql(expectedList1)
    })
  })
})

describe('watcher', function () {
  it('should watch the right files for change', function () {
    return watch.watcher('target/test/watch-test/*').then(function (watcher) {
      watcher.files().should.eql([
        {
          'base': 'target/test/watch-test',
          'dest': 'target/index.css',
          'resolved': 'index.css',
          'src': 'target/test/watch-test/index.css',
          'watch': true
        },
        {
          'base': 'target/test/watch-test',
          'dest': 'target/index.um',
          'resolved': 'index.um',
          'src': 'target/test/watch-test/index.um',
          'watch': true
        },
        {
          'base': 'target/test/watch-test',
          'dest': 'target/index1.um',
          'resolved': 'index1.um',
          'src': 'target/test/watch-test/index1.um',
          'watch': true
        }
      ])
      watcher.stop()
    })
  })

  it('should watch the right files for change (negative globs)', function () {
    return watch.watcher({
      files: ['target/test/watch-test/*', '!**/*.um'],
      base: 'target/test/watch-test',
      watch: true
    }, {dest: 'target2'}).then(function (watcher) {
      watcher.files().should.eql([
        {
          'base': 'target/test/watch-test',
          'dest': 'target2/index.css',
          'resolved': 'index.css',
          'src': 'target/test/watch-test/index.css',
          'watch': true
        }
      ])
      watcher.stop()
    })
  })

  it('should use the dest directory from the spec', function () {
    return watch.watcher({
      files: ['target/test/watch-test/*', '!**/*.um'],
      base: 'target/test/watch-test',
      watch: true,
      dest: 'subtarget'
    }, {dest: 'target2'}).then(function (watcher) {
      watcher.files().should.eql([
        {
          'base': 'target/test/watch-test',
          'dest': 'target2/subtarget/index.css',
          'resolved': 'index.css',
          'src': 'target/test/watch-test/index.css',
          'watch': true
        }
      ])
      watcher.stop()
    })
  })

  it('should watch the right files for change (multiple simple specs)', function () {
    return watch.watcher(['target/test/files1/*.um', 'target/test/files2/*.um'], {dest: 'target2'}).then(function (watcher) {
      watcher.files().should.eql([
        {
          'base': 'target/test/files1',
          'dest': 'target2/a.um',
          'resolved': 'a.um',
          'src': 'target/test/files1/a.um',
          'watch': true
        },
        {
          'base': 'target/test/files1',
          'dest': 'target2/b.um',
          'resolved': 'b.um',
          'src': 'target/test/files1/b.um',
          'watch': true
        },
        {
          'base': 'target/test/files2',
          'dest': 'target2/e.um',
          'resolved': 'e.um',
          'src': 'target/test/files2/e.um',
          'watch': true
        },
        {
          'base': 'target/test/files2',
          'dest': 'target2/z.um',
          'resolved': 'z.um',
          'src': 'target/test/files2/z.um',
          'watch': true
        }
      ])
      watcher.stop()
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
      watcher.files().should.eql([
        {
          'base': 'target/test/files1',
          'dest': 'target2/a.um',
          'resolved': 'a.um',
          'src': 'target/test/files1/a.um',
          'watch': true
        },
        {
          'base': 'target/test/files1',
          'dest': 'target2/b.um',
          'resolved': 'b.um',
          'src': 'target/test/files1/b.um',
          'watch': true
        },
        {
          'base': 'target/test',
          'dest': 'target2/files2/e.um',
          'resolved': 'files2/e.um',
          'src': 'target/test/files2/e.um',
          'watch': true
        },
        {
          'base': 'target/test',
          'dest': 'target2/files2/z.um',
          'resolved': 'files2/z.um',
          'src': 'target/test/files2/z.um',
          'watch': true
        }
      ])
      watcher.stop()
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
      watcher.files().should.eql([
        {
          'base': 'target/test/files1',
          'dest': 'target2/a.um',
          'resolved': 'a.um',
          'src': 'target/test/files1/a.um',
          'watch': true
        },
        {
          'base': 'target/test',
          'dest': 'target2/files2/e.um',
          'resolved': 'files2/e.um',
          'src': 'target/test/files2/e.um',
          'watch': true
        }
      ])
      watcher.stop()
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
      watcher.files().should.eql([
        {
          'base': 'target/test/files1',
          'dest': 'target2/a.um',
          'resolved': 'a.um',
          'src': 'target/test/files1/a.um',
          'watch': true
        },
        {
          'base': 'target/test/files1',
          'dest': 'target2/b.um',
          'resolved': 'b.um',
          'src': 'target/test/files1/b.um',
          'watch': true
        }
      ])
      watcher.stop()
    })
  })

  it('should emit an event when a file is added', function (done) {
    watch.watcher({
      files: 'target/test/watch-change-test/**/*.add',
      base: 'target/test/watch-change-test',
      watch: true
    }, {dest: 'target2'}).then(function (watcher) {
      watcher.on('add', function (obj) {
        obj.should.eql({
          src: 'target/test/watch-change-test/subdir/index.add',
          resolved: 'subdir/index.add',
          base: 'target/test/watch-change-test',
          dest: 'target2/subdir/index.add',
          watch: true
        })
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
        obj.should.eql({
          src: 'target/test/watch-change-test/index.um',
          resolved: 'index.um',
          base: 'target/test/watch-change-test',
          dest: 'target2/index.um',
          watch: true
        })
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
          obj.should.eql({
            src: 'target/test/watch-change-test/subdir/index.remove',
            resolved: 'subdir/index.remove',
            base: 'target/test/watch-change-test',
            dest: 'target2/subdir/index.remove',
            watch: true
          })
          watcher.stop()
          done()
        })

        fs.removeAsync('target/test/watch-change-test/subdir/index.remove')
      })
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

    var handler = function (parsed, details) {
      if (details.cause === 'change') {
        parsed.should.eql({
          filename: 'target/test/watch-change-inline-test/index.um',
          file: {
            src: 'target/test/watch-change-inline-test/index.um',
            resolved: 'index.um',
            base: 'target/test/watch-change-inline-test',
            dest: 'target2/index.um',
            watch: true
          },
          content: {
            content: ['Content 1', 'Content 3']
          }
        })
        done()
      }
    }

    watch(specs, options, handler).then(function (res) {
      res.build().then(function () {
        fs.writeFileAsync('target/test/watch-change-inline-test/inlined.um', 'Content 3')
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

    var handler = function (parsed, details) {
      if (details.cause === 'change') {
        parsed.should.eql({
          filename: 'target/test/watch-change-deep-inline-test/index.um',
          file: {
            src: 'target/test/watch-change-deep-inline-test/index.um',
            resolved: 'index.um',
            base: 'target/test/watch-change-deep-inline-test',
            dest: 'target2/index.um',
            watch: true
          },
          content: {
            content: ['Content 1', 'Content 3']
          }
        })
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

    var handler = function (parsed, details) {
      if (details.cause === 'change') {
        parsed.should.eql({
          filename: 'target/test/watch-change-base-inline-test/index.um',
          file: {
            src: 'target/test/watch-change-base-inline-test/index.um',
            resolved: 'index.um',
            base: 'target/test/watch-change-base-inline-test',
            dest: 'target2/index.um',
            watch: true
          },
          content: {
            content: ['Content 0', 'Content 2']
          }
        })
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

    var handler = function (parsed, details) {
      if (details.cause === 'change') {
        parsed.should.eql({
          filename: 'target/test/watch-change-remove-inline-test/index.um',
          file: {
            src: 'target/test/watch-change-remove-inline-test/index.um',
            resolved: 'index.um',
            base: 'target/test/watch-change-remove-inline-test',
            dest: 'target2/index.um',
            watch: true
          },
          content: {
            content: ['Content 1']
          }
        })
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

    var handler = function (parsed, details) {
      if (details.cause === 'change') {
        errors.should.eql([]) // expect there to be no errors
        done()
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
    var specs = {
      files: 'target/test/watch-change-middle-delete-inline-test/index*.um',
      base: 'target/test/watch-change-middle-delete-inline-test',
      watch: true
    }

    var options = {dest: 'target2'}

    var errors = []

    var handler = function (parsed, details) {
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

    var handler = function (parsed, details) {
      if (details.cause === 'change') {
        parsed.should.eql({
          filename: 'target/test/watch-change-non-quantum-inline-test/index.um',
          file: {
            src: 'target/test/watch-change-non-quantum-inline-test/index.um',
            resolved: 'index.um',
            base: 'target/test/watch-change-non-quantum-inline-test',
            dest: 'target2/index.um',
            watch: true
          },
          content: {
            content: ['Content 1', 'Content 3']
          }
        })
        done()
      }
    }

    watch(specs, options, handler).then(function (res) {
      res.build().then(function () {
        fs.writeFileAsync('target/test/watch-change-non-quantum-inline-test/inlined.txt', 'Content 3')
      })
    })
  })
})
