'use strict'
require('chai').should()

const quantum = require('../')
const FileInfo = quantum.FileInfo

describe('FileInfo', () => {
  it('should use the options to set up the properties', () => {
    const file = new FileInfo({
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

  describe('FileInfo::clone', () => {
    it('should clone', () => {
      const file = new FileInfo({
        src: 'src/content/a.um',
        resolved: 'a.um',
        base: 'src/content',
        dest: 'target/a.um',
        watch: true
      })

      file.clone().should.eql(new FileInfo({
        src: 'src/content/a.um',
        resolved: 'a.um',
        base: 'src/content',
        dest: 'target/a.um',
        watch: true
      }))
    })

    it('should change src', () => {
      const file = new FileInfo({
        src: 'src/content/a.um',
        resolved: 'a.um',
        base: 'src/content',
        dest: 'target/a.um',
        watch: true
      })

      file.clone({
        src: 'src/content/a.test.um'
      }).should.eql(new FileInfo({
        src: 'src/content/a.test.um',
        resolved: 'a.um',
        base: 'src/content',
        dest: 'target/a.um',
        watch: true
      }))
    })

    it('should change resolved', () => {
      const file = new FileInfo({
        src: 'src/content/a.um',
        resolved: 'a.um',
        base: 'src/content',
        dest: 'target/a.um',
        watch: true
      })

      file.clone({
        resolved: 'a.test.um'
      }).should.eql(new FileInfo({
        src: 'src/content/a.um',
        resolved: 'a.test.um',
        base: 'src/content',
        dest: 'target/a.um',
        watch: true
      }))
    })

    it('should change base', () => {
      const file = new FileInfo({
        src: 'src/content/a.um',
        resolved: 'a.um',
        base: 'src/content',
        dest: 'target/a.um',
        watch: true
      })

      file.clone({
        base: 'src'
      }).should.eql(new FileInfo({
        src: 'src/content/a.um',
        resolved: 'a.um',
        base: 'src',
        dest: 'target/a.um',
        watch: true
      }))
    })

    it('should change base', () => {
      const file = new FileInfo({
        src: 'src/content/a.um',
        resolved: 'a.um',
        base: 'src/content',
        dest: 'target/a.um',
        destBase: 'target',
        watch: true
      })

      file.clone({
        destBase: 'target2'
      }).should.eql(new FileInfo({
        src: 'src/content/a.um',
        resolved: 'a.um',
        base: 'src/content',
        dest: 'target/a.um',
        destBase: 'target2',
        watch: true
      }))
    })

    it('should change dest', () => {
      const file = new FileInfo({
        src: 'src/content/a.um',
        resolved: 'a.um',
        base: 'src/content',
        dest: 'target/a.um',
        watch: true
      })

      file.clone({
        dest: 'target/a.test.um'
      }).should.eql(new FileInfo({
        src: 'src/content/a.um',
        resolved: 'a.um',
        base: 'src/content',
        dest: 'target/a.test.um',
        watch: true
      }))
    })

    it('should change watch', () => {
      const file = new FileInfo({
        src: 'src/content/a.um',
        resolved: 'a.um',
        base: 'src/content',
        dest: 'target/a.um',
        watch: true
      })

      file.clone({
        watch: false
      }).should.eql(new FileInfo({
        src: 'src/content/a.um',
        resolved: 'a.um',
        base: 'src/content',
        dest: 'target/a.um',
        watch: false
      }))
    })
  })

  describe('FileInfo::withExtension', () => {
    it('should change the extension', () => {
      const file = new FileInfo({
        src: 'src/content/a.um',
        resolved: 'a.um',
        base: 'src/content',
        dest: 'target/a.um',
        watch: true
      })

      file.withExtension('.txt').should.eql(new FileInfo({
        src: 'src/content/a.um',
        resolved: 'a.um',
        base: 'src/content',
        dest: 'target/a.txt',
        watch: true
      }))
    })
  })
})
