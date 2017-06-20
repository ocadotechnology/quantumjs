const chai = require('chai')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs-extra'))
const chokidar = require('chokidar')
const EventEmitter = require('events')
const util = require('util')
const { watch, watcher, File, FileInfo, ParseError } = require('..')

const should = chai.should()

describe('watcher', () => {
  it('watches the right files for change', () => {
    return watcher('target/test/watch-test/*').then((watcher) => {
      return watcher.files().then((fileInfos) => {
        fileInfos.should.eql([
          new FileInfo({
            base: 'target/test/watch-test',
            dest: 'target/index.css',
            destBase: 'target',
            resolved: 'index.css',
            src: 'target/test/watch-test/index.css',
            watch: true
          }),
          new FileInfo({
            base: 'target/test/watch-test',
            dest: 'target/index.um',
            destBase: 'target',
            resolved: 'index.um',
            src: 'target/test/watch-test/index.um',
            watch: true
          }),
          new FileInfo({
            base: 'target/test/watch-test',
            dest: 'target/index1.um',
            destBase: 'target',
            resolved: 'index1.um',
            src: 'target/test/watch-test/index1.um',
            watch: true
          })
        ])

        watcher.stop()
      })
    })
  })

  it('watches the right files for change (negative globs)', () => {
    return watcher({
      files: ['target/test/watch-test/*', '!**/*.um'],
      base: 'target/test/watch-test',
      watch: true
    }, {dest: 'target2'}).then((watcher) => {
      return watcher.files().then((fileInfos) => {
        fileInfos.should.eql([
          new FileInfo({
            base: 'target/test/watch-test',
            dest: 'target2/index.css',
            destBase: 'target2',
            resolved: 'index.css',
            src: 'target/test/watch-test/index.css',
            watch: true
          })
        ])
        watcher.stop()
      })
    })
  })

  it('uses the dest directory from the spec', () => {
    return watcher({
      files: ['target/test/watch-test/*', '!**/*.um'],
      base: 'target/test/watch-test',
      watch: true,
      dest: 'subtarget'
    }, {dest: 'target2'}).then((watcher) => {
      return watcher.files().then((fileInfos) => {
        fileInfos.should.eql([
          new FileInfo({
            base: 'target/test/watch-test',
            dest: 'target2/subtarget/index.css',
            destBase: 'target2',
            resolved: 'index.css',
            src: 'target/test/watch-test/index.css',
            watch: true
          })
        ])
        watcher.stop()
      })
    })
  })

  it('watches the right files for change (multiple simple specs)', () => {
    return watcher(['target/test/files1/*.um', 'target/test/files2/*.um'], {dest: 'target2'}).then((watcher) => {
      return watcher.files().then((fileInfos) => {
        fileInfos.should.eql([
          new FileInfo({
            base: 'target/test/files1',
            dest: 'target2/a.um',
            destBase: 'target2',
            resolved: 'a.um',
            src: 'target/test/files1/a.um',
            watch: true
          }),
          new FileInfo({
            base: 'target/test/files1',
            dest: 'target2/b.um',
            destBase: 'target2',
            resolved: 'b.um',
            src: 'target/test/files1/b.um',
            watch: true
          }),
          new FileInfo({
            base: 'target/test/files2',
            dest: 'target2/e.um',
            destBase: 'target2',
            resolved: 'e.um',
            src: 'target/test/files2/e.um',
            watch: true
          }),
          new FileInfo({
            base: 'target/test/files2',
            dest: 'target2/z.um',
            destBase: 'target2',
            resolved: 'z.um',
            src: 'target/test/files2/z.um',
            watch: true
          })
        ])
        watcher.stop()
      })
    })
  })

  it('watches the right files for change (multiple full specs)', () => {
    return watcher([{
      files: 'target/test/files1/*.um',
      base: 'target/test/files1',
      watch: true
    }, {
      files: 'target/test/files2/*.um',
      base: 'target/test',
      watch: true
    }], {dest: 'target2'}).then((watcher) => {
      return watcher.files().then((fileInfos) => {
        fileInfos.should.eql([
          new FileInfo({
            base: 'target/test/files1',
            dest: 'target2/a.um',
            destBase: 'target2',
            resolved: 'a.um',
            src: 'target/test/files1/a.um',
            watch: true
          }),
          new FileInfo({
            base: 'target/test/files1',
            dest: 'target2/b.um',
            destBase: 'target2',
            resolved: 'b.um',
            src: 'target/test/files1/b.um',
            watch: true
          }),
          new FileInfo({
            base: 'target/test',
            dest: 'target2/files2/e.um',
            destBase: 'target2',
            resolved: 'files2/e.um',
            src: 'target/test/files2/e.um',
            watch: true
          }),
          new FileInfo({
            base: 'target/test',
            dest: 'target2/files2/z.um',
            destBase: 'target2',
            resolved: 'files2/z.um',
            src: 'target/test/files2/z.um',
            watch: true
          })
        ])
        watcher.stop()
      })
    })
  })

  it('watches the right files for change (multiple full specs with negative globs)', () => {
    return watcher([{
      files: ['target/test/files1/*.um', '!target/test/files1/b.um'],
      base: 'target/test/files1',
      watch: true
    }, {
      files: ['target/test/files2/*.um', '!target/test/files2/z.um'],
      base: 'target/test',
      watch: true
    }], {dest: 'target2'}).then((watcher) => {
      return watcher.files().then((fileInfos) => {
        fileInfos.should.eql([
          new FileInfo({
            base: 'target/test/files1',
            dest: 'target2/a.um',
            destBase: 'target2',
            resolved: 'a.um',
            src: 'target/test/files1/a.um',
            watch: true
          }),
          new FileInfo({
            base: 'target/test',
            dest: 'target2/files2/e.um',
            destBase: 'target2',
            resolved: 'files2/e.um',
            src: 'target/test/files2/e.um',
            watch: true
          })
        ])
        watcher.stop()
      })
    })
  })

  it('only watches specs with watch: true', () => {
    return watcher([{
      files: 'target/test/files1/*.um',
      base: 'target/test/files1',
      watch: true
    }, {
      files: 'target/test/files2/*.um',
      base: 'target/test',
      watch: false
    }], {dest: 'target2'}).then((watcher) => {
      return watcher.files().then((fileInfos) => {
        fileInfos.should.eql([
          new FileInfo({
            base: 'target/test/files1',
            dest: 'target2/a.um',
            destBase: 'target2',
            resolved: 'a.um',
            src: 'target/test/files1/a.um',
            watch: true
          }),
          new FileInfo({
            base: 'target/test/files1',
            dest: 'target2/b.um',
            destBase: 'target2',
            resolved: 'b.um',
            src: 'target/test/files1/b.um',
            watch: true
          })
        ])
        watcher.stop()
      })
    })
  })

  it('emits an event when a file is added', (done) => {
    watcher({
      files: 'target/test/watch-change-test/**/*.add',
      base: 'target/test/watch-change-test',
      watch: true
    }, {dest: 'target2'}).then((watcher) => {
      watcher.on('add', (fileInfo) => {
        fileInfo.should.eql(new FileInfo({
          src: 'target/test/watch-change-test/subdir/index.add',
          resolved: 'subdir/index.add',
          base: 'target/test/watch-change-test',
          dest: 'target2/subdir/index.add',
          destBase: 'target2',
          watch: true
        }))
        watcher.stop()
        done()
      })

      fs.outputFileAsync('target/test/watch-change-test/subdir/index.add', 'Content 2')
    })
  })

  it('emits an event when a file changes', (done) => {
    watcher({
      files: 'target/test/watch-change-test/*.um',
      base: 'target/test/watch-change-test',
      watch: true
    }, {dest: 'target2'}).then((watcher) => {
      watcher.on('change', (fileInfo) => {
        fileInfo.should.eql(new FileInfo({
          src: 'target/test/watch-change-test/index.um',
          resolved: 'index.um',
          base: 'target/test/watch-change-test',
          dest: 'target2/index.um',
          destBase: 'target2',
          watch: true
        }))
        watcher.stop()
        done()
      })

      fs.writeFileAsync('target/test/watch-change-test/index.um', 'Content 2')
    })
  })

  it('emits an event when a file is removed', (done) => {
    fs.outputFileAsync('target/test/watch-change-test/subdir/index.remove', 'Content 2').then(() => {
      watcher({
        files: 'target/test/watch-change-test/**/*.remove',
        base: 'target/test/watch-change-test',
        watch: true
      }, {dest: 'target2'}).then((watcher) => {
        watcher.on('remove', (fileInfo) => {
          fileInfo.should.eql(new FileInfo({
            src: 'target/test/watch-change-test/subdir/index.remove',
            resolved: 'subdir/index.remove',
            base: 'target/test/watch-change-test',
            dest: 'target2/subdir/index.remove',
            destBase: 'target2',
            watch: true
          }))
          watcher.stop()
          done()
        })

        fs.removeAsync('target/test/watch-change-test/subdir/index.remove')
      })
    })
  })

  it('yields an error when an invalid spec is passed in', (done) => {
    watcher({
      files: {},
      base: 'target/test/watch-change-inline-test',
      watch: true
    }, {dest: 'target2'}).catch((err) => {
      should.exist(err)
      done()
    })
  })

  it('yields an error when an invalid spec is passed in 2', (done) => {
    watcher({}, {dest: 'target2'}).catch((err) => {
      should.exist(err)
      done()
    })
  })

  describe('chokidar error tests', () => {
    const cwatch = chokidar.watch

    function FakeChokidarWatch () {
      EventEmitter.call(this)
    }
    util.inherits(FakeChokidarWatch, EventEmitter)
    const fcw = new FakeChokidarWatch()

    before(() => {
      chokidar.watch = (files, options) => {
        return fcw
      }
    })

    after(() => {
      chokidar.watch = cwatch
    })

    it('yields an error when chokidar emits an error', (done) => {
      const error = new Error('some error')

      watcher(['target/**.um'], {dest: 'target2'}).catch((err) => {
        err.should.equal(error)
        done()
      })

      // This timeout is needed to make sure the promise in watcher is evaluated
      // before this gets called
      setTimeout(() => {
        fcw.emit('error', error)
      }, 0)
    })
  })
})

