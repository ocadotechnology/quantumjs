var resolveFiles = require('../resolve-files')
var should = require('chai').should()

describe('test', function () {
  var expectedList1 = [
    {
      src: 'test/files1/a.um',
      resolved: 'a.um',
      base: 'test/files1',
      dest: 'target/a.um',
      watch: true
    },
    {
      src: 'test/files1/b.um',
      resolved: 'b.um',
      base: 'test/files1',
      dest: 'target/b.um',
      watch: true
    },
    {
      src: 'test/files1/c/d.um',
      resolved: 'c/d.um',
      base: 'test/files1',
      dest: 'target/c/d.um',
      watch: true
    }
  ]

  var expectedList2 = [
    {
      src: 'test/files2/e.um',
      resolved: 'e.um',
      base: 'test/files2',
      dest: 'target/e.um',
      watch: true
    }
  ]

  var expectedList3 = [
    {
      src: 'test/files2/e.um',
      resolved: 'e.um',
      base: 'test/files2',
      dest: 'target/e.um',
      watch: true
    },
    {
      src: 'test/files2/z.um',
      resolved: 'z.um',
      base: 'test/files2',
      dest: 'target/z.um',
      watch: true
    }
  ]

  var expectedList = expectedList2.concat(expectedList1)

  it('full options (with negative query)', function () {
    var list = [
      {
        files: 'test/files1/**/*',
        base: 'test/files1'
      },
      {
        files: ['test/files2/**/*', '!**/z.um'],
        base: 'test/files2'
      }
    ]

    var options = {
      dir: '.',
      dest: 'target'
    }

    return resolveFiles(list, options).then(function (files) {
      files.should.eql(expectedList)
    })
  })

  it('single object', function () {
    var list = {
      files: 'test/files1/**/*',
      base: 'test/files1'
    }

    var options = {
      dir: '.',
      dest: 'target'
    }

    return resolveFiles(list, options).then(function (files) {
      files.should.eql(expectedList1)
    })
  })

  it('single object with array files list', function () {
    var list = {
      files: ['test/files1/**/*'],
      base: 'test/files1'
    }

    var options = {
      dir: '.',
      dest: 'target'
    }

    return resolveFiles(list, options).then(function (files) {
      files.should.eql(expectedList1)
    })
  })

  it('array of globs', function () {
    var list = ['test/files1/**/*', 'test/files2/**/*']

    var options = {
      dir: '.',
      dest: 'target'
    }

    return resolveFiles(list, options).then(function (files) {
      files.should.eql(expectedList3.concat(expectedList1))
    })
  })

  it('single glob', function () {
    var list = 'test/files1/**/*'

    var options = {
      dir: '.',
      dest: 'target'
    }

    return resolveFiles(list, options).then(function (files) {
      files.should.eql(expectedList1)
    })
  })
})
