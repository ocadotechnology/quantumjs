var files = require('..').fileOptions
var chai = require('chai')
var should = chai.should()
var expect = chai.expect
var Promise = require('bluebird')
var fs = Promise.promisifyAll(require('fs-extra'))
var util = require('util')
var File = require('..').File

describe('resolve', function () {
  before(function () {
    return fs.removeAsync('target/test').then(function () {
      return fs.copyAsync('test/files', 'target/test')
    })
  })

  var expectedList1 = [
    new File({
      src: 'target/test/files1/a.um',
      resolved: 'a.um',
      base: 'target/test/files1',
      dest: 'target/a.um',
      watch: true
    }),
    new File({
      src: 'target/test/files1/b.um',
      resolved: 'b.um',
      base: 'target/test/files1',
      dest: 'target/b.um',
      watch: true
    }),
    new File({
      src: 'target/test/files1/c/d.um',
      resolved: 'c/d.um',
      base: 'target/test/files1',
      dest: 'target/c/d.um',
      watch: true
    })
  ]

  var expectedList2 = [
    new File({
      src: 'target/test/files2/e.um',
      resolved: 'e.um',
      base: 'target/test/files2',
      dest: 'target/e.um',
      watch: true
    })
  ]

  var expectedList3 = [
    new File({
      src: 'target/test/files2/e.um',
      resolved: 'e.um',
      base: 'target/test/files2',
      dest: 'target/e.um',
      watch: true
    }),
    new File({
      src: 'target/test/files2/z.um',
      resolved: 'z.um',
      base: 'target/test/files2',
      dest: 'target/z.um',
      watch: true
    })
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

    return files.resolve(list, options).then(function (files) {
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

    return files.resolve(list, options).then(function (files) {
      files.should.eql(expectedList1)
    })
  })

  it('single object (using default options)', function () {
    var list = {
      files: 'target/test/files1/**/*',
      base: 'target/test/files1'
    }

    return files.resolve(list).then(function (files) {
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

    return files.resolve(list, options).then(function (files) {
      files.should.eql(expectedList1)
    })
  })

  it('array of globs', function () {
    var list = ['target/test/files1/**/*', 'target/test/files2/**/*']

    var options = {
      dir: '.',
      dest: 'target'
    }

    return files.resolve(list, options).then(function (files) {
      files.should.eql(expectedList1.concat(expectedList3))
    })
  })

  it('single glob', function () {
    var list = 'target/test/files1/**/*'

    var options = {
      dir: '.',
      dest: 'target'
    }

    return files.resolve(list, options).then(function (files) {
      files.should.eql(expectedList1)
    })
  })

  it('should yield an error when an invalid spec is passed in', function (done) {
    files.resolve({
      files: {},
      base: 'target/test/watch-change-inline-test',
      watch: true
    }, {dest: 'target2'}).catch(function (err) {
      done()
    })
  })

  it('should yield an error when an invalid spec is passed in 2', function (done) {
    files.resolve({}, {dest: 'target2'}).catch(function (err) {
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
