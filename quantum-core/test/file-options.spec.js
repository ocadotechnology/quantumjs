const chai = require('chai')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs-extra'))
const { FileInfo } = require('..')
const fileOptions = require('../lib/file-options')

const should = chai.should()

describe('file options', () => {
  it('exports the correct things', () => {
    fileOptions.should.be.an('object')
    fileOptions.should.have.keys([
      'createFileUsingSpec',
      'normalize',
      'resolve',
      'validate'
    ])
    fileOptions.createFileUsingSpec.should.be.a('function')
    fileOptions.normalize.should.be.a('function')
    fileOptions.resolve.should.be.a('function')
    fileOptions.validate.should.be.a('function')
  })

  describe('createFileUsingSpec', () => {
    xit('placeholder', () => {

    })
  })

  describe('normalize', () => {
    xit('placeholder', () => {

    })
  })

  describe('resolve', () => {
    const { resolve } = fileOptions
    before(() => {
      return fs.removeAsync('target/test').then(() => {
        return fs.copyAsync('test/files', 'target/test')
      })
    })

    const expectedList1 = [
      new FileInfo({
        src: 'target/test/files1/a.um',
        resolved: 'a.um',
        base: 'target/test/files1',
        dest: 'public/a.um',
        destBase: 'public',
        watch: true
      }),
      new FileInfo({
        src: 'target/test/files1/b.um',
        resolved: 'b.um',
        base: 'target/test/files1',
        dest: 'public/b.um',
        destBase: 'public',
        watch: true
      }),
      new FileInfo({
        src: 'target/test/files1/c/d.um',
        resolved: 'c/d.um',
        base: 'target/test/files1',
        dest: 'public/c/d.um',
        destBase: 'public',
        watch: true
      })
    ]

    const expectedList2 = [
      new FileInfo({
        src: 'target/test/files2/e.um',
        resolved: 'e.um',
        base: 'target/test/files2',
        dest: 'public/e.um',
        destBase: 'public',
        watch: true
      })
    ]

    const expectedList3 = [
      new FileInfo({
        src: 'target/test/files2/e.um',
        resolved: 'e.um',
        base: 'target/test/files2',
        dest: 'public/e.um',
        destBase: 'public',
        watch: true
      }),
      new FileInfo({
        src: 'target/test/files2/z.um',
        resolved: 'z.um',
        base: 'target/test/files2',
        dest: 'public/z.um',
        destBase: 'public',
        watch: true
      })
    ]

    const expectedList = expectedList1.concat(expectedList2)

    it('full options (with negative query)', () => {
      const list = [
        {
          files: 'target/test/files1/**/*',
          base: 'target/test/files1'
        },
        {
          files: ['target/test/files2/**/*', '!**/z.um'],
          base: 'target/test/files2'
        }
      ]

      const options = {
        dir: '.',
        dest: 'public'
      }

      return resolve(list, options).then((files) => {
        files.should.eql(expectedList)
      })
    })

    it('single file', () => {
      const list = {
        files: 'target/test/files1/a.um'
      }

      const options = {
        dir: '.',
        dest: 'target2'
      }

      return resolve(list, options).then((files) => {
        files.should.eql([
          new FileInfo({
            src: 'target/test/files1/a.um',
            resolved: 'target/test/files1/a.um',
            base: '.',
            dest: 'target2/target/test/files1/a.um',
            destBase: 'target2',
            watch: true
          })
        ])
      })
    })

    it('single object', () => {
      const list = {
        files: 'target/test/files1/**/*',
        base: 'target/test/files1'
      }

      const options = {
        dir: '.',
        dest: 'public'
      }

      return resolve(list, options).then((files) => {
        files.should.eql(expectedList1)
      })
    })

    it('single object (inferred base)', () => {
      const list = {
        files: 'target/test/files1/**/*'
      }

      const options = {
        dir: '.',
        dest: 'public'
      }

      return resolve(list, options).then((files) => {
        files.should.eql(expectedList1)
      })
    })

    it('single object (using default options)', () => {
      const list = {
        files: 'target/test/files1/**/*',
        base: 'target/test/files1'
      }

      return resolve(list).then((files) => {
        files.should.eql(expectedList1)
      })
    })

    it('single object with array files list', () => {
      const list = {
        files: ['target/test/files1/**/*'],
        base: 'target/test/files1'
      }

      const options = {
        dir: '.',
        dest: 'public'
      }

      return resolve(list, options).then((files) => {
        files.should.eql(expectedList1)
      })
    })

    it('array of globs', () => {
      const list = ['target/test/files1/**/*', 'target/test/files2/**/*']

      const options = {
        dir: '.',
        dest: 'public'
      }

      return resolve(list, options).then((files) => {
        files.should.eql(expectedList1.concat(expectedList3))
      })
    })

    it('single glob', () => {
      const list = 'target/test/files1/**/*'

      const options = {
        dir: '.',
        dest: 'public'
      }

      return resolve(list, options).then((files) => {
        files.should.eql(expectedList1)
      })
    })

    it('yields an error when an invalid spec is passed in', (done) => {
      resolve({
        files: {},
        base: 'target/test/watch-change-inline-test',
        watch: true
      }, {dest: 'target2'}).catch((err) => {
        should.exist(err)
        done()
      })
    })

    it('yields an error when an invalid spec is passed in 2', (done) => {
      resolve({}, {dest: 'target2'}).catch((err) => {
        should.exist(err)
        done()
      })
    })
  })

  describe('validate', () => {
    const { validate } = fileOptions
    it('does not return an error for valid specs', () => {
      const validSpec = {
        files: ['page.um'],
        base: '/',
        watch: true,
        dest: 'public'
      }
      should.not.exist(validate(validSpec))
    })

    it('returns an error for an undefined spec', () => {
      validate(undefined).should.eql(new Error('spec cannot be undefined'))
    })

    it('returns an error if an object spec is passed in with no files property', () => {
      validate({}).should.eql(new Error('spec.files cannot be undefined property'))
    })

    it('returns an error if an object in an array spec is passed in with no files property', () => {
      validate([{}]).should.eql(new Error('spec.files cannot be undefined property'))
    })

    it('returns an error if no base property is set for an object with an array of files', () => {
      validate({files: []}).should.eql(new Error('spec.files cannot be undefined property'))
    })
  })
})