describe('watch', () => {
  it('watches inline files', (done) => {
    const specs = {
      files: 'target/test/watch-change-inline-test/index.um',
      base: 'target/test/watch-change-inline-test',
      watch: true
    }

    const options = {dest: 'target2'}

    function handler (err, parsed, details) {
      should.not.exist(err)
      if (details.cause === 'change') {
        parsed.should.eql(new File({
          info: new FileInfo({
            src: 'target/test/watch-change-inline-test/index.um',
            resolved: 'index.um',
            base: 'target/test/watch-change-inline-test',
            dest: 'target2/index.um',
            destBase: 'target2',
            watch: true
          }),
          content: {
            type: '',
            params: [],
            content: ['Content 1', 'Content 3']
          },
          meta: {}
        }))
        done()
      }
    }

    watch(specs, handler, options).then((res) => {
      res.build().then(() => {
        fs.writeFileAsync('target/test/watch-change-inline-test/inlined.um', 'Content 3')
      })
    })
  })

  it('watches with the default options', (done) => {
    const specs = {
      files: 'target/test/watch-change-inline-default-test/index.um',
      base: 'target/test/watch-change-inline-default-test',
      watch: true
    }

    function handler (err, parsed, details) {
      should.not.exist(err)
      if (details.cause === 'change') {
        parsed.should.eql(new File({
          info: new FileInfo({
            src: 'target/test/watch-change-inline-default-test/index.um',
            resolved: 'index.um',
            base: 'target/test/watch-change-inline-default-test',
            dest: 'target/index.um',
            destBase: 'target',
            watch: true
          }),
          content: {
            type: '',
            params: [],
            content: ['Content 1', 'Content 3']
          },
          meta: {}
        }))
        done()
      }
    }

    watch(specs, handler).then((res) => {
      res.build().then(() => {
        fs.writeFileAsync('target/test/watch-change-inline-default-test/inlined.um', 'Content 3')
      })
    })
  })

  it('watches inline files several levels deep', (done) => {
    const specs = {
      files: 'target/test/watch-change-deep-inline-test/index.um',
      base: 'target/test/watch-change-deep-inline-test',
      watch: true
    }

    const options = {dest: 'target2'}

    function handler (err, parsed, details) {
      should.not.exist(err)
      if (details.cause === 'change') {
        parsed.should.eql(new File({
          info: new FileInfo({
            src: 'target/test/watch-change-deep-inline-test/index.um',
            resolved: 'index.um',
            base: 'target/test/watch-change-deep-inline-test',
            dest: 'target2/index.um',
            destBase: 'target2',
            watch: true
          }),
          content: {
            type: '',
            params: [],
            content: ['Content 1', 'Content 3']
          },
          meta: {}
        }))
        done()
      }
    }

    watch(specs, handler, options).then((res) => {
      res.build().then(() => {
        fs.writeFileAsync('target/test/watch-change-deep-inline-test/inlined-2.um', 'Content 3')
      })
    })
  })

  it('changing the base file results in the handler being called', (done) => {
    const specs = {
      files: 'target/test/watch-change-base-inline-test/index.um',
      base: 'target/test/watch-change-base-inline-test',
      watch: true
    }

    const options = {dest: 'target2'}

    function handler (err, parsed, details) {
      should.not.exist(err)
      if (details.cause === 'change') {
        parsed.should.eql(new File({
          info: new FileInfo({
            src: 'target/test/watch-change-base-inline-test/index.um',
            resolved: 'index.um',
            base: 'target/test/watch-change-base-inline-test',
            dest: 'target2/index.um',
            destBase: 'target2',
            watch: true
          }),
          content: {
            type: '',
            params: [],
            content: ['Content 0', 'Content 2']
          },
          meta: {}
        }))
        done()
      }
    }

    watch(specs, handler, options).then((res) => {
      res.build().then(() => {
        fs.writeFileAsync('target/test/watch-change-base-inline-test/index.um', 'Content 0\n@inline inlined.um')
      })
    })
  })

  it('removing a file results in the handler being called', (done) => {
    const specs = {
      files: 'target/test/watch-change-remove-inline-test/index.um',
      base: 'target/test/watch-change-remove-inline-test',
      watch: true
    }

    const options = {dest: 'target2'}

    function handler (err, parsed, details) {
      should.not.exist(err)
      if (details.cause === 'change') {
        parsed.should.eql(new File({
          info: new FileInfo({
            src: 'target/test/watch-change-remove-inline-test/index.um',
            resolved: 'index.um',
            base: 'target/test/watch-change-remove-inline-test',
            dest: 'target2/index.um',
            destBase: 'target2',
            watch: true
          }),
          content: {
            type: '',
            params: [],
            content: ['Content 1']
          },
          meta: {}
        }))
        done()
      }
    }

    watch(specs, handler, options).then((res) => {
      res.build().then(() => {
        fs.removeAsync('target/test/watch-change-remove-inline-test/inlined.um')
      })
    })
  })

  it('doesnt error when a base file is removed, then a previously linked file is changed', (done) => {
    const specs = {
      files: 'target/test/watch-change-base-delete-inline-test/index*.um',
      base: 'target/test/watch-change-base-delete-inline-test',
      watch: true
    }

    const options = {dest: 'target2'}

    const errors = []
    let complete = false

    function handler (err, parsed, details) {
      should.not.exist(err)
      if (details.cause === 'change') {
        errors.should.eql([]) // expect there to be no errors
        if (!complete) {
          complete = true
          done()
        }
      }
    }

    watch(specs, handler, options).then((res) => {
      res.events.on('error', (err) => {
        errors.push(err)
      })

      res.events.on('delete', (filename) => {
        filename.should.equal('target/test/watch-change-base-delete-inline-test/index.um')
        fs.writeFileAsync('target/test/watch-change-base-delete-inline-test/inlined.um', 'Content 3')
      })

      res.build()
        .then(() => {
          fs.removeAsync('target/test/watch-change-base-delete-inline-test/index.um')
        })
    })
  })

  it('doesnt error when the middle file in a chain is deleted, and the leaf is changed', (done) => {
    const specs = [
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

    const options = {dest: 'target2'}

    const errors = []

    function handler (err, parsed, details) {
      should.not.exist(err)
      if (details.rootCause === 'change') {
        errors.should.eql([]) // expect there to be no errors
        done()
      }
    }

    watch(specs, handler, options).then((res) => {
      res.events.on('error', (err) => {
        errors.push(err)
      })

      res.events.on('delete', (filename) => {
        filename.should.equal('target/test/watch-change-middle-delete-inline-test/inlined.um')
        fs.writeFileAsync('target/test/watch-change-middle-delete-inline-test/inlined-2.um', 'Content 3')
      })

      res.build()
        .then(() => {
          fs.removeAsync('target/test/watch-change-middle-delete-inline-test/inlined.um')
        })
    })
  })

  it('watches non quantum inline files', (done) => {
    const specs = {
      files: 'target/test/watch-change-non-quantum-inline-test/index.um',
      base: 'target/test/watch-change-non-quantum-inline-test',
      watch: true
    }

    const options = {dest: 'target2'}

    function handler (err, parsed, details) {
      should.not.exist(err)
      if (details.cause === 'change') {
        parsed.should.eql(new File({
          info: new FileInfo({
            src: 'target/test/watch-change-non-quantum-inline-test/index.um',
            resolved: 'index.um',
            base: 'target/test/watch-change-non-quantum-inline-test',
            dest: 'target2/index.um',
            destBase: 'target2',
            watch: true
          }),
          content: {
            type: '',
            params: [],
            content: ['Content 1', 'Content 3']
          },
          meta: {}
        }))
        done()
      }
    }

    watch(specs, handler, options).then((res) => {
      res.build().then(() => {
        fs.writeFileAsync('target/test/watch-change-non-quantum-inline-test/inlined.txt', 'Content 3')
      })
    })
  })

  it('yields an error when an invalid spec is passed in', (done) => {
    watch({
      files: {},
      base: 'target/test/watch-change-inline-test',
      watch: true
    }, () => {}, {dest: 'target2'}).catch((err) => {
      should.exist(err)
      done()
    })
  })

  it('yields an error when an invalid spec is passed in 2', (done) => {
    watch({}, () => {}, {dest: 'target2'}).catch((err) => {
      should.exist(err)
      done()
    })
  })

  it('emits an error when the the file handler returns an error', (done) => {
    const specs = {
      files: 'target/test/watch-change-error-test/index.um',
      base: 'target/test/watch-change-error-test',
      watch: true
    }

    const options = {dest: 'target2'}

    const error = new Error('some error')

    function handler (err, parsed, details) {
      should.not.exist(err)
      if (details.cause === 'change') {
        return Promise.reject(error)
      } else {
        return Promise.resolve()
      }
    }

    watch(specs, handler, options).then((res) => {
      res.events.on('error', (err) => {
        err.should.equal(error)
        done()
      })

      res.build().then(() => {
        fs.writeFileAsync('target/test/watch-change-error-test/inlined.um', 'Content 3')
      })
    })
  })

  it('emits an error when the the file handler returns a parse error', (done) => {
    const specs = {
      files: 'target/test/watch-invalid/index.um',
      base: 'target/test/watch-invalid',
      watch: true
    }

    const options = {dest: 'target2'}

    function handler (err, parsed, details) {
      err.should.be.an.instanceof(ParseError)
      done()
    }

    watch(specs, handler, options)
  })
})
