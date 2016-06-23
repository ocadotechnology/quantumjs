var should = require('chai').should()

var quantum = require('..')
var File = quantum.File

describe('File', function () {
  it('should use the options to set up the properties', function () {
    var file = new File({
      src: 'src/content/a.um',
      resolved: 'a.um',
      base: 'src/content',
      dest: 'target/a.um',
      watch: true
    })

    file.src.should.equal('src/content/a.um')
    file.resolved.should.equal('a.um')
    file.base.should.equal('src/content')
    file.dest.should.equal('target/a.um')
    file.watch.should.equal(true)
  })

  describe('File::clone', function () {
    it('should clone', function () {
      var file = new File({
        src: 'src/content/a.um',
        resolved: 'a.um',
        base: 'src/content',
        dest: 'target/a.um',
        watch: true
      })

      file.clone().should.eql(new File({
        src: 'src/content/a.um',
        resolved: 'a.um',
        base: 'src/content',
        dest: 'target/a.um',
        watch: true
      }))
    })

    it('should change src', function () {
      var file = new File({
        src: 'src/content/a.um',
        resolved: 'a.um',
        base: 'src/content',
        dest: 'target/a.um',
        watch: true
      })

      file.clone({
        src: 'src/content/a.test.um'
      }).should.eql(new File({
        src: 'src/content/a.test.um',
        resolved: 'a.um',
        base: 'src/content',
        dest: 'target/a.um',
        watch: true
      }))
    })

    it('should change resolved', function () {
      var file = new File({
        src: 'src/content/a.um',
        resolved: 'a.um',
        base: 'src/content',
        dest: 'target/a.um',
        watch: true
      })

      file.clone({
        resolved: 'a.test.um'
      }).should.eql(new File({
        src: 'src/content/a.um',
        resolved: 'a.test.um',
        base: 'src/content',
        dest: 'target/a.um',
        watch: true
      }))
    })

    it('should change base', function () {
      var file = new File({
        src: 'src/content/a.um',
        resolved: 'a.um',
        base: 'src/content',
        dest: 'target/a.um',
        watch: true
      })

      file.clone({
        base: 'src'
      }).should.eql(new File({
        src: 'src/content/a.um',
        resolved: 'a.um',
        base: 'src',
        dest: 'target/a.um',
        watch: true
      }))
    })

    it('should change base', function () {
      var file = new File({
        src: 'src/content/a.um',
        resolved: 'a.um',
        base: 'src/content',
        dest: 'target/a.um',
        watch: true
      })

      file.clone({
        dest: 'target/a.test.um'
      }).should.eql(new File({
        src: 'src/content/a.um',
        resolved: 'a.um',
        base: 'src/content',
        dest: 'target/a.test.um',
        watch: true
      }))
    })

    it('should change base', function () {
      var file = new File({
        src: 'src/content/a.um',
        resolved: 'a.um',
        base: 'src/content',
        dest: 'target/a.um',
        watch: true
      })

      file.clone({
        watch: false
      }).should.eql(new File({
        src: 'src/content/a.um',
        resolved: 'a.um',
        base: 'src/content',
        dest: 'target/a.um',
        watch: false
      }))
    })
  })

  describe('File::withExtension', function () {
    it('should change the extension', function () {
      var file = new File({
        src: 'src/content/a.um',
        resolved: 'a.um',
        base: 'src/content',
        dest: 'target/a.um',
        watch: true
      })

      file.withExtension('.txt').should.eql(new File({
        src: 'src/content/a.um',
        resolved: 'a.um',
        base: 'src/content',
        dest: 'target/a.txt',
        watch: true
      }))
    })
  })
})
