'use strict'
const files = require('../').fileOptions
const should = require('chai').should()
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs-extra'))
const FileInfo = require('../').FileInfo
const path = require('path')

describe('resolve', () => {
  const currDir = process.cwd()
  before(() => {
    process.chdir(path.join(__dirname, '../'))
    return fs.removeAsync('target/test').then(() => {
      return fs.copyAsync('test/files', 'target/test')
    })
  })
  after(() => process.chdir(currDir))

  const expectedList1 = [
    new FileInfo({
      src: 'target/test/files1/a.um',
      resolved: 'a.um',
      base: 'target/test/files1',
      dest: 'target/a.um',
      destBase: 'target',
      watch: true
    }),
    new FileInfo({
      src: 'target/test/files1/b.um',
      resolved: 'b.um',
      base: 'target/test/files1',
      dest: 'target/b.um',
      destBase: 'target',
      watch: true
    }),
    new FileInfo({
      src: 'target/test/files1/c/d.um',
      resolved: 'c/d.um',
      base: 'target/test/files1',
      dest: 'target/c/d.um',
      destBase: 'target',
      watch: true
    })
  ]

  const expectedList2 = [
    new FileInfo({
      src: 'target/test/files2/e.um',
      resolved: 'e.um',
      base: 'target/test/files2',
      dest: 'target/e.um',
      destBase: 'target',
      watch: true
    })
  ]

  const expectedList3 = [
    new FileInfo({
      src: 'target/test/files2/e.um',
      resolved: 'e.um',
      base: 'target/test/files2',
      dest: 'target/e.um',
      destBase: 'target',
      watch: true
    }),
    new FileInfo({
      src: 'target/test/files2/z.um',
      resolved: 'z.um',
      base: 'target/test/files2',
      dest: 'target/z.um',
      destBase: 'target',
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
      dest: 'target'
    }

    return files.resolve(list, options).then((files) => {
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

    return files.resolve(list, options).then((files) => {
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
      dest: 'target'
    }

    return files.resolve(list, options).then((files) => {
      files.should.eql(expectedList1)
    })
  })

  it('single object (inferred base)', () => {
    const list = {
      files: 'target/test/files1/**/*'
    }

    const options = {
      dir: '.',
      dest: 'target'
    }

    return files.resolve(list, options).then((files) => {
      files.should.eql(expectedList1)
    })
  })

  it('single object (using default options)', () => {
    const list = {
      files: 'target/test/files1/**/*',
      base: 'target/test/files1'
    }

    return files.resolve(list).then((files) => {
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
      dest: 'target'
    }

    return files.resolve(list, options).then((files) => {
      files.should.eql(expectedList1)
    })
  })

  it('array of globs', () => {
    const list = ['target/test/files1/**/*', 'target/test/files2/**/*']

    const options = {
      dir: '.',
      dest: 'target'
    }

    return files.resolve(list, options).then((files) => {
      files.should.eql(expectedList1.concat(expectedList3))
    })
  })

  it('single glob', () => {
    const list = 'target/test/files1/**/*'

    const options = {
      dir: '.',
      dest: 'target'
    }

    return files.resolve(list, options).then((files) => {
      files.should.eql(expectedList1)
    })
  })

  it('should yield an error when an invalid spec is passed in', (done) => {
    files.resolve({
      files: {},
      base: 'target/test/watch-change-inline-test',
      watch: true
    }, {dest: 'target2'}).catch((err) => {
      should.exist(err)
      done()
    })
  })

  it('should yield an error when an invalid spec is passed in 2', (done) => {
    files.resolve({}, {dest: 'target2'}).catch((err) => {
      should.exist(err)
      done()
    })
  })

  describe('validate', () => {
    it('should return an error for an undefined spec', () => {
      files.validate(undefined).should.eql(new Error('spec cannot be undefined'))
    })

    it('should return an error if an object spec is passed in with no files property', () => {
      files.validate({}).should.eql(new Error('spec.files cannot be undefined property'))
    })

    it('should return an error if an object in an array spec is passed in with no files property', () => {
      files.validate([{}]).should.eql(new Error('spec.files cannot be undefined property'))
    })

    it('should return an error if no base property is set for an object with an array of files', () => {
      files.validate({files: []}).should.eql(new Error('spec.files cannot be undefined property'))
    })
  })
})
